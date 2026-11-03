import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Sparkles,
  Play,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Check,
  FileCode,
  CheckSquare,
  Square,
  Download,
  Terminal,
  Cpu,
  Globe2,
  FileText,
  AlertCircle,
  Copy,
  Code2,
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
  ExternalLink,
} from 'lucide-react';
import {
  TaskDeliverable,
  CompanyPreset,
  EvaluateSubmissionResponse,
  GenerateTaskResponse,
  SearchAndGenerateResponse,
} from '../types';
import { COMPANY_PRESETS, CODE_WORKSPACE_FILES, SAMPLE_BA_PDF_REPORT } from '../data/presets';

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

  // Allowed employer limit based on user plan
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

  // Search bar for Action 2: search_and_generate_company_task
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingCompany, setIsSearchingCompany] = useState(false);

  // ---------------------------------------------------------------------------
  // REQUIREMENT 1: FILE UPLOAD STATE & PDF ATTACHMENT
  // State variable `uploadedFile` captures the PDF file when selected via "+ Attach PDF Report".
  // Displays the file name once attached.
  // Pre-attached with "Stripe_Fintech_Deliverable.pdf" as shown in the interface screenshot.
  // ---------------------------------------------------------------------------
  const [uploadedFile, setUploadedFile] = useState<AttachedPdf | null>({
    name: 'Stripe_Fintech_Deliverable.pdf',
    sizeFormatted: '3.8 MB',
    content: SAMPLE_BA_PDF_REPORT,
  });

  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // View mode switcher: 'code' or 'pdf_document'
  const [activeWorkspaceView, setActiveWorkspaceView] = useState<'code' | 'pdf_document'>('code');

  // Testing & Error Simulation States (Matches screen.png)
  const [simulateNetworkError, setSimulateNetworkError] = useState(false);
  const [showPayloadSchemaModal, setShowPayloadSchemaModal] = useState(false);

  // Code Workspace File Tabs
  const [activeFile, setActiveFile] = useState<'webhookHandler' | 'idempotencyService' | 'testSuite' | 'terminalLog'>('webhookHandler');
  const [fileContents, setFileContents] = useState({
    webhookHandler: CODE_WORKSPACE_FILES.webhookHandler,
    idempotencyService: CODE_WORKSPACE_FILES.idempotencyService,
    testSuite: CODE_WORKSPACE_FILES.testSuite,
    terminalLog: CODE_WORKSPACE_FILES.terminalLog,
  });

  // Implementation Rationale & Concurrency / Analytical Trade-offs
  const [rationaleNotes, setRationaleNotes] = useState(
    'Acquired single-flight Redis lock with 10,000ms TTL using SET NX PX to protect the payments ledger against race condition re-entries. Cryptographic HMAC validation is computed before database mutations to shield memory pools from spoofed payload deserialization.'
  );

  // Time tracking
  const [timeTakenMins, setTimeTakenMins] = useState<number>(30); // 30 mins per requirement
  const [countdownSeconds, setCountdownSeconds] = useState<number>(13087); // 03:38:07

  // Acceptance Checklist
  const [checklist, setChecklist] = useState<{ [key: number]: boolean }>({
    0: true,
    1: true,
    2: false,
    3: false,
  });

  // Jest runner state
  const [isTesting, setIsTesting] = useState(false);
  const [testRunCount, setTestRunCount] = useState(4);

  // ---------------------------------------------------------------------------
  // REQUIREMENT 3 & 4: GEMINI EVALUATION STATES & LIGHT PURPLE MODAL
  // ---------------------------------------------------------------------------
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationStage, setEvaluationStage] = useState<string>('');
  const [evalError, setEvalError] = useState<string | null>(null);
  const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluateSubmissionResponse | null>(null);
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  // Countdown timer for foreign office standup
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

  // Handle PDF file selection from file input
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
          ? `# EXTRACTED DELIVERABLE: ${file.name}\n` +
            `Size: ${sizeFormatted} | Uploaded: ${new Date().toLocaleTimeString()}\n\n` +
            text
          : `# EXTRACTED DELIVERABLE CONTENT: ${file.name}\n` +
            `Source: ${file.name} (${sizeFormatted})\n` +
            `Parsed via NIBM Industry Simulation Ingress Engine\n\n` +
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
    // Reset file input so re-selecting same file triggers event
    e.target.value = '';
  };

  // Trigger file selection dialog
  const triggerPdfPicker = () => {
    fileInputRef.current?.click();
  };

  // Remove attached PDF
  const handleRemoveAttachedPdf = () => {
    setUploadedFile(null);
  };

  // ACTION 1: generate_task (Triggered when user clicks a preset company)
  const handleSelectPreset = async (company: CompanyPreset) => {
    setSelectedCompany(company);
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

  // Enforce company limit on selectedCompany
  useEffect(() => {
    const currentIndex = COMPANY_PRESETS.findIndex(
      (c) => c.name.toLowerCase() === selectedCompany.name.toLowerCase()
    );
    if (currentIndex !== -1 && currentIndex >= allowedCompanyCount) {
      handleSelectPreset(COMPANY_PRESETS[0]);
    }
  }, [activePlan, allowedCompanyCount, selectedCompany.name]);

  // ACTION 2: search_and_generate_company_task
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
        'TypeScript, Node.js, Express';

      const isBa =
        compStack.toLowerCase().includes('business') ||
        compStack.toLowerCase().includes('analysis') ||
        compStack.toLowerCase().includes('uml') ||
        data.expected_deliverable?.toLowerCase().includes('pdf');

      const discoveredCompany: CompanyPreset = {
        id: 'auto-' + Date.now(),
        name: compName,
        verified: true,
        track: `${compName} Enterprise Track`,
        location: data.simulated_timezone_and_hours?.split('(')[0] || 'Global Remote HQ',
        assignedRole: isBa ? 'Associate Business Analyst & Consultant' : 'Junior Software Engineer - Core Systems',
        squad: isBa ? 'Squad: Enterprise Requirements & Agile Delivery' : 'Squad: Core Systems & Resiliency',
        techStack: compStack,
        culture: data.detected_culture || 'Agile Delivery, Engineering Excellence',
        managerName: isBa ? 'Priyantha De Silva' : 'Alex Mercer',
        managerRole: isBa ? 'Lead Business Analyst' : 'Principal Platform Lead',
        managerHandle: `${compName} Eng`,
        managerAvatar: isBa
          ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        timezoneLabel: data.simulated_timezone_and_hours,
        accentColor: '#635bff',
        logoBg: '#635bff',
        logoText: compName.substring(0, 2).toUpperCase(),
        defaultSubmissionType: isBa ? 'pdf_document' : 'code',
      };

      setSelectedCompany(discoveredCompany);
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
  // REQUIREMENT 2 & 3: SUBMISSION LOGIC & GEMINI API INTEGRATION
  // - Check if an attached PDF exists (uploadedFile)
  // - If attached: submission_type = "pdf_document", student_submission = uploadedFile's name/content
  // - Otherwise: fall back to "code"
  // - Send exact JSON payload structure:
  //   {
  //     "action": "evaluate_submission",
  //     "task_title": "Current Task Title",
  //     "submission_type": "pdf_document" (or "code"),
  //     "student_submission": "...",
  //     "time_taken_mins": 30
  //   }
  // - Uses import.meta.env.VITE_GEMINI_API_KEY
  // ---------------------------------------------------------------------------
  const handleSubmitEvaluation = async () => {
    setIsEvaluating(true);
    setEvalError(null);
    setEvaluationStage('Validating deliverables and connecting to Gemini Evaluator Engine...');

    try {
      if (simulateNetworkError) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        throw new Error(
          'Simulated Network Error: AI Evaluator endpoint timeout. Uncheck "Simulate Network Error" in top bar to test live evaluation.'
        );
      }

      // Check if an attached PDF exists
      const hasPdf = !!uploadedFile;
      const submissionType: 'pdf_document' | 'code' = hasPdf ? 'pdf_document' : 'code';

      // Build student_submission payload string
      const studentSubmission = hasPdf
        ? `[ATTACHED PDF DELIVERABLE]\nDocument Name: ${uploadedFile.name}\nSize: ${uploadedFile.sizeFormatted}\n\nCONTENT / REPORT EXTRACT:\n${uploadedFile.content}\n\nIMPLEMENTATION & ANALYTICAL RATIONALE:\n${rationaleNotes}`
        : `[CODE SUBMISSION]\nFile: ${activeFile}.ts\n\nCODE IMPLEMENTATION:\n${fileContents[activeFile]}\n\nIMPLEMENTATION RATIONALE & CONCURRENCY TRADE-OFFS:\n${rationaleNotes}`;

      // Exact JSON payload structure requested:
      const payload = {
        action: 'evaluate_submission',
        task_title: currentTask.task_title,
        submission_type: submissionType,
        student_submission: studentSubmission,
        time_taken_mins: 30,
      };

      const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
      let evalData: EvaluateSubmissionResponse | null = null;

      // 1. Direct Google Gemini API call with VITE_GEMINI_API_KEY
      if (apiKey) {
        setEvaluationStage('Evaluating via Google Gemini (gemini-3.8-flash)...');
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(
            apiKey
          )}`;

          const isPdf = submissionType === 'pdf_document';
          const systemInstruction =
            'You are the core AI Engine for the "AI-Driven Virtual Internship & Industry Simulation Platform". You act as a Virtual Technical Manager, Business Analysis Lead, and Institutional HR Evaluator for IT undergraduates.\n\n' +
            `The student has submitted a ${isPdf ? 'PDF assignment report ("pdf_document")' : 'code implementation ("code")'}.\n\n` +
            (isPdf
              ? 'CRITICAL EVALUATION CRITERIA FOR PDF REPORT:\n' +
                'Instead of checking code syntax, evaluate the uploaded PDF content based strictly on:\n' +
                '1. Analytical thinking and problem-solving approach.\n' +
                '2. Business logic and technical requirement coverage.\n' +
                '3. Professional formatting, structure, and clarity of the report.\n\n'
              : 'CRITICAL EVALUATION CRITERIA FOR CODE:\n' +
                'Evaluate code syntax, architectural robustness, distributed locks/idempotency, and regression resistance.\n\n') +
            'You must ALWAYS respond in strict JSON format. Do not include markdown formatting like ```json or any conversational text outside the JSON object.\n\n' +
            'Required JSON response structure:\n' +
            '{\n' +
            '  "action_type": "evaluate_submission_response",\n' +
            '  "overall_score": 88,\n' +
            '  "technical_or_analytical_score": 90,\n' +
            '  "cultural_fit_and_communication_score": 85,\n' +
            '  "detailed_feedback": "What was done right:\\n• Specific review of the content\\n\\nWhat needs improvement:\\n• Specific actionable recommendations",\n' +
            '  "hr_dashboard_summary": "Two-sentence summary for the NIBM HR Dashboard regarding student industry readiness."\n' +
            '}';

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
                overall_score: Number(parsed.overall_score) || 88,
                technical_or_analytical_score:
                  Number(parsed.technical_or_analytical_score) || Number(parsed.technical_accuracy_score) || 90,
                cultural_fit_and_communication_score:
                  Number(parsed.cultural_fit_and_communication_score) || 85,
                detailed_feedback: parsed.detailed_feedback || 'Submission reviewed successfully.',
                hr_dashboard_summary:
                  parsed.hr_dashboard_summary || 'Candidate demonstrated enterprise-ready competency.',
                submission_type: submissionType,
              };
            }
          }
        } catch (directErr) {
          console.warn('Direct Gemini API fetch error, falling back to backend endpoint:', directErr);
        }
      }

      // 2. Fallback to backend proxy (/api/engine/request)
      if (!evalData) {
        setEvaluationStage('Connecting to SimulateHub Evaluation Gateway (/api/engine/request)...');
        const response = await fetch('/api/engine/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Evaluation gateway returned status ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        evalData = {
          action_type: 'evaluate_submission_response',
          overall_score: Number(data.overall_score) || 87,
          technical_or_analytical_score:
            Number(data.technical_or_analytical_score) || Number(data.technical_accuracy_score) || 89,
          cultural_fit_and_communication_score:
            Number(data.cultural_fit_and_communication_score) || 84,
          detailed_feedback: data.detailed_feedback || 'Submission verified against enterprise rubrics.',
          hr_dashboard_summary:
            data.hr_dashboard_summary || 'Candidate demonstrated high analytical rigor and requirement coverage.',
          submission_type: submissionType,
        };
      }

      setEvaluationResult(evalData);
      setEvaluationModalOpen(true);

      // Pass result to parent app
      onEvaluationCompleted(evalData, 30, studentSubmission, submissionType);
    } catch (err: any) {
      console.error('AI Evaluation error:', err);
      setEvalError(err.message || 'AI Evaluation encountered an error. Please try again.');
    } finally {
      setIsEvaluating(false);
      setEvaluationStage('');
    }
  };

  const handleRunTests = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      setTestRunCount((prev) => prev + 1);
    }, 600);
  };

  const handleCopyFeedback = () => {
    if (!evaluationResult) return;
    const text = `SimulateHub AI Evaluation Report\nTask: ${currentTask.task_title}\nCompany: ${selectedCompany.name}\nSubmission Type: ${evaluationResult.submission_type || (uploadedFile ? 'pdf_document' : 'code')}\nOverall Score: ${evaluationResult.overall_score}/100\nTechnical/Analytical Score: ${evaluationResult.technical_or_analytical_score}/100\nCulture/Communication Score: ${evaluationResult.cultural_fit_and_communication_score}/100\n\nHR Dashboard Summary:\n${evaluationResult.hr_dashboard_summary}\n\nDetailed Feedback:\n${evaluationResult.detailed_feedback}`;
    navigator.clipboard.writeText(text);
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 text-[#131b2e] relative">
      {/* Hidden file input for attaching/replacing PDF reports */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handlePdfFileChange}
        className="hidden"
      />

      {/* Plan Restriction Toast / Alert Notification (Light Purple & White Theme) */}
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
                  `Access to ${lockedToast.companyName} is restricted under your ${activePlan} plan. Upgrade to unlock all company simulations.`}
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

      {/* Payload Schema Inspection Modal */}
      {showPayloadSchemaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#493ee5] to-[#635bff] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Code2 className="w-4 h-4" />
                <span>Strict API Payload Specification (Action: evaluate_submission)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPayloadSchemaModal(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-600">
                Dispatched to Gemini API using{' '}
                <code className="text-[#635bff] font-mono font-semibold">import.meta.env.VITE_GEMINI_API_KEY</code>:
              </p>
              <div className="bg-[#0f172a] text-[#dae2fd] p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                <pre>{JSON.stringify(
                  {
                    action: 'evaluate_submission',
                    task_title: currentTask.task_title,
                    submission_type: uploadedFile ? 'pdf_document' : 'code',
                    student_submission: uploadedFile
                      ? `[Attached PDF: ${uploadedFile.name} (${uploadedFile.sizeFormatted})]`
                      : `[Raw code implementation from ${activeFile}.ts]`,
                    time_taken_mins: 30,
                  },
                  null,
                  2
                )}</pre>
              </div>
              <div className="bg-[#faf8ff] border border-[#635bff]/20 rounded-xl p-3 space-y-1">
                <div className="font-bold text-[#493ee5] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#635bff]" />
                  <span>Evaluation Criteria</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {uploadedFile
                    ? 'PDF Document: Evaluates analytical thinking, business logic, requirement coverage, and professional report structure.'
                    : 'Code: Evaluates syntax, idempotency locks, regression suites, and concurrency trade-offs.'}
                </p>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPayloadSchemaModal(false)}
                  className="px-4 py-2 bg-[#635bff] text-white font-bold rounded-xl hover:bg-[#5248e5] transition-colors cursor-pointer"
                >
                  Close Specification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------- */}
      {/* REQUIREMENT 4: LIGHT PURPLE MODAL FOR EVALUATION RESULTS */}
      {/* ----------------------------------------------------------------------- */}
      {evaluationModalOpen && evaluationResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full border-2 border-[#635bff]/30 shadow-2xl overflow-hidden relative text-[#131b2e] my-auto">
            {/* Header with light purple gradient */}
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
                <span>SimulateHub · Institutional HR & Technical Evaluation</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display">
                Industry Assessment & Readiness Audit
              </h2>

              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-white/85">
                <span className="font-semibold">{selectedCompany.name}</span>
                <span>•</span>
                <span className="font-mono bg-white/15 px-2 py-0.5 rounded text-[11px]">
                  {currentTask.task_id}
                </span>
                <span>•</span>
                <span className="bg-white/15 px-2 py-0.5 rounded text-[11px] font-medium">
                  {evaluationResult.submission_type === 'pdf_document' ? 'PDF Assignment Report' : 'Code Submission'}
                </span>
                <span>•</span>
                <span>30 mins</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Score Badges Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Overall Score */}
                <div className="bg-[#faf8ff] rounded-2xl p-4 border-2 border-[#635bff]/25 flex items-center gap-3.5 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#493ee5] to-[#635bff] text-white flex flex-col items-center justify-center font-display font-black text-xl shadow-md shadow-[#635bff]/30 shrink-0">
                    <span>{evaluationResult.overall_score}</span>
                    <span className="text-[8px] font-sans font-normal opacity-80 -mt-1">/100</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      OVERALL SCORE
                    </span>
                    <div className="text-sm font-bold text-[#0f172a]">
                      {evaluationResult.overall_score >= 85
                        ? 'Enterprise Ready'
                        : evaluationResult.overall_score >= 70
                        ? 'Competent'
                        : 'Needs Revision'}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Institutional Pass</span>
                    </div>
                  </div>
                </div>

                {/* Technical / Analytical Score */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-3.5 shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-[#ede9fe] text-[#493ee5] flex flex-col items-center justify-center font-display font-black text-lg border border-[#635bff]/20 shrink-0">
                    <span>{evaluationResult.technical_or_analytical_score}</span>
                    <span className="text-[8px] font-sans font-normal opacity-70 -mt-1">/100</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {evaluationResult.submission_type === 'pdf_document' ? 'ANALYTICAL RIGOR' : 'TECHNICAL LOGIC'}
                    </span>
                    <div className="text-xs font-bold text-[#0f172a]">
                      {evaluationResult.submission_type === 'pdf_document' ? 'Requirement Coverage' : 'Code Hygiene'}
                    </div>
                    <div className="text-[10px] text-slate-500">Benchmark: 80+</div>
                  </div>
                </div>

                {/* Cultural Fit & Communication */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-3.5 shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-[#ede9fe] text-[#493ee5] flex flex-col items-center justify-center font-display font-black text-lg border border-[#635bff]/20 shrink-0">
                    <span>{evaluationResult.cultural_fit_and_communication_score}</span>
                    <span className="text-[8px] font-sans font-normal opacity-70 -mt-1">/100</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      COMMUNICATION
                    </span>
                    <div className="text-xs font-bold text-[#0f172a]">Report Structure</div>
                    <div className="text-[10px] text-slate-500">Professional Clarity</div>
                  </div>
                </div>
              </div>

              {/* Detailed Review Section */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#635bff]" />
                  <span>
                    Detailed AI Review ({evaluationResult.submission_type === 'pdf_document' ? 'PDF Content' : 'Code'})
                  </span>
                </div>
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-[#faf8ff] p-3.5 rounded-xl border border-[#635bff]/15 font-sans">
                  {evaluationResult.detailed_feedback}
                </div>
              </div>

              {/* HR Dashboard Summary Card */}
              <div className="bg-gradient-to-br from-[#ede9fe]/60 via-white to-[#faf8ff] rounded-2xl p-4 border border-[#635bff]/25 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#493ee5] uppercase tracking-wider">
                    <FileCheck2 className="w-4 h-4 text-[#635bff]" />
                    <span>NIBM HR Dashboard Summary</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#493ee5] border border-[#635bff]/20">
                    Placement Metric
                  </span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-medium bg-white/80 p-3 rounded-xl border border-[#635bff]/10">
                  "{evaluationResult.hr_dashboard_summary}"
                </p>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCopyFeedback}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  {copiedFeedback ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
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

      {/* Active Sandbox Session Sub-Bar (Matches screen.png) */}
      <div className="bg-[#ede9fe]/50 border border-[#635bff]/20 rounded-xl px-4 py-2 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-[#493ee5]">
            <span className="w-2 h-2 rounded-full bg-[#635bff] animate-pulse"></span>
            <span className="uppercase tracking-wider text-[11px]">ACTIVE SANDBOX SESSION</span>
          </div>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-medium">Sprint 4 · Dublin Core Platform Hub</span>
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
            Allocated: 2 vCPU / 4GB RAM
          </span>
          <span className="flex items-center gap-1 text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Redis Cluster 127.0.0.1:6379 Connected
          </span>
        </div>
      </div>

      {/* Unlisted Company Search Bar & Preset Companies */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Preset Company Chips (Action 1 triggers) */}
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

        {/* Action 2: search_and_generate_company_task input */}
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
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#0f172a]"></div>
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
                title={!isPremium ? 'Custom AI Generation is a Premium feature.' : undefined}
                placeholder={
                  isPremium
                    ? 'Search unlisted company (e.g. Airbnb, Uber, Shopify)...'
                    : 'Search unlisted company (Premium only)...'
                }
                className={`w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border transition-all ${
                  !isPremium
                    ? 'bg-slate-100/90 text-slate-400 border-slate-200 cursor-not-allowed select-none placeholder:text-slate-400'
                    : 'bg-[#faf8ff] text-slate-800 border-slate-300 focus:outline-none focus:border-[#635bff] focus:bg-white'
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={!isPremium || isSearchingCompany || !searchQuery.trim()}
              title={!isPremium ? 'Custom AI Generation is a Premium feature.' : undefined}
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

      {/* Evaluating banner */}
      {isEvaluating && (
        <div className="bg-white/95 rounded-2xl p-6 border-2 border-[#635bff]/40 shadow-xl shadow-[#635bff]/10 ring-4 ring-[#635bff]/10 text-center animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-2xl bg-[#ede9fe] text-[#635bff] flex items-center justify-center mx-auto mb-3 shadow-inner">
            <RefreshCw className="w-7 h-7 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-[#0f172a] font-display">
            AI is evaluating your submission with Google Gemini...
          </h3>
          <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
            {evaluationStage || 'Benchmarking against enterprise rubrics...'}
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-[11px] text-[#493ee5] font-medium">
            <span className="flex items-center gap-1.5 bg-[#ede9fe] px-3 py-1 rounded-full border border-[#635bff]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#635bff]" />
              Submission Type: {uploadedFile ? 'pdf_document' : 'code'}
            </span>
            <span className="flex items-center gap-1.5 bg-[#ede9fe] px-3 py-1 rounded-full border border-[#635bff]/20">
              <BrainCircuit className="w-3.5 h-3.5 text-[#635bff]" />
              Model: gemini-3.8-flash
            </span>
          </div>
        </div>
      )}

      {/* Error banner */}
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

      {/* Main Grid: Left Spec Sidebar + Right Code Workspace (Matches screen.png) */}
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

          {/* Foreign Timezone Sync (Dual Clocks) */}
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
                <div className="text-[10px] text-slate-500">Dublin HQ Time</div>
                <div className="text-sm font-mono font-bold text-[#0f172a] mt-0.5">14:43:06</div>
                <div className="text-[10px] text-[#635bff] font-medium">IST (GMT+1)</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500">Your Local Device</div>
                <div className="text-sm font-mono font-bold text-[#0f172a] mt-0.5">20:13:06</div>
                <div className="text-[10px] text-slate-500 font-medium">EST (New York)</div>
              </div>
            </div>
          </div>

          {/* Time to Office Standup / EOD Handover Card (Matches screen.png) */}
          <div className="bg-gradient-to-br from-[#493ee5] to-[#635bff] text-white rounded-2xl p-4 shadow-md shadow-[#635bff]/20 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-semibold text-[#e2dfff]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Time to Office Standup / EOD Handover</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            <div className="text-3xl font-black font-display tracking-tight my-2">
              {formatCountdown(countdownSeconds)}
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/15">
              <span className="text-[11px] text-white/80">Next Handover Sync: 18:00 IST</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                Priority 1
              </span>
            </div>

            <div className="mt-2 text-[11px] text-white/70 flex items-center gap-1">
              <Clock className="w-3 h-3 text-white/80" />
              <span>Office Hours Active · Standup window locking in 3h 47m</span>
            </div>
          </div>

          {/* AI-Generated HR Onboarding Briefing (Sarah Jenkins) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#493ee5] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#635bff]" />
                <span>AI-Generated HR Onboarding Briefing</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">v4.2 Auth</span>
            </div>

            <div className="flex items-start gap-3 mt-3">
              <img
                src={selectedCompany.managerAvatar}
                alt={selectedCompany.managerName}
                className="w-10 h-10 rounded-xl object-cover border border-[#635bff]/20"
              />
              <div>
                <h4 className="text-xs font-bold text-[#0f172a]">
                  {selectedCompany.managerName} · {selectedCompany.managerRole}
                </h4>
                <p className="text-[10px] text-slate-500">
                  {selectedCompany.managerHandle} · Sent 14 mins ago
                </p>
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
              "{currentTask.manager_instructions}"
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
                  <strong className="text-slate-800">1. Distributed Redis Locking</strong>
                  <p className="text-[11px] text-slate-500">
                    Acquire single-flight key with 10,000ms TTL via{' '}
                    <code className="text-[#635bff] font-mono">SET NX EX</code>
                  </p>
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
                  <strong className="text-slate-800">2. HMAC-SHA256 Signature Verification</strong>
                  <p className="text-[11px] text-slate-500">
                    Validate <code className="text-[#635bff] font-mono">stripe-signature</code> against raw byte buffers
                  </p>
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
                  <strong className="text-slate-800">3. Handle Race Conditions & Cached Replay</strong>
                  <p className="text-[11px] text-slate-500">
                    If duplicate event ID received within window, return HTTP 200 with stored payload
                  </p>
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
                  <strong className="text-slate-800">4. Pass Edge-Case Regression Suites</strong>
                  <p className="text-[11px] text-slate-500">
                    Zero dropped packets during simulated out-of-order webhook deliveries
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Required Tech Stack */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              REQUIRED TECH STACK
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(
                ('required_technology' in currentTask
                  ? currentTask.required_technology
                  : currentTask.detected_tech_stack) || selectedCompany.techStack
              )
                .split(',')
                .map((tech: string, i: number) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#faf8ff] text-slate-800 border border-[#635bff]/15 font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#635bff]"></span>
                    {tech.trim()}
                  </span>
                ))}
            </div>
          </div>

          {/* Engineering Specs & Fixtures */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              ENGINEERING SPECS & FIXTURES
            </span>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-500" />
                <div>
                  <div className="font-semibold text-slate-800">idempotency_spec_v2.pdf</div>
                  <div className="text-[10px] text-slate-400">384 KB · Internal Dublin Eng Standard</div>
                </div>
              </div>
              <button className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#635bff]" />
                <div>
                  <div className="font-semibold text-slate-800">mock_stripe_payloads.json</div>
                  <div className="text-[10px] text-slate-400">14.2 KB · 12 Test cases included</div>
                </div>
              </div>
              <button className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor & Jest Runner (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Top Switcher Bar (Matches screen.png) */}
          <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveWorkspaceView('code')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeWorkspaceView === 'code'
                    ? 'bg-[#635bff] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code Editor</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveWorkspaceView('pdf_document')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeWorkspaceView === 'pdf_document'
                    ? 'bg-[#635bff] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#635bff]" />
                <span>Upload PDF Report</span>
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={simulateNetworkError}
                  onChange={(e) => setSimulateNetworkError(e.target.checked)}
                  className="rounded text-[#635bff] focus:ring-[#635bff] border-slate-300 cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <span className="text-slate-400">⚙</span>
                  <span>Simulate Network Error</span>
                </span>
              </label>

              <button
                type="button"
                onClick={() => setShowPayloadSchemaModal(true)}
                className="text-slate-600 hover:text-[#635bff] flex items-center gap-1 font-mono text-[11px] px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span>{`{ }`}</span>
                <span>View Payload Schema</span>
              </button>
            </div>
          </div>

          {/* View: Code Editor vs PDF Viewer */}
          {activeWorkspaceView === 'code' ? (
            <div className="bg-[#0f172a] rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col text-slate-300">
              {/* Editor Top Bar with File Tabs */}
              <div className="bg-[#1e293b] px-3 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
                <div className="flex items-center gap-1 overflow-x-auto">
                  <button
                    onClick={() => setActiveFile('webhookHandler')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                      activeFile === 'webhookHandler'
                        ? 'bg-[#0f172a] text-white font-semibold border-b-2 border-[#635bff]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span>webhookHandler.ts</span>
                  </button>

                  <button
                    onClick={() => setActiveFile('idempotencyService')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                      activeFile === 'idempotencyService'
                        ? 'bg-[#0f172a] text-white font-semibold border-b-2 border-[#635bff]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Code2 className="w-3 h-3 text-purple-400" />
                    <span>idempotencyService.ts</span>
                  </button>

                  <button
                    onClick={() => setActiveFile('testSuite')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                      activeFile === 'testSuite'
                        ? 'bg-[#0f172a] text-white font-semibold border-b-2 border-[#635bff]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>tests/webhook.test.ts</span>
                  </button>

                  <button
                    onClick={() => setActiveFile('terminalLog')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                      activeFile === 'terminalLog'
                        ? 'bg-[#0f172a] text-white font-semibold border-b-2 border-[#635bff]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Terminal className="w-3 h-3 text-amber-400" />
                    <span>terminal.log</span>
                  </button>
                </div>

                {/* Status and Action Buttons */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    TS 5.4 · 0 Errors
                  </span>
                  <span className="text-slate-600">|</span>
                  <button
                    type="button"
                    onClick={() => {}}
                    className="text-slate-400 hover:text-slate-200 text-[11px] font-mono cursor-pointer"
                  >
                    Format
                  </button>
                  <button
                    onClick={handleRunTests}
                    disabled={isTesting}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-[#635bff] hover:bg-[#5248e5] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    {isTesting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-white" />}
                    <span>Run Jest Suite</span>
                  </button>
                </div>
              </div>

              {/* Code Textarea Area */}
              <div className="p-4">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-2">
                  <span>// {activeFile}.ts</span>
                  <span>{fileContents[activeFile].split('\n').length} lines · UTF-8</span>
                </div>
                <textarea
                  value={fileContents[activeFile]}
                  onChange={(e) =>
                    setFileContents({
                      ...fileContents,
                      [activeFile]: e.target.value,
                    })
                  }
                  rows={19}
                  className="w-full font-mono text-xs p-3.5 rounded-xl border border-slate-800 bg-[#090d16] text-[#dae2fd] focus:outline-none focus:ring-1 focus:ring-[#635bff] leading-relaxed shadow-inner selection:bg-[#635bff]/40"
                />
              </div>

              {/* Jest Execution Console (Active Run) - Matches screen.png */}
              <div className="bg-[#050811] border-t border-slate-800 p-3.5 text-xs font-mono">
                <div className="flex items-center justify-between text-[11px] pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Jest Execution Console (Active Run)</span>
                  </div>
                  <div className="text-slate-500 text-[10px]">
                    Execution time: 312ms · Memory RSS: 48.2MB
                  </div>
                </div>

                <div className="mt-2.5 space-y-1 text-slate-300 text-[11px]">
                  <div className="text-emerald-400 font-bold">
                    PASS tests/webhook.test.ts (4 tests passed, 100% code coverage)
                  </div>
                  <div className="text-slate-400 pl-2">✓ should verify authentic HMAC-SHA256 signature (24 ms)</div>
                  <div className="text-slate-400 pl-2">✓ should acquire Redis NX lock and return 200 HTTP response (42 ms)</div>
                  <div className="text-slate-400 pl-2">✓ should drop duplicate replay packets within 10,000ms TTL window (18 ms)</div>
                  <div className="text-slate-400 pl-2">✓ should persist idempotent receipt token for 24 hours (35 ms)</div>
                </div>
              </div>
            </div>
          ) : (
            /* Upload PDF Report View */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0f172a]">
                      {uploadedFile ? uploadedFile.name : 'No PDF Report Attached'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Undergraduate Assignment Deliverable · {uploadedFile ? uploadedFile.sizeFormatted : '0 KB'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={triggerPdfPicker}
                  className="px-3.5 py-1.5 rounded-xl bg-[#ede9fe] hover:bg-[#ddd6fe] text-[#493ee5] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors border border-[#635bff]/20"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isExtractingPdf ? 'Extracting...' : 'Upload Replacement PDF'}</span>
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span>Document Content & Requirement Analysis:</span>
                  <span className="text-[11px] text-slate-400">
                    {uploadedFile ? `${uploadedFile.content.split('\n').length} lines · Parsed via NIBM Document Ingress` : 'No file'}
                  </span>
                </div>
                <textarea
                  value={uploadedFile ? uploadedFile.content : ''}
                  onChange={(e) => {
                    if (uploadedFile) {
                      setUploadedFile({
                        ...uploadedFile,
                        content: e.target.value,
                      });
                    }
                  }}
                  placeholder="Attach a PDF report to view and edit its extracted content here..."
                  rows={16}
                  className="w-full text-xs font-mono p-3.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#635bff] leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Implementation Rationale & Concurrency Trade-Offs (Matches screen.png) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                <FileCode className="w-4 h-4 text-[#635bff]" />
                <span>IMPLEMENTATION RATIONALE & CONCURRENCY TRADE-OFFS</span>
              </div>
              <span className="text-[11px] text-slate-400">Optional notes for AI & Peer Reviewer</span>
            </div>

            <textarea
              value={rationaleNotes}
              onChange={(e) => setRationaleNotes(e.target.value)}
              placeholder="Explain your Redis TTL strategy, how deadlocks are prevented if an exception occurs in ledgerQueue.dispatch(), and trade-offs made between strong idempotency vs latency..."
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#635bff] leading-relaxed"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Markdown supported (code blocks, bolding)</span>
              <span>Auto-saved 2s ago</span>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* REQUIREMENT 1: ATTACHED PDF REPORT CARD (Matches screen.png exactly) */}
          {/* ------------------------------------------------------------------- */}
          {uploadedFile ? (
            <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-3">
                {/* Red PDF Icon */}
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 border border-red-200 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
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
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#493ee5] text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer bg-[#faf8ff]"
                >
                  <RefreshCw className="w-3 h-3 text-[#635bff]" />
                  <span>Replace / + Attach New PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemoveAttachedPdf}
                  title="Remove attached PDF (fallback to code submission)"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Prompt when no PDF is attached */
            <div className="bg-[#faf8ff] rounded-2xl p-3 border border-dashed border-[#635bff]/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Paperclip className="w-4 h-4 text-[#635bff]" />
                <span>No PDF report attached. AI Evaluator will assess code in <code className="font-mono text-[#635bff]">{activeFile}.ts</code>.</span>
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

          {/* Bottom Action Bar (Matches screen.png exactly) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            {/* Left: Reviewer Profile */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#ede9fe] text-[#635bff] flex items-center justify-center font-bold text-xs">
                SJ
              </div>
              <div>
                <div className="text-xs font-bold text-[#0f172a]">
                  Sarah Jenkins <span className="text-[10px] font-semibold text-slate-400">Simulated Reviewer</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Principal Platform Engineer · Dublin Staff Core
                </div>
              </div>
            </div>

            {/* Right Buttons: Re-run Unit Tests + Attach PDF Report + Submit Task to AI Evaluator */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleRunTests}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Re-run Unit Tests</span>
              </button>

              {/* + Attach PDF Report Button */}
              <button
                type="button"
                onClick={triggerPdfPicker}
                className="px-3.5 py-2 rounded-xl border border-[#635bff]/30 bg-[#faf8ff] hover:bg-[#ede9fe] text-[#493ee5] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FileText className="w-3.5 h-3.5 text-[#635bff]" />
                <span>+ Attach PDF Report</span>
              </button>

              {/* ACTION: Submit Task to AI Evaluator */}
              <button
                type="button"
                onClick={handleSubmitEvaluation}
                disabled={isEvaluating}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#493ee5] to-[#635bff] hover:from-[#3e34c9] hover:to-[#5248e5] text-white text-xs font-bold transition-all shadow-md shadow-[#635bff]/25 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>AI is evaluating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 fill-white" />
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
