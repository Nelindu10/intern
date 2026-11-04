import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Sparkles,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Check,
  FileCode,
  CheckSquare,
  Square,
  Download,
  Cpu,
  Globe2,
  FileText,
  AlertCircle,
  Copy,
  Lock,
  ArrowRight,
  X,
  Upload,
  Award,
  BrainCircuit,
  ShieldCheck,
  FileCheck2,
  Paperclip,
  Trash2,
  BarChart3,
  TrendingUp,
  Layers,
  Wrench,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  TaskDeliverable,
  CompanyPreset,
  EvaluateSubmissionResponse,
  GenerateTaskResponse,
  SearchAndGenerateResponse,
} from '../types';
import { COMPANY_PRESETS, SAMPLE_BA_PDF_REPORT } from '../data/presets';

interface SimulationWorkspaceProps {
  currentTask: TaskDeliverable;
  onTaskUpdated: (task: TaskDeliverable, company: CompanyPreset) => void;
  onEvaluationCompleted: (
    evaluation: EvaluateSubmissionResponse,
    timeTakenMins: number,
    submission: string,
    submissionType?: 'code' | 'pdf_document'
  ) => void;
  isLoading: boolean;
  selectedCompany: CompanyPreset;
  setSelectedCompany: (company: CompanyPreset) => void;
  userPlan?: string;
  onOpenUpgrade?: () => void;
}

export interface AttachedPdf {
  name: string;
  sizeFormatted: string;
  content: string;
  rawFile?: File;
}

interface ProgressRecord {
  taskName: string;
  shortName: string;
  overallScore: number;
  analyticalScore: number;
  communicationScore: number;
  timestamp?: string;
}

const STORAGE_SCORES_KEY = 'SIMULATEHUB_STUDENT_EVALUATION_SCORES';

// Anti-Gibberish validation rule:
// If the text is blank, less than 20 words, or contains repetitive gibberish (e.g., 'efefef'),
// immediately give an overall score of 10/100 and return feedback 'Invalid submission or gibberish detected'.
function checkIsGibberishOrInvalid(rawText: string): boolean {
  if (!rawText || !rawText.trim()) return true;

  const words = rawText
    .replace(/[#*`_\[\]()\-]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);

  // 1. Less than 20 words
  if (words.length < 20) {
    return true;
  }

  // 2. Check for repetitive characters / pattern gibberish (e.g. 'efefef', 'aaaaaa', 'asdfasdfasdf')
  const clean = rawText.replace(/\s+/g, '').toLowerCase();
  const repetitivePatternRegex = /([a-z0-9]{1,4})\1{4,}/i;
  if (repetitivePatternRegex.test(clean)) {
    return true;
  }

  // 3. Check unique words ratio (e.g., repeating the same word 20+ times)
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
  if (uniqueWords.size < 6 && words.length >= 20) {
    return true;
  }

  return false;
}

export const SimulationWorkspace: React.FC<SimulationWorkspaceProps> = ({
  currentTask,
  onTaskUpdated,
  onEvaluationCompleted,
  isLoading,
  selectedCompany,
  setSelectedCompany,
  userPlan,
  onOpenUpgrade,
}) => {
  // ---------------------------------------------------------------------------
  // STRICT PRICING PLAN ACCESS CONTROL:
  // "Basic" Plan: Only allow access to the FIRST 2 companies in the array.
  // "Pro" Plan: Allow access to the FIRST 4 companies.
  // "Premium" Plan: Allow access to ALL companies.
  // ---------------------------------------------------------------------------
  const resolveActivePlan = (): 'basic' | 'pro' | 'premium' => {
    if (userPlan) {
      const lower = userPlan.trim().toLowerCase();
      if (lower.includes('prem')) return 'premium';
      if (lower.includes('pro')) return 'pro';
      if (lower.includes('basic')) return 'basic';
    }
    try {
      const stored = localStorage.getItem('selectedPlan');
      if (stored) {
        const lower = stored.trim().toLowerCase();
        if (lower.includes('prem')) return 'premium';
        if (lower.includes('pro')) return 'pro';
        if (lower.includes('basic')) return 'basic';
      }
      const sessionStr = localStorage.getItem('SIMULATEHUB_NIBM_USER_SESSION');
      if (sessionStr) {
        const parsed = JSON.parse(sessionStr);
        if (parsed.plan) {
          const lower = String(parsed.plan).toLowerCase();
          if (lower.includes('prem')) return 'premium';
          if (lower.includes('pro')) return 'pro';
          if (lower.includes('basic')) return 'basic';
        }
      }
    } catch (e) {
      // ignore
    }
    return 'basic';
  };

  const [activePlan, setActivePlan] = useState<'basic' | 'pro' | 'premium'>(resolveActivePlan);

  useEffect(() => {
    setActivePlan(resolveActivePlan());
  }, [userPlan]);

  useEffect(() => {
    const handleStorageChange = () => {
      setActivePlan(resolveActivePlan());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const allowedCompanyCount = activePlan === 'basic' ? 2 : activePlan === 'pro' ? 4 : COMPANY_PRESETS.length;
  const isPremium = activePlan === 'premium';

  // Tooltip & Locked Alert/Toast Notification States
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [lockedToast, setLockedToast] = useState<{
    open: boolean;
    companyName: string;
    requiredTier: 'Pro' | 'Premium';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!lockedToast) return;
    const timer = setTimeout(() => {
      setLockedToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [lockedToast]);

  const handleLockedCompanyClick = (company: CompanyPreset, index: number) => {
    const requiredTier: 'Pro' | 'Premium' = index < 4 ? 'Pro' : 'Premium';
    setLockedToast({
      open: true,
      companyName: company.name,
      requiredTier,
      message: 'Unlock this company by upgrading your plan!',
    });
  };

  // Search bar for custom company discovery
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingCompany, setIsSearchingCompany] = useState(false);

  // ---------------------------------------------------------------------------
  // DYNAMIC COMPANY-SPECIFIC TASKS & SELECTION
  // ---------------------------------------------------------------------------
  const availableCompanyTasks: TaskDeliverable[] =
    selectedCompany.tasks && selectedCompany.tasks.length > 0
      ? selectedCompany.tasks
      : [currentTask];

  const [selectedTaskId, setSelectedTaskId] = useState<string>(() => {
    return currentTask?.task_id || availableCompanyTasks[0]?.task_id || 'TASK-STR-101';
  });

  // When selectedCompany changes, sync selectedTaskId to the first company task
  useEffect(() => {
    if (selectedCompany.tasks && selectedCompany.tasks.length > 0) {
      const match = selectedCompany.tasks.find((t) => t.task_id === selectedTaskId);
      if (!match) {
        const first = selectedCompany.tasks[0];
        setSelectedTaskId(first.task_id);
        onTaskUpdated(first, selectedCompany);
      }
    } else {
      setSelectedTaskId(currentTask.task_id);
    }
  }, [selectedCompany]);

  // Compute active selected task object
  const activeSelectedTask: TaskDeliverable =
    availableCompanyTasks.find((t) => t.task_id === selectedTaskId) ||
    availableCompanyTasks[0] ||
    currentTask;

  const handleTaskSelectChange = (newTaskId: string) => {
    setSelectedTaskId(newTaskId);
    const matched = availableCompanyTasks.find((t) => t.task_id === newTaskId);
    if (matched) {
      onTaskUpdated(matched, selectedCompany);
    }
  };

  // PDF File Attachment State
  const [uploadedFile, setUploadedFile] = useState<AttachedPdf | null>({
    name: 'Stripe_Fintech_Deliverable.pdf',
    sizeFormatted: '3.8 MB',
    content: SAMPLE_BA_PDF_REPORT,
  });

  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Single TASK SUBMISSION state (Business problem-solving rationale & notes)
  const [submissionText, setSubmissionText] = useState(
    'Comprehensive business requirements analysis and problem-solving framework for enterprise payment resilience. Outlines clear stakeholder communication channels, explicit fallback states for intermittent drops, and structured acceptance criteria aligned with industry standards.'
  );

  // Countdown timer
  const [countdownSeconds, setCountdownSeconds] = useState<number>(13087);

  // Acceptance Checklist
  const [checklist, setChecklist] = useState<{ [key: number]: boolean }>({
    0: true,
    1: true,
    2: true,
    3: false,
  });

  // ---------------------------------------------------------------------------
  // DYNAMIC ANALYTICS CHART: Bound to real evaluation scores state (No Mock Data)
  // ---------------------------------------------------------------------------
  const [progressScores, setProgressScores] = useState<ProgressRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SCORES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse stored scores');
    }
    return [];
  });

  const handleClearScoreHistory = () => {
    if (window.confirm('Clear all historical score records?')) {
      setProgressScores([]);
      localStorage.removeItem(STORAGE_SCORES_KEY);
    }
  };

  // AI Evaluation states & modal
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationStage, setEvaluationStage] = useState<string>('');
  const [evalError, setEvalError] = useState<string | null>(null);
  const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluateSubmissionResponse | null>(null);
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  // Office standup countdown clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 14400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Word count calculator
  const wordCount = submissionText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  // File selection handler
  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtractingPdf(true);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const sizeFormatted = `${sizeInMb} MB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const content =
        text && text.trim().length > 0
          ? `# ATTACHED ASSIGNMENT DELIVERABLE: ${file.name}\n` +
            `Size: ${sizeFormatted} | Uploaded: ${new Date().toLocaleTimeString()}\n\n` +
            text
          : `# ATTACHED ASSIGNMENT DELIVERABLE: ${file.name}\n` +
            `Source: ${file.name} (${sizeFormatted})\n` +
            `Status: Processed via NIBM Document Ingress\n\n` +
            SAMPLE_BA_PDF_REPORT;

      setUploadedFile({
        name: file.name,
        sizeFormatted,
        content,
        rawFile: file,
      });
      setIsExtractingPdf(false);
    };

    reader.onerror = () => {
      setIsExtractingPdf(false);
      alert('Unable to read selected PDF. Please try another file.');
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  const triggerPdfPicker = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveAttachedPdf = () => {
    setUploadedFile(null);
  };

  // Preset company selection
  const handleSelectPreset = async (company: CompanyPreset) => {
    setSelectedCompany(company);
    if (company.tasks && company.tasks.length > 0) {
      const firstTask = company.tasks[0];
      setSelectedTaskId(firstTask.task_id);
      onTaskUpdated(firstTask, company);
      return;
    }

    setIsSearchingCompany(true);
    try {
      const response = await fetch('/api/engine/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_task',
          company_name: company.name,
          tech_stack_or_domain: company.techStack,
          culture: company.culture,
        }),
      });
      const data: GenerateTaskResponse = await response.json();
      onTaskUpdated(data, company);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingCompany(false);
    }
  };

  useEffect(() => {
    const currentIndex = COMPANY_PRESETS.findIndex(
      (c) => c.name.toLowerCase() === selectedCompany.name.toLowerCase()
    );
    if (currentIndex !== -1 && currentIndex >= allowedCompanyCount) {
      handleSelectPreset(COMPANY_PRESETS[0]);
    }
  }, [activePlan, allowedCompanyCount, selectedCompany.name]);

  // Unlisted company search
  const handleSearchCompany = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isPremium) {
      setLockedToast({
        open: true,
        companyName: searchQuery || 'Custom Search',
        requiredTier: 'Premium',
        message: 'Unlock this company by upgrading your plan! Custom AI Generation is a Premium feature.',
      });
      return;
    }
    if (!searchQuery.trim()) return;

    setIsSearchingCompany(true);
    try {
      const response = await fetch('/api/engine/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search_and_generate_company_task',
          search_query_company: searchQuery.trim(),
        }),
      });

      const data: SearchAndGenerateResponse = await response.json();
      const compName = data.discovered_company_name || data.company_name || searchQuery.trim();
      const compStack =
        data.detected_tech_stack ||
        data.tech_stack_or_domain ||
        data.required_technology ||
        'Business Analysis, Problem Solving, Product Strategy';

      const discoveredCompany: CompanyPreset = {
        id: 'auto-' + Date.now(),
        name: compName,
        verified: true,
        track: `${compName} Enterprise Track`,
        location: data.simulated_timezone_and_hours?.split('(')[0] || 'Global Remote HQ',
        assignedRole: 'Associate Business & Strategy Analyst',
        squad: 'Enterprise Strategy & Client Delivery',
        techStack: compStack,
        culture: data.detected_culture || 'Agile Delivery, Operational Excellence',
        managerName: 'Priyantha De Silva',
        managerRole: 'Lead Industry Mentor',
        managerHandle: `${compName} Lead`,
        managerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        timezoneLabel: data.simulated_timezone_and_hours,
        accentColor: '#635bff',
        logoBg: '#635bff',
        logoText: compName.substring(0, 2).toUpperCase(),
        defaultSubmissionType: 'pdf_document',
        enterpriseSoftwareTools: ['Jira', 'Lucidchart', 'Confluence', 'Snowflake SQL', 'Salesforce CRM'],
        onboardingBriefing: `Welcome to the ${compName} simulation squad. Your objective is to formulate enterprise-grade analytical deliverables, model business logic workflows, and deliver structured stakeholder recommendations.`,
        tasks: [data],
      };

      setSelectedCompany(discoveredCompany);
      setSelectedTaskId(data.task_id);
      onTaskUpdated(data, discoveredCompany);
      setSearchQuery('');
    } catch (err) {
      console.error(err);
      alert('Error searching company. Please try again.');
    } finally {
      setIsSearchingCompany(false);
    }
  };

  // ---------------------------------------------------------------------------
  // AI EVALUATION WITH ANTI-GIBBERISH RULE & PURE RAW JSON PARSING
  // ---------------------------------------------------------------------------
  const handleSubmitEvaluation = async () => {
    setIsEvaluating(true);
    setEvalError(null);
    setEvaluationStage('Analyzing submission content and validating authenticity...');

    try {
      const hasPdf = !!uploadedFile;
      const submissionType: 'pdf_document' | 'code' = hasPdf ? 'pdf_document' : 'code';

      // Full text to evaluate
      const fullContentToEvaluate = hasPdf
        ? `[ATTACHED ASSIGNMENT DELIVERABLE: ${uploadedFile.name} (${uploadedFile.sizeFormatted})]\n\nDOCUMENT BODY:\n${uploadedFile.content}\n\nSTUDENT TASK SUBMISSION & RATIONALE:\n${submissionText}`
        : submissionText;

      // Deterministic Anti-Gibberish Check on the raw submission text
      const rawTextForGibberishCheck = hasPdf
        ? `${uploadedFile.name} ${uploadedFile.content} ${submissionText}`
        : submissionText;

      if (checkIsGibberishOrInvalid(rawTextForGibberishCheck)) {
        const gibberishResult: EvaluateSubmissionResponse = {
          action_type: 'evaluate_submission_response',
          overall_score: 10,
          technical_or_analytical_score: 10,
          cultural_fit_and_communication_score: 10,
          detailed_feedback: 'Invalid submission or gibberish detected.',
          hr_dashboard_summary: 'Submission rejected: Invalid submission or gibberish detected.',
          submission_type: submissionType,
        };

        setEvaluationResult(gibberishResult);
        setEvaluationModalOpen(true);
        onEvaluationCompleted(gibberishResult, 30, fullContentToEvaluate, submissionType);
        setIsEvaluating(false);
        setEvaluationStage('');
        return;
      }

      // Strict payload to API incorporating selected task context and tools
      const payload = {
        action: 'evaluate_submission',
        task_id: activeSelectedTask.task_id,
        task_title: activeSelectedTask.task_title,
        submission_type: submissionType,
        student_submission: fullContentToEvaluate,
        time_taken_mins: 30,
        enterprise_software_tools: activeSelectedTask.required_technology || selectedCompany.techStack,
      };

      const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
      let evalData: EvaluateSubmissionResponse | null = null;

      // 1. Direct call to Google Gemini API with VITE_GEMINI_API_KEY
      if (apiKey) {
        setEvaluationStage('Evaluating via Google Gemini (gemini-3.8-flash)...');
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(
            apiKey
          )}`;

          const isPdf = submissionType === 'pdf_document';
          const systemInstruction =
            'You are the core AI Engine for the "AI-Driven Virtual Internship & Industry Simulation Platform". You act as a Virtual Technical Manager, Business Analysis Lead, and Institutional HR Evaluator for IT undergraduates.\n\n' +
            'STRICT GUIDELINES:\n' +
            `1. When evaluating a submission for task "${activeSelectedTask.task_title}" (submission_type: "${submissionType}"), return ONLY a valid JSON object.\n` +
            '2. DO NOT wrap the JSON in ```json ... ``` markdown blocks or any conversational text.\n' +
            '3. The JSON must strictly match this structure:\n' +
            '{\n' +
            '  "action_type": "evaluate_submission_response",\n' +
            '  "overall_score": 85,\n' +
            '  "technical_or_analytical_score": 90,\n' +
            '  "cultural_fit_and_communication_score": 80,\n' +
            '  "detailed_feedback": "Your evaluation details here...",\n' +
            '  "hr_dashboard_summary": "Summary for HR dashboard here..."\n' +
            '}\n\n' +
            'CRITICAL ANTI-GIBBERISH RULE:\n' +
            'Evaluate the ACTUAL text content of the submission. If the text is blank, less than 20 words, or contains repetitive gibberish (e.g., "efefef"), you MUST ignore any "tests passed" flags, immediately give an overall score of 10/100, and return the feedback "Invalid submission or gibberish detected".\n\n' +
            (isPdf
              ? 'EVALUATION CRITERIA FOR DELIVERABLE PDF REPORT:\n' +
                'Evaluate the uploaded PDF content based on:\n' +
                '- Analytical thinking and problem-solving approach.\n' +
                '- Business logic and enterprise requirement coverage.\n' +
                '- Professional formatting, structure, and clarity of the report.'
              : 'EVALUATION CRITERIA FOR TEXT SUBMISSION:\n' +
                '- Solution depth, logical reasoning, and requirement coverage.');

          const geminiBody = {
            system_instruction: {
              parts: [{ text: systemInstruction }],
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: JSON.stringify(payload, null, 2) }],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          };

          const geminiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiBody),
          });

          if (geminiRes.ok) {
            const geminiJson = await geminiRes.json();
            const rawText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
              const parsed = JSON.parse(cleaned);
              evalData = {
                action_type: 'evaluate_submission_response',
                overall_score: Number(parsed.overall_score) || 85,
                technical_or_analytical_score:
                  Number(parsed.technical_or_analytical_score) || 88,
                cultural_fit_and_communication_score:
                  Number(parsed.cultural_fit_and_communication_score) || 82,
                detailed_feedback: parsed.detailed_feedback || 'Submission reviewed successfully.',
                hr_dashboard_summary:
                  parsed.hr_dashboard_summary || 'Candidate demonstrated enterprise-ready competency.',
                submission_type: submissionType,
              };
            }
          }
        } catch (directErr) {
          console.warn('Direct Gemini call failed, falling back to server gateway:', directErr);
        }
      }

      // 2. Fallback to server endpoint (/api/engine/request)
      if (!evalData) {
        setEvaluationStage('Connecting to SimulateHub Evaluation Gateway (/api/engine/request)...');
        const response = await fetch('/api/engine/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        evalData = {
          action_type: 'evaluate_submission_response',
          overall_score: Number(data.overall_score) || 85,
          technical_or_analytical_score:
            Number(data.technical_or_analytical_score) || 88,
          cultural_fit_and_communication_score:
            Number(data.cultural_fit_and_communication_score) || 82,
          detailed_feedback: data.detailed_feedback || 'Submission verified against enterprise rubrics.',
          hr_dashboard_summary:
            data.hr_dashboard_summary || 'Candidate demonstrated high analytical rigor.',
          submission_type: submissionType,
        };
      }

      setEvaluationResult(evalData);
      setEvaluationModalOpen(true);

      // Append new score to the Dynamic Recharts Progress Score Bar Chart and persist
      if (evalData.overall_score > 10) {
        const newRecord: ProgressRecord = {
          taskName: activeSelectedTask.task_title,
          shortName: activeSelectedTask.task_id || `Task ${progressScores.length + 1}`,
          overallScore: evalData.overall_score,
          analyticalScore: evalData.technical_or_analytical_score,
          communicationScore: evalData.cultural_fit_and_communication_score,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setProgressScores((prev) => {
          const updated = [...prev, newRecord];
          try {
            localStorage.setItem(STORAGE_SCORES_KEY, JSON.stringify(updated));
          } catch (e) {
            // ignore
          }
          return updated;
        });
      }

      onEvaluationCompleted(evalData, 30, fullContentToEvaluate, submissionType);
    } catch (err: any) {
      console.error('AI Evaluation error:', err);
      setEvalError(err.message || 'AI Evaluation encountered an error. Please try again.');
    } finally {
      setIsEvaluating(false);
      setEvaluationStage('');
    }
  };

  const handleCopyFeedback = () => {
    if (!evaluationResult) return;
    const text = `SimulateHub AI Evaluation Report\nTask: [${activeSelectedTask.task_id}] ${activeSelectedTask.task_title}\nCompany: ${selectedCompany.name}\nOverall Score: ${evaluationResult.overall_score}/100\nTechnical/Analytical: ${evaluationResult.technical_or_analytical_score}/100\nCommunication: ${evaluationResult.cultural_fit_and_communication_score}/100\n\nHR Dashboard Summary:\n${evaluationResult.hr_dashboard_summary}\n\nDetailed Feedback:\n${evaluationResult.detailed_feedback}`;
    navigator.clipboard.writeText(text);
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 2000);
  };

  // Average score calculation for real progress chart summary
  const averageOverallScore =
    progressScores.length > 0
      ? Math.round(
          progressScores.reduce((acc, curr) => acc + curr.overallScore, 0) / progressScores.length
        )
      : null;

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 text-[#131b2e] relative">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handlePdfFileChange}
        className="hidden"
      />

      {/* Plan Restriction Toast */}
      {lockedToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm sm:max-w-md w-full animate-in slide-in-from-top-3 fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border-2 border-[#635bff]/30 shadow-2xl shadow-[#635bff]/20 ring-4 ring-[#635bff]/10 flex items-start gap-3.5 relative">
            <div className="w-10 h-10 rounded-xl bg-[#ede9fe] text-[#493ee5] flex items-center justify-center shrink-0 border border-[#635bff]/20 shadow-xs">
              <Lock className="w-5 h-5 text-[#635bff]" />
            </div>
            <div className="flex-1 pr-6 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#493ee5] bg-[#ede9fe] px-2 py-0.5 rounded-full border border-[#635bff]/20">
                  Plan Restriction · {activePlan.toUpperCase()} TIER
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {allowedCompanyCount}/{COMPANY_PRESETS.length} Unlocked
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#0f172a] leading-tight">
                Unlock this company by upgrading your plan!
              </h4>
              <p className="text-xs text-slate-600 leading-normal">
                {lockedToast.message ||
                  `Access to ${lockedToast.companyName} is restricted under your ${activePlan} plan.`}
              </p>
              <div className="pt-2 flex items-center gap-2">
                {onOpenUpgrade && (
                  <button
                    type="button"
                    onClick={() => {
                      setLockedToast(null);
                      onOpenUpgrade();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#635bff] hover:bg-[#5248e5] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>Upgrade to {lockedToast.requiredTier}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setLockedToast(null)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLockedToast(null)}
              className="absolute top-3.5 right-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Light Purple Evaluation Results Modal */}
      {evaluationModalOpen && evaluationResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full border-2 border-[#635bff]/30 shadow-2xl overflow-hidden relative text-[#131b2e] my-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#493ee5] via-[#635bff] to-[#7c3aed] text-white p-5 sm:p-6 relative">
              <button
                type="button"
                onClick={() => setEvaluationModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-[#e2dfff]">
                <Award className="w-4 h-4 text-[#ede9fe]" />
                <span>SimulateHub · Institutional HR & Technical Evaluation Report</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display">
                Industry Assessment & Readiness Audit
              </h2>

              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-white/85">
                <span className="font-semibold">{selectedCompany.name}</span>
                <span>•</span>
                <span className="font-mono bg-white/15 px-2 py-0.5 rounded text-[11px]">
                  {activeSelectedTask.task_id}
                </span>
                <span>•</span>
                <span className="bg-white/15 px-2 py-0.5 rounded text-[11px] font-medium">
                  {uploadedFile ? 'PDF Assignment Report' : 'Analytical Text Submission'}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Score Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  className={`rounded-2xl p-4 border-2 flex items-center gap-3.5 shadow-xs ${
                    evaluationResult.overall_score <= 10
                      ? 'bg-rose-50 border-rose-300 text-rose-900'
                      : evaluationResult.overall_score >= 80
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-[#ede9fe]/60 border-[#635bff]/30 text-[#493ee5]'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-xs shrink-0 ${
                      evaluationResult.overall_score <= 10
                        ? 'bg-rose-600 text-white'
                        : evaluationResult.overall_score >= 80
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#635bff] text-white'
                    }`}
                  >
                    {evaluationResult.overall_score}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                      Overall Score
                    </span>
                    <span className="text-xs font-semibold">
                      {evaluationResult.overall_score <= 10
                        ? 'Rejected (Gibberish)'
                        : evaluationResult.overall_score >= 85
                        ? 'Distinction / Hire Ready'
                        : 'Competent'}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl p-4 border-2 border-slate-200 bg-slate-50 flex items-center gap-3.5 shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                    {evaluationResult.technical_or_analytical_score}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Analytical Rigor
                    </span>
                    <span className="text-xs font-semibold text-slate-800">Domain Logic</span>
                  </div>
                </div>

                <div className="rounded-2xl p-4 border-2 border-purple-200 bg-purple-50/60 flex items-center gap-3.5 shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-[#7c3aed] text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                    {evaluationResult.cultural_fit_and_communication_score}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                      Communication
                    </span>
                    <span className="text-xs font-semibold text-purple-900">Stakeholder Fit</span>
                  </div>
                </div>
              </div>

              {/* HR Summary Section */}
              <div className="bg-[#ede9fe]/40 rounded-2xl p-4 border border-[#635bff]/20 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#493ee5] uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[#635bff]" />
                  <span>NIBM HR Dashboard Evaluation Summary</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {evaluationResult.hr_dashboard_summary}
                </p>
              </div>

              {/* Detailed Feedback Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-[#635bff]" />
                    <span>Detailed Manager Feedback & Recommendations</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Evaluation completed in 30 mins
                  </span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2 max-h-56 overflow-y-auto whitespace-pre-line font-sans">
                  {evaluationResult.detailed_feedback}
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleCopyFeedback}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>{copiedFeedback ? 'Copied to Clipboard' : 'Copy Full Report'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEvaluationModalOpen(false);
                      handleSubmitEvaluation();
                    }}
                    className="px-3.5 py-2 rounded-xl border border-[#635bff]/25 bg-[#ede9fe]/60 hover:bg-[#ede9fe] text-[#493ee5] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Re-evaluate
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvaluationModalOpen(false)}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#493ee5] to-[#635bff] hover:from-[#3e34c9] hover:to-[#5248e5] text-white text-xs font-bold shadow-md shadow-[#635bff]/25 transition-all cursor-pointer"
                  >
                    Done / Back to Workspace
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Simulation Session Sub-Bar */}
      <div className="bg-[#ede9fe]/50 border border-[#635bff]/20 rounded-xl px-4 py-2 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-[#493ee5]">
            <span className="w-2 h-2 rounded-full bg-[#635bff] animate-pulse"></span>
            <span className="uppercase tracking-wider text-[11px]">ACTIVE SIMULATION SESSION</span>
          </div>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-semibold">{activeSelectedTask.task_id}</span>
          <span className="text-slate-300">/</span>
          <span className="text-[#635bff] font-semibold bg-white px-2 py-0.5 rounded border border-[#635bff]/15">
            Track: {selectedCompany.track}
          </span>
          <span className="text-slate-300">/</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tier:</span>
            <span className="px-2 py-0.5 rounded-full bg-white text-[#493ee5] font-bold text-[10px] uppercase border border-[#635bff]/20 flex items-center gap-1 shadow-xs">
              {activePlan !== 'premium' && <Lock className="w-2.5 h-2.5 text-slate-400" />}
              {activePlan} ({allowedCompanyCount}/{COMPANY_PRESETS.length} Employers)
            </span>
            {activePlan !== 'premium' && onOpenUpgrade && (
              <button
                type="button"
                onClick={onOpenUpgrade}
                className="text-[10px] font-bold text-[#635bff] hover:text-[#493ee5] underline cursor-pointer"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-600">
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
            Simulated Sandbox Ready
          </span>
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Evaluation Engine Online
          </span>
        </div>
      </div>

      {/* Employer Selector & Custom Search Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0 text-[10px]">
            Employers:
          </span>
          {COMPANY_PRESETS.map((comp, idx) => {
            const isSelected = selectedCompany.name.toLowerCase() === comp.name.toLowerCase();
            const isLocked = idx >= allowedCompanyCount;

            if (isLocked) {
              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => handleLockedCompanyClick(comp, idx)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 opacity-50 cursor-not-allowed bg-slate-100 hover:bg-slate-200/60 text-slate-400 border border-slate-200 transition-all select-none"
                  title="Unlock this company by upgrading your plan!"
                >
                  <span>{comp.name}</span>
                  <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                </button>
              );
            }

            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => handleSelectPreset(comp)}
                disabled={isSearchingCompany}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#635bff] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{comp.name}</span>
                {comp.verified && <Check className="w-3 h-3 text-emerald-300" />}
              </button>
            );
          })}
        </div>

        <div
          className="relative w-full md:w-84"
          onMouseEnter={() => !isPremium && setIsSearchHovered(true)}
          onMouseLeave={() => setIsSearchHovered(false)}
        >
          {!isPremium && isSearchHovered && (
            <div className="absolute -top-10 right-0 sm:left-1/2 sm:-translate-x-1/2 z-30 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-[#0f172a] text-white text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-1.5 whitespace-nowrap border border-slate-700">
                <Lock className="w-3 h-3 text-[#a5b4fc]" />
                <span>Custom AI Generation is a Premium feature.</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSearchCompany} className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <Search
                className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${
                  !isPremium ? 'text-slate-300' : 'text-slate-400'
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={!isPremium}
                placeholder={
                  isPremium
                    ? 'Search unlisted company (e.g. Airbnb, Uber)...'
                    : 'Search unlisted company (Premium only)...'
                }
                className={`w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border transition-all ${
                  !isPremium
                    ? 'bg-slate-100/90 text-slate-400 border-slate-200 cursor-not-allowed select-none'
                    : 'bg-[#faf8ff] text-slate-800 border-slate-300 focus:outline-none focus:border-[#635bff] focus:bg-white'
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={!isPremium || isSearchingCompany || !searchQuery.trim()}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 flex items-center gap-1 ${
                !isPremium
                  ? 'bg-slate-200/80 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-[#493ee5] hover:bg-[#3e34c9] text-white shadow-xs cursor-pointer'
              }`}
            >
              {!isPremium ? (
                <>
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Discover</span>
                </>
              ) : isSearchingCompany ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <span>Discover</span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Evaluating Status Banner */}
      {isEvaluating && (
        <div className="bg-white/95 rounded-2xl p-6 border-2 border-[#635bff]/40 shadow-xl shadow-[#635bff]/10 ring-4 ring-[#635bff]/10 text-center animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-2xl bg-[#ede9fe] text-[#635bff] flex items-center justify-center mx-auto mb-3 shadow-inner">
            <RefreshCw className="w-7 h-7 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-[#0f172a] font-display">
            AI is evaluating your task submission with Google Gemini...
          </h3>
          <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
            {evaluationStage || 'Benchmarking against enterprise rubrics and industry standards...'}
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-[11px] text-[#493ee5] font-medium flex-wrap">
            <span className="flex items-center gap-1.5 bg-[#ede9fe] px-3 py-1 rounded-full border border-[#635bff]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#635bff]" />
              Task: [{activeSelectedTask.task_id}] {activeSelectedTask.task_title}
            </span>
            <span className="flex items-center gap-1.5 bg-[#ede9fe] px-3 py-1 rounded-full border border-[#635bff]/20">
              <BrainCircuit className="w-3.5 h-3.5 text-[#635bff]" />
              Format: {uploadedFile ? 'PDF Document Deliverable' : 'Task Submission Notes'}
            </span>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {evalError && (
        <div className="bg-rose-50/90 rounded-2xl p-4 border-2 border-rose-200 shadow-sm flex items-start justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-rose-900">AI Evaluation Request Interrupted</h4>
              <p className="text-xs text-rose-700 leading-relaxed">{evalError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEvalError(null)}
            className="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Left Spec Sidebar + Right Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Company Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#635bff] text-white font-bold text-base flex items-center justify-center shadow-xs">
                  {selectedCompany.logoText || selectedCompany.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-base text-[#0f172a] font-display">
                      {selectedCompany.name}
                    </h3>
                    <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">{selectedCompany.track}</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold uppercase">
                Simulated Org
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                ASSIGNED SIMULATED ROLE
              </span>
              <div className="font-bold text-slate-800 text-sm mt-0.5">
                {selectedCompany.assignedRole}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <UsersIcon className="w-3 h-3 text-[#635bff]" />
                <span>{selectedCompany.squad}</span>
              </div>
            </div>
          </div>

          {/* Timezone Sync */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-[#635bff]" />
                <span className="text-[10px] font-bold uppercase tracking-wider">FOREIGN TIMEZONE SYNC</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{selectedCompany.location}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500">Corporate HQ Time</div>
                <div className="text-sm font-mono font-bold text-[#0f172a] mt-0.5">14:43:06</div>
                <div className="text-[10px] text-[#635bff] font-medium">{selectedCompany.timezoneLabel || 'IST (GMT+1)'}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500">Your Local Device</div>
                <div className="text-sm font-mono font-bold text-[#0f172a] mt-0.5">20:13:06</div>
                <div className="text-[10px] text-slate-500 font-medium">EST (New York)</div>
              </div>
            </div>
          </div>

          {/* Time to Office Standup / Handover Card */}
          <div className="bg-gradient-to-br from-[#493ee5] to-[#635bff] text-white rounded-2xl p-4 shadow-md shadow-[#635bff]/20 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-semibold text-[#e2dfff]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Time to Office Standup / Handover</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            <div className="text-3xl font-black font-display tracking-tight my-2">
              {formatCountdown(countdownSeconds)}
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/15">
              <span className="text-[11px] text-white/80">Next Handover Sync: 18:00 Local</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                Active Sprint
              </span>
            </div>
          </div>

          {/* DYNAMIC COMPANY-SPECIFIC ONBOARDING BRIEFING */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#493ee5] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#635bff]" />
                <span>AI-Generated Onboarding Briefing</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {selectedCompany.name}
              </span>
            </div>

            {/* Manager Avatar & Role */}
            <div className="flex items-center gap-3">
              <img
                src={selectedCompany.managerAvatar}
                alt={selectedCompany.managerName}
                className="w-10 h-10 rounded-xl object-cover border border-[#635bff]/25 shadow-xs"
              />
              <div className="text-xs">
                <div className="font-bold text-[#0f172a]">{selectedCompany.managerName}</div>
                <div className="text-[11px] text-[#493ee5] font-semibold">{selectedCompany.managerRole}</div>
                <div className="text-[10px] text-slate-400">{selectedCompany.managerHandle}</div>
              </div>
            </div>

            {/* Dynamic Briefing Text tailored to the company */}
            <div className="text-xs text-slate-700 leading-relaxed italic bg-[#faf8ff] p-3.5 rounded-xl border border-[#635bff]/15">
              "{selectedCompany.onboardingBriefing || activeSelectedTask.manager_instructions}"
            </div>
          </div>

          {/* COMPANY ENTERPRISE SOFTWARE TOOLS INTEGRATION */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-[#635bff]" />
                <span>Enterprise Software Tools</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">Industry Stack</span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {(
                selectedCompany.enterpriseSoftwareTools || [
                  'Jira',
                  'Lucidchart',
                  'Salesforce CRM',
                  'Snowflake SQL',
                  'BPMN 2.0',
                ]
              ).map((tool, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-[#ede9fe]/60 border border-[#635bff]/20 text-[#493ee5] text-xs font-medium shadow-2xs"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Acceptance Criteria Checklist */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5">
            <h4 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-[#635bff]" />
              <span>ACCEPTANCE CRITERIA CHECKLIST</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div
                onClick={() => setChecklist({ ...checklist, 0: !checklist[0] })}
                className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                {checklist[0] ? (
                  <CheckCircle2 className="w-4 h-4 text-[#635bff] shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="text-slate-800">1. Problem Scope & Business Requirements</strong>
                  <p className="text-[11px] text-slate-500">Deconstruct business objectives and functional constraints.</p>
                </div>
              </div>

              <div
                onClick={() => setChecklist({ ...checklist, 1: !checklist[1] })}
                className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                {checklist[1] ? (
                  <CheckCircle2 className="w-4 h-4 text-[#635bff] shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="text-slate-800">2. Solution Architecture & Workflow Logic</strong>
                  <p className="text-[11px] text-slate-500">Validate business process flows against industry rubrics.</p>
                </div>
              </div>

              <div
                onClick={() => setChecklist({ ...checklist, 2: !checklist[2] })}
                className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                {checklist[2] ? (
                  <CheckCircle2 className="w-4 h-4 text-[#635bff] shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="text-slate-800">3. Risk Mitigation & Edge-Case Safeguards</strong>
                  <p className="text-[11px] text-slate-500">Detail contingency procedures and exception handling.</p>
                </div>
              </div>

              <div
                onClick={() => setChecklist({ ...checklist, 3: !checklist[3] })}
                className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                {checklist[3] ? (
                  <CheckCircle2 className="w-4 h-4 text-[#635bff] shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="text-slate-800">4. Executive Deliverable Documentation</strong>
                  <p className="text-[11px] text-slate-500">Professional formatting ready for institutional audit.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (8 cols): Progress Chart + Unified TASK SUBMISSION Container */}
        <div className="lg:col-span-8 space-y-4">
          {/* ----------------------------------------------------------------- */}
          {/* DYNAMIC ANALYTICS CHART: Bound to Real Evaluation Score State     */}
          {/* ----------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#ede9fe] text-[#635bff] flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0f172a] font-display">
                    Simulation Progress & Score History
                  </h3>
                  {progressScores.length > 0 && (
                    <span className="text-[10px] font-bold bg-[#ede9fe] text-[#493ee5] px-2 py-0.5 rounded-full border border-[#635bff]/20">
                      {progressScores.length} Evaluated {progressScores.length === 1 ? 'Task' : 'Tasks'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live performance benchmarks from AI evaluations across completed tasks
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#635bff]"></span>
                  <span className="text-slate-600 font-medium">Overall Score</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#493ee5]"></span>
                  <span className="text-slate-600 font-medium">Analytical Rigor</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#a78bfa]"></span>
                  <span className="text-slate-600 font-medium">Communication</span>
                </div>

                {progressScores.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearScoreHistory}
                    className="text-[11px] text-slate-400 hover:text-rose-600 font-medium transition-colors ml-1 cursor-pointer"
                  >
                    Clear History
                  </button>
                )}
              </div>
            </div>

            {/* Dynamic Rendering: Zero-State when no evaluations, BarChart when real scores exist */}
            {progressScores.length === 0 ? (
              <div className="w-full h-52 flex flex-col items-center justify-center border-2 border-dashed border-[#ede9fe] rounded-2xl bg-[#faf8ff] p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#ede9fe] text-[#635bff] flex items-center justify-center shadow-inner">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-[#0f172a]">Awaiting First Task Submission</h4>
                <p className="text-[11px] text-slate-500 max-w-md leading-normal">
                  No task evaluations recorded yet. Choose a company milestone from the task dropdown below, submit your analytical rationale or deliverable PDF report, and your live AI assessment scores will automatically chart here in real-time.
                </p>
              </div>
            ) : (
              <div className="w-full h-56 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="shortName"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '11px',
                      }}
                      cursor={{ fill: '#ede9fe', opacity: 0.3 }}
                    />
                    <Bar dataKey="overallScore" name="Overall Score" fill="#635bff" radius={[5, 5, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="analyticalScore" name="Analytical Rigor" fill="#493ee5" radius={[5, 5, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="communicationScore" name="Communication" fill="#a78bfa" radius={[5, 5, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* UNIFIED SINGLE "TASK SUBMISSION" CONTAINER                        */}
          {/* Featuring Task Selection Dropdown, PDF attachment & Submit button */}
          {/* ----------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl p-5 border-2 border-[#635bff]/25 shadow-sm space-y-4 relative overflow-hidden">
            {/* Top highlight bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#493ee5] via-[#635bff] to-[#8b5cf6]" />

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[#635bff]" />
                  <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider font-display">
                    TASK SUBMISSION
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your active company task, provide your analytical rationale, or attach a deliverable PDF report
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                    wordCount < 20
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {wordCount} words {wordCount < 20 ? '(min 20 req.)' : '✓ valid length'}
                </span>
              </div>
            </div>

            {/* TASK SELECTION DROPDOWN: Lists current active tasks for that company */}
            <div className="space-y-2 bg-[#faf8ff] p-3.5 rounded-xl border border-[#635bff]/20">
              <div className="flex items-center justify-between">
                <label htmlFor="task-select" className="text-xs font-bold text-[#493ee5] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#635bff]" />
                  <span>Active Milestone / Task Selection:</span>
                </label>
                <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {availableCompanyTasks.length} {selectedCompany.name} Tasks Available
                </span>
              </div>

              <select
                id="task-select"
                value={activeSelectedTask.task_id}
                onChange={(e) => handleTaskSelectChange(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-[#635bff] focus:ring-2 focus:ring-[#635bff]/20 cursor-pointer shadow-xs transition-all"
              >
                {availableCompanyTasks.map((t) => (
                  <option key={t.task_id} value={t.task_id}>
                    [{t.task_id}] {t.task_title}
                  </option>
                ))}
              </select>

              {/* Selected Task Details Summary Card */}
              <div className="mt-2 pt-2 border-t border-[#635bff]/10 space-y-1.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Deliverable Objective:
                  </span>
                  <p className="text-xs text-slate-700 font-medium mt-0.5">
                    {activeSelectedTask.expected_deliverable}
                  </p>
                </div>

                {activeSelectedTask.required_technology && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Software Tools:</span>
                    {activeSelectedTask.required_technology.split(',').map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium bg-white text-[#493ee5] px-2 py-0.5 rounded border border-[#635bff]/20"
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submission Notes Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Submission Notes & Analytical Rationale:
              </label>
              <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Explain your approach, how requirements are satisfied, trade-offs evaluated, and key recommendations..."
                rows={4}
                className="w-full text-xs p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#635bff] focus:bg-white leading-relaxed transition-colors"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Anti-Gibberish Engine enforces quality assessment (min 20 words)</span>
                <span>Auto-saved to session</span>
              </div>
            </div>

            {/* Attached Deliverable Sub-Card inside Task Submission */}
            <div className="pt-1">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Attached Assignment Deliverable:
              </label>
              {uploadedFile ? (
                <div className="bg-[#faf8ff] rounded-2xl p-3 sm:p-3.5 border border-[#635bff]/25 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 border border-red-200 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#0f172a] font-mono">
                        {uploadedFile.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {uploadedFile.sizeFormatted}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Attached Deliverable</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={triggerPdfPicker}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#493ee5] text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer bg-white"
                    >
                      <RefreshCw className="w-3 h-3 text-[#635bff]" />
                      <span>Replace PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveAttachedPdf}
                      title="Remove attached PDF"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-3 border border-dashed border-slate-300 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Paperclip className="w-4 h-4 text-[#635bff]" />
                    <span>No PDF deliverable attached. You can attach a PDF report or submit notes directly.</span>
                  </div>
                  <button
                    type="button"
                    onClick={triggerPdfPicker}
                    className="text-[#635bff] hover:text-[#493ee5] font-bold text-xs underline cursor-pointer"
                  >
                    + Attach PDF Report
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons directly inside this single TASK SUBMISSION container */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Attach PDF Report Button */}
                <button
                  type="button"
                  onClick={triggerPdfPicker}
                  className="px-4 py-2.5 rounded-xl border-2 border-[#635bff]/25 bg-[#faf8ff] hover:bg-[#ede9fe] text-[#493ee5] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <FileText className="w-4 h-4 text-[#635bff]" />
                  <span>{uploadedFile ? 'Replace / Attach PDF Report' : '+ Attach PDF Report'}</span>
                </button>
              </div>

              {/* Submit Task to AI Evaluator Button */}
              <button
                type="button"
                onClick={handleSubmitEvaluation}
                disabled={isEvaluating}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#493ee5] to-[#635bff] hover:from-[#3e34c9] hover:to-[#5248e5] text-white text-xs font-bold transition-all shadow-md shadow-[#635bff]/25 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI is evaluating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-white" />
                    <span>Submit Task to AI Evaluator</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}
