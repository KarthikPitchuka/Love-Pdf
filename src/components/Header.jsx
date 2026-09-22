import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function Header() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-slate-200 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/30">
            PDF
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
            ClientPDF
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isOnline ? 'bg-brand-50 text-brand-600 border border-brand-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
