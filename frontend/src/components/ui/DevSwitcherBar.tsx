import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../shared/types';

export function DevSwitcherBar() {
  const isDevMode = import.meta.env.VITE_DISABLE_LOGIN === 'true';
  const { user } = useAuth();
  const [devUsers, setDevUsers] = useState<User[]>([]);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (!isDevMode) return;
    api.getDevUsers().then(setDevUsers).catch(() => {});
  }, [isDevMode]);

  if (!isDevMode || devUsers.length === 0) return null;

  async function handleSwitch(userId: string) {
    if (switching || userId === user?.id) return;
    setSwitching(true);
    try {
      await api.devSwitch(userId);
      window.location.reload();
    } catch {
      setSwitching(false);
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex h-12 items-center justify-between bg-gradient-to-r from-[#FF6B35] to-[#F7C948] px-4 shadow-md">
      <span className="text-sm font-bold text-white">DEV MODE</span>

      <div className="flex items-center gap-1.5 overflow-x-auto">
        {devUsers.map((u) => {
          const isActive = u.id === user?.id;
          const isAdmin = u.role === 'admin';
          return (
            <button
              key={u.id}
              onClick={() => handleSwitch(u.id)}
              disabled={switching}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'bg-white/20 text-white hover:bg-white/40'
              } ${switching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {u.displayName}
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none ${
                  isAdmin ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                }`}
              >
                {u.role}
              </span>
            </button>
          );
        })}
      </div>

      <span className="hidden text-xs text-white/80 sm:block">
        {user?.displayName} ({user?.role})
      </span>
    </div>
  );
}
