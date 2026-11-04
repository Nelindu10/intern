import { CompanyPreset, CompletedSimulation, GenerateTaskResponse, TaskDeliverable } from '../types';

export const COMPANY_PRESETS: CompanyPreset[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    verified: true,
    track: 'FinTech Revenue & Enterprise Billing Operations',
    location: 'Dublin HQ · UTC+1',
    assignedRole: 'Associate Business Systems Analyst · Revenue Automation',
    squad: 'Squad: Enterprise Billing & Dispute Operations',
    techStack: 'Stripe Billing Engine, Salesforce CRM, Jira Service Management, Lucidchart, Snowflake SQL',
    enterpriseSoftwareTools: ['Stripe Billing Engine', 'Salesforce CRM', 'Jira Service Management', 'Lucidchart', 'Snowflake SQL'],
    culture: 'Extreme user focus, rigorous financial accuracy, rapid experimentation, and structured asynchronous documentation',
    managerName: 'Sarah Jenkins',
    managerRole: 'Senior Product & Business Systems Lead',
    managerHandle: 'Dublin HQ (@sjenkins)',
    managerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    timezoneLabel: 'UK Shift: 2:00 PM - 10:00 PM IST (Dublin HQ · UTC+1)',
    accentColor: '#635bff',
    logoBg: '#635bff',
    logoText: 'S|',
    defaultSubmissionType: 'pdf_document',
    onboardingBriefing:
      'Welcome to Sprint Cycle 4 at Stripe! Our Dublin Enterprise Invoicing team is modernizing the multi-currency recurring subscription workflow for EMEA corporate clients. Disputed recurring charges and automated retry invoices currently trigger manual customer service interventions and revenue leakage. We need a comprehensive Business Requirements Specification (BRS), stakeholder traceability matrix, and automated dunning workflow using Stripe Billing and Salesforce CRM integration.',
    tasks: [
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-STR-101',
        company_name: 'Stripe',
        task_title: 'Enterprise Multi-Currency Subscription Invoicing & Dunning Automation',
        scenario_description:
          'Stripe EMEA enterprise merchants experience friction handling automated retries and multi-currency dunning schedules when international payments fail. Design an end-to-end dunning automation workflow that classifies decline codes (soft vs hard decline), defines customer notification touchpoints, and maps bi-directional data flow between Stripe Billing and Salesforce CRM.',
        required_technology: 'Stripe Billing Engine, Salesforce CRM, Jira, Lucidchart, Snowflake SQL',
        tech_stack_or_domain: 'Revenue Operations, BRS Documentation, Dunning Workflows, CRM Integration',
        simulated_timezone_and_hours: 'UK Shift: 2:00 PM - 10:00 PM IST (Dublin HQ · UTC+1)',
        manager_instructions:
          'Welcome to Sprint Cycle 4 at Stripe! Our Dublin Enterprise Invoicing team is modernizing the multi-currency recurring subscription workflow for EMEA corporate clients. Disputed recurring charges and automated retry invoices currently trigger manual customer service interventions and revenue leakage. We need a comprehensive Business Requirements Specification (BRS), stakeholder traceability matrix, and automated dunning workflow using Stripe Billing and Salesforce CRM integration.',
        expected_deliverable:
          'Submit an Assignment Report / BRS covering: 1. Executive Summary & Problem Scope; 2. Stakeholder RACI Matrix; 3. Functional Requirements for Multi-Currency Dunning Automation; 4. Process Workflow (BPMN / Swimlane); 5. Given-When-Then Acceptance Criteria.',
      },
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-STR-102',
        company_name: 'Stripe',
        task_title: 'Merchant Dispute Resolution & Automated Chargeback Evidence Pipeline',
        scenario_description:
          'Analyze the dispute management workflow where chargebacks from global issuing banks require timely merchant evidence submission. Map the end-to-end evidence collection lifecycle using Stripe Radar and Zendesk Enterprise, define SLA thresholds for evidence submission, and formalize functional requirements to cut dispute losses by 25%.',
        required_technology: 'Stripe Radar, Zendesk Enterprise, Confluence, Snowflake SQL, Lucidchart',
        tech_stack_or_domain: 'Dispute Operations, Risk Management, Workflow Automation, Process Mapping',
        simulated_timezone_and_hours: 'UK Shift: 2:00 PM - 10:00 PM IST (Dublin HQ · UTC+1)',
        manager_instructions:
          'Merchant trust depends on rapid dispute recovery. We need an airtight operational workflow for chargeback evidence synthesis. Document all edge cases where merchants miss the 7-day evidence submission window and propose automated evidence compilation rules.',
        expected_deliverable:
          'Submit a Process & Requirements Document containing: 1. Dispute Lifecycle Swimlane Diagram; 2. Evidence Gathering Functional Requirements; 3. Exception Escalation Matrix; 4. Measurable KPI Impact Model.',
      },
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-STR-103',
        company_name: 'Stripe',
        task_title: 'Corporate Expense Card Reconciliation & NetSuite ERP Integration',
        scenario_description:
          'Corporate partners issuing employee spending cards with Stripe Treasury require real-time transaction reconciliation into NetSuite ERP. Define the accounting data dictionary, categorize corporate spending rules, and specify automated receipt matching logic for finance controllers.',
        required_technology: 'Stripe Treasury, NetSuite ERP, Microsoft Excel, Snowflake, Confluence',
        tech_stack_or_domain: 'Financial Accounting Systems, ERP Integration, Audit Compliance',
        simulated_timezone_and_hours: 'UK Shift: 2:00 PM - 10:00 PM IST (Dublin HQ · UTC+1)',
        manager_instructions:
          'Finance teams waste hundreds of hours manually matching receipts to card charges. Structure the functional integration specification between Stripe Treasury and NetSuite with strict audit compliance trails.',
        expected_deliverable:
          'Submit a Technical Business Specification covering: 1. Chart of Accounts Mapping; 2. Automated Receipt Matching Logic; 3. Month-End Close Reconciliation Rules; 4. Regulatory Audit Trail Requirements.',
      },
    ],
    advancedTasks: [
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-STR-201',
        company_name: 'Stripe',
        task_title: 'Milestone 4: Autonomous Cross-Border Settlement & Real-Time AML Protocol',
        scenario_description:
          'Stripe is expanding multi-currency settlement to Southeast Asian and LATAM corridors. Enterprise accounts require sub-second cross-border liquidity rebalancing, automated foreign exchange rate hedging, and real-time Anti-Money Laundering (AML) sanctions screening before settlement release.',
        required_technology: 'Stripe Global Treasury, Apache Kafka, Snowflake SQL, SWIFT gpi, Lucidchart',
        tech_stack_or_domain: 'Global Settlement Architecture, AML Sanctions Screening, FX Hedging, Enterprise BRS',
        simulated_timezone_and_hours: 'UK Shift: 2:00 PM - 10:00 PM IST (Dublin HQ · UTC+1)',
        manager_instructions:
          'Congratulations on advancing to Milestone 4! As a Senior BA, you must architect the end-to-end autonomous settlement and AML screening flow. Formulate the exception routing matrix when currency corridors experience liquidity freezes.',
        expected_deliverable:
          'Submit a Senior BA Deliverable covering: 1. Autonomous Settlement State Transition Diagram; 2. AML Real-Time Sanctions Screening Decision Table; 3. Multi-Corridor FX Slippage Guardrails; 4. Given-When-Then Acceptance Criteria.',
      },
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-STR-202',
        company_name: 'Stripe',
        task_title: 'Milestone 4: Multi-Tenant Enterprise Ledger Scaling & High-Availability BRS',
        scenario_description:
          'Design the functional specifications for Stripe Enterprise Ledger partitioning across multi-region cloud nodes during Black Friday and Cyber Monday peak transaction surges, guaranteeing zero financial ledger desynchronization.',
        required_technology: 'Stripe Core Ledger, PostgreSQL Partitioning, Redis Enterprise, Datadog, Confluence',
        tech_stack_or_domain: 'High-Volume Ledger Accounting, Fault Tolerance, Multi-Region Ingestion',
        simulated_timezone_and_hours: 'UK Shift: 2:00 PM - 10:00 PM IST (Dublin HQ · UTC+1)',
        manager_instructions:
          'Ledger integrity during peak bursts is non-negotiable. Specify the data reconciliation protocols between synchronous card authorizations and asynchronous merchant payout settlements.',
        expected_deliverable:
          'Submit an Enterprise Architecture BRS covering: 1. Ledger Partitioning Strategy; 2. High-Availability Failover Matrix; 3. Data Integrity Audit Trail; 4. Acceptance Criteria.',
      },
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-STR-203',
        company_name: 'Stripe',
        task_title: 'Milestone 4: Global Tax Compliance Automation & Embedded FinTech API Gateway',
        scenario_description:
          'Enterprise platform merchants issuing SaaS subscriptions across 60+ countries must calculate VAT, GST, and US Sales Tax dynamically at checkout while generating localized fiscal invoices.',
        required_technology: 'Stripe Tax, Avalara AvaTax, GraphQL, Jira Service Management, Postman',
        tech_stack_or_domain: 'International Tax Compliance, Embedded Finance, API Gateway Specifications',
        simulated_timezone_and_hours: 'UK Shift: 2:00 PM - 10:00 PM IST (Dublin HQ · UTC+1)',
        manager_instructions:
          'Tax rules differ across municipal boundaries. Formulate the functional data schema for dynamic address validation, tax nexus calculation, and automated invoice PDF generation.',
        expected_deliverable:
          'Submit a Regulatory Tax Specification covering: 1. Dynamic Tax Calculation API Data Contract; 2. Global Tax Jurisdiction Lookup Rules; 3. Invoicing Compliance Matrix; 4. User Acceptance Criteria.',
      },
    ],
  },
  {
    id: 'carecloud-health',
    name: 'CareCloud Health',
    verified: true,
    track: 'Healthcare IT, Clinical Systems & HIPAA Compliance',
    location: 'Boston, MA · EST',
    assignedRole: 'Clinical Systems & Healthcare Business Analyst',
    squad: 'Squad: Patient Onboarding & EHR Interoperability',
    techStack: 'Epic EHR, CareCloud Practice Management, HL7 / FHIR Standards, Confluence, Microsoft Visio',
    enterpriseSoftwareTools: ['Epic EHR', 'CareCloud Practice Management', 'HL7 / FHIR Standards', 'Confluence', 'Microsoft Visio'],
    culture: 'Patient safety first, uncompromising HIPAA privacy, empathetic clinical design, and rigorous regulatory compliance',
    managerName: 'Dr. Evelyn Reed',
    managerRole: 'Director of Healthcare Operations & Systems',
    managerHandle: 'Boston HQ (@ereed)',
    managerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    timezoneLabel: 'US Eastern Shift: 6:30 PM - 2:30 AM IST (Boston HQ)',
    accentColor: '#0284c7',
    logoBg: '#0284c7',
    logoText: 'CC',
    defaultSubmissionType: 'pdf_document',
    onboardingBriefing:
      'Welcome to CareCloud Health! Our clinical operations team is standardizing digital patient intake and HIPAA-compliant insurance pre-authorization workflows across 40 ambulatory care clinics. Asynchronous intake delays cause patient check-in bottlenecks and insurance claim rejections. We need you to map the end-to-end patient onboarding journey, document functional data flows between mobile intake and Epic EHR via FHIR APIs, and define exception handling protocols.',
    tasks: [
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-CCH-201',
        company_name: 'CareCloud Health',
        task_title: 'HIPAA-Compliant Digital Patient Intake & Epic EHR Interoperability',
        scenario_description:
          'Ambulatory clinics require a digitized check-in system where patients submit medical history, insurance cards, and consent forms prior to appointments. Formulate a Business Requirements Specification (BRS) ensuring bidirectional demographic and insurance data synchronization with Epic EHR using HL7/FHIR protocols while upholding strict HIPAA privacy standards.',
        required_technology: 'Epic EHR, CareCloud Practice Management, HL7 / FHIR Standards, Confluence, Microsoft Visio',
        tech_stack_or_domain: 'Healthcare Information Systems, Clinical Workflow Analysis, HIPAA Compliance',
        simulated_timezone_and_hours: 'US Eastern Shift: 6:30 PM - 2:30 AM IST (Boston HQ)',
        manager_instructions:
          'Patient data confidentiality is paramount under federal HIPAA regulations. Your intake workflow must ensure zero unmasked PHI leaks while reducing patient lobby wait times from 18 minutes to under 4 minutes. Structure complete functional requirements and user journey diagrams.',
        expected_deliverable:
          'Submit a Healthcare BRS Deliverable containing: 1. Clinical Workflow Diagram; 2. FHIR Resource Data Mapping (Patient, Coverage, Consent); 3. HIPAA Access Control Matrix; 4. Gherkin Acceptance Criteria for intake validation.',
      },
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-CCH-202',
        company_name: 'CareCloud Health',
        task_title: 'Automated Insurance Pre-Authorization & Claims Rejection Handling',
        scenario_description:
          'Medical practices suffer significant claim delays due to missing insurance prior-authorization numbers. Analyze the clinical ordering workflow, design automated eligibility verification checks with Availity Clearinghouse, and write functional requirements for front-desk rejection alerting.',
        required_technology: 'CareCloud Billing, Availity Clearinghouse, Confluence, Jira, Microsoft Excel',
        tech_stack_or_domain: 'Revenue Cycle Management, Insurance Pre-Authorization, Clinical Business Rules',
        simulated_timezone_and_hours: 'US Eastern Shift: 6:30 PM - 2:30 AM IST (Boston HQ)',
        manager_instructions:
          'Claim denials create financial strain on rural clinics. Model the automated pre-auth approval hierarchy, specify business rules for immediate real-time clearinghouse validation, and define staff notification triggers.',
        expected_deliverable:
          'Submit a Process Specification containing: 1. Insurance Clearinghouse Interaction Map; 2. Pre-Authorization Business Rules Table; 3. Exception Escalation Playbook; 4. Key Performance Indicator (KPI) Dashboard Spec.',
      },
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-CCH-203',
        company_name: 'CareCloud Health',
        task_title: 'Telehealth Appointment Scheduling & Clinical Triage Workflow',
        scenario_description:
          'Develop functional requirements for a virtual telehealth consult scheduling system. Incorporate nurse triage questionnaires, automated appointment confirmation SMS/email sequences, and provider schedule load-balancing across multi-specialty practices.',
        required_technology: 'CareCloud Telehealth, Twilio Healthcare, Jira Service Management, Tableau',
        tech_stack_or_domain: 'Virtual Care Delivery, Triage Logic, Schedule Optimization, Healthcare Operations',
        simulated_timezone_and_hours: 'US Eastern Shift: 6:30 PM - 2:30 AM IST (Boston HQ)',
        manager_instructions:
          'Patients need a seamless booking experience that automatically triages urgent symptoms to immediate on-call doctors. Detail the screening questionnaire decision tree and clinical provider availability matrix.',
        expected_deliverable:
          'Submit a Clinical Systems Specification covering: 1. Patient Triage Decision Tree; 2. Provider Booking Capacity Rules; 3. Automated Reminder Communication Matrix; 4. Acceptance Criteria.',
      },
    ],
    advancedTasks: [
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-CCH-301',
        company_name: 'CareCloud Health',
        task_title: 'Milestone 4: Real-Time ICU Telemetry Interoperability & Medical Device Gateway',
        scenario_description:
          'Hospital intensive care units require bi-directional telemetry data ingestion from bedside patient monitors into Epic EHR and CareCloud PM with sub-second vital alert thresholds and HIPAA encryption.',
        required_technology: 'Epic EHR, HL7 FHIR v4, MQTT IoT Gateway, Confluence, Microsoft Visio',
        tech_stack_or_domain: 'Clinical Device Integration, Real-Time Telemetry, Patient Monitoring Architecture',
        simulated_timezone_and_hours: 'US Eastern Shift: 6:30 PM - 2:30 AM IST (Boston HQ)',
        manager_instructions:
          'Milestone 4 elevates your role to Lead Healthcare Systems Analyst. Define the vital threshold alerting hierarchy, medical device security handshake, and clinical staff notification protocols.',
        expected_deliverable:
          'Submit a Clinical Telemetry Specification covering: 1. Device Ingestion Architecture Diagram; 2. Vital Threshold Alerting Decision Tree; 3. HIPAA Encryption & Audit Schema; 4. Gherkin Acceptance Criteria.',
      },
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-CCH-302',
        company_name: 'CareCloud Health',
        task_title: 'Milestone 4: Enterprise Clinical Decision Support (CDS) Rule Engine Architecture',
        scenario_description:
          'Model automated clinical decision support rules that alert attending physicians of adverse drug-drug interactions and patient allergy contraindications during electronic prescription creation.',
        required_technology: 'Epic Willow, CareCloud CDS Engine, SNOMED CT, RxNorm, Confluence',
        tech_stack_or_domain: 'Clinical Decision Support, Drug Interaction Logic, Electronic Prescribing',
        simulated_timezone_and_hours: 'US Eastern Shift: 6:30 PM - 2:30 AM IST (Boston HQ)',
        manager_instructions:
          'Drug safety warnings must be timely without causing alert fatigue. Document the alert severity grading matrix and mandatory physician override justification workflows.',
        expected_deliverable:
          'Submit a CDS Systems Specification covering: 1. RxNorm Interaction Decision Logic; 2. Alert Severity Classification Table; 3. Physician Override Audit Log; 4. Acceptance Criteria.',
      },
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-CCH-303',
        company_name: 'CareCloud Health',
        task_title: 'Milestone 4: Cross-State Provider Credentialing & Multi-Hospital System Directory',
        scenario_description:
          'Manage multi-state clinician licensing, board certifications, and DEA registrations across integrated healthcare networks with automated primary source verification.',
        required_technology: 'CareCloud Provider Directory, CAQH ProView, Jira Agile, Microsoft Excel',
        tech_stack_or_domain: 'Provider Credentialing, Healthcare Compliance, Master Data Management',
        simulated_timezone_and_hours: 'US Eastern Shift: 6:30 PM - 2:30 AM IST (Boston HQ)',
        manager_instructions:
          'Provider licensing lapses carry massive regulatory fines. Detail the automated re-credentialing notification timeline and primary source verification interface.',
        expected_deliverable:
          'Submit a Healthcare Operations Specification covering: 1. Credentialing Lifecycle Swimlane Map; 2. Primary Source Verification Rules; 3. Expiration Escalation Matrix; 4. Acceptance Criteria.',
      },
    ],
  },
  {
    id: 'ifs-world',
    name: 'IFS Enterprise Cloud',
    verified: true,
    track: 'Industrial ERP, Supply Chain Logistics & Agile Systems',
    location: 'Colombo Tech Hub · IST',
    assignedRole: 'Associate Business Analyst & Enterprise ERP Consultant',
    squad: 'Squad: Global Inventory & Procurement Modernization',
    techStack: 'IFS Cloud ERP, SAP Supply Chain, BPMN 2.0, Jira Agile, Microsoft Power BI',
    enterpriseSoftwareTools: ['IFS Cloud ERP', 'SAP Supply Chain', 'BPMN 2.0', 'Jira Agile', 'Microsoft Power BI'],
    culture: 'Client-first stakeholder empathy, clear requirement traceability, structured MoSCoW prioritization, and crisp user stories',
    managerName: 'Priyantha De Silva',
    managerRole: 'Lead Enterprise Architect & Agile Consultant',
    managerHandle: 'Colombo Hub (@pdesilva)',
    managerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    timezoneLabel: 'IST Shift: 9:00 AM - 5:30 PM IST (Colombo Hub)',
    accentColor: '#8b5cf6',
    logoBg: '#8b5cf6',
    logoText: 'IFS',
    defaultSubmissionType: 'pdf_document',
    onboardingBriefing:
      'Welcome to IFS Enterprise Cloud! Our manufacturing client requires an automated inventory replenishment and supplier procurement reconciliation process across 12 regional distribution hubs. Stock discrepancy delays between checkout and warehouse distribution nodes cause supply chain disruptions. Your assignment is to structure a comprehensive Business Requirements Specification (BRS), design BPMN 2.0 process workflows, and formulate Gherkin acceptance criteria.',
    tasks: [
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-IFS-301',
        company_name: 'IFS Enterprise Cloud',
        task_title: 'Multi-Facility Automated Inventory Replenishment & Procurement BRS',
        scenario_description:
          'An industrial machinery manufacturer operating across 12 regional warehouses experiences frequent stockouts and expensive rush orders. Document the end-to-end automated replenishment process in IFS Cloud ERP, define safety stock calculation rules, and formulate functional requirements for automated Purchase Order (PO) dispatch to certified tier-1 suppliers.',
        required_technology: 'IFS Cloud ERP, BPMN 2.0, Jira Agile, Microsoft Power BI, Lucidchart',
        tech_stack_or_domain: 'Enterprise ERP, Supply Chain Optimization, Procurement Workflows, BRS Documentation',
        simulated_timezone_and_hours: 'IST Shift: 9:00 AM - 5:30 PM IST (Colombo Hub)',
        manager_instructions:
          'Welcome to IFS Enterprise Cloud! Our manufacturing client requires an automated inventory replenishment and supplier procurement reconciliation process across 12 regional distribution hubs. Stock discrepancy delays between checkout and warehouse distribution nodes cause supply chain disruptions. Your assignment is to structure a comprehensive Business Requirements Specification (BRS), design BPMN 2.0 process workflows, and formulate Gherkin acceptance criteria.',
        expected_deliverable:
          'Submit a comprehensive BRS Deliverable containing: 1. Executive Summary & Problem Statement; 2. Stakeholder RACI Matrix; 3. Functional Requirements (MoSCoW prioritized); 4. BPMN 2.0 Replenishment Activity Workflow; 5. Gherkin Acceptance Criteria.',
      },
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-IFS-302',
        company_name: 'IFS Enterprise Cloud',
        task_title: 'Warehouse Dispatch Traceability & Reverse Logistics Process Map',
        scenario_description:
          'Returned goods and warranty repair items are currently delayed in processing yards, causing customer dissatisfaction and inventory inaccuracies. Create a standardized reverse logistics and warranty triage business process map with barcode scanning milestones in IFS Cloud.',
        required_technology: 'IFS Cloud ERP, SAP Supply Chain, Lucidchart, Confluence, Microsoft Excel',
        tech_stack_or_domain: 'Reverse Logistics, Warehouse Management Systems, Warranty Operations',
        simulated_timezone_and_hours: 'IST Shift: 9:00 AM - 5:30 PM IST (Colombo Hub)',
        manager_instructions:
          'Reverse logistics is a critical customer loyalty touchpoint. Define the step-by-step physical and digital handoffs when an item is returned, including inspection grading, restocking, and automated credit note issuance.',
        expected_deliverable:
          'Submit a Process & Systems Specification covering: 1. End-to-End Reverse Logistics Workflow; 2. Inspection Decision Logic; 3. ERP Status Synchronization Rules; 4. Acceptance Criteria.',
      },
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-IFS-303',
        company_name: 'IFS Enterprise Cloud',
        task_title: 'Vendor Performance Scorecard & SLA Compliance Analytics Matrix',
        scenario_description:
          'Procurement directors need an automated scorecard calculating on-time delivery rates, defect percentages, and invoice discrepancy rates across 250+ enterprise vendors. Define analytical metrics, data source joins in IFS Cloud, and automated penalty warning workflows.',
        required_technology: 'IFS Cloud Analytics, Microsoft Power BI, Jira Agile, SQL, Confluence',
        tech_stack_or_domain: 'Vendor Management, SLA Monitoring, Procurement Analytics, BI Dashboards',
        simulated_timezone_and_hours: 'IST Shift: 9:00 AM - 5:30 PM IST (Colombo Hub)',
        manager_instructions:
          'We cannot manage what we do not measure. Detail the exact formulas for Vendor Rating Index (VRI), define tier thresholds (Platinum, Gold, Probation), and write functional requirements for automated buyer alerts.',
        expected_deliverable:
          'Submit a Vendor Management Specification covering: 1. Vendor Scoring Formulas & Weights; 2. Data Requirements & Joins; 3. Automated Probation Workflow; 4. User Acceptance Criteria.',
      },
    ],
    advancedTasks: [
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-IFS-401',
        company_name: 'IFS Enterprise Cloud',
        task_title: 'Milestone 4: Autonomous Robotic Warehouse & Digital Twin Integration Architecture',
        scenario_description:
          'Integrate Automated Guided Vehicles (AGVs) and IoT conveyor systems with IFS Cloud ERP for automated high-density warehouse picking, real-time spatial digital twin simulation, and zero-defect pallet routing.',
        required_technology: 'IFS Cloud ERP, Siemens Digital Twin, BPMN 2.0, ROS Industrial, Microsoft Power BI',
        tech_stack_or_domain: 'Industry 4.0, Warehouse Automation, Digital Twin Simulation, Enterprise Architecture',
        simulated_timezone_and_hours: 'IST Shift: 9:00 AM - 5:30 PM IST (Colombo Hub)',
        manager_instructions:
          'Welcome to Milestone 4! Lead the automation integration between industrial robotics and IFS ERP core. Define the pallet routing exception states and real-time sensor telemetry validation rules.',
        expected_deliverable:
          'Submit a Smart Manufacturing Deliverable covering: 1. Warehouse Automation Activity Diagram; 2. AGV Fleet Dispatching Decision Rules; 3. Real-Time Telemetry Data Schema; 4. Acceptance Criteria.',
      },
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-IFS-402',
        company_name: 'IFS Enterprise Cloud',
        task_title: 'Milestone 4: Predictive Supply Chain Disruption & AI Route Optimization BRS',
        scenario_description:
          'Design functional specifications for predictive global freight disruption forecasting using weather, geopolitical port congestion, and carrier performance signals in IFS Cloud.',
        required_technology: 'IFS Cloud Logistics, Snowflake, Python ML Services, Jira Agile, Tableau',
        tech_stack_or_domain: 'Predictive Logistics, Supply Chain Risk Modeling, Dynamic Routing',
        simulated_timezone_and_hours: 'IST Shift: 9:00 AM - 5:30 PM IST (Colombo Hub)',
        manager_instructions:
          'Proactive re-routing saves millions during canal or port disruptions. Specify the dynamic shipment re-allocation hierarchy and automated supplier SLA renegotiation triggers.',
        expected_deliverable:
          'Submit a Predictive Logistics Specification covering: 1. Disruption Signal Evaluation Framework; 2. Dynamic Freight Re-routing Rules; 3. Contingency Cost Thresholds; 4. Acceptance Criteria.',
      },
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-IFS-403',
        company_name: 'IFS Enterprise Cloud',
        task_title: 'Milestone 4: Global Carbon Accounting & ESG Regulatory Reporting Module',
        scenario_description:
          'Corporate manufacturing enterprises require Scope 1, 2, and 3 greenhouse gas carbon footprint tracking per manufactured unit in IFS Cloud ERP, adhering to EU CSRD standards.',
        required_technology: 'IFS Cloud Sustainability, Microsoft Power BI, SAP S/4HANA, SQL, Confluence',
        tech_stack_or_domain: 'ESG Compliance, Carbon Accounting, Sustainability Data Modeling',
        simulated_timezone_and_hours: 'IST Shift: 9:00 AM - 5:30 PM IST (Colombo Hub)',
        manager_instructions:
          'ESG auditing is now mandatory for European enterprise clients. Document the carbon calculation formulas across manufacturing bills of materials and supplier transport legs.',
        expected_deliverable:
          'Submit an ESG Sustainability BRS covering: 1. Scope 1-3 Carbon Footprint Calculation Formulas; 2. Bill of Materials Emissions Mapping; 3. CSRD Audit Trail Specification; 4. Acceptance Criteria.',
      },
    ],
  },
  {
    id: 'apex-fintech',
    name: 'Apex FinTech Core',
    verified: true,
    track: 'Capital Markets, Clearing & Regulatory Settlement Workflows',
    location: 'London, UK · GMT',
    assignedRole: 'Operations Analyst · Trading Compliance & Settlements',
    squad: 'Squad: Trade Reconciliation & Settlement Compliance',
    techStack: 'Bloomberg Terminal, SQL, Tableau, Jira Agile, FIX Protocol Engine',
    enterpriseSoftwareTools: ['Bloomberg Terminal', 'SQL', 'Tableau', 'Jira Agile', 'FIX Protocol Engine'],
    culture: 'High analytical rigor, zero-defect settlement precision, strict regulatory adherence, and data-driven problem solving',
    managerName: 'Marcus Vance',
    managerRole: 'Staff Director of Financial Architecture & Operations',
    managerHandle: 'London Core (@mvance)',
    managerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    timezoneLabel: 'UK Shift: 2:00 PM - 10:00 PM IST (London HQ · GMT)',
    accentColor: '#493ee5',
    logoBg: '#493ee5',
    logoText: 'AF',
    defaultSubmissionType: 'pdf_document',
    onboardingBriefing:
      'Welcome to Apex FinTech Core! As part of our London operations group, you will analyze high-value trade settlement validation and regulatory reporting rules under T+1 settlement cycles. Unsettled transactions during market volatility carry severe liquidity penalties. We need detailed functional user stories, risk impact assessments for failed settlements, and audit trail specifications for compliance teams.',
    tasks: [
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-AF-401',
        company_name: 'Apex FinTech Core',
        task_title: 'T+1 Settlement Cycle Trade Reconciliation & Compliance Process',
        scenario_description:
          'Global securities regulations mandate trade matching and settlement within 24 hours (T+1). Outline the functional requirements for real-time post-trade allocation, exception identification for mismatched trade tickets, and automated regulatory reporting to oversight authorities.',
        required_technology: 'Bloomberg Terminal, SQL, Tableau, Jira Agile, FIX Protocol Engine',
        tech_stack_or_domain: 'Capital Markets, Trade Settlement, Regulatory Compliance, Risk Analysis',
        simulated_timezone_and_hours: 'UK Shift: 2:00 PM - 10:00 PM IST (London HQ · GMT)',
        manager_instructions:
          'Welcome to Apex FinTech Core! As part of our London operations group, you will analyze high-value trade settlement validation and regulatory reporting rules under T+1 settlement cycles. Unsettled transactions during market volatility carry severe liquidity penalties. We need detailed functional user stories, risk impact assessments for failed settlements, and audit trail specifications for compliance teams.',
        expected_deliverable:
          'Submit a Capital Markets BRS Deliverable covering: 1. Trade Lifecycle & Allocation Swimlane Diagram; 2. Exception Categorization & Auto-Repair Logic; 3. Regulatory Compliance Data Matrix; 4. Acceptance Criteria.',
      },
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-AF-402',
        company_name: 'Apex FinTech Core',
        task_title: 'Cross-Border Clearing Exception Management & Risk Assessment',
        scenario_description:
          'Multi-currency asset clearing involves foreign exchange rate locks, intermediary clearing fees, and correspondent bank cutoff windows. Formulate functional business rules to identify cross-border settlement failures and trigger automated hedging requests.',
        required_technology: 'SWIFT Gateway, Jira Agile, Microsoft Visio, SQL, Bloomberg Terminal',
        tech_stack_or_domain: 'FX Clearing, Treasury Operations, Risk Mitigation, Settlement Workflows',
        simulated_timezone_and_hours: 'UK Shift: 2:00 PM - 10:00 PM IST (London HQ · GMT)',
        manager_instructions:
          'Currency fluctuations during failed settlement windows expose the firm to market risk. Define clear business rules for FX rate guarantees, automated SWIFT MT300 exception messages, and treasury notification thresholds.',
        expected_deliverable:
          'Submit an Operations Specification covering: 1. Cross-Border Settlement Flow; 2. Risk Mitigation Decision Rules; 3. SWIFT Message Mapping; 4. User Acceptance Criteria.',
      },
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-AF-403',
        company_name: 'Apex FinTech Core',
        task_title: 'Institutional Client Margin Call Automation & Audit Logging',
        scenario_description:
          'During periods of high equity market volatility, prime brokerage clients must maintain collateral coverage ratios. Design the business analysis specifications for automated intraday margin deficit calculations, client portal margin call notices, and liquidation warning sequences.',
        required_technology: 'Apex Clearing Platform, Confluence, SQL, Tableau, Jira',
        tech_stack_or_domain: 'Margin Lending, Collateral Management, Prime Brokerage, Audit Logging',
        simulated_timezone_and_hours: 'UK Shift: 2:00 PM - 10:00 PM IST (London HQ · GMT)',
        manager_instructions:
          'Margin calls must be mathematically verifiable and strictly auditable. Document the collateral haircut rules, client grace period timeframes, and formal escalation stages before automated portfolio de-risking.',
        expected_deliverable:
          'Submit a Prime Brokerage Specification covering: 1. Margin Deficit Calculation Formula; 2. Collateral Eligibility Rules; 3. Escalation & Liquidation Workflow; 4. Audit Trail Requirements.',
      },
    ],
    advancedTasks: [
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-AF-501',
        company_name: 'Apex FinTech Core',
        task_title: 'Milestone 4: Distributed Settlement Ledger & Instantaneous Delivery vs Payment (DvP)',
        scenario_description:
          'Design the functional architecture for instantaneous Delivery versus Payment (DvP Model 1) asset token settlement across participating custodian banks with zero counterparty settlement risk.',
        required_technology: 'Bloomberg Terminal, FIX Protocol, Solidity/Ethereum Enterprise, SQL, Tableau',
        tech_stack_or_domain: 'Capital Markets, Delivery vs Payment, Tokenized Securities, Institutional Custody',
        simulated_timezone_and_hours: 'UK Shift: 2:00 PM - 10:00 PM IST (London HQ · GMT)',
        manager_instructions:
          'Milestone 4 advances you to Senior Operations Analyst. Formulate the atomic DvP asset exchange rules and multi-custodian liquidity lock protocols.',
        expected_deliverable:
          'Submit a DvP Systems Architecture Deliverable covering: 1. Atomic Settlement Swimlane Diagram; 2. Custodian Liquidity Lock State Machine; 3. Failure Rollback Protocol; 4. Acceptance Criteria.',
      },
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-AF-502',
        company_name: 'Apex FinTech Core',
        task_title: 'Milestone 4: Algorithmic Market-Making Surveillance & Spoofing Detection Engine',
        scenario_description:
          'Formulate regulatory compliance business rules to monitor high-frequency limit order books for illegal layering, spoofing, and wash trading patterns under SEC and FCA trade surveillance standards.',
        required_technology: 'Kx kdb+/q, Bloomberg Terminal, SQL, Python Analytics, Jira Agile',
        tech_stack_or_domain: 'Market Surveillance, Algorithmic Trading Rules, Trade Compliance',
        simulated_timezone_and_hours: 'UK Shift: 2:00 PM - 10:00 PM IST (London HQ · GMT)',
        manager_instructions:
          'Market manipulation surveillance requires microsecond order book pattern matching. Detail the spoofing cancellation velocity ratio and trader intent alert scoring model.',
        expected_deliverable:
          'Submit a Market Surveillance BRS covering: 1. Order-to-Trade Ratio (OTR) Threshold Formulas; 2. Spoofing Pattern Detection Algorithm; 3. Regulatory Suspicious Activity Report (SAR) Matrix; 4. Acceptance Criteria.',
      },
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-AF-503',
        company_name: 'Apex FinTech Core',
        task_title: 'Milestone 4: Multi-Asset Liquidity Pooling & Automated Rehypothecation Pipeline',
        scenario_description:
          'Institutional prime broker clients pledge diverse collateral (treasuries, corporate bonds, equities). Model the optimal collateral optimization algorithm for repo market rehypothecation.',
        required_technology: 'Apex Custody Engine, SQL, Confluence, Microsoft Excel, Tableau',
        tech_stack_or_domain: 'Collateral Optimization, Securities Lending, Repo Financing',
        simulated_timezone_and_hours: 'UK Shift: 2:00 PM - 10:00 PM IST (London HQ · GMT)',
        manager_instructions:
          'Collateral efficiency generates significant yield. Formulate the haircut valuation formulas and automated collateral substitution workflows.',
        expected_deliverable:
          'Submit a Prime Brokerage Collateral Spec covering: 1. Dynamic Collateral Haircut Table; 2. Rehypothecation Eligibility Decision Tree; 3. Intra-Day Margin Recall Rules; 4. Acceptance Criteria.',
      },
    ],
  },
  {
    id: 'neoscale-ai',
    name: 'NeoScale AI Labs',
    verified: true,
    track: 'Enterprise AI Product Strategy & Workflow Automation',
    location: 'San Francisco, CA · PST',
    assignedRole: 'Associate Product & Requirements Analyst · AI Workflows',
    squad: 'Squad: Enterprise Knowledge Automation & Prompt Workflows',
    techStack: 'Notion Enterprise, Figma, Jira Product Discovery, Postman, Mixpanel',
    enterpriseSoftwareTools: ['Notion Enterprise', 'Figma', 'Jira Product Discovery', 'Postman', 'Mixpanel'],
    culture: 'Customer empathy, rapid prototyping, ethical AI guardrails, structured user feedback loops, and clarity in specifications',
    managerName: 'Liam Chen',
    managerRole: 'Head of Product & AI Strategy',
    managerHandle: 'SF HQ (@lchen)',
    managerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    timezoneLabel: 'PST Shift: 9:30 PM - 5:30 AM IST (San Francisco HQ)',
    accentColor: '#635bff',
    logoBg: '#635bff',
    logoText: 'NS',
    defaultSubmissionType: 'pdf_document',
    onboardingBriefing:
      'Welcome to NeoScale AI Labs! We are deploying customer support automation agents for Fortune 500 enterprise partners. We need you to define functional acceptance criteria for LLM agent fallbacks, map human-in-the-loop escalation workflows, and document SLA monitoring requirements for response accuracy and tone consistency.',
    tasks: [
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-NS-501',
        company_name: 'NeoScale AI Labs',
        task_title: 'Enterprise Support Agent Human-in-the-Loop Escalation Specification',
        scenario_description:
          'Enterprise partners deploying autonomous customer support agents need clear operational boundaries. Formulate the functional specifications for intent classification confidence scoring, automated transfer to human support tiers, and agent handoff context packaging.',
        required_technology: 'Jira Product Discovery, Figma, Mixpanel, Notion Enterprise, Postman',
        tech_stack_or_domain: 'AI Product Management, Conversational Workflow Design, Human-in-the-Loop Systems',
        simulated_timezone_and_hours: 'PST Shift: 9:30 PM - 5:30 AM IST (San Francisco HQ)',
        manager_instructions:
          'Welcome to NeoScale AI Labs! We are deploying customer support automation agents for Fortune 500 enterprise partners. We need you to define functional acceptance criteria for LLM agent fallbacks, map human-in-the-loop escalation workflows, and document SLA monitoring requirements for response accuracy and tone consistency.',
        expected_deliverable:
          'Submit an AI Product Specification covering: 1. Intent Routing & Escalation Decision Tree; 2. Confidence Score Threshold Table; 3. Context Preservation Data Schema; 4. Given-When-Then Acceptance Criteria.',
      },
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-NS-502',
        company_name: 'NeoScale AI Labs',
        task_title: 'Model Hallucination Risk Mitigation & SLA Monitoring Matrix',
        scenario_description:
          'In regulated finance and healthcare deployments, generative AI agents must never provide ungrounded advice. Specify factual retrieval guardrails, citation verification rules, and automated real-time quality assurance metrics.',
        required_technology: 'Postman, Grafana, Confluence, Datadog, Notion Enterprise',
        tech_stack_or_domain: 'Responsible AI, QA Benchmarking, Risk Mitigation, Enterprise SLAs',
        simulated_timezone_and_hours: 'PST Shift: 9:30 PM - 5:30 AM IST (San Francisco HQ)',
        manager_instructions:
          'Enterprise clients will terminate contracts if our agents hallucinate policy terms. Document the mandatory RAG ground-truth verification steps, toxic language filters, and real-time review sampling rates.',
        expected_deliverable:
          'Submit a Quality & Governance Deliverable covering: 1. Citation & Source Grounding Rules; 2. Hallucination Severity Classification; 3. Automated Circuit-Breaker Protocols; 4. SLA Monitoring Matrix.',
      },
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-NS-503',
        company_name: 'NeoScale AI Labs',
        task_title: 'Enterprise SSO & Multi-Tenant Access Control Functional Requirements',
        scenario_description:
          'Corporate security officers require role-based access control (RBAC), SAML/Okta Single Sign-On, and isolated workspace data partitioning for company proprietary training corpora.',
        required_technology: 'Okta Enterprise, Jira Enterprise, Lucidchart, Confluence',
        tech_stack_or_domain: 'Identity & Access Management, Security Compliance, Multi-Tenant Architecture',
        simulated_timezone_and_hours: 'PST Shift: 9:30 PM - 5:30 AM IST (San Francisco HQ)',
        manager_instructions:
          'Security compliance is our biggest enterprise sales gating item. Specify the permission matrix for Org Admin, Prompt Engineer, and Auditor roles with SAML integration rules.',
        expected_deliverable:
          'Submit a Security Architecture Specification covering: 1. RBAC Permission Matrix; 2. SAML 2.0 / SCIM Provisioning Workflow; 3. Tenant Data Isolation Guarantees; 4. Acceptance Criteria.',
      },
    ],
    advancedTasks: [
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-NS-601',
        company_name: 'NeoScale AI Labs',
        task_title: 'Milestone 4: Autonomous Agent Orchestration & Multi-Model Inference Routing Matrix',
        scenario_description:
          'Enterprise multi-agent architectures require intelligent routing between high-reasoning frontier models and ultra-fast lightweight models based on query complexity, latency budgets, and cost quotas.',
        required_technology: 'Jira Product Discovery, Figma, Postman, OpenTelemetry, Notion Enterprise',
        tech_stack_or_domain: 'Agentic Workflows, Multi-Model Routing, Inference Optimization, Latency SLAs',
        simulated_timezone_and_hours: 'PST Shift: 9:30 PM - 5:30 AM IST (San Francisco HQ)',
        manager_instructions:
          'Welcome to Milestone 4! You are leading AI Agent Systems Strategy. Formulate the cost vs latency threshold matrix and fallback retry protocols when upstream models experience throttling.',
        expected_deliverable:
          'Submit an AI Architecture Deliverable covering: 1. Query Complexity Classification Rules; 2. Multi-Model Inference Decision Tree; 3. Circuit Breaker Fallback Logic; 4. Acceptance Criteria.',
      },
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-NS-602',
        company_name: 'NeoScale AI Labs',
        task_title: 'Milestone 4: Zero-Trust Enterprise Knowledge Base Ingestion & Fine-Grained RAG ACLs',
        scenario_description:
          'Enterprise RAG systems indexing confidential corporate documents must enforce document-level and chunk-level Access Control Lists (ACLs) so standard employees never retrieve executive salary or board data.',
        required_technology: 'Pinecone Vector DB, Okta Enterprise, Jira Enterprise, Confluence, Postman',
        tech_stack_or_domain: 'Vector Database Security, RAG Access Control, Zero-Trust Data Governance',
        simulated_timezone_and_hours: 'PST Shift: 9:30 PM - 5:30 AM IST (San Francisco HQ)',
        manager_instructions:
          'Data leakage inside vector embeddings destroys client confidence. Define the metadata security filtering specification injected at embedding query time.',
        expected_deliverable:
          'Submit a RAG Security Specification covering: 1. Vector Chunk Metadata Filtering Schema; 2. Okta User Role Ingestion Mapping; 3. Document Redaction Safeguards; 4. Acceptance Criteria.',
      },
      {
        action_type: 'generate_task_response',
        task_id: 'TASK-NS-603',
        company_name: 'NeoScale AI Labs',
        task_title: 'Milestone 4: Continuous RLHF Feedback Pipeline & Automated Drift Remediation BRS',
        scenario_description:
          'Design the human-in-the-loop telemetry collection pipeline that captures user feedback (thumbs up/down, edit corrections, prompt retries) to trigger automated fine-tuning dataset curation and model drift alerting.',
        required_technology: 'Mixpanel, Postman, Grafana, Notion Enterprise, Datadog',
        tech_stack_or_domain: 'RLHF Feedback Loops, Model Monitoring, Data Curation Pipelines',
        simulated_timezone_and_hours: 'PST Shift: 9:30 PM - 5:30 AM IST (San Francisco HQ)',
        manager_instructions:
          'Continuous evaluation keeps models grounded over time. Formulate the data filtering rules that isolate high-value user corrections from low-signal feedback.',
        expected_deliverable:
          'Submit an ML Operations Specification covering: 1. User Feedback Ingestion Schema; 2. Data Curation Quality Filters; 3. Model Drift Detection Thresholds; 4. Acceptance Criteria.',
      },
    ],
  },
];

export const INITIAL_DEFAULT_TASK: GenerateTaskResponse = COMPANY_PRESETS[0].tasks![0] as GenerateTaskResponse;

export const SAMPLE_BA_PDF_REPORT = `# BUSINESS REQUIREMENTS SPECIFICATION (BRS) & WORKFLOW SPECIFICATION
Project: Enterprise Automated Order Fulfillment & Inventory Reconciliation
Author: Kasun Wickramasinghe (NIBM IT Undergraduate / Trainee Business Analyst)
Client / Org: Stripe & IFS Enterprise Cloud
Date: November 2026 | Version: 2.0 (Milestone 4 Ready)

## 1. Executive Summary & Problem Statement
Currently, multi-channel procurement orders experience asynchronous stock discrepancy delays averaging 18 minutes between checkout and warehouse distribution nodes. Disputed transactions and uncoordinated retry attempts trigger manual customer interventions and revenue leakage. This document defines the functional requirements, BPMN workflow, and user acceptance criteria for an automated, real-time event-driven reconciliation pipeline.

## 2. Stakeholder RACI Matrix
- Responsible (R): Lead Systems Engineer & Platform Team
- Accountable (A): Associate Product Manager & Business Analyst
- Consulted (C): Warehouse Logistics Leads & Finance Auditor
- Informed (I): Customer Support Operations & Store Managers

## 3. Scope & Requirement Traceability (MoSCoW Prioritized)
- [FR-01] [Must Have]: Real-time transaction receipt with sub-second acknowledgement.
- [FR-02] [Must Have]: Atomic stock reservation against Central ERP inventory database.
- [FR-03] [Should Have]: Replay detection guard to reject duplicate order event payloads.
- [FR-04] [Could Have]: Automated manager notification if stock threshold drops below 15 units.
- [NFR-01] Performance: The ingestion endpoint must process 99.9% of requests in < 120ms.
- [NFR-02] Compliance: Complete ISO 27001 audit logging for every credit / debit mutation.

## 4. BPMN 2.0 Activity Workflow & Process Mapping
[Customer Checkout] -> [Order Ingress Validation] -> {Verify Commercial Terms & Token}
  -> [Check Distributed Cache for Existing Record]
    - If Duplicate: Return Cached Order State
    - If New: Lock SKU -> Post to Settlement Ledger -> Notify Supply Chain -> Send Confirmation.

## 5. User Acceptance Criteria (Gherkin Syntax)
Scenario: Preventing duplicate checkout deduction on client retry
  Given an order with unique transaction ID "TXN-88210" has already been processed
  When the payment gateway retries sending the transaction confirmation
  Then the system identifies the existing receipt without incrementing inventory debits
  And returns HTTP 200 OK with the cached settlement confirmation.`;

export const INITIAL_NIBM_COHORT: CompletedSimulation[] = [
  {
    id: 'SIM-NIBM-001',
    studentName: 'Kasun Wickramasinghe',
    studentId: 'NIBM-BSE-22.1-018',
    companyName: 'Stripe',
    techStack: 'Stripe Billing Engine, Salesforce CRM, Jira, Lucidchart',
    task: COMPANY_PRESETS[0].tasks![0],
    submission: `Implemented multi-currency dunning process maps in Lucidchart, defined decline code classification rules, and mapped bi-directional customer notification triggers in Salesforce CRM.`,
    submissionType: 'pdf_document',
    timeTakenMins: 45,
    evaluation: {
      action_type: 'evaluate_submission_response',
      overall_score: 91,
      technical_or_analytical_score: 94,
      technical_accuracy_score: 94,
      cultural_fit_and_communication_score: 88,
      detailed_feedback: 'What was done right:\n• Clear business logic and dunning escalation triggers.\n• Thorough CRM integration requirements.\n\nWhat needs improvement:\n• Add quantifiable KPI latency thresholds for billing events.',
      hr_dashboard_summary: 'The student demonstrated exceptional analytical rigor and requirements modeling for Stripe revenue operations. Highly recommended for enterprise placement.'
    },
    completedAt: '2026-11-03T14:30:00Z'
  },
  {
    id: 'SIM-NIBM-002',
    studentName: 'Amaya Fernando',
    studentId: 'NIBM-BSE-22.1-042',
    companyName: 'CareCloud Health',
    techStack: 'Epic EHR, CareCloud PM, HL7/FHIR, Confluence',
    task: COMPANY_PRESETS[1].tasks![0],
    submission: `Developed comprehensive HIPAA-compliant patient intake workflows with FHIR Resource data mapping and demographic validation safeguards.`,
    submissionType: 'pdf_document',
    timeTakenMins: 40,
    evaluation: {
      action_type: 'evaluate_submission_response',
      overall_score: 89,
      technical_or_analytical_score: 92,
      technical_accuracy_score: 92,
      cultural_fit_and_communication_score: 85,
      detailed_feedback: 'What was done right:\n• Well-crafted clinical workflows adhering to HIPAA standards.\n• Thorough patient intake verification logic.\n\nWhat needs improvement:\n• Expand on automated exception alerts for unverified coverage.',
      hr_dashboard_summary: 'Demonstrated strong problem-solving and healthcare systems analysis. Recommended as industry-ready for clinical software teams.'
    },
    completedAt: '2026-11-03T16:15:00Z'
  },
  {
    id: 'SIM-NIBM-003',
    studentName: 'Dineth Perera',
    studentId: 'NIBM-MIS-22.1-007',
    companyName: 'IFS Enterprise Cloud',
    techStack: 'IFS Cloud ERP, SAP Supply Chain, BPMN 2.0, Jira',
    task: COMPANY_PRESETS[2].tasks![0],
    submission: SAMPLE_BA_PDF_REPORT,
    submissionType: 'pdf_document',
    timeTakenMins: 35,
    evaluation: {
      action_type: 'evaluate_submission_response',
      overall_score: 92,
      technical_or_analytical_score: 94,
      technical_accuracy_score: 94,
      cultural_fit_and_communication_score: 90,
      detailed_feedback: 'What was done right:\n• Exceptional requirement traceability and structured MoSCoW prioritization.\n• Flawless Gherkin acceptance criteria.\n• Clear executive summary with problem definition.\n\nWhat needs improvement:\n• Include explicit error fallback states in the BPMN workflow diagram.',
      hr_dashboard_summary: 'Outstanding business analysis aptitude and structured requirements engineering. Recommended for consulting internship roles.'
    },
    completedAt: '2026-11-04T09:20:00Z'
  }
];
