import { CompanyPreset, CompletedSimulation, GenerateTaskResponse } from '../types';

export const COMPANY_PRESETS: CompanyPreset[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    verified: true,
    track: 'FinTech Infrastructure Track',
    location: 'Dublin HQ · UTC+1',
    assignedRole: 'Junior Software Engineer - Core Platform',
    squad: 'Squad: Dublin Payments Ledger Ingress',
    techStack: 'TypeScript 5.4, Redis 7.2, Node.js 20 LTS, Jest, Express 4.19',
    culture: 'FinTech Resiliency, strict distributed locking, idempotency guarantees, zero-tolerance for double credits',
    managerName: 'Sarah Jenkins',
    managerRole: 'Staff Eng / Manager',
    managerHandle: 'Dublin HQ (@sjenkins)',
    managerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    timezoneLabel: 'UK Shift: 2:00 PM - 10:00 PM IST (Dublin HQ · UTC+1)',
    accentColor: '#635bff',
    logoBg: '#635bff',
    logoText: 'S|',
    defaultSubmissionType: 'code',
  },
  {
    id: 'ifs-world',
    name: 'IFS Enterprise Cloud',
    verified: true,
    track: 'Business Analysis & Agile Systems Track',
    location: 'Colombo Tech Hub · IST',
    assignedRole: 'Associate Business Analyst & Product Consultant',
    squad: 'Squad: ERP Digital Supply Chain & Requirements',
    techStack: 'Business Analysis, UML 2.5, Agile Scrum, BPMN, Jira',
    culture: 'Client-first stakeholder empathy, clear requirement traceability, structured MoSCoW prioritization and crisp user stories',
    managerName: 'Priyantha De Silva',
    managerRole: 'Lead Business Analyst & Scrum Master',
    managerHandle: 'Colombo Hub (@pdesilva)',
    managerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    timezoneLabel: 'IST Shift: 9:00 AM - 5:30 PM IST (Colombo Hub)',
    accentColor: '#8b5cf6',
    logoBg: '#8b5cf6',
    logoText: 'IFS',
    defaultSubmissionType: 'pdf_document',
  },
  {
    id: 'apex-fintech',
    name: 'Apex FinTech Core',
    verified: true,
    track: 'Quantitative Clearing & Ledger',
    location: 'London, UK · GMT',
    assignedRole: 'Associate Systems Engineer - Settlement',
    squad: 'Squad: High-Frequency Settlement Ingress',
    techStack: 'TypeScript, Node.js, PostgreSQL, Redis',
    culture: 'Fast-paced, Agile, security-obsessed, highly analytical sprint culture with strict idempotency requirements',
    managerName: 'Marcus Vance',
    managerRole: 'Staff Infrastructure Lead',
    managerHandle: 'London Core (@mvance)',
    managerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    timezoneLabel: 'UK Shift: 2:00 PM - 10:00 PM IST',
    accentColor: '#493ee5',
    logoBg: '#493ee5',
    logoText: 'AF',
    defaultSubmissionType: 'code',
  },
  {
    id: 'carecloud-health',
    name: 'CareCloud Health',
    verified: true,
    track: 'Healthcare HIPAA & Telemetry',
    location: 'Boston, MA · EST',
    assignedRole: 'Junior Clinical Systems Engineer',
    squad: 'Squad: Patient Data Pipeline Security',
    techStack: 'Python 3.11, FastAPI, Docker, PostgreSQL',
    culture: 'Strict corporate regulatory compliance, defensive programming, exhaustive audit trails and zero-tolerance for data leaks',
    managerName: 'Dr. Evelyn Reed',
    managerRole: 'Director of Healthcare Engineering',
    managerHandle: 'Boston HQ (@ereed)',
    managerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    timezoneLabel: 'US Eastern Shift: 6:30 PM - 2:30 AM IST',
    accentColor: '#0284c7',
    logoBg: '#0284c7',
    logoText: 'CC',
    defaultSubmissionType: 'code',
  },
  {
    id: 'neoscale-ai',
    name: 'NeoScale AI Labs',
    verified: true,
    track: 'Generative AI & Autonomous Agents',
    location: 'San Francisco, CA · PST',
    assignedRole: 'Full Stack AI Simulation Intern',
    squad: 'Squad: LLM Streaming & Latency',
    techStack: 'React 19, TypeScript, Next.js, Vector DB',
    culture: 'Casual, experimental hacker-house mindset, high iteration velocity, rapid prototyping and elegant user-facing design',
    managerName: 'Liam Chen',
    managerRole: 'Head of Product & AI Prototyping',
    managerHandle: 'SF HQ (@lchen)',
    managerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    timezoneLabel: 'PST Shift: 9:30 PM - 5:30 AM IST',
    accentColor: '#635bff',
    logoBg: '#635bff',
    logoText: 'NS',
    defaultSubmissionType: 'code',
  },
];

export const INITIAL_DEFAULT_TASK: GenerateTaskResponse = {
  action_type: 'generate_task_response',
  task_id: 'TASK-101',
  company_name: 'Stripe',
  task_title: 'Hardened Idempotent Webhook Ingestion Layer',
  scenario_description: 'The Dublin Core Platform team needs a hardened, idempotent webhook ingestion layer. Downstream billing retries during intermittent network drops have caused duplicate transaction credits in test accounts. Review the spec, protect the Redis lock release against zombie worker lifespans, and ensure SHA256 header validation passes our test matrix.',
  required_technology: 'TypeScript 5.4, Redis 7.2, Node.js 20 LTS, Jest, Express 4.19',
  tech_stack_or_domain: 'TypeScript 5.4, Redis 7.2, Node.js 20 LTS, Jest, Express 4.19',
  simulated_timezone_and_hours: 'UK Shift: 2:00 PM - 10:00 PM IST (Dublin HQ · UTC+1)',
  manager_instructions: 'Welcome to Sprint Cycle 4! The Dublin Core Platform team needs a hardened, idempotent webhook ingestion layer. Downstream billing retries during intermittent network drops have caused duplicate transaction credits in test accounts. Review the spec, protect the Redis lock release against zombie worker lifespans, and ensure SHA256 header validation passes our test matrix.',
  expected_deliverable: 'Specify Deliverable: Submit Code Implementation containing: 1. Distributed Redis Locking (SET NX EX with 10,000ms TTL); 2. HMAC-SHA256 Signature Verification against raw byte buffers; 3. Handle Race Conditions & Cached Replay returning 200 HTTP with stored payload; 4. Pass Edge-Case Regression Suites with zero dropped packets.',
};

export const SAMPLE_BA_PDF_REPORT = `# BUSINESS REQUIREMENTS SPECIFICATION (BRS) & WORKFLOW SPECIFICATION
Project: Enterprise Automated Order Fulfillment & Inventory Reconciliation
Author: Kasun Wickramasinghe (NIBM IT Undergraduate / Trainee Business Analyst)
Client / Org: IFS Enterprise Cloud
Date: November 2026 | Version: 1.2 (Sprint 4 Ready)

## 1. Executive Summary & Problem Statement
Currently, multi-channel procurement orders experience asynchronous stock discrepancy delays averaging 18 minutes between checkout and warehouse distribution nodes. This document defines the functional requirements, BPMN workflow, and user acceptance criteria for an automated, real-time event-driven reconciliation pipeline.

## 2. Stakeholder RACI Matrix
- Responsible (R): Lead Systems Engineer & Platform Team
- Accountable (A): Associate Product Manager & Business Analyst
- Consulted (C): Warehouse Logistics Leads & Finance Auditor
- Informed (I): Customer Support Operations & Store Managers

## 3. Scope & Requirement Traceability (MoSCoW Prioritized)
- [FR-01] [Must Have]: Real-time webhook receipt with sub-second acknowledgement.
- [FR-02] [Must Have]: Atomic stock reservation against Central ERP inventory database.
- [FR-03] [Should Have]: Replay detection guard to reject duplicate order event payloads.
- [FR-04] [Could Have]: Automated manager notification if stock threshold drops below 15 units.
- [NFR-01] Performance: The ingestion endpoint must process 99.9% of requests in < 120ms.
- [NFR-02] Compliance: Complete ISO 27001 audit logging for every credit / debit mutation.

## 4. BPMN 2.0 Activity Workflow & UML Use-Case
[Customer Checkout] -> [Order Gateway Ingress] -> {Verify HMAC & Nonce}
  -> [Check Distributed Cache for Event ID]
    - If Duplicate: Return 200 Cached Order State
    - If New: Lock SKU in Redis -> Post to Atomic Settlement Ledger -> Emit Kafka Event -> Send 200 Success.

## 5. User Acceptance Criteria (Gherkin Syntax)
Scenario: Preventing duplicate checkout deduction on client retry
  Given an order with unique transaction ID "TXN-88210" has already been processed
  When the payment gateway retries sending the webhook payload
  Then the system identifies the existing receipt without incrementing inventory debits
  And returns HTTP 200 OK with the cached settlement confirmation.`;

export const CODE_WORKSPACE_FILES = {
  webhookHandler: `import { Request, Response } from 'express';
import { redisClient } from './services/redis';
import { verifyHmacSignature } from './security/crypto';
import { ledgerQueue } from './queues/ledgerQueue';

// Stripe webhook idempotency guard with distributed Redis lock

export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  const signatureHeader = req.headers['stripe-signature'] as string;
  const rawPayload = req.body;

  // 1. Cryptographic HMAC authenticity validation
  const isValidSignature = verifyHmacSignature(rawPayload, signatureHeader, process.env.WEBHOOK_SECRET!);
  if (!isValidSignature) {
    return res.status(401).json({ error: 'INVALID_SIGNATURE_HASH' });
  }

  const eventId = rawPayload.id;
  const idempotencyKey = \`lock:stripe:evt:\${eventId}\`;

  // 2. Distributed Lock: 10-second single-flight acquisition
  const acquiredLock = await redisClient.set(idempotencyKey, 'PROCESSING', 'NX', 'PX', 10000);

  if (!acquiredLock) {
    // Replay detection: return cached receipt or 200 in-flight ack
    const cachedReceipt = await redisClient.get(\`receipt:\${eventId}\`);
    return res.status(200).json({ deduplicated: true, payload: cachedReceipt || 'IN_PROGRESS' });
  }

  // 3. Dispatch to atomic ledger queue and record idempotency completion
  await ledgerQueue.dispatch({ event: rawPayload.type, data: rawPayload.data });
  await redisClient.set(\`receipt:\${eventId}\`, 'ACCEPTED', 'EX', 86400);

  return res.status(200).json({ received: true, eventId });
}`,

  idempotencyService: `// Idempotency Distributed Lock Helper Service
import { redisClient } from './services/redis';

export async function acquireLock(key: string, ttlMs: number = 10000): Promise<boolean> {
  const res = await redisClient.set(key, 'LOCKED', 'NX', 'PX', ttlMs);
  return Boolean(res);
}

export async function releaseLock(key: string): Promise<void> {
  await redisClient.del(key);
}`,

  testSuite: `// Jest Unit Tests for Webhook Ingestion & Idempotency
describe('Stripe Webhook Idempotency Layer', () => {
  it('should verify authentic HMAC-SHA256 signature', async () => {
    expect(true).toBe(true);
  });

  it('should acquire Redis NX lock and return 200 HTTP response', async () => {
    expect(true).toBe(true);
  });

  it('should drop duplicate replay packets within 10,000ms TTL window', async () => {
    expect(true).toBe(true);
  });

  it('should persist idempotent receipt token for 24 hours', async () => {
    expect(true).toBe(true);
  });
});`,

  terminalLog: `[SimulateHub Sandbox Daemon v2.5]
Allocated: 2 vCPU / 4GB RAM · Container initialized in 184ms
Redis Cluster connected at 127.0.0.1:6379 (OK)
Ready for sprint execution.`
};

export const INITIAL_NIBM_COHORT: CompletedSimulation[] = [
  {
    id: 'SIM-NIBM-001',
    studentName: 'Kasun Wickramasinghe',
    studentId: 'NIBM-BSE-22.1-018',
    companyName: 'Stripe',
    techStack: 'TypeScript 5.4, Redis 7.2, Node.js 20',
    task: INITIAL_DEFAULT_TASK,
    submission: CODE_WORKSPACE_FILES.webhookHandler,
    submissionType: 'code',
    timeTakenMins: 75,
    evaluation: {
      action_type: 'evaluate_submission_response',
      overall_score: 94,
      technical_or_analytical_score: 96,
      technical_accuracy_score: 96,
      cultural_fit_and_communication_score: 91,
      detailed_feedback: 'What was done right:\n• Excellent usage of distributed single-flight Redis locks via SET NX PX.\n• Authentic cryptographic HMAC verification prior to any state mutations.\n• Clean status response handling.\n\nWhat needs improvement:\n• Add retry backoff wrapper around Redis connection pool drops.\n• Introduce structured OpenTelemetry span tracing for cross-service observability.',
      hr_dashboard_summary: 'The student demonstrated exemplary engineering competency on "Hardened Idempotent Webhook Ingestion Layer" within 75 minutes, exhibiting strong adherence to production code hygiene. Highly recommended for immediate industrial internship placement under standard supervisory onboarding.'
    },
    completedAt: '2026-11-02T14:40:00Z'
  },
  {
    id: 'SIM-NIBM-002',
    studentName: 'Amaya Fernando',
    studentId: 'NIBM-BSE-22.1-042',
    companyName: 'CareCloud Health',
    techStack: 'Python 3.11, FastAPI, Docker',
    task: {
      action_type: 'generate_task_response',
      task_id: 'TASK-CCH-409',
      company_name: 'CareCloud Health',
      task_title: 'HIPAA-Compliant Patient Telemetry Sanitization',
      scenario_description: 'Construct a secure data ingestion filter that redacts Personally Identifiable Information (PII) before telemetry events hit external analytical clusters.',
      required_technology: 'Python 3.11, FastAPI, Docker',
      tech_stack_or_domain: 'Python 3.11, FastAPI, Docker',
      simulated_timezone_and_hours: 'US Eastern Shift: 6:30 PM - 2:30 AM IST',
      manager_instructions: 'Attention to detail is non-negotiable. Any unmasked Social Security or Medical Record numbers will fail FDA/HIPAA compliance.',
      expected_deliverable: 'Specify Deliverable: Submit Code Implementation with FastAPI regex filter middleware, cryptographic salt masking, and audit trail logger.'
    },
    submission: `Developed a Pydantic regex validator middleware scrubbing SSN, MRN, and patient names with cryptographic salt masking before persisting to telemetry buckets.`,
    submissionType: 'code',
    timeTakenMins: 85,
    evaluation: {
      action_type: 'evaluate_submission_response',
      overall_score: 89,
      technical_or_analytical_score: 92,
      technical_accuracy_score: 92,
      cultural_fit_and_communication_score: 85,
      detailed_feedback: 'What was done right:\n• Well-crafted defensive implementation adhering to HIPAA requirements.\n• Thorough audit logging with clean code commentary.\n\nWhat needs improvement:\n• Add automated unit test assertions for malformed unicode payloads.',
      hr_dashboard_summary: 'The student demonstrated strong foundational problem-solving in Python 3.11, FastAPI, Docker and completed the task within the expected simulation window. Recommended as industry-ready for healthcare software teams.'
    },
    completedAt: '2026-11-01T16:15:00Z'
  },
  {
    id: 'SIM-NIBM-003',
    studentName: 'Dineth Perera',
    studentId: 'NIBM-MIS-22.1-007',
    companyName: 'IFS Enterprise Cloud',
    techStack: 'Business Analysis, UML, BPMN 2.0, Agile',
    task: {
      action_type: 'generate_task_response',
      task_id: 'TASK-IFS-102',
      company_name: 'IFS Enterprise Cloud',
      task_title: 'Enterprise Business Requirements Specification (BRS) & Traceability Matrix',
      scenario_description: 'Define the functional requirements, BPMN workflow, and Gherkin acceptance criteria for automated ERP stock reconciliation.',
      required_technology: 'Business Analysis, UML, BPMN 2.0, Agile',
      tech_stack_or_domain: 'Business Analysis, UML, BPMN 2.0, Agile',
      simulated_timezone_and_hours: 'IST Shift: 9:00 AM - 5:30 PM IST',
      manager_instructions: 'Clarity and requirement traceability are paramount. Ensure your functional requirements link directly to business value and identify edge cases.',
      expected_deliverable: 'Specify Deliverable: Submit a PDF Report covering Executive Summary, RACI Matrix, MoSCoW Prioritized Requirements, BPMN Diagram, and Acceptance Criteria.'
    },
    submission: SAMPLE_BA_PDF_REPORT,
    submissionType: 'pdf_document',
    timeTakenMins: 70,
    evaluation: {
      action_type: 'evaluate_submission_response',
      overall_score: 92,
      technical_or_analytical_score: 94,
      technical_accuracy_score: 94,
      cultural_fit_and_communication_score: 90,
      detailed_feedback: 'What was done right:\n• Exceptional requirement traceability and structured MoSCoW prioritization.\n• Flawless Gherkin acceptance criteria.\n• Clear executive summary with problem definition.\n\nWhat needs improvement:\n• Include explicit error fallback states in the BPMN workflow diagram.\n• Add quantifiable latency thresholds to the NFR matrix.',
      hr_dashboard_summary: 'The candidate demonstrated outstanding business analysis aptitude and structured requirements engineering for "Enterprise BRS" within 70 minutes. Highly recommended for business analyst or product consulting internship roles.'
    },
    completedAt: '2026-11-02T11:20:00Z'
  }
];
