// lib/workspaces/constants.js
// =====================================================
// SINGLE SOURCE OF TRUTH for Workspace Management constants.
// Production-ready configuration for Virtual Data Room (VDR) workspaces.
// =====================================================

export const WORKSPACE_TYPES = [
  "Virtual Data Room",
  "M&A Due Diligence",
  "Fundraising",
  "Compliance Audit",
  "IP Repository",
  "Board Portal",
  "Secure Collaboration",
];

export const DEAL_TYPES = [
  "Acquisition",
  "Merger",
  "IPO",
  "Venture Capital",
  "Private Equity",
  "Restructuring",
  "Joint Venture",
  "Strategic Partnership",
  "General / Other",
];

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "USD ($ - US Dollar)" },
  { code: "EUR", symbol: "€", name: "EUR (€ - Euro)" },
  { code: "GBP", symbol: "£", name: "GBP (£ - British Pound)" },
  { code: "INR", symbol: "₹", name: "INR (₹ - Indian Rupee)" },
  { code: "JPY", symbol: "¥", name: "JPY (¥ - Japanese Yen)" },
  { code: "AUD", symbol: "A$", name: "AUD (A$ - Australian Dollar)" },
  { code: "CAD", symbol: "C$", name: "CAD (C$ - Canadian Dollar)" },
  { code: "SGD", symbol: "S$", name: "SGD (S$ - Singapore Dollar)" },
  { code: "AED", symbol: "AED ", name: "AED (AED - UAE Dirham)" },
];

export const DEFAULT_WORKSPACE_FORM = {
  type: "Virtual Data Room",
  name: "",
  dealType: "",
  dealValue: "",
  currency: "USD",
  expiryDate: "",
};
