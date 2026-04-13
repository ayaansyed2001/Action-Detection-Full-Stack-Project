import { Activity, LogOut, Sparkles, UserCircle2, Waves } from 'lucide-react';

export default function Header({ user, onLogout }) {
  return (
    <header className="glass-panel sticky top-4 z-20 mb-6 flex flex-col gap-4 rounded-[28px] px-5 py-4 backdrop-blur-xl sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <div className="brand-mark">
          <Activity className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200/80">Sentinel AI</p>
            <span className="status-chip">
              <span className="status-dot" />
              Live pipeline
            </span>
          </div>
          <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Action Detection Command Center</h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <div className="nav-chip">
          <Sparkles className="h-4 w-4 text-cyan-300" />
          AI surveillance dashboard
        </div>
        <div className="nav-chip">
          <Waves className="h-4 w-4 text-fuchsia-300" />
          Upload or live capture
        </div>
        <div className="nav-chip">
          <UserCircle2 className="h-4 w-4 text-cyan-300" />
          {user.username}
        </div>
        <button type="button" className="secondary-button" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
