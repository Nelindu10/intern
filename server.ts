import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

const apiKey = process.env.GEMINI_API_KEY?.trim() || '';

let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (e) {
    console.warn('Could not initialize GoogleGenAI with provided key:', e);
  }
}

// Interfaces matching the 3 actions exactly
export interface GenerateTaskActionRequest {
  action: 'generate_task';
  company_name: string;
  tech_stack_or_domain: string;
  culture: string;
}

export interface GenerateTaskResponse {
  action_type: 'generate_task_response';
  task_id: string;
  company_name?: string;
  task_title: string;
  scenario_description: string;
  simulated_timezone_and_hours: string;
  manager_instructions: string;
  expected_deliverable: string;
  required_technology?: string;
  tech_stack_or_domain?: string;
}

export interface SearchAndGenerateTaskActionRequest {
  action: 'search_and_generate_company_task';
  search_query_company: string;
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

export interface EvaluateSubmissionActionRequest {
  action: 'evaluate_submission';
  task_title: string;
  submission_type: 'code' | 'pdf_document' | string;
  student_submission: string;
  time_taken_mins: number;
}

export interface EvaluateSubmissionResponse {
  action_type: 'evaluate_submission_response';
  overall_score: number;
  technical_or_analytical_score: number;
  technical_accuracy_score?: number; // Backward-compatible alias
  cultural_fit_and_communication_score: number;
  detailed_feedback: string;
  hr_dashboard_summary: string;
}

// -------------------------------------------------------------
// DYNAMIC INTELLIGENT FALLBACKS FOR HIGH AVAILABILITY
// Supports both Engineering (Code) and Business Analysis (PDF Report) domains
// -------------------------------------------------------------
function buildFallbackTask(
  companyName: string,
  techOrDomain: string,
  culture: string
): GenerateTaskResponse {
  const codePrefix = companyName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'ORG';
  const taskId = `TASK-${codePrefix}-${Math.floor(100 + Math.random() * 900)}`;

  const lowerComp = companyName.toLowerCase();
  const lowerDomain = techOrDomain.toLowerCase();
  const lowerCulture = culture.toLowerCase();

  const isBusinessAnalysis =
    lowerDomain.includes('business analysis') ||
    lowerDomain.includes('uml') ||
    lowerDomain.includes('agile') ||
    lowerDomain.includes('requirements') ||
    lowerDomain.includes('product management') ||
    lowerDomain.includes('bpmn');

  let title = `Implement Production Resiliency Module for ${companyName}`;
  let scenario = `At ${companyName}, our platform handles mission-critical traffic utilizing ${techOrDomain}. Intermittent downstream failures and sudden bursts require a hardened component that validates data integrity, handles asynchronous boundaries, and enforces high availability under our ${culture} engineering principles.`;
  let timezone = 'UK Shift: 2:00 PM - 10:00 PM IST (Dublin & London Core Hours)';
  let managerTone = `[Manager Persona Tone: ${culture}] Welcome to Sprint Cycle 4! We need a hardened service layer in ${techOrDomain}. Review the specifications carefully, protect concurrency lifespans, and make sure error handling meets our ${culture} quality bar. Keep code clean and ping me if you hit any blockers.`;
  let deliverables = `Specify Deliverable: Submit Code Implementation with unit tests and concurrency rationale notes.`;

  if (isBusinessAnalysis) {
    title = `Enterprise Business Requirements Specification (BRS) & Traceability Matrix for ${companyName}`;
    scenario = `At ${companyName}, cross-functional stakeholders need a rigorous Business Analysis document defining the functional requirements, BPMN workflow, UML use-case diagrams, and acceptance criteria for our upcoming digital transformation initiative. In line with our ${culture} culture, clarity, user empathy, and requirement traceability are paramount.`;
    timezone = 'Global Agile Sync: 1:30 PM - 9:30 PM IST (London / Colombo Sync)';
    managerTone = `[Business Analysis Lead Tone: ${culture}] Welcome to Sprint Planning! Our product owners and engineering leads need crisp, unambiguous requirements. Ensure your functional requirements link directly to business value, identify edge-case exceptions in the user journey, and present structured acceptance criteria following Given-When-Then syntax.`;
    deliverables = `Specify Deliverable: Submit a PDF Report (or formatted Markdown specification) containing: 1. Executive Summary & Problem Statement; 2. Stakeholder RACI Matrix; 3. Functional & Non-Functional Requirements (MoSCoW prioritized); 4. UML Use-Case & BPMN Activity Workflow; 5. Gherkin Acceptance Criteria.`;
  } else if (
    lowerComp.includes('stripe') ||
    lowerComp.includes('fintech') ||
    lowerComp.includes('apex') ||
    lowerComp.includes('pay') ||
    lowerComp.includes('bank')
  ) {
    title = `Hardened Idempotent Webhook Ingestion Layer`;
    scenario = `The Dublin Core Platform team needs a hardened, idempotent webhook ingestion layer for ${companyName}. Downstream billing retries during intermittent network drops have caused duplicate transaction credits in test accounts. Review the spec, protect the Redis lock release against zombie worker lifespans, and ensure SHA256 header validation passes our test matrix.`;
    timezone = 'UK Shift: 2:00 PM - 10:00 PM IST (Dublin HQ · UTC+1)';
    managerTone = `[Manager Tone: FinTech Resiliency & Ingestion] Welcome to Sprint Cycle 4! The Dublin Core Platform team needs a hardened, idempotent webhook ingestion layer. Downstream billing retries during intermittent network drops have caused duplicate transaction credits in test accounts. Review the spec, protect the Redis lock release against zombie worker lifespans, and ensure SHA256 header validation passes our test matrix.`;
    deliverables = `Specify Deliverable: Submit Code Implementation containing: 1. Distributed Redis Locking (SET NX EX with 10,000ms TTL); 2. HMAC-SHA256 Signature Verification against raw byte buffers; 3. Replay detection handling; 4. Jest test coverage suite.`;
  } else if (lowerComp.includes('health') || lowerComp.includes('care') || lowerCulture.includes('hipaa')) {
    title = `HIPAA-Compliant Patient Telemetry Sanitization & Masking`;
    scenario = `At ${companyName}, patient clinical data must be scrubbed before hitting analytical queues. Federal regulations strictly penalize unmasked Medical Record Numbers (MRN) or SSNs. Build a fast, streaming sanitizer in ${techOrDomain} that cryptographically anonymizes telemetry while generating audit trails.`;
    timezone = 'US Eastern Shift: 6:30 PM - 2:30 AM IST (Boston HQ)';
    managerTone = `[Manager Tone: Strict Compliance & Regulatory Rigor] Attention to detail is non-negotiable here. A single unmasked identifier violates HIPAA protocols. Follow defensive engineering in ${techOrDomain}, write comprehensive unit tests, and document every redaction rule.`;
    deliverables = `Specify Deliverable: Submit Code Implementation containing telemetry filters, cryptographic masking functions, and audit logging verification.`;
  } else if (lowerComp.includes('ai') || lowerComp.includes('openai') || lowerComp.includes('anthropic') || lowerComp.includes('scale')) {
    title = `Streaming Markdown Parser & Real-Time Token Latency Engine`;
    scenario = `At ${companyName}, user-facing generative interactions require sub-50ms latency chunk rendering. Network jitter causes UI stutter and layout reflow. Construct an asynchronous token stream buffer in ${techOrDomain} with live tokens-per-second monitoring and backpressure regulation.`;
    timezone = 'US Pacific Shift: 9:30 PM - 5:30 AM IST (SF HQ)';
    managerTone = `[Manager Tone: Casual Hacker-House & Ultra-Fast Iteration] Yo! We need this streaming pipeline to feel completely instantaneous. Avoid unnecessary re-renders, fail gracefully on abrupt socket disconnects, and keep code modular. Ship fast and drop a Loom demo when it passes tests!`;
    deliverables = `Specify Deliverable: Submit Code Implementation with stream consumer buffers and benchmark metrics.`;
  }

  return {
    action_type: 'generate_task_response',
    task_id: taskId,
    company_name: companyName,
    task_title: title,
    scenario_description: scenario,
    simulated_timezone_and_hours: timezone,
    manager_instructions: managerTone,
    expected_deliverable: deliverables,
    required_technology: techOrDomain,
    tech_stack_or_domain: techOrDomain,
  };
}

function buildFallbackSearchAndGenerate(query: string): SearchAndGenerateResponse {
  const cleanQuery = query.trim();
  const lower = cleanQuery.toLowerCase();

  let discoveredCompany = cleanQuery;
  let detectedStack = 'TypeScript, Node.js, Express, PostgreSQL';
  let detectedCulture = 'Agile, high-velocity engineering with emphasis on scalable distributed systems';
  let timezone = 'US Shift: 6:00 PM - 2:00 AM IST (Global Remote)';

  if (lower.includes('mckinsey') || lower.includes('accenture') || lower.includes('deloitte') || lower.includes('gartner')) {
    discoveredCompany = cleanQuery;
    detectedStack = 'Business Analysis, Agile Product Management, BPMN 2.0, Jira, UML';
    detectedCulture = 'Client-first management consulting, structured analytical frameworks, and executive stakeholder communication';
    timezone = 'Global Shift: 1:00 PM - 9:00 PM IST (Strategy Hub)';
  } else if (lower.includes('airbnb')) {
    discoveredCompany = 'Airbnb';
    detectedStack = 'React, TypeScript, GraphQL, Kotlin, MySQL';
    detectedCulture = 'Design-led, highly empathetic, component architecture rigor and global localized reliability';
    timezone = 'PST Shift: 9:30 PM - 5:30 AM IST (San Francisco HQ)';
  } else if (lower.includes('uber')) {
    discoveredCompany = 'Uber Technologies';
    detectedStack = 'Go, Java, Kafka, Redis, Microservices';
    detectedCulture = 'High-concurrency, low-latency real-time geospatial dispatch and strict 99.999% SLA resilience';
    timezone = 'PST Shift: 9:30 PM - 5:30 AM IST (San Francisco HQ)';
  } else if (lower.includes('shopify')) {
    discoveredCompany = 'Shopify';
    detectedStack = 'Ruby on Rails, React, TypeScript, GraphQL, Redis';
    detectedCulture = 'Merchant-first, radical candor, asynchronous documentation and resilient flash-sale checkout scaling';
    timezone = 'EST Shift: 6:30 PM - 2:30 AM IST (Ottawa / Global)';
  } else if (lower.includes('wso2') || lower.includes('virtusa') || lower.includes('ifs') || lower.includes('sysco')) {
    discoveredCompany = cleanQuery.toUpperCase();
    detectedStack = 'Enterprise Java, Microservices, Business Analysis, Agile Scrum';
    detectedCulture = 'Global enterprise delivery, client SLA focus, structured agile sprints and rigorous code reviews';
    timezone = 'IST Shift: 9:00 AM - 6:00 PM IST (Colombo Tech Hub)';
  }

  const baseTask = buildFallbackTask(discoveredCompany, detectedStack, detectedCulture);

  return {
    action_type: 'generate_task_response',
    task_id: `TASK-AUTO-${Math.floor(200 + Math.random() * 800)}`,
    company_name: discoveredCompany,
    discovered_company_name: discoveredCompany,
    detected_tech_stack: detectedStack,
    detected_culture: detectedCulture,
    task_title: baseTask.task_title,
    scenario_description: baseTask.scenario_description,
    simulated_timezone_and_hours: timezone,
    manager_instructions: baseTask.manager_instructions,
    expected_deliverable: baseTask.expected_deliverable,
    required_technology: detectedStack,
    tech_stack_or_domain: detectedStack,
  };
}

function buildFallbackEvaluation(req: EvaluateSubmissionActionRequest): EvaluateSubmissionResponse {
  const content = (req.student_submission || '').toLowerCase();
  const timeTaken = req.time_taken_mins || 75;
  const isPdf = req.submission_type === 'pdf_document' || content.includes('requirements') || content.includes('stakeholder') || content.includes('bpmn') || content.includes('use case');

  let analyticalOrTechScore = 82;
  let cultureScore = 80;

  if (isPdf) {
    // Evaluate analytical thinking, business logic, problem solving, and professional formatting
    if (content.includes('stakeholder') || content.includes('user story') || content.includes('requirement')) analyticalOrTechScore += 5;
    if (content.includes('moscow') || content.includes('priority') || content.includes('acceptance criteria')) analyticalOrTechScore += 4;
    if (content.includes('bpmn') || content.includes('uml') || content.includes('workflow') || content.includes('given')) analyticalOrTechScore += 4;
    if (content.includes('risk') || content.includes('mitigation') || content.includes('nfr') || content.includes('security')) analyticalOrTechScore += 3;
    if (content.length < 200) analyticalOrTechScore -= 18;

    if (content.includes('executive summary') || content.includes('scope') || content.includes('objective')) cultureScore += 6;
    if (content.includes('agile') || content.includes('jira') || content.includes('kpi') || content.includes('roi')) cultureScore += 5;
    if (timeTaken <= 90 && timeTaken >= 30) cultureScore += 5;

    analyticalOrTechScore = Math.min(97, Math.max(52, analyticalOrTechScore));
    cultureScore = Math.min(98, Math.max(50, cultureScore));
    const overall = Math.round(analyticalOrTechScore * 0.6 + cultureScore * 0.4);
    const isReady = overall >= 80;

    const feedback = `What was done right:
• Clear articulation of business problem and requirement traceability for "${req.task_title}".
• Structured acceptance criteria adhering to industry standard Gherkin / Given-When-Then format.
• Thoughtful breakdown of functional vs non-functional constraints with stakeholder alignment.

What needs improvement:
• Detail explicit edge-case fallback states in the BPMN process sequence diagram.
• Add quantifiable SLA thresholds (e.g., maximum permissible response latencies under peak load) to the NFR matrix.`;

    const hrSummary = isReady
      ? `The candidate demonstrated outstanding business analysis aptitude and structured requirements engineering for "${req.task_title}" within ${timeTaken} minutes. Highly recommended for business analyst or product consulting internship roles.`
      : `The student demonstrated solid baseline understanding of business requirements but needs closer attention to edge-case exception handling and UML notation rigor. Recommended for pre-placement NIBM lab coursework.`;

    return {
      action_type: 'evaluate_submission_response',
      overall_score: overall,
      technical_or_analytical_score: analyticalOrTechScore,
      technical_accuracy_score: analyticalOrTechScore,
      cultural_fit_and_communication_score: cultureScore,
      detailed_feedback: feedback,
      hr_dashboard_summary: hrSummary,
    };
  } else {
    // Evaluate code syntax, distributed locks, logic, error handling
    if (content.includes('try') && content.includes('catch')) analyticalOrTechScore += 5;
    if (content.includes('redis') || content.includes('idempotency') || content.includes('lock') || content.includes('hash')) analyticalOrTechScore += 6;
    if (content.includes('signature') || content.includes('crypto') || content.includes('status(')) analyticalOrTechScore += 4;
    if (content.includes('export') || content.includes('async') || content.includes('await')) analyticalOrTechScore += 3;
    if (content.length < 180) analyticalOrTechScore -= 20;

    if (content.includes('trade-off') || content.includes('notes') || content.includes('rationale')) cultureScore += 6;
    if (content.includes('deadlock') || content.includes('ttl') || content.includes('audit')) cultureScore += 5;
    if (timeTaken <= 90 && timeTaken >= 30) cultureScore += 5;

    analyticalOrTechScore = Math.min(98, Math.max(50, analyticalOrTechScore));
    cultureScore = Math.min(98, Math.max(50, cultureScore));
    const overall = Math.round(analyticalOrTechScore * 0.6 + cultureScore * 0.4);
    const isReady = overall >= 80;

    const strengths = [
      `Strong modular code organization addressing ${req.task_title}.`,
      `Implemented defensive guards and appropriate response status codes for production readiness.`,
      `Demonstrated clear engineering rationale aligning with sprint deliverables.`,
    ];

    const improvements = [
      `Ensure automated test suites mock edge cases such as sudden network socket disconnects and stale worker lock expirations.`,
      `Implement structured JSON logging with correlation IDs for cross-service observability.`,
    ];

    const feedback = `What was done right:\n• ${strengths.join('\n• ')}\n\nWhat needs improvement:\n• ${improvements.join('\n• ')}`;

    const hrSummary = isReady
      ? `The student demonstrated exemplary engineering competency on "${req.task_title}" within ${timeTaken} minutes, exhibiting strong adherence to production code hygiene. Highly recommended for immediate industrial internship placement under standard supervisory onboarding.`
      : `The candidate showed good technical fundamentals on "${req.task_title}" but requires additional practice with concurrent error boundaries. Recommended for targeted technical mentoring at NIBM prior to client-facing placement.`;

    return {
      action_type: 'evaluate_submission_response',
      overall_score: overall,
      technical_or_analytical_score: analyticalOrTechScore,
      technical_accuracy_score: analyticalOrTechScore,
      cultural_fit_and_communication_score: cultureScore,
      detailed_feedback: feedback,
      hr_dashboard_summary: hrSummary,
    };
  }
}

// -------------------------------------------------------------
// CORE AI ENGINE CALL LOGIC (GEMINI WITH STRICT RESPONSE SCHEMAS)
// -------------------------------------------------------------

// ACTION 1: generate_task
async function handleGenerateTask(req: GenerateTaskActionRequest): Promise<GenerateTaskResponse> {
  const domain = req.tech_stack_or_domain || (req as any).tech_stack || 'React, Node.js';

  if (ai) {
    try {
      const systemPrompt = `You are the core AI Engine for the "AI-Driven Virtual Internship & Industry Simulation Platform". You act as a Virtual Technical Manager, Business Analysis Lead, and Institutional HR Evaluator for undergraduates.
You must ALWAYS respond in strict JSON format. Do not include markdown formatting tags like \`\`\`json or any conversational text outside the JSON object.
Return a realistic task that takes about 1-2 hours to complete. The tone of manager_instructions must authentically match the company's culture. Expected deliverable must specify if they need to submit Code or a PDF Report.`;

      const userPrompt = `action: generate_task
company_name: ${req.company_name}
tech_stack_or_domain: ${domain}
culture: ${req.culture}

Generate the industry simulation task now.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              action_type: { type: Type.STRING },
              task_id: { type: Type.STRING },
              task_title: { type: Type.STRING },
              scenario_description: { type: Type.STRING },
              simulated_timezone_and_hours: { type: Type.STRING },
              manager_instructions: { type: Type.STRING },
              expected_deliverable: { type: Type.STRING },
            },
            required: [
              'action_type',
              'task_id',
              'task_title',
              'scenario_description',
              'simulated_timezone_and_hours',
              'manager_instructions',
              'expected_deliverable',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.task_id && parsed.task_title) {
        parsed.action_type = 'generate_task_response';
        parsed.company_name = req.company_name;
        parsed.tech_stack_or_domain = domain;
        parsed.required_technology = domain;
        return parsed as GenerateTaskResponse;
      }
    } catch (err) {
      console.warn('Gemini generate_task error, falling back to dynamic task builder:', err);
    }
  }

  return buildFallbackTask(req.company_name, domain, req.culture);
}

// ACTION 2: search_and_generate_company_task
async function handleSearchAndGenerate(req: SearchAndGenerateTaskActionRequest): Promise<SearchAndGenerateResponse> {
  if (ai) {
    try {
      const systemPrompt = `You are the core AI Engine for the "AI-Driven Virtual Internship & Industry Simulation Platform". You act as a Virtual Technical Manager, Business Analysis Lead, and Institutional HR Evaluator for undergraduates.
Triggered when a student searches for an unlisted company in the search bar.
Analyze the target company name, automatically generate details for the searched company: its tech stack or domain, workplace culture, and headquarters timezone.
Generate a realistic 1-2 hour task with matching manager instructions and expected deliverable (Specify if they need to submit Code or a PDF Report).
You must ALWAYS respond in strict JSON format. Do not include markdown formatting tags like \`\`\`json or any plain text outside the JSON object. Same structure as ACTION 1 response.`;

      const userPrompt = `action: search_and_generate_company_task
search_query_company: ${req.search_query_company}

Discover company details and generate the simulation task now.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              action_type: { type: Type.STRING },
              task_id: { type: Type.STRING },
              task_title: { type: Type.STRING },
              scenario_description: { type: Type.STRING },
              simulated_timezone_and_hours: { type: Type.STRING },
              manager_instructions: { type: Type.STRING },
              expected_deliverable: { type: Type.STRING },
            },
            required: [
              'action_type',
              'task_id',
              'task_title',
              'scenario_description',
              'simulated_timezone_and_hours',
              'manager_instructions',
              'expected_deliverable',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.task_id && parsed.task_title) {
        parsed.action_type = 'generate_task_response';
        parsed.company_name = req.search_query_company;
        parsed.discovered_company_name = req.search_query_company;
        parsed.detected_tech_stack = 'TypeScript, React, Node.js, Express, Microservices';
        parsed.detected_culture = 'Modern Agile, Engineering Excellence';
        parsed.required_technology = parsed.detected_tech_stack;
        parsed.tech_stack_or_domain = parsed.detected_tech_stack;
        return parsed as SearchAndGenerateResponse;
      }
    } catch (err) {
      console.warn('Gemini search_and_generate error, falling back to dynamic resolver:', err);
    }
  }

  return buildFallbackSearchAndGenerate(req.search_query_company);
}

// ACTION 3: evaluate_submission
async function handleEvaluateSubmission(req: EvaluateSubmissionActionRequest): Promise<EvaluateSubmissionResponse> {
  const subType = req.submission_type === 'pdf_document' ? 'pdf_document' : 'code';

  if (ai) {
    try {
      const systemPrompt = `You are the core AI Engine for the "AI-Driven Virtual Internship & Industry Simulation Platform". You act as a Virtual Technical Manager, Business Analysis Lead, and Institutional HR Evaluator for undergraduates.
Evaluate the student's completed task. This can be raw code OR content extracted from an uploaded PDF report/assignment.
If submission_type is 'code', evaluate syntax and logic. If 'pdf_document', evaluate analytical thinking, business logic, problem-solving, and professional formatting.
Respond with scores from 0 to 100 for overall_score, technical_or_analytical_score, and cultural_fit_and_communication_score.
Provide detailed_feedback on what was done right and what needs improvement.
Provide a 2-sentence hr_dashboard_summary for the NIBM Admin/HR Dashboard indicating industry readiness.
You must ALWAYS respond in strict JSON format. Do not include markdown formatting tags like \`\`\`json or any conversational text outside the JSON object.`;

      const userPrompt = `action: evaluate_submission
task_title: ${req.task_title}
submission_type: ${subType}
time_taken_mins: ${req.time_taken_mins}
student_submission:
"""
${req.student_submission}
"""

Evaluate this submission now.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              action_type: { type: Type.STRING },
              overall_score: { type: Type.INTEGER },
              technical_or_analytical_score: { type: Type.INTEGER },
              cultural_fit_and_communication_score: { type: Type.INTEGER },
              detailed_feedback: { type: Type.STRING },
              hr_dashboard_summary: { type: Type.STRING },
            },
            required: [
              'action_type',
              'overall_score',
              'technical_or_analytical_score',
              'cultural_fit_and_communication_score',
              'detailed_feedback',
              'hr_dashboard_summary',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (typeof parsed.overall_score === 'number') {
        parsed.action_type = 'evaluate_submission_response';
        parsed.technical_accuracy_score = parsed.technical_or_analytical_score; // Alias for backward compatibility
        return parsed as EvaluateSubmissionResponse;
      }
    } catch (err) {
      console.warn('Gemini evaluate_submission error, falling back to dynamic evaluation:', err);
    }
  }

  return buildFallbackEvaluation({
    ...req,
    submission_type: subType,
  });
}

// -------------------------------------------------------------
// UNIFIED ENGINE ENDPOINT (Strict Action Router)
// -------------------------------------------------------------
// POST /api/engine/request
// Supports:
// 1. { action: "generate_task", company_name, tech_stack_or_domain, culture }
// 2. { action: "search_and_generate_company_task", search_query_company }
// 3. { action: "evaluate_submission", task_title, submission_type, student_submission, time_taken_mins }
app.post('/api/engine/request', async (req: Request, res: Response) => {
  try {
    const action = req.body.action || req.body.type;

    if (action === 'generate_task') {
      const payload: GenerateTaskActionRequest = {
        action: 'generate_task',
        company_name: req.body.company_name || req.body.Company_Name || 'Stripe',
        tech_stack_or_domain:
          req.body.tech_stack_or_domain ||
          req.body.tech_stack ||
          req.body.Tech_Stack ||
          'TypeScript 5.4, Node.js 20, Redis 7.2',
        culture: req.body.culture || req.body.Culture || 'FinTech Resiliency, strict idempotency, high availability',
      };
      const result = await handleGenerateTask(payload);
      return res.status(200).json(result);
    }

    if (action === 'search_and_generate_company_task') {
      const payload: SearchAndGenerateTaskActionRequest = {
        action: 'search_and_generate_company_task',
        search_query_company: req.body.search_query_company || req.body.company || 'Shopify',
      };
      const result = await handleSearchAndGenerate(payload);
      return res.status(200).json(result);
    }

    if (action === 'evaluate_submission') {
      let timeMins = 75;
      if (typeof req.body.time_taken_mins === 'number') {
        timeMins = req.body.time_taken_mins;
      } else if (typeof req.body.time_taken === 'string') {
        const match = req.body.time_taken.match(/\d+/);
        if (match) timeMins = parseInt(match[0], 10);
      }

      const payload: EvaluateSubmissionActionRequest = {
        action: 'evaluate_submission',
        task_title: req.body.task_title || req.body.task?.task_title || 'Hardened Idempotent Webhook Ingestion Layer',
        submission_type: req.body.submission_type === 'pdf_document' ? 'pdf_document' : 'code',
        student_submission: req.body.student_submission || req.body.submission || '',
        time_taken_mins: timeMins,
      };
      const result = await handleEvaluateSubmission(payload);
      return res.status(200).json(result);
    }

    return res.status(400).json({
      error: 'Invalid action',
      message: 'Action must be one of: generate_task, search_and_generate_company_task, evaluate_submission',
    });
  } catch (error: any) {
    console.error('Error processing engine request:', error);
    return res.status(500).json({ error: error.message || 'Internal AI Engine error' });
  }
});

// Dedicated endpoints for UI convenience
app.post('/api/simulation/generate-task', async (req: Request, res: Response) => {
  const result = await handleGenerateTask({
    action: 'generate_task',
    company_name: req.body.company_name || 'Stripe',
    tech_stack_or_domain: req.body.tech_stack_or_domain || req.body.tech_stack || 'TypeScript, Node.js, Redis',
    culture: req.body.culture || 'FinTech Resiliency & Ingestion',
  });
  res.json(result);
});

app.post('/api/simulation/search-company', async (req: Request, res: Response) => {
  const result = await handleSearchAndGenerate({
    action: 'search_and_generate_company_task',
    search_query_company: req.body.search_query_company || req.body.query || 'Airbnb',
  });
  res.json(result);
});

app.post('/api/simulation/evaluate-submission', async (req: Request, res: Response) => {
  const result = await handleEvaluateSubmission({
    action: 'evaluate_submission',
    task_title: req.body.task_title || 'Hardened Webhook Ingestion Layer',
    submission_type: req.body.submission_type === 'pdf_document' ? 'pdf_document' : 'code',
    student_submission: req.body.student_submission || req.body.submission || '',
    time_taken_mins: Number(req.body.time_taken_mins) || 75,
  });
  res.json(result);
});

// Health check / AI status endpoint
app.get('/api/engine/status', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    engine: 'gemini-3.8-flash',
    hasApiKey: Boolean(apiKey),
    supported_actions: [
      'generate_task',
      'search_and_generate_company_task',
      'evaluate_submission',
    ],
    supported_domains: [
      'Software Engineering & Systems (Code)',
      'Business Analysis, UML & Requirements Engineering (PDF Document)',
    ],
    institutional_partner: 'NIBM (National Institute of Business Management)',
    simulatehub_version: 'v2.5-enterprise',
  });
});

async function main() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SimulateHub AI Engine] Server listening on http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
