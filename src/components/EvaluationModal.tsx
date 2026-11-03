import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  X,
  Printer,
  Building,
  UserCheck,
  FileCheck2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { EvaluateSubmissionResponse, TaskDeliverable } from '../types';

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: EvaluateSubmissionResponse;
  task: TaskDeliverable;
  companyName: string;
  timeTakenMins: number;
  studentName?: string;
  onRetakeTask?: () => void;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  task,
  companyName,
  timeTakenMins,
  studentName = 'Kasun Wickramasinghe (NIBM-BSE-22.1-018)',
  onRetakeTask,
}) => {
  useEffect(() => {
    if (isOpen && evaluation.overall_score >= 80) {
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#635bff', '#8b5cf6', '#ede9fe', '#10b981'],
        });
      } catch (e) {
        // Fallback
      }
    }
  }, [isOpen, evaluation.overall_score]);

  if (!isOpen) return null;

  const isHighPass = evaluation.overall_score >= 85;
  const isPass = evaluation.overall_score >= 70;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-[#493ee5] bg-[#ede9fe] border-[#635bff]/20';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-[#635bff]';
    return 'bg-amber-500';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden relative text-[#131b2e]">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#493ee5] to-[#635bff] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-[#e2dfff]">
            <Award className="w-4 h-4" />
            <span>SimulateHub · Institutional HR & Technical Lead Evaluation Report</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
            Assessment & Industry Readiness Audit
          </h2>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-white/80">
            <span className="flex items-center gap-1 font-semibold">
              <Building className="w-3.5 h-3.5 text-white/70" />
              {companyName}
            </span>
            <span>•</span>
            <span className="font-mono bg-white/10 px-2 py-0.5 rounded">{task.task_id}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-white/70" />
              Time Taken: {timeTakenMins} mins
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Key Score Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Overall Score */}
            <div className={`p-4 rounded-2xl border ${getScoreColor(evaluation.overall_score)} flex flex-col items-center justify-center text-center relative`}>
              <span className="text-[10px] font-bold uppercase tracking-wider">Overall Assessment</span>
              <div className="flex items-baseline gap-1 my-1">
                <span className="text-4xl font-black font-display">{evaluation.overall_score}</span>
                <span className="text-sm font-semibold opacity-60">/100</span>
              </div>
              <div className="w-full bg-slate-200/70 rounded-full h-1.5 mt-2">
                <div
                  className={`h-1.5 rounded-full ${getProgressColor(evaluation.overall_score)}`}
                  style={{ width: `${evaluation.overall_score}%` }}
                ></div>
              </div>
              <span className="text-[11px] font-semibold mt-2">
                {isHighPass ? '🌟 High Distinction' : isPass ? '✓ Competency Verified' : '⚠️ Mentorship Required'}
              </span>
            </div>

            {/* Technical Accuracy Score */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-[#faf8ff] flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Technical Accuracy
              </span>
              <div className="flex items-baseline gap-1 my-1 text-[#0f172a]">
                <span className="text-4xl font-black font-display">{evaluation.technical_accuracy_score}</span>
                <span className="text-sm font-semibold text-slate-400">/100</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                <div
                  className="h-1.5 rounded-full bg-[#635bff]"
                  style={{ width: `${evaluation.technical_accuracy_score}%` }}
                ></div>
              </div>
              <span className="text-[11px] font-medium text-slate-500 mt-2">
                Code Logic & Idempotency
              </span>
            </div>

            {/* Cultural Fit & Communication Score */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-[#faf8ff] flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Cultural & Tone Fit
              </span>
              <div className="flex items-baseline gap-1 my-1 text-[#0f172a]">
                <span className="text-4xl font-black font-display">{evaluation.cultural_fit_and_communication_score}</span>
                <span className="text-sm font-semibold text-slate-400">/100</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                <div
                  className="h-1.5 rounded-full bg-[#8b5cf6]"
                  style={{ width: `${evaluation.cultural_fit_and_communication_score}%` }}
                ></div>
              </div>
              <span className="text-[11px] font-medium text-slate-500 mt-2">
                Sprint Tone & Rationale
              </span>
            </div>
          </div>

          {/* Official NIBM Admin / Corporate HR Dashboard Summary Callout */}
          <div className="bg-[#f2f3ff] border border-[#635bff]/25 rounded-2xl p-4.5">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-4 h-4 text-[#493ee5]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#493ee5]">
                Official NIBM Admin & HR Dashboard Summary
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-[#0f172a] leading-relaxed font-medium bg-white p-3.5 rounded-xl border border-[#635bff]/10 shadow-xs">
              "{evaluation.hr_dashboard_summary}"
            </p>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
              <span>Candidate: <strong className="text-slate-800">{studentName}</strong></span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified by Gemini 3.8 Flash AI Engine
              </span>
            </div>
          </div>

          {/* Detailed Feedback */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-[#635bff]" />
              <h4 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                Technical Lead Detailed Feedback
              </h4>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed shadow-xs">
              {evaluation.detailed_feedback}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Evaluation Certificate</span>
          </button>

          <div className="flex items-center gap-2">
            {onRetakeTask && (
              <button
                onClick={() => {
                  onClose();
                  onRetakeTask();
                }}
                className="px-4 py-2 rounded-xl border border-[#635bff]/30 text-xs font-semibold text-[#493ee5] bg-[#ede9fe] hover:bg-[#ddd6fe] transition-colors"
              >
                Revise Implementation
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#635bff] hover:bg-[#5248e5] text-white text-xs font-bold transition-all shadow-md shadow-[#635bff]/20"
            >
              Return to Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
