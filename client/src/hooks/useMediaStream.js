import { useState, useEffect, useRef } from "react";
import * as mediaService from "../services/mediaService.js";

/**
 * useMediaStream — acquires and manages local camera/mic stream.
 * Used in MeetingPreview page before joining.
 */
export function useMediaStream({ video = true, audio = true } = {}) {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const streamRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const acquire = async () => {
      try {
        setLoading(true);
        const s = await mediaService.getUserMedia(video, audio);
        if (!cancelled) { streamRef.current = s; setStream(s); }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    acquire();

    return () => {
      cancelled = true;
      // Stop preview stream on unmount — useWebRTC will re-acquire for the call
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { stream, error, loading };
}