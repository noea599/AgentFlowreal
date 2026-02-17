'use client';

import { Tab } from '@/components/BottomNav';
import { useAuth } from '@/components/AuthProvider';

export default function DashboardScreen({ onTabChange }: { onTabChange: (tab: Tab) => void }) {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Agent';

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}! 👋</h1>
        <p className="text-gray-500 mt-1">Ready to close deals today?</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-80 mb-1">Total Leads</p>
          <p className="text-4xl font-bold">127</p>
          <p className="text-xs opacity-60 mt-2">This month</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Presentations</p>
          <p className="text-4xl font-bold text-gray-900">8</p>
          <p className="text-xs text-gray-400 mt-2">This week</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Deals Closed</p>
          <p className="text-4xl font-bold text-green-600">3</p>
          <p className="text-xs text-gray-400 mt-2">This week</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="col-span-2">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onTabChange('coach')}
              className="bg-blue-50 hover:bg-blue-100 transition-colors p-5 rounded-2xl text-left group"
            >
              <span className="text-3xl">💬</span>
              <p className="text-base font-semibold text-gray-800 mt-3">AI Coach</p>
              <p className="text-sm text-gray-500 mt-1">Get instant help with objections and scripts</p>
            </button>
            <button
              onClick={() => onTabChange('scripts')}
              className="bg-green-50 hover:bg-green-100 transition-colors p-5 rounded-2xl text-left group"
            >
              <span className="text-3xl">📄</span>
              <p className="text-base font-semibold text-gray-800 mt-3">Scripts</p>
              <p className="text-sm text-gray-500 mt-1">Proven templates for every situation</p>
            </button>
            <button
              onClick={() => onTabChange('tasks')}
              className="bg-purple-50 hover:bg-purple-100 transition-colors p-5 rounded-2xl text-left group"
            >
              <span className="text-3xl">🎯</span>
              <p className="text-base font-semibold text-gray-800 mt-3">Daily Tasks</p>
              <p className="text-sm text-gray-500 mt-1">Track your daily activity goals</p>
            </button>
            <button className="bg-orange-50 hover:bg-orange-100 transition-colors p-5 rounded-2xl text-left group">
              <span className="text-3xl">📚</span>
              <p className="text-base font-semibold text-gray-800 mt-3">Training</p>
              <p className="text-sm text-gray-500 mt-1">Level up your sales skills</p>
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Daily Tip */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">💡 Daily Tip</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <p className="text-sm font-semibold text-amber-800 mb-2">Mindset of the Day</p>
              <p className="text-sm text-amber-700 leading-relaxed">
                &ldquo;Excitement is CONTAGIOUS. If you&rsquo;re not excited, nobody will join.&rdquo;
              </p>
            </div>
          </div>

          {/* Today's Progress */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">📊 Today&rsquo;s Progress</h2>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
              {[
                { label: 'WhatsApp messages', value: 30, done: 30 },
                { label: 'Calls made', value: 10, done: 7 },
                { label: 'Follow-ups', value: 5, done: 2 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{item.label}</span>
                    <span className="font-semibold">{item.done}/{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.round((item.done / item.value) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
