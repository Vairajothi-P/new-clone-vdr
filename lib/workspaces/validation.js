// lib/workspaces/validation.js
// =====================================================
// Form validation utility for Workspaces
// Ensures rules: required Workspace Name (4-50 chars), numeric Deal Value, etc.
// =====================================================

export function validateWorkspaceForm(formData) {
  const errors = {};

  // 1. Validate Workspace Name (Required, 4–50 chars)
  const name = formData.name ? formData.name.trim() : "";
  if (!name) {
    errors.name = "Workspace name is required";
  } else if (name.length < 4) {
    errors.name = "Workspace name must be at least 4 characters";
  } else if (name.length > 50) {
    errors.name = "Workspace name cannot exceed 50 characters";
  }

  // 2. Validate Deal Value (Optional, but if entered must be numeric and non-negative)
  if (formData.dealValue !== "" && formData.dealValue !== null && formData.dealValue !== undefined) {
    const numValue = Number(formData.dealValue);
    if (isNaN(numValue)) {
      errors.dealValue = "Deal value must be a valid number";
    } else if (numValue < 0) {
      errors.dealValue = "Deal value cannot be negative";
    }
  }

  // 3. Validate Expiry Date (Optional, check format if provided)
  if (formData.expiryDate) {
    const dateObj = new Date(formData.expiryDate);
    if (isNaN(dateObj.getTime())) {
      errors.expiryDate = "Please select a valid expiry date";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
