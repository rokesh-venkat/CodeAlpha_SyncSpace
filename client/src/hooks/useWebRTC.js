import { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "./useSocket.js";
import { useAuth } from "../context/AuthContext.jsx";
import { SOCKET_EVENTS } from "../utils/socketEvents.js";
import * as mediaService from "../services/mediaService.js";
import * as webrtcService from "../services/webrtcService.js";

/**
 * useWebRTC — manages the full WebRTC lifecycle for a meeting room.
 *
 * State:
 * - localStream: our camera/mic MediaStream
 * - remoteStreams: { socketId: { stream, userId, name } }
 * - peers: { socketId: RTCPeerConnection }
 * - micOn, camOn, sharing: local media state
 * - connectionQualities: { socketId: "good"|"medium"|"poor" }
 * - mediaError: string | null
 *
 * The hook is self-contained — components only interact with the
 * returned actions (toggleMic, toggleCam, startScreenShare, etc.)
 */
const useWebRTC = (roomId) => {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [mediaError, setMediaError] = useState(null);
  const [connectionQualities, setConnectionQualities] = useState({});
  const [screenStream, setScreenStream] = useState(null);

  // Refs for mutable objects that don't trigger re-renders
  const peersRef = useRef({}); // { socketId: RTCPeerConnection }
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  // ── Start local media ────────────────────────────────────────────────
  const startLocalStream = useCallback(async () => {
    const { stream, error } = await mediaService.getUserMedia();
    if (error) {
      setMediaError(error);
      // Try audio only as fallback
      const audioResult = await mediaService.getAudioStream();
      if (audioResult.stream) {
        setLocalStream(audioResult.stream);
        localStreamRef.current = audioResult.stream;
        setCamOn(false);
      }
      return null;
    }
    setLocalStream(stream);
    localStreamRef.current = stream;
    return stream;
  }, []);

  // ── Create peer connection for a remote peer ────────────────────────
  const createPeer = useCallback(
    (remoteSocketId, remoteUserId, remoteName) => {
      if (peersRef.current[remoteSocketId]) return peersRef.current[remoteSocketId];

      const pc = webrtcService.createPeerConnection({
        remoteSocketId,
        localStream: localStreamRef.current,
        onTrack: (socketId, stream) => {
          setRemoteStreams((prev) => ({
            ...prev,
            [socketId]: { stream, userId: remoteUserId, name: remoteName },
          }));
        },
        onIceCandidate: (socketId, candidate) => {
          socket?.emit(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, {
            candidate,
            targetSocketId: socketId,
          });
        },
        onConnectionStateChange: async (socketId, state) => {
          if (state === "connected") {
            const quality = await webrtcService.getConnectionQuality(pc);
            setConnectionQualities((prev) => ({ ...prev, [socketId]: quality }));
          }
          if (state === "failed" || state === "disconnected") {
            handlePeerDisconnect(socketId);
          }
        },
      });

      peersRef.current[remoteSocketId] = pc;
      return pc;
    },
    [socket]
  );

  // ── Handle new remote peer joining ──────────────────────────────────
  const handleUserJoined = useCallback(
    async ({ userId, name, socketId: remoteSocketId }) => {
      if (remoteSocketId === socket?.id) return;

      console.log(`[WebRTC] New peer joined: ${name} (${remoteSocketId})`);
      const pc = createPeer(remoteSocketId, userId, name);

      try {
        const offer = await webrtcService.createOffer(pc);
        socket?.emit(SOCKET_EVENTS.WEBRTC_OFFER, { offer, targetSocketId: remoteSocketId });
      } catch (err) {
        console.error("[WebRTC] createOffer error:", err);
      }
    },
    [socket, createPeer]
  );

  // ── Handle incoming offer ───────────────────────────────────────────
  const handleOffer = useCallback(
    async ({ offer, fromSocketId, fromUserId, fromName }) => {
      console.log(`[WebRTC] Received offer from ${fromName}`);
      const pc = createPeer(fromSocketId, fromUserId, fromName);

      try {
        const answer = await webrtcService.createAnswer(pc, offer);
        socket?.emit(SOCKET_EVENTS.WEBRTC_ANSWER, { answer, targetSocketId: fromSocketId });
      } catch (err) {
        console.error("[WebRTC] createAnswer error:", err);
      }
    },
    [socket, createPeer]
  );

  // ── Handle incoming answer ──────────────────────────────────────────
  const handleAnswer = useCallback(async ({ answer, fromSocketId }) => {
    const pc = peersRef.current[fromSocketId];
    if (!pc) return;
    try {
      await webrtcService.setRemoteAnswer(pc, answer);
    } catch (err) {
      console.error("[WebRTC] setRemoteAnswer error:", err);
    }
  }, []);

  // ── Handle incoming ICE candidate ───────────────────────────────────
  const handleIceCandidate = useCallback(async ({ candidate, fromSocketId }) => {
    const pc = peersRef.current[fromSocketId];
    if (!pc) return;
    await webrtcService.addIceCandidate(pc, candidate);
  }, []);

  // ── Handle peer disconnect ──────────────────────────────────────────
  const handlePeerDisconnect = useCallback(({ userId, socketId: remoteSocketId }) => {
    const pc = peersRef.current[remoteSocketId];
    if (pc) {
      webrtcService.closePeerConnection(pc);
      delete peersRef.current[remoteSocketId];
    }
    setRemoteStreams((prev) => {
      const next = { ...prev };
      delete next[remoteSocketId];
      return next;
    });
    setConnectionQualities((prev) => {
      const next = { ...prev };
      delete next[remoteSocketId];
      return next;
    });
  }, []);

  // ── Register socket listeners ───────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    socket.on(SOCKET_EVENTS.WEBRTC_USER_JOINED, handleUserJoined);
    socket.on(SOCKET_EVENTS.WEBRTC_OFFER, handleOffer);
    socket.on(SOCKET_EVENTS.WEBRTC_ANSWER, handleAnswer);
    socket.on(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, handleIceCandidate);
    socket.on(SOCKET_EVENTS.WEBRTC_USER_LEFT, handlePeerDisconnect);

    return () => {
      socket.off(SOCKET_EVENTS.WEBRTC_USER_JOINED, handleUserJoined);
      socket.off(SOCKET_EVENTS.WEBRTC_OFFER, handleOffer);
      socket.off(SOCKET_EVENTS.WEBRTC_ANSWER, handleAnswer);
      socket.off(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, handleIceCandidate);
      socket.off(SOCKET_EVENTS.WEBRTC_USER_LEFT, handlePeerDisconnect);
    };
  }, [socket, handleUserJoined, handleOffer, handleAnswer, handleIceCandidate, handlePeerDisconnect]);

  // ── Cleanup on unmount ──────────────────────────────────────────────
  useEffect(() => {
    return () => {
      Object.values(peersRef.current).forEach(webrtcService.closePeerConnection);
      peersRef.current = {};
      mediaService.stopStream(localStreamRef.current);
      mediaService.stopStream(screenStreamRef.current);
    };
  }, []);

  // ── Toggle microphone ───────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    const newState = !micOn;
    mediaService.toggleAudio(localStreamRef.current, newState);
    setMicOn(newState);
    socket?.emit(newState ? SOCKET_EVENTS.WEBRTC_UNMUTE : SOCKET_EVENTS.WEBRTC_MUTE, { roomId });
  }, [micOn, socket, roomId]);

  // ── Toggle camera ───────────────────────────────────────────────────
  const toggleCam = useCallback(() => {
    const newState = !camOn;
    mediaService.toggleVideo(localStreamRef.current, newState);
    setCamOn(newState);
    socket?.emit(newState ? SOCKET_EVENTS.WEBRTC_CAM_ON : SOCKET_EVENTS.WEBRTC_CAM_OFF, { roomId });
  }, [camOn, socket, roomId]);

  // ── Start screen share ──────────────────────────────────────────────
  const startScreenShare = useCallback(async () => {
    const { stream: sStream, error } = await mediaService.getDisplayMedia();
    if (error) { setMediaError(error); return; }

    screenStreamRef.current = sStream;
    setScreenStream(sStream);
    setSharing(true);

    // Replace video track in all peer connections
    const videoTrack = sStream.getVideoTracks()[0];
    await mediaService.replaceTrack(peersRef.current, videoTrack, "video");

    socket?.emit(SOCKET_EVENTS.WEBRTC_SCREEN_SHARE_START, { roomId });

    // Auto-stop when user clicks browser's "Stop sharing" button
    videoTrack.onended = () => stopScreenShare();
  }, [socket, roomId]);

  // ── Stop screen share ───────────────────────────────────────────────
  const stopScreenShare = useCallback(async () => {
    mediaService.stopStream(screenStreamRef.current);
    screenStreamRef.current = null;
    setScreenStream(null);
    setSharing(false);

    // Restore camera track
    const camTrack = localStreamRef.current?.getVideoTracks()[0];
    if (camTrack) {
      await mediaService.replaceTrack(peersRef.current, camTrack, "video");
    }

    socket?.emit(SOCKET_EVENTS.WEBRTC_SCREEN_SHARE_STOP, { roomId });
  }, [socket, roomId]);

  return {
    localStream,
    remoteStreams,
    micOn,
    camOn,
    sharing,
    mediaError,
    connectionQualities,
    screenStream,
    startLocalStream,
    toggleMic,
    toggleCam,
    startScreenShare,
    stopScreenShare,
    peers: peersRef.current,
  };
};

export default useWebRTC;