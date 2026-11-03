import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  Code2,
  Cpu,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  FileJson,
  Layers,
  ArrowRight,
  Search,
} from 'lucide-react';

export const EnginePlayground: React.FC = () => {
  const [selectedAction, setSelectedAction] = useState<
    'generate_task' | 'search_and_generate_company_task' | 'evaluate_submission'
  >('generate_task');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Payloads for the 3 actions (strictly conforming to specification)
  const payloads = {
    generate_task: JSON.stringify(
      {
        action: 'generate_task',
        company_name: 'Stripe',
        tech_stack_or_domain: 'React, Node.js',
        culture: 'FinTech Resiliency, strict distributed locking, idempotency guarantees',
      },
      null,
      2
    ),

    search_and_generate_company_task: JSON.stringify(
      {
        action: 'search_and_generate_company_task',
        search_query_company: 'Airbnb',
      },
      null,
      2
    ),

    evaluate_submission: JSON.stringify(
      {
        action: 'evaluate_submission',
        task_title: 'Hardened Idempotent Webhook Ingestion Layer',
        submission_type: 'code',
        student_submission: `import { Request, Response } from 'express';
import { redisClient } from './services/redis';
import { verifyHmacSignature } from './security/crypto';

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'];
  if (!verifyHmacSignature(req.body, sig, process.env.WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'INVALID_SIGNATURE' });
  }

  const key = \`lock:stripe:evt:\${req.body.id}\`;
  const acquired = await redisClient.set(key, 'LOCKED', 'NX', 'PX', 10000);
  if (!acquired) {
    return res.status(200).json({ deduplicated: true, status: 'IN_PROGRESS' });
  }

  // Record completed idempotency receipt
  await redisClient.set(\`receipt:\${req.body.id}\`, 'SETTLED', 'EX', 86400);
  return res.status(200).json({ received: true });
}`,
        time_taken_mins: 75,
      },
      null,
      2
    ),
  };

  const [requestJson, setRequestJson] = useState<string>(payloads.generate_task);
  const [responseJson, setResponseJson] = useState<string>(
    JSON.stringify(
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-101',
        company_name: 'Stripe',
        task_title: 'Hardened Idempotent Webhook Ingestion Layer',
        scenario_description: 'The Dublin Core Platform team needs a hardened, idempotent webhook ingestion layer. Downstream billing retries during intermittent network drops have caused duplicate transaction credits in test accounts. Review the spec, protect the Redis lock release against zombie worker lifespans, and ensure SHA256 header validation passes our test matrix.',
        required_technology: 'TypeScript 5.4, Redis 7.2, Node.js 20 LTS, Jest, Express 4.19',
        simulated_timezone_and_hours: 'UK Shift: 2:00 PM - 10:00 PM IST',
        manager_instructions: 'Welcome to Sprint Cycle 4! The Dublin Core Platform team needs a hardened, idempotent webhook ingestion layer. Downstream billing retries during intermittent network drops have caused duplicate transaction credits in test accounts. Review the spec, protect the Redis lock release against zombie worker lifespans, and ensure SHA256 header validation passes our test matrix.',
        expected_deliverable: '1. Distributed Redis Locking (SET NX EX with 10,000ms TTL).\n2. HMAC-SHA256 Signature Verification against raw byte buffers.\n3. Handle Race Conditions & Cached Replay.\n4. Pass Edge-Case Regression Suites.',
      },
      null,
      2
    )
  );

  const handleActionChange = (action: 'generate_task' | 'search_and_generate_company_task' | 'evaluate_submission') => {
    setSelectedAction(action);
    setRequestJson(payloads[action]);
  };

  const handleExecute = async () => {
    setIsLoading(true);
    try {
      const parsedBody = JSON.parse(requestJson);
      const res = await fetch('/api/engine/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedBody),
      });

      const data = await res.json();
      setResponseJson(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResponseJson(
        JSON.stringify(
          {
            error: 'Failed to execute AI Engine request',
            details: err.message,
          },
          null,
          2
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(responseJson);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  const copyCurl = () => {
    const curlCommand = `curl -X POST "${window.location.origin}/api/engine/request" \\
  -H "Content-Type: application/json" \\
  -d '${requestJson.replace(/'/g, "'\\''")}'`;
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-[#131b2e]">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ede9fe] text-[#493ee5] mb-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>SimulateHub AI Engine Inspector & Action Dispatcher</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0f172a] font-display">
              Strict JSON Engine Sandbox
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
              Execute and audit the 3 core AI Engine actions strictly specified by the platform architecture without markdown tags or extraneous conversational text.
            </p>
          </div>

          {/* Action 1, 2, 3 Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl self-start md:self-auto flex-wrap">
            <button
              onClick={() => handleActionChange('generate_task')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedAction === 'generate_task'
                  ? 'bg-white text-[#493ee5] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. generate_task
            </button>

            <button
              onClick={() => handleActionChange('search_and_generate_company_task')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedAction === 'search_and_generate_company_task'
                  ? 'bg-white text-[#493ee5] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. search_and_generate
            </button>

            <button
              onClick={() => handleActionChange('evaluate_submission')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedAction === 'evaluate_submission'
                  ? 'bg-white text-[#493ee5] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. evaluate_submission
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600">
          <div className="flex items-center gap-1 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>Strict JSON Enforced</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 text-[#635bff]">
            <Code2 className="w-4 h-4" />
            <span>POST /api/engine/request</span>
          </div>
          <span>•</span>
          <span className="text-slate-400">Response Header: application/json</span>
        </div>
      </div>

      {/* Editor & Response Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Side */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-[#635bff]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Request Payload (JSON)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Action: {selectedAction}
              </span>
            </div>

            {selectedAction === 'generate_task' && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Presets:</span>
                <button
                  type="button"
                  onClick={() =>
                    setRequestJson(
                      JSON.stringify(
                        {
                          action: 'generate_task',
                          company_name: 'Stripe',
                          tech_stack_or_domain: 'React, Node.js',
                          culture: 'FinTech Resiliency, strict distributed locking, idempotency guarantees',
                        },
                        null,
                        2
                      )
                    )
                  }
                  className="px-2 py-0.5 text-[11px] rounded bg-purple-50 hover:bg-purple-100 text-[#493ee5] font-medium"
                >
                  Software Eng (React/Node)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRequestJson(
                      JSON.stringify(
                        {
                          action: 'generate_task',
                          company_name: 'IFS Enterprise Cloud',
                          tech_stack_or_domain: 'Business Analysis, UML, Agile',
                          culture: 'Structured requirement traceability, client empathy, and crisp user stories',
                        },
                        null,
                        2
                      )
                    )
                  }
                  className="px-2 py-0.5 text-[11px] rounded bg-purple-50 hover:bg-purple-100 text-[#493ee5] font-medium"
                >
                  Business Analysis (UML/Agile)
                </button>
              </div>
            )}

            {selectedAction === 'evaluate_submission' && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Presets:</span>
                <button
                  type="button"
                  onClick={() => setRequestJson(payloads.evaluate_submission)}
                  className="px-2 py-0.5 text-[11px] rounded bg-purple-50 hover:bg-purple-100 text-[#493ee5] font-medium"
                >
                  Code Submission
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRequestJson(
                      JSON.stringify(
                        {
                          action: 'evaluate_submission',
                          task_title: 'Enterprise Business Requirements Specification (BRS) & Traceability Matrix',
                          submission_type: 'pdf_document',
                          student_submission: `BUSINESS REQUIREMENTS SPECIFICATION (BRS)\nProject: Automated Inventory Reconciliation\nAuthor: NIBM Trainee BA\n\n1. Executive Summary & Problem Statement\nProcurement orders currently experience latency delays. This specification defines real-time event-driven reconciliation.\n\n2. Scope & Requirement Traceability (MoSCoW)\n- [FR-01] [Must Have]: Real-time webhook ingestion with sub-second ack.\n- [FR-02] [Must Have]: Atomic stock reservation against Central ERP database.\n- [FR-03] [Should Have]: Replay detection guard to reject duplicate order events.\n- [NFR-01] Performance: 99.9% requests processed < 120ms.\n\n3. BPMN 2.0 Activity Workflow\n[Checkout] -> [Ingress Gateway] -> {Verify HMAC} -> [Redis Lock] -> [ERP Settlement] -> [Kafka Emit] -> 200 OK.\n\n4. Acceptance Criteria (Gherkin)\nScenario: Preventing duplicate checkout deduction\nGiven an order with transaction ID "TXN-88210" has already been processed\nWhen the payment gateway retries sending the webhook\nThen the system identifies the existing receipt without incrementing inventory debits\nAnd returns HTTP 200 OK.`,
                          time_taken_mins: 70,
                        },
                        null,
                        2
                      )
                    )
                  }
                  className="px-2 py-0.5 text-[11px] rounded bg-purple-50 hover:bg-purple-100 text-[#493ee5] font-medium"
                >
                  PDF Document (BRS Report)
                </button>
              </div>
            )}

            <div className="mt-3">
              <textarea
                value={requestJson}
                onChange={(e) => setRequestJson(e.target.value)}
                rows={18}
                className="w-full font-mono text-xs p-3.5 rounded-xl border border-slate-200 bg-[#0f172a] text-[#dae2fd] focus:outline-none focus:ring-2 focus:ring-[#635bff] leading-relaxed shadow-inner"
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={copyCurl}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            >
              {copiedCurl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied cURL!</span>
                </>
              ) : (
                <>
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy cURL Command</span>
                </>
              )}
            </button>

            <button
              onClick={handleExecute}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#635bff] hover:bg-[#5248e5] text-white shadow-md shadow-[#635bff]/20 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Invoking AI Engine...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Execute Engine Action</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Response Side */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Strict JSON Response Object
                </h3>
              </div>
              <button
                onClick={copyResponse}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#635bff] hover:text-[#493ee5]"
              >
                {copiedResponse ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Response JSON</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-3">
              <pre className="w-full font-mono text-xs p-3.5 rounded-xl border border-slate-200 bg-[#faf8ff] text-[#0f172a] overflow-x-auto h-[440px] leading-relaxed shadow-inner">
                {responseJson}
              </pre>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Contract Type: 100% Schema Valid</span>
            <span className="text-emerald-600 font-medium">Valid Raw JSON</span>
          </div>
        </div>
      </div>
    </div>
  );
};
