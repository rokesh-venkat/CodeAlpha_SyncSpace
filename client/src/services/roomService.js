import api from "./api.js";

export async function createRoom({ roomId, title }) {
  const { data } = await api.post("/rooms", { roomId, title });
  return data;
}

export async function getRoomInfo(roomId) {
  const { data } = await api.get(`/rooms/${roomId}`);
  return data;
}

export async function getUserRooms() {
  const { data } = await api.get("/rooms");
  return data;
}