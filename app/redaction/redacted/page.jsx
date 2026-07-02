"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { FaFilePdf, FaDownload, FaTrash } from "react-icons/fa";

export default function RedactedFilesPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('vdr_session');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    setSession(parsed);

    const fetchFiles = async () => {
      setLoading(true);
      try {
        const folderPath = parsed.company_id ? `${parsed.company_id}` : '';
        const { data, error } = await supabase
          .storage
          .from('restricted-files')
          .list(folderPath, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (error) throw error;
        // The .list API might return an empty `.emptyFolderPlaceholder` file, we filter it out.
        setFiles(data?.filter(f => f.name !== '.emptyFolderPlaceholder') || []);
      } catch (err) {
        console.error("Error fetching redacted files:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const handleDownload = async (file) => {
    try {
      const path = session.company_id ? `${session.company_id}/${file.name}` : file.name;
      const { data, error } = await supabase.storage.from('restricted-files').download(path);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Download failed: " + err.message);
    }
  };

  const handleDelete = async (file) => {
    if (!confirm(`Are you sure you want to delete ${file.name}?`)) return;
    try {
      const path = session.company_id ? `${session.company_id}/${file.name}` : file.name;
      const { error } = await supabase.storage.from('restricted-files').remove([path]);
      if (error) throw error;
      setFiles(files.filter(f => f.name !== file.name));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const formatBytes = (bytes) => {
      if (!bytes || bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex w-full h-full bg-[#FAFBFD] p-6 flex-col overflow-y-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Redacted Files</h1>
      
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-[var(--brand)] rounded-full animate-spin" />
        </div>
      ) : files.length === 0 ? (
        <div className="text-center text-slate-500 py-10 bg-white rounded-xl border border-slate-200 shadow-sm">
          No redacted files found in the bucket.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {files.map((file, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col hover:border-[var(--brand)] hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
                    <FaFilePdf className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <h3 className="font-semibold text-slate-800 truncate" title={file.name}>{file.name}</h3>
                    <p className="text-xs text-slate-500 truncate">
                      {formatBytes(file.metadata?.size || 0)} • {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-3 border-t border-slate-100 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleDownload(file)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <FaDownload /> Download
                </button>
                <button 
                  onClick={() => handleDelete(file)}
                  className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
