class MediaService {
  constructor() {
    this.localStream = null;
    this.screenStream = null;
  }

  async getLocalStream(audio = true, video = true) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: audio,
        video: video,
      });
      return this.localStream;
    } catch (error) {
      console.error("Error getting user media:", error);
      throw error;
    }
  }

  async getScreenShareStream() {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      return this.screenStream;
    } catch (error) {
      console.error("Error getting screen share stream:", error);
      throw error;
    }
  }

  stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
  }

  stopScreenShareStream() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;
    }
  }

  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => (track.enabled = enabled));
    }
  }

  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => (track.enabled = enabled));
    }
  }
}

export const mediaService = new MediaService();