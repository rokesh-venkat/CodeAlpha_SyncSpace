import { ICE_SERVERS } from "./mediaService.js";
import { SOCKET_EVENTS } from "../utils/socketEvents.js";

/**
 * webrtcService — manages RTCPeerConnection instances.
 *
 * Mesh topology: one RTCPeerConnection per remote peer.
 * peerConnections Map: socketId → { pc: RTCPeerConnection, stream: MediaStream }
 *
 * Usage flow:
 * 1. User joins room → socket emits room:joined with existing participants
 * 2. For each existing participant, we create an RTCPeerConnection and send an offer
 * 3. New participant receives webrtc:user-joined → they send offers to existing peers
 * 4. ICE candidates are exchanged via the server relay
 * 5. On track received → update remote streams state in the component
 */

class WebRTCService {
  constructor() {
    this.peerConnections = new Map(); // socketId → RTCPeerConnection
    this.localStream = null;
    this.onRemoteStream = null;       // callback(socketId, stream, userInfo)
    this.onPeerDisconnected = null;   // callback(socketId)
    this.socket = null;
  }

  /**
   * init — must be called once per meeting session.
   */
  init(socket, localStream, onRemoteStream, onPeerDisconnected) {
    this.socket = socket;
    this.localStream = localStream;
    this.onRemoteStream = onRemoteStream;
    this.onPeerDisconnected = onPeerDisconnected;
    this._registerSocketListeners();
  }

  /**
   * createPeerConnection — creates an RTCPeerConnection for a specific peer.
   */
  createPeerConnection(targetSocketId, userInfo) {
    if (this.peerConnections.has(targetSocketId)) {
      return this.peerConnections.get(targetSocketId);
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add all local tracks to this connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream);
      });
    }

    // ICE candidate handler — relay via server
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        this.socket.emit(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, {
          candidate, targetSocketId,
        });
      }
    };

    // Remote track received — build remote stream and notify component
    const remoteStream = new MediaStream();
    pc.ontrack = ({ track }) => {
      remoteStream.addTrack(track);
      this.onRemoteStream?.(targetSocketId, remoteStream, userInfo);
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] ${targetSocketId} state: ${pc.connectionState}`);
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        this.closePeer(targetSocketId);
        this.onPeerDisconnected?.(targetSocketId);
      }
    };

    this.peerConnections.set(targetSocketId, pc);
    return pc;
  }

  /**
   * initiateOffer — called by the existing participant when a new user joins.
   */
  async initiateOffer(targetSocketId, userInfo) {
    const pc = this.createPeerConnection(targetSocketId, userInfo);
    try {
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await pc.setLocalDescription(offer);
      this.socket.emit(SOCKET_EVENTS.WEBRTC_OFFER, { offer, targetSocketId });
    } catch (err) {
      console.error("[WebRTC] offer error:", err.message);
    }
  }

  /**
   * handleOffer — called when we receive an offer from a peer.
   */
  async handleOffer(offer, fromSocketId, fromUser) {
    const pc = this.createPeerConnection(fromSocketId, fromUser);
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.socket.emit(SOCKET_EVENTS.WEBRTC_ANSWER, { answer, targetSocketId: fromSocketId });
    } catch (err) {
      console.error("[WebRTC] answer error:", err.message);
    }
  }

  /**
   * handleAnswer — called when we receive an answer to our offer.
   */
  async handleAnswer(answer, fromSocketId) {
    const pc = this.peerConnections.get(fromSocketId);
    if (!pc) return;
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (err) {
      console.error("[WebRTC] set answer error:", err.message);
    }
  }

  /**
   * handleIceCandidate — adds an ICE candidate received from a peer.
   */
  async handleIceCandidate(candidate, fromSocketId) {
    const pc = this.peerConnections.get(fromSocketId);
    if (!pc) return;
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("[WebRTC] ICE candidate error:", err.message);
    }
  }

  /**
   * replaceVideoTrack — swaps the video track on all connections (for screen share).
   */
  async replaceVideoTrack(newTrack) {
    for (const pc of this.peerConnections.values()) {
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender) await sender.replaceTrack(newTrack);
    }
  }

  /**
   * closePeer — closes and removes a single peer connection.
   */
  closePeer(socketId) {
    const pc = this.peerConnections.get(socketId);
    if (pc) { pc.close(); this.peerConnections.delete(socketId); }
  }

  /**
   * closeAll — called on room leave. Closes all peer connections.
   */
  closeAll() {
    for (const [id] of this.peerConnections) this.closePeer(id);
    this._removeSocketListeners();
    this.socket = null;
    this.localStream = null;
  }

  /**
   * getPeerConnections — returns the peer connections Map for media manipulation.
   */
  getPeerConnections() {
    return this.peerConnections;
  }

  // ── Private: socket listener registration ──────────────────────────────
  _registerSocketListeners() {
    this._offerHandler = ({ offer, fromSocketId, fromUser }) => this.handleOffer(offer, fromSocketId, fromUser);
    this._answerHandler = ({ answer, fromSocketId }) => this.handleAnswer(answer, fromSocketId);
    this._iceHandler = ({ candidate, fromSocketId }) => this.handleIceCandidate(candidate, fromSocketId);

    this.socket.on(SOCKET_EVENTS.WEBRTC_OFFER, this._offerHandler);
    this.socket.on(SOCKET_EVENTS.WEBRTC_ANSWER, this._answerHandler);
    this.socket.on(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, this._iceHandler);
  }

  _removeSocketListeners() {
    if (!this.socket) return;
    this.socket.off(SOCKET_EVENTS.WEBRTC_OFFER, this._offerHandler);
    this.socket.off(SOCKET_EVENTS.WEBRTC_ANSWER, this._answerHandler);
    this.socket.off(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, this._iceHandler);
  }
}

// Singleton — one instance for the app lifetime
const webrtcService = new WebRTCService();
export default webrtcService;