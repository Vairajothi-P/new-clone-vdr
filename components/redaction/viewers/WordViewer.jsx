"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaSpinner } from "react-icons/fa";

import SelectionOverlay from "@/components/redaction/SelectionOverlay";

/**
 * WordViewer
 * Renders DOC / DOCX files using the `docx-preview` library.
 *
 * Props:
 *   url          – signed URL to the file (string)
 *   scale        – zoom level from shared toolbar (number, default 1.5)
 *   searchQuery  – text to highlight from shared toolbar (string)
 *   onNumPages   – callback(n) called once after render to report page count
 *   tool
 *   selections
 *   onAddSelection
 *   onRemoveSelection
 *   onUpdateSelection
 */
export default function WordViewer({
  url,
  scale = 1.5,
  searchQuery = "",
  onNumPages,
  tool,
  selections = [],
  onAddSelection,
  onRemoveSelection,
  onUpdateSelection,
}) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rendered, setRendered] = useState(false);

  // ── Initial render ──────────────────────────────────────
  useEffect(() => {
    if (!url || !containerRef.current) return;

    let cancelled = false;

    const render = async () => {
      setLoading(true);
      setError(null);
      setRendered(false);

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();

        if (cancelled) return;

        const { renderAsync } = await import("docx-preview");

        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }

        if (cancelled) return;

        await renderAsync(arrayBuffer, containerRef.current, null, {
          className: "docx-viewer",
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          ignoreLastRenderedPageBreak: true,
          experimental: false,
          trimXmlDeclaration: true,
          debug: false,
        });

        if (!cancelled) {
          setRendered(true);
          // Count page sections rendered by docx-preview
          const sections = containerRef.current?.querySelectorAll(".docx-wrapper > section, .docx section, section.docx");
          const count = sections && sections.length > 0 ? sections.length : 1;
          onNumPages?.(count);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("WordViewer error:", err);
          setError(err.message || "Failed to render Word document.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [url]);

  // ── Apply zoom via CSS transform ─────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.style.transform = `scale(${scale / 1.5})`;
    containerRef.current.style.transformOrigin = "top center";
  }, [scale]);

  // ── Highlight search matches ─────────────────────────────
  useEffect(() => {
    if (!containerRef.current || !rendered) return;

    // Remove previous highlights
    containerRef.current.querySelectorAll("mark.vdr-highlight").forEach((el) => {
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent || ""), el);
        parent.normalize();
      }
    });

    const query = searchQuery.trim();
    if (!query) return;

    highlightTextInContainer(containerRef.current, query);
  }, [searchQuery, rendered]);

  return (
    <div style={{ width: "100%", minHeight: "400px", position: "relative", overflow: "auto" }}>
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.8)",
            zIndex: 5,
          }}
        >
          <FaSpinner
            style={{ width: 24, height: 24, color: "var(--brand)", animation: "spin 0.7s linear infinite" }}
          />
          <span style={{ marginLeft: 10, color: "#64748b", fontSize: 14 }}>Rendering document…</span>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "24px",
            color: "#dc2626",
            background: "#fff5f5",
            border: "1px solid #fca5a5",
            borderRadius: 8,
            margin: 16,
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* docx-preview renders directly into this div */}
      <SelectionOverlay
        tool={tool}
        selections={selections}
        onAddSelection={onAddSelection}
        onRemoveSelection={onRemoveSelection}
        onUpdateSelection={onUpdateSelection}
      >
        <div
          ref={containerRef}
          style={{
            width: "100%",
            background: "#fff",
            padding: "0 16px",
            transition: "transform 0.15s ease",
          }}
        />
      </SelectionOverlay>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .docx-viewer {
          font-family: "Times New Roman", Times, serif;
          color: #1e293b;
          line-height: 1.6;
        }
        .docx-viewer section.docx {
          box-shadow: 0 1px 8px rgba(0,0,0,0.12);
          margin: 16px auto !important;
          border-radius: 4px;
        }
        mark.vdr-highlight {
          background: #fef08a;
          color: inherit;
          border-radius: 2px;
          padding: 0 1px;
        }
      `}</style>
    </div>
  );
}

/**
 * Walk all text nodes in `container` and wrap matches of `query`
 * in <mark class="vdr-highlight"> elements.
 */
function highlightTextInContainer(container, query) {
  const re = new RegExp(escapeRegExp(query), "gi");
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) {
    textNodes.push(node);
  }

  textNodes.forEach((textNode) => {
    const value = textNode.nodeValue || "";
    if (!re.test(value)) return;
    re.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let lastIndex = 0;
    let match;

    while ((match = re.exec(value)) !== null) {
      if (match.index > lastIndex) {
        frag.appendChild(document.createTextNode(value.slice(lastIndex, match.index)));
      }
      const mark = document.createElement("mark");
      mark.className = "vdr-highlight";
      mark.textContent = match[0];
      frag.appendChild(mark);
      lastIndex = re.lastIndex;
    }

    if (lastIndex < value.length) {
      frag.appendChild(document.createTextNode(value.slice(lastIndex)));
    }

    textNode.parentNode?.replaceChild(frag, textNode);
  });
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
