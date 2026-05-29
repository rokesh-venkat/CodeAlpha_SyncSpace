export function isValidRoomId(roomId) {
  return typeof roomId === 'string' && roomId.length > 0;
}