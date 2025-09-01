export function isEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

export function isPhone(val) {
  return /^\+?\d{10,13}$/.test(val);
}
