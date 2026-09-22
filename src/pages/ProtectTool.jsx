import React, { useState } from 'react';
import Header from '../components/Header';
import DropZone from '../components/DropZone';
import { Lock, Loader2, Download, Eye, EyeOff } from 'lucide-react';

export default function ProtectTool() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const handleFilesSelected = (files) => {
    setFile(files[0]);
    setDownloadUrl(null);
  };

  const handleProtect = () => {
    if (!file || !password) return alert('Please upload a file and enter a password.');
    
    setIsProcessing(true);
    const worker = new Worker(new URL('../workers/pdf.worker.js', import.meta.url), { type: 'module' });
    
    file.arrayBuffer().then(buffer => {
      worker.postMessage({
        action: 'PROTECT',
        id: 'protect-1',
        payload: { fileBuffer: buffer, password }
      }, [buffer]);
    });

    worker.onmessage = (e) => {
      const { status, data, error } = e.data;
      if (status === 'success') {
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
      } else {
        alert('Error protecting PDF: ' + error);
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
            <Lock className="w-10 h-10 text-red-500" />
            Protect PDF
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Encrypt your PDF with a password to prevent unauthorized access.
          </p>
        </div>

        {downloadUrl ? (
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">PDF Protected!</h3>
            <a 
              href={downloadUrl} 
              download="protected.pdf"
              className="block w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 transition-all mb-4 mt-6"
            >
              Download PDF
            </a>
            <button onClick={() => { setFile(null); setDownloadUrl(null); setPassword(''); }} className="text-slate-500 hover:text-slate-700 font-medium">Protect another file</button>
          </div>
        ) : !file ? (
          <DropZone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
            <div className="font-semibold text-xl mb-2">{file.name}</div>
            <div className="mb-6 text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            
            <div className="mb-6 text-left relative">
              <label className="block text-sm font-medium text-slate-700 mb-2">Set Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Type a strong password"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none pr-12"
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              onClick={handleProtect}
              disabled={isProcessing || !password}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 transition-all disabled:bg-slate-400"
            >
              {isProcessing && <Loader2 className="w-5 h-5 animate-spin" />}
              Protect PDF
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
