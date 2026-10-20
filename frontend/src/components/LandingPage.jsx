import React, { useState } from 'react';

export default function LandingPage({
  onLaunchWorkbench,
  onOpenAuth,
  onSwitchToDemo,
  caseCount = 0,
}) {
  // Interactive demo widget state on the landing page
  const [demoState, setDemoState] = useState('with_conflict'); // 'with_conflict' or 'resolved'
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'Why not simply use ChatGPT, Claude, or standard LLMs for document comparison?',
      a: 'Generative LLMs are probabilistic token predictors that suffer from the "false compromise" fallacy: when presented with conflicting numbers or terms, they frequently hallucinate a synthetic average or assume one party is correct without proof. ClearTrace Labs uses two isolated AI agents combined with deterministic SingularityNET MeTTa symbolic logic. It mathematically preserves open contradictions and refuses to guess without independent third-party evidence.',
    },
    {
      q: 'What file formats and document types are supported?',
      a: 'ClearTrace natively accepts Adobe PDF (.pdf), Microsoft Word (.docx), Plain Text (.txt), Markdown (.md), CSV/TSV (.csv, .tsv), and JSON (.json). You can drag and drop raw files or paste specific clauses directly into the workbench.',
    },
    {
      q: 'Is our corporate financial or contractual data kept private?',
      a: 'Yes. ClearTrace Labs implements air-gapped multi-tenant partition isolation. Your documents, extracted claims, and audit histories are private to your organization and encrypted. Furthermore, ClearTrace never trains external foundation models on your private documents.',
    },
    {
      q: 'Can we define custom business rules for our industry or enterprise?',
      a: 'Yes. ClearTrace features "The Agent That Grows Up" architecture. Through declarative MeTTa S-expression rules, compliance and accounting teams can inject custom tolerance thresholds, governing law precedence, and domain-specific calculation rules that execute deterministically across future reconciliations.',
    },
    {
      q: 'How does offline cryptographic verification work?',
      a: 'Every ingested claim, negotiation exchange, and rule evaluation is hashed into a hierarchical SHA-256 Merkle tree, emitting an immutable Replay Certificate. Anyone—including external auditors, compliance regulators, or courts—can mathematically reproduce the exact verdict offline using our open CLI validator (python3 scripts/validate_proof.py) without needing access to our servers.',
    },
  ];

  return (
    <div className="flex flex-col gap-16 py-4 animate-fade-in text-slate-100">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0F172A] via-[#0B1120] to-[#070B14] p-8 sm:p-12 md:p-16 border border-[#1E293B] shadow-2xl">
        {/* Ambient Glows */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center gap-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            <span>Evidence-First Truth Engine</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 font-normal">Powered by SingularityNET MeTTa</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Reconcile Conflicting Documents.{' '}
            <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Prove Every Fact.
            </span>{' '}
            Zero Hallucination.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            When business documents disagree—such as Purchase Orders vs. Invoices, or Split Sheets
            vs. Royalty Statements—standard AI invents fake compromises. ClearTrace deploys two
            independent AI agents and deterministic MeTTa symbolic logic to pinpoint discrepancies,
            calculate financial exposure, and seal decisions in cryptographic Merkle proofs.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
            <button
              onClick={onLaunchWorkbench}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition-all shadow-lg shadow-sky-600/30 cursor-pointer flex items-center justify-center gap-2 group"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px] group-hover:translate-x-0.5 transition-transform">
                compare_arrows
              </span>
              <span>Launch Reconcile Workbench</span>
            </button>

            <button
              onClick={onSwitchToDemo}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-slate-200 font-semibold text-sm transition-colors border border-[#334155] cursor-pointer flex items-center justify-center gap-2"
              type="button"
            >
              <span className="material-symbols-outlined text-amber-400 text-[18px]">bolt</span>
              <span>Try Demo Sandbox</span>
            </button>


          </div>

          {/* Key Metric Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full pt-6 border-t border-[#1E293B]/80 mt-2">
            <div className="p-3 rounded-xl bg-[#070B14]/60 border border-[#1E293B] flex flex-col items-center">
              <span className="text-xl font-extrabold text-white">0%</span>
              <span className="text-[11px] text-slate-400 mt-0.5">False Consensus</span>
            </div>
            <div className="p-3 rounded-xl bg-[#070B14]/60 border border-[#1E293B] flex flex-col items-center">
              <span className="text-xl font-extrabold text-sky-400">&lt; 35ms</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Reasoning Latency</span>
            </div>
            <div className="p-3 rounded-xl bg-[#070B14]/60 border border-[#1E293B] flex flex-col items-center">
              <span className="text-xl font-extrabold text-emerald-400">SHA-256</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Merkle Proof Sealed</span>
            </div>
            <div className="p-3 rounded-xl bg-[#070B14]/60 border border-[#1E293B] flex flex-col items-center">
              <span className="text-xl font-extrabold text-teal-400">Air-Gapped</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Tenant Isolation</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE INTERACTIVE DEMO PREVIEW WIDGET */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              Interactive Product Showcase
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              See How ClearTrace Catches Hidden Variances
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Toggle between an unresolved conflict and corroborated third-party evidence below to see
              the engine evaluate truth in real-time.
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="p-1 rounded-xl bg-[#0F172A] border border-[#1E293B] flex items-center gap-1 self-start sm:self-auto">
            <button
              onClick={() => setDemoState('with_conflict')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                demoState === 'with_conflict'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              type="button"
            >
              1. Flagged Discrepancy
            </button>
            <button
              onClick={() => setDemoState('resolved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                demoState === 'resolved'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              type="button"
            >
              2. Corroborated with Proof
            </button>
          </div>
        </div>

        {/* The Interactive Card */}
        <div className="rounded-2xl bg-[#0F172A] border border-[#1E293B] shadow-xl p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Purchase Order Line Quantity</span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  demoState === 'with_conflict'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">
                  {demoState === 'with_conflict' ? 'error' : 'verified'}
                </span>
                <span>
                  {demoState === 'with_conflict'
                    ? 'Discrepancy (Needs Review)'
                    : 'Verified by Third Record'}
                </span>
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Benchmark: B2B Procurement</span>
          </div>

          {/* Side by Side Box */}
          <div className="rounded-xl bg-[#070B14] border border-[#1E293B] overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#1E293B]">
              <div className="p-4 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-rose-300">Purchase Order #PO-2026-089</span>
                  <span className="font-mono text-[10px] text-slate-500">Record A</span>
                </div>
                <div className="text-base font-bold text-white mt-1">90 units authorized</div>
                <div className="text-xs text-slate-400">KSh 45,000.00 total authorized expenditure</div>
              </div>

              <div className="p-4 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-sky-300">Supplier Invoice #INV-2026-104</span>
                  <span className="font-mono text-[10px] text-slate-500">Record B</span>
                </div>
                <div
                  className={`text-base font-bold mt-1 ${
                    demoState === 'with_conflict' ? 'text-rose-300' : 'text-slate-200'
                  }`}
                >
                  100 units billed
                </div>
                <div className="text-xs text-slate-400">KSh 50,000.00 total amount due</div>
              </div>
            </div>

            {/* Third evidence row if resolved */}
            {demoState === 'resolved' && (
              <div className="p-3 bg-emerald-950/20 border-t border-emerald-500/20 flex items-center justify-between flex-wrap gap-2 text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400">
                    attachment
                  </span>
                  <span>
                    <strong>Corroborating Document 3:</strong> Approved PO Amendment #A-02 authorizes 10
                    additional drafting boards.
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">
                  Verified Match
                </span>
              </div>
            )}
          </div>

          {/* Variance Banner */}
          {demoState === 'with_conflict' ? (
            <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-xl text-xs flex items-center gap-2.5 text-amber-200">
              <span className="material-symbols-outlined text-[18px] text-amber-400 shrink-0">
                payments
              </span>
              <span>
                <strong className="text-white">Calculated Financial Gap: </strong>
                KSh 5,000 potential overcharge (10 excess units billed at KSh 500/unit). Payment held
                pending authorization.
              </span>
            </div>
          ) : (
            <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-xl text-xs flex items-center gap-2.5 text-emerald-200">
              <span className="material-symbols-outlined text-[18px] text-emerald-400 shrink-0">
                verified
              </span>
              <span>
                <strong className="text-white">Resolved by Proof: </strong>
                Billed quantity of 100 units confirmed by Amendment #A-02. Full payment of KSh 50,000
                cleared for release.
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-[#1E293B] text-xs">
            <span className="text-slate-400">
              Deterministic MeTTa deduction took <strong>28 ms</strong>. SHA-256 seal verified.
            </span>
            <button
              onClick={onLaunchWorkbench}
              className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
              type="button"
            >
              <span>Test with your own files</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. THE PROBLEM WE SOLVE: WHY LLMS FAIL */}
      <section className="flex flex-col gap-8">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
            The Fundamental Flaw
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Why Standard Generative AI Cannot Be Trusted for Document Reconciliation
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Standard large language models hallucinate false consensus. In high-stakes finance, legal,
            and supply chain operations, that creates millions in undetected liabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Flawed LLM Box */}
          <div className="p-6 rounded-2xl bg-rose-950/10 border border-rose-500/20 flex flex-col gap-4">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
              <span className="material-symbols-outlined text-[20px]">cancel</span>
              <span>Standard Generative AI &amp; LLMs</span>
            </div>

            <ul className="flex flex-col gap-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>
                  <strong>Hallucinates Compromise:</strong> When two documents state conflicting prices
                  ($100 vs. $120), LLMs often average them or fabricate a middle ground.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>
                  <strong>Prompt Contamination:</strong> One prompt evaluates both files simultaneously,
                  biasing extraction and causing early false convergence.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>
                  <strong>No Mathematical Verifiability:</strong> Every prompt run yields slightly
                  different wording with zero cryptographic replay guarantee.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>
                  <strong>Shared Data Exposure:</strong> Documents are frequently logged and fed back into
                  public training sets.
                </span>
              </li>
            </ul>
          </div>

          {/* ClearTrace Truth Engine Box */}
          <div className="p-6 rounded-2xl bg-emerald-950/10 border border-emerald-500/20 flex flex-col gap-4">
            <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>ClearTrace Evidence-First Engine</span>
            </div>

            <ul className="flex flex-col gap-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>
                  <strong>Air-Gapped Agent Isolation:</strong> Agent A (Record Verifier) and Agent B (Context
                  Challenger) extract claims in total isolation with zero prompt contamination.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>
                  <strong>SingularityNET MeTTa Symbolic Logic:</strong> Evaluates declarative S-expressions in
                  a typed Atomspace; freezes disputes rather than guessing.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>
                  <strong>Cryptographic Merkle Replay:</strong> SHA-256 Merkle proofs allow any external
                  auditor or regulator to reproduce the exact verdict offline.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>
                  <strong>Private Tenant Isolation:</strong> Corporate documents are partitioned in private
                  workspaces and never used for public AI training.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS: 3-STEP ENGINE WORKFLOW */}
      <section className="flex flex-col gap-8">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
            Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            How ClearTrace Labs Reconciles Truth in 3 Steps
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A deterministic, multi-agent pipeline designed for forensic compliance and speed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-[#0F172A] border border-[#1E293B] flex flex-col gap-3 relative">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-base">
              1
            </div>
            <h3 className="text-base font-bold text-white">Air-Gapped Intake</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload PDF, DOCX, TXT, or CSV files. Agent A parses the primary record while Agent B
              independently parses the counter-document. Neither agent sees the other’s text during
              intake, guaranteeing unpolluted evidence extraction.
            </p>
            <div className="text-[11px] text-sky-400 font-medium mt-auto pt-3 border-t border-[#1E293B] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">check_circle</span>
              <span>Tokenized Claims &amp; Verbatim Citations</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-[#0F172A] border border-[#1E293B] flex flex-col gap-3 relative">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-base">
              2
            </div>
            <h3 className="text-base font-bold text-white">5-Stage MeTTa Evaluation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The engine matches canonical properties and triggers a 5-stage cross-challenge protocol.
              Declarative MeTTa rewrite rules execute in a typed Atomspace. Contradictions are explicitly
              preserved unless third-party corroboration is proven.
            </p>
            <div className="text-[11px] text-teal-400 font-medium mt-auto pt-3 border-t border-[#1E293B] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">check_circle</span>
              <span>Sub-35ms Symbolic Reduction</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-[#0F172A] border border-[#1E293B] flex flex-col gap-3 relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-base">
              3
            </div>
            <h3 className="text-base font-bold text-white">Action &amp; Merkle Seal</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Discrepancies are broken down with plain-language explanations and financial variance
              calculations. Auditors record official sign-offs, export executive PDFs, and receive
              tamper-evident SHA-256 Merkle Decision Certificates.
            </p>
            <div className="text-[11px] text-emerald-400 font-medium mt-auto pt-3 border-t border-[#1E293B] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">check_circle</span>
              <span>Executive PDF &amp; Offline CLI Proof</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TARGET ENTERPRISE VERTICALS & USE CASES */}
      <section className="flex flex-col gap-8">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
            Enterprise Solutions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Built for High-Stakes Industries
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Proven reconciliation workflows across finance, intellectual property, legal, and supply chain.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Vertical 1 */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] flex flex-col gap-3 hover:border-sky-500/40 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
            <h3 className="text-sm font-bold text-white">B2B Procurement &amp; AP</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Match Purchase Orders vs. Invoices vs. Delivery Slips. Stop overbilling, spot unapproved
              quantity inflations, and expedite verified payments.
            </p>
          </div>

          {/* Vertical 2 */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] flex flex-col gap-3 hover:border-sky-500/40 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">music_note</span>
            </div>
            <h3 className="text-sm font-bold text-white">Music IP &amp; Royalties</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Audit split sheets against Spotify, Apple Music, and publishing statements. Catch royalty
              gaps and territory distribution leakage down to the cent.
            </p>
          </div>

          {/* Vertical 3 */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] flex flex-col gap-3 hover:border-sky-500/40 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">gavel</span>
            </div>
            <h3 className="text-sm font-bold text-white">Legal, Contracts &amp; M&amp;A</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cross-examine contract versions, amendments, and disclosures. Confirm governing laws,
              indemnity clauses, and closing requirements with exact citations.
            </p>
          </div>

          {/* Vertical 4 */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] flex flex-col gap-3 hover:border-sky-500/40 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">local_shipping</span>
            </div>
            <h3 className="text-sm font-bold text-white">Trade, Logistics &amp; Customs</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reconcile shipping manifests, bills of lading, and customs declarations. Detect commodity code
              and weight mismatches before customs penalties strike.
            </p>
          </div>
        </div>
      </section>


      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
        <div className="text-center flex flex-col gap-2">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
            Clear Answers
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-[#0F172A] border border-[#1E293B] overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-white hover:bg-[#1E293B]/40 transition-colors cursor-pointer"
                  type="button"
                >
                  <span>{faq.q}</span>
                  <span className="material-symbols-outlined text-[18px] text-slate-400 shrink-0">
                    {isOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {isOpen && (
                  <div className="p-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-[#1E293B]/60 bg-[#070B14]/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. BOTTOM HIGH-CONVERSION CTA BANNER */}
      <section className="rounded-3xl bg-gradient-to-r from-sky-950/60 via-[#0F172A] to-emerald-950/60 p-8 sm:p-12 border border-sky-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="flex flex-col gap-2 max-w-xl">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
            Start Auditing Confidently
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ready to Eliminate Document Discrepancies?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Upload your files or paste clauses now. ClearTrace highlights what matches, calculates
            exact financial variances, and delivers cryptographic peace of mind in seconds.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            onClick={onLaunchWorkbench}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-sky-600/30 cursor-pointer flex items-center justify-center gap-2"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
            <span>Open Workbench</span>
          </button>

          <button
            onClick={() => onOpenAuth('register')}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-slate-200 font-semibold text-xs sm:text-sm transition-colors border border-[#334155] cursor-pointer"
            type="button"
          >
            Create Private Account
          </button>
        </div>
      </section>

      {/* 9. ENTERPRISE FOOTER */}
      <footer className="pt-8 border-t border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-mono font-bold text-[10px]">
            CT
          </div>
          <span className="font-semibold text-slate-300">ClearTrace Labs</span>
          <span>•</span>
          <span>Evidence-First Multi-Agent Truth Engine</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <button
            onClick={onLaunchWorkbench}
            className="hover:text-white transition-colors cursor-pointer"
            type="button"
          >
            Reconcile Workbench
          </button>
          <button
            onClick={onSwitchToDemo}
            className="hover:text-white transition-colors cursor-pointer"
            type="button"
          >
            Demo Sandbox
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Architecture &amp; Docs
          </a>
          <span className="text-slate-600">|</span>
          <span>© 2026 ClearTrace Labs</span>
        </div>
      </footer>
    </div>
  );
}
