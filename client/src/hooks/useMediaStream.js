import { useState, useEffect, useRef } from "react";
import { mediaService } from "../services/mediaService";

export const useMediaStream = () => {
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const localStreamRef = useRef(localStream);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  const getLocalWebcamAndMicStream = async () => {
    try {
      const stream = await mediaService.getLocalStream(true, true);
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Error getting local webcam and mic stream:", error);
      return null;
    }
  };

  const getScreenShareStream = async () => {
    try {
      const stream = await mediaService.getScreenShareStream();
      setScreenStream(stream);
      return stream;
    } catch (error) {
      console.error("Error getting screen share stream:", error);
      return null;
    }
  };

  const stopLocalStream = () => {
    mediaService.stopLocalStream();
    setLocalStream(null);
  };

  const stopScreenShareStream = () => {
    if (screenStream) {
      mediaService.stopScreenShareStream();
      setScreenStream(null);
    }
  };

  const toggleMic = () => {
    if (localStream) {
      mediaService.toggleAudio(!micOn);
      setMicOn((prev) => !prev);
    }
  };

  const toggleCam = () => {
    if (localStream) {
      mediaService.toggleVideo(!camOn);
      setCamOn((prev) => !prev);
    }
  };

  return {
    localStream,
    screenStream,
    micOn,
    camOn,
    getLocalWebcamAndMicStream,
    getScreenShareStream,
    stopLocalStream,
    stopScreenShareStream,
    toggleMic,
    toggleCam,
  };
};