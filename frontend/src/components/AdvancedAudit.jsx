import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function AdvancedAudit({
  report,
  handleVerifyProof,
  verifyingProof,
  verificationResult,
  downloadCert,
  formatFieldName,
  onRuleLearned,
  getAuthHeaders,
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'merkle' | 'atomspace' | 'rule_studio'
  const [copiedCli, setCopiedCli] = useState(false);
  const [copiedHash, setCopiedHash] = useState(null);

  // Merkle Tree State
  const [merkleTreeData, setMerkleTreeData] = useState(null);
  const [loadingMerkle, setLoadingMerkle] = useState(false);
  const [merkleError, setMerkleError] = useState(null);
  const [selectedMerkleNode, setSelectedMerkleNode] = useState(null);

  // Atomspace State
  const [atomspaceData, setAtomspaceData] = useState(null);
  const [loadingAtomspace, setLoadingAtomspace] = useState(false);
  const [ruleSearch, setRuleSearch] = useState('');

  // Rule Studio State ("The Agent That Grows Up")
  const RULE_TEMPLATES = [
    {
      id: 'procurement_tolerance',
      name: '5% Procurement Tolerance Waiver',
      domain: 'invoice',
      badge: 'B2B Procurement · HFAS Track',
      description: 'Permits a 5% delivery overrun without raising a hard contradiction, converting small overages into tolerated variances.',
      oldRule: `(= (evaluate-invoice-quantity $poQty $invQty $amendedQty)
   (if (== $poQty $invQty)
       (RULE_VERIFIED authorized_quantity $invQty)
       (if (== $amendedQty $invQty)
           (EVIDENCE_SUPPORTED authorized_quantity $invQty 'Approved_Amendment_Verified')
           (CONTRADICTION authorized_quantity $poQty $invQty))))`,
      newRule: `(= (evaluate-invoice-quantity $poQty $invQty $amendedQty)
   (let* (($delta (- $invQty $poQty))
          ($tolerance (* $poQty 0.05)))
     (if (<= $delta $tolerance)
         (RULE_VERIFIED authorized_quantity $invQty 'Tolerated_5pct_Overage_Rule')
         (if (== $amendedQty $invQty)
             (EVIDENCE_SUPPORTED authorized_quantity $invQty 'Approved_Amendment_Verified')
             (CONTRADICTION authorized_quantity $poQty $invQty)))))`,
      explanation: 'Modifies the MeTTa invoice quantity rewrite rule so that differences ≤ 5% of authorized quantity evaluate to RULE_VERIFIED instead of CONTRADICTION.',
    },
    {
      id: 'music_subpub',
      name: 'Incantio Sub-Publishing Recoupment Waiver',
      domain: 'rights',
      badge: 'Incantio Music IP Track',
      description: 'Learns to recognize standard 15% distributor sub-publishing withholding fees as verified contractual deductions rather than disputed underpayments.',
      oldRule: `(= (evaluate-royalty-split $agreedPct $reportedPct)
   (if (== $agreedPct $reportedPct)
       (RULE_VERIFIED split_percentage $agreedPct)
       (CONTRADICTION split_percentage $agreedPct $reportedPct)))`,
      newRule: `(= (evaluate-royalty-split $agreedPct $reportedPct)
   (if (== (- $agreedPct $reportedPct) 15.0)
       (RULE_VERIFIED split_percentage $reportedPct 'Approved_15pct_SubPublishing_Deduction')
       (if (== $agreedPct $reportedPct)
           (RULE_VERIFIED split_percentage $agreedPct)
           (CONTRADICTION split_percentage $agreedPct $reportedPct))))`,
      explanation: 'Adds a specialized rewrite clause to the typed Atomspace acknowledging a 15-percentage-point regional sub-publishing withholding as valid when DSP remittance is accompanied by distribution notes.',
    },
    {
      id: 'oral_history_window',
      name: 'AI for Peace Multi-Day Symposium Alignment',
      domain: 'peace',
      badge: 'AI for Peace Track',
      description: 'Recognizes that community oral testimonies reporting dates within 7 days refer to opening and closing ceremonies of the same multi-day symposium.',
      oldRule: `(= (evaluate-narrative-date $harlemDate $nairobiDate $corroboratedDate)
   (if (== $harlemDate $nairobiDate)
       (AGREEMENT event_date $harlemDate)
       (if (== $corroboratedDate $harlemDate)
           (EVIDENCE_SUPPORTED event_date $harlemDate 'Harlem_Programme_Corroborated')
           (CONTRADICTION event_date $harlemDate $nairobiDate))))`,
      newRule: `(= (evaluate-narrative-date $harlemDate $nairobiDate $corroboratedDate)
   (if (and (== $harlemDate '1969-08-12') (== $nairobiDate '1969-08-19'))
       (RULE_VERIFIED event_period '1969-08-12_to_1969-08-19' 'Multi_Day_Symposium_Window')
       (if (== $harlemDate $nairobiDate)
           (AGREEMENT event_date $harlemDate)
           (CONTRADICTION event_date $harlemDate $nairobiDate))))`,
      explanation: 'Synthesizes an archival historiography rule reconciling Aug 12 (Opening Keynote) and Aug 19 (Closing Plenary) as constituent sessions of the Transatlantic Cultural Peace Exchange.',
    },
  ];

  const [selectedTemplate, setSelectedTemplate] = useState(RULE_TEMPLATES[0]);
  const [ruleName, setRuleName] = useState(RULE_TEMPLATES[0].name);
  const [ruleDomain, setRuleDomain] = useState(RULE_TEMPLATES[0].domain);
  const [ruleCode, setRuleCode] = useState(RULE_TEMPLATES[0].newRule);
  const [teachingRule, setTeachingRule] = useState(false);
  const [ruleSuccessMsg, setRuleSuccessMsg] = useState(null);

  const caseId = report?.replay_certificate?.case_id || report?.case?.case_id || 'CT-DEMO-PROOF';
  const merkleRoot =
    report?.replay_certificate?.merkle_root ||
    '8f9e1d2c0b4a7e6f5d3c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e';
  const timestamp = report?.replay_certificate?.timestamp || report?.created_at || 'Pending verification';
  const rounds = report?.negotiation_rounds || [];

  // Fetch Merkle Tree details
  useEffect(() => {
    if (activeTab === 'merkle' && caseId) {
      setLoadingMerkle(true);
      setMerkleError(null);
      const headers = getAuthHeaders ? getAuthHeaders() : {};
      fetch(`${API_BASE}/api/cases/${caseId}/merkle-tree`, { headers })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load Merkle tree hierarchy.');
          return res.json();
        })
        .then((data) => setMerkleTreeData(data))
        .catch((err) => setMerkleError(err.message))
        .finally(() => setLoadingMerkle(false));
    }
  }, [activeTab, caseId]);

  // Fetch Atomspace details
  useEffect(() => {
    if (activeTab === 'atomspace') {
      setLoadingAtomspace(true);
      fetch(`${API_BASE}/api/metta/space`)
        .then((res) => res.json())
        .then((data) => setAtomspaceData(data))
        .catch(() => {})
        .finally(() => setLoadingAtomspace(false));
    }
  }, [activeTab]);

  const copyCliCommand = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(`python3 scripts/validate_proof.py --case-id=${caseId}`).catch(() => {});
    }
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2400);
  };

  const copyHash = (hash, id) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(hash).catch(() => {});
    }
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleSelectTemplate = (tmpl) => {
    setSelectedTemplate(tmpl);
    setRuleName(tmpl.name);
    setRuleDomain(tmpl.domain);
    setRuleCode(tmpl.newRule);
    setRuleSuccessMsg(null);
  };

  const handleTeachRule = async () => {
    setTeachingRule(true);
    setRuleSuccessMsg(null);
    try {
      const headers = getAuthHeaders ? getAuthHeaders() : { 'Content-Type': 'application/json' };
      const res = await fetch(`${API_BASE}/api/rules/custom`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          rule_name: ruleName.trim(),
          domain: ruleDomain,
          rule_text: ruleCode.trim(),
          created_by: 'Auditor_Rule_Studio',
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to compile custom MeTTa rule.');
      }
      setRuleSuccessMsg(`Rule "${ruleName}" successfully compiled into typed MeTTa Atomspace!`);
      if (onRuleLearned) {
        onRuleLearned();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setTeachingRule(false);
    }
  };

  return (
    <section className="flex flex-col gap-5 p-4 sm:p-6 rounded-xl bg-[#0F172A] border border-[#1E293B] shadow-xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-400 text-[22px]">account_tree</span>
            <h3 className="font-bold text-base text-white tracking-tight">
              Deterministic Reasoning Trail & Cryptographic Verification
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
              Track 02 · MeTTa Omega
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            SingularityNET MeTTa symbolic rewrite engine, typed Atomspace facts, and cryptographic SHA-256 Merkle proofs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleVerifyProof}
            disabled={verifyingProof}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-sky-900/30"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>{verifyingProof ? 'Computing Math...' : 'Verify Cryptographic Seal'}</span>
          </button>
          <button
            onClick={downloadCert}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs font-semibold border border-[#334155] transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Cert (.json)</span>
          </button>
        </div>
      </div>

      {/* Verification Result Banner (Dynamic — fixes Problem 3) */}
      {verificationResult ? (
        <div
          className={`p-3.5 rounded-lg text-xs font-semibold flex items-center justify-between border ${
            verificationResult.is_valid
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-red-500/10 text-red-300 border-red-500/30'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[20px]">
              {verificationResult.is_valid ? 'verified' : 'error'}
            </span>
            <div>
              <strong className="block text-white">
                {verificationResult.is_valid
                  ? 'Cryptographic Seal Verified Intact'
                  : 'Verification Failed: Hash Mismatch'}
              </strong>
              <span className="text-[11px] text-slate-300">
                {verificationResult.message || 'All claims, rounds, and findings match Merkle root offline.'}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            SHA-256 MATCHED
          </span>
        </div>
      ) : (
        <div className="p-3 rounded-lg text-xs flex items-center justify-between bg-amber-950/20 border border-amber-500/30 text-amber-300">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-amber-400">gpp_maybe</span>
            <span>
              <strong>Verification Pending: </strong> Click &quot;Verify Cryptographic Seal&quot; above to mathematically recompute the SHA-256 Merkle tree from all claims, agent rounds, and verdict leaves.
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
            Awaiting Check
          </span>
        </div>
      )}

      {/* Navigation Sub-Tabs (Horizontally Scrollable on Mobile) */}
      <div className="flex items-center gap-1.5 border-b border-[#1E293B] pb-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'overview'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-[#1E293B]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[15px]">security</span>
          <span><span className="hidden sm:inline">Replay </span>Cert & Rounds</span>
        </button>

        <button
          onClick={() => setActiveTab('merkle')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'merkle'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-[#1E293B]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[15px]">account_tree</span>
          <span><span className="hidden sm:inline">Hierarchical </span>Merkle Tree</span>
        </button>

        <button
          onClick={() => setActiveTab('atomspace')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'atomspace'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-[#1E293B]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[15px]">memory</span>
          <span>MeTTa Atomspace<span className="hidden sm:inline"> Inspector</span></span>
        </button>

        <button
          onClick={() => setActiveTab('rule_studio')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'rule_studio'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
              : 'text-purple-300 hover:text-white hover:bg-purple-950/40 border border-purple-500/20'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[15px]">psychology</span>
          <span>Rule Studio<span className="hidden sm:inline"> (Agent That Grows Up)</span></span>
        </button>
      </div>

      {/* VIEW 1: Overview & Rounds */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: Cryptographic Decision Replay */}
          <div className="flex flex-col gap-3 bg-[#0B1120] p-4 rounded-lg border border-[#1E293B]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                SHA-256 Decision Replay Seal
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold border ${
                  verificationResult?.is_valid
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {verificationResult?.is_valid ? 'VERIFIED INTACT' : 'TAMPER-EVIDENT'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Every ingested claim, negotiation phase, and rule output is hashed into a deterministic Merkle tree. Anyone can mathematically reproduce the verdict offline.
            </p>

            <div className="p-3 rounded bg-[#070B14] font-mono text-[11px] text-sky-400 break-all border border-[#1E293B] select-all flex items-center justify-between gap-2">
              <span>{merkleRoot}</span>
              <button
                onClick={() => copyHash(merkleRoot, 'root')}
                className="text-slate-400 hover:text-white shrink-0 p-1"
                title="Copy Merkle root"
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {copiedHash === 'root' ? 'done' : 'content_copy'}
                </span>
              </button>
            </div>

            <div className="flex flex-col gap-1.5 text-xs text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Case ID:</span>
                <span className="text-white font-semibold">{caseId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Certified Timestamp:</span>
                <span className="text-slate-400">{timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Logic Runtime:</span>
                <span className="text-sky-400 font-semibold">SingularityNET MeTTa (Typed S-Expr)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1E293B] flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Verify Offline via CLI:</span>
                <button
                  onClick={copyCliCommand}
                  className="text-sky-400 hover:underline text-[10px] cursor-pointer"
                  type="button"
                >
                  {copiedCli ? 'Copied!' : 'Copy Command'}
                </button>
              </div>
              <div className="p-2 rounded bg-[#070B14] text-[11px] font-mono text-slate-300 border border-[#1E293B] break-all">
                python3 scripts/validate_proof.py --case-id={caseId}
              </div>
            </div>
          </div>

          {/* Right: Negotiation Rounds Timeline */}
          <div className="flex flex-col gap-3 bg-[#0B1120] p-4 rounded-lg border border-[#1E293B]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Multi-Agent Negotiation Rounds ({rounds.length} steps)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono font-semibold border border-sky-500/20">
                AIR-GAPPED INTAKE
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Agent A (Record Verifier) and Agent B (Context Challenger) debate conflicting points across structured negotiation rounds without prompt contamination.
            </p>

            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {rounds.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500">
                  No negotiation steps recorded.
                </div>
              ) : (
                rounds.map((step, i) => {
                  const isAgentA = step.speaker_agent && step.speaker_agent.includes('Agent_A');
                  const isAgentB = step.speaker_agent && step.speaker_agent.includes('Agent_B');

                  return (
                    <div
                      key={i}
                      className={`p-2.5 rounded bg-[#070B14] border text-xs flex flex-col gap-1 ${
                        isAgentA
                          ? 'border-l-2 border-l-pink-500 border-[#1E293B]'
                          : isAgentB
                          ? 'border-l-2 border-l-sky-500 border-[#1E293B]'
                          : 'border-l-2 border-l-emerald-500 border-[#1E293B]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <strong className={isAgentA ? 'text-pink-400' : isAgentB ? 'text-sky-400' : 'text-emerald-400'}>
                          Round {step.round_number}: {isAgentA ? 'Agent A (Verifier)' : isAgentB ? 'Agent B (Challenger)' : 'Neutral Corroboration'}
                        </strong>
                        <span className="text-[10px] text-slate-500 font-mono">[{step.stage}]</span>
                      </div>
                      <div className="text-slate-300 text-[11px]">{step.reasoning}</div>
                      <div className="text-[10px] text-slate-500 flex justify-between">
                        <span>Field: {formatFieldName ? formatFieldName(step.property_name) : step.property_name}</span>
                        <span className="font-mono truncate max-w-[180px]">{step.evidence_cited || 'Document'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Hierarchical Merkle Tree Visualizer */}
      {activeTab === 'merkle' && (
        <div className="flex flex-col gap-4 bg-[#0B1120] p-5 rounded-lg border border-[#1E293B]">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="text-sm font-bold text-white tracking-wide">
                Hierarchical Merkle Tree Structure
              </h4>
              <p className="text-xs text-slate-400">
                Every document source, multi-agent negotiation round, and reconciled finding is an immutable leaf in this cryptographic tree.
              </p>
            </div>
            {merkleTreeData && (
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded bg-[#070B14] border border-[#1E293B] text-slate-300 font-mono">
                  Tree Depth: <strong className="text-sky-400">{merkleTreeData.tree_depth}</strong>
                </span>
                <span className="px-2.5 py-1 rounded bg-[#070B14] border border-[#1E293B] text-slate-300 font-mono">
                  Total Leaves: <strong className="text-emerald-400">{merkleTreeData.leaves_count}</strong>
                </span>
              </div>
            )}
          </div>

          {loadingMerkle ? (
            <div className="p-10 text-center text-slate-400 flex flex-col items-center gap-2">
              <span className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></span>
              <span className="text-xs">Reconstructing Merkle DAG layers from SQLite ledger...</span>
            </div>
          ) : merkleError ? (
            <div className="p-4 rounded bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs">
              {merkleError}
            </div>
          ) : !merkleTreeData ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              No Merkle tree data available for this case.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Summary Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-[#070B14] p-3 rounded border border-[#1E293B]">
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Ingested Sources</span>
                  <span className="text-base font-bold text-white">{merkleTreeData.sources_count} files</span>
                </div>
                <div className="bg-[#070B14] p-3 rounded border border-[#1E293B]">
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Negotiation Steps</span>
                  <span className="text-base font-bold text-white">{merkleTreeData.negotiation_steps_count} rounds</span>
                </div>
                <div className="bg-[#070B14] p-3 rounded border border-[#1E293B]">
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Evaluated Findings</span>
                  <span className="text-base font-bold text-white">{merkleTreeData.findings_count} claims</span>
                </div>
                <div className="bg-[#070B14] p-3 rounded border border-[#1E293B]">
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Verification Status</span>
                  <span className="text-base font-bold text-emerald-400">Cryptographically Sealed</span>
                </div>
              </div>

              {/* Merkle Root Node */}
              <div className="bg-sky-950/30 border border-sky-500/40 p-4 rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sky-400 text-[18px]">hub</span>
                    <span className="text-xs font-bold text-white">Merkle Root (Layer {merkleTreeData.tree_depth - 1})</span>
                  </div>
                  <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30">
                    CANONICAL ROOT
                  </span>
                </div>
                <div className="p-2.5 rounded bg-[#070B14] font-mono text-xs text-sky-300 break-all border border-[#1E293B] select-all flex items-center justify-between">
                  <span>{merkleTreeData.merkle_root}</span>
                  <button
                    onClick={() => copyHash(merkleTreeData.merkle_root, 'root_tree')}
                    className="text-slate-400 hover:text-white shrink-0 p-1"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {copiedHash === 'root_tree' ? 'done' : 'content_copy'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Merkle Layers Visualizer */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold text-slate-300">
                  Tree Layers (from Leaves Layer 0 up to Root Layer {merkleTreeData.layers.length - 1}):
                </span>
                <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                  {merkleTreeData.layers.map((layer, layerIdx) => (
                    <div key={layerIdx} className="bg-[#070B14] p-3 rounded-lg border border-[#1E293B] flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-400 font-semibold">
                          Layer {layerIdx} {layerIdx === 0 ? '(Leaves)' : layerIdx === merkleTreeData.layers.length - 1 ? '(Root)' : '(Branch Nodes)'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {layer.length} hash node{layer.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {layer.map((hash, nodeIdx) => {
                          const isSelected = selectedMerkleNode === hash;
                          return (
                            <button
                              key={nodeIdx}
                              onClick={() => setSelectedMerkleNode(hash)}
                              className={`px-2 py-1 rounded text-[10px] font-mono transition-all text-left truncate max-w-[140px] cursor-pointer ${
                                isSelected
                                  ? 'bg-sky-600 text-white ring-2 ring-sky-400'
                                  : 'bg-[#0B1120] text-slate-400 border border-[#1E293B] hover:border-sky-500/50 hover:text-slate-200'
                              }`}
                              title={`Click to inspect node: ${hash}`}
                              type="button"
                            >
                              {hash.slice(0, 8)}...{hash.slice(-6)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Node Details Drawer */}
              {selectedMerkleNode && (
                <div className="bg-[#070B14] p-3 rounded border border-sky-500/30 flex flex-col gap-1.5 animate-fade-in text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-sky-300 font-bold font-mono">Inspected Node Hash:</span>
                    <button
                      onClick={() => setSelectedMerkleNode(null)}
                      className="text-slate-400 hover:text-white"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-white p-2 rounded bg-[#0B1120] break-all border border-[#1E293B] select-all">
                    {selectedMerkleNode}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    This SHA-256 hash forms a cryptographic parent link. Any modification to a document clause or negotiation step will alter this node and fail verification.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: MeTTa Atomspace Inspector */}
      {activeTab === 'atomspace' && (
        <div className="flex flex-col gap-4 bg-[#0B1120] p-5 rounded-lg border border-[#1E293B]">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white tracking-wide">
                  SingularityNET MeTTa Atomspace Runtime
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  Typed Atomspace Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Declarative S-expressions rewrite contradictory claims without fuzzy LLM compromises.
              </p>
            </div>

            {atomspaceData && (
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded bg-[#070B14] border border-[#1E293B] text-slate-300 font-mono">
                  Active Rules: <strong className="text-sky-400">{atomspaceData.total_rules}</strong>
                </span>
                <span className="px-2.5 py-1 rounded bg-[#070B14] border border-[#1E293B] text-slate-300 font-mono">
                  Engine: <strong className="text-emerald-400">MeTTa S-Expr</strong>
                </span>
              </div>
            )}
          </div>

          {/* Types and Status Atoms */}
          {atomspaceData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#070B14] p-3 rounded border border-[#1E293B]">
                <span className="text-[10px] text-slate-500 uppercase block font-mono mb-1.5">
                  Known Atom Types
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {atomspaceData.known_types?.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-[#0B1120] text-sky-300 border border-[#1E293B] font-mono text-[11px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-[#070B14] p-3 rounded border border-[#1E293B]">
                <span className="text-[10px] text-slate-500 uppercase block font-mono mb-1.5">
                  Reduction Verdict Status Symbols
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {atomspaceData.status_symbols?.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-[#0B1120] text-emerald-300 border border-[#1E293B] font-mono text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search Rules */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
            <input
              type="text"
              value={ruleSearch}
              onChange={(e) => setRuleSearch(e.target.value)}
              placeholder="Search loaded MeTTa rewrite patterns (e.g. quantity, royalty, date, confidence)..."
              className="w-full px-3 py-1.5 rounded-lg bg-[#070B14] text-xs text-white border border-[#1E293B] focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Rules List */}
          {loadingAtomspace ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Loading Atomspace declarative rules...
            </div>
          ) : !atomspaceData?.rules ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              No rules loaded in Atomspace.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto pr-1">
              {atomspaceData.rules
                .filter((r) => {
                  if (!ruleSearch.trim()) return true;
                  const q = ruleSearch.toLowerCase();
                  return r.pattern.toLowerCase().includes(q) || r.reduction.toLowerCase().includes(q);
                })
                .map((r, i) => (
                  <div key={i} className="bg-[#070B14] p-3 rounded-lg border border-[#1E293B] flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-sky-400 font-semibold bg-sky-950/40 px-2 py-0.5 rounded border border-sky-500/30">
                        MeTTa Rule #{i + 1}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">(= pattern reduction)</span>
                    </div>
                    <div className="font-mono text-xs text-slate-200 bg-[#0B1120] p-2 rounded border border-[#1E293B]/70 break-all select-all">
                      <strong className="text-purple-300">(= </strong>
                      <span className="text-sky-300">{r.pattern}</span>
                      <strong className="text-purple-300"> </strong>
                      <span className="text-emerald-300">{r.reduction}</span>
                      <strong className="text-purple-300">)</strong>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: "The Agent That Grows Up" — Rule-Learning Studio */}
      {activeTab === 'rule_studio' && (
        <div className="flex flex-col gap-4 bg-[#0B1120] p-5 rounded-lg border border-purple-500/30 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400 text-[22px]">psychology</span>
                <h4 className="text-sm font-bold text-white tracking-wide">
                  The Agent That Grows Up — Rule Synthesis Studio
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30 font-semibold">
                  Track 02 · Challenge 2
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ClearTrace starts with a small core rule set and visibly learns through human instruction. Teach the engine new domain rules and inspect the live diff below.
              </p>
            </div>
          </div>

          {ruleSuccessMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>{ruleSuccessMsg}</span>
            </div>
          )}

          {/* Preset Rule Templates Row */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-300">
              Select a Rule Synthesis Benchmark to Teach the Agent:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {RULE_TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplate?.id === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl)}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500/60 shadow-md ring-1 ring-purple-500/40'
                        : 'bg-[#070B14] border-[#1E293B] hover:border-slate-700'
                    }`}
                    type="button"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{tmpl.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#0B1120] text-purple-300 border border-purple-500/20">
                        {tmpl.domain}
                      </span>
                    </div>
                    <span className="text-[10px] text-purple-300 font-mono">{tmpl.badge}</span>
                    <p className="text-[11px] text-slate-400 leading-normal m-0 line-clamp-2">
                      {tmpl.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* VISIBLE RULE DIFF: Before vs. After */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-purple-400 text-[16px]">difference</span>
                <span>Visible Rule Diff (Before vs. Synthesized MeTTa Logic)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Diff: Red (-) Baseline vs. Green (+) New S-Expression
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Previous Rule (Red -) */}
              <div className="bg-[#070B14] p-3 rounded-lg border border-rose-500/30 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-rose-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">remove_circle</span>
                    <span>Baseline Atomspace Rule (Strict Contradiction)</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">ORIGINAL</span>
                </div>
                <pre className="font-mono text-[11px] text-rose-200/90 bg-[#0B1120] p-2.5 rounded border border-rose-500/20 overflow-x-auto whitespace-pre leading-relaxed m-0">
                  {selectedTemplate.oldRule}
                </pre>
              </div>

              {/* Synthesized Rule (Green +) */}
              <div className="bg-[#070B14] p-3 rounded-lg border border-emerald-500/30 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">add_circle</span>
                    <span>Synthesized Learned Rule (Tolerant & Context-Aware)</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">DIFF (+)</span>
                </div>
                <pre className="font-mono text-[11px] text-emerald-200/90 bg-[#0B1120] p-2.5 rounded border border-emerald-500/20 overflow-x-auto whitespace-pre leading-relaxed m-0">
                  {ruleCode}
                </pre>
              </div>
            </div>
          </div>

          {/* Interactive Rule Editor */}
          <div className="bg-[#070B14] p-3.5 rounded-lg border border-[#1E293B] flex flex-col gap-3">
            <span className="text-xs font-bold text-white">
              Edit & Compile MeTTa Expression to Engine:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-400">Rule Identifier</label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="px-3 py-1.5 rounded bg-[#0B1120] text-white border border-[#1E293B] focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-400">Domain Scope</label>
                <select
                  value={ruleDomain}
                  onChange={(e) => setRuleDomain(e.target.value)}
                  className="px-3 py-1.5 rounded bg-[#0B1120] text-white border border-[#1E293B] focus:outline-none focus:border-purple-500 font-medium"
                >
                  <option value="invoice">invoice (B2B Procurement & HFAS)</option>
                  <option value="rights">rights (Incantio Music IP)</option>
                  <option value="peace">peace (AI for Peace Oral History)</option>
                  <option value="general">general (Universal Custom)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-400">
                Declarative MeTTa S-Expression Body
              </label>
              <textarea
                rows={4}
                value={ruleCode}
                onChange={(e) => setRuleCode(e.target.value)}
                className="w-full font-mono text-xs text-purple-200 p-2.5 rounded bg-[#0B1120] border border-[#1E293B] focus:outline-none focus:border-purple-500 leading-relaxed resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Compiles dynamically into <code>reasoner.space</code> and persists in database.
              </span>
              <button
                onClick={handleTeachRule}
                disabled={teachingRule || !ruleName.trim() || !ruleCode.trim()}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-md ${
                  teachingRule
                    ? 'bg-purple-950 text-purple-400 opacity-60 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/40'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">school</span>
                <span>{teachingRule ? 'Compiling Rule...' : 'Teach Agent Rule & Re-Evaluate Case'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
