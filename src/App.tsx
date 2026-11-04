/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Login, UserSession } from './components/Login';
import { SimulationWorkspace } from './components/SimulationWorkspace';
import { AdminDashboard } from './components/AdminDashboard';
import { EnginePlayground } from './components/EnginePlayground';
import { EvaluationModal } from './components/EvaluationModal';
import { PricingModal } from './components/PricingModal';
import { TaskDeliverable, EvaluateSubmissionResponse, CompletedSimulation, CompanyPreset } from './types';
import { COMPANY_PRESETS, INITIAL_NIBM_COHORT, INITIAL_DEFAULT_TASK } from './data/presets';

const STORAGE_COHORT_KEY = 'SIMULATEHUB_NIBM_COHORT_V2';
const STORAGE_SESSION_KEY = 'SIMULATEHUB_NIBM_USER_SESSION';

export default function App() {
  // 1. Authentication & RBAC Session State (stores current user & selected plan)
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const savedSession = localStorage.getItem(STORAGE_SESSION_KEY);
      if (savedSession) {
        return JSON.parse(savedSession);
      }
    } catch (e) {
      console.warn('Failed to parse user session');
    }
    return null;
  });

  // Active navigation tab conditioned strictly by role
  const [activeTab, setActiveTab] = useState<'simulation' | 'dashboard' | 'playground'>('simulation');

  // Selected company and current task
  const [selectedCompany, setSelectedCompany] = useState<CompanyPreset>(COMPANY_PRESETS[0]);
  const [currentTask, setCurrentTask] = useState<TaskDeliverable>(INITIAL_DEFAULT_TASK);

  // Pricing & Institutional access modal
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [unlockedPlan, setUnlockedPlan] = useState('Institutional NIBM Premium');

  // Active evaluation modal
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<EvaluateSubmissionResponse | null>(null);
  const [lastTimeTakenMins, setLastTimeTakenMins] = useState<number>(75);

  // Cohort records (Admin & Student historical submissions)
  const [cohortRecords, setCohortRecords] = useState<CompletedSimulation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COHORT_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to read stored cohort records');
    }
    return INITIAL_NIBM_COHORT;
  });

  // Sync cohort records to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COHORT_KEY, JSON.stringify(cohortRecords));
    } catch (e) {
      console.warn('Failed to persist cohort records');
    }
  }, [cohortRecords]);

  // Sync user session to localStorage & enforce default view per role
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(currentUser));
      if (currentUser.plan) {
        localStorage.setItem('selectedPlan', currentUser.plan);
      }
      if (currentUser.role === 'admin') {
        setActiveTab('dashboard');
      } else {
        setActiveTab('simulation');
      }
    } else {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    }
  }, [currentUser]);

  // Login handler
  const handleLogin = (session: UserSession) => {
    if (session.plan) {
      localStorage.setItem('selectedPlan', session.plan);
    }
    setCurrentUser(session);
    if (session.role === 'admin') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('simulation');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_SESSION_KEY);
  };

  // Task updated (via generate_task or search_and_generate)
  const handleTaskUpdated = (task: TaskDeliverable, company: CompanyPreset) => {
    setCurrentTask(task);
    setSelectedCompany(company);
  };

  // Evaluation completed (via evaluate_submission)
  const handleEvaluationCompleted = (
    evaluation: EvaluateSubmissionResponse,
    timeTakenMins: number,
    submission: string,
    submissionType?: 'code' | 'pdf_document'
  ) => {
    setCurrentEvaluation(evaluation);
    setLastTimeTakenMins(timeTakenMins);
    setIsEvaluationOpen(true);

    const newRecord: CompletedSimulation = {
      id: `SIM-NIBM-${Date.now().toString().slice(-4)}`,
      studentName: currentUser?.name || 'Kasun Wickramasinghe',
      studentId: 'NIBM-BSE-22.1-018',
      companyName: selectedCompany.name,
      techStack:
        ('required_technology' in currentTask
          ? currentTask.required_technology
          : currentTask.detected_tech_stack) || selectedCompany.techStack,
      task: currentTask,
      submission,
      submissionType: submissionType || 'code',
      timeTakenMins,
      evaluation,
      completedAt: new Date().toISOString(),
    };
    setCohortRecords((prev) => [newRecord, ...prev]);
  };

  const handleSelectRecord = (record: CompletedSimulation) => {
    setCurrentTask(record.task);
    setCurrentEvaluation(record.evaluation);
    setLastTimeTakenMins(record.timeTakenMins);
    setIsEvaluationOpen(true);
  };

  const handleApplyPromoSuccess = (code: string) => {
    setUnlockedPlan(`Unlocked: ${code} (Pro Plan)`);
    localStorage.setItem('selectedPlan', 'pro');
    setCurrentUser((prev) => (prev ? { ...prev, plan: 'pro' } : null));
    window.dispatchEvent(new Event('storage'));
  };

  // -------------------------------------------------------------------------
  // RULE 6: If user is not logged in, STRICTLY ONLY render the Login/Sign Up
  // -------------------------------------------------------------------------
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col font-sans selection:bg-[#ede9fe] selection:text-[#493ee5]">
      {/* Header with Role-Based Navigation & Logout */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeCompany={selectedCompany.name}
        onOpenPricing={() => setIsPricingOpen(true)}
        unlockedPlan={unlockedPlan}
        role={currentUser.role}
        userEmail={currentUser.email}
        userName={currentUser.name}
        plan={currentUser.plan}
        onLogout={handleLogout}
      />

      {/* Main View Container with Strict RBAC rules */}
      <main className="flex-1 pb-14">
        {/* STUDENT VIEW: ONLY Student Workspace. Students are strictly prevented from HR components */}
        {currentUser.role === 'student' && (
          <SimulationWorkspace
            currentTask={currentTask}
            onTaskUpdated={handleTaskUpdated}
            onEvaluationCompleted={handleEvaluationCompleted}
            isLoading={false}
            selectedCompany={selectedCompany}
            setSelectedCompany={setSelectedCompany}
            userPlan={currentUser.plan}
            onOpenUpgrade={() => setIsPricingOpen(true)}
          />
        )}

        {/* ADMIN VIEW: ONLY NIBM HR Dashboard and AI Engine API Sandbox */}
        {currentUser.role === 'admin' && (
          <>
            {activeTab === 'dashboard' && (
              <AdminDashboard
                cohortRecords={cohortRecords}
                onSelectRecord={handleSelectRecord}
                onLaunchNewSimulation={() => {}}
              />
            )}

            {activeTab === 'playground' && <EnginePlayground />}
          </>
        )}
      </main>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onApplyPromoSuccess={handleApplyPromoSuccess}
      />

      {/* Evaluation Results Modal */}
      {currentEvaluation && currentTask && (
        <EvaluationModal
          isOpen={isEvaluationOpen}
          onClose={() => setIsEvaluationOpen(false)}
          evaluation={currentEvaluation}
          task={currentTask}
          companyName={selectedCompany.name}
          timeTakenMins={lastTimeTakenMins}
          studentName={currentUser.role === 'student' ? currentUser.name : 'Kasun Wickramasinghe (NIBM-BSE-22.1-018)'}
          onRetakeTask={() => {
            if (currentUser.role === 'student') setActiveTab('simulation');
          }}
        />
      )}

      {/* Institutional Footer with Active Session & Plan info */}
      <footer className="border-t border-slate-200/80 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700">SimulateHub Secure Enterprise Simulation Gateway</span>
            <span>•</span>
            <span className="font-mono text-[11px] text-slate-400">Environment v2.4</span>
            <span>•</span>
            <span className="font-bold text-[#493ee5]">
              Session: {currentUser.role.toUpperCase()} ({currentUser.email})
            </span>
            {currentUser.plan && (
              <span className="px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#493ee5] font-bold text-[10px] uppercase">
                {currentUser.plan} Plan
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Session Authenticated · RBAC Active
            </span>
            <span className="text-slate-300">|</span>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:underline font-semibold cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
