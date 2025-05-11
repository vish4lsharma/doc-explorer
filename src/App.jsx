import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import FileUploader from './components/FileUploader';
import QueryInput from './components/QueryInput';
import ResultsDisplay from './components/ResultsDisplay';

function App() {
  const [files, setFiles] = useState([]);
  const [processedData, setProcessedData] = useState({});
  const [queryResults, setQueryResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileProcessed = (fileId, data) => {
    setProcessedData(prev => ({
      ...prev,
      [fileId]: data
    }));
  };

  const handleFileRemove = (fileId) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    setProcessedData(prev => {
      const newData = { ...prev };
      delete newData[fileId];
      return newData;
    });
  };

  return (
    <div className="app-container">
      <Sidebar files={files} onFileRemove={handleFileRemove} />
      <div className="main-content">
        <h1 className="text-2xl font-bold mb-4">Document Explorer</h1>
        <FileUploader 
          setFiles={setFiles} 
          onFileProcessed={handleFileProcessed}
          setLoading={setLoading}
        />
        <QueryInput 
          processedData={processedData}
          setQueryResults={setQueryResults}
          loading={loading}
        />
        <ResultsDisplay results={queryResults} />
      </div>
    </div>
  );
}

export default App;