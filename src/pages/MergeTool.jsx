import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import DropZone from '../components/DropZone';
import PagePreviewGrid from '../components/PagePreviewGrid';
import { Layers, Loader2, Download } from 'lucide-react';

export default function MergeTool() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const handleFilesSelected = (newFiles) => {
    setFiles([...files, ...newFiles]);
    setDownloadUrl(null);
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setDownloadUrl(null);
  };

  const handleMerge = () => {
    if (files.length < 2) return alert('Please select at least 2 PDF files to merge.');
    setIsProcessing(true);

    const worker = new Worker(new URL('../workers/pdf.worker.js', import.meta.url), { type: 'module' });
    
    // Convert files to array buffers
    Promise.all(files.map(file => file.arrayBuffer())).then(buffers => {
      worker.postMessage({
        action: 'MERGE',
        id: 'merge-1',
        payload: { files: buffers }
      }, buffers);
    });

    worker.onmessage = (e) => {
      const { status, data, error } = e.data;
      if (status === 'success') {
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
      } else {
        alert('Error merging PDFs: ' + error);
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
            <Layers className="w-10 h-10 text-brand-500" />
            Merge PDF
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Combine PDFs in the order you want with the easiest PDF merger available. 100% offline and secure.
          </p>
        </div>

        {downloadUrl ? (
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">PDF Merged!</h3>
            <p className="text-slate-500 mb-6">Your files have been successfully merged.</p>
            <a 
              href={downloadUrl} 
              download="merged.pdf"
              className="block w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/30 transition-all"
            >
              Download Merged PDF
            </a>
            <button 
              onClick={() => { setFiles([]); setDownloadUrl(null); }}
              className="mt-4 text-slate-500 hover:text-slate-700 font-medium"
            >
              Merge more files
            </button>
          </div>
        ) : (
          <>
            <DropZone onFilesSelected={handleFilesSelected} multiple={true} />
            
            {files.length > 0 && (
              <>
                <PagePreviewGrid files={files} onRemoveFile={handleRemoveFile} />
                
                <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] z-40">
                  <div className="container mx-auto flex items-center justify-between">
                    <div className="text-slate-600 font-medium">
                      {files.length} file{files.length > 1 ? 's' : ''} selected
                    </div>
                    <button 
                      onClick={handleMerge}
                      disabled={isProcessing || files.length < 2}
                      className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-lg text-white shadow-lg transition-all
                        ${isProcessing || files.length < 2 ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand-500 hover:bg-brand-600 shadow-brand-500/30 hover:-translate-y-0.5'}`}
                    >
                      {isProcessing && <Loader2 className="w-5 h-5 animate-spin" />}
                      Merge PDFs
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
