export function noop() {}

export function generateRoomId() {
  const seg = () => Math.random().toString(36).slice(2, 5);
  return `${seg()}-${seg()}`;
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function avatarColor(name = "") {
  const colors = [
    "from-violet-500 to-fuchsia-600",
    "from-sky-500 to-blue-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-pink-500 to-rose-600",
  ];
  return colors[(name.charCodeAt(0) || 0) % colors.length];
}

export function truncate(str, len = 40) {
  return str.length > len ? str.slice(0, len) + "…" : str;
}

export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}