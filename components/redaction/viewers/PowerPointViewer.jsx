"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { FaSpinner } from "react-icons/fa";

import SelectionOverlay from "@/components/redaction/SelectionOverlay";

/**
 * PowerPointViewer
 * Renders PPTX files slide-by-slide.
 *
 * Props:
 *   url          – signed URL to the file (string)
 *   fileExt      – "ppt" | "pptx" (string, lowercase)
 *   currentPage  – active slide index (0-based) controlled by shared toolbar
 *   onNumPages   – callback(n) to report total slide count to toolbar
 *   scale        – zoom level from shared toolbar (number)
 *   searchQuery  – text to search/highlight across slides (string)
 *   tool
 *   selections
 *   onAddSelection
 *   onRemoveSelection
 *   onUpdateSelection
 */
export default function PowerPointViewer({
  url,
  fileExt,
  currentPage = 0,
  onNumPages,
  scale = 1.5,
  searchQuery = "",
  tool,
  selections = [],
  onAddSelection,
  onRemoveSelection,
  onUpdateSelection,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slides, setSlides] = useState([]); // array of { blocks: [{text, isTitle}] }
  const slideContainerRef = useRef(null);

  useEffect(() => {
    if (!url) return;

    if (fileExt === "ppt") {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      setSlides([]);

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();

        if (cancelled) return;

        const JSZip = (await import("jszip")).default;
        const zip = await JSZip.loadAsync(arrayBuffer);

        if (cancelled) return;

        const slideFiles = Object.keys(zip.files).filter((name) =>
          /^ppt\/slides\/slide\d+\.xml$/.test(name)
        );

        slideFiles.sort((a, b) => {
          const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || "0");
          const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || "0");
          return numA - numB;
        });

        if (slideFiles.length === 0) {
          throw new Error("No slides found in this PPTX file.");
        }

        const parsedSlides = await Promise.all(
          slideFiles.map(async (slideFile) => {
            const xmlStr = await zip.files[slideFile].async("string");
            return parseSlideXml(xmlStr, slideFile);
          })
        );

        if (!cancelled) {
          setSlides(parsedSlides);
          onNumPages?.(parsedSlides.length);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("PowerPointViewer error:", err);
          setError(err.message || "Failed to render PowerPoint.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [url, fileExt]);

  // ── Helpers ──────────────────────────────────────────────

  function parseSlideXml(xmlStr, slideFile) {
    const slideNum = slideFile.match(/slide(\d+)\.xml/)?.[1] || "?";
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlStr, "application/xml");

    const spTrees = doc.querySelectorAll("sp");
    const blocks = [];

    spTrees.forEach((sp) => {
      const txBody = sp.querySelector("txBody");
      if (!txBody) return;

      const paras = txBody.querySelectorAll("p");
      paras.forEach((p) => {
        const runs = p.querySelectorAll("t");
        const text = Array.from(runs).map((t) => t.textContent).join("");
        if (text.trim()) {
          const ph = sp.querySelector("ph");
          const phType = ph?.getAttribute("type");
          const isTitle = phType === "title" || phType === "ctrTitle";
          blocks.push({ text: text.trim(), isTitle });
        }
      });
    });

    return { slideNum, blocks };
  }

  // ── Semantic redaction detection ────────────────────────────────────────────
  const slideIndex = Math.min(Math.max(0, currentPage), Math.max(0, slides.length - 1));
  
  const handleAddSelection = useCallback(
    (rawSel) => {
      const enriched = { ...rawSel };

      try {
        if (slideContainerRef.current) {
          const wrapperRect = slideContainerRef.current.parentElement?.getBoundingClientRect();
          
          if (wrapperRect) {
            const blocks = slideContainerRef.current.querySelectorAll("[data-block-index]");
            const blockIndices = [];
            const matchedTexts = [];

            blocks.forEach((block) => {
              const rect = block.getBoundingClientRect();
              const rx = rect.left - wrapperRect.left;
              const ry = rect.top - wrapperRect.top;

              if (rectsOverlap({ x: rx, y: ry, w: rect.width, h: rect.height }, rawSel)) {
                blockIndices.push(parseInt(block.getAttribute("data-block-index") || "0", 10));
                matchedTexts.push(block.textContent || "");
              }
            });

            if (blockIndices.length > 0) {
              enriched.redactionTarget = {
                type: "pptx",
                slideIndex,
                blockIndices,
                matchedTexts,
                replacement: "████████",
              };
            }
          }
        }
      } catch (err) {
        console.warn("PowerPointViewer: redaction detection failed:", err);
      }

      onAddSelection(enriched);
    },
    [onAddSelection, slideIndex]
  );

  // ── Render ───────────────────────────────────────────────

  if (!loading && fileExt === "ppt") {
    return <FallbackDownload url={url} reason="Legacy .ppt format cannot be previewed in the browser." />;
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <FaSpinner style={{ width: 22, height: 22, color: "var(--brand)", animation: "spin 0.7s linear infinite" }} />
        <span style={{ marginLeft: 10, color: "#64748b", fontSize: 14 }}>Loading presentation…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return <FallbackDownload url={url} reason={error} />;
  }

  if (slides.length === 0) {
    return <FallbackDownload url={url} reason="No slides could be extracted from this file." />;
  }

  const slide = slides[slideIndex];
  const query = searchQuery.trim().toLowerCase();
  const zoomRatio = scale / 1.5;

  const highlightText = (text) => {
    if (!query || !text.toLowerCase().includes(query)) return text;
    const re = new RegExp(`(${escapeRegExp(query)})`, "gi");
    return text.split(re).map((part, i) =>
      re.test(part) ? (
        <mark key={i} style={{ background: "#fef08a", borderRadius: 2, padding: "0 1px" }}>{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Slide content */}
      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          background: "#f8fafc",
          overflow: "auto",
          padding: 24,
          display: "flex",
          justifyContent: "center",
          position: "relative"
        }}
      >
        <SelectionOverlay
          tool={tool}
          selections={selections}
          onAddSelection={handleAddSelection}
          onRemoveSelection={onRemoveSelection}
          onUpdateSelection={onUpdateSelection}
        >
          <div
            ref={slideContainerRef}
            style={{
              transform: `scale(${zoomRatio})`,
              transformOrigin: "top center",
              transition: "transform 0.15s ease",
              width: "100%",
              maxWidth: 800,
            }}
          >
          {slide.blocks.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
              Slide {slide.slideNum} — (no text content)
            </div>
          ) : (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "40px 48px",
                minHeight: 340,
                margin: "0 auto",
                boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                fontFamily: "system-ui,sans-serif",
              }}
            >
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 24, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Slide {slide.slideNum}
              </div>
              {slide.blocks.map(({ text, isTitle }, i) =>
                isTitle ? (
                  <h2 key={i} data-block-index={i} style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", margin: "0 0 16px" }}>
                    {highlightText(text)}
                  </h2>
                ) : (
                  <p key={i} data-block-index={i} style={{ fontSize: 15, color: "#334155", margin: "0 0 10px", lineHeight: 1.6 }}>
                    {highlightText(text)}
                  </p>
                )
              )}
            </div>
          )}
        </div>
        </SelectionOverlay>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function FallbackDownload({ url, reason }) {
  return (
    <div style={{ padding: 32, textAlign: "center", color: "#64748b" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
      <p style={{ fontWeight: 600, fontSize: 15, color: "#334155", marginBottom: 8 }}>
        Preview not available for this presentation.
      </p>
      {reason && (
        <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>{reason}</p>
      )}
      <p style={{ fontSize: 13, marginBottom: 20 }}>
        Download the file to view it in Microsoft PowerPoint or LibreOffice.
      </p>
      <a
        href={url}
        download
        style={{
          display: "inline-block",
          padding: "10px 22px",
          background: "var(--brand)",
          color: "#fff",
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 13,
          textDecoration: "none",
        }}
      >
        Download File
      </a>
    </div>
  );
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}
