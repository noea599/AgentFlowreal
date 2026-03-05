type Tab = 'home' | 'tasks' | 'coach' | 'scripts' | 'team' | 'onboarding' | 'exam';

const NAV_ITEMS: { icon: string; label: string; id: Tab }[] = [
  { icon: '🏠', label: 'Home', id: 'home' },
  { icon: '🎯', label: 'Tasks', id: 'tasks' },
  { icon: '💬', label: 'Coach', id: 'coach' },
  { icon: '📄', label: 'Scripts', id: 'scripts' },
  { icon: '👥', label: 'Team', id: 'team' },
];

export default function BottomNav({
  active,
  onTabChange,
}: {
  active: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2">
      <div className="flex justify-around">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center px-3 py-1 rounded-lg ${
              active === item.id ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export type { Tab };
