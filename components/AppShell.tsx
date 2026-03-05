'use client';

import { useState } from 'react';
import { Tab } from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import DashboardScreen from '@/components/screens/DashboardScreen';
import CoachScreen from '@/components/screens/CoachScreen';
import TasksScreen from '@/components/screens/TasksScreen';
import ScriptsScreen from '@/components/screens/ScriptsScreen';
import TrainingScreen from '@/components/screens/TrainingScreen';
import TeamScreen from '@/components/screens/TeamScreen';
import OnboardingScreen from '@/components/screens/OnboardingScreen';
import ExamPrepScreen from '@/components/screens/ExamPrepScreen';

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const screenProps = { onTabChange: setActiveTab };

  const SCREENS: Record<Tab, React.ReactNode> = {
    home: <DashboardScreen {...screenProps} />,
    tasks: <TasksScreen {...screenProps} />,
    coach: <CoachScreen {...screenProps} />,
    scripts: <ScriptsScreen {...screenProps} />,
    team: <TeamScreen {...screenProps} />,
    onboarding: <OnboardingScreen />,
    exam: <ExamPrepScreen {...screenProps} />,
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar active={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        {SCREENS[activeTab]}
      </main>
    </div>
  );
}
