/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SimulationWorkspace } from './components/SimulationWorkspace';
import { AdminDashboard } from './components/AdminDashboard';
import { EnginePlayground } from './components/EnginePlayground';
import { EvaluationModal } from './components/EvaluationModal';
import { PricingModal } from './components/PricingModal';
import { TaskDeliverable, EvaluateSubmissionResponse, CompletedSimulation, CompanyPreset } from './types';
import { COMPANY_PRESETS, INITIAL_NIBM_COHORT, INITIAL_DEFAULT_TASK } from './data/presets';

const STORAGE_KEY = 'SIMULATEHUB_NIBM_COHORT_V2';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulation' | 'dashboard' | 'playground'>('simulation');
  const [selectedCompany, setSelectedCompany] = useState<CompanyPreset>(COMPANY_PRESETS[0]);
  const [currentTask, setCurrentTask] = useState<TaskDeliverable>(INITIAL_DEFAULT_TASK);

  // Pricing & Institutional access modal
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [unlockedPlan, setUnlockedPlan] = useState('Institutional NIBM Premium');

  // Active evaluation modal
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<EvaluateSubmissionResponse | null>(null);
  const [lastTimeTakenMins, setLastTimeTakenMins] = useState<number>(75);

  // Cohort records
  const [cohortRecords, setCohortRecords] = useState<CompletedSimulation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to read stored cohort records');
    }
    return INITIAL_NIBM_COHORT;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cohortRecords));
    } catch (e) {
      console.warn('Failed to persist cohort records');
    }
  }, [cohortRecords]);

  // When task is updated (via generate_task or search_and_generate)
  const handleTaskUpdated = (task: TaskDeliverable, company: CompanyPreset) => {
    setCurrentTask(task);
    setSelectedCompany(company);
  };

  // When evaluation completes (via evaluate_submission)
  const handleEvaluationCompleted = (
    evaluation: EvaluateSubmissionResponse,
    timeTakenMins: number,
    submission: string
  ) => {
    setCurrentEvaluation(evaluation);
    setLastTimeTakenMins(timeTakenMins);
    setIsEvaluationOpen(true);

    const newRecord: CompletedSimulation = {
      id: `SIM-NIBM-${Date.now().toString().slice(-4)}`,
      studentName: 'Kasun Wickramasinghe',
      studentId: 'NIBM-BSE-22.1-018',
      companyName: selectedCompany.name,
      techStack: ('required_technology' in currentTask ? currentTask.required_technology : currentTask.detected_tech_stack) || selectedCompany.techStack,
      task: currentTask,
      submission,
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
    setUnlockedPlan(`Unlocked: ${code} Institutional Premium`);
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col font-sans selection:bg-[#ede9fe] selection:text-[#493ee5]">
      {/* Header with SimulateHub branding */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeCompany={selectedCompany.name}
        onOpenPricing={() => setIsPricingOpen(true)}
        unlockedPlan={unlockedPlan}
      />

      {/* Main View Container */}
      <main className="flex-1 pb-14">
        {activeTab === 'simulation' && (
          <SimulationWorkspace
            currentTask={currentTask}
            onTaskUpdated={handleTaskUpdated}
            onEvaluationCompleted={handleEvaluationCompleted}
            isLoading={false}
            selectedCompany={selectedCompany}
            setSelectedCompany={setSelectedCompany}
          />
        )}

        {activeTab === 'dashboard' && (
          <AdminDashboard
            cohortRecords={cohortRecords}
            onSelectRecord={handleSelectRecord}
            onLaunchNewSimulation={() => setActiveTab('simulation')}
          />
        )}

        {activeTab === 'playground' && <EnginePlayground />}
      </main>

      {/* Pricing / Institutional Access Modal (screen_56a05b79.png) */}
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
          studentName="Kasun Wickramasinghe (NIBM-BSE-22.1-018)"
          onRetakeTask={() => setActiveTab('simulation')}
        />
      )}

      {/* Footer matching screen_56a05b79.png & screen_f251a6c4.png */}
      <footer className="border-t border-slate-200/80 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">SimulateHub Secure Enterprise Simulation Gateway</span>
            <span>•</span>
            <span className="font-mono text-[11px] text-slate-400">Environment v2.4</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Session Active · Runtime: Python 3.11 / React 19
            </span>
            <span className="text-slate-300">|</span>
            <span className="hover:text-slate-900 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-900 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-900 cursor-pointer">Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
