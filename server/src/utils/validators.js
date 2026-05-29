export function isValidEmail(value) {
  return typeof value === 'string' && value.includes('@');
}