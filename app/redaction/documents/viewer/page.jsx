"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { FaLock, FaChevronLeft, FaChevronRight, FaSpinner } from "react-icons/fa";

let pdfjsLib = null;

const loadPdfJs = async () => {
  if (typeof window !== "undefined" && !pdfjsLib) {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf");
    pdfjsLib = pdfjs;
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  }
  return pdfjsLib;
};

/**
 * Expands an array of range strings (e.g. ["1-5", "8", "10-12"])
 * into a Set of individual page numbers. Handles multiple ranges
 * and de-duplicates automatically via Set semantics.
 */
const expandPageRanges = (ranges = []) => {
  const pages = new Set();

  ranges.forEach((r) => {
    if (!r) return;
    const str = String(r).trim();

    if (str.includes("-")) {
      const [startRaw, endRaw] = str.split("-");
      const start = parseInt(startRaw, 10);
      const end = parseInt(endRaw, 10);
      if (!Number.isNaN(start) && !Number.isNaN(end)) {
        const lo = Math.min(start, end);
        const hi = Math.max(start, end);
        for (let p = lo; p <= hi; p++) pages.add(p);
      }
    } else {
      const n = parseInt(str, 10);
      if (!Number.isNaN(n)) pages.add(n);
    }
  });

  return pages;
};

function DocumentViewerContent() {
  const searchParams = useSearchParams();
  const docId = searchParams.get("id");

  const canvasRef = useRef(null);
  const pdfRef = useRef(null);

  const [doc, setDoc] = useState(null);
  const [redaction, setRedaction] = useState(null); // { visibility_mode, page_ranges }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);

  /**
   * Redaction logic, derived once per redaction-config load.
   * - visibility_mode "hide": the listed pages are redacted, everything else is visible.
   * - visibility_mode "show": only the listed pages are visible, everything else is redacted.
   * A missing/empty config defaults to fully visible.
   */
  const isPageRedacted = useCallback(
    (pageNum) => {
      if (!redaction) return false;
      const { visibility_mode, page_ranges } = redaction;
      const specifiedPages = expandPageRanges(page_ranges);

      if (specifiedPages.size === 0) return false;

      if (visibility_mode === "hide") {
        return specifiedPages.has(pageNum);
      }
      // "show" mode
      return !specifiedPages.has(pageNum);
    },
    [redaction]
  );viw

  // Load document metadata, redaction rules, and the PDF binary
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

        // 2. Fetch redaction rules for this document
        const { data: redactionData, error: redactionError } = await supabase
          .from("document_redactions")
          .select("visibility_mode, page_ranges")
          .eq("document_id", docId)
          .maybeSingle();

        if (redactionError) throw redactionError;

        setRedaction(
          redactionData || { visibility_mode: "show", page_ranges: [] }
        );

        // 3. Resolve a signed URL from the `original-file` bucket.
        //    Files live at original-file/users/{user_id}/{file}.
        //    If file_path already includes the "users/" prefix, use it as-is.
        const storagePath = docData.file_path?.startsWith("users/")
          ? docData.file_path
          : `users/${docData.uploaded_by}/${docData.file_path}`;

        console.log("========== VIEWER DEBUG ==========");
console.log("Bucket:", "original-files");
console.log("Storage Path:", storagePath);
console.log("Document Name:", docData.name);
console.log("Document Record:", docData);

const { data: urlData, error: urlError } = await supabase.storage
  .from("original-files")
  .createSignedUrl(storagePath, 3600);

console.log("Signed URL:", urlData);
console.log("URL Error:", urlError);

if (urlError) throw urlError;

        // 4. Load the PDF via pdf.js (binary is fetched lazily, page by page)
        const pdfjs = await loadPdfJs();
        if (!pdfjs) throw new Error("PDF.js failed to load");

        const pdf = await pdfjs.getDocument(urlData.signedUrl).promise;
        pdfRef.current = pdf;

        setNumPages(docData.total_pages || pdf.numPages);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error loading document viewer:", err);
        setError(err.message || "Failed to load document.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [docId]);

  // Render only the current page. Redacted pages never touch pdf.js's
  // render pipeline, so redaction never depends on a client-side
  // "hide the pixels after rendering" step.
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfRef.current || !currentPage) return;
      if (isPageRedacted(currentPage)) return;

      setPageLoading(true);
      try {
        const page = await pdfRef.current.getPage(currentPage);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
      } catch (err) {
        console.error("Error rendering page:", err);
      } finally {
        setPageLoading(false);
      }
    };

    renderPage();
  }, [currentPage, isPageRedacted]);

  const goToPage = (n) => {
    if (n < 1 || n > numPages) return;
    setCurrentPage(n);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full py-24">
        <FaSpinner className="w-6 h-6 text-brand animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full py-24 text-center">
        <p className="text-rose-600 font-semibold">{error}</p>
      </div>
    );
  }

  const pageIsRedacted = isPageRedacted(currentPage);

  return (
    <div className="flex flex-col items-center w-full h-full bg-[#FAFBFD] p-6">
      {/* Header / Pagination */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-4">
        <h1
          className="text-lg font-bold text-slate-800 truncate"
          title={doc?.name}
        >
          {doc?.name}
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 rounded-lg border border-slate-300 text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition-colors"
          >
            <FaChevronLeft />
          </button>
          <span className="text-sm font-medium text-slate-600">
            Page {currentPage} of {numPages || "?"}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= numPages}
            className="p-2 rounded-lg border border-slate-300 text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition-colors"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="relative w-full max-w-3xl flex-1 flex items-center justify-center bg-white border border-slate-200 rounded-xl shadow-sm overflow-auto p-4 min-h-[500px]">
        {pageIsRedacted ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
            <FaLock className="w-10 h-10" />
            <span className="text-base font-semibold text-slate-500">
              This page is redacted
            </span>
          </div>
        ) : (
          <>
            {pageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                <FaSpinner className="w-5 h-5 text-brand animate-spin" />
              </div>
            )}
            <canvas ref={canvasRef} className="max-w-full h-auto shadow-sm" />
          </>
        )}
      </div>
    </div>
  );
}

export default function DocumentViewerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full w-full py-24">
          <FaSpinner className="w-6 h-6 text-brand animate-spin" />
        </div>
      }
    >
      <DocumentViewerContent />
    </Suspense>
  );
}