"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import SelectionOverlay from "@/components/redaction/SelectionOverlay";

/**
 * ExcelViewer
 * Reads XLS / XLSX / CSV files using SheetJS and renders each sheet as
 * an HTML table with tab navigation.
 *
 * Props:
 *   url          – signed URL to the file (string)
 *   currentPage  – active sheet index (0-based) controlled by shared toolbar
 *   onNumPages   – callback(n) to report total sheet count to the toolbar
 *   scale        – zoom level from shared toolbar (number)
 *   searchQuery  – text to highlight from shared toolbar (string)
 *   tool
 *   selections
 *   onAddSelection
 *   onRemoveSelection
 *   onUpdateSelection
 */
export default function ExcelViewer({
  url,
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
  const [sheets, setSheets] = useState([]); // [{ name, rows: string[][] }]
  const tableRef = useRef(null);

  // ── Load workbook ────────────────────────────────────────
  useEffect(() => {
    if (!url) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      setSheets([]);

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();

        if (cancelled) return;

        const XLSX = await import("xlsx");
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        const parsedSheets = workbook.SheetNames.map((name) => {
          const worksheet = workbook.Sheets[name];
          // aoa = array of arrays — easier to search and render ourselves
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
          return { name, rows };
        });

        if (!cancelled) {
          setSheets(parsedSheets);
          onNumPages?.(parsedSheets.length);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("ExcelViewer error:", err);
          setError(err.message || "Failed to render spreadsheet.");
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

  // Clamp active sheet to valid range
  const activeSheet = Math.min(Math.max(0, currentPage), Math.max(0, sheets.length - 1));
  const currentSheetData = sheets[activeSheet];
  const zoomRatio = scale / 1.5;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <FaSpinner style={{ width: 22, height: 22, color: "var(--brand)", animation: "spin 0.7s linear infinite" }} />
        <span style={{ marginLeft: 10, color: "#64748b", fontSize: 14 }}>Loading spreadsheet…</span>
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

  if (sheets.length === 0) {
    return (
      <div style={{ padding: 24, color: "#64748b", textAlign: "center" }}>
        No sheets found in this workbook.
      </div>
    );
  }

  const query = searchQuery.trim().toLowerCase();

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      {/* Sheet tab bar */}
      {sheets.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: "8px 16px 0",
            borderBottom: "1px solid #e2e8f0",
            background: "#f8fafc",
            flexWrap: "wrap",
          }}
        >
          {sheets.map((sheet, idx) => (
            <div
              key={sheet.name}
              style={{
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: idx === activeSheet ? 700 : 500,
                color: idx === activeSheet ? "var(--brand)" : "#475569",
                background: idx === activeSheet ? "#fff" : "transparent",
                border: "1px solid",
                borderColor: idx === activeSheet ? "#e2e8f0" : "transparent",
                borderBottom: idx === activeSheet ? "2px solid var(--brand)" : "none",
                borderRadius: "6px 6px 0 0",
                marginBottom: "-1px",
              }}
            >
              {sheet.name}
            </div>
          ))}
        </div>
      )}

      {/* Table container */}
      <div
        ref={tableRef}
        style={{
          overflowX: "auto",
          padding: 16,
          background: "#fff",
          position: "relative"
        }}
      >
        <SelectionOverlay
          tool={tool}
          selections={selections}
          onAddSelection={onAddSelection}
          onRemoveSelection={onRemoveSelection}
          onUpdateSelection={onUpdateSelection}
        >
          <div style={{ transform: `scale(${zoomRatio})`, transformOrigin: "top left", transition: "transform 0.15s ease" }}>
            <table style={{ borderCollapse: "collapse", fontSize: 13, color: "#1e293b", width: "100%" }}>
              <tbody>
                {currentSheetData?.rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {(row || []).map((cell, cIdx) => {
                      const cellStr = String(cell ?? "");
                      const isMatch = query && cellStr.toLowerCase().includes(query);
                      return rIdx === 0 ? (
                        <th
                          key={cIdx}
                          style={{
                            border: "1px solid #e2e8f0",
                            padding: "6px 10px",
                            whiteSpace: "nowrap",
                            textAlign: "left",
                            background: isMatch ? "#fef08a" : "#f1f5f9",
                            fontWeight: 700,
                            color: "#334155",
                            position: "sticky",
                            top: 0,
                          }}
                        >
                          {isMatch ? <mark style={{ background: "#fef08a", borderRadius: 2 }}>{cellStr}</mark> : cellStr}
                        </th>
                      ) : (
                        <td
                          key={cIdx}
                          style={{
                            border: "1px solid #e2e8f0",
                            padding: "6px 10px",
                            whiteSpace: "nowrap",
                            background: isMatch ? "#fef08a" : rIdx % 2 === 0 ? "#f8fafc" : "#fff",
                          }}
                        >
                          {isMatch ? <mark style={{ background: "#fef08a", borderRadius: 2 }}>{cellStr}</mark> : cellStr}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SelectionOverlay>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
