"use client";

import React, { useEffect, useState, useMemo } from "react";
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
        onAddSelection={onAddSelection}
        onRemoveSelection={onRemoveSelection}
        onUpdateSelection={onUpdateSelection}
      >
        <pre
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

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
