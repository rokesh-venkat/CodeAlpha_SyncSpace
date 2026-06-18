import { useEffect, useRef } from "react";
import { Monitor, X } from "lucide-react";

export function ScreenShare({ stream, sharerName, onStop, isSelf = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) return null;

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-contain"
      />

      <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg text-white text-xs font-medium">
        <Monitor size={12} className="text-violet-400" />
        <span>{isSelf ? "You are" : `${sharerName} is`} sharing screen</span>
      </div>

      {isSelf && onStop && (
        <button
          onClick={onStop}
          className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-500/90 hover:bg-red-400 px-2.5 py-1 rounded-lg text-white text-xs font-medium transition-colors"
        >
          <X size={11} />
          Stop Sharing
        </button>
      )}
    </div>
  );
}

export default ScreenShare;
