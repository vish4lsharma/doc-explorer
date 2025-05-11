export function executeQuery(query, processedData) {
  // Ensure we have data to query
  if (Object.keys(processedData).length === 0) {
    return {
      error: "No data available. Please upload files first."
    };
  }

  // Convert query to lowercase for case-insensitive matching
  const lowerQuery = query.toLowerCase();
  
  // Check if query is for specific file types
  if (lowerQuery.includes('excel') || lowerQuery.includes('xlsx') || lowerQuery.includes('xls')) {
    return processExcelQuery(lowerQuery, processedData);
  }
  
  if (lowerQuery.includes('csv')) {
    return processCsvQuery(lowerQuery, processedData);
  }
  
  if (lowerQuery.includes('pdf')) {
    return processPdfQuery(lowerQuery, processedData);
  }
  
  if (lowerQuery.includes('image') || lowerQuery.includes('text from image')) {
    return processImageQuery(lowerQuery, processedData);
  }
  
  if (lowerQuery.includes('text file')) {
    return processTextFileQuery(lowerQuery, processedData);
  }
  
  // Generic keyword search across all data
  return processGenericQuery(lowerQuery, processedData);
}

function processExcelQuery(query, processedData) {
  const excelFiles = Object.values(processedData).filter(data => data.type === 'excel');
  
  if (excelFiles.length === 0) {
    return {
      error: "No Excel files found in uploaded data."
    };
  }
  
  // Extract common patterns from query
  const totalPattern = /total|sum/i;
  const averagePattern = /average|avg/i;
  const countPattern = /count|how many/i;
  const columnPattern = /column[s]?\s+(\w+)/i;
  const wherePattern = /where\s+(.+)/i;
  
  let results = [];
  
  for (const excelFile of excelFiles) {
    for (const [sheetName, sheetData] of Object.entries(excelFile.sheets)) {
      if (sheetData.length === 0) continue;
      
      // Apply column filter if specified
      let columnMatch = query.match(columnPattern);
      let filteredData = sheetData;
      
      if (columnMatch) {
        const columnName = columnMatch[1];
        filteredData = sheetData.filter(row => 
          Object.keys(row).some(key => key.toLowerCase().includes(columnName.toLowerCase()))
        );
      }
      
      // Apply where condition if specified
      let whereMatch = query.match(wherePattern);
      if (whereMatch) {
        const condition = whereMatch[1].toLowerCase();
        filteredData = filteredData.filter(row => {
          return Object.entries(row).some(([key, value]) => {
            if (typeof value === 'string') {
              return value.toLowerCase().includes(condition);
            }
            if (typeof value === 'number') {
              // Try to extract numeric conditions
              const numericCondition = condition.match(/[><=]+\s*(\d+)/);
              if (numericCondition) {
                const operator = condition.match(/([><=]+)/)[1];
                const compareValue = parseInt(numericCondition[1], 10);
                
                switch (operator) {
                  case '>': return value > compareValue;
                  case '<': return value < compareValue;
                  case '>=': return value >= compareValue;
                  case '<=': return value <= compareValue;
                  case '=': return value === compareValue;
                  default: return false;
                }
              }
            }
            return false;
          });
        });
      }
      
      // Apply aggregation functions
      if (totalPattern.test(query)) {
        // Find numeric columns
        const numericColumns = Object.keys(sheetData[0]).filter(key => 
          typeof sheetData[0][key] === 'number'
        );
        
        for (const column of numericColumns) {
          const sum = filteredData.reduce((total, row) => total + (row[column] || 0), 0);
          results.push({
            sheet: sheetName,
            column,
            total: sum
          });
        }
      } else if (averagePattern.test(query)) {
        const numericColumns = Object.keys(sheetData[0]).filter(key => 
          typeof sheetData[0][key] === 'number'
        );
        
        for (const column of numericColumns) {
          const sum = filteredData.reduce((total, row) => total + (row[column] || 0), 0);
          const average = sum / filteredData.length;
          results.push({
            sheet: sheetName,
            column,
            average
          });
        }
      } else if (countPattern.test(query)) {
        results.push({
          sheet: sheetName,
          count: filteredData.length
        });
      } else {
        // Default action: return the filtered data
        results = [...results, ...filteredData.map(row => ({ sheet: sheetName, ...row }))];
      }
    }
  }
  
  return {
    data: results,
    message: `Found ${results.length} results`
  };
}

function processCsvQuery(query, processedData) {
  const csvFiles = Object.values(processedData).filter(data => data.type === 'csv');
  
  if (csvFiles.length === 0) {
    return {
      error: "No CSV files found in uploaded data."
    };
  }
  
  // Similar logic as Excel query but for CSV data
  const totalPattern = /total|sum/i;
  const averagePattern = /average|avg/i;
  const countPattern = /count|how many/i;
  const columnPattern = /column[s]?\s+(\w+)/i;
  const wherePattern = /where\s+(.+)/i;
  
  let results = [];
  
  for (const csvFile of csvFiles) {
    const csvData = csvFile.data;
    
    if (csvData.length === 0) continue;
    
    // Apply column filter if specified
    let columnMatch = query.match(columnPattern);
    let filteredData = csvData;
    
    if (columnMatch) {
      const columnName = columnMatch[1];
      filteredData = csvData.filter(row => 
        Object.keys(row).some(key => key.toLowerCase().includes(columnName.toLowerCase()))
      );
    }
    
    // Apply where condition if specified
    let whereMatch = query.match(wherePattern);
    if (whereMatch) {
      const condition = whereMatch[1].toLowerCase();
      filteredData = filteredData.filter(row => {
        return Object.entries(row).some(([key, value]) => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(condition);
          }
          if (typeof value === 'number') {
            // Try to extract numeric conditions
            const numericCondition = condition.match(/[><=]+\s*(\d+)/);
            if (numericCondition) {
              const operator = condition.match(/([><=]+)/)[1];
              const compareValue = parseInt(numericCondition[1], 10);
              
              switch (operator) {
                case '>': return value > compareValue;
                case '<': return value < compareValue;
                case '>=': return value >= compareValue;
                case '<=': return value <= compareValue;
                case '=': return value === compareValue;
                default: return false;
              }
            }
          }
          return false;
        });
      });
    }
    
    // Apply aggregation functions
    if (totalPattern.test(query)) {
      // Find numeric columns
      const numericColumns = csvFile.headers.filter(header => 
        typeof csvData[0][header] === 'number'
      );
      
      for (const column of numericColumns) {
        const sum = filteredData.reduce((total, row) => total + (row[column] || 0), 0);
        results.push({
          column,
          total: sum
        });
      }
    } else if (averagePattern.test(query)) {
      const numericColumns = csvFile.headers.filter(header => 
        typeof csvData[0][header] === 'number'
      );
      
      for (const column of numericColumns) {
        const sum = filteredData.reduce((total, row) => total + (row[column] || 0), 0);
        const average = sum / filteredData.length;
        results.push({
          column,
          average
        });
      }
    } else if (countPattern.test(query)) {
      results.push({
        count: filteredData.length
      });
    } else {
      // Default action: return the filtered data
      results = [...results, ...filteredData];
    }
  }
  
  return {
    data: results,
    message: `Found ${results.length} results`
  };
}

function processPdfQuery(query, processedData) {
  const pdfFiles = Object.values(processedData).filter(data => data.type === 'pdf');
  
  if (pdfFiles.length === 0) {
    return {
      error: "No PDF files found in uploaded data."
    };
  }
  
  // Extract search terms from query
  const searchTermPattern = /search\s+for\s+"([^"]+)"|search\s+for\s+(\w+)|find\s+"([^"]+)"|find\s+(\w+)/i;
  const pagePattern = /page\s+(\d+)/i;
  
  let searchTermMatch = query.match(searchTermPattern);
  let searchTerm = searchTermMatch ? 
    (searchTermMatch[1] || searchTermMatch[2] || searchTermMatch[3] || searchTermMatch[4]) : 
    '';
  
  let results = [];
  
  for (const pdfFile of pdfFiles) {
    // If specific page is requested
    let pageMatch = query.match(pagePattern);
    if (pageMatch) {
      const pageNumber = parseInt(pageMatch[1], 10);
      if (pageNumber > 0 && pageNumber <= pdfFile.pageCount) {
        const pageContent = pdfFile.pages[pageNumber - 1]; // Convert to 0-indexed
        
        if (searchTerm && pageContent.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({
            pageNumber,
            content: pageContent
          });
        } else if (!searchTerm) {
          results.push({
            pageNumber,
            content: pageContent
          });
        }
      }
    } 
    // Search across all pages
    else if (searchTerm) {
      pdfFile.pages.forEach((pageContent, index) => {
        if (pageContent.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({
            pageNumber: index + 1, // Convert to 1-indexed
            content: pageContent
          });
        }
      });
    } 
    // Default to general info about the PDF
    else {
      results.push({
        pageCount: pdfFile.pageCount,
        summary: `PDF document with ${pdfFile.pageCount} pages`
      });
    }
  }
  
  return {
    data: results,
    message: `Found ${results.length} results`
  };
}

function processImageQuery(query, processedData) {
  const imageFiles = Object.values(processedData).filter(data => data.type === 'image');
  
  if (imageFiles.length === 0) {
    return {
      error: "No image files with text found in uploaded data."
    };
  }
  
  // Extract search terms from query
  const searchTermPattern = /search\s+for\s+"([^"]+)"|search\s+for\s+(\w+)|find\s+"([^"]+)"|find\s+(\w+)/i;
  
  let searchTermMatch = query.match(searchTermPattern);
  let searchTerm = searchTermMatch ? 
    (searchTermMatch[1] || searchTermMatch[2] || searchTermMatch[3] || searchTermMatch[4]) : 
    '';
  
  let results = [];
  
  for (const imageFile of imageFiles) {
    if (searchTerm) {
      if (imageFile.text.toLowerCase().includes(searchTerm.toLowerCase())) {
        // Find specific lines containing the search term
        const matchingLines = imageFile.lines
          .filter(line => line.text.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(line => line.text);
        
        results.push({
          textContent: imageFile.text,
          matchingLines
        });
      }
    } else {
      // Return all extracted text
      results.push({
        textContent: imageFile.text
      });
    }
  }
  
  return {
    data: results,
    message: `Found ${results.length} results`
  };
}

function processTextFileQuery(query, processedData) {
  const textFiles = Object.values(processedData).filter(data => data.type === 'text');
  
  if (textFiles.length === 0) {
    return {
      error: "No text files found in uploaded data."
    };
  }
  
  // Extract search terms from query
  const searchTermPattern = /search\s+for\s+"([^"]+)"|search\s+for\s+(\w+)|find\s+"([^"]+)"|find\s+(\w+)/i;
  const linePattern = /line\s+(\d+)/i;
  
  let searchTermMatch = query.match(searchTermPattern);
  let searchTerm = searchTermMatch ? 
    (searchTermMatch[1] || searchTermMatch[2] || searchTermMatch[3] || searchTermMatch[4]) : 
    '';
  
  let results = [];
  
  for (const textFile of textFiles) {
    // If specific line is requested
    let lineMatch = query.match(linePattern);
    if (lineMatch) {
      const lineNumber = parseInt(lineMatch[1], 10);
      if (lineNumber > 0 && lineNumber <= textFile.lines.length) {
        const lineContent = textFile.lines[lineNumber - 1]; // Convert to 0-indexed
        
        results.push({
          lineNumber,
          content: lineContent
        });
      }
    } 
    // Search across all lines
    else if (searchTerm) {
      textFile.lines.forEach((lineContent, index) => {
        if (lineContent.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({
            lineNumber: index + 1, // Convert to 1-indexed
            content: lineContent
          });
        }
      });
    } 
    // Default to full text content
    else {
      results.push({
        lineCount: textFile.lines.length,
        content: textFile.content
      });
    }
  }
  
  return {
    data: results,
    message: `Found ${results.length} results`
  };
}

function processGenericQuery(query, processedData) {
  // Generic search across all data types
  const searchTerms = query.split(/\s+/).filter(term => term.length > 2);
  
  if (searchTerms.length === 0) {
    return {
      error: "Please provide a more specific query."
    };
  }
  
  let results = [];
  
  // Helper function to check if content matches search terms
  const matchesSearchTerms = (content) => {
    if (typeof content !== 'string') return false;
    const lowerContent = content.toLowerCase();
    return searchTerms.some(term => lowerContent.includes(term.toLowerCase()));
  };
  
  // Search through all data types
  for (const [fileId, data] of Object.entries(processedData)) {
    switch (data.type) {
      case 'text':
        if (matchesSearchTerms(data.content)) {
          // Find specific matching lines
          const matchingLines = data.lines
            .map((line, index) => ({ lineNumber: index + 1, content: line }))
            .filter(line => matchesSearchTerms(line.content));
          
          results.push({
            fileId,
            type: 'text',
            matchingLines
          });
        }
        break;
        
      case 'csv':
        const csvMatches = data.data.filter(row => 
          Object.values(row).some(value => matchesSearchTerms(String(value)))
        );
        
        if (csvMatches.length > 0) {
          results.push({
            fileId,
            type: 'csv',
            matches: csvMatches
          });
        }
        break;
        
      case 'excel':
        let excelMatches = [];
        
        for (const [sheetName, sheetData] of Object.entries(data.sheets)) {
          const matches = sheetData.filter(row => 
            Object.values(row).some(value => matchesSearchTerms(String(value)))
          );
          
          if (matches.length > 0) {
            excelMatches.push({
              sheet: sheetName,
              matches
            });
          }
        }
        
        if (excelMatches.length > 0) {
          results.push({
            fileId,
            type: 'excel',
            sheets: excelMatches
          });
        }
        break;
        
      case 'pdf':
        const pdfMatches = data.pages
          .map((page, index) => ({ pageNumber: index + 1, content: page }))
          .filter(page => matchesSearchTerms(page.content));
          
        if (pdfMatches.length > 0) {
          results.push({
            fileId,
            type: 'pdf',
            pages: pdfMatches
          });
        }
        break;
        
      case 'image':
        if (matchesSearchTerms(data.text)) {
          results.push({
            fileId,
            type: 'image',
            text: data.text
          });
        }
        break;
    }
  }
  
  if (results.length === 0) {
    return {
      data: [],
      message: "No matches found for your query."
    };
  }
  
  return {
    data: results,
    message: `Found matches in ${results.length} files.`
  };
}