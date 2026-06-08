import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket.js";
import { useAuth } from "../context/AuthContext.jsx";
import useWebRTC from "../hooks/useWebRTC.js";
import { SOCKET_EVENTS } from "../utils/socketEvents.js";
import { VideoGrid } from "../components/meeting/VideoGrid.jsx";
import { MeetingControls } from "../components/meeting/MeetingControls.jsx";
import { ParticipantList } from "../components/meeting/ParticipantList.jsx";
import { RoomHeader } from "../components/meeting/RoomHeader.jsx";
import { ChatPanel } from "../components/chat/ChatPanel.jsx";

export default function MeetingRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, connected, joinRoom, leaveRoom } = useSocket();

  // ── WebRTC ─────────────────────────────────────────────────────────
  const {
    localStream, remoteStreams, micOn, camOn, sharing,
    mediaError, connectionQualities, screenStream,
    startLocalStream, toggleMic, toggleCam,
    startScreenShare, stopScreenShare,
  } = useWebRTC(roomId);

  // ── Room state ─────────────────────────────────────────────────────
  const [participants, setParticipants] = useState([]);
  const [roomJoined, setRoomJoined] = useState(false);
  const [panel, setPanel] = useState("chat");
  const [handRaised, setHandRaised] = useState(false);
  const [recording, setRecording] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mediaStarted, setMediaStarted] = useState(false);

  // ── Start local media then join room ────────────────────────────────
  useEffect(() => {
    const init = async () => {
      await startLocalStream();
      setMediaStarted(true);
    };
    init();
  }, []);

  // ── Join socket room when media + socket both ready ─────────────────
  useEffect(() => {
    if (!socket || !connected || !roomId || !mediaStarted) return;
    joinRoom(roomId);
  }, [socket, connected, roomId, mediaStarted, joinRoom]);

  // ── Socket room event listeners ─────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onJoined = ({ participants: p }) => {
      setParticipants(p);
      setRoomJoined(true);
    };
    const onUserJoined = ({ participants: p }) => setParticipants(p);
    const onUserLeft = ({ participants: p }) => setParticipants(p);

    // Update participant media state from socket events
    const onMute = ({ userId }) => updateParticipantMedia(userId, { micOn: false });
    const onUnmute = ({ userId }) => updateParticipantMedia(userId, { micOn: true });
    const onCamOff = ({ userId }) => updateParticipantMedia(userId, { camOn: false });
    const onCamOn = ({ userId }) => updateParticipantMedia(userId, { camOn: true });

    socket.on(SOCKET_EVENTS.ROOM_JOINED, onJoined);
    socket.on(SOCKET_EVENTS.ROOM_USER_JOINED, onUserJoined);
    socket.on(SOCKET_EVENTS.ROOM_USER_LEFT, onUserLeft);
    socket.on(SOCKET_EVENTS.WEBRTC_MUTE, onMute);
    socket.on(SOCKET_EVENTS.WEBRTC_UNMUTE, onUnmute);
    socket.on(SOCKET_EVENTS.WEBRTC_CAM_OFF, onCamOff);
    socket.on(SOCKET_EVENTS.WEBRTC_CAM_ON, onCamOn);

    return () => {
      socket.off(SOCKET_EVENTS.ROOM_JOINED, onJoined);
      socket.off(SOCKET_EVENTS.ROOM_USER_JOINED, onUserJoined);
      socket.off(SOCKET_EVENTS.ROOM_USER_LEFT, onUserLeft);
      socket.off(SOCKET_EVENTS.WEBRTC_MUTE, onMute);
      socket.off(SOCKET_EVENTS.WEBRTC_UNMUTE, onUnmute);
      socket.off(SOCKET_EVENTS.WEBRTC_CAM_OFF, onCamOff);
      socket.off(SOCKET_EVENTS.WEBRTC_CAM_ON, onCamOn);
    };
  }, [socket]);

  const updateParticipantMedia = (userId, update) => {
    setParticipants((prev) =>
      prev.map((p) => p._id === userId ? { ...p, ...update } : p)
    );
  };

  // ── Track unread chat when panel closed ────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const onReceive = () => { if (panel !== "chat") setUnreadCount((c) => c + 1); };
    socket.on(SOCKET_EVENTS.CHAT_RECEIVE, onReceive);
    return () => socket.off(SOCKET_EVENTS.CHAT_RECEIVE, onReceive);
  }, [socket, panel]);

  useEffect(() => {
    if (panel === "chat") setUnreadCount(0);
  }, [panel]);

  // ── Leave meeting ──────────────────────────────────────────────────
  const handleLeave = () => {
    leaveRoom(roomId);
    navigate("/");
  };

  const togglePanel = (p) => setPanel((cur) => (cur === p ? null : p));
  const handleToggleShare = () => sharing ? stopScreenShare() : startScreenShare();

  // ── Media error overlay ────────────────────────────────────────────
  if (mediaError && !localStream) {
    return (
      <div className="fixed inset-0 bg-[#0d0f14] flex items-center justify-center p-5">
        <div className="max-w-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
            <span className="text-3xl">🎥</span>
          </div>
          <h2 className="text-white font-semibold">Media Access Required</h2>
          <p className="text-white/60 text-sm">{mediaError}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={startLocalStream}
              className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm hover:bg-violet-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0d0f14] flex flex-col overflow-hidden">

      {/* Top bar */}
      <RoomHeader
        roomId={roomId}
        participantCount={participants.length}
        recording={recording}
      />

      {/* Main content */}
      <div className="flex-1 flex min-h-0">

        {/* Video area */}
        <div className="flex-1 p-2 md:p-3 overflow-hidden relative">
          {!roomJoined ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-white/60 text-sm">
                  {connected ? "Joining room..." : "Connecting to server..."}
                </p>
              </div>
            </div>
          ) : (
            <VideoGrid
              localStream={localStream}
              remoteStreams={remoteStreams}
              participants={participants}
              currentUser={user}
              connectionQualities={connectionQualities}
              sharing={sharing}
              screenStream={screenStream}
            />
          )}
        </div>

        {/* Side panel */}
        {panel && (
          <div className="w-72 shrink-0 border-l border-white/5 bg-[#13151c] flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-white/5 shrink-0">
              {["chat", "participants"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPanel(p)}
                  className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
                    panel === p ? "text-white border-b-2 border-violet-500" : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {p === "participants" ? `People (${participants.length})` : "Chat"}
                </button>
              ))}
            </div>

            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {panel === "chat" && <ChatPanel roomId={roomId} />}
              {panel === "participants" && (
                <div className="flex-1 overflow-y-auto p-3">
                  <ParticipantList participants={participants} currentUserId={user?._id} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <MeetingControls
        micOn={micOn}
        camOn={camOn}
        sharing={sharing}
        handRaised={handRaised}
        recording={recording}
        onToggleMic={toggleMic}
        onToggleCam={toggleCam}
        onToggleShare={handleToggleShare}
        onToggleHand={() => setHandRaised((h) => !h)}
        onToggleRecord={() => setRecording((r) => !r)}
        onLeave={handleLeave}
        panel={panel}
        onToggleChat={() => togglePanel("chat")}
        onToggleParticipants={() => togglePanel("participants")}
        unreadCount={unreadCount}
        participantCount={participants.length}
      />
    </div>
  );
}