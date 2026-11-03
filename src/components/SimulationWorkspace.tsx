import React, { useState, useEffect } from 'react';
import {
  Building2,
  Sparkles,
  Play,
  CheckCircle2,
  Clock,
  Send,
  RefreshCw,
  Search,
  Check,
  FileCode,
  CheckSquare,
  Square,
  Download,
  Terminal,
  Cpu,
  Layers,
  ShieldCheck,
  Globe2,
  FileText,
  AlertCircle,
  Copy,
  ChevronRight,
  Code2,
} from 'lucide-react';
import { TaskDeliverable, CompanyPreset, EvaluateSubmissionResponse, GenerateTaskResponse, SearchAndGenerateResponse } from '../types';
import { COMPANY_PRESETS, CODE_WORKSPACE_FILES } from '../data/presets';

interface SimulationWorkspaceProps {
  currentTask: TaskDeliverable;
  onTaskUpdated: (task: TaskDeliverable, company: CompanyPreset) => void;
  onEvaluationCompleted: (evaluation: EvaluateSubmissionResponse, timeTakenMins: number, submission: string) => void;
  isLoading: boolean;
  selectedCompany: CompanyPreset;
  setSelectedCompany: (company: CompanyPreset) => void;
}

export const SimulationWorkspace: React.FC<SimulationWorkspaceProps> = ({
  currentTask,
  onTaskUpdated,
  onEvaluationCompleted,
  isLoading,
  selectedCompany,
  setSelectedCompany,
}) => {
  // Search bar for Action 2: search_and_generate_company_task
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingCompany, setIsSearchingCompany] = useState(false);

  // File Tabs
  const [activeFile, setActiveFile] = useState<'webhookHandler' | 'idempotencyService' | 'testSuite' | 'terminalLog'>('webhookHandler');
  const [fileContents, setFileContents] = useState({
    webhookHandler: CODE_WORKSPACE_FILES.webhookHandler,
    idempotencyService: CODE_WORKSPACE_FILES.idempotencyService,
    testSuite: CODE_WORKSPACE_FILES.testSuite,
    terminalLog: CODE_WORKSPACE_FILES.terminalLog,
  });

  // Implementation Rationale & Concurrency Trade-offs
  const [rationaleNotes, setRationaleNotes] = useState(
    'Acquired single-flight Redis lock with 10,000ms TTL using SET NX PX to protect the payments ledger against race condition re-entries. Cryptographic HMAC validation is computed before database mutations to shield memory pools from spoofed payload deserialization.'
  );

  // Time tracking
  const [timeTakenMins, setTimeTakenMins] = useState<number>(75);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(13637); // 03:47:17

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
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Ticking countdown clock for standup
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
          tech_stack: company.techStack,
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

  // ACTION 2: search_and_generate_company_task (Triggered from unlisted company search bar)
  const handleSearchCompany = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

      // Create a virtual company preset from discovered data
      const discoveredCompany: CompanyPreset = {
        id: 'auto-' + Date.now(),
        name: data.discovered_company_name,
        verified: true,
        track: `${data.discovered_company_name} Platform Engineering Track`,
        location: data.simulated_timezone_and_hours.split('(')[0] || 'Global Remote HQ',
        assignedRole: 'Junior Software Engineer - Core Systems',
        squad: 'Squad: Core Systems & Resiliency',
        techStack: data.detected_tech_stack,
        culture: data.detected_culture,
        managerName: 'Alex Mercer',
        managerRole: 'Principal Platform Lead',
        managerHandle: `${data.discovered_company_name} Eng (@amercer)`,
        managerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        timezoneLabel: data.simulated_timezone_and_hours,
        accentColor: '#635bff',
        logoBg: '#635bff',
        logoText: data.discovered_company_name.substring(0, 2).toUpperCase(),
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

  // ACTION 3: evaluate_submission (Triggered when user clicks "Submit Task to AI Evaluator")
  const handleSubmitEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const fullSubmission = `CODE IMPLEMENTATION:\n${fileContents.webhookHandler}\n\nIMPLEMENTATION RATIONALE & CONCURRENCY TRADE-OFFS:\n${rationaleNotes}`;

      const response = await fetch('/api/engine/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate_submission',
          task_title: currentTask.task_title,
          student_submission: fullSubmission,
          time_taken_mins: timeTakenMins,
        }),
      });

      const evalData: EvaluateSubmissionResponse = await response.json();
      onEvaluationCompleted(evalData, timeTakenMins, fullSubmission);
    } catch (err) {
      console.error(err);
      alert('Evaluation failed. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRunTests = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      setTestRunCount((prev) => prev + 1);
    }, 600);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 text-[#131b2e]">
      {/* Active Sandbox Session Sub-Bar (Matches screen_f251a6c4.png) */}
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

      {/* Unlisted Company Search Bar (Action 2 trigger) */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Preset Company Chips (Action 1 triggers) */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0 text-[10px]">
            Employers:
          </span>
          {COMPANY_PRESETS.map((comp) => {
            const isSelected = selectedCompany.name.toLowerCase() === comp.name.toLowerCase();
            return (
              <button
                key={comp.id}
                onClick={() => handleSelectPreset(comp)}
                disabled={isSearchingCompany}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
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
        <form onSubmit={handleSearchCompany} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search unlisted company (e.g. Airbnb, Uber, Shopify)..."
              className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-[#faf8ff] focus:outline-none focus:border-[#635bff] focus:bg-white text-slate-800"
            />
          </div>
          <button
            type="submit"
            disabled={isSearchingCompany || !searchQuery.trim()}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#493ee5] hover:bg-[#3e34c9] text-white transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1"
          >
            {isSearchingCompany ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <span>Discover</span>
            )}
          </button>
        </form>
      </div>

      {/* Main Grid: Left Spec Sidebar + Right Code Workspace (Matches screen_f251a6c4.png) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (4.2 cols) */}
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
                <div className="text-sm font-mono font-bold text-[#0f172a] mt-0.5">11:46:25</div>
                <div className="text-[10px] text-[#635bff] font-medium">IST (GMT+1)</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500">Your Local Device</div>
                <div className="text-sm font-mono font-bold text-[#0f172a] mt-0.5">03:46:25</div>
                <div className="text-[10px] text-slate-500 font-medium">EST (New York)</div>
              </div>
            </div>
          </div>

          {/* Time to Office Standup / EOD Handover Card (Matches screen_f251a6c4.png) */}
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
                  <p className="text-[11px] text-slate-500">Acquire single-flight key with 10,000ms TTL via <code className="text-[#635bff] font-mono">SET NX EX</code></p>
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
                  <p className="text-[11px] text-slate-500">Validate <code className="text-[#635bff] font-mono">stripe-signature</code> against raw byte buffers</p>
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
                  <p className="text-[11px] text-slate-500">If duplicate event ID received within window, return HTTP 200 with stored payload</p>
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
                  <p className="text-[11px] text-slate-500">Zero dropped packets during simulated out-of-order webhook deliveries</p>
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
              {(('required_technology' in currentTask ? currentTask.required_technology : currentTask.detected_tech_stack) || selectedCompany.techStack)
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

        {/* Right Column: Code Editor & Jest Runner (7.8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#0f172a] rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col text-slate-300">
            {/* Editor Top Bar with File Tabs */}
            <div className="bg-[#1e293b] px-3 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  onClick={() => setActiveFile('webhookHandler')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
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
                <button
                  onClick={handleRunTests}
                  disabled={isTesting}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-[#635bff] hover:bg-[#5248e5] text-white font-bold text-xs shadow-xs transition-colors"
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

            {/* Jest Execution Console (Active Run) - Matches screen_f251a6c4.png */}
            <div className="bg-[#050811] border-t border-slate-800 p-3.5 text-xs font-mono">
              <div className="flex items-center justify-between text-[11px] pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Jest Execution Console (Active Run)</span>
                </div>
                <div className="text-slate-500 text-[10px]">
                  Execution time: 312ms · Memory RSS: 48.2MB · Run #{testRunCount}
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

          {/* Implementation Rationale & Concurrency Trade-Offs (Matches screen_f251a6c4.png) */}
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

          {/* Bottom Action Bar (Matches screen_f251a6c4.png) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
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

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleRunTests}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Re-run Unit Tests</span>
              </button>

              {/* ACTION 3 TRIGGER BUTTON */}
              <button
                onClick={handleSubmitEvaluation}
                disabled={isEvaluating}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#493ee5] to-[#635bff] hover:from-[#3e34c9] hover:to-[#5248e5] text-white text-xs font-bold transition-all shadow-md shadow-[#635bff]/25 flex items-center gap-2 disabled:opacity-50"
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>AI Evaluator Assessing...</span>
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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
