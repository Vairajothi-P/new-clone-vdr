"use client";

import React, { useState } from "react";
import { DEAL_TYPES } from "@/lib/workspaces/constants";
import { FaTimes, FaShieldAlt, FaExclamationCircle } from "react-icons/fa";

export default function WorkspaceModal({
  isOpen,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState({
    name: "",
    dealType: "",
    storageUnit: "GB",
    storageLimit: "",
    usersCount: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Workspace Name is required";
    if (!formData.storageLimit) newErrors.storageLimit = "Storage limit is required";
    if (!formData.usersCount) newErrors.usersCount = "Number of users is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    onSubmit({
      name: formData.name,
      dealType: formData.dealType,
      storageUnit: formData.storageUnit,
      storageLimit: Number(formData.storageLimit),
      usersCount: Number(formData.usersCount),
    });
    
    // Reset form
    setFormData({
      name: "",
      dealType: "",
      storageUnit: "GB",
      storageLimit: "",
      usersCount: "",
    });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity">
      {/* Modal Card - Compact & Neat */}
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--brand)]/10 border border-[var(--brand)]/20 flex items-center justify-center text-[var(--brand)] shrink-0">
              <FaShieldAlt className="w-4 h-4" />
            </div>
            <div>
              <h3 id="modal-title" className="text-base font-bold text-gray-900 tracking-tight">
                Create New Workspace
              </h3>
              <p className="text-[12px] text-gray-500">
                Configure your Virtual Data Room details.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <FaTimes className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body Form - Compact spacing */}
        <form onSubmit={handleFormSubmit} className="p-5 space-y-4" noValidate>
          
          {/* 1. Workspace Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
                Workspace Name <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-medium text-gray-400">
                {formData.name.length}/50 chars
              </span>
            </div>

            <input
              type="text"
              required
              maxLength={50}
              placeholder="e.g. Project Horizon - Q4 Acquisition"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`w-full h-10 px-3 bg-gray-50/50 border rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 outline-none transition-all ${
                errors.name
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                  : "border-gray-200 focus:border-[var(--brand)] focus:ring-[var(--brand)]/10"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                <FaExclamationCircle />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* 2. Deal Type */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
              Deal Type <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <select
                value={formData.dealType}
                onChange={(e) => handleChange("dealType", e.target.value)}
                className="w-full h-10 px-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Select a deal type...</option>
                {DEAL_TYPES?.length > 0 ? DEAL_TYPES.map((deal) => (
                  <option key={deal} value={deal}>
                    {deal}
                  </option>
                )) : (
                  <>
                    <option value="Mergers & Acquisitions">Mergers & Acquisitions</option>
                    <option value="Initial Public Offering">Initial Public Offering</option>
                    <option value="Fundraising">Fundraising</option>
                    <option value="Due Diligence">Due Diligence</option>
                  </>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* 3. Storage Unit & Limit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                Storage Unit
              </label>
              <div className="relative">
                <select
                  value={formData.storageUnit}
                  onChange={(e) => handleChange("storageUnit", e.target.value)}
                  className="w-full h-10 px-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:bg-white focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="MB">MB</option>
                  <option value="GB">GB</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400 text-xs">
                  ▼
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                Storage Limit <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 50"
                value={formData.storageLimit}
                onChange={(e) => handleChange("storageLimit", e.target.value)}
                className={`w-full h-10 px-3 bg-gray-50/50 border rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 outline-none transition-all ${
                  errors.storageLimit
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                    : "border-gray-200 focus:border-[var(--brand)] focus:ring-[var(--brand)]/10"
                }`}
              />
            </div>
          </div>

          {/* 4. Number of Users */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
              No. of Users <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 10"
              value={formData.usersCount}
              onChange={(e) => handleChange("usersCount", e.target.value)}
              className={`w-full h-10 px-3 bg-gray-50/50 border rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 outline-none transition-all ${
                errors.usersCount
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                  : "border-gray-200 focus:border-[var(--brand)] focus:ring-[var(--brand)]/10"
              }`}
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white text-sm font-medium shadow-sm hover:shadow transition-all"
            >
              {isSubmitting ? "Creating..." : "Create Workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
