"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { FaSpinner } from "react-icons/fa";

import SelectionOverlay from "@/components/redaction/SelectionOverlay";

/**
 * TextViewer
 * Fetches a plain-text file and renders it with search highlighting
 * and zoom support driven by the shared toolbar.
 *
 * Props:
 *   url          – signed URL to the file (string)
 *   scale        – zoom level from shared toolbar (number, default 1.5)
 *   searchQuery  – text to highlight from shared toolbar (string)
 *   onNumPages   – callback(1) – text is a single page
 *   tool
 *   selections
 *   onAddSelection
 *   onRemoveSelection
 *   onUpdateSelection
 */
export default function TextViewer({
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [text, setText] = useState("");

  /**
   * Ref attached to the <pre> element — used as the coordinate anchor
   * for semantic redaction detection (same pattern as WordViewer).
   */
  const preRef = useRef(null);

  useEffect(() => {
    if (!url) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      setText("");

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);
        const content = await response.text();
        if (!cancelled) {
          setText(content);
          onNumPages?.(1);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("TextViewer error:", err);
          setError(err.message || "Failed to load text file.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [url]);

  // Build highlighted segments whenever text or searchQuery changes
  const segments = useMemo(() => {
    const query = searchQuery.trim();
    if (!query || !text) return null;

    const re = new RegExp(`(${escapeRegExp(query)})`, "gi");
    return text.split(re);
  }, [text, searchQuery]);

  // ── Semantic redaction detection ────────────────────────────────────────────
  /**
   * Intercepts the raw {x,y,w,h} box, walks all text nodes inside the <pre>,
   * finds those that visually overlap the drawn rectangle, and enriches the
   * selection with `redactionTarget` before forwarding to the parent.
   *
   * Coordinate system: identical to WordViewer — preRef.current.parentElement
   * is SelectionOverlay's relative wrapper, which equals the overlay's origin.
   */
  const handleAddSelection = useCallback(
    (rawSel) => {
      const enriched = { ...rawSel };

      try {
        if (preRef.current) {
          // preRef is a direct child of SelectionOverlay's relative wrapper div.
          const wrapperRect = preRef.current.parentElement?.getBoundingClientRect();

          if (wrapperRect) {
            const matchedText = collectTextNodesInBox(preRef.current, rawSel, wrapperRect);

            if (matchedText) {
              enriched.redactionTarget = {
                type: "text",
                matchedText,
                replacement: "████████",
              };
            }
          }
        }
      } catch (err) {
        console.warn("TextViewer: redaction detection failed:", err);
      }

      onAddSelection(enriched);
    },
    [onAddSelection]
  );

  const fontSize = Math.round(13 * (scale / 1.5));

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <FaSpinner style={{ width: 22, height: 22, color: "var(--brand)", animation: "spin 0.7s linear infinite" }} />
        <span style={{ marginLeft: 10, color: "#64748b", fontSize: 14 }}>Loading text file…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, color: "#dc2626", background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 8, margin: 16 }}>
        <strong>Error:</strong> {error}
      </div>
    );
  }

  const query = searchQuery.trim().toLowerCase();

  return (
    <div style={{ width: "100%", padding: 16, background: "#fff", position: "relative" }}>
      <SelectionOverlay
        tool={tool}
        selections={selections}
        onAddSelection={handleAddSelection}
        onRemoveSelection={onRemoveSelection}
        onUpdateSelection={onUpdateSelection}
      >
        <pre
          ref={preRef}
          style={{
            fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', 'Monaco', 'Courier New', monospace",
            fontSize,
            lineHeight: 1.7,
            color: "#1e293b",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "16px 20px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowX: "auto",
            margin: 0,
            maxHeight: "70vh",
            overflowY: "auto",
            transition: "font-size 0.15s ease",
          }}
        >
          {segments ? (
            segments.map((part, i) =>
              part.toLowerCase() === query ? (
                <mark key={i} style={{ background: "#fef08a", borderRadius: 2, padding: "0 1px" }}>
                  {part}
                </mark>
              ) : (
                part
              )
            )
          ) : (
            text || "(empty file)"
          )}
        </pre>
      </SelectionOverlay>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DOM helpers for semantic redaction detection
───────────────────────────────────────────────────────────────────────────── */

/**
 * Walk all non-empty text nodes inside `container`, find those whose visual
 * bounding rect (relative to `wrapperRect`) overlaps `sel`, and return their
 * concatenated text content.  Returns null when nothing is found.
 */
function collectTextNodesInBox(container, sel, wrapperRect) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (!node.nodeValue?.trim()) return NodeFilter.FILTER_SKIP;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const parts = [];
  let node;

  while ((node = walker.nextNode())) {
    try {
      const range = document.createRange();
      range.selectNodeContents(node);
      const rects = range.getClientRects();
      
      let nodeOverlaps = false;
      for (const r of rects) {
        const rx = r.left - wrapperRect.left;
        const ry = r.top - wrapperRect.top;
        if (rectsOverlap({ x: rx, y: ry, w: r.width, h: r.height }, sel)) {
          nodeOverlaps = true;
          break;
        }
      }

      if (nodeOverlaps) {
        const text = node.nodeValue;
        let minOffset = text.length;
        let maxOffset = -1;
        
        // Character by character measurement for precise selection
        for (let i = 0; i < text.length; i++) {
          // Skip whitespace for bounding box checks to save time
          if (/\s/.test(text[i])) continue;
          
          range.setStart(node, i);
          range.setEnd(node, i + 1);
          
          const charRects = range.getClientRects();
          let charOverlaps = false;
          
          for (let j = 0; j < charRects.length; j++) {
            const cr = charRects[j];
            const crx = cr.left - wrapperRect.left;
            const cry = cr.top - wrapperRect.top;
            
            if (rectsOverlap({ x: crx, y: cry, w: cr.width, h: cr.height }, sel)) {
              charOverlaps = true;
              break;
            }
          }
          
          if (charOverlaps) {
            if (i < minOffset) minOffset = i;
            if (i > maxOffset) maxOffset = i;
          }
        }
        
        if (maxOffset >= minOffset) {
          // We found the exact continuous range of characters that overlap!
          parts.push(text.substring(minOffset, maxOffset + 1));
        }
      }
    } catch {
      // Ignore Range API errors on detached nodes
    }
  }

  return parts.length > 0 ? parts.join(" ") : null;
}

/** True when rectangle a and rectangle b overlap (x,y = top-left origin). */
function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
