// Format currency in Indian Rupees (₹)
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Mask sensitive identifiers (e.g. Aadhaar, Phone, PAN)
export const maskString = (str, visibleEnd = 4) => {
  if (!str) return '—';
  if (str.length <= visibleEnd) return str;
  return 'X'.repeat(str.length - visibleEnd) + str.slice(-visibleEnd);
};
