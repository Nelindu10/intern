export interface GenerateTaskResponse {
  action_type: 'generate_task_response';
  task_id: string;
  company_name?: string;
  discovered_company_name?: string;
  detected_tech_stack?: string;
  detected_culture?: string;
  task_title: string;
  scenario_description: string;
  simulated_timezone_and_hours: string;
  manager_instructions: string;
  expected_deliverable: string;
  required_technology?: string;
  tech_stack_or_domain?: string;
}

export interface SearchAndGenerateResponse {
  action_type: 'generate_task_response' | 'search_and_generate_response';
  task_id: string;
  company_name?: string;
  discovered_company_name?: string;
  detected_tech_stack?: string;
  detected_culture?: string;
  task_title: string;
  scenario_description: string;
  simulated_timezone_and_hours: string;
  manager_instructions: string;
  expected_deliverable: string;
  required_technology?: string;
  tech_stack_or_domain?: string;
}

export interface EvaluateSubmissionResponse {
  action_type: 'evaluate_submission_response';
  overall_score: number;
  technical_or_analytical_score: number;
  technical_accuracy_score?: number; // Backward-compatible alias
  cultural_fit_and_communication_score: number;
  detailed_feedback: string;
  hr_dashboard_summary: string;
  submission_type?: 'code' | 'pdf_document';
}

export type TaskDeliverable = GenerateTaskResponse | SearchAndGenerateResponse;

export interface CompanyPreset {
  id: string;
  name: string;
  verified?: boolean;
  track: string;
  location: string;
  assignedRole: string;
  squad: string;
  techStack: string; // or domain
  culture: string;
  managerName: string;
  managerRole: string;
  managerHandle: string;
  managerAvatar: string;
  timezoneLabel: string;
  accentColor: string;
  logoBg?: string;
  logoText?: string;
  defaultSubmissionType?: 'code' | 'pdf_document';
}

export interface CompletedSimulation {
  id: string;
  studentName: string;
  studentId: string;
  companyName: string;
  techStack: string;
  task: TaskDeliverable;
  submission: string;
  submissionType?: 'code' | 'pdf_document';
  timeTakenMins: number;
  evaluation: EvaluateSubmissionResponse;
  completedAt: string;
}
