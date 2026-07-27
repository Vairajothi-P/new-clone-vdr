"use client";

import React, { useState, useMemo } from "react";
import WorkspaceEmptyState from "./WorkspaceEmptyState";
import WorkspaceHeader from "./WorkspaceHeader";
import WorkspaceCard from "./WorkspaceCard";
import WorkspaceModal from "./WorkspaceModal";
import WorkspaceDeleteModal from "./WorkspaceDeleteModal";

const STORAGE_KEY = "vdr_custom_workspaces";

export default function WorkspacesContainer() {
  // RULE #6: Do NOT include any default/sample workspace like "Project Sterlite"
  // RULE #1: The workspace page should load with an EMPTY state ([])
  const [workspaces, setWorkspaces] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to parse stored workspaces", e);
    }
    return [];
  });

  // Search filter query
  const [searchQuery, setSearchQuery] = useState("");

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [editingWorkspace, setEditingWorkspace] = useState(null);

  // Delete confirmation modal state
  const [deletingWorkspace, setDeletingWorkspace] = useState(null);

  // Save dynamically created/edited workspaces to state and localStorage
  const persistWorkspaces = (newWorkspaces) => {
    setWorkspaces(newWorkspaces);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWorkspaces));
    } catch (e) {
      console.error("Failed to save workspaces to localStorage", e);
    }
  };

  // + Add Workspace Modal Trigger
  const handleOpenCreateModal = () => {
    setModalMode("create");
    setEditingWorkspace(null);
    setIsModalOpen(true);
  };

  // Edit Workspace Modal Trigger (prefills values)
  const handleOpenEditModal = (workspace) => {
    setModalMode("edit");
    setEditingWorkspace(workspace);
    setIsModalOpen(true);
  };

  // Close Create/Edit Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWorkspace(null);
  };

  // Handle Form Submission (Create or Edit)
  const handleFormSubmit = (formData) => {
    if (modalMode === "create") {
      const newWorkspace = {
        id: "ws_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        ...formData,
        usersCount: 0,
        storageMB: 0,
        createdAt: new Date().toISOString(),
      };
      persistWorkspaces([newWorkspace, ...workspaces]);
    } else if (modalMode === "edit" && editingWorkspace) {
      const updated = workspaces.map((ws) =>
        ws.id === editingWorkspace.id
          ? { ...ws, ...formData }
          : ws
      );
      persistWorkspaces(updated);
    }
    handleCloseModal();
  };

  // Delete Modal Trigger
  const handleOpenDeleteModal = (workspace) => {
    setDeletingWorkspace(workspace);
  };

  // Confirm Delete Action
  const handleConfirmDelete = (id) => {
    const updated = workspaces.filter((ws) => ws.id !== id);
    persistWorkspaces(updated);
    setDeletingWorkspace(null);
  };

  // Filtered workspaces for search (case-insensitive across Name, Type, and Deal Type)
  const filteredWorkspaces = useMemo(() => {
    if (!searchQuery.trim()) return workspaces;
    const lower = searchQuery.toLowerCase();
    return workspaces.filter(
      (ws) =>
        ws.name?.toLowerCase().includes(lower) ||
        ws.type?.toLowerCase().includes(lower) ||
        ws.dealType?.toLowerCase().includes(lower) ||
        ws.currency?.toLowerCase().includes(lower)
    );
  }, [workspaces, searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-5">
      {/* Dashboard Header - Compact & Neat */}
      <WorkspaceHeader
        totalCount={workspaces.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddWorkspace={handleOpenCreateModal}
      />

      {/* Conditional Rendering: Empty State vs Workspace Cards */}
      {workspaces.length === 0 ? (
        <WorkspaceEmptyState onAddWorkspace={handleOpenCreateModal} />
      ) : (
        <div>
          {/* Grid of Dynamic Workspace Cards */}
          {filteredWorkspaces.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                No workspaces match your search &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs font-bold text-[var(--brand)] hover:underline"
              >
                Clear search filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredWorkspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  onEdit={handleOpenEditModal}
                  onDelete={handleOpenDeleteModal}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Workspace Modal */}
      <WorkspaceModal
        key={isModalOpen ? (editingWorkspace ? editingWorkspace.id : "create") : "closed"}
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={editingWorkspace}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Workspace Confirmation Modal */}
      <WorkspaceDeleteModal
        isOpen={!!deletingWorkspace}
        workspace={deletingWorkspace}
        onClose={() => setDeletingWorkspace(null)}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
