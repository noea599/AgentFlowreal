'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Tab } from '@/components/BottomNav';
import QUESTIONS, {
  ExamQuestion,
  Category,
  CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_COLORS,
} from '@/lib/examQuestions';

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

type StudyMode = 'dashboard' | 'quiz' | 'flashcards' | 'review' | 'ai-generate';
type QuizState = 'answering' | 'correct' | 'incorrect';

interface ExamProgress {
  round: number;
  answeredIds: number[];
  correctIds: number[];
  wrongIds: number[];
  categoryStats: Record<Category, { correct: number; total: number }>;
  examDate: string | null;
  totalRoundsCompleted: number;
}

const EMPTY_PROGRESS: ExamProgress = {
  round: 1,
  answeredIds: [],
  correctIds: [],
  wrongIds: [],
  categoryStats: Object.fromEntries(
    CATEGORIES.map((c) => [c, { correct: 0, total: 0 }])
  ) as Record<Category, { correct: number; total: number }>,
  examDate: null,
  totalRoundsCompleted: 0,
};

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════

function loadProgress(): ExamProgress {
  try {
    const stored = localStorage.getItem('agentflow_exam_progress');
    if (stored) return JSON.parse(stored);
  } catch {}
  return { ...EMPTY_PROGRESS };
}

function saveProgress(p: ExamProgress) {
  localStorage.setItem('agentflow_exam_progress', JSON.stringify(p));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95;
  u.pitch = 1;
  window.speechSynthesis.speak(u);
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════

export default function ExamPrepScreen({
  onTabChange: _onTabChange,
}: {
  onTabChange: (tab: Tab) => void;
}) {
  const [mode, setMode] = useState<StudyMode>('dashboard');
  const [progress, setProgress] = useState<ExamProgress>(EMPTY_PROGRESS);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<ExamQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizState, setQuizState] = useState<QuizState>('answering');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Flashcard state
  const [flashcardQuestions, setFlashcardQuestions] = useState<ExamQuestion[]>([]);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // AI generate state
  const [aiCategory, setAiCategory] = useState<Category>('Life Insurance Basics');
  const [aiState, setAiState] = useState('TX');
  const [aiCount, setAiCount] = useState(10);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<ExamQuestion[]>([]);
  const [aiError, setAiError] = useState('');
  const [aiQuizIndex, setAiQuizIndex] = useState(0);
  const [aiQuizState, setAiQuizState] = useState<QuizState>('answering');
  const [aiSelectedAnswer, setAiSelectedAnswer] = useState<number | null>(null);

  // Exam date modal
  const [showDateModal, setShowDateModal] = useState(false);
  const [dateInput, setDateInput] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Load progress on mount
  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  // Save progress on change
  const updateProgress = useCallback((updater: (prev: ExamProgress) => ExamProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveProgress(next);
      return next;
    });
  }, []);

  // ═══════════════════════════════════════════════════
  // QUIZ LOGIC
  // ═══════════════════════════════════════════════════

  const startQuiz = (category: Category | 'all', wrongOnly = false) => {
    let pool = category === 'all' ? QUESTIONS : QUESTIONS.filter((q) => q.category === category);
    if (wrongOnly) pool = pool.filter((q) => progress.wrongIds.includes(q.id));
    if (pool.length === 0) return;
    setQuizQuestions(shuffle(pool));
    setQuizIndex(0);
    setQuizState('answering');
    setSelectedAnswer(null);
    setMode('quiz');
  };

  const answerQuiz = (optionIndex: number) => {
    if (quizState !== 'answering') return;
    const q = quizQuestions[quizIndex];
    const isCorrect = optionIndex === q.correctIndex;
    setSelectedAnswer(optionIndex);
    setQuizState(isCorrect ? 'correct' : 'incorrect');

    if (audioEnabled) {
      speak(isCorrect ? 'Correct!' : `Incorrect. The answer is: ${q.options[q.correctIndex]}`);
    }

    updateProgress((prev) => {
      const next = { ...prev };
      if (!next.answeredIds.includes(q.id)) {
        next.answeredIds = [...next.answeredIds, q.id];
      }
      if (isCorrect) {
        if (!next.correctIds.includes(q.id)) next.correctIds = [...next.correctIds, q.id];
        next.wrongIds = next.wrongIds.filter((id) => id !== q.id);
      } else {
        if (!next.wrongIds.includes(q.id)) next.wrongIds = [...next.wrongIds, q.id];
      }
      // Update category stats
      const cat = q.category;
      const stats = { ...next.categoryStats[cat] };
      stats.total += 1;
      if (isCorrect) stats.correct += 1;
      next.categoryStats = { ...next.categoryStats, [cat]: stats };

      // Check round completion (answered all questions)
      if (next.answeredIds.length >= QUESTIONS.length) {
        next.totalRoundsCompleted += 1;
        next.round += 1;
        next.answeredIds = [];
      }
      return next;
    });
  };

  const nextQuizQuestion = () => {
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(quizIndex + 1);
      setQuizState('answering');
      setSelectedAnswer(null);
    } else {
      setMode('dashboard');
    }
  };

  // ═══════════════════════════════════════════════════
  // FLASHCARD LOGIC
  // ═══════════════════════════════════════════════════

  const startFlashcards = (category: Category | 'all') => {
    let pool = category === 'all' ? QUESTIONS : QUESTIONS.filter((q) => q.category === category);
    if (pool.length === 0) return;
    setFlashcardQuestions(shuffle(pool));
    setFlashcardIndex(0);
    setFlipped(false);
    setMode('flashcards');
  };

  // ═══════════════════════════════════════════════════
  // AI GENERATE LOGIC
  // ═══════════════════════════════════════════════════

  const generateAiQuestions = useCallback(async (state?: string, category?: Category, count?: number) => {
    const s = state ?? aiState;
    const c = category ?? aiCategory;
    const n = count ?? aiCount;
    setAiLoading(true);
    setAiError('');
    setAiQuestions([]);
    try {
      const res = await fetch('/api/exam-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: s, category: c, count: n }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || 'Failed to generate questions');
      }
      const data = await res.json();
      setAiQuestions(data.questions || []);
      setAiQuizIndex(0);
      setAiQuizState('answering');
      setAiSelectedAnswer(null);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to generate questions');
    } finally {
      setAiLoading(false);
    }
  }, [aiState, aiCategory, aiCount]);

  // Auto-generate questions when entering AI mode or changing state/category
  useEffect(() => {
    if (mode === 'ai-generate' && aiQuestions.length === 0 && !aiLoading && !aiError) {
      generateAiQuestions();
    }
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const answerAiQuiz = (optionIndex: number) => {
    if (aiQuizState !== 'answering') return;
    const q = aiQuestions[aiQuizIndex];
    const isCorrect = optionIndex === q.correctIndex;
    setAiSelectedAnswer(optionIndex);
    setAiQuizState(isCorrect ? 'correct' : 'incorrect');
    if (audioEnabled) {
      speak(isCorrect ? 'Correct!' : `Incorrect. The answer is: ${q.options[q.correctIndex]}`);
    }
  };

  const nextAiQuestion = () => {
    if (aiQuizIndex < aiQuestions.length - 1) {
      setAiQuizIndex(aiQuizIndex + 1);
      setAiQuizState('answering');
      setAiSelectedAnswer(null);
    }
  };

  // ═══════════════════════════════════════════════════
  // STATS
  // ═══════════════════════════════════════════════════

  const totalAnswered = progress.answeredIds.length;
  const totalCorrect = progress.correctIds.length;
  const totalWrong = progress.wrongIds.length;
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / QUESTIONS.length) * 100) : 0;
  const roundProgress = Math.round((totalAnswered / QUESTIONS.length) * 100);

  // ═══════════════════════════════════════════════════
  // RENDER: QUIZ MODE
  // ═══════════════════════════════════════════════════

  const renderQuizCard = (
    q: ExamQuestion,
    state: QuizState,
    selected: number | null,
    onAnswer: (i: number) => void,
    onNext: () => void,
    index: number,
    total: number,
  ) => {
    const catColor = CATEGORY_COLORS[q.category];
    return (
      <div className="max-w-3xl mx-auto">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Question {index + 1} of {total}</span>
            <span style={{ background: catColor.bg, color: catColor.text, padding: '2px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
              {CATEGORY_ICONS[q.category]} {q.category}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${((index + 1) / total) * 100}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-4">
          <div className="flex items-start gap-3 mb-6">
            <span className="text-2xl">{CATEGORY_ICONS[q.category]}</span>
            <h2 className="text-lg font-bold text-gray-900 leading-relaxed">{q.question}</h2>
            {audioEnabled && (
              <button
                onClick={() => speak(q.question)}
                className="text-blue-500 hover:text-blue-700 flex-shrink-0 text-xl"
                title="Read question aloud"
              >
                🔊
              </button>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              let optClass = 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300 cursor-pointer';
              if (state !== 'answering') {
                if (i === q.correctIndex) optClass = 'bg-green-50 border-green-400 ring-2 ring-green-300';
                else if (i === selected && state === 'incorrect') optClass = 'bg-red-50 border-red-400 ring-2 ring-red-300';
                else optClass = 'bg-gray-50 border-gray-200 opacity-60';
              } else if (i === selected) {
                optClass = 'bg-blue-50 border-blue-400';
              }
              return (
                <button
                  key={i}
                  onClick={() => onAnswer(i)}
                  disabled={state !== 'answering'}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${optClass}`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    state !== 'answering' && i === q.correctIndex
                      ? 'bg-green-500 text-white'
                      : state !== 'answering' && i === selected && state === 'incorrect'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm font-medium text-gray-800">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rationale */}
        {state !== 'answering' && (
          <div className={`rounded-2xl p-6 mb-4 border-2 ${
            state === 'correct'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{state === 'correct' ? '✅' : '❌'}</span>
              <span className={`font-bold ${state === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
                {state === 'correct' ? 'Correct!' : 'Incorrect'}
              </span>
              {audioEnabled && (
                <button onClick={() => speak(q.rationale)} className="text-blue-500 hover:text-blue-700 text-lg ml-2">🔊</button>
              )}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{q.rationale}</p>
            {state === 'incorrect' && (
              <p className="text-sm font-semibold text-green-700 mt-2">
                Correct answer: {String.fromCharCode(65 + q.correctIndex)} — {q.options[q.correctIndex]}
              </p>
            )}
          </div>
        )}

        {/* Next button */}
        {state !== 'answering' && (
          <button
            onClick={onNext}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            {index < total - 1 ? 'Next Question →' : 'Finish & Return to Dashboard'}
          </button>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════
  // RENDER: FLASHCARD MODE
  // ═══════════════════════════════════════════════════

  const renderFlashcards = () => {
    if (flashcardQuestions.length === 0) return null;
    const q = flashcardQuestions[flashcardIndex];
    const catColor = CATEGORY_COLORS[q.category];
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setMode('dashboard')} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
          <span className="text-sm text-gray-500">{flashcardIndex + 1} / {flashcardQuestions.length}</span>
          <button onClick={() => setAudioEnabled(!audioEnabled)} className={`text-lg ${audioEnabled ? 'text-blue-600' : 'text-gray-400'}`}>
            {audioEnabled ? '🔊' : '🔇'}
          </button>
        </div>

        {/* Card */}
        <div
          onClick={() => {
            setFlipped(!flipped);
            if (!flipped && audioEnabled) speak(q.options[q.correctIndex] + '. ' + q.rationale);
          }}
          className="cursor-pointer select-none"
        >
          <div className={`rounded-2xl shadow-lg border-2 p-10 min-h-[320px] flex flex-col items-center justify-center text-center transition-all duration-300 ${
            flipped
              ? 'bg-green-50 border-green-300'
              : 'bg-white border-gray-200 hover:border-blue-300'
          }`}>
            <span className="text-xs font-bold uppercase tracking-wider mb-4"
              style={{ color: catColor.text, background: catColor.bg, padding: '4px 12px', borderRadius: 6 }}>
              {CATEGORY_ICONS[q.category]} {q.category}
            </span>

            {!flipped ? (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-4 leading-relaxed">{q.question}</h2>
                <p className="text-sm text-gray-400">Tap to reveal answer</p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-green-700 mb-4">{q.options[q.correctIndex]}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{q.rationale}</p>
              </>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => { setFlashcardIndex(Math.max(0, flashcardIndex - 1)); setFlipped(false); }}
            disabled={flashcardIndex === 0}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold disabled:opacity-30 hover:bg-gray-50"
          >
            ← Previous
          </button>
          <button
            onClick={() => {
              if (flashcardIndex < flashcardQuestions.length - 1) {
                setFlashcardIndex(flashcardIndex + 1);
                setFlipped(false);
              } else {
                setMode('dashboard');
              }
            }}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            {flashcardIndex < flashcardQuestions.length - 1 ? 'Next →' : 'Done ✓'}
          </button>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════
  // RENDER: CONCEPTS TO MASTER (Practice Panel)
  // ═══════════════════════════════════════════════════

  const renderReview = () => {
    const wrongQuestions = QUESTIONS.filter((q) => progress.wrongIds.includes(q.id));
    // Group wrong answers by category for focused practice
    const wrongByCategory = CATEGORIES.reduce((acc, cat) => {
      const qs = wrongQuestions.filter((q) => q.category === cat);
      if (qs.length > 0) acc.push({ category: cat, questions: qs });
      return acc;
    }, [] as { category: Category; questions: ExamQuestion[] }[]);

    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setMode('dashboard')} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
          <h2 className="text-lg font-bold text-gray-900">🔁 Concepts to Master</h2>
          <span className="text-sm text-gray-500">{wrongQuestions.length} concepts</span>
        </div>

        {/* Practice CTA */}
        {wrongQuestions.length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border-2 border-red-200 p-5 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-bold text-gray-900 text-sm">Practice these until you get them right</p>
                <p className="text-xs text-gray-500 mt-1">
                  Wrong answers are stored here automatically. Keep practicing — once you answer correctly, they&apos;ll be removed.
                </p>
              </div>
              <button
                onClick={() => startQuiz('all', true)}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-sm whitespace-nowrap"
              >
                🔁 Practice All ({wrongQuestions.length})
              </button>
            </div>
          </div>
        )}

        {wrongQuestions.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">🎉</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">All concepts mastered!</h3>
            <p className="text-gray-500">You have no wrong answers. Keep studying to maintain your streak.</p>
          </div>
        ) : (
          <>
            {/* Practice by category buttons */}
            {wrongByCategory.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {wrongByCategory.map(({ category, questions: qs }) => {
                  const cc = CATEGORY_COLORS[category];
                  return (
                    <button
                      key={category}
                      onClick={() => startQuiz(category, true)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-80 transition-all"
                      style={{ background: cc.bg, color: cc.text }}
                    >
                      {CATEGORY_ICONS[category]} {category} ({qs.length})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Wrong answer cards with simplified explanations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wrongQuestions.map((q) => {
                const catColor = CATEGORY_COLORS[q.category];
                return (
                  <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-red-100 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold px-2 py-1 rounded"
                        style={{ background: catColor.bg, color: catColor.text }}>
                        {CATEGORY_ICONS[q.category]} {q.category}
                      </span>
                      {audioEnabled && (
                        <button onClick={() => speak(q.question + '. The answer is: ' + q.options[q.correctIndex] + '. ' + q.rationale)} className="text-blue-500 text-sm">🔊</button>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mb-3">{q.question}</p>
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200 mb-2">
                      <p className="text-xs font-bold text-green-700 mb-1">✅ Correct Answer:</p>
                      <p className="text-sm text-green-800 font-medium">{q.options[q.correctIndex]}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-xs font-bold text-blue-700 mb-1">💡 Why this is the answer:</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{q.rationale}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom practice button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => startQuiz('all', true)}
                className="px-8 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                🔁 Practice All Wrong Answers ({wrongQuestions.length})
              </button>
              <p className="text-xs text-gray-400 mt-2">Answer correctly to remove them from this panel</p>
            </div>
          </>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════
  // RENDER: AI GENERATE MODE
  // ═══════════════════════════════════════════════════

  const renderAiGenerate = () => (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setMode('dashboard')} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
        <h2 className="text-lg font-bold text-gray-900">🤖 AI Question Generator</h2>
        <button onClick={() => setAudioEnabled(!audioEnabled)} className={`text-lg ${audioEnabled ? 'text-blue-600' : 'text-gray-400'}`}>
          {audioEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {/* State / Category / Count selectors — always visible */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">State</label>
            <select
              value={aiState}
              onChange={(e) => {
                const newState = e.target.value;
                setAiState(newState);
                generateAiQuestions(newState, aiCategory, aiCount);
              }}
              className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:outline-none"
            >
              {['TX','NY','CA','FL','GA','LA','KY','MD','IL','OH','PA','NJ','VA','NC','AZ','CO','CT','MA','MI','MN','TN','WA','WI'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Category</label>
            <select
              value={aiCategory}
              onChange={(e) => {
                const newCat = e.target.value as Category;
                setAiCategory(newCat);
                generateAiQuestions(aiState, newCat, aiCount);
              }}
              className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Questions</label>
            <select
              value={aiCount}
              onChange={(e) => {
                const newCount = Number(e.target.value);
                setAiCount(newCount);
                generateAiQuestions(aiState, aiCategory, newCount);
              }}
              className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:outline-none"
            >
              {[5, 10, 15, 20].map((n) => (
                <option key={n} value={n}>{n} questions</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {aiLoading && (
        <div className="text-center py-16">
          <div className="inline-block w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-gray-700">Generating {aiCount} questions for {aiState}...</p>
          <p className="text-xs text-gray-400 mt-1">This may take a few seconds</p>
        </div>
      )}

      {/* Error state */}
      {aiError && !aiLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-700 mb-3">⚠️ {aiError}</p>
          <button
            onClick={() => generateAiQuestions()}
            className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* AI Quiz */}
      {aiQuestions.length > 0 && !aiLoading && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-500">AI-Generated · {aiState} · {aiCategory}</span>
            <button
              onClick={() => generateAiQuestions()}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              🔄 New Questions
            </button>
          </div>
          {renderQuizCard(
            aiQuestions[aiQuizIndex],
            aiQuizState,
            aiSelectedAnswer,
            answerAiQuiz,
            nextAiQuestion,
            aiQuizIndex,
            aiQuestions.length,
          )}
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════
  // RENDER: DASHBOARD
  // ═══════════════════════════════════════════════════

  const renderDashboard = () => (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl p-7 text-white mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-lg uppercase tracking-wider">AgentFlow</span>
              <span className="text-xs bg-white/15 px-3 py-1 rounded-lg">Exam Prep</span>
            </div>
            <h1 className="text-2xl font-bold mb-1">Life &amp; Health Exam Prep</h1>
            <p className="text-sm opacity-75">300 questions · 8 categories · 3 rounds to mastery</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{overallAccuracy}%</p>
            <p className="text-xs opacity-70">Mastery Score</p>
          </div>
        </div>

        {/* Study Strategy Banner */}
        <div className="mt-5 bg-white/10 rounded-xl p-4">
          <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-2">Proven 2-Day Strategy</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="bg-white/10 rounded-lg p-2">
              <p className="text-lg font-bold">📱</p>
              <p className="text-xs">Study on Phone</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <p className="text-lg font-bold">3x</p>
              <p className="text-xs">Go Through 3 Times</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <p className="text-lg font-bold">🔁</p>
              <p className="text-xs">Practice Weak Areas</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <p className="text-lg font-bold">🎯</p>
              <p className="text-xs">Focus on Concepts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Countdown + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Exam Countdown */}
        <div
          onClick={() => setShowDateModal(true)}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-shadow"
        >
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Exam Date</p>
          {progress.examDate ? (
            <>
              <p className="text-3xl font-bold text-red-600">{daysUntil(progress.examDate)}</p>
              <p className="text-xs text-gray-500">days remaining</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(progress.examDate).toLocaleDateString()}</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-blue-600">Set Date</p>
              <p className="text-xs text-gray-400">Schedule ASAP!</p>
            </>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Round</p>
          <p className="text-3xl font-bold text-indigo-600">{progress.round}<span className="text-lg text-gray-400">/3</span></p>
          <p className="text-xs text-gray-500">{progress.totalRoundsCompleted} completed</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">This Round</p>
          <p className="text-3xl font-bold text-blue-600">{roundProgress}%</p>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${roundProgress}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Wrong Answers</p>
          <p className="text-3xl font-bold text-red-500">{totalWrong}</p>
          <p className="text-xs text-gray-500">to review</p>
        </div>
      </div>

      {/* Reward Tiers — Licensing Challenge */}
      <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🏆</span>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Licensing Speed Challenge</h3>
            <p className="text-xs text-gray-500">Get licensed aggressively — 3 days minimum, 3 weeks maximum</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Gold — 3 days */}
          <div className={`rounded-xl p-4 border-2 text-center transition-all ${
            progress.examDate && daysUntil(progress.examDate) <= 3
              ? 'bg-yellow-100 border-yellow-400 ring-2 ring-yellow-300 shadow-md'
              : 'bg-white border-gray-200'
          }`}>
            <span className="text-3xl block mb-2">🥇</span>
            <p className="font-bold text-gray-900 text-sm">Gold Medal</p>
            <p className="text-xs text-gray-500 mb-2">Licensed within 3 days</p>
            <p className="text-xl font-bold text-amber-600">$100</p>
            <p className="text-xs text-gray-400">Cash Prize</p>
          </div>
          {/* Silver — 1-2 weeks */}
          <div className={`rounded-xl p-4 border-2 text-center transition-all ${
            progress.examDate && daysUntil(progress.examDate) > 3 && daysUntil(progress.examDate) <= 14
              ? 'bg-gray-100 border-gray-400 ring-2 ring-gray-300 shadow-md'
              : 'bg-white border-gray-200'
          }`}>
            <span className="text-3xl block mb-2">🥈</span>
            <p className="font-bold text-gray-900 text-sm">Silver</p>
            <p className="text-xs text-gray-500 mb-2">Licensed within 1–2 weeks</p>
            <p className="text-xl font-bold text-gray-600">$50</p>
            <p className="text-xs text-gray-400">Cash Prize</p>
          </div>
          {/* Bronze — 3 weeks */}
          <div className={`rounded-xl p-4 border-2 text-center transition-all ${
            progress.examDate && daysUntil(progress.examDate) > 14 && daysUntil(progress.examDate) <= 21
              ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-200 shadow-md'
              : 'bg-white border-gray-200'
          }`}>
            <span className="text-3xl block mb-2">🥉</span>
            <p className="font-bold text-gray-900 text-sm">Bronze</p>
            <p className="text-xs text-gray-500 mb-2">Licensed within 3 weeks</p>
            <p className="text-xl font-bold text-orange-600">$20</p>
            <p className="text-xs text-gray-400">Cash Prize</p>
          </div>
        </div>
        {progress.examDate ? (
          <div className="mt-4 text-center">
            <p className="text-sm font-semibold text-gray-700">
              {daysUntil(progress.examDate) <= 3
                ? '🔥 You\'re targeting the Gold Medal — $100 cash prize!'
                : daysUntil(progress.examDate) <= 14
                  ? '💪 You\'re on track for Silver — $50 cash prize!'
                  : daysUntil(progress.examDate) <= 21
                    ? '👊 You\'re aiming for Bronze — $20 cash prize!'
                    : '⚠️ Your exam is more than 3 weeks away — schedule sooner to qualify for a prize!'}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-center text-sm text-amber-700 font-medium">
            Set your exam date above to see which prize tier you&apos;re targeting!
          </p>
        )}
      </div>

      {/* Audio Toggle */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xl">{audioEnabled ? '🔊' : '🔇'}</span>
          <div>
            <p className="text-sm font-bold text-gray-800">Audio Companion</p>
            <p className="text-xs text-gray-500">Read questions and rationale aloud</p>
          </div>
        </div>
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className={`relative w-12 h-7 rounded-full transition-colors ${audioEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${audioEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Study Modes */}
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Study Modes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Pop Quiz */}
        <button
          onClick={() => startQuiz(selectedCategory)}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-md hover:border-blue-200 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl group-hover:scale-110 transition-transform">📝</span>
            <div>
              <h3 className="font-bold text-gray-900">Pop Quiz Mode</h3>
              <p className="text-xs text-gray-500">Answer questions with instant rationale</p>
            </div>
          </div>
          <p className="text-xs text-blue-600 font-medium">AI-powered pop quiz with rationale →</p>
        </button>

        {/* Flashcards */}
        <button
          onClick={() => startFlashcards(selectedCategory)}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-md hover:border-purple-200 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl group-hover:scale-110 transition-transform">🃏</span>
            <div>
              <h3 className="font-bold text-gray-900">Flashcard Mode</h3>
              <p className="text-xs text-gray-500">Flip cards to learn concepts</p>
            </div>
          </div>
          <p className="text-xs text-purple-600 font-medium">Quizlet-style concept learning →</p>
        </button>

        {/* Concepts to Master */}
        <button
          onClick={() => setMode('review')}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-md hover:border-red-200 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl group-hover:scale-110 transition-transform">🔁</span>
            <div>
              <h3 className="font-bold text-gray-900">Concepts to Master</h3>
              <p className="text-xs text-gray-500">Practice wrong answers until you get them right</p>
            </div>
          </div>
          <p className="text-xs text-red-600 font-medium">{totalWrong} concepts to practice →</p>
        </button>

        {/* AI Generate */}
        <button
          onClick={() => setMode('ai-generate')}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-md hover:border-green-200 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl group-hover:scale-110 transition-transform">🤖</span>
            <div>
              <h3 className="font-bold text-gray-900">AI Question Generator</h3>
              <p className="text-xs text-gray-500">Generate state-specific questions with AI</p>
            </div>
          </div>
          <p className="text-xs text-green-600 font-medium">State-specific AI-generated questions →</p>
        </button>
      </div>

      {/* Category Filter */}
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Filter by Category</h2>
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All (300)
        </button>
        {CATEGORIES.map((cat) => {
          const count = QUESTIONS.filter((q) => q.category === cat).length;
          const cc = CATEGORY_COLORS[cat];
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'ring-2 ring-offset-1'
                  : 'hover:opacity-80'
              }`}
              style={{
                background: selectedCategory === cat ? cc.text : cc.bg,
                color: selectedCategory === cat ? 'white' : cc.text,
                borderColor: cc.border,
                ...(selectedCategory === cat ? { ringColor: cc.text } : {}),
              }}
            >
              {CATEGORY_ICONS[cat]} {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Category Mastery Grid */}
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Category Mastery</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {CATEGORIES.map((cat) => {
          const stats = progress.categoryStats[cat];
          const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
          const cc = CATEGORY_COLORS[cat];
          return (
            <div key={cat} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
              <span className="text-2xl">{CATEGORY_ICONS[cat]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{cat}</p>
                  <span className="text-xs font-bold ml-2" style={{ color: cc.text }}>{accuracy}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${accuracy}%`, background: cc.text }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{stats.correct}/{stats.total} correct</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivational Quote */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200 p-6 text-center mb-6">
        <p className="text-lg font-bold text-gray-800 mb-2">&quot;Go through all 300 questions at least 3 times. Focus on the CONCEPTS — not memorization.&quot;</p>
        <p className="text-sm text-gray-500">Study aggressively. 3 days to 3 weeks. No longer.</p>
      </div>

      {/* Reset Progress */}
      <div className="text-center">
        <button
          onClick={() => {
            if (confirm('Reset all exam progress? This cannot be undone.')) {
              const fresh = { ...EMPTY_PROGRESS };
              setProgress(fresh);
              saveProgress(fresh);
            }
          }}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Reset Progress
        </button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════
  // RENDER: EXAM DATE MODAL
  // ═══════════════════════════════════════════════════

  const renderDateModal = () => {
    if (!showDateModal) return null;
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
          <h3 className="text-lg font-bold text-gray-900 mb-2">📅 Set Your Exam Date</h3>
          <p className="text-sm text-gray-500 mb-4">Schedule the exam as soon as possible. The best time is NOW.</p>
          <input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm mb-4 focus:border-blue-500 focus:outline-none"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setShowDateModal(false)}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (dateInput) {
                  updateProgress((prev) => ({ ...prev, examDate: dateInput }));
                }
                setShowDateModal(false);
              }}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              Set Date
            </button>
          </div>
          {progress.examDate && (
            <button
              onClick={() => {
                updateProgress((prev) => ({ ...prev, examDate: null }));
                setShowDateModal(false);
              }}
              className="w-full mt-3 text-xs text-red-500 hover:text-red-700"
            >
              Remove exam date
            </button>
          )}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════

  return (
    <div ref={containerRef} className="p-6 md:p-8 min-h-screen bg-gray-50">
      {renderDateModal()}

      {mode === 'dashboard' && renderDashboard()}

      {mode === 'quiz' && quizQuestions.length > 0 && (
        <div>
          <div className="max-w-3xl mx-auto flex items-center justify-between mb-6">
            <button onClick={() => setMode('dashboard')} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
            <h2 className="text-lg font-bold text-gray-900">📝 Pop Quiz</h2>
            <button onClick={() => setAudioEnabled(!audioEnabled)} className={`text-lg ${audioEnabled ? 'text-blue-600' : 'text-gray-400'}`}>
              {audioEnabled ? '🔊' : '🔇'}
            </button>
          </div>
          {renderQuizCard(
            quizQuestions[quizIndex],
            quizState,
            selectedAnswer,
            answerQuiz,
            nextQuizQuestion,
            quizIndex,
            quizQuestions.length,
          )}
        </div>
      )}

      {mode === 'flashcards' && renderFlashcards()}
      {mode === 'review' && renderReview()}
      {mode === 'ai-generate' && renderAiGenerate()}
    </div>
  );
}
