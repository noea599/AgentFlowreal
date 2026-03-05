'use client';

import { useState, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

type StepType = 'action' | 'milestone' | 'conditional' | 'payment' | 'waiting' | 'training' | 'info' | 'celebration';
type ToastType = 'success' | 'celebration' | 'reminder' | 'nudge';

interface Step {
  action: string;
  url?: string;
  details: string;
  type: StepType;
  automatable: boolean;
  agentflow: string;
}

interface Phase {
  id: number;
  title: string;
  icon: string;
  color: string;
  bgLight: string;
  border: string;
  description: string;
  steps: Step[];
}

interface ToastData {
  msg: string;
  type: ToastType;
}

// ═══════════════════════════════════════════════════
// DATA: PHASES
// ═══════════════════════════════════════════════════

const phases: Phase[] = [
  {
    id: 1, title: "Registration", icon: "📝", color: "#2563EB", bgLight: "#EFF6FF", border: "#BFDBFE",
    description: "Create your WFG account and get started",
    steps: [
      { action: "Register with WFG", url: "registration.wfglaunch.com", details: "Create your WFG account. Your business partner (recruiter) should provide you with a registration link.", type: "action", automatable: true, agentflow: "Auto-send registration link + checklist upon recruit signup" }
    ]
  },
  {
    id: 2, title: "Pre-Licensing Course", icon: "📚", color: "#7C3AED", bgLight: "#F5F3FF", border: "#DDD6FE",
    description: "Complete the required pre-licensing education",
    steps: [
      { action: "Register for Pre-Licensing Course", url: "www.xcelsolutions.com", details: "Sign up for the state-required insurance pre-licensing education course. Course length and requirements vary by state.", type: "action", automatable: true, agentflow: "Direct link + state-specific course recommendation + progress tracking" },
      { action: "Complete the Course", details: "Study and pass all course modules. This is self-paced but typically takes 2-4 weeks depending on the state requirements.", type: "milestone", automatable: false, agentflow: "Study reminders, progress nudges, completion celebration notification" }
    ]
  },
  {
    id: 3, title: "State Exam", icon: "✍️", color: "#DC2626", bgLight: "#FEF2F2", border: "#FECACA",
    description: "Register for and pass your state licensing exam",
    steps: [
      { action: "Register for State Exam", url: "www.pearsonvue.com", details: "Schedule your state insurance licensing exam. The exam provider varies by state (e.g., Pearson VUE for Texas). Your pre-licensing course provider will guide you on which provider to use.", type: "action", automatable: true, agentflow: "State-specific exam provider link + scheduling reminder + exam prep tips" },
      { action: "Take and Pass the Exam", details: "Sit for the exam at a testing center. Results are typically immediate. If you don't pass, you can reschedule.", type: "milestone", automatable: false, agentflow: "Exam day reminder, motivational message, pass/fail next-step guidance" }
    ]
  },
  {
    id: 4, title: "License Application", icon: "🔐", color: "#EA580C", bgLight: "#FFF7ED", border: "#FED7AA",
    description: "Gather documents, get fingerprinted, and apply for your state license",
    steps: [
      { action: "Get Fingerprinted", url: "www.identogo.com", details: "Complete a fingerprint-based background check. Schedule an appointment at an IdentoGo location near you. Bring valid government-issued ID.", type: "action", automatable: true, agentflow: "Direct scheduling link + nearest location finder + what-to-bring checklist" },
      { action: "Notarized Proof of Residency (If Required)", details: "Some states (e.g., Georgia) require a notarized copy of proof of resident status. Check your state's specific requirements. Not all states require this.", type: "conditional", automatable: true, agentflow: "State-specific requirement check — show/hide this step based on agent's state" },
      { action: "Apply for State License", url: "www.nipr.com or www.sircon.com", details: "Submit your license application through NIPR or Sircon. You'll need: exam results, fingerprint confirmation, proof of residency (if applicable), and the application fee.", type: "action", automatable: true, agentflow: "Direct application link + fee estimator by state + document checklist" },
      { action: "Pay Application Fee", details: "Application fees vary significantly by state — from as low as $15 to as high as $2,250. Payment is made during the online application process.", type: "payment", automatable: true, agentflow: "State-specific fee display + payment confirmation tracking" },
      { action: "Receive Your License", details: "Your license will be emailed to you once approved. You can also download it from NIPR.com or Sircon.com. Save your license number — you'll need it for the next step.", type: "milestone", automatable: true, agentflow: "License receipt confirmation prompt + auto-store license number for next steps" }
    ]
  },
  {
    id: 5, title: "WFG Approval", icon: "✅", color: "#059669", bgLight: "#ECFDF5", border: "#A7F3D0",
    description: "Submit your license to WFG for verification and approval",
    steps: [
      { action: "Submit License to WFG", url: "www.wfglaunch.com", details: "Go to WFG Launch and enter your license number for approval. WFG will verify your credentials with the state. This is a one-time portal — once approved, this login will no longer work on this site.", type: "action", automatable: true, agentflow: "Pre-fill license number from previous step + submission confirmation" },
      { action: "Wait for WFG Verification", details: "WFG cross-checks your license with the state. Once verified and approved, your WFG Launch login will stop working — this is NORMAL and means you've been approved.", type: "waiting", automatable: true, agentflow: "Status check reminders + 'If your login stopped working, you're approved!' notification" },
      { action: "Access Your WFG Portal", url: "www.mywfg.com", details: "Use the SAME login credentials from WFG Launch to access MyWFG.com. This is now your permanent agent portal for everything WFG-related. Note: This login only works AFTER WFG has approved you.", type: "action", automatable: true, agentflow: "Auto-redirect to MyWFG + portal orientation video" },
      { action: "Create Your Custom WFG Website", url: "www.mywfg.com", details: "Once you have portal access, create your personalized WFG website. Upload a professional photo and fill in your information. This is your digital business card for prospects.", type: "action", automatable: true, agentflow: "Prompt to create website immediately after portal access + photo upload tips + reminder if not completed within 48hrs" }
    ]
  },
  {
    id: 6, title: "Required Training", icon: "🎓", color: "#0891B2", bgLight: "#ECFEFF", border: "#A5F3FC",
    description: "Complete mandatory WFG trainings before you can do business",
    steps: [
      { action: "Complete AML Training", details: "Anti-Money Laundering (AML) training is the FIRST required training. This must be completed before you can begin doing business. Available through your MyWFG portal.", type: "training", automatable: true, agentflow: "Direct link to AML course + completion tracking + certificate storage" },
      { action: "Complete WFG New Agent Training", details: "The second mandatory training. Covers WFG policies, procedures, compliance, and business practices. Both AML and this training are prerequisites before conducting any business.", type: "training", automatable: true, agentflow: "Sequential unlock — only shows after AML is complete + progress tracking" }
    ]
  },
  {
    id: 7, title: "Business Setup", icon: "💰", color: "#CA8A04", bgLight: "#FEFCE8", border: "#FDE68A",
    description: "Set up your payment method and carrier appointments",
    steps: [
      { action: "Set Up Direct Deposit", details: "Configure how you'll receive commission payments. Go to your MyWFG portal and find the 'Set Up Direct Deposit' section. You'll need your bank account and routing numbers.", type: "action", automatable: true, agentflow: "Direct link to deposit setup + bank info checklist + confirmation" },
      { action: "Apply for Carrier Appointments", details: "WFG is a platform connecting agents to insurance carriers. You must be individually appointed (approved) by each carrier you want to sell for. Apply through your MyWFG portal.", type: "action", automatable: true, agentflow: "Carrier checklist with apply links + status tracker per carrier" },
      { action: "Carrier Examples", details: "Transamerica, Nationwide, Pacific Life, National Life, Symmetry, and others. Each carrier has its own approval process and timeline. Apply to multiple carriers simultaneously.", type: "info", automatable: true, agentflow: "Recommended carriers list based on products agent wants to sell" },
      { action: "Receive Carrier Approvals", details: "Each carrier will email you once approved. You are now authorized to sell their products. Track which carriers have approved you — some take longer than others.", type: "milestone", automatable: true, agentflow: "Carrier approval status dashboard + 'You can now sell X products' notifications" }
    ]
  },
  {
    id: 8, title: "Business Partner Training", icon: "🤝", color: "#9333EA", bgLight: "#FAF5FF", border: "#E9D5FF",
    description: "Learn the 5 core skills from your business partner (or AgentFlow)",
    steps: [
      { action: "Blue Screen Presentation Training", details: "Learn the standard financial presentation (the 'Blue Screen') used to educate prospects about IUL and financial products. Traditionally taught by your business partner via Zoom or in-person.", type: "training", automatable: true, agentflow: "Video library: Blue Screen walkthrough + practice mode + recorded examples" },
      { action: "Illustration Training", details: "Learn how to create and explain product illustrations — the projections that show how IUL policies work for a specific client. Critical for closing.", type: "training", automatable: true, agentflow: "Step-by-step illustration tutorial videos + practice scenarios" },
      { action: "Application Process Training", details: "Learn how to submit a policy application for a client. Covers the forms, required information, and submission process through carrier platforms.", type: "training", automatable: true, agentflow: "Application walkthrough videos (by carrier) + checklist + common mistakes" },
      { action: "Policy Follow-Up Training", details: "After submitting a policy, learn how to track its status, respond to carrier requirements, submit additional documents (e-documents), and get the policy issued.", type: "training", automatable: true, agentflow: "Policy tracking tutorial + carrier platform walkthroughs + requirement response guides" },
      { action: "Prospecting Training", details: "Learn how to find and approach potential clients. Includes warm market strategies, referral techniques, and community outreach (including church strategy).", type: "training", automatable: true, agentflow: "Script library + prospecting playbooks + role-play with AI Coach" },
      { action: "Recruiting Training", details: "Learn how to identify, approach, and onboard new team members to build your organization and override income.", type: "training", automatable: true, agentflow: "Recruiting scripts + onboarding checklist + team building strategies" }
    ]
  },
  {
    id: 9, title: "Reading & Development", icon: "📖", color: "#6366F1", bgLight: "#EEF2FF", border: "#C7D2FE",
    description: "Theory 101 — Required reading to build your financial foundation",
    steps: [
      { action: "Theory 101 Reading Programme", details: "These five books form the Theory 101 curriculum recommended for every PLLA agent. Hard copies are strongly encouraged — the physical books help you retain the material and build your personal library.", type: "info", automatable: true, agentflow: "Curated reading list with summaries + reading tracker + key takeaway notes" },
      { action: "Theory 101 Books", details: "Track your reading progress below. Mark each book as you finish it — your leader will be notified so they can discuss key concepts with you. Hard copies are recommended over digital versions.", type: "info", automatable: true, agentflow: "Book club feature + discussion prompts + audio summary options" }
    ]
  },
  {
    id: 10, title: "First Policy & Beyond", icon: "🚀", color: "#16A34A", bgLight: "#F0FDF4", border: "#BBF7D0",
    description: "Submit your first policy and begin your business",
    steps: [
      { action: "Submit Your First Policy", details: "Apply everything you've learned: prospect → present → illustrate → apply. Submit your first policy through the carrier platform. This is a major milestone!", type: "milestone", automatable: true, agentflow: "First policy celebration + guided submission walkthrough + mentor notification" },
      { action: "Follow Up on Policy Status", details: "Check the carrier platform for any requirements. Respond to document requests. Track the policy through underwriting to issuance. Call the carrier if anything is unclear.", type: "action", automatable: true, agentflow: "Policy status tracker + requirement alerts + carrier contact info + follow-up reminders" },
      { action: "You're Now in Business!", details: "You've completed the full onboarding. From here, AgentFlow helps you with daily activity tracking, AI coaching, script library, and team building tools.", type: "celebration", automatable: true, agentflow: "Transition to daily productivity mode — Dashboard, AI Coach, Daily Tracker activate" }
    ]
  }
];

const typeStyles: Record<StepType, { label: string; color: string; bg: string }> = {
  action:      { label: "Action",      color: "#2563EB", bg: "#DBEAFE" },
  milestone:   { label: "Milestone",   color: "#16A34A", bg: "#DCFCE7" },
  conditional: { label: "Conditional", color: "#EA580C", bg: "#FFEDD5" },
  payment:     { label: "Payment",     color: "#CA8A04", bg: "#FEF9C3" },
  waiting:     { label: "Waiting",     color: "#6B7280", bg: "#F3F4F6" },
  training:    { label: "Training",    color: "#7C3AED", bg: "#EDE9FE" },
  info:        { label: "Info",        color: "#0891B2", bg: "#CFFAFE" },
  celebration: { label: "Complete!",   color: "#16A34A", bg: "#DCFCE7" }
};

// States that require notarized proof of residency
const NOTARIZATION_STATES = new Set(['GA', 'MS', 'AL']);

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY'
];

// ═══════════════════════════════════════════════════
// DATA: BOOKS
// ═══════════════════════════════════════════════════

const BOOKS = [
  { id: 'money-wealth-li',       title: 'Money, Wealth, Life Insurance', author: 'Jake Thompson'  },
  { id: 'retirement-miracle',    title: 'The Retirement Miracle',        author: ''               },
  { id: 'saving-your-future',    title: 'Saving Your Future',            author: ''               },
  { id: 'power-of-zero',         title: 'The Power of Zero',             author: 'David McKnight' },
  { id: 'stress-free-retirement',title: 'Stress-Free Retirement',        author: ''               },
];

// ═══════════════════════════════════════════════════
// AUTOMATION: TOAST MESSAGES
// ═══════════════════════════════════════════════════

function getToast(phase: Phase, stepIndex: number, step: Step): ToastData {
  // Phase 1 — Registration
  if (phase.id === 1)
    return { msg: '📤 Registration link queued — your recruit will receive an onboarding checklist automatically on signup!', type: 'success' };

  // Phase 2 — Pre-Licensing
  if (phase.id === 2 && stepIndex === 0)
    return { msg: '🎓 State-matched course recommended + direct link is ready. Progress tracking is now active.', type: 'success' };
  if (phase.id === 2 && stepIndex === 1)
    return { msg: '🎉 Course complete! Study reminders are set. You\'ll receive progress nudges to keep your momentum going.', type: 'celebration' };

  // By step type
  if (step.type === 'celebration')
    return { msg: '🚀 You\'re officially in business! Your full AgentFlow toolkit — Dashboard, AI Coach, Daily Tracker — is now active.', type: 'celebration' };
  if (step.type === 'milestone')
    return { msg: '🏆 Major milestone reached! You\'re making excellent progress on your licensing journey.', type: 'celebration' };
  if (step.type === 'training')
    return { msg: '📚 Study reminder set — we\'ll nudge you regularly to stay consistent with this training.', type: 'reminder' };
  if (step.type === 'waiting')
    return { msg: '⏳ Status check reminder set — we\'ll prompt you to follow up daily until this clears.', type: 'nudge' };
  if (step.type === 'payment')
    return { msg: '💳 Payment tracked. Moving to the next step.', type: 'success' };

  return { msg: '✅ Step complete — next action is now unlocked!', type: 'success' };
}

// ═══════════════════════════════════════════════════
// STUDY REMINDER CONTENT
// ═══════════════════════════════════════════════════

function getStudyReminder(step: Step): string | null {
  if (step.type !== 'training') return null;
  if (step.action.includes('AML'))
    return 'Block 2–3 hours this week. AML is mandatory and must be completed before your first policy. Find it in your MyWFG portal.';
  if (step.action.includes('New Agent'))
    return 'Complete this immediately after AML. It unlocks your full business capabilities. Schedule 3–4 hours in your calendar.';
  if (step.action.includes('Blue Screen'))
    return 'Schedule a practice run with your business partner. Watch the recording at least once before your first live presentation.';
  if (step.action.includes('Illustration'))
    return 'Run 3 practice illustrations before meeting a real client. Focus on explaining the numbers simply and clearly.';
  if (step.action.includes('Application'))
    return 'Complete one mock application with your business partner. Know every field before your first real submission.';
  if (step.action.includes('Follow-Up'))
    return 'Bookmark the carrier platforms now. Practice checking policy status before you submit your first policy.';
  if (step.action.includes('Prospecting'))
    return 'Write your warm market list — minimum 25 names. Block time this week to make your first 5 contacts.';
  if (step.action.includes('Recruiting'))
    return 'Identify 3 people in your network who could benefit from this opportunity. Practice the recruiting approach this week.';
  return 'Schedule dedicated study time for this training. Consistency is the key to mastery.';
}

// ═══════════════════════════════════════════════════
// TOAST COMPONENT
// ═══════════════════════════════════════════════════

function Toast({ data, onClose }: { data: ToastData; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles: Record<ToastType, { bg: string; border: string }> = {
    success:     { bg: '#064E3B', border: '#059669' },
    celebration: { bg: '#4C1D95', border: '#7C3AED' },
    reminder:    { bg: '#1E3A8A', border: '#2563EB' },
    nudge:       { bg: '#78350F', border: '#D97706' },
  };
  const s = styles[data.type];

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, maxWidth: 400, zIndex: 9999,
      background: s.bg, color: 'white', borderRadius: 14,
      padding: '14px 18px', border: `1px solid ${s.border}`,
      boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
      display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 13, fontWeight: 600, lineHeight: 1.5,
    }}>
      <span style={{ flex: 1 }}>{data.msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 20, cursor: 'pointer', padding: 0, lineHeight: 1, flexShrink: 0 }}>×</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════

export default function OnboardingScreen() {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [agentState, setAgentState]         = useState('');
  const [toast, setToast]                   = useState<ToastData | null>(null);
  const [viewMode, setViewMode]             = useState<'timeline' | 'compact'>('timeline');
  const [expandedPhase, setExpandedPhase]   = useState<number | null>(null);
  const [booksRead, setBooksRead]           = useState<Set<string>>(new Set());

  // ── localStorage: load on mount ───────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem('agentflow_progress');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.completedSteps) setCompletedSteps(new Set(data.completedSteps));
        if (data.booksRead)      setBooksRead(new Set(data.booksRead));
      }
    } catch (_) {}
  }, []);

  // ── localStorage: save on change ──────────────────
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('agentflow_user') || '{}');
      localStorage.setItem('agentflow_progress', JSON.stringify({
        completedSteps: [...completedSteps],
        booksRead:      [...booksRead],
        memberName:     user.name || 'Agent',
        lastUpdated:    new Date().toISOString(),
      }));
    } catch (_) {}
  }, [completedSteps, booksRead]);

  // ── Leader notification writer ─────────────────────
  const addLeaderNotif = (action: string, type: string) => {
    try {
      const user       = JSON.parse(localStorage.getItem('agentflow_user') || '{}');
      const memberName = user.name || 'Agent';
      const stored     = localStorage.getItem('agentflow_leader_notifs');
      const notifs: unknown[] = stored ? JSON.parse(stored) : [];
      notifs.unshift({ id: `notif-${Date.now()}`, memberName, action, type, timestamp: new Date().toISOString(), read: false });
      localStorage.setItem('agentflow_leader_notifs', JSON.stringify((notifs as unknown[]).slice(0, 50)));
    } catch (_) {}
  };

  const key      = (phaseId: number, idx: number) => `${phaseId}-${idx}`;
  const isDone   = (phaseId: number, idx: number) => completedSteps.has(key(phaseId, idx));

  const phaseStats = (phase: Phase) => {
    const done = phase.steps.filter((_, i) => isDone(phase.id, i)).length;
    return { done, total: phase.steps.length, complete: done === phase.steps.length };
  };

  const overall = phases.reduce(
    (acc, p) => { const s = phaseStats(p); return { done: acc.done + s.done, total: acc.total + s.total }; },
    { done: 0, total: 0 }
  );

  const showToast = useCallback((data: ToastData) => setToast(data), []);

  const toggleStep = (phase: Phase, stepIndex: number, step: Step) => {
    const k = key(phase.id, stepIndex);
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(k)) {
        next.delete(k);
      } else {
        next.add(k);
        // Fire step-level automation toast
        showToast(getToast(phase, stepIndex, step));
        // Check if the whole phase is now complete
        const allDone = phase.steps.every((_, i) => i === stepIndex || next.has(key(phase.id, i)));
        if (allDone) {
          const msg = phase.id < 10
            ? `🏆 Phase ${phase.id} "${phase.title}" complete! Ready for Phase ${phase.id + 1}. Your leader has been notified.`
            : `🚀 All phases complete! You're fully onboarded. Your leader has been notified.`;
          setTimeout(() => {
            addLeaderNotif(`Completed Phase ${phase.id}: ${phase.title}`, 'phase');
            showToast({ msg, type: 'celebration' });
          }, 2000);
        }
      }
      return next;
    });
  };

  const toggleBook = (bookId: string, bookTitle: string) => {
    setBooksRead(prev => {
      const next = new Set(prev);
      if (next.has(bookId)) {
        next.delete(bookId);
      } else {
        next.add(bookId);
        addLeaderNotif(`Finished reading "${bookTitle}"`, 'book');
        showToast({ msg: `📚 "${bookTitle}" marked as read! Your leader has been notified.`, type: 'success' });
      }
      return next;
    });
  };

  // Conditional step visibility based on selected state
  const isVisible = (step: Step): boolean => {
    if (step.type !== 'conditional') return true;
    if (!agentState) return true; // show until state is known
    return NOTARIZATION_STATES.has(agentState);
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: 900, margin: '0 auto', padding: '24px 16px', background: '#FAFBFC' }}>

      {/* Toast */}
      {toast && <Toast data={toast} onClose={() => setToast(null)} />}

      {/* ── HEADER ───────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 55%, #7C3AED 100%)', borderRadius: 16, padding: '28px', color: 'white', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>AGENTFLOW</div>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 600 }}>× PLLA</div>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px 0' }}>Agent Onboarding</h1>
        <p style={{ fontSize: 13, opacity: 0.75, margin: '0 0 20px 0' }}>Promised Land Leadership Academy — Complete Workflow</p>

        {/* Overall progress bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
            <span style={{ fontWeight: 600, opacity: 0.9 }}>Overall Progress</span>
            <span style={{ fontWeight: 800 }}>{overall.done} / {overall.total} steps complete</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 8, height: 10, overflow: 'hidden' }}>
            <div style={{
              width: `${overall.total > 0 ? (overall.done / overall.total) * 100 : 0}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #34D399, #60A5FA)',
              borderRadius: 8,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      </div>

      {/* ── STATE SELECTOR ───────────────────────────── */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>📍 Your State:</span>
        <select
          value={agentState}
          onChange={e => setAgentState(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: 8, border: '2px solid #E5E7EB', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer', background: 'white' }}
        >
          <option value="">Select your state...</option>
          {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {agentState && (
          <span style={{
            fontSize: 12, fontWeight: 600,
            color:      NOTARIZATION_STATES.has(agentState) ? '#DC2626' : '#059669',
            background: NOTARIZATION_STATES.has(agentState) ? '#FEF2F2' : '#ECFDF5',
            border:     `1px solid ${NOTARIZATION_STATES.has(agentState) ? '#FECACA' : '#A7F3D0'}`,
            padding: '4px 10px', borderRadius: 6,
          }}>
            {NOTARIZATION_STATES.has(agentState)
              ? '⚠️ Notarized proof of residency required in your state'
              : '✅ No notarization required in your state — Step 4.2 is skipped'}
          </span>
        )}
      </div>

      {/* ── STATS + VIEW TOGGLE ──────────────────────── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { label: 'Phases',    value: phases.length },
          { label: 'Steps',     value: overall.total },
          { label: 'Completed', value: overall.done },
          { label: 'Progress',  value: `${overall.total > 0 ? Math.round((overall.done / overall.total) * 100) : 0}%` },
        ].map((stat, i) => (
          <div key={i} style={{ flex: '1 1 70px', background: '#EFF6FF', borderRadius: 10, padding: '10px 12px', textAlign: 'center', border: '1px solid #BFDBFE' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1E40AF' }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: '#3B82F6', fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexShrink: 0 }}>
          {(['timeline', 'compact'] as const).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{
              padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13,
              border:      viewMode === mode ? '2px solid #2563EB' : '2px solid #E5E7EB',
              background:  viewMode === mode ? '#EFF6FF' : 'white',
              color:       viewMode === mode ? '#2563EB' : '#6B7280',
            }}>
              {mode === 'timeline' ? '📋 Detailed' : '⚡ Compact'}
            </button>
          ))}
        </div>
      </div>

      {/* ── PHASE LIST ───────────────────────────────── */}
      <div style={{ position: 'relative' }}>
        {viewMode === 'timeline' && (
          <div style={{ position: 'absolute', left: 23, top: 0, bottom: 0, width: 3, background: 'linear-gradient(to bottom, #2563EB, #7C3AED, #16A34A)', borderRadius: 2, zIndex: 0 }} />
        )}

        {phases.map(phase => {
          const stats       = phaseStats(phase);
          const isExpanded  = expandedPhase === phase.id;
          const isTimeline  = viewMode === 'timeline';

          return (
            <div key={phase.id} style={{ marginBottom: isTimeline ? 8 : 6, position: 'relative', zIndex: 1 }}>

              {/* Phase header */}
              <div
                onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                  padding: isTimeline ? '12px 16px 12px 0' : '10px 12px',
                  background: isExpanded ? phase.bgLight : stats.complete ? '#F0FDF4' : 'white',
                  borderRadius: 12,
                  border: `2px solid ${isExpanded ? phase.color : stats.complete ? '#6EE7B7' : '#E5E7EB'}`,
                  transition: 'all 0.2s ease',
                }}
              >
                {isTimeline && (
                  <div style={{
                    width: 46, height: 46, borderRadius: '50%', flexShrink: 0, zIndex: 2,
                    background: stats.complete ? '#059669' : phase.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                    boxShadow: `0 0 0 4px ${phase.bgLight}, 0 0 0 6px ${phase.border}`,
                  }}>
                    {stats.complete ? '✅' : phase.icon}
                  </div>
                )}
                {!isTimeline && <span style={{ fontSize: 20 }}>{stats.complete ? '✅' : phase.icon}</span>}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: phase.color, background: phase.bgLight, padding: '2px 8px', borderRadius: 4, letterSpacing: 0.5 }}>
                      PHASE {phase.id}
                    </span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#1F2937' }}>{phase.title}</h3>
                    {stats.complete && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#DCFCE7', padding: '2px 8px', borderRadius: 4 }}>COMPLETE</span>
                    )}
                  </div>
                  {isTimeline && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: '#6B7280' }}>{phase.description}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: stats.complete ? '#059669' : '#9CA3AF' }}>
                          {stats.done}/{stats.total}
                        </span>
                      </div>
                      <div style={{ background: '#F3F4F6', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                        <div style={{
                          width: `${(stats.done / stats.total) * 100}%`, height: '100%',
                          background: stats.complete ? '#059669' : phase.color,
                          borderRadius: 4, transition: 'width 0.4s ease',
                        }} />
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{stats.done}/{stats.total}</span>
                  <span style={{ fontSize: 18, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', color: '#9CA3AF' }}>▾</span>
                </div>
              </div>

              {/* Steps */}
              {isExpanded && (
                <div style={{ marginLeft: isTimeline ? 62 : 0, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {phase.steps.map((step, si) => {
                    const st      = typeStyles[step.type] || typeStyles.action;
                    const done    = isDone(phase.id, si);
                    const visible = isVisible(step);
                    const studyReminder = getStudyReminder(step);

                    // Skipped (conditional + state doesn't require)
                    if (!visible) {
                      return (
                        <div key={si} style={{ background: '#F9FAFB', borderRadius: 10, border: '1px dashed #D1D5DB', padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 15 }}>⏭️</span>
                            <span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 600, textDecoration: 'line-through' }}>{step.action}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#DCFCE7', padding: '2px 8px', borderRadius: 4 }}>
                              Not required in {agentState}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={si} style={{
                        background: done ? '#F0FDF4' : 'white',
                        borderRadius: 10,
                        border: `1px solid ${done ? '#6EE7B7' : phase.border}`,
                        padding: '14px 16px',
                        transition: 'all 0.25s ease',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          {/* Checkbox */}
                          <div
                            onClick={() => toggleStep(phase, si, step)}
                            style={{
                              width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 2,
                              border: done ? 'none' : `2px solid ${phase.color}`,
                              background: done ? phase.color : 'white',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', transition: 'all 0.2s',
                            }}
                          >
                            {done && <span style={{ color: 'white', fontSize: 12, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: 22, height: 22, borderRadius: '50%',
                                background: phase.bgLight, color: phase.color, fontSize: 11, fontWeight: 700, flexShrink: 0,
                              }}>{si + 1}</span>
                              <h4 style={{
                                fontSize: 14, fontWeight: 700, margin: 0,
                                color: done ? '#9CA3AF' : '#1F2937',
                                textDecoration: done ? 'line-through' : 'none',
                              }}>{step.action}</h4>
                              <span style={{ fontSize: 10, fontWeight: 700, color: st.color, background: st.bg, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                {st.label}
                              </span>
                            </div>

                            {/* URL links */}
                            {step.url && !done && (
                              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {step.url.split(/\s+(?:or|—|and|\|)\s+|,\s*/i).map((rawUrl, ui) => {
                                  const cleaned = rawUrl.replace(/[()]/g, '').trim();
                                  const href    = cleaned.startsWith('http') ? cleaned : `https://${cleaned}`;
                                  return (
                                    <a key={ui} href={href} target="_blank" rel="noopener noreferrer" style={{
                                      color: '#2563EB', fontFamily: 'monospace',
                                      background: '#EFF6FF', padding: '3px 8px', borderRadius: 4,
                                      textDecoration: 'none', border: '1px solid #BFDBFE',
                                    }}>🔗 {cleaned}</a>
                                  );
                                })}
                              </div>
                            )}

                            {/* Details */}
                            {!done && (
                              <p style={{ fontSize: 13, color: '#4B5563', margin: '4px 0 0 0', lineHeight: 1.5 }}>{step.details}</p>
                            )}
                          </div>
                        </div>

                        {/* ── AUTOMATION: Phase 1 — Send Registration Link ── */}
                        {phase.id === 1 && si === 0 && !done && (
                          <div style={{ marginTop: 12, marginLeft: 32, padding: '12px 14px', background: '#EFF6FF', borderRadius: 8, border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Automation — Recruit Signup</div>
                              <div style={{ fontSize: 12, color: '#1E40AF' }}>Copy the registration link to send to your new recruit. They&apos;ll receive an onboarding checklist automatically.</div>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard?.writeText('https://registration.wfglaunch.com');
                                showToast({ msg: '📋 Registration link copied to clipboard! Share it with your recruit — their checklist will be auto-sent on signup.', type: 'success' });
                              }}
                              style={{ padding: '8px 16px', borderRadius: 8, background: '#2563EB', color: 'white', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                            >
                              📋 Copy Registration Link
                            </button>
                          </div>
                        )}

                        {/* ── AUTOMATION: Phase 2, Step 0 — State-specific course rec ── */}
                        {phase.id === 2 && si === 0 && !done && (
                          <div style={{ marginTop: 12, marginLeft: 32, padding: '12px 14px', background: '#F5F3FF', borderRadius: 8, border: '1px solid #DDD6FE' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#5B21B6', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                              Automation — State-Specific Course
                            </div>
                            {agentState ? (
                              <div style={{ fontSize: 12, color: '#4C1D95', lineHeight: 1.5 }}>
                                <strong>State: {agentState}</strong> — Register at <a href="https://www.xcelsolutions.com" target="_blank" rel="noopener noreferrer" style={{ color: '#7C3AED' }}>xcelsolutions.com</a> and select <strong>{agentState}</strong> to get your state-specific pre-licensing requirements and course hours.
                                <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                                  <span style={{ fontSize: 11, background: '#EDE9FE', color: '#5B21B6', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>📊 Progress tracking active</span>
                                  <span style={{ fontSize: 11, background: '#EDE9FE', color: '#5B21B6', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>🎯 {agentState}-specific requirements loaded</span>
                                </div>
                              </div>
                            ) : (
                              <div style={{ fontSize: 12, color: '#6B7280' }}>
                                Select your state above to get a state-specific course recommendation and direct registration link.
                              </div>
                            )}
                          </div>
                        )}

                        {/* ── AUTOMATION: Phase 2, Step 1 — Study reminders + progress nudges ── */}
                        {phase.id === 2 && si === 1 && !done && (
                          <div style={{ marginTop: 12, marginLeft: 32, padding: '12px 14px', background: '#F0FDF4', borderRadius: 8, border: '1px solid #A7F3D0' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#065F46', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                              Automation — Study Reminders &amp; Progress Nudges
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              <span style={{ fontSize: 11, background: '#DCFCE7', color: '#065F46', padding: '4px 10px', borderRadius: 6, fontWeight: 600 }}>📅 Reminders: Every 2 days</span>
                              <span style={{ fontSize: 11, background: '#DCFCE7', color: '#065F46', padding: '4px 10px', borderRadius: 6, fontWeight: 600 }}>💡 Progress nudges: Active</span>
                              <span style={{ fontSize: 11, background: '#DCFCE7', color: '#065F46', padding: '4px 10px', borderRadius: 6, fontWeight: 600 }}>🎉 Completion celebration: Ready</span>
                            </div>
                            <div style={{ fontSize: 12, color: '#047857', marginTop: 8 }}>
                              Check the box above when you pass all course modules — your completion will be celebrated and you&apos;ll be automatically guided to Phase 3.
                            </div>
                          </div>
                        )}

                        {/* ── Study reminder card for all training steps ── */}
                        {studyReminder && !done && !(phase.id === 6) && (
                          <div style={{ marginTop: 12, marginLeft: 32, padding: '10px 14px', background: 'linear-gradient(135deg, #EFF6FF, #F5F3FF)', borderRadius: 8, border: '1px solid #C7D2FE', display: 'flex', gap: 10 }}>
                            <span style={{ fontSize: 16, flexShrink: 0 }}>📅</span>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 700, color: '#3730A3', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Study Reminder</div>
                              <div style={{ fontSize: 12, color: '#3730A3', lineHeight: 1.4 }}>{studyReminder}</div>
                            </div>
                          </div>
                        )}

                        {/* ── AUTOMATION: Phase 9, Step 1 — Books tracker ── */}
                        {phase.id === 9 && si === 1 && (
                          <div style={{ marginTop: 12, marginLeft: 32 }}>
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ fontSize: 15, fontWeight: 800, color: '#3730A3', marginBottom: 2 }}>Theory 101</div>
                              <div style={{ fontSize: 11, color: '#6366F1', fontWeight: 600 }}>
                                📚 Hard copies recommended — mark each book as you finish it
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {BOOKS.map(book => {
                                const isRead = booksRead.has(book.id);
                                return (
                                  <div
                                    key={book.id}
                                    onClick={() => toggleBook(book.id, book.title)}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                                      padding: '10px 12px', borderRadius: 8,
                                      background: isRead ? '#EEF2FF' : 'white',
                                      border: `1px solid ${isRead ? '#A5B4FC' : '#E5E7EB'}`,
                                      transition: 'all 0.2s',
                                    }}
                                  >
                                    <div style={{
                                      width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                                      border: isRead ? 'none' : '2px solid #6366F1',
                                      background: isRead ? '#6366F1' : 'white',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                      {isRead && <span style={{ color: 'white', fontSize: 11, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: 13, fontWeight: 700, color: isRead ? '#6366F1' : '#1F2937', textDecoration: isRead ? 'line-through' : 'none' }}>
                                        {book.title}
                                      </div>
                                      {book.author && (
                                        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>by {book.author}</div>
                                      )}
                                    </div>
                                    {isRead && (
                                      <span style={{ fontSize: 11, fontWeight: 700, color: '#6366F1', background: '#EEF2FF', padding: '2px 8px', borderRadius: 4, flexShrink: 0 }}>Read ✓</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            <div style={{ marginTop: 8, fontSize: 11, color: '#6B7280' }}>
                              Theory 101: {booksRead.size} of {BOOKS.length} books read · Your leader is notified as you progress
                            </div>
                          </div>
                        )}

                        {/* AML/New Agent Training (Phase 6) study reminders */}
                        {phase.id === 6 && !done && (
                          <div style={{ marginTop: 12, marginLeft: 32, padding: '10px 14px', background: '#ECFEFF', borderRadius: 8, border: '1px solid #A5F3FC', display: 'flex', gap: 10 }}>
                            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 700, color: '#0E7490', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Mandatory — Required Before First Policy</div>
                              <div style={{ fontSize: 12, color: '#0E7490', lineHeight: 1.4 }}>{studyReminder}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Phase complete banner */}
                  {stats.complete && (
                    <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, #ECFDF5, #F0FDF4)', borderRadius: 10, border: '2px solid #6EE7B7', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 26 }}>🎉</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#065F46' }}>Phase {phase.id} Complete!</div>
                        <div style={{ fontSize: 12, color: '#047857', marginTop: 2 }}>
                          All steps for &quot;{phase.title}&quot; are done.
                          {phase.id < 10 ? ` You're ready for Phase ${phase.id + 1}.` : ' You\'re fully onboarded — welcome to the business!'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: '#9CA3AF' }}>
        AgentFlow Onboarding Automation v1.0 • Disc Consult for PLLA • {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}
