import React from 'react';

function Sidebar({ files, onFileRemove }) {
  return (
    <div className="sidebar">
      <h2 className="text-lg font-semibold mb-4">Files</h2>
      {files.length === 0 ? (
        <p className="text-gray-500 text-sm">No files uploaded yet</p>
      ) : (
        <ul className="space-y-2">
          {files.map(file => (
            <li key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <span className="text-sm truncate max-w-[150px]">{file.name}</span>
              </div>
              <button 
                onClick={() => onFileRemove(file.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Sidebar;