export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md bg-white/5 p-8 rounded-lg backdrop-blur-md">
        <h2 className="text-2xl font-semibold text-white mb-4">Create an account</h2>
        <form className="space-y-4">
          <input className="w-full p-3 rounded bg-slate-800 text-white" placeholder="Name" />
          <input className="w-full p-3 rounded bg-slate-800 text-white" placeholder="Email" />
          <input className="w-full p-3 rounded bg-slate-800 text-white" placeholder="Password" type="password" />
          <button className="w-full py-3 bg-indigo-600 rounded text-white">Create account</button>
        </form>
      </div>
    </div>
  );
}