import React from 'react';

function ResultsDisplay({ results }) {
  if (!results) return null;

  if (results.error) {
    return (
      <div className="results-container bg-red-50 border border-red-200 p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-2 text-red-600">Error</h2>
        <p className="text-red-500">{results.error}</p>
      </div>
    );
  }

  if (results.data && results.data.length === 0) {
    return (
      <div className="results-container bg-white border border-gray-200 p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Results</h2>
        <p className="text-gray-500">No results found for your query.</p>
      </div>
    );
  }

  const renderCell = (value) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">-</span>;
    }

    if (typeof value === 'boolean') {
      return value ? (
        <span className="text-green-600">✓</span>
      ) : (
        <span className="text-red-500">✗</span>
      );
    }

    if (typeof value === 'object') {
      try {
        const str = JSON.stringify(value);
        return (
          <div className="max-w-[200px] truncate" title={str}>
            {str}
          </div>
        );
      } catch {
        return <span className="text-gray-400">[Object]</span>;
      }
    }

    if (typeof value === 'string' && value.length > 50) {
      return (
        <div className="max-w-[200px] truncate" title={value}>
          {value}
        </div>
      );
    }

    return String(value);
  };

  return (
    <div className="results-container bg-white border border-gray-200 p-4 rounded-md">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-800">Results</h2>
        {Array.isArray(results.data) && (
          <span className="text-sm text-gray-500">
            {results.data.length} {results.data.length === 1 ? 'record' : 'records'}
          </span>
        )}
      </div>

      {results.message && (
        <p className="text-green-600 text-sm mb-2">{results.message}</p>
      )}

      {Array.isArray(results.data) && results.data.length > 0 ? (
        <div className="overflow-x-auto rounded-md border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(results.data[0]).map((key) => (
                  <th
                    key={key}
                    className="px-4 py-2 text-left font-medium text-gray-600 uppercase tracking-wider"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.data.map((item, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-gray-50">
                  {Object.values(item).map((value, colIdx) => (
                    <td key={colIdx} className="px-4 py-2 text-gray-700 whitespace-nowrap">
                      {renderCell(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 p-3 rounded">
          <pre className="overflow-x-auto text-sm text-gray-600">
            {JSON.stringify(results.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default ResultsDisplay;
