import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Mic, MicOff, Video, VideoOff, ArrowRight, ChevronLeft,
  CheckCircle, XCircle, RefreshCw, Volume2, ChevronDown,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import { Button } from "../components/common/Button.jsx";
import { AudioVisualizer } from "../components/meeting/AudioVisualizer.jsx";

const COLORS = [
  "from-violet-500 to-fuchsia-600",
  "from-sky-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-pink-500 to-rose-600",
];

function DeviceSelect({ label, devices, selected, onChange, disabled }) {
  if (!devices.length) return null;
  return (
    <div className="relative">
      <label className="text-[10px] text-white/40 block mb-1">{label}</label>
      <div className="relative">
        <select
          value={selected}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 pr-8 focus:outline-none focus:border-violet-500/50 disabled:opacity-40 cursor-pointer"
        >
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId} className="bg-[#1a1d27]">
              {d.label || `${label} ${d.deviceId.slice(0, 8)}`}
            </option>
          ))}
        </select>
        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
      </div>
    </div>
  );
}

function StatusBadge({ ok, label }) {
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
      ok === null ? "bg-white/5 text-white/40" :
      ok ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" :
      "bg-red-500/10 border border-red-500/20 text-red-400"
    }`}>
      {ok === null ? <div className="w-3 h-3 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" /> :
       ok ? <CheckCircle size={12} /> : <XCircle size={12} />}
      <span>{label}</span>
    </div>
  );
}

export default function MeetingPreview() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [stream, setStream] = useState(null);
  const [micOk, setMicOk] = useState(null);
  const [camOk, setCamOk] = useState(null);
  const [permError, setPermError] = useState(null);
  const [joining, setJoining] = useState(false);

  const [cameras, setCameras] = useState([]);
  const [mics, setMics] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [selectedCam, setSelectedCam] = useState("");
  const [selectedMic, setSelectedMic] = useState("");

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const colorIdx = (user?.name?.charCodeAt(0) || 0) % COLORS.length;

  const loadDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter((d) => d.kind === "videoinput");
      const micsArr = devices.filter((d) => d.kind === "audioinput");
      const spkrs = devices.filter((d) => d.kind === "audiooutput");
      setCameras(cams);
      setMics(micsArr);
      setSpeakers(spkrs);
      if (cams.length && !selectedCam) setSelectedCam(cams[0].deviceId);
      if (micsArr.length && !selectedMic) setSelectedMic(micsArr[0].deviceId);
    } catch {}
  }, [selectedCam, selectedMic]);

  const startStream = useCallback(async (camId, micId) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setMicOk(null);
    setCamOk(null);
    setPermError(null);

    try {
      const constraints = {
        audio: micId ? { deviceId: { exact: micId } } : true,
        video: camId ? { deviceId: { exact: camId }, width: 1280, height: 720 } : { width: 1280, height: 720 },
      };
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = s;
      setStream(s);

      const hasAudio = s.getAudioTracks().length > 0;
      const hasVideo = s.getVideoTracks().length > 0;
      setMicOk(hasAudio);
      setCamOk(hasVideo);

      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      await loadDevices();
    } catch (err) {
      const msg =
        err.name === "NotAllowedError" ? "Camera and microphone access was denied. Please allow access in your browser settings." :
        err.name === "NotFoundError" ? "No camera or microphone found." :
        err.name === "NotReadableError" ? "Camera or microphone is already in use by another application." :
        "Could not access camera or microphone.";
      setPermError(msg);
      setMicOk(false);
      setCamOk(false);

      // Try audio only
      try {
        const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        streamRef.current = audioOnly;
        setStream(audioOnly);
        setMicOk(true);
        setCamOk(false);
      } catch {}
    }
  }, [loadDevices]);

  useEffect(() => {
    startStream(selectedCam || undefined, selectedMic || undefined);
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleToggleMic = () => {
    if (!stream) return;
    const newState = !micOn;
    stream.getAudioTracks().forEach((t) => { t.enabled = newState; });
    setMicOn(newState);
  };

  const handleToggleCam = () => {
    if (!stream) return;
    const newState = !camOn;
    stream.getVideoTracks().forEach((t) => { t.enabled = newState; });
    setCamOn(newState);
  };

  const handleDeviceChange = async (type, deviceId) => {
    if (type === "cam") {
      setSelectedCam(deviceId);
      await startStream(deviceId, selectedMic);
    } else {
      setSelectedMic(deviceId);
      await startStream(selectedCam, deviceId);
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    // Stop preview stream — MeetingRoom will create a new one
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    const target = roomId ? `/room/${roomId}` : "/";
    navigate(target, { replace: true });
  };

  const hasVideo = stream?.getVideoTracks().some((t) => t.enabled && t.readyState === "live");

  return (
    <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-sm">
            <ChevronLeft size={16} />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-white font-semibold text-sm">SyncSpace</span>
          </div>
          <div className="w-16" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Ready to join?</h1>
          <p className="text-white/50 text-sm mt-1.5">
            {roomId ? `Room: ${roomId}` : "Check your audio and video before joining"}
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6">

          {/* Camera preview — 3/5 wide */}
          <div className="md:col-span-3 space-y-3">

            {/* Video box */}
            <div className="aspect-video bg-[#1a1d27] rounded-2xl border border-white/10 relative overflow-hidden">
              {permError && !stream ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <XCircle size={32} className="text-red-400" />
                  <p className="text-white/60 text-sm">{permError}</p>
                  <Button size="sm" variant="secondary" icon={<RefreshCw size={13} />} onClick={() => startStream(selectedCam, selectedMic)}>
                    Retry
                  </Button>
                </div>
              ) : (
                <>
                  {/* Actual video element — always rendered, hidden when cam off */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${hasVideo && camOn ? "opacity-100" : "opacity-0"}`}
                  />

                  {/* Avatar fallback */}
                  {(!hasVideo || !camOn) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${COLORS[colorIdx]} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                        {initials}
                      </div>
                      <p className="text-white/40 text-xs">
                        {camOn && !hasVideo ? "Starting camera..." : "Camera is off"}
                      </p>
                    </div>
                  )}

                  {/* Loading spinner while stream starts */}
                  {micOk === null && (
                    <div className="absolute top-3 right-3">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
                    </div>
                  )}
                </>
              )}

              {/* Bottom controls overlay */}
              <div className="absolute bottom-0 inset-x-0 p-3 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleMic}
                    title={micOn ? "Mute" : "Unmute"}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-lg ${
                      micOn ? "bg-black/50 backdrop-blur-sm text-white hover:bg-black/70" : "bg-red-500 text-white hover:bg-red-400"
                    }`}
                  >
                    {micOn ? <Mic size={16} /> : <MicOff size={16} />}
                  </button>
                  <button
                    onClick={handleToggleCam}
                    title={camOn ? "Stop camera" : "Start camera"}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-lg ${
                      camOn ? "bg-black/50 backdrop-blur-sm text-white hover:bg-black/70" : "bg-red-500 text-white hover:bg-red-400"
                    }`}
                  >
                    {camOn ? <Video size={16} /> : <VideoOff size={16} />}
                  </button>
                </div>

                {/* Live audio visualizer */}
                {stream && micOn && micOk && (
                  <div className="flex items-center gap-1.5">
                    <Volume2 size={11} className="text-white/40 shrink-0" />
                    <AudioVisualizer stream={stream} active={micOn} bars={16} height={24} color="#a78bfa" />
                  </div>
                )}
              </div>
            </div>

            {/* Device status chips */}
            <div className="flex gap-2 flex-wrap">
              <StatusBadge ok={micOk} label={micOn ? "Mic ready" : "Mic muted"} />
              <StatusBadge ok={camOk} label={camOn ? "Camera ready" : "Camera off"} />
            </div>

            {/* Device selectors */}
            {(cameras.length > 1 || mics.length > 1) && (
              <div className="space-y-2.5 pt-1">
                <DeviceSelect label="Camera" devices={cameras} selected={selectedCam} onChange={(id) => handleDeviceChange("cam", id)} />
                <DeviceSelect label="Microphone" devices={mics} selected={selectedMic} onChange={(id) => handleDeviceChange("mic", id)} />
              </div>
            )}
          </div>

          {/* Right panel — 2/5 wide */}
          <div className="md:col-span-2 flex flex-col gap-5">

            {/* Meeting info */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-3">
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Meeting room</p>
                <p className="text-white font-semibold font-mono text-sm break-all">{roomId || "—"}</p>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${COLORS[colorIdx]} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {initials}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{user?.name}</p>
                  <p className="text-white/40 text-xs">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Pre-join checklist */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-2.5">
              <p className="text-xs font-medium text-white/60 mb-3">Device check</p>
              {[
                { label: "Microphone", ok: micOk, sub: micOn ? "Active" : "Muted" },
                { label: "Camera", ok: camOk, sub: camOn ? "Active" : "Off" },
                { label: "Internet", ok: true, sub: "Connected" },
              ].map(({ label, ok, sub }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    ok === null ? "bg-white/10" :
                    ok ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                  }`}>
                    {ok === null ? <div className="w-3 h-3 border border-white/30 border-t-white/70 rounded-full animate-spin" /> :
                     ok ? <CheckCircle size={13} /> : <XCircle size={13} />}
                  </div>
                  <div>
                    <p className="text-xs text-white/80 font-medium">{label}</p>
                    <p className="text-[10px] text-white/40">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Join button */}
            <div className="space-y-3 mt-auto">
              <Button
                size="lg"
                className="w-full"
                loading={joining}
                disabled={joining}
                onClick={handleJoin}
                iconRight={!joining && <ArrowRight size={16} />}
              >
                {joining ? "Joining..." : "Join Now"}
              </Button>

              <Link
                to="/"
                className="block text-center text-xs text-white/30 hover:text-white/60 transition-colors"
                onClick={() => { if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop()); }}
              >
                Cancel and go back
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
