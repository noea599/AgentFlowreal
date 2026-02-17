'use client';

import Logo from '@/components/Logo';
import { Tab } from '@/components/BottomNav';
import { useAuth } from '@/components/AuthProvider';

const NAV_ITEMS: { icon: string; label: string; id: Tab }[] = [
  { icon: '🏠', label: 'Dashboard', id: 'home' },
  { icon: '🎯', label: 'Daily Tasks', id: 'tasks' },
  { icon: '💬', label: 'AI Coach', id: 'coach' },
  { icon: '📄', label: 'Scripts', id: 'scripts' },
  { icon: '👥', label: 'Team', id: 'team' },
];

export default function Sidebar({
  active,
  onTabChange,
}: {
  active: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0].toUpperCase()).join('').slice(0, 2)
    : '??';

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
        <Logo size={36} />
        <div>
          <p className="font-bold text-gray-900 leading-tight">AgentFlow</p>
          <p className="text-[10px] text-gray-400">Close More Deals</p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User Profile + Logout */}
      <div className="px-4 py-4 border-t border-gray-100 space-y-2">
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name ?? 'Agent'}</p>
            <p className="text-[10px] text-gray-400 truncate">{user?.email ?? ''}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
        >
          → Log out
        </button>
      </div>
    </aside>
  );
}
