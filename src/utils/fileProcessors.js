import * as pdfjs from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';
import { createWorker } from 'tesseract.js';

// Initialize PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export async function processFile(file) {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  // Text files
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return await processTextFile(file);
  }
  
  // CSV files
  if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
    return await processCsvFile(file);
  }
  
  // Excel files
  if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      fileType === 'application/vnd.ms-excel' ||
      fileName.endsWith('.xlsx') || 
      fileName.endsWith('.xls')) {
    return await processExcelFile(file);
  }
  
  // PDF files
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return await processPdfFile(file);
  }
  
  // Image files
  if (fileType.startsWith('image/') || 
      ['jpg', 'jpeg', 'png', 'gif', 'bmp'].some(ext => fileName.endsWith(`.${ext}`))) {
    return await processImageFile(file);
  }
  
  throw new Error(`Unsupported file type: ${fileType}`);
}

async function processTextFile(file) {
  const text = await file.text();
  return {
    type: 'text',
    content: text,
    lines: text.split('\n')
  };
}

async function processCsvFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        resolve({
          type: 'csv',
          data: results.data,
          headers: results.meta.fields
        });
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

async function processExcelFile(file) {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  
  const result = {
    type: 'excel',
    sheets: {}
  };
  
  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const sheetData = XLSX.utils.sheet_to_json(worksheet);
    result.sheets[sheetName] = sheetData;
  });
  
  return result;
}

async function processPdfFile(file) {
  const data = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data }).promise;
  
  const numPages = pdf.numPages;
  const pages = [];
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map(item => item.str).join(' ');
    pages.push(text);
  }
  
  return {
    type: 'pdf',
    pages,
    pageCount: numPages,
    allText: pages.join(' ')
  };
}

async function processImageFile(file) {
  const worker = await createWorker();
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  
  const imageUrl = URL.createObjectURL(file);
  const { data } = await worker.recognize(imageUrl);
  await worker.terminate();
  
  return {
    type: 'image',
    text: data.text,
    lines: data.lines
  };
}