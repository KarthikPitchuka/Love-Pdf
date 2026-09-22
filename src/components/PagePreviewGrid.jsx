import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { X, GripVertical } from 'lucide-react';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

export default function PagePreviewGrid({ files, onRemoveFile }) {
  const [thumbnails, setThumbnails] = useState([]);
  const canvasRefs = useRef({});

  useEffect(() => {
    let isActive = true;
    const objectUrls = [];
    const loadThumbnails = async () => {
      const newThumbnails = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = URL.createObjectURL(file);
        objectUrls.push(url);

        try {
          const loadingTask = pdfjsLib.getDocument(url);
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1); // Render first page only as thumbnail

          const viewport = page.getViewport({ scale: 1 });
          newThumbnails.push({ id: file.name + '-' + i, file, page, viewport, index: i });
        } catch (error) {
          console.error("Error loading PDF thumbnail:", error);
        }
      }

      if (isActive) {
        setThumbnails(newThumbnails);
      }
    };

    if (files.length > 0) {
      loadThumbnails();
    } else {
      setThumbnails([]);
    }

    return () => {
      isActive = false;
      objectUrls.forEach(url => URL.revokeObjectURL(url));
      // Cleanup contexts
      Object.values(canvasRefs.current).forEach(canvas => {
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      });
    };
  }, [files]);

  useEffect(() => {
    thumbnails.forEach(({ id, page, viewport }) => {
      const canvas = canvasRefs.current[id];
      if (canvas && page) {
        const context = canvas.getContext('2d');
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        page.render(renderContext);
      }
    });
  }, [thumbnails]);

  if (files.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
      {thumbnails.map(({ id, file, viewport, index }) => (
        <div key={id} className="relative group bg-white p-2 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded-md shadow-sm cursor-grab">
            <GripVertical className="w-4 h-4 text-slate-500" />
          </div>
          <button 
            onClick={() => onRemoveFile(index)}
            className="absolute -top-3 -right-3 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-full aspect-[1/1.4] bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center mb-2">
            <canvas 
              ref={el => canvasRefs.current[id] = el}
              width={viewport.width}
              height={viewport.height}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-sm font-medium text-slate-700 truncate px-1" title={file.name}>
            {file.name}
          </div>
        </div>
      ))}
    </div>
  );
}
