export interface GenerateTaskResponse {
  action_type: 'generate_task_response';
  task_id: string;
  company_name: string;
  task_title: string;
  scenario_description: string;
  required_technology: string;
  simulated_timezone_and_hours: string;
  manager_instructions: string;
  expected_deliverable: string;
}

export interface SearchAndGenerateResponse {
  action_type: 'search_and_generate_response';
  discovered_company_name: string;
  detected_tech_stack: string;
  detected_culture: string;
  task_id: string;
  task_title: string;
  scenario_description: string;
  simulated_timezone_and_hours: string;
  manager_instructions: string;
  expected_deliverable: string;
}

export interface EvaluateSubmissionResponse {
  action_type: 'evaluate_submission_response';
  overall_score: number;
  technical_accuracy_score: number;
  cultural_fit_and_communication_score: number;
  detailed_feedback: string;
  hr_dashboard_summary: string;
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
  techStack: string;
  culture: string;
  managerName: string;
  managerRole: string;
  managerHandle: string;
  managerAvatar: string;
  timezoneLabel: string;
  accentColor: string;
  logoBg?: string;
  logoText?: string;
}

export interface CompletedSimulation {
  id: string;
  studentName: string;
  studentId: string;
  companyName: string;
  techStack: string;
  task: TaskDeliverable;
  submission: string;
  timeTakenMins: number;
  evaluation: EvaluateSubmissionResponse;
  completedAt: string;
}
