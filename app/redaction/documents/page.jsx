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
          .eq("is_deleted", false)
          .order("created_at", { ascending: false });

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

const openConfigDrawer = async (doc) => {
  setSelectedDoc(doc);
  setIsDrawerOpen(true);
  setSaveSuccess(false);
  setInputValue("");

  const { data, error } = await supabase
    .from("document_redactions")
    .select("*")
    .eq("document_id", doc.id)
    .maybeSingle();

  if (error) {
    console.error(error);
  }

  if (data) {
    setVisibilityMode(data.visibility_mode);
    setPageRanges(data.page_ranges || []);
  } else {
    setVisibilityMode("show");
    setPageRanges([]);
  }
};

  const closeConfigDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedDoc(null), 300); // Wait for transition
  };
const isValidRange = (value) => {
  if (!/^\d+(-\d+)?$/.test(value)) return false;

  if (value.includes("-")) {
    const [start, end] = value.split("-").map(Number);

    if (start > end) return false;
  }

  return true;
};

const handleAddRange = (e) => {
  if (e.key === "Enter" || e.key === ",") {
    e.preventDefault();

    const val = inputValue.trim().replace(/,$/, "");

    if (val) {
      if (isValidRange(val)) {
        if (!pageRanges.includes(val)) {
          setPageRanges((prev) => [...prev, val]);
        }
      } else {
        alert("Please enter a valid page range (e.g. 1, 2-5)");
      }

      setInputValue("");
    }
  }
};

  const removeRange = (rangeToRemove) => {
    setPageRanges(pageRanges.filter(r => r !== rangeToRemove));
  };

const handleSaveConfig = async () => {
  if (!selectedDoc) return;

  setIsSaving(true);

  try {
    const raw = localStorage.getItem("vdr_session");
    if (!raw) throw new Error("Session not found");

    const session = JSON.parse(raw);

    // Include current input even if Enter wasn't pressed
    let finalRanges = [...pageRanges];

    const val = inputValue.trim().replace(/,$/, "");

    if (
      val &&
      /^\d+(-\d+)?$/.test(val) &&
      !finalRanges.includes(val)
    ) {
      finalRanges.push(val);
    }

    const { error } = await supabase
      .from("document_redactions")
      .upsert(
        {
          document_id: selectedDoc.id,
          visibility_mode: visibilityMode,
          page_ranges: finalRanges,
          created_by: session.id,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "document_id",
        }
      );

    if (error) throw error;

    // Update UI immediately
    setPageRanges(finalRanges);
    setInputValue("");

    setSaveSuccess(true);

    setTimeout(() => {
      closeConfigDrawer();
    }, 1500);
  } catch (error) {
    console.error("Failed to save configuration:", error);
    alert("Failed to save configuration.");
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
            <div className="w-8 h-8 border-4 border-slate-200 border-t-brand rounded-full animate-spin" />
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
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col hover:border-brand hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-soft text-brand flex items-center justify-center flex-shrink-0">
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
                  <span className="text-xs font-bold text-brand">Configure Redaction →</span>
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
                      visibilityMode === 'show' ? 'bg-white text-brand shadow-sm' : 'text-slate-500 hover:text-slate-700'
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
                        visibilityMode === 'show' ? 'bg-brand-50 text-brand-dark' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      Pages {range}
                      <button 
                        onClick={() => removeRange(range)}
                        className={`hover:opacity-70 ${visibilityMode === 'show' ? 'text-brand' : 'text-rose-500'}`}
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
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
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
                  saveSuccess ? 'bg-green-500' : 'bg-brand hover:bg-brand-dark shadow-lg shadow-[var(--brand)]/20'
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
          className="fixed inset-0 bg-brand/20 z-40 lg:hidden"
          onClick={closeConfigDrawer}
        />
      )}
    </div>
  );
}

















// "use client";

// import React, { useState, useEffect } from "react";
// import { supabase } from "@/utils/supabase/client";
// import { FaTimes, FaLock, FaCheck, FaEye } from "react-icons/fa";
// import Link from "next/link";
// let pdfjsLib = null;

// const getFileType = (doc) => {
//   if (!doc?.mime_type) return "FILE";

//   const mime = doc.mime_type.toLowerCase();

//   if (mime.includes("pdf")) return "PDF";
//   if (mime.includes("word")) return "DOCX";
//   if (mime.includes("excel") || mime.includes("spreadsheet")) return "XLSX";
//   if (mime.includes("image")) return "IMAGE";
//   if (mime.includes("text")) return "TXT";

//   return "FILE";
// };

// const loadPdfJs = async () => {
//   if (typeof window !== "undefined" && !pdfjsLib) {
//     const pdfjs = await import("pdfjs-dist/legacy/build/pdf");
//     pdfjsLib = pdfjs;
//     // Set worker URL
//     pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
//   }
//   return pdfjsLib;
// };
// export default function RedactionDocumentsPage() {
//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Configuration Drawer State
//   const [selectedDoc, setSelectedDoc] = useState(null);
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const [visibilityMode, setVisibilityMode] = useState("show");
//   const [inputValue, setInputValue] = useState("");
//   const [pageRanges, setPageRanges] = useState([]);
//   const [isSaving, setIsSaving] = useState(false);
//   const [saveSuccess, setSaveSuccess] = useState(false);

//   // Preview State
//   const [previewLoading, setPreviewLoading] = useState(false);
//   const [previewImage, setPreviewImage] = useState(null);
//   const [previewPdf, setPreviewPdf] = useState(null);

//   useEffect(() => {
//     const fetchDocuments = async () => {
//       setLoading(true);
//       try {
//         const raw = localStorage.getItem("vdr_session");
//         if (!raw) return;
//         const session = JSON.parse(raw);

//         const { data: docsData, error } = await supabase
//           .from("documents")
//           .select("*")
//           .eq("company_id", session.company_id)
//           .eq("uploaded_by", session.id)
//           .eq("is_deleted", false);

//         if (error) throw error;
//         setDocuments(docsData || []);
//       } catch (err) {
//         console.error("Error fetching predefined documents:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDocuments();
//   }, []);

//   const openConfigDrawer = async (doc) => {
//     setSelectedDoc(doc);
//     setIsDrawerOpen(true);
//     setSaveSuccess(false);
//     setInputValue("");
//     setPreviewImage(null);
//     setPreviewPdf(null);

//     const { data, error } = await supabase
//       .from("document_redactions")
//       .select("*")
//       .eq("document_id", doc.id)
//       .maybeSingle();

//     if (error) {
//       console.error(error);
//     }

//     if (data) {
//       setVisibilityMode(data.visibility_mode);
//       setPageRanges(data.page_ranges || []);
//     } else {
//       setVisibilityMode("show");
//       setPageRanges([]);
//     }

//     // Load preview if PDF
//     if (doc.mime_type === "application/pdf") {
//       await loadPreview(doc);
//     }
//   };

//   const closeConfigDrawer = () => {
//     setIsDrawerOpen(false);
//     setTimeout(() => setSelectedDoc(null), 300);
//   };

//   // Load PDF preview (first page)
//      const loadPreview = async (doc) => {
//     setPreviewLoading(true);
//     try {
//       const raw = localStorage.getItem("vdr_session");
//       if (!raw) throw new Error("Session not found");
//       const session = JSON.parse(raw);

//       // Load PDF.js with proper SSR handling
//       const pdfjs = await loadPdfJs();  // ✅ ADD THIS
//       if (!pdfjs) throw new Error("PDF.js failed to load");  // ✅ ADD THIS

//       // Get signed URL
//       const { data: urlData, error: urlError } = await supabase.storage
//         .from("documents")
//         .createSignedUrl(doc.file_path, 3600);

//       if (urlError) throw urlError;

//       // Load PDF
//       const pdf = await pdfjs.getDocument(urlData.signedUrl).promise; 
//       setPreviewPdf(pdf);

//       // Render first page
//       const page = await pdf.getPage(1);
//       const scale = 1.5;
//       const viewport = page.getViewport({ scale });

//       const canvas = document.createElement("canvas");
//       const context = canvas.getContext("2d");
//       canvas.width = viewport.width;
//       canvas.height = viewport.height;

//       await page.render({ canvasContext: context, viewport }).promise;
//       setPreviewImage(canvas.toDataURL("image/png"));
//     } catch (err) {
//       console.error("Error loading preview:", err);
//     } finally {
//       setPreviewLoading(false);
//     }
//   };

//   const isValidRange = (value) => {
//     if (!/^\d+(-\d+)?$/.test(value)) return false;

//     if (value.includes("-")) {
//       const [start, end] = value.split("-").map(Number);
//       if (start > end) return false;
//     }

//     return true;
//   };

//   const handleAddRange = (e) => {
//     if (e.key === "Enter" || e.key === ",") {
//       e.preventDefault();

//       const val = inputValue.trim().replace(/,$/, "");

//       if (val) {
//         if (isValidRange(val)) {
//           if (!pageRanges.includes(val)) {
//             setPageRanges((prev) => [...prev, val]);
//           }
//         } else {
//           alert("Please enter a valid page range (e.g. 1, 2-5)");
//         }

//         setInputValue("");
//       }
//     }
//   };

//   const removeRange = (rangeToRemove) => {
//     setPageRanges(pageRanges.filter((r) => r !== rangeToRemove));
//   };

//   const handleSaveConfig = async () => {
//     if (!selectedDoc) return;

//     setIsSaving(true);

//     try {
//       const raw = localStorage.getItem("vdr_session");
//       if (!raw) throw new Error("Session not found");

//       const session = JSON.parse(raw);

//       let finalRanges = [...pageRanges];

//       const val = inputValue.trim().replace(/,$/, "");

//       if (val && /^\d+(-\d+)?$/.test(val) && !finalRanges.includes(val)) {
//         finalRanges.push(val);
//       }

//       const { error } = await supabase
//         .from("document_redactions")
//         .upsert(
//           {
//             document_id: selectedDoc.id,
//             visibility_mode: visibilityMode,
//             page_ranges: finalRanges,
//             created_by: session.id,
//             updated_at: new Date().toISOString(),
//           },
//           {
//             onConflict: "document_id",
//           }
//         );

//       if (error) throw error;

//       setPageRanges(finalRanges);
//       setInputValue("");

//       setSaveSuccess(true);

//       setTimeout(() => {
//         closeConfigDrawer();
//       }, 1500);
//     } catch (error) {
//       console.error("Failed to save configuration:", error);
//       alert("Failed to save configuration.");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <div className="relative flex w-full h-full bg-[#FAFBFD] overflow-hidden">
//       {/* Main Content Area */}
//       <div
//         className={`flex-1 flex flex-col p-6 transition-all duration-300 ${
//           isDrawerOpen ? "mr-96" : ""
//         } overflow-y-auto`}
//       >
//         <h1 className="text-2xl font-bold text-slate-800 mb-6">
//           Predefined Documents
//         </h1>

//         {loading ? (
//           <div className="flex items-center justify-center h-48">
//             <div className="w-8 h-8 border-4 border-slate-200 border-t-brand rounded-full animate-spin" />
//           </div>
//         ) : documents.length === 0 ? (
//           <div className="text-center text-slate-500 py-10">
//             No documents found.
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//             {documents.map((doc) => (
//               <div
//                 key={doc.id}
//                 onClick={() => openConfigDrawer(doc)}
//                 className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col hover:border-brand-400 hover:shadow-md transition-all cursor-pointer group"
//               >
//                 <div className="flex items-center gap-3 mb-3">
//                   <div className="w-10 h-10 rounded-lg bg-brand-soft text-brand flex items-center justify-center flex-shrink-0">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       width="20"
//                       height="20"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2.2"
//                     >
//                       <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
//                       <polyline points="14 2 14 8 20 8"></polyline>
//                       <line x1="16" y1="13" x2="8" y2="13"></line>
//                       <line x1="16" y1="17" x2="8" y2="17"></line>
//                       <polyline points="10 9 9 9 8 9"></polyline>
//                     </svg>
//                   </div>
//                   <div className="overflow-hidden flex-1">
//                     <h3
//                       className="font-semibold text-slate-800 truncate"
//                       title={doc.name}
//                     >
//                       {doc.name}
//                     </h3>
//                     <p className="text-xs text-slate-500 truncate">
//                       {new Date(doc.created_at).toLocaleDateString()}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
//                   <span className="text-xs font-bold text-brand">
//                     Configure Redaction →
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Slide-over Config Drawer */}
//       <div
//         className={`fixed inset-y-0 right-0 w-96 bg-white border-l border-slate-200 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
//           isDrawerOpen ? "translate-x-0" : "translate-x-full"
//         }`}
//       >
//         {selectedDoc && (
//           <>
//             {/* Drawer Header */}
//             <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
//               <div>
//                 <h2 className="text-lg font-bold text-slate-800">
//                   Redaction Setup
//                 </h2>
//                 <p
//                   className="text-xs text-slate-500 truncate w-64"
//                   title={selectedDoc.name}
//                 >
//                   {selectedDoc.name}
//                 </p>
//               </div>
//               <button
//                 onClick={closeConfigDrawer}
//                 className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
//               >
//                 <FaTimes />
//               </button>
//             </div>

//             {/* Drawer Body */}
//             <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
//               {/* Document Preview Placeholder */}
//               {selectedDoc.mime_type?.includes("pdf") ? (
//                 <div className="w-full relative rounded-xl border border-slate-300 overflow-hidden bg-slate-50">
//                   {previewLoading ? (
//                     <div className="w-full h-40 flex items-center justify-center">
//                       <div className="w-6 h-6 border-3 border-slate-200 border-t-brand rounded-full animate-spin" />
//                     </div>
//                   ) : previewImage ? (
//                     <>
//                       <img
//                         src={previewImage}
//                         alt="Document Preview"
//                         className="w-full h-auto"
//                       />
//                       <Link
//                         href={`/redaction/documents/viewer?id=${selectedDoc.id}`}
//                         className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center transition-colors group/preview"
//                       >
//                         <div className="text-white opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center gap-2 bg-black/50 px-4 py-2 rounded-lg">
//                           <FaEye /> View Full Document
//                         </div>
//                       </Link>
//                     </>
//                   ) : (
//                     <div className="w-full h-40 flex flex-col items-center justify-center text-slate-400">
//                       <FaLock className="w-8 h-8 mb-2 text-slate-300" />
//                       <span className="text-sm font-medium">
//                         Preview Unavailable
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="w-full h-40 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
//                   <FaLock className="w-8 h-8 mb-2 text-slate-300" />
//                   <span className="text-sm font-medium">
//                   {getFileType(selectedDoc)} Document
//                   </span>
//                   <Link
//                     href={`/redaction/documents/viewer?id=${selectedDoc.id}`}
//                     className="mt-3 text-xs px-3 py-1 bg-brand-soft0 text-white rounded hover:bg-brand-dark transition-colors"
//                   >
//                     View Document
//                   </Link>
//                 </div>
//               )}

//               {/* Mode Toggle */}
//               <div>
//                 <label className="block text-sm font-bold text-slate-700 mb-3">
//                   Visibility Mode
//                 </label>
//                 <div className="flex bg-slate-100 p-1 rounded-lg">
//                   <button
//                     onClick={() => setVisibilityMode("show")}
//                     className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
//                       visibilityMode === "show"
//                         ? "bg-white text-brand shadow-sm"
//                         : "text-slate-500 hover:text-slate-700"
//                     }`}
//                   >
//                     Show Specific Pages
//                   </button>
//                   <button
//                     onClick={() => setVisibilityMode("hide")}
//                     className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
//                       visibilityMode === "hide"
//                         ? "bg-white text-rose-600 shadow-sm"
//                         : "text-slate-500 hover:text-slate-700"
//                     }`}
//                   >
//                     Hide Specific Pages
//                   </button>
//                 </div>
//                 <p className="mt-2 text-xs text-slate-500">
//                   {visibilityMode === "show"
//                     ? "Only the pages you specify below will be visible. All other pages will be redacted."
//                     : "The pages you specify below will be redacted. All other pages will be visible."}
//                 </p>
//               </div>

//               {/* Smart Page Selection */}
//               <div>
//                 <label className="block text-sm font-bold text-slate-700 mb-3">
//                   Page Selection
//                 </label>

//                 {/* Tag Container */}
//                 <div className="flex flex-wrap gap-2 mb-3">
//                   {pageRanges.map((range) => (
//                     <div
//                       key={range}
//                       className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
//                         visibilityMode === "show"
//                           ? "bg-brand-100 text-brand-dark"
//                           : "bg-rose-100 text-rose-700"
//                       }`}
//                     >
//                       Pages {range}
//                       <button
//                         onClick={() => removeRange(range)}
//                         className={`hover:opacity-70 ${
//                           visibilityMode === "show"
//                             ? "text-brand"
//                             : "text-rose-500"
//                         }`}
//                       >
//                         <FaTimes className="w-3 h-3" />
//                       </button>
//                     </div>
//                   ))}
//                   {pageRanges.length === 0 && (
//                     <span className="text-sm text-slate-400 italic">
//                       No pages specified yet.
//                     </span>
//                   )}
//                 </div>

//                 {/* Input Field */}
//                 <div className="relative">
//                   <input
//                     type="text"
//                     value={inputValue}
//                     onChange={(e) => setInputValue(e.target.value)}
//                     onKeyDown={handleAddRange}
//                     placeholder="e.g. 1-3 or 5 (Press Enter)"
//                     className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
//                   />
//                   <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
//                     Press Enter ↵
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Drawer Footer */}
//             <div className="p-6 border-t border-slate-200 bg-white">
//               <button
//                 onClick={handleSaveConfig}
//                 disabled={isSaving || saveSuccess}
//                 className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all ${
//                   saveSuccess
//                     ? "bg-green-500"
//                     : "bg-brand hover:bg-brand-dark"
//                 }`}
//               >
//                 {isSaving ? (
//                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                 ) : saveSuccess ? (
//                   <>
//                     <FaCheck /> Saved Successfully
//                   </>
//                 ) : (
//                   "Save Configuration"
//                 )}
//               </button>
//             </div>
//           </>
//         )}
//       </div>

//       {/* Drawer Overlay */}
//       {isDrawerOpen && (
//         <div
//           className="fixed inset-0 bg-brand/20 z-40 lg:hidden"
//           onClick={closeConfigDrawer}
//         />
//       )}
//     </div>
//   );
// }


