import React, { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { 
  UploadCloud, FileText, Image as ImageIcon, Table, ArrowRight, CheckCircle, X, Loader2, File, Eye, Download, RotateCcw, Trash2, Lock
} from 'lucide-react';

const FORMAT_MAP = {
  'application/pdf': { type: 'pdf', icon: FileText, targets: ['Word (.docx)', 'Excel (.xlsx)', 'PowerPoint (.pptx)', 'JPG', 'PDF/A', 'Markdown (.md)'] },
  'application/msword': { type: 'document', icon: FileText, targets: ['PDF'] },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { type: 'document', icon: FileText, targets: ['PDF'] },
  'application/vnd.ms-excel': { type: 'spreadsheet', icon: Table, targets: ['PDF'] },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { type: 'spreadsheet', icon: Table, targets: ['PDF'] },
  'application/vnd.ms-powerpoint': { type: 'presentation', icon: FileText, targets: ['PDF'] },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { type: 'presentation', icon: FileText, targets: ['PDF'] },
  'image/jpeg': { type: 'image', icon: ImageIcon, targets: ['PDF'] },
  'image/png': { type: 'image', icon: ImageIcon, targets: ['PDF'] },
  'image/tiff': { type: 'image', icon: ImageIcon, targets: ['PDF'] },
  'image/svg+xml': { type: 'image', icon: ImageIcon, targets: ['PDF'] },
  'image/bmp': { type: 'image', icon: ImageIcon, targets: ['PDF'] },
  'image/heic': { type: 'image', icon: ImageIcon, targets: ['PDF'] },
  'image/webp': { type: 'image', icon: ImageIcon, targets: ['PDF'] },
  'image/x-adobe-dng': { type: 'image', icon: ImageIcon, targets: ['PDF'] },
  'text/html': { type: 'document', icon: FileText, targets: ['PDF'] },
};

const getFileTypeInfo = (file) => {
  if (!file) return null;
  const info = FORMAT_MAP[file.type];
  if (info) return info;
  const ext = file.name.split('.').pop().toLowerCase();
  const extMap = {
    'pdf': 'application/pdf', 'doc': 'application/msword', 'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel', 'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint', 'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'tiff': 'image/tiff', 'svg': 'image/svg+xml',
    'bmp': 'image/bmp', 'heic': 'image/heic', 'webp': 'image/webp', 'raw': 'image/x-adobe-dng', 'html': 'text/html'
  };
  const mappedType = extMap[ext];
  if (mappedType && FORMAT_MAP[mappedType]) return FORMAT_MAP[mappedType];
  return { type: 'unknown', icon: File, targets: [] };
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function DropZoneConverter({ onConvert, multiple = false }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [targetFormat, setTargetFormat] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  
  // Results will be an array of {name, url}
  const [results, setResults] = useState([]);
  const [previewFile, setPreviewFile] = useState(null); // URL for modal
  const [isZipping, setIsZipping] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  }, [multiple]);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) processFiles(e.target.files);
  };

  const processFiles = (files) => {
    if (!multiple && files.length > 1) {
      alert("Please upload only one file at a time.");
      return;
    }
    const selectedFile = files[0];
    setFile(selectedFile);
    
    const info = getFileTypeInfo(selectedFile);
    if (info && info.targets.length > 0) {
      setTargetFormat(info.targets[0]);
    } else {
      setTargetFormat('');
    }
    setResults([]);
  };

  const triggerFileInput = () => { if (fileInputRef.current) fileInputRef.current.click(); };
  const handleKeyDown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerFileInput(); } };

  const handleClear = (e) => {
    if(e) e.stopPropagation();
    results.forEach(r => URL.revokeObjectURL(r.url));
    setFile(null);
    setTargetFormat('');
    setResults([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = (e) => {
    if(e) e.stopPropagation();
    results.forEach(r => URL.revokeObjectURL(r.url));
    setResults([]); // Just go back to format selection for the same file
  };

  const startConversion = async (e) => {
    e.stopPropagation();
    if (!file || !targetFormat) return;
    
    setIsConverting(true);
    setResults([]);
    
    if (onConvert) {
      const res = await onConvert(file, targetFormat);
      if (Array.isArray(res)) setResults(res);
      else if (res) setResults([{ name: `converted-${file.name}`, url: res }]);
    }
    setIsConverting(false);
  };

  const downloadAllAsZip = async () => {
    if (results.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      for (const res of results) {
        const response = await fetch(res.url);
        const blob = await response.blob();
        zip.file(res.name, blob);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `Converted_Files.zip`;
      a.click();
      URL.revokeObjectURL(zipUrl);
    } catch (err) {
      console.error("Failed to generate zip", err);
    }
    setIsZipping(false);
  };

  const fileInfo = getFileTypeInfo(file);
  const IconComponent = fileInfo?.icon || File;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-5xl bg-white rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800">Preview</h3>
              <button onClick={() => setPreviewFile(null)} className="p-2 bg-white rounded-full text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm border border-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-slate-200 flex items-center justify-center min-h-[400px]">
              <iframe src={previewFile} className="w-full h-full min-h-[60vh] bg-white shadow-sm border border-slate-200 rounded-lg" title="Preview"></iframe>
            </div>
          </div>
        </div>
      )}

      {!file ? (
        <div 
          className={`relative rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-300 ease-in-out cursor-pointer overflow-hidden outline-none focus-visible:ring-4 focus-visible:ring-brand-500/50
            ${isDragging ? 'border-brand-500 bg-brand-50 scale-[1.02] shadow-xl shadow-brand-500/10' : 'border-slate-300 bg-white hover:border-brand-400 hover:bg-slate-50'}`}
          onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={triggerFileInput} onKeyDown={handleKeyDown} tabIndex={0} role="button" aria-label="Upload file area"
        >
          <input type="file" ref={fileInputRef} multiple={multiple} onChange={handleFileInput} className="hidden" tabIndex={-1} />
          <div className="flex flex-col items-center justify-center pointer-events-none">
            <div className={`p-5 rounded-full mb-6 transition-colors duration-300 ${isDragging ? 'bg-brand-100 text-brand-600 shadow-md shadow-brand-200/50' : 'bg-slate-100 text-slate-500'}`}>
              <UploadCloud className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{isDragging ? 'Drop file to upload' : 'Drag & drop file here'}</h3>
            <p className="text-slate-500 mb-6 text-lg">or click to browse from your device</p>
            <div className="px-8 py-3 bg-slate-900 text-white rounded-xl font-medium shadow-lg hover:bg-slate-800 transition-colors pointer-events-auto">Select File</div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden">
          {results.length === 0 ? (
            // PRE-CONVERSION VIEW
            <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6 flex-wrap lg:flex-nowrap">
              <div className="flex items-center gap-4 flex-1 w-full min-w-[200px] bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate" title={file.name}>{file.name}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">{formatBytes(file.size)}</p>
                </div>
              </div>

              {fileInfo && fileInfo.targets.length > 0 && !isConverting && (
                <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 justify-center">
                  <ArrowRight className="w-5 h-5 text-slate-400 hidden lg:block" />
                  
                  {/* Custom Dropdown */}
                  <div className="relative w-full lg:w-auto group z-20">
                    <div className="relative w-full lg:w-auto appearance-none bg-white border border-slate-300 text-slate-800 font-semibold py-3 pl-4 pr-10 rounded-xl cursor-pointer shadow-sm min-w-[180px] hover:border-brand-400 transition-colors flex items-center justify-between">
                      <span>to {targetFormat}</span>
                      <svg className="fill-current h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                    
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top overflow-hidden">
                      <div className="max-h-60 overflow-y-auto">
                        {fileInfo.targets.map(target => (
                          <div 
                            key={target} 
                            onClick={() => setTargetFormat(target)}
                            className={`px-4 py-3 cursor-pointer text-sm font-medium transition-colors hover:bg-brand-50 hover:text-brand-700
                              ${target === targetFormat ? 'bg-brand-50 text-brand-700' : 'text-slate-700'}`}
                          >
                            to {target}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 justify-end mt-2 lg:mt-0">
                <button
                  onClick={startConversion} disabled={isConverting || !targetFormat}
                  className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 min-w-[160px]
                    ${isConverting || !targetFormat ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed' : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/30 hover:-translate-y-0.5 hover:shadow-brand-500/40'}`}
                >
                  {isConverting ? <><Loader2 className="w-5 h-5 animate-spin" /> Converting...</> : 'Convert Offline'}
                </button>
                <button onClick={handleClear} disabled={isConverting} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0" title="Clear selection"><X className="w-6 h-6" /></button>
              </div>
            </div>
          ) : (
            // POST-CONVERSION VIEW
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-green-50 border border-green-200 rounded-2xl">
                <div className="flex items-center gap-3 text-green-800">
                  <CheckCircle className="w-8 h-8 text-green-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg">Conversion Successful</h4>
                    <p className="text-sm text-green-700 opacity-90">Your file was converted to {targetFormat} entirely offline.</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                  {results.length === 1 ? (
                    <>
                      <button onClick={() => setPreviewFile(results[0].url)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-green-300 text-green-700 font-semibold rounded-xl hover:bg-green-100 transition-colors shadow-sm">
                        <Eye className="w-4 h-4" /> Preview
                      </button>
                      <a href={results[0].url} download={results[0].name} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/30 transition-all">
                        <Download className="w-4 h-4" /> Download
                      </a>
                    </>
                  ) : (
                    <button onClick={downloadAllAsZip} disabled={isZipping} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/30 transition-all disabled:opacity-70">
                      {isZipping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download All (ZIP)
                    </button>
                  )}
                  
                  <div className="w-px h-8 bg-green-300 mx-1 hidden md:block"></div>
                  
                  <button onClick={handleReset} className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shadow-sm bg-white border border-slate-200" title="Convert another format">
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button onClick={handleClear} className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shadow-sm bg-white border border-slate-200" title="Start over">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Multi-file batch view (Thumbnails) */}
              {results.length > 1 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {results.map((res, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-3 group">
                      <div className="w-full aspect-[4/3] bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center relative">
                        <span className="text-slate-400 font-bold text-xl uppercase">{targetFormat}</span>
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button onClick={() => setPreviewFile(res.url)} className="p-1.5 bg-white text-slate-900 rounded-lg hover:scale-110 transition-transform"><Eye className="w-4 h-4" /></button>
                          <a href={res.url} download={res.name} className="p-1.5 bg-brand-500 text-white rounded-lg hover:scale-110 transition-transform"><Download className="w-4 h-4" /></a>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 truncate text-center" title={res.name}>{res.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
            <Lock className="w-3.5 h-3.5 text-brand-500" /> Processed 100% locally. No files were uploaded to any server.
          </div>
          
          {fileInfo && fileInfo.targets.length === 0 && (
            <div className="mt-4 p-3 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium border border-amber-200 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Unsupported file format for conversion.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
