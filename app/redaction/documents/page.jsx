"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { FaTimes, FaLock, FaCheck } from "react-icons/fa";

export default function RedactionDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Configuration Drawer State
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [visibilityMode, setVisibilityMode] = useState("show"); // 'show' or 'hide'
  const [inputValue, setInputValue] = useState("");
  const [pageRanges, setPageRanges] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const raw = localStorage.getItem('vdr_session');
        if (!raw) return;
        const session = JSON.parse(raw);

        const { data: docsData, error } = await supabase
          .from("documents")
          .select("*")
          .eq("company_id", session.company_id)
          .eq("uploaded_by", session.id)
          .eq("is_deleted", false);

        if (error) throw error;
        setDocuments(docsData || []);
      } catch (err) {
        console.error("Error fetching predefined documents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const openConfigDrawer = (doc) => {
    setSelectedDoc(doc);
    // In a real app, you would load existing redaction config from the doc here
    setPageRanges([]);
    setVisibilityMode("show");
    setIsDrawerOpen(true);
    setSaveSuccess(false);
  };

  const closeConfigDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedDoc(null), 300); // Wait for transition
  };

  const handleAddRange = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = inputValue.trim().replace(/,$/, '');
      if (val) {
        // Basic validation for numbers and hyphens (e.g., "1", "1-3")
        if (/^\d+(-\d+)?$/.test(val)) {
          if (!pageRanges.includes(val)) {
            setPageRanges([...pageRanges, val]);
          }
        }
        setInputValue("");
      }
    }
  };

  const removeRange = (rangeToRemove) => {
    setPageRanges(pageRanges.filter(r => r !== rangeToRemove));
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      // Simulate saving to database
      // e.g. await supabase.from('documents').update({ redaction_rules: { mode: visibilityMode, ranges: pageRanges } }).eq('id', selectedDoc.id);
      await new Promise(r => setTimeout(r, 1000));
      
      setSaveSuccess(true);
      setTimeout(() => {
        closeConfigDrawer();
      }, 1500);
    } catch (error) {
      console.error("Failed to save configuration", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative flex w-full h-full bg-[#FAFBFD] overflow-hidden">
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col p-6 transition-all duration-300 ${isDrawerOpen ? 'mr-96' : ''} overflow-y-auto`}>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Predefined Documents</h1>
        
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center text-slate-500 py-10">
            No documents found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {documents.map((doc) => (
              <div 
                key={doc.id} 
                onClick={() => openConfigDrawer(doc)}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <div className="overflow-hidden flex-1">
                    <h3 className="font-semibold text-slate-800 truncate" title={doc.name}>{doc.name}</h3>
                    <p className="text-xs text-slate-500 truncate">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-bold text-blue-600">Configure Redaction →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-over Config Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-96 bg-white border-l border-slate-200 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedDoc && (
          <>
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Redaction Setup</h2>
                <p className="text-xs text-slate-500 truncate w-64" title={selectedDoc.name}>{selectedDoc.name}</p>
              </div>
              <button 
                onClick={closeConfigDrawer}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
              
              {/* Document Preview Placeholder */}
              <div className="w-full h-40 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                <FaLock className="w-8 h-8 mb-2 text-slate-300" />
                <span className="text-sm font-medium">Secure Redaction Preview</span>
              </div>

              {/* Mode Toggle */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Visibility Mode</label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setVisibilityMode('show')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                      visibilityMode === 'show' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Show Specific Pages
                  </button>
                  <button
                    onClick={() => setVisibilityMode('hide')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                      visibilityMode === 'hide' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Hide Specific Pages
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {visibilityMode === 'show' 
                    ? "Only the pages you specify below will be visible. All other pages will be redacted."
                    : "The pages you specify below will be redacted. All other pages will be visible."}
                </p>
              </div>

              {/* Smart Page Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Page Selection</label>
                
                {/* Tag Container */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {pageRanges.map((range) => (
                    <div 
                      key={range} 
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                        visibilityMode === 'show' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      Pages {range}
                      <button 
                        onClick={() => removeRange(range)}
                        className={`hover:opacity-70 ${visibilityMode === 'show' ? 'text-blue-500' : 'text-rose-500'}`}
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {pageRanges.length === 0 && (
                    <span className="text-sm text-slate-400 italic">No pages specified yet.</span>
                  )}
                </div>

                {/* Input Field */}
                <div className="relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleAddRange}
                    placeholder="e.g. 1-3 or 5 (Press Enter)"
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                    Press Enter ↵
                  </div>
                </div>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-slate-200 bg-white">
              <button 
                onClick={handleSaveConfig}
                disabled={isSaving || saveSuccess}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all ${
                  saveSuccess ? 'bg-green-500' : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : saveSuccess ? (
                  <>
                    <FaCheck /> Saved Successfully
                  </>
                ) : (
                  "Save Configuration"
                )}
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Drawer Overlay (mobile only or to click outside to close) */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 z-40 lg:hidden"
          onClick={closeConfigDrawer}
        />
      )}
    </div>
  );
}
