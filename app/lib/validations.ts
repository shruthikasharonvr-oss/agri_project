/**
 * Comprehensive form validation utilities
 */

export interface ValidationError {
  [key: string]: string;
}

// Email validation
export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) {
    return 'Email is required';
  }
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

// Password validation - min 8 chars, at least 1 number and 1 letter
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/[a-zA-Z]/.test(password)) {
    return 'Password must contain at least one letter';
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return 'Password should contain at least one special character (!@#$%^&*)';
  }
  return null;
};

// Username validation - alphanumeric + underscore, 3-20 chars
export const validateUsername = (username: string): string | null => {
  if (!username.trim()) {
    return 'Username is required';
  }
  if (username.length < 3) {
    return 'Username must be at least 3 characters';
  }
  if (username.length > 20) {
    return 'Username must not exceed 20 characters';
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  return null;
};

// Name validation - letters and spaces only, min 2 chars
export const validateName = (name: string): string | null => {
  if (!name.trim()) {
    return 'Name is required';
  }
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }
  if (name.trim().length > 50) {
    return 'Name must not exceed 50 characters';
  }
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return 'Name can only contain letters and spaces';
  }
  return null;
};

// Phone validation - Indian format +91XXXXXXXXXX
export const validatePhone = (phone: string): string | null => {
  if (!phone.trim()) {
    return 'Phone number is required';
  }
  const phoneRegex = /^\+91[6789]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return 'Please enter a valid Indian phone number (+91 followed by 10 digits)';
  }
  return null;
};

// Generic required field validation
export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
};

// Min length validation
export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string
): string | null => {
  if (!value.trim()) {
    return `${fieldName} is required`;
  }
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

// Max length validation
export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string
): string | null => {
  if (value.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters`;
  }
  return null;
};

// Number range validation
export const validateNumberRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string
): string | null => {
  if (isNaN(value)) {
    return `${fieldName} must be a valid number`;
  }
  if (value < min) {
    return `${fieldName} must be at least ${min}`;
  }
  if (value > max) {
    return `${fieldName} must not exceed ${max}`;
  }
  return null;
};

// URL validation
export const validateURL = (url: string): string | null => {
  if (!url.trim()) {
    return 'URL is required';
  }
  try {
    new URL(url);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
};

// OTP validation - typically 6 digits
export const validateOTP = (otp: string): string | null => {
  if (!otp.trim()) {
    return 'OTP is required';
  }
  if (!/^\d{6}$/.test(otp)) {
    return 'OTP must be 6 digits';
  }
  return null;
};

// Confirm password match
export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): string | null => {
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

// Form-wide validation
export const validateLoginForm = (data: {
  email: string;
  phone: string;
  username?: string;
}): ValidationError => {
  const errors: ValidationError = {};

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;

  if (data.username) {
    const usernameError = validateUsername(data.username);
    if (usernameError) errors.username = usernameError;
  }

  return errors;
};

export const validateRegistrationForm = (data: {
  username: string;
  email: string;
  fullName: string;
  phone: string;
  password: string;
  confirmPassword?: string;
}): ValidationError => {
  const errors: ValidationError = {};

  const usernameError = validateUsername(data.username);
  if (usernameError) errors.username = usernameError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const nameError = validateName(data.fullName);
  if (nameError) errors.fullName = nameError;

  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  if (data.confirmPassword) {
    const matchError = validatePasswordMatch(data.password, data.confirmPassword);
    if (matchError) errors.confirmPassword = matchError;
  }

  return errors;
};

// Check if form has errors
export const hasErrors = (errors: ValidationError): boolean => {
  return Object.keys(errors).length > 0;
};

// Get first error message
export const getFirstError = (errors: ValidationError): string | null => {
  const keys = Object.keys(errors);
  return keys.length > 0 ? errors[keys[0]] : null;
};
