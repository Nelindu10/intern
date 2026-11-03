import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  Award,
  TrendingUp,
  Download,
  Filter,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Building,
  Clock,
  Sparkles,
} from 'lucide-react';
import { CompletedSimulation } from '../types';

interface AdminDashboardProps {
  cohortRecords: CompletedSimulation[];
  onSelectRecord: (record: CompletedSimulation) => void;
  onLaunchNewSimulation: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  cohortRecords,
  onSelectRecord,
  onLaunchNewSimulation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [filterReadiness, setFilterReadiness] = useState<string>('all');

  // Compute metrics
  const totalSimulations = cohortRecords.length;
  const avgOverall = Math.round(
    cohortRecords.reduce((acc, curr) => acc + curr.evaluation.overall_score, 0) / (totalSimulations || 1)
  );
  const avgTech = Math.round(
    cohortRecords.reduce((acc, curr) => acc + curr.evaluation.technical_accuracy_score, 0) / (totalSimulations || 1)
  );
  const avgCulture = Math.round(
    cohortRecords.reduce((acc, curr) => acc + curr.evaluation.cultural_fit_and_communication_score, 0) / (totalSimulations || 1)
  );

  const readyCount = cohortRecords.filter((r) => r.evaluation.overall_score >= 80).length;
  const readinessRate = totalSimulations ? Math.round((readyCount / totalSimulations) * 100) : 0;

  // Filter records
  const filteredRecords = cohortRecords.filter((record) => {
    const matchSearch =
      record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.task.task_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCompany = filterCompany === 'all' || record.companyName === filterCompany;

    const isReady = record.evaluation.overall_score >= 80;
    const matchReadiness =
      filterReadiness === 'all' ||
      (filterReadiness === 'ready' && isReady) ||
      (filterReadiness === 'needs_work' && !isReady);

    return matchSearch && matchCompany && matchReadiness;
  });

  const exportCSV = () => {
    const headers = [
      'Student ID',
      'Student Name',
      'Company',
      'Task ID',
      'Overall Score',
      'Tech Score',
      'Culture Score',
      'Time Taken',
      'HR Summary',
    ];

    const rows = cohortRecords.map((r) => [
      `"${r.studentId}"`,
      `"${r.studentName}"`,
      `"${r.companyName}"`,
      `"${r.task.task_id}"`,
      r.evaluation.overall_score,
      r.evaluation.technical_accuracy_score,
      r.evaluation.cultural_fit_and_communication_score,
      `"${r.timeTakenMins || 75} mins"`,
      `"${r.evaluation.hr_dashboard_summary.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NIBM_Cohort_Simulation_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Institutional Top Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ede9fe] text-[#493ee5] mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>NIBM Corporate Placement & Industry Linkage Cell</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a] font-display">
              Undergraduate IT Internship Evaluation Dashboard
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl">
              Monitored by Virtual Technical Leads and Corporate HR Evaluators powered by Gemini 3.8 Flash. Provides institutional assessment metrics on student industry readiness before company placement.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#635bff]" />
              <span>Export Cohort CSV</span>
            </button>
            <button
              onClick={onLaunchNewSimulation}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#635bff] hover:bg-[#5248e5] text-white shadow-md shadow-[#635bff]/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Start New Simulation</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-[#faf8ff] border border-[#635bff]/10">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Total Simulations</span>
              <Users className="w-4 h-4 text-[#635bff]" />
            </div>
            <div className="text-3xl font-black font-display text-[#0f172a] mt-2">
              {totalSimulations}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">IT Undergraduates Evaluated</div>
          </div>

          <div className="p-4 rounded-xl bg-[#faf8ff] border border-[#635bff]/10">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Avg Technical Accuracy</span>
              <Award className="w-4 h-4 text-[#635bff]" />
            </div>
            <div className="text-3xl font-black font-display text-[#0f172a] mt-2">
              {avgTech}<span className="text-sm font-normal text-slate-400">/100</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">Verified Production Standards</div>
          </div>

          <div className="p-4 rounded-xl bg-[#faf8ff] border border-[#635bff]/10">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Avg Cultural & Tone Fit</span>
              <ShieldCheck className="w-4 h-4 text-[#8b5cf6]" />
            </div>
            <div className="text-3xl font-black font-display text-[#0f172a] mt-2">
              {avgCulture}<span className="text-sm font-normal text-slate-400">/100</span>
            </div>
            <div className="text-[11px] text-purple-600 font-medium mt-1">Company Workplace Tone</div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              <span>Placement Readiness</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black font-display text-emerald-900 mt-2">
              {readinessRate}%
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">Ready for Industry Placement</div>
          </div>
        </div>
      </div>

      {/* Student Records Table & Search/Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate, student ID, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#635bff]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Status:</span>
              <select
                value={filterReadiness}
                onChange={(e) => setFilterReadiness(e.target.value)}
                className="text-xs p-1.5 rounded border border-slate-200 bg-white focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="ready">Industry Ready (80+)</option>
                <option value="needs_work">Needs Mentorship (&lt;80)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Student & ID</th>
                <th className="py-3 px-4">Employer & Task</th>
                <th className="py-3 px-4">Overall Score</th>
                <th className="py-3 px-4">Tech Accuracy</th>
                <th className="py-3 px-4">Cultural Fit</th>
                <th className="py-3 px-4">Time Taken</th>
                <th className="py-3 px-4">Placement Verdict</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => {
                  const isReady = record.evaluation.overall_score >= 80;
                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => onSelectRecord(record)}
                    >
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div>{record.studentName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{record.studentId}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#0f172a]">{record.companyName}</div>
                        <div className="text-[11px] font-mono text-[#635bff]">{record.task.task_id}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#0f172a] font-display">
                            {record.evaluation.overall_score}
                          </span>
                          <div className="w-12 bg-slate-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${isReady ? 'bg-emerald-500' : 'bg-amber-500'}`}
                              style={{ width: `${record.evaluation.overall_score}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        {record.evaluation.technical_accuracy_score}%
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        {record.evaluation.cultural_fit_and_communication_score}%
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {record.timeTakenMins || 75} mins
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {isReady ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            Industry Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3" />
                            Needs Guidance
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRecord(record);
                          }}
                          className="text-xs text-[#635bff] hover:text-[#493ee5] font-semibold inline-flex items-center gap-1"
                        >
                          <span>Full Audit</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No simulation records matching current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
