'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Tab } from '@/components/BottomNav';

// ─── CONSTANTS ────────────────────────────────────────────────

const BOOKS = [
  { id: 'look-before-leap',  title: 'Look Before You Leap',      author: 'Mark Knight'   },
  { id: 'becoming-banker',   title: 'Becoming Your Own Banker',  author: 'Nelson Nash'   },
  { id: 'wealthy-physician', title: 'The Wealthy Physician',     author: ''              },
  { id: 'money-master',      title: 'Money: Master the Game',    author: 'Tony Robbins'  },
  { id: 'power-of-zero',     title: 'The Power of Zero',         author: 'David McKnight'},
];

const PHASE_NAMES: Record<number, string> = {
  1: 'Registration',          2: 'Pre-Licensing Course',   3: 'State Exam',
  4: 'License Application',   5: 'WFG Approval',           6: 'Required Training',
  7: 'Business Setup',        8: 'Business Partner Training', 9: 'Reading & Development',
  10: 'First Policy & Beyond',
};

type MemberStatus = 'new' | 'on-track' | 'thriving' | 'needs-support';

interface TeamMember {
  id: string;
  name: string;
  joinedDaysAgo: number;
  onboardingPhase: number;
  onboardingPct: number;
  callsThisWeek: number;
  prospectsThisWeek: number;
  presentationsThisWeek: number;
  policiesThisMonth: number;
  booksRead: string[];
  lastActiveDaysAgo: number;
  status: MemberStatus;
  alerts: string[];
}

interface LeaderNotif {
  id: string;
  memberName: string;
  action: string;
  type: string;
  timestamp: string;
  read: boolean;
}

// ─── MOCK TEAM DATA ───────────────────────────────────────────

const MOCK_MEMBERS: TeamMember[] = [
  { id: 'sarah',    name: 'Sarah M.',    joinedDaysAgo: 14, onboardingPhase: 7,  onboardingPct: 68,  callsThisWeek: 22, prospectsThisWeek: 8,  presentationsThisWeek: 3, policiesThisMonth: 2, booksRead: ['look-before-leap','becoming-banker'],          lastActiveDaysAgo: 0, status: 'thriving',      alerts: [] },
  { id: 'james',    name: 'James K.',    joinedDaysAgo: 21, onboardingPhase: 5,  onboardingPct: 44,  callsThisWeek: 15, prospectsThisWeek: 5,  presentationsThisWeek: 2, policiesThisMonth: 1, booksRead: ['look-before-leap'],                            lastActiveDaysAgo: 1, status: 'on-track',      alerts: [] },
  { id: 'michelle', name: 'Michelle R.', joinedDaysAgo: 10, onboardingPhase: 3,  onboardingPct: 28,  callsThisWeek: 8,  prospectsThisWeek: 3,  presentationsThisWeek: 1, policiesThisMonth: 0, booksRead: [],                                              lastActiveDaysAgo: 0, status: 'on-track',      alerts: ['Exam scheduled next week — needs prep support'] },
  { id: 'david',    name: 'David O.',    joinedDaysAgo: 18, onboardingPhase: 2,  onboardingPct: 16,  callsThisWeek: 2,  prospectsThisWeek: 1,  presentationsThisWeek: 0, policiesThisMonth: 0, booksRead: [],                                              lastActiveDaysAgo: 4, status: 'needs-support', alerts: ['No activity in 4 days — course may be stalled', 'No books started yet'] },
  { id: 'patricia', name: 'Patricia N.', joinedDaysAgo: 45, onboardingPhase: 10, onboardingPct: 95,  callsThisWeek: 18, prospectsThisWeek: 7,  presentationsThisWeek: 4, policiesThisMonth: 1, booksRead: ['look-before-leap','becoming-banker','wealthy-physician'], lastActiveDaysAgo: 0, status: 'thriving',      alerts: [] },
  { id: 'marcus',   name: 'Marcus T.',   joinedDaysAgo: 7,  onboardingPhase: 1,  onboardingPct: 5,   callsThisWeek: 0,  prospectsThisWeek: 0,  presentationsThisWeek: 0, policiesThisMonth: 0, booksRead: [],                                              lastActiveDaysAgo: 2, status: 'new',           alerts: ['Just joined 7 days ago — schedule an intro call'] },
  { id: 'grace',    name: 'Grace A.',    joinedDaysAgo: 30, onboardingPhase: 8,  onboardingPct: 76,  callsThisWeek: 10, prospectsThisWeek: 4,  presentationsThisWeek: 2, policiesThisMonth: 0, booksRead: ['look-before-leap'],                            lastActiveDaysAgo: 1, status: 'on-track',      alerts: ['First policy pending — needs follow-up coaching'] },
  { id: 'kevin',    name: 'Kevin B.',    joinedDaysAgo: 60, onboardingPhase: 10, onboardingPct: 100, callsThisWeek: 25, prospectsThisWeek: 12, presentationsThisWeek: 5, policiesThisMonth: 3, booksRead: ['look-before-leap','becoming-banker','wealthy-physician','money-master','power-of-zero'], lastActiveDaysAgo: 0, status: 'thriving', alerts: [] },
];

// Pre-seeded notifications to populate the feed on first load
const SEED_NOTIFS: LeaderNotif[] = [
  { id: 's1', memberName: 'Sarah M.',    action: 'completed Phase 7: Business Setup',              type: 'phase_complete', timestamp: new Date(Date.now() - 2  * 3600000).toISOString(),  read: false },
  { id: 's2', memberName: 'Kevin B.',    action: 'submitted their first policy 🎉',                type: 'milestone',      timestamp: new Date(Date.now() - 5  * 3600000).toISOString(),  read: false },
  { id: 's3', memberName: 'James K.',    action: 'completed Phase 5: WFG Approval',                type: 'phase_complete', timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),  read: true  },
  { id: 's4', memberName: 'Patricia N.', action: 'read "Becoming Your Own Banker"',                 type: 'book',           timestamp: new Date(Date.now() - 26 * 3600000).toISOString(),  read: true  },
  { id: 's5', memberName: 'David O.',    action: 'has been inactive for 4 days ⚠️',               type: 'alert',          timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),  read: false },
  { id: 's6', memberName: 'Grace A.',    action: 'completed Phase 8: Business Partner Training',   type: 'phase_complete', timestamp: new Date(Date.now() - 72 * 3600000).toISOString(),  read: true  },
  { id: 's7', memberName: 'Michelle R.', action: 'registered for State Exam — needs prep support', type: 'phase_complete', timestamp: new Date(Date.now() - 96 * 3600000).toISOString(),  read: true  },
];

// ─── STATUS CONFIG ────────────────────────────────────────────

const STATUS_CONFIG: Record<MemberStatus, { label: string; className: string; barColor: string }> = {
  'new':           { label: '🌱 New',           className: 'bg-gray-100 text-gray-600',  barColor: '#9CA3AF' },
  'on-track':      { label: '✅ On Track',       className: 'bg-blue-100 text-blue-700',  barColor: '#2563EB' },
  'thriving':      { label: '⭐ Thriving',       className: 'bg-green-100 text-green-700',barColor: '#059669' },
  'needs-support': { label: '⚠️ Needs Support',  className: 'bg-red-100 text-red-700',    barColor: '#DC2626' },
};

// ─── HELPERS ──────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hrs  < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

function initials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function notifIcon(type: string): string {
  if (type === 'phase_complete') return '✅';
  if (type === 'milestone')      return '🚀';
  if (type === 'book')           return '📚';
  if (type === 'alert')          return '⚠️';
  return '💡';
}

// ─── MAIN COMPONENT ───────────────────────────────────────────

export default function TeamScreen({ onTabChange: _onTabChange }: { onTabChange: (tab: Tab) => void }) {
  const { user } = useAuth();

  const [activeTab,      setActiveTab]      = useState<'overview' | 'members' | 'leaderboard'>('overview');
  const [notifications,  setNotifications]  = useState<LeaderNotif[]>([]);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [nudgeSent,      setNudgeSent]      = useState<Set<string>>(new Set());
  const [toast,          setToast]          = useState<string | null>(null);

  // Load notifications: real (from localStorage) + seeded mock ones
  useEffect(() => {
    const stored = localStorage.getItem('agentflow_leader_notifs');
    const real: LeaderNotif[] = stored ? JSON.parse(stored) : [];
    const existingIds = new Set(real.map(n => n.id));
    const merged = [...real, ...SEED_NOTIFS.filter(s => !existingIds.has(s.id))];
    setNotifications(merged);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 5000);
  };

  const sendNudge = (member: TeamMember) => {
    setNudgeSent(prev => new Set([...prev, member.id]));
    showToast(`📱 Nudge sent to ${member.name}! They'll receive a prompt to continue Phase ${member.onboardingPhase}: ${PHASE_NAMES[member.onboardingPhase]}.`);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const stored = localStorage.getItem('agentflow_leader_notifs');
    if (stored) {
      const updated = (JSON.parse(stored) as LeaderNotif[]).map(n => ({ ...n, read: true }));
      localStorage.setItem('agentflow_leader_notifs', JSON.stringify(updated));
    }
  };

  // ── Computed values ────────────────────────────────────────
  const unreadCount    = notifications.filter(n => !n.read).length;
  const needsAttention = MOCK_MEMBERS.filter(m => m.status === 'needs-support' || m.alerts.length > 0);
  const totalCalls     = MOCK_MEMBERS.reduce((s, m) => s + m.callsThisWeek,        0);
  const totalPolicies  = MOCK_MEMBERS.reduce((s, m) => s + m.policiesThisMonth,    0);
  const thriving       = MOCK_MEMBERS.filter(m => m.status === 'thriving').length;
  const avgOnboarding  = Math.round(MOCK_MEMBERS.reduce((s, m) => s + m.onboardingPct, 0) / MOCK_MEMBERS.length);

  // Leaderboard sorts
  const byCallsSorted      = [...MOCK_MEMBERS].sort((a, b) => b.callsThisWeek       - a.callsThisWeek);
  const byProspectsSorted  = [...MOCK_MEMBERS].sort((a, b) => b.prospectsThisWeek   - a.prospectsThisWeek);
  const byPoliciesSorted   = [...MOCK_MEMBERS].sort((a, b) => b.policiesThisMonth   - a.policiesThisMonth);
  const byBooksSorted      = [...MOCK_MEMBERS].sort((a, b) => b.booksRead.length    - a.booksRead.length);

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* ── TOAST ─────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 max-w-sm bg-purple-900 text-white text-sm font-semibold rounded-xl px-4 py-3 shadow-xl z-50 flex items-start gap-3">
          <span className="flex-1">{toast}</span>
          <button onClick={() => setToast(null)} className="text-white/60 text-lg leading-none flex-shrink-0">×</button>
        </div>
      )}

      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-xs font-bold opacity-60 tracking-widest uppercase mb-1">Team Dashboard</p>
            <h1 className="text-2xl font-bold mb-1">
              {user?.name ? `${user.name}'s Organization` : 'Your Organization'}
            </h1>
            <p className="text-sm opacity-75">{MOCK_MEMBERS.length} team members · AgentFlow tracking active</p>
          </div>
          <div className="relative">
            <div className="bg-white/20 rounded-xl px-4 py-2.5 text-sm font-semibold">
              🔔 Alerts
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Members',          value: MOCK_MEMBERS.length },
            { label: 'Thriving',         value: thriving },
            { label: 'Avg Onboarding',   value: `${avgOnboarding}%` },
            { label: 'Calls / Week',     value: totalCalls },
            { label: 'Policies / Month', value: totalPolicies },
          ].map((s, i) => (
            <div key={i} className="bg-white/15 rounded-xl p-3 text-center">
              <div className="text-xl font-black">{s.value}</div>
              <div className="text-[10px] opacity-70 font-semibold mt-0.5 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── NEEDS ATTENTION BANNER ────────────────────────── */}
      {needsAttention.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⚠️</span>
            <p className="font-bold text-red-800 text-sm">
              {needsAttention.length} member{needsAttention.length > 1 ? 's' : ''} need{needsAttention.length === 1 ? 's' : ''} your attention
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {needsAttention.map(m => (
              <div key={m.id} className="bg-white rounded-xl border border-red-200 px-3 py-2 flex items-center gap-3">
                <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center text-xs font-bold text-red-700 flex-shrink-0">
                  {initials(m.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                  <p className="text-xs text-red-600 truncate max-w-[180px]">{m.alerts[0]}</p>
                </div>
                <button
                  onClick={() => sendNudge(m)}
                  disabled={nudgeSent.has(m.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ${
                    nudgeSent.has(m.id)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {nudgeSent.has(m.id) ? '✓ Sent' : '📱 Nudge'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TABS ──────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6">
        {(['overview', 'members', 'leaderboard'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab === 'overview' ? '🏠 Overview' : tab === 'members' ? '👥 Members' : '🏆 Leaderboard'}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════
          OVERVIEW TAB
      ═══════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">

          {/* Notifications feed */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-800">Team Notifications</p>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                  Mark all read
                </button>
              )}
            </div>
            <div className="divide-y divide-gray-50">
              {notifications.slice(0, 10).map(notif => (
                <div key={notif.id} className={`px-6 py-3.5 flex items-start gap-3 transition-colors ${!notif.read ? 'bg-purple-50' : ''}`}>
                  <span className="text-lg flex-shrink-0 mt-0.5">{notifIcon(notif.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold">{notif.memberName}</span>{' '}{notif.action}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(notif.timestamp)}</p>
                  </div>
                  {!notif.read && <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Health summary */}
          <div>
            <h2 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Team Health</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {([
                { label: '🌱 New',           count: MOCK_MEMBERS.filter(m => m.status === 'new').length,           cls: 'bg-gray-50 border-gray-200 text-gray-600' },
                { label: '✅ On Track',       count: MOCK_MEMBERS.filter(m => m.status === 'on-track').length,      cls: 'bg-blue-50 border-blue-200 text-blue-700' },
                { label: '⭐ Thriving',       count: MOCK_MEMBERS.filter(m => m.status === 'thriving').length,      cls: 'bg-green-50 border-green-200 text-green-700' },
                { label: '⚠️ Needs Support',  count: MOCK_MEMBERS.filter(m => m.status === 'needs-support').length, cls: 'bg-red-50 border-red-200 text-red-700' },
              ] as {label:string;count:number;cls:string}[]).map((s, i) => (
                <div key={i} className={`border rounded-2xl p-4 text-center ${s.cls}`}>
                  <p className="text-3xl font-black">{s.count}</p>
                  <p className="text-xs font-semibold mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Onboarding progress snapshot */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">Onboarding Progress</h2>
            <div className="space-y-3">
              {[...MOCK_MEMBERS].sort((a, b) => b.onboardingPct - a.onboardingPct).map(m => {
                const sc = STATUS_CONFIG[m.status];
                return (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700 flex-shrink-0">
                      {initials(m.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-semibold text-gray-800">{m.name}</span>
                        <span className="text-gray-400">Ph {m.onboardingPhase} — {PHASE_NAMES[m.onboardingPhase]}</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${m.onboardingPct}%`, background: sc.barColor }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-500 w-8 text-right flex-shrink-0">{m.onboardingPct}%</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${sc.className}`}>
                      {sc.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          MEMBERS TAB
      ═══════════════════════════════════════════════════ */}
      {activeTab === 'members' && (
        <div className="space-y-3">
          {MOCK_MEMBERS.map(member => {
            const isExpanded = expandedMember === member.id;
            const sc = STATUS_CONFIG[member.status];

            return (
              <div
                key={member.id}
                className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all ${
                  member.status === 'needs-support' ? 'border-2 border-red-200' : 'border border-gray-100'
                }`}
              >
                {/* Member row (clickable) */}
                <div
                  className="px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedMember(isExpanded ? null : member.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-700 flex-shrink-0">
                      {initials(member.name)}
                    </div>

                    {/* Name + status */}
                    <div className="w-[120px] flex-shrink-0">
                      <p className="font-semibold text-gray-800 text-sm">{member.name}</p>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${sc.className}`}>
                        {sc.label}
                      </span>
                    </div>

                    {/* Onboarding progress bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500 truncate">Ph {member.onboardingPhase}: {PHASE_NAMES[member.onboardingPhase]}</span>
                        <span className="font-bold text-gray-600 ml-2 flex-shrink-0">{member.onboardingPct}%</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${member.onboardingPct}%`, background: sc.barColor }} />
                      </div>
                    </div>

                    {/* Quick stats */}
                    <div className="hidden sm:flex items-center gap-5 text-center flex-shrink-0">
                      <div>
                        <p className="text-sm font-bold text-gray-800">{member.callsThisWeek}</p>
                        <p className="text-[10px] text-gray-400">Calls</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{member.prospectsThisWeek}</p>
                        <p className="text-[10px] text-gray-400">Prospects</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{member.booksRead.length}/{BOOKS.length}</p>
                        <p className="text-[10px] text-gray-400">Books</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{member.policiesThisMonth}</p>
                        <p className="text-[10px] text-gray-400">Policies</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={e => { e.stopPropagation(); sendNudge(member); }}
                        disabled={nudgeSent.has(member.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                          nudgeSent.has(member.id)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        {nudgeSent.has(member.id) ? '✓ Sent' : '📱 Nudge'}
                      </button>
                      <span className={`text-gray-300 text-xl transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
                    </div>
                  </div>
                </div>

                {/* ── Expanded detail ────────────────────── */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-5 py-5 grid grid-cols-1 sm:grid-cols-3 gap-5">

                    {/* Onboarding detail */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">📋 Onboarding</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Current Phase</span>
                          <span className="font-semibold">{member.onboardingPhase} / 10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-semibold">{member.onboardingPct}% complete</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Days Since Joined</span>
                          <span className="font-semibold">{member.joinedDaysAgo}d</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Last Active</span>
                          <span className={`font-semibold ${member.lastActiveDaysAgo >= 3 ? 'text-red-600' : 'text-green-600'}`}>
                            {member.lastActiveDaysAgo === 0 ? 'Today' : `${member.lastActiveDaysAgo}d ago`}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 bg-purple-50 rounded-lg px-3 py-2 text-xs font-semibold text-purple-700">
                        Next → {PHASE_NAMES[Math.min(member.onboardingPhase + 1, 10)]}
                      </div>
                      {member.alerts.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          {member.alerts.map((alert, i) => (
                            <div key={i} className="bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 text-xs text-red-700 font-medium">
                              {alert}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Activity detail */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">📊 This Week's Activity</p>
                      <div className="space-y-3">
                        {[
                          { label: '📞 Calls Made',      value: member.callsThisWeek,         target: 20, color: '#7C3AED' },
                          { label: '👥 Prospects',        value: member.prospectsThisWeek,     target: 10, color: '#2563EB' },
                          { label: '📋 Presentations',    value: member.presentationsThisWeek, target: 5,  color: '#059669' },
                        ].map((stat, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600">{stat.label}</span>
                              <span className="font-bold">{stat.value} / {stat.target}</span>
                            </div>
                            <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${Math.min((stat.value / stat.target) * 100, 100)}%`, background: stat.color }}
                              />
                            </div>
                          </div>
                        ))}
                        <div className="pt-1 border-t border-gray-100 flex justify-between text-xs">
                          <span className="text-gray-500">Policies This Month</span>
                          <span className="font-bold text-gray-800">{member.policiesThisMonth}</span>
                        </div>
                      </div>
                    </div>

                    {/* Books detail */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                        📚 Reading Progress ({member.booksRead.length}/{BOOKS.length})
                      </p>
                      <div className="space-y-2">
                        {BOOKS.map(book => {
                          const read = member.booksRead.includes(book.id);
                          return (
                            <div
                              key={book.id}
                              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 ${read ? 'bg-green-50' : 'bg-gray-50'}`}
                            >
                              <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-[9px] font-black ${read ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-300'}`}>
                                {read ? '✓' : ''}
                              </div>
                              <div className="min-w-0">
                                <p className={`text-xs font-semibold truncate ${read ? 'text-green-700' : 'text-gray-500'}`}>
                                  {book.title}
                                </p>
                                {book.author && (
                                  <p className="text-[10px] text-gray-400">{book.author}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          LEADERBOARD TAB
      ═══════════════════════════════════════════════════ */}
      {activeTab === 'leaderboard' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: '📞 Calls This Week',     data: byCallsSorted,     getVal: (m: TeamMember) => m.callsThisWeek,                     unit: 'calls'     },
            { title: '👥 Prospects Contacted', data: byProspectsSorted, getVal: (m: TeamMember) => m.prospectsThisWeek,                 unit: 'prospects' },
            { title: '🏆 Policies This Month', data: byPoliciesSorted,  getVal: (m: TeamMember) => m.policiesThisMonth,                 unit: 'policies'  },
            { title: '📚 Books Read',          data: byBooksSorted,     getVal: (m: TeamMember) => m.booksRead.length,                  unit: 'books'     },
          ].map((board, bi) => {
            const maxVal = board.getVal(board.data[0]) || 1;
            return (
              <div key={bi} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                  <p className="font-semibold text-gray-800 text-sm">{board.title}</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {board.data.map((member, rank) => {
                    const val = board.getVal(member);
                    const rankIcon = rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `${rank + 1}`;
                    return (
                      <div key={member.id} className="px-5 py-3 flex items-center gap-3">
                        <span className={`text-sm w-6 text-center flex-shrink-0 ${rank < 3 ? 'text-lg' : 'font-bold text-gray-400 text-xs'}`}>
                          {rankIcon}
                        </span>
                        <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700 flex-shrink-0">
                          {initials(member.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-gray-800">{member.name}</span>
                            <span className="font-bold text-gray-600">{val} {board.unit}</span>
                          </div>
                          <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-purple-500"
                              style={{ width: `${(val / maxVal) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
