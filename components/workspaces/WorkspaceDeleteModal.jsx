"use client";

import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

export default function WorkspaceDeleteModal({
  isOpen,
  workspace,
  onClose,
  onConfirmDelete,
}) {
  if (!isOpen || !workspace) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] border border-gray-200 overflow-hidden transform transition-all duration-300 scale-100 p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        {/* Warning Icon - Clean styling */}
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4 mx-auto">
          <FaExclamationTriangle className="w-5 h-5" />
        </div>

        {/* Modal Title */}
        <h3
          id="delete-modal-title"
          className="text-lg font-bold text-gray-900 text-center mb-2"
        >
          Delete Workspace?
        </h3>

        {/* Confirmation Message */}
        <p className="text-[15px] text-gray-500 text-center mb-6 leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="font-bold text-gray-800">&ldquo;{workspace.name}&rdquo;</span>? This action will permanently remove the workspace card from your dashboard.
        </p>

        {/* Action Buttons - Matching font-medium and clean border */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirmDelete(workspace.id)}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all"
          >
            Delete Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
