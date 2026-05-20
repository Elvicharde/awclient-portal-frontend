export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function looks_like_email(value: string): boolean {
  if (!value) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function is_four_digits(value: string): boolean {
  if (!value) {
    return true;
  }

  return /^\d{4}$/.test(value);
}
