export default function MeetingRoom() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="p-4 border-b border-slate-700">Meeting Room</header>
      <main className="p-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white/5 h-96 rounded" />
          <aside className="bg-white/5 p-4 rounded">Participants / Chat</aside>
        </div>
      </main>
    </div>
  );
}