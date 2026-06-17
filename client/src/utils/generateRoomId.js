/**
 * generateRoomId — creates a unique room ID in the format "abc-123"
 */
export function generateRoomId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const seg = (len) =>
    Array.from({ length: len }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  return `${seg(3)}-${seg(3)}`;
}

export default generateRoomId;