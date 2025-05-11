import React, { useCallback, useState } from 'react';
import { processFile } from '../utils/fileProcessors';

function FileUploader({ setFiles, onFileProcessed, setLoading }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFilesProcessing = async (uploadedFiles) => {
    setLoading(true);
    for (const file of uploadedFiles) {
      const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const fileObj = {
        id: fileId,
        name: file.name,
        type: file.type
      };
      setFiles(prev => [...prev, fileObj]);
      
      try {
        const processedData = await processFile(file);
        onFileProcessed(fileId, processedData);
      } catch (error) {
        console.error("Error processing file:", error);
        // Handle error accordingly
      }
    }
    setLoading(false);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = [...e.dataTransfer.files];
    if (files.length > 0) {
      handleFilesProcessing(files);
    }
  }, [setFiles, onFileProcessed]);

  const handleFileInputChange = (e) => {
    const files = [...e.target.files];
    if (files.length > 0) {
      handleFilesProcessing(files);
    }
  };

  return (
    <div
      className={`file-upload-area ${isDragging ? 'active' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <svg 
        className="w-12 h-12 mb-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      <p className="mb-2 text-center">Drag & drop files here, or click to select files</p>
      <p className="text-xs text-gray-500 text-center">Supports images, text files, PDFs, Excel files</p>
      <input 
        type="file" 
        className="hidden" 
        id="fileInput" 
        multiple
        onChange={handleFileInputChange}
      />
      <label 
        htmlFor="fileInput" 
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
      >
        Select Files
      </label>
    </div>
  );
}

export default FileUploader;