'use client';

export function LogoutButton() {
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'GET' });
    window.location.href = '/login';
  };

  return (
    <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-slate-400 hover:text-danger-400 transition-colors">
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
      </svg>
      <span className="text-[10px] font-medium tracking-wide">Salir</span>
    </button>
  );
}
