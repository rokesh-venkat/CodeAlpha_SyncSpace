import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff, Settings, ArrowRight, Users, Wifi } from "lucide-react";
import { Button } from "../components/common/Button";

export default function MeetingPreview() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [name, setName] = useState("Rokesh Venkat");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-5">
      <div className="w-full max-w-3xl">

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Wifi size={16} className="text-violet-400" />
            <span className="font-bold text-text-primary">SyncSpace</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Ready to join?</h1>
          <p className="text-text-muted text-sm mt-1">Check your audio and video before joining</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Camera preview */}
          <div className="space-y-3">
            <div className="aspect-video rounded-2xl bg-surface-2 border border-border relative overflow-hidden">
              {camOn ? (
                <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 to-fuchsia-900/20 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">R</span>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <VideoOff size={28} className="text-text-muted" />
                  <p className="text-xs text-text-muted">Camera is off</p>
                </div>
              )}

              {/* Controls overlay */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                <button
                  onClick={() => setMicOn(m => !m)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${micOn ? "bg-black/50 text-white" : "bg-red-500 text-white"}`}
                >
                  {micOn ? <Mic size={15} /> : <MicOff size={15} />}
                </button>
                <button
                  onClick={() => setCamOn(c => !c)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${camOn ? "bg-black/50 text-white" : "bg-red-500 text-white"}`}
                >
                  {camOn ? <Video size={15} /> : <VideoOff size={15} />}
                </button>
                <button className="w-9 h-9 rounded-xl bg-black/50 text-white flex items-center justify-center">
                  <Settings size={15} />
                </button>
              </div>
            </div>

            {/* Device status */}
            <div className="grid grid-cols-2 gap-2">
              <div className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs ${micOn ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" : "border-border bg-surface-1 text-text-muted"}`}>
                {micOn ? <Mic size={13} /> : <MicOff size={13} />}
                <span className="truncate">{micOn ? "Mic on" : "Mic off"}</span>
              </div>
              <div className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs ${camOn ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" : "border-border bg-surface-1 text-text-muted"}`}>
                {camOn ? <Video size={13} /> : <VideoOff size={13} />}
                <span className="truncate">{camOn ? "Camera on" : "Camera off"}</span>
              </div>
            </div>
          </div>

          {/* Meeting info & join */}
          <div className="flex flex-col gap-4">
            <div className="bg-surface-1 border border-border rounded-2xl p-4 space-y-3">
              <div>
                <p className="text-xs text-text-muted mb-0.5">Meeting</p>
                <p className="font-semibold text-text-primary">Design Review — Sprint 14</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Users size={12} />
                  4 already in meeting
                </span>
              </div>
              <div className="flex -space-x-2">
                {["from-violet-500 to-fuchsia-600", "from-sky-500 to-blue-600", "from-emerald-500 to-teal-600", "from-amber-500 to-orange-600"].map((c, i) => (
                  <div key={i} className={`w-7 h-7 rounded-lg bg-gradient-to-br ${c} border-2 border-bg-primary flex items-center justify-center text-white text-[10px] font-bold`}>
                    {["R", "A", "P", "M"][i]}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1.5">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-1 border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-violet-500/60 transition-colors"
              />
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={() => navigate("/room/abc-123")}
              iconRight={<ArrowRight size={16} />}
            >
              Join Meeting
            </Button>

            <Link to="/" className="text-center text-xs text-text-muted hover:text-text-primary transition-colors">
              Cancel and go back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}