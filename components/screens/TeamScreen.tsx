import { Tab } from '@/components/BottomNav';

const TEAM = [
  { name: 'Sarah M.', status: 'Licensed', sales: 2, activity: 'High' },
  { name: 'James K.', status: 'Licensed', sales: 1, activity: 'Medium' },
  { name: 'Michelle R.', status: 'In Training', sales: 0, activity: 'High' },
  { name: 'David O.', status: 'Studying', sales: 0, activity: 'Low' },
  { name: 'Patricia N.', status: 'Licensed', sales: 0, activity: 'Medium' },
];

const ACTIVITY_BADGE: Record<string, string> = {
  High: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-red-100 text-red-700',
};

const STATUS_BADGE: Record<string, string> = {
  Licensed: 'bg-blue-100 text-blue-700',
  'In Training': 'bg-orange-100 text-orange-700',
  Studying: 'bg-gray-100 text-gray-600',
};

export default function TeamScreen({ onTabChange: _onTabChange }: { onTabChange: (tab: Tab) => void }) {
  const producing = TEAM.filter((m) => m.sales > 0).length;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage and grow your team</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 transition-colors text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
          + Add Team Member
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-5 text-white col-span-2">
          <p className="text-sm opacity-80 mb-1">Team Members</p>
          <p className="text-4xl font-bold">{TEAM.length}</p>
          <p className="text-xs opacity-60 mt-2">Total enrolled</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Producing</p>
          <p className="text-4xl font-bold text-green-600">{producing}</p>
          <p className="text-xs text-gray-400 mt-2">Active agents</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Sales</p>
          <p className="text-4xl font-bold text-gray-900">{TEAM.reduce((a, m) => a + m.sales, 0)}</p>
          <p className="text-xs text-gray-400 mt-2">This week</p>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <p className="font-semibold text-gray-800">Team Members</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Member</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Activity</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Sales</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {TEAM.map((member, i) => {
              const initials = member.name.split(' ').map((n) => n[0]).join('');
              return (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-700">
                        {initials}
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{member.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BADGE[member.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ACTIVITY_BADGE[member.activity]}`}>
                      {member.activity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-800">{member.sales}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View →</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
