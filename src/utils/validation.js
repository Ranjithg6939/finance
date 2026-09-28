/**
 * Input sanitizers and validators for FinVeda Finance Management System
 * Ensures strict character filtering while typing and robust form validation.
 */

// ---------------------------------------------------------------------------
// SANITIZERS (Prevent invalid characters while typing)
// ---------------------------------------------------------------------------

/**
 * Strips all characters except English letters and single spaces between words.
 * Prevents digits, punctuation, and symbols from being typed into name fields.
 */
export const filterLettersOnly = (val) => {
  if (typeof val !== 'string') return '';
  // Remove non-letters and non-spaces, and prevent multiple consecutive spaces
  return val.replace(/[^a-zA-Z\s]/g, '').replace(/\s{2,}/g, ' ');
};

/**
 * Strips all non-digit characters and truncates to maxLength.
 * Perfect for Mobile (10 digits), Aadhaar (12 digits), Pincode (6 digits).
 */
export const filterDigitsOnly = (val, maxLength = 999) => {
  if (typeof val !== 'string' && typeof val !== 'number') return '';
  return String(val).replace(/\D/g, '').slice(0, maxLength);
};

/**
 * Restricts input to valid positive decimal numbers (e.g. 10000, 25.5).
 * Disallows alphabets, negative signs, +, e, and multiple decimal dots.
 */
export const filterAmount = (val, maxDecimals = 2) => {
  if (typeof val !== 'string' && typeof val !== 'number') return '';
  let clean = String(val).replace(/[^0-9.]/g, '');
  // Keep only the first decimal point
  const parts = clean.split('.');
  if (parts.length > 2) {
    clean = parts[0] + '.' + parts.slice(1).join('');
  }
  if (maxDecimals !== undefined && parts.length === 2 && parts[1].length > maxDecimals) {
    clean = parts[0] + '.' + parts[1].slice(0, maxDecimals);
  }
  return clean;
};

/**
 * Restricts input to uppercase alphanumeric characters up to maxLength.
 * Useful for PAN numbers, Transaction references.
 */
export const filterAlphanumeric = (val, maxLength = 999) => {
  if (typeof val !== 'string') return '';
  return val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, maxLength);
};

// ---------------------------------------------------------------------------
// VALIDATORS (Return error message string or null if valid)
// ---------------------------------------------------------------------------

/**
 * Validate full name / personal name.
 */
export const validateName = (name, label = 'Full Name', required = true) => {
  const trimmed = (name || '').trim();
  if (required && !trimmed) {
    return `${label} is required`;
  }
  if (!trimmed && !required) {
    return null;
  }
  if (!/^[a-zA-Z\s]+$/.test(trimmed)) {
    return `${label} can contain letters and spaces only`;
  }
  if (trimmed.length < 2) {
    return `${label} must be at least 2 characters long`;
  }
  if (trimmed.length > 60) {
    return `${label} cannot exceed 60 characters`;
  }
  return null;
};

/**
 * Validate mobile number (strictly 10 digits).
 */
export const validateMobile = (phone, required = true, label = 'Mobile number') => {
  const cleaned = String(phone || '').trim();
  if (required && !cleaned) {
    return `${label} is required`;
  }
  if (!cleaned && !required) {
    return null;
  }
  if (!/^\d+$/.test(cleaned)) {
    return `${label} must contain numbers only`;
  }
  if (cleaned.length !== 10) {
    return `${label} must contain exactly 10 digits`;
  }
  if (/^0{10}$/.test(cleaned)) {
    return `Please enter a valid 10-digit mobile number`;
  }
  return null;
};

/**
 * Validate Aadhaar number (strictly 12 digits).
 */
export const validateAadhaar = (aadhaar, required = false) => {
  const cleaned = String(aadhaar || '').trim();
  if (required && !cleaned) {
    return 'Aadhaar number is required';
  }
  if (!cleaned && !required) {
    return null;
  }
  if (!/^\d+$/.test(cleaned)) {
    return 'Aadhaar number must contain numbers only';
  }
  if (cleaned.length !== 12) {
    return 'Aadhaar number must contain exactly 12 digits';
  }
  return null;
};

/**
 * Validate PAN number (10 alphanumeric: 5 letters, 4 digits, 1 letter).
 */
export const validatePAN = (pan, required = false) => {
  const cleaned = String(pan || '').trim().toUpperCase();
  if (required && !cleaned) {
    return 'PAN number is required';
  }
  if (!cleaned && !required) {
    return null;
  }
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleaned)) {
    return 'Invalid PAN format (e.g. ABCDE1234F)';
  }
  return null;
};

/**
 * Validate Email address.
 */
export const validateEmail = (email, required = false) => {
  const cleaned = String(email || '').trim();
  if (required && !cleaned) {
    return 'Email address is required';
  }
  if (!cleaned && !required) {
    return null;
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleaned)) {
    return 'Please enter a valid email address (e.g. name@example.com)';
  }
  return null;
};

/**
 * Validate Indian postal pincode (strictly 6 digits).
 */
export const validatePincode = (pincode, required = false) => {
  const cleaned = String(pincode || '').trim();
  if (required && !cleaned) {
    return 'Pincode is required';
  }
  if (!cleaned && !required) {
    return null;
  }
  if (!/^\d{6}$/.test(cleaned)) {
    return 'Pincode must be exactly 6 digits';
  }
  return null;
};

/**
 * Validate positive monetary amount.
 */
export const validateAmount = (amount, label = 'Amount', min = 1, max = null) => {
  if (amount === '' || amount === null || amount === undefined) {
    return `${label} is required`;
  }
  const num = parseFloat(amount);
  if (isNaN(num)) {
    return `Please enter a valid numeric ${label.toLowerCase()}`;
  }
  if (num < min) {
    return `${label} must be at least ₹${min.toLocaleString()}`;
  }
  if (max !== null && num > max) {
    return `${label} cannot exceed ₹${max.toLocaleString()}`;
  }
  return null;
};

/**
 * Validate interest rate percentage.
 */
export const validateInterestRate = (rate) => {
  if (rate === '' || rate === null || rate === undefined) {
    return 'Interest rate is required';
  }
  const num = parseFloat(rate);
  if (isNaN(num)) {
    return 'Please enter a valid interest rate';
  }
  if (num < 0.01) {
    return 'Interest rate must be greater than 0%';
  }
  if (num > 100) {
    return 'Interest rate cannot exceed 100%';
  }
  return null;
};

/**
 * Validate loan duration integer.
 */
export const validateDuration = (duration) => {
  if (duration === '' || duration === null || duration === undefined) {
    return 'Duration is required';
  }
  const num = parseInt(duration, 10);
  if (isNaN(num) || num <= 0) {
    return 'Duration must be a positive integer';
  }
  if (num > 360) {
    return 'Duration is unreasonably large';
  }
  return null;
};
