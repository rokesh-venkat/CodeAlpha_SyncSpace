export async function getUserMedia(audio = true, video = true) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio, video });
    return { stream, error: null };
  } catch (err) {
    const msg =
      err.name === "NotAllowedError" ? "Camera/microphone permission denied." :
      err.name === "NotFoundError"   ? "No camera or microphone found." :
      err.name === "NotReadableError"? "Camera or microphone is in use by another app." :
      "Could not access camera/microphone.";
    return { stream: null, error: msg };
  }
}

export async function getAudioStream() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    return { stream, error: null };
  } catch (err) {
    return { stream: null, error: err.message };
  }
}

export async function getDisplayMedia() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    return { stream, error: null };
  } catch (err) {
    if (err.name === "NotAllowedError") return { stream: null, error: "Screen share was cancelled." };
    return { stream: null, error: err.message };
  }
}

export function stopStream(stream) {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
}

export function toggleAudio(stream, enabled) {
  if (!stream) return;
  stream.getAudioTracks().forEach((track) => { track.enabled = enabled; });
}

export function toggleVideo(stream, enabled) {
  if (!stream) return;
  stream.getVideoTracks().forEach((track) => { track.enabled = enabled; });
}

export async function replaceTrack(peers, newTrack, kind) {
  const promises = Object.values(peers).map(async (pc) => {
    const sender = pc.getSenders().find((s) => s.track?.kind === kind);
    if (sender) {
      await sender.replaceTrack(newTrack);
    }
  });
  await Promise.all(promises);
}
