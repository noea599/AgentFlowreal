import Link from 'next/link';
import Logo from '@/components/Logo';

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI Sales Coach',
    desc: 'Get instant answers to objections, generate personalized scripts, and receive coaching 24/7 — without waiting for your upline.',
    color: 'bg-blue-50',
  },
  {
    icon: '📄',
    title: 'Script Library',
    desc: 'Access a proven library of scripts for every situation — cold outreach, objection handling, closing, and follow-ups.',
    color: 'bg-green-50',
  },
  {
    icon: '🎯',
    title: 'Daily Activity Tracker',
    desc: 'Set your intensity level and check off your daily tasks. Stay consistent and watch your results compound.',
    color: 'bg-purple-50',
  },
  {
    icon: '📚',
    title: 'Training Center',
    desc: 'Master the Blue Screen presentation, objection handling, and church strategy with structured courses.',
    color: 'bg-orange-50',
  },
  {
    icon: '👥',
    title: 'Team Dashboard',
    desc: "Recruit, track, and motivate your team in one place. See who's producing and who needs a push.",
    color: 'bg-pink-50',
  },
];

const STATS = [
  { value: '2,400+', label: 'Agents using AgentFlow' },
  { value: '18,000+', label: 'Deals closed this year' },
  { value: '94%', label: 'Report closing more deals' },
];

const STEPS = [
  { step: '1', title: 'Open App', desc: "See your stats & today's goals" },
  { step: '2', title: 'Set Intensity', desc: 'Choose your energy level' },
  { step: '3', title: 'Grab a Script', desc: 'Find the right template fast' },
  { step: '4', title: 'Ask the Coach', desc: 'Handle any objection' },
  { step: '5', title: 'Close the Deal', desc: 'Track and celebrate!' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <span className="font-bold text-gray-900 text-lg">
              Agent<span className="text-blue-600">Flow</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span>🚀</span> AI-powered tools for insurance &amp; sales agents
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Remove the Friction.<br />
          <span className="text-blue-600">Close More Deals.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          AgentFlow gives you the scripts, coaching, and daily structure to turn more
          conversations into closed policies — without burning out.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/signup"
            className="bg-blue-600 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 text-lg"
          >
            Start for Free →
          </Link>
          <Link
            href="/login"
            className="text-gray-600 font-medium px-8 py-4 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors text-lg"
          >
            Log in
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">No credit card required</p>
      </section>

      {/* Stats bar */}
      <section className="bg-blue-600 py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center text-white">
              <p className="text-4xl font-bold">{stat.value}</p>
              <p className="text-sm opacity-80 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need to close deals</h2>
          <p className="text-gray-500 text-lg">Five powerful tools, one simple platform.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className={`${f.color} rounded-2xl p-6`}>
              <span className="text-4xl">{f.icon}</span>
              <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
          {/* CTA card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white flex flex-col justify-between">
            <div>
              <span className="text-4xl">⚡</span>
              <h3 className="text-lg font-bold mt-4 mb-2">Ready to level up?</h3>
              <p className="text-sm opacity-80 leading-relaxed">
                Join thousands of agents who are already closing more deals with AgentFlow.
              </p>
            </div>
            <Link
              href="/signup"
              className="mt-6 bg-white text-blue-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-center block"
            >
              Get Started Free →
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-500 text-lg">From open to close in 5 simple steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {STEPS.map((item, i) => (
              <div key={item.step} className="flex flex-col items-center text-center relative">
                {i < 4 && (
                  <div className="hidden md:block absolute top-5 left-[60%] w-full h-0.5 bg-blue-200 z-0" />
                )}
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm z-10 shadow-md">
                  {item.step}
                </div>
                <p className="font-semibold text-gray-800 mt-3 text-sm">{item.title}</p>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Start closing more deals today.</h2>
        <p className="text-gray-500 text-lg mb-8">Join 2,400+ agents already using AgentFlow.</p>
        <Link
          href="/signup"
          className="inline-block bg-blue-600 text-white font-semibold px-10 py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 text-lg"
        >
          Get Started Free →
        </Link>
        <p className="text-sm text-gray-400 mt-4">No credit card required · Cancel anytime</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span className="font-semibold text-gray-600">AgentFlow</span>
          </div>
          <p>© 2025 AgentFlow · Remove the Friction. Close More Deals.</p>
        </div>
      </footer>
    </div>
  );
}
