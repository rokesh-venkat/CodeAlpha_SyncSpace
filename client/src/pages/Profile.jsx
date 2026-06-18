import { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { Button } from "../components/common/Button.jsx";
import { Card } from "../components/common/Card.jsx";
import { Input } from "../components/common/Input.jsx";
import { User, Mail, Camera, Shield, Clock } from "lucide-react";
import api from "../services/api.js";

export default function Profile() {
  const { user, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const colors = ["from-violet-500 to-fuchsia-600", "from-sky-500 to-blue-600", "from-emerald-500 to-teal-600"];
  const colorIndex = (user?.name?.charCodeAt(0) || 0) % colors.length;

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await api.put("/auth/profile", { name: name.trim() });
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 md:p-7 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">My Profile</h1>
        <p className="text-sm text-text-muted mt-1">Manage your account information</p>
      </div>

      <Card className="flex flex-col sm:flex-row items-center gap-6 p-6">
        <div className="relative shrink-0">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white text-2xl font-bold`}>
            {initials}
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-violet-600 hover:bg-violet-500 transition-colors flex items-center justify-center shadow-lg">
            <Camera size={13} className="text-white" />
          </button>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-lg font-semibold text-text-primary">{user?.name}</h2>
          <p className="text-sm text-text-muted">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
            <span className="text-[10px] bg-violet-500/15 text-violet-400 px-2 py-0.5 rounded-full font-medium">Free Plan</span>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Active
            </span>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-text-primary text-sm">Account Details</h2>
          {!editing && (
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
        </div>

        {success && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            Profile updated successfully.
          </div>
        )}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {editing ? (
            <Input
              label="Display Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User size={14} />}
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2">
              <User size={14} className="text-text-muted shrink-0" />
              <div>
                <p className="text-[10px] text-text-muted">Display Name</p>
                <p className="text-sm text-text-primary font-medium">{user?.name}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2">
            <Mail size={14} className="text-text-muted shrink-0" />
            <div>
              <p className="text-[10px] text-text-muted">Email Address</p>
              <p className="text-sm text-text-primary font-medium">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2">
            <Shield size={14} className="text-text-muted shrink-0" />
            <div>
              <p className="text-[10px] text-text-muted">Account ID</p>
              <p className="text-xs text-text-muted font-mono">{user?._id}</p>
            </div>
          </div>
        </div>

        {editing && (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => { setEditing(false); setName(user?.name || ""); setError(null); }}>
              Cancel
            </Button>
            <Button size="sm" loading={saving} onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <h2 className="font-semibold text-text-primary text-sm">Activity</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Meetings", value: "12", icon: "🎥" },
            { label: "Hours", value: "8.4h", icon: "⏱" },
            { label: "Contacts", value: "6", icon: "👥" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-3 rounded-xl bg-surface-2">
              <div className="text-xl">{stat.icon}</div>
              <div className="text-base font-bold text-text-primary mt-1">{stat.value}</div>
              <div className="text-[10px] text-text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
