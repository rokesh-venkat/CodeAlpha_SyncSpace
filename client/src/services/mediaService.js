/**
 * mediaService — manages local media streams (camera, microphone, screen share).
 *
 * All getUserMedia calls are centralised here so components never call
 * navigator.mediaDevices directly. This makes error handling and cleanup
 * consistent across the app.
 */

// ── STUN servers for ICE gathering ─────────────────────────────────────
export const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

// ── Get camera + microphone stream ─────────────────────────────────────
export const getUserMedia = async (constraints = { video: true, audio: true }) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return { stream, error: null };
  } catch (err) {
    let message = "Failed to access camera/microphone";

    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      message = "Camera/microphone permission denied. Please allow access in browser settings.";
    } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
      message = "No camera or microphone found on this device.";
    } else if (err.name === "NotReadableError") {
      message = "Camera or microphone is already in use by another app.";
    } else if (err.name === "OverconstrainedError") {
      message = "Camera does not support the requested settings.";
    }

    console.error("[MediaService] getUserMedia error:", err.name, message);
    return { stream: null, error: message };
  }
};

// ── Audio only ─────────────────────────────────────────────────────────
export const getAudioStream = async () => {
  return getUserMedia({ video: false, audio: true });
};

// ── Get screen share stream ─────────────────────────────────────────────
export const getDisplayMedia = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: "always" },
      audio: true,
    });
    return { stream, error: null };
  } catch (err) {
    if (err.name === "NotAllowedError") {
      return { stream: null, error: "Screen sharing permission denied." };
    }
    console.error("[MediaService] getDisplayMedia error:", err);
    return { stream: null, error: "Failed to start screen sharing." };
  }
};

// ── Stop all tracks in a stream ────────────────────────────────────────
export const stopStream = (stream) => {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    track.stop();
    console.log(`[MediaService] Stopped track: ${track.kind}`);
  });
};

// ── Replace a track in all peer connections ────────────────────────────
export const replaceTrack = async (peerConnections, newTrack, kind) => {
  for (const pc of Object.values(peerConnections)) {
    const sender = pc.getSenders().find((s) => s.track?.kind === kind);
    if (sender) {
      try {
        await sender.replaceTrack(newTrack);
      } catch (err) {
        console.error("[MediaService] replaceTrack error:", err);
      }
    }
  }
};

// ── Toggle audio track ─────────────────────────────────────────────────
export const toggleAudio = (stream, enabled) => {
  if (!stream) return;
  stream.getAudioTracks().forEach((track) => {
    track.enabled = enabled;
  });
};

// ── Toggle video track ─────────────────────────────────────────────────
export const toggleVideo = (stream, enabled) => {
  if (!stream) return;
  stream.getVideoTracks().forEach((track) => {
    track.enabled = enabled;
  });
};

// ── Check media permissions ─────────────────────────────────────────────
export const checkPermissions = async () => {
  try {
    const camera = await navigator.permissions.query({ name: "camera" });
    const mic = await navigator.permissions.query({ name: "microphone" });
    return {
      camera: camera.state,  // "granted" | "denied" | "prompt"
      microphone: mic.state,
    };
  } catch {
    return { camera: "unknown", microphone: "unknown" };
  }
};