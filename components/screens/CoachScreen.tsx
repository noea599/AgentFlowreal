'use client';

import { useState } from 'react';
import { Tab } from '@/components/BottomNav';

const INITIAL_MESSAGES = [
  {
    role: 'ai' as const,
    text: "Hi Noel! 👋 I'm your AI Sales Coach. How can I help you close more deals today?",
  },
  {
    role: 'user' as const,
    text: 'How do I handle the "I need to think about it" objection?',
  },
  {
    role: 'ai' as const,
    text: `Great question! Here's a proven response:\n\n**🎯 The "Think About It" Reframe:**\n\n"I totally understand. Most of my best clients felt the same way. What specifically would you like to think about? Is it the protection, the investment growth, or the timing?"\n\nThis isolates the real objection so you can address it directly.`,
  },
];

const QUICK_PROMPTS = ['Help with objections', 'Create a script', 'Daily motivation', 'Closing techniques'];

export default function CoachScreen({ onTabChange: _onTabChange }: { onTabChange: (tab: Tab) => void }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center gap-4 flex-shrink-0">
        <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
          <span className="text-xl">🤖</span>
        </div>
        <div>
          <h1 className="font-bold text-gray-900 text-lg">AI Sales Coach</h1>
          <p className="text-xs text-green-600 font-medium">● Online 24/7</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">🤖</span>
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-5 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-8 py-5 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          {/* Quick prompts */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="bg-gray-100 hover:bg-gray-200 transition-colors text-xs px-4 py-1.5 rounded-full text-gray-600"
              >
                {prompt}
              </button>
            ))}
          </div>
          {/* Input row */}
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about sales, objections, or scripts..."
              className="flex-1 bg-gray-100 rounded-xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-6 py-3 rounded-xl text-sm font-medium"
            >
              Send ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
