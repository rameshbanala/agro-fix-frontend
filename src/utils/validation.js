const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-\s()]{7,20}$/;

export function validateEmail(email) {
  if (!email) return "Email is required";
  if (!EMAIL_RE.test(email)) return "Enter a valid email address";
  return "";
}

export function validatePassword(password) {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  return "";
}

export function validateName(name) {
  if (!name || !name.trim()) return "Name is required";
  if (name.trim().length < 2) return "Name is too short";
  return "";
}

export function validateContact(contact) {
  if (!contact) return "Contact number is required";
  if (!PHONE_RE.test(contact)) return "Enter a valid contact number";
  return "";
}
