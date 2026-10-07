const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return "Email is required.";
  if (!EMAIL.test(email)) return "Enter a valid email address.";
  return null;
}

export function validateRequired(value: string, label: string): string | null {
  if (!value.trim()) return `${label} is required.`;
  return null;
}

export function validatePassword(value: string, label = "Password"): string | null {
  if (!value) return `${label} is required.`;
  if (value.length < 6) return `${label} must be at least 6 characters.`;
  return null;
}

export function validateCode(value: string): string | null {
  if (!value) return "Enter the 6-digit code.";
  if (!/^\d{6}$/.test(value)) return "Enter the full 6-digit code.";
  return null;
}
