import { SOCKET_EVENTS } from "../utils/socketEvents.js";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

class WebRTCService {
  constructor(socket) {
    this.socket = socket;
    this.peerConnections = {};
    this.localStream = null;
    this.remoteStreams = {};
    this.onAddStream = null;
    this.onRemoveStream = null;
  }

  setLocalStream(stream) {
    this.localStream = stream;
  }

  async createPeerConnection(partnerSocketId, isInitiator) {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    this.peerConnections[partnerSocketId] = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, {
          candidate: event.candidate,
          targetSocketId: partnerSocketId,
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStreams[partnerSocketId] = event.streams[0];
        if (this.onAddStream) {
          this.onAddStream(partnerSocketId, event.streams[0]);
        }
      }
    };

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream);
      });
    }

    if (isInitiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        this.socket.emit(SOCKET_EVENTS.WEBRTC_OFFER, {
          offer: pc.localDescription,
          targetSocketId: partnerSocketId,
        });
      } catch (error) {
        console.error("Error creating offer:", error);
      }
    }
    return pc;
  }

  async handleOffer(offer, fromSocketId) {
    const pc = await this.createPeerConnection(fromSocketId, false);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    this.socket.emit(SOCKET_EVENTS.WEBRTC_ANSWER, {
      answer: pc.localDescription,
      targetSocketId: fromSocketId,
    });
  }

  async handleAnswer(answer, fromSocketId) {
    const pc = this.peerConnections[fromSocketId];
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  async handleIceCandidate(candidate, fromSocketId) {
    const pc = this.peerConnections[fromSocketId];
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  closePeerConnection(partnerSocketId) {
    const pc = this.peerConnections[partnerSocketId];
    if (pc) {
      pc.close();
      delete this.peerConnections[partnerSocketId];
      delete this.remoteStreams[partnerSocketId];
      if (this.onRemoveStream) {
        this.onRemoveStream(partnerSocketId);
      }
    }
  }

  closeAllPeerConnections() {
    for (const socketId in this.peerConnections) {
      this.closePeerConnection(socketId);
    }
    this.peerConnections = {};
    this.remoteStreams = {};
  }

  addTrackToAllPeers(track, stream) {
    for (const socketId in this.peerConnections) {
      this.peerConnections[socketId].addTrack(track, stream);
    }
  }

  removeTrackFromAllPeers(track) {
    for (const socketId in this.peerConnections) {
      const sender = this.peerConnections[socketId].getSenders().find(s => s.track === track);
      if (sender) {
        this.peerConnections[socketId].removeTrack(sender);
      }
    }
  }

  replaceTrackInAllPeers(oldTrack, newTrack, stream) {
    for (const socketId in this.peerConnections) {
      const sender = this.peerConnections[socketId].getSenders().find(s => s.track === oldTrack);
      if (sender) {
        sender.replaceTrack(newTrack);
      } else if (newTrack) {
        this.peerConnections[socketId].addTrack(newTrack, stream);
      }
    }
  }
}

export default WebRTCService;