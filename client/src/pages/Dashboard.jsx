export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="p-4 border-b border-slate-700">
        <div className="max-w-6xl mx-auto">Dashboard</div>
      </header>
      <main className="max-w-6xl mx-auto p-6">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 bg-white/5 p-4 rounded">Main content</div>
          <aside className="bg-white/5 p-4 rounded">Sidebar</aside>
        </section>
      </main>
    </div>
  );
}