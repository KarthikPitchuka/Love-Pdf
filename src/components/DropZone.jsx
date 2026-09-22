import React, { useCallback, useState } from 'react';
import { UploadCloud, FileType } from 'lucide-react';

export default function DropZone({ onFilesSelected, multiple = true, accept = "application/pdf" }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf'));
    }
  }, [onFilesSelected]);

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div 
      className={`relative w-full max-w-2xl mx-auto rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
        ${isDragging ? 'border-brand-500 bg-brand-50 scale-105 shadow-xl shadow-brand-500/10' : 'border-slate-300 bg-white hover:border-brand-400 hover:bg-slate-50'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        multiple={multiple} 
        accept={accept}
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        title="Upload PDF files"
      />
      
      <div className="flex flex-col items-center justify-center pointer-events-none">
        <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
          <UploadCloud className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          {isDragging ? 'Drop PDFs here' : 'Drag & drop PDFs here'}
        </h3>
        <p className="text-slate-500 mb-6">or click to browse from your device</p>
        <button className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors pointer-events-auto">
          Select Files
        </button>
      </div>
    </div>
  );
}
