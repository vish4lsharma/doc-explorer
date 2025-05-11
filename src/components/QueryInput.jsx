import React, { useState } from 'react';
import { executeQuery } from '../utils/queryProcessor';

function QueryInput({ processedData, setQueryResults, loading }) {
  const [query, setQuery] = useState('');

  const handleQuerySubmit = (e) => {
    e.preventDefault();
    if (query.trim() === '') return;
    
    const results = executeQuery(query, processedData);
    setQueryResults(results);
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">Query Data</h2>
      <form onSubmit={handleQuerySubmit} className="flex space-x-2">
        <input
          type="text"
          className="query-input"
          placeholder="Enter your query (e.g., 'find all emails' or 'total sales from 2023')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading || Object.keys(processedData).length === 0}
        />
        <button
          type="submit"
          className="query-button"
          disabled={loading || query.trim() === '' || Object.keys(processedData).length === 0}
        >
          {loading ? 'Processing...' : 'Execute'}
        </button>
      </form>
      {Object.keys(processedData).length === 0 && (
        <p className="text-sm text-gray-500 mt-2">Upload files to enable querying</p>
      )}
    </div>
  );
}

export default QueryInput;