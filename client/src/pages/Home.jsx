export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <section className="max-w-3xl text-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-white">SyncSpace</h1>
        <p className="mt-4 text-lg text-slate-300">
          A collaborative meeting workspace scaffold for video, chat, and whiteboard flows.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a href="/dashboard" className="px-5 py-3 bg-indigo-600 text-white rounded-md">Go to Dashboard</a>
          <a href="/login" className="px-5 py-3 border border-slate-700 text-slate-200 rounded-md">Login</a>
        </div>
      </section>
    </main>
  );
}