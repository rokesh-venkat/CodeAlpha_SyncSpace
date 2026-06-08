import { useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, Monitor, Crown, Wifi } from "lucide-react";

/**
 * VideoPlayer — renders one participant's video stream.
 *
 * Uses a ref to attach the MediaStream to the <video> element.
 * React cannot manage MediaStream objects as state — they must be
 * attached imperatively via videoEl.srcObject.
 */
export function VideoPlayer({
  stream,
  name,
  isSelf = false,
  isHost = false,
  micOn = true,
  camOn = true,
  isScreenShare = false,
  quality = "good",
  large = false,
}) {
  const videoRef = useRef(null);

  // Attach stream to video element whenever stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Generate avatar initials and color
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const colors = [
    "from-violet-500 to-fuchsia-600",
    "from-sky-500 to-blue-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-pink-500 to-rose-600",
  ];
  const colorIndex = name?.charCodeAt(0) % colors.length || 0;

  const qualityColors = { good: "text-emerald-400", medium: "text-amber-400", poor: "text-red-400" };

  return (
    <div
      className={`
        relative rounded-xl overflow-hidden bg-[#1a1d27] border border-white/10 group
        ${large ? "aspect-video" : "aspect-video"}
        ${!micOn ? "" : ""}
      `}
    >
      {/* Video element */}
      {stream && camOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isSelf} // Always mute self to prevent echo
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        /* Camera off — show avatar */
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1d27]">
          <div
            className={`
              ${large ? "w-20 h-20 text-2xl" : "w-14 h-14 text-lg"}
              rounded-xl bg-gradient-to-br ${colors[colorIndex]}
              flex items-center justify-center text-white font-bold
            `}
          >
            {initials}
          </div>
        </div>
      )}

      {/* Speaking indicator ring */}
      {micOn && (
        <div className="absolute inset-0 ring-2 ring-violet-500/0 group-[.speaking]:ring-violet-500/70 rounded-xl pointer-events-none transition-all" />
      )}

      {/* Screen share badge */}
      {isScreenShare && (
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-violet-600/90 text-white px-2 py-0.5 rounded-md text-[10px] font-medium">
          <Monitor size={10} />
          Screen
        </div>
      )}

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-white truncate max-w-[100px]">
            {isSelf ? "You" : name}
          </span>
          {isHost && <Crown size={9} className="text-amber-400 shrink-0" />}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Connection quality */}
          {!isSelf && quality !== "unknown" && (
            <Wifi size={10} className={qualityColors[quality] || "text-white/40"} />
          )}
          {/* Mic status */}
          {micOn ? (
            <Mic size={11} className="text-white/70" />
          ) : (
            <div className="w-4 h-4 rounded bg-red-500/80 flex items-center justify-center">
              <MicOff size={9} className="text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}