import React, { useState } from 'react';
import Header from '../components/Header';
import DropZone from '../components/DropZone';
import { Scissors, Loader2, Download } from 'lucide-react';

export default function SplitTool() {
  const [file, setFile] = useState(null);
  const [pageRange, setPageRange] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const handleFilesSelected = (files) => {
    setFile(files[0]); // Only one file for split
    setDownloadUrl(null);
  };

  const handleSplit = () => {
    if (!file || !pageRange.trim()) return alert('Please upload a file and enter a page range.');
    
    // Parse range like "1,3,5" or "1-3" (simplified parsing for now)
    const indices = [];
    const parts = pageRange.split(',');
    parts.forEach(part => {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        for(let i = start; i <= end; i++) indices.push(i - 1); // 0-indexed
      } else {
        indices.push(Number(part) - 1);
      }
    });

    setIsProcessing(true);
    const worker = new Worker(new URL('../workers/pdf.worker.js', import.meta.url), { type: 'module' });
    
    file.arrayBuffer().then(buffer => {
      worker.postMessage({
        action: 'SPLIT',
        id: 'split-1',
        payload: { fileBuffer: buffer, pageIndices: indices }
      }, [buffer]);
    });

    worker.onmessage = (e) => {
      const { status, data, error } = e.data;
      if (status === 'success') {
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
      } else {
        alert('Error splitting PDF: ' + error);
      }
      setIsProcessing(false);
      worker.terminate();
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 flex items-center justify-center gap-3">
            <Scissors className="w-10 h-10 text-orange-500" />
            Split PDF
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Extract pages from your PDF file. Fast and 100% offline.
          </p>
        </div>

        {downloadUrl ? (
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">PDF Split!</h3>
            <a 
              href={downloadUrl} 
              download="split.pdf"
              className="block w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/30 transition-all mb-4 mt-6"
            >
              Download PDF
            </a>
            <button onClick={() => { setFile(null); setDownloadUrl(null); }} className="text-slate-500 hover:text-slate-700 font-medium">Split another file</button>
          </div>
        ) : !file ? (
          <DropZone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
            <div className="font-semibold text-xl mb-2">{file.name}</div>
            <div className="mb-6 text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            
            <div className="mb-6 text-left">
              <label className="block text-sm font-medium text-slate-700 mb-2">Pages to Extract (e.g., 1-3,5,7)</label>
              <input 
                type="text" 
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="1-5, 8, 11-13"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>

            <button 
              onClick={handleSplit}
              disabled={isProcessing || !pageRange.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 transition-all disabled:bg-slate-400"
            >
              {isProcessing && <Loader2 className="w-5 h-5 animate-spin" />}
              Split PDF
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
