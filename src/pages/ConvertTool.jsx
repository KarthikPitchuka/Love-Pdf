import React, { useState } from 'react';
import Header from '../components/Header';
import DropZoneConverter from '../components/DropZoneConverter';
import { RefreshCcw } from 'lucide-react';

export default function ConvertTool() {
  const handleConvert = async (file, targetFormat) => {
    console.log(`Simulating offline conversion of ${file.name} to ${targetFormat}...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create mock blobs to enable the download buttons.
    // If targetFormat implies multiple pages (like PDF to JPG), we'll mock 2 pages.
    const isMultiPage = ['JPG', 'PNG'].includes(targetFormat) && file.type === 'application/pdf';
    const numFiles = isMultiPage ? 2 : 1;
    const results = [];
    
    for (let i = 0; i < numFiles; i++) {
      const blob = new Blob([file], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      results.push({
        name: isMultiPage ? `page-${i+1}.${targetFormat.toLowerCase()}` : `converted-${file.name}.${targetFormat.toLowerCase()}`,
        url: url
      });
    }
    return results;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 flex items-center justify-center gap-3">
            <RefreshCcw className="w-10 h-10 text-indigo-500" />
            Convert Files
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Convert PDFs to Images, Spreadsheets to CSV, and more. 100% offline.
          </p>
        </div>

        <DropZoneConverter onConvert={handleConvert} multiple={false} />
      </main>
    </div>
  );
}
