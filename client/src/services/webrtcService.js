const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export function createPeerConnection({ remoteSocketId, localStream, onTrack, onIceCandidate, onConnectionStateChange }) {
  const pc = new RTCPeerConnection(ICE_SERVERS);

  if (localStream) {
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
  }

  pc.onicecandidate = (event) => {
    if (event.candidate) onIceCandidate(remoteSocketId, event.candidate);
  };

  pc.ontrack = (event) => {
    if (event.streams?.[0]) onTrack(remoteSocketId, event.streams[0]);
  };

  pc.onconnectionstatechange = () => {
    onConnectionStateChange?.(remoteSocketId, pc.connectionState);
  };

  return pc;
}

export async function createOffer(pc) {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  return pc.localDescription;
}

export async function createAnswer(pc, offer) {
  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  return pc.localDescription;
}

export async function setRemoteAnswer(pc, answer) {
  await pc.setRemoteDescription(new RTCSessionDescription(answer));
}

export async function addIceCandidate(pc, candidate) {
  try {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (err) {
    console.warn("[WebRTC] addIceCandidate error:", err.message);
  }
}

export function closePeerConnection(pc) {
  if (!pc) return;
  pc.onicecandidate = null;
  pc.ontrack = null;
  pc.onconnectionstatechange = null;
  pc.close();
}

export async function getConnectionQuality(pc) {
  try {
    const stats = await pc.getStats();
    let rtt = null;
    stats.forEach((report) => {
      if (report.type === "candidate-pair" && report.state === "succeeded") {
        rtt = report.currentRoundTripTime;
      }
    });
    if (rtt === null) return "good";
    if (rtt < 0.1) return "good";
    if (rtt < 0.3) return "medium";
    return "poor";
  } catch {
    return "unknown";
  }
}
