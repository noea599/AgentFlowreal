'use client';

import { useState, useRef, useEffect } from 'react';
import { Tab } from '@/components/BottomNav';
import { useAuth } from '@/components/AuthProvider';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  'Help me handle an objection',
  'Write a WhatsApp outreach script',
  'Give me a pastor approach message',
  'Help with a follow-up sequence',
  'Motivate me',
  'Create TikTok content ideas',
];

export default function CoachScreen({ onTabChange: _onTabChange }: { onTabChange: (tab: Tab) => void }) {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Agent';

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi ${firstName}! 👋 I'm your AI Sales Coach powered by your Team Dominion knowledge base. I know your scripts, objection frameworks, the 5 Qualifying Questions, church strategy, IUL positioning, and everything else from your playbook.\n\nWhat are we working on today — outreach, objection handling, content creation, or team building?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    setError('');
    const userMessage: Message = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsStreaming(true);

    // Add empty assistant placeholder to stream into
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          userName: user?.name ?? 'Agent',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error ?? 'Request failed');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No response stream');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      if (msg.includes('ANTHROPIC_API_KEY')) {
        setError('API key not configured. Add your ANTHROPIC_API_KEY to .env.local and restart the dev server.');
      } else {
        setError(msg);
      }
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = () => sendMessage(input);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `Hi ${firstName}! 👋 Fresh session started. What are we working on — outreach, objections, content, or team building?`,
    }]);
    setError('');
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">AI Sales Coach</h1>
            <p className="text-xs text-green-600 font-medium">● Team Dominion Knowledge Base · Online 24/7</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Clear chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">🤖</span>
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-5 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm'
                }`}
              >
                {msg.content}
                {/* Streaming cursor */}
                {msg.role === 'assistant' && isStreaming && i === messages.length - 1 && msg.content.length > 0 && (
                  <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse rounded-sm align-middle" />
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator while first chunk loads */}
          {isStreaming && messages[messages.length - 1]?.content === '' && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">🤖</span>
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm border border-gray-100 flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-8 py-5 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          {/* Error banner */}
          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-4 py-2.5">
              ⚠️ {error}
            </div>
          )}

          {/* Quick prompts */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                disabled={isStreaming}
                className="bg-gray-100 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40 transition-colors text-xs px-3 py-1.5 rounded-full text-gray-600"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input row */}
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder="Ask about scripts, objections, outreach, team building…"
              className="flex-1 bg-gray-100 rounded-xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60"
            />
            <button
              onClick={handleSubmit}
              disabled={isStreaming || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-colors text-white px-6 py-3 rounded-xl text-sm font-medium min-w-[80px]"
            >
              {isStreaming ? '…' : 'Send ➤'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
