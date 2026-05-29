export function asyncHandler(fn) {
  return (...args) => Promise.resolve(fn(...args)).catch(args[2]);
}