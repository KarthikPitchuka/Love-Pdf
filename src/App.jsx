import React, { useState } from 'react';
import Header from './components/Header';
import MergeTool from './pages/MergeTool';
import SplitTool from './pages/SplitTool';
import ProtectTool from './pages/ProtectTool';
import ConvertTool from './pages/ConvertTool';
import { Layers, Scissors, Lock, RefreshCcw, ArrowRight } from 'lucide-react';

function App() {
  const [activeTool, setActiveTool] = useState(null);

  if (activeTool === 'merge') return <MergeTool />;
  if (activeTool === 'split') return <SplitTool />;
  if (activeTool === 'protect') return <ProtectTool />;
  if (activeTool === 'convert') return <ConvertTool />;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-16 pb-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Every tool you need to work with PDFs
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            100% offline, private, and fast. Process your documents securely in your browser without uploading any files to a server.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Merge Card */}
          <button 
            onClick={() => setActiveTool('merge')}
            className="group bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all text-left flex flex-col h-full relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Merge PDF</h2>
              <p className="text-slate-600 mb-6 flex-1">
                Combine multiple PDFs into a single document with a simple drag-and-drop interface.
              </p>
              <div className="flex items-center text-brand-600 font-semibold mt-auto">
                Start Tool <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          {/* Split Card */}
          <button 
            onClick={() => setActiveTool('split')}
            className="group bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all text-left flex flex-col h-full relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Scissors className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Split PDF</h2>
              <p className="text-slate-600 mb-6 flex-1">
                Extract specific pages or page ranges from a large PDF document effortlessly.
              </p>
              <div className="flex items-center text-orange-600 font-semibold mt-auto">
                Start Tool <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          {/* Protect Card */}
          <button 
            onClick={() => setActiveTool('protect')}
            className="group bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-red-300 transition-all text-left flex flex-col h-full relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Protect PDF</h2>
              <p className="text-slate-600 mb-6 flex-1">
                Encrypt your PDF files with a password to prevent unauthorized viewing or editing.
              </p>
              <div className="flex items-center text-red-600 font-semibold mt-auto">
                Start Tool <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          {/* Convert Card */}
          <button 
            onClick={() => setActiveTool('convert')}
            className="group bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all text-left flex flex-col h-full relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <RefreshCcw className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Convert Files</h2>
              <p className="text-slate-600 mb-6 flex-1">
                Seamlessly convert PDFs to Images, Spreadsheets, and more right in your browser.
              </p>
              <div className="flex items-center text-indigo-600 font-semibold mt-auto">
                Start Tool <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
