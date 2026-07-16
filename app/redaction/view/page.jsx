"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { FaSpinner, FaFileAlt } from "react-icons/fa";

import WordViewer from "@/components/redaction/viewers/WordViewer";
import ExcelViewer from "@/components/redaction/viewers/ExcelViewer";
import PowerPointViewer from "@/components/redaction/viewers/PowerPointViewer";
import TextViewer from "@/components/redaction/viewers/TextViewer";

const getFileType = (filePath) => {
  if (!filePath) return "unknown";
  const ext = filePath.split(".").pop().toLowerCase().trim();
  if (ext === "doc" || ext === "docx") return "word";
  if (ext === "xls" || ext === "xlsx" || ext === "csv") return ext;
  if (ext === "ppt")  return "ppt";
  if (ext === "pptx") return "pptx";
  if (ext === "txt")  return "text";
  if (ext === "pdf") return "pdf";
  return "unknown";
};

function ViewOnlyContent() {
  const searchParams = useSearchParams();
  const docId = searchParams.get("id");

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fileType, setFileType] = useState("unknown");
  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    if (!docId) {
      setError("No document specified.");
      setLoading(false);
      return;
    }

    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = localStorage.getItem("vdr_session");
        if (!raw) throw new Error("Session not found");
        const session = JSON.parse(raw);

        // 1. Fetch document metadata
        const { data: docData, error: docError } = await supabase
          .from("documents")
          .select("*")
          .eq("id", docId)
          .eq("company_id", session.company_id)
          .single();

        if (docError) throw docError;
        if (!docData) throw new Error("Document not found.");
        setDoc(docData);

        // 2. Check if a redacted file exists -> prefer it
        const { data: redactedDoc } = await supabase
          .from("redacted_documents")
          .select("redacted_path")
          .eq("document_id", docId)
          .maybeSingle();

        let resolvedUrl;
        if (redactedDoc?.redacted_path) {
          const { data: rUrlData, error: rUrlError } = await supabase.storage
            .from("redacted-files")
            .createSignedUrl(redactedDoc.redacted_path, 3600);
          if (!rUrlError && rUrlData) {
            resolvedUrl = rUrlData.signedUrl;
          }
        }

        if (!resolvedUrl) {
          const storagePath = docData.file_path;
          const { data: urlData, error: urlError } = await supabase.storage
            .from("original-files")
            .createSignedUrl(storagePath, 3600);
          if (urlError) throw new Error("Failed to get original file url");
          resolvedUrl = urlData.signedUrl;
        }

        const detectedType = getFileType(docData.file_path || docData.name || "");
        setFileType(detectedType);
        setFileUrl(resolvedUrl);

      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load document.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [docId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#FAFBFD] flex items-center justify-center">
        <FaSpinner className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#FAFBFD] flex flex-col items-center justify-center">
        <p className="text-rose-600 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#FAFBFD] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
        <h1 className="text-lg font-bold text-slate-800 truncate" title={doc?.name}>
          <FaFileAlt className="inline mr-2 text-slate-400" />
          {doc?.name} <span className="ml-3 text-[11px] text-slate-500 font-bold uppercase px-2 py-1 bg-slate-100 rounded-md border border-slate-200">Read Only View</span>
        </h1>
        <button 
          onClick={() => window.close()} 
          className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          Close Tab
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 w-full overflow-auto flex items-start justify-center p-6 bg-slate-50">
        <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-xl shadow-sm min-h-[500px] flex overflow-hidden">
          
          {fileType === "word" && fileUrl && (
            <WordViewer
              url={fileUrl}
              scale={1.5}
              searchQuery=""
              onNumPages={() => {}}
              tool="pointer"
              selections={[]}
              onAddSelection={() => {}}
              onRemoveSelection={() => {}}
              onUpdateSelection={() => {}}
            />
          )}

          {(fileType === "xls" || fileType === "xlsx" || fileType === "csv") && fileUrl && (
            <ExcelViewer
              url={fileUrl}
              currentPage={0}
              scale={1.5}
              searchQuery=""
              onNumPages={() => {}}
              tool="pointer"
              selections={[]}
              onAddSelection={() => {}}
              onRemoveSelection={() => {}}
              onUpdateSelection={() => {}}
            />
          )}

          {(fileType === "ppt" || fileType === "pptx") && fileUrl && (
            <PowerPointViewer
              url={fileUrl}
              fileExt={fileType}
              currentPage={0}
              scale={1.5}
              searchQuery=""
              onNumPages={() => {}}
              tool="pointer"
              selections={[]}
              onAddSelection={() => {}}
              onRemoveSelection={() => {}}
              onUpdateSelection={() => {}}
            />
          )}

          {fileType === "text" && fileUrl && (
            <TextViewer
              url={fileUrl}
              scale={1.5}
              searchQuery=""
              onNumPages={() => {}}
              tool="pointer"
              selections={[]}
              onAddSelection={() => {}}
              onRemoveSelection={() => {}}
              onUpdateSelection={() => {}}
            />
          )}

          {fileType === "pdf" && fileUrl && (
            <div className="flex flex-col items-center justify-center p-12 text-center w-full">
               <p className="text-slate-500 font-medium">PDF preview is handled natively. Please use the Preview button in Documents.</p>
            </div>
          )}

          {fileType === "unknown" && (
            <div className="flex flex-col items-center justify-center p-12 text-center w-full text-slate-500">
               <p className="font-medium">Preview not available for this file type.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function StandaloneViewPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 z-[100] bg-[#FAFBFD] flex items-center justify-center"><FaSpinner className="w-8 h-8 text-slate-400 animate-spin" /></div>}>
      <ViewOnlyContent />
    </Suspense>
  );
}
