import { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button.jsx";
import { Card } from "../components/common/Card.jsx";
import { Bell, Video, Mic, Monitor, Moon, Globe, Trash2, LogOut, ChevronRight } from "lucide-react";

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-violet-600" : "bg-surface-3"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4.5" : "translate-x-0.5"}`} />
    </button>
  );
}

function SettingRow({ icon: Icon, label, description, action }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
        <Icon size={14} className="text-text-muted" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary font-medium">{label}</p>
        {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState({
    notifications: true,
    sounds: true,
    autoMicOff: false,
    autoCamOff: false,
    hd: true,
    noiseCancellation: true,
    darkMode: true,
    language: "English",
  });

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="p-5 md:p-7 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-muted mt-1">Customize your SyncSpace experience</p>
      </div>

      <Card className="divide-y divide-border">
        <div className="pb-3">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Notifications</h2>
        </div>
        <SettingRow icon={Bell} label="Meeting alerts" description="Get notified when someone joins your room" action={<Toggle checked={prefs.notifications} onChange={() => toggle("notifications")} />} />
        <SettingRow icon={Bell} label="Sound effects" description="Play sounds for events like join/leave" action={<Toggle checked={prefs.sounds} onChange={() => toggle("sounds")} />} />
      </Card>

      <Card className="divide-y divide-border">
        <div className="pb-3">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Audio & Video</h2>
        </div>
        <SettingRow icon={Mic} label="Join with mic off" description="Automatically mute when joining a meeting" action={<Toggle checked={prefs.autoMicOff} onChange={() => toggle("autoMicOff")} />} />
        <SettingRow icon={Video} label="Join with camera off" description="Turn off camera automatically on join" action={<Toggle checked={prefs.autoCamOff} onChange={() => toggle("autoCamOff")} />} />
        <SettingRow icon={Monitor} label="HD video" description="Use high-definition video when available" action={<Toggle checked={prefs.hd} onChange={() => toggle("hd")} />} />
        <SettingRow icon={Mic} label="Noise cancellation" description="Reduce background noise during calls" action={<Toggle checked={prefs.noiseCancellation} onChange={() => toggle("noiseCancellation")} />} />
      </Card>

      <Card className="divide-y divide-border">
        <div className="pb-3">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Appearance</h2>
        </div>
        <SettingRow icon={Moon} label="Dark mode" description="Use dark theme throughout the app" action={<Toggle checked={prefs.darkMode} onChange={() => toggle("darkMode")} />} />
        <SettingRow icon={Globe} label="Language" description="Interface language" action={
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <span>{prefs.language}</span>
            <ChevronRight size={12} />
          </div>
        } />
      </Card>

      <Card className="divide-y divide-border">
        <div className="pb-3">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Account</h2>
        </div>
        <SettingRow icon={Trash2} label="Clear meeting history" description="Remove all past meeting records locally" action={
          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">Clear</Button>
        } />
        <div className="pt-3">
          <Button variant="danger" className="w-full" onClick={handleLogout} icon={<LogOut size={14} />}>
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}
