import React from 'react';
import { X, Maximize2, Download, ExternalLink } from 'lucide-react';
import DocumentQnA from './DocumentQnA';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function DocumentPreviewDrawer({ document, isOpen, onClose }) {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-sm">
      <div className="w-[800px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 bg-slate-50">
          <div className="flex items-center gap-3 truncate">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center font-bold text-xs shrink-0">
              PDF
            </div>
            <h2 className="font-semibold text-slate-800 truncate">{document.name}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="p-1.5 text-slate-500 hover:bg-slate-200 rounded transition-colors"><Maximize2 size={18} /></button>
            <button className="p-1.5 text-slate-500 hover:bg-slate-200 rounded transition-colors"><Download size={18} /></button>
            <button className="p-1.5 text-slate-500 hover:bg-slate-200 rounded transition-colors"><ExternalLink size={18} /></button>
            <div className="w-px h-4 bg-slate-300 mx-1"></div>
            <button onClick={onClose} className="p-1.5 text-slate-500 hover:bg-red-100 hover:text-red-600 rounded transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Document Preview Area */}
          <div className="flex-1 bg-slate-200 p-4 flex items-center justify-center overflow-y-auto">
            {/* Placeholder for actual PDF/Document viewer */}
            <div className="w-full max-w-[500px] aspect-[1/1.4] bg-white shadow-md border border-slate-300 p-8 flex flex-col relative">
              <div className="w-full h-4 bg-slate-100 mb-4 rounded"></div>
              <div className="w-3/4 h-4 bg-slate-100 mb-8 rounded"></div>
              <div className="w-full h-2 bg-slate-100 mb-2 rounded"></div>
              <div className="w-full h-2 bg-slate-100 mb-2 rounded"></div>
              <div className="w-5/6 h-2 bg-slate-100 mb-2 rounded"></div>
              
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-400 font-medium">
                Document Preview (Page 1)
              </div>
            </div>
          </div>

          {/* Right Panel (Q&A and Details) */}
          <div className="w-[350px] border-l border-slate-200 flex flex-col bg-white shrink-0">
            <Tabs defaultValue="qna" className="flex-1 flex flex-col">
              <div className="px-4 pt-3 border-b border-slate-200">
                <TabsList className="w-full grid grid-cols-2 bg-slate-100">
                  <TabsTrigger value="qna">Q&A Thread</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="qna" className="flex-1 mt-0 overflow-hidden flex flex-col">
                <DocumentQnA documentId={document.id} />
              </TabsContent>
              
              <TabsContent value="details" className="flex-1 mt-0 p-4 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Uploaded By</h4>
                  <p className="text-sm font-medium text-slate-800">Michael Chang</p>
                  <p className="text-xs text-slate-500">Oct 24, 2026, 10:15 AM</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Version</h4>
                  <p className="text-sm font-medium text-slate-800">v2.0 (Current)</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">File Size</h4>
                  <p className="text-sm font-medium text-slate-800">2.4 MB</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
        </div>
      </div>
    </div>
  );
}
