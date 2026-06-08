import { Mic, MicOff, Video, VideoOff, ScreenShare, PhoneOff, MessageSquare, Users, MoreHorizontal, Hand, Circle, MonitorOff } from "lucide-react";

/**
 * MeetingControls — the bottom control bar of the meeting room.
 * All state is lifted to MeetingRoom.jsx.
 */
export function MeetingControls({
  audioEnabled, videoEnabled, isSharing, handRaised, recording,
  onToggleAudio, onToggleVideo, onStartShare, onStopShare,
  onToggleHand, onToggleRecord, onLeave,
  onToggleChat, onToggleParticipants, chatOpen, participantsOpen,
  unreadCount = 0, participantCount = 0,
}) {
  return (
    <div className="h-16 flex items-center justify-between px-4 md:px-6 shrink-0 border-t border-white/5 bg-[#0d0f14]">

      {/* Left — record */}
      <button
        onClick={onToggleRecord}
        className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
          recording ? "bg-red-500/20 text-red-400" : "hover:bg-white/10 text-white/50 hover:text-white"
        }`}
      >
        <Circle size={10} className={recording ? "fill-red-400 animate-pulse" : ""} />
        <span className="hidden md:block">{recording ? "Recording" : "Record"}</span>
      </button>

      {/* Center — main controls */}
      <div className="flex items-center gap-2 mx-auto">
        {/* Mic */}
        <button
          onClick={onToggleAudio}
          title={audioEnabled ? "Mute" : "Unmute"}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${
            audioEnabled ? "bg-white/10 hover:bg-white/15 text-white" : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          {audioEnabled ? <Mic size={18} /> : <MicOff size={18} />}
        </button>

        {/* Camera */}
        <button
          onClick={onToggleVideo}
          title={videoEnabled ? "Stop camera" : "Start camera"}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${
            videoEnabled ? "bg-white/10 hover:bg-white/15 text-white" : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          {videoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
        </button>

        {/* Screen share */}
        <button
          onClick={isSharing ? onStopShare : onStartShare}
          title={isSharing ? "Stop sharing" : "Share screen"}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${
            isSharing ? "bg-violet-600 hover:bg-violet-700 text-white" : "bg-white/10 hover:bg-white/15 text-white/70 hover:text-white"
          }`}
        >
          {isSharing ? <MonitorOff size={18} /> : <ScreenShare size={18} />}
        </button>

        {/* Hand raise */}
        <button
          onClick={onToggleHand}
          title={handRaised ? "Lower hand" : "Raise hand"}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${
            handRaised ? "bg-amber-500/80 text-white" : "bg-white/10 hover:bg-white/15 text-white/70 hover:text-white"
          }`}
        >
          <Hand size={18} />
        </button>

        {/* Leave */}
        <button
          onClick={onLeave}
          title="Leave meeting"
          className="w-11 h-11 rounded-2xl bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-all active:scale-90 ml-1"
        >
          <PhoneOff size={18} />
        </button>
      </div>

      {/* Right — panels */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleChat}
          className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            chatOpen ? "bg-white/15 text-white" : "hover:bg-white/10 text-white/50 hover:text-white"
          }`}
        >
          <MessageSquare size={14} />
          <span className="hidden sm:block">Chat</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 text-white text-[9px] rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={onToggleParticipants}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            participantsOpen ? "bg-white/15 text-white" : "hover:bg-white/10 text-white/50 hover:text-white"
          }`}
        >
          <Users size={14} />
          <span className="hidden sm:block">{participantCount}</span>
        </button>
      </div>
    </div>
  );
}