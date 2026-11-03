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
    accentColor: '#8b5cf6',
    logoBg: '#8b5cf6',
    logoText: 'NS',
  },
];

export const INITIAL_DEFAULT_TASK: GenerateTaskResponse = {
  action_type: 'generate_task_response',
  task_id: 'TASK-101',
  company_name: 'Stripe',
  task_title: 'Hardened Idempotent Webhook Ingestion Layer',
  scenario_description: 'The Dublin Core Platform team needs a hardened, idempotent webhook ingestion layer. Downstream billing retries during intermittent network drops have caused duplicate transaction credits in test accounts. Review the spec, protect the Redis lock release against zombie worker lifespans, and ensure SHA256 header validation passes our test matrix.',
  required_technology: 'TypeScript 5.4, Redis 7.2, Node.js 20 LTS, Jest, Express 4.19',
  simulated_timezone_and_hours: 'UK Shift: 2:00 PM - 10:00 PM IST (Dublin HQ · UTC+1)',
  manager_instructions: 'Welcome to Sprint Cycle 4! The Dublin Core Platform team needs a hardened, idempotent webhook ingestion layer. Downstream billing retries during intermittent network drops have caused duplicate transaction credits in test accounts. Review the spec, protect the Redis lock release against zombie worker lifespans, and ensure SHA256 header validation passes our test matrix.',
  expected_deliverable: '1. Distributed Redis Locking (SET NX EX with 10,000ms TTL).\n2. HMAC-SHA256 Signature Verification against raw byte buffers.\n3. Handle Race Conditions & Cached Replay returning 200 HTTP with stored payload.\n4. Pass Edge-Case Regression Suites with zero dropped packets.',
};

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

  terminalLog: `[SimulateHub Sandbox Daemon v2.4]
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
    timeTakenMins: 75,
    evaluation: {
      action_type: 'evaluate_submission_response',
      overall_score: 94,
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
      simulated_timezone_and_hours: 'US Eastern Shift: 6:30 PM - 2:30 AM IST',
      manager_instructions: 'Attention to detail is non-negotiable. Any unmasked Social Security or Medical Record numbers will fail FDA/HIPAA compliance.',
      expected_deliverable: '1. FastAPI regex filter middleware. 2. Cryptographic salt masking. 3. Audit trail logger.'
    },
    submission: `Developed a Pydantic regex validator middleware scrubbing SSN, MRN, and patient names with cryptographic salt masking before persisting to telemetry buckets.`,
    timeTakenMins: 85,
    evaluation: {
      action_type: 'evaluate_submission_response',
      overall_score: 89,
      technical_accuracy_score: 92,
      cultural_fit_and_communication_score: 85,
      detailed_feedback: 'What was done right:\n• Well-crafted defensive implementation adhering to HIPAA requirements.\n• Thorough audit logging with clean code commentary.\n\nWhat needs improvement:\n• Add automated unit test assertions for malformed unicode payloads.',
      hr_dashboard_summary: 'The student demonstrated strong foundational problem-solving in Python 3.11, FastAPI, Docker and completed the task within the expected simulation window. Recommended as industry-ready for healthcare software teams.'
    },
    completedAt: '2026-11-01T16:15:00Z'
  }
];
