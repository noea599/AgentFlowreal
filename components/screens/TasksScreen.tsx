'use client';

import { useState } from 'react';
import { Tab } from '@/components/BottomNav';

const TASKS_BY_INTENSITY = {
  Low: [
    { task: 'Send 15 WhatsApp messages', time: '30 min' },
    { task: 'Call 5 church leaders', time: '25 min' },
    { task: 'Engage in 5 Facebook groups', time: '15 min' },
  ],
  Medium: [
    { task: 'Send 30 WhatsApp messages', time: '45 min' },
    { task: 'Call 10 church leaders', time: '45 min' },
    { task: 'Engage in 10 Facebook groups', time: '30 min' },
    { task: 'Follow up with 5 referrals', time: '20 min' },
    { task: 'Create 1-2 content pieces', time: '30 min' },
  ],
  Aggressive: [
    { task: 'Send 50 WhatsApp messages', time: '60 min' },
    { task: 'Call 20 church leaders', time: '90 min' },
    { task: 'Engage in 20 Facebook groups', time: '45 min' },
    { task: 'Follow up with 10 referrals', time: '30 min' },
    { task: 'Create 3-5 content pieces', time: '60 min' },
    { task: 'Host a community event or webinar', time: '120 min' },
  ],
};

type Intensity = keyof typeof TASKS_BY_INTENSITY;

export default function TasksScreen({ onTabChange: _onTabChange }: { onTabChange: (tab: Tab) => void }) {
  const [intensity, setIntensity] = useState<Intensity>('Medium');
  const [checked, setChecked] = useState<Set<number>>(new Set([0, 1, 2]));

  const tasks = TASKS_BY_INTENSITY[intensity];
  const progress = Math.round((checked.size / tasks.length) * 100);

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Daily Activity Tracker</h1>
        <p className="text-gray-500 mt-1">Tuesday, January 21, 2025</p>
      </div>

      {/* Intensity Selector */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-4">Select your energy level for today:</p>
        <div className="flex gap-3">
          {(Object.keys(TASKS_BY_INTENSITY) as Intensity[]).map((level) => (
            <button
              key={level}
              onClick={() => { setIntensity(level); setChecked(new Set()); }}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                intensity === level
                  ? level === 'Low'
                    ? 'bg-green-600 text-white shadow-sm'
                    : level === 'Medium'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-red-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {level === 'Low' ? '🌱' : level === 'Medium' ? '🔥' : '⚡'} {level}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Progress Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">Today&rsquo;s Tasks</p>
            <p className="text-sm text-gray-500 mt-0.5">{checked.size} of {tasks.length} completed</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">{progress}%</p>
          </div>
        </div>
        <div className="w-full bg-gray-100 h-2">
          <div
            className="bg-green-500 h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Task List */}
        <div className="divide-y divide-gray-100">
          {tasks.map((item, i) => (
            <div
              key={i}
              onClick={() => toggle(i)}
              className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  checked.has(i) ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}
              >
                {checked.has(i) && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium transition-all ${checked.has(i) ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                  {item.task}
                </p>
              </div>
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
