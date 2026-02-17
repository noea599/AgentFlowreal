'use client';

import { useState } from 'react';
import { Tab } from '@/components/BottomNav';

const SCRIPTS = [
  { title: 'Cold Outreach - Professional', category: 'Prospecting', color: 'blue', preview: 'Hi [Name], I came across your profile and wanted to connect. I help professionals in your area...' },
  { title: 'Pastor/Community Leader', category: 'Church Strategy', color: 'purple', preview: 'Good morning [Pastor Name], I\'m reaching out because I deeply respect the work you do in our community...' },
  { title: '"I Need to Think About It"', category: 'Objections', color: 'red', preview: 'I totally understand. Most of my best clients felt the same way. What specifically would you like to think about?' },
  { title: 'Follow-Up Sequence', category: 'Follow-Up', color: 'green', preview: 'Hi [Name], just following up on our conversation from [day]. I wanted to check in and see if you had any questions...' },
  { title: 'Post-Presentation Close', category: 'Closing', color: 'orange', preview: 'Based on everything we\'ve discussed today, it sounds like [Product] is a perfect fit for what you\'re looking for...' },
  { title: '"What\'s In It For You?"', category: 'Objections', color: 'red', preview: 'That\'s a great question. Let me show you exactly what you\'ll get and why this makes sense for your family...' },
];

const CATEGORIES = ['All', 'Prospecting', 'Objections', 'Closing', 'Follow-Up', 'Church Strategy'];

const BADGE: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  red: 'bg-red-100 text-red-700',
  green: 'bg-green-100 text-green-700',
  orange: 'bg-orange-100 text-orange-700',
};

export default function ScriptsScreen({ onTabChange: _onTabChange }: { onTabChange: (tab: Tab) => void }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = SCRIPTS.filter((s) => {
    const matchCat = activeCategory === 'All' || s.category === activeCategory;
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Script Library</h1>
        <p className="text-gray-500 mt-1">Proven templates for every situation</p>
      </div>

      {/* Search + Filter Row */}
      <div className="flex gap-4 mb-6 items-center flex-wrap">
        <div className="flex-1 min-w-64 bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm">
          <span className="text-gray-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scripts..."
            className="bg-transparent text-sm outline-none flex-1 text-gray-800 placeholder-gray-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scripts Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📄</p>
          <p className="font-medium">No scripts found</p>
          <p className="text-sm">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((script, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${BADGE[script.color].split(' ')[0]} rounded-xl flex items-center justify-center text-xl`}>
                    📄
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{script.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE[script.color]}`}>
                      {script.category}
                    </span>
                  </div>
                </div>
                <span className="text-gray-300 group-hover:text-blue-400 transition-colors text-xl">›</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{script.preview}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
