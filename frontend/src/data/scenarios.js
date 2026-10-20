// ClearTrace Labs — Sample Scenarios & Field Dictionaries

export const SAMPLE_SCENARIOS = [
  {
    id: 'peace',
    name: 'AI for Peace Oral History',
    badge: 'Track 02 · Challenge 4',
    partner: 'AI for Peace (Harlem / Nairobi)',
    challenge: 'Challenge 4: Two Agents, One Truth',
    subtitle: 'Conflicting Eyewitness Accounts of 1969 Peace Exchange',
    category: 'Cultural Archives',
    domain: 'peace',
    title: '1969 Harlem–Nairobi Cultural Peace Exchange',
    isSynthetic: true,
    sourceALabel: 'Harlem Cultural Archive (Interview Record A)',
    sourceAText: `HARLEM CULTURAL ARCHIVE - ORAL HISTORY CASSETTE #14
Interviewee: Elder Kofi Mensah (Recorded 1984, New York)
Subject: Transatlantic Cultural Peace Exchange

"The Transatlantic Cultural Peace Exchange convened at the Harlem Community Arts Hall on 1969-08-12.
Keynote speaker Dr. Marcus Kwame addressed 450 registered delegates.
The delegates signed the Harlem-Nairobi Cultural Solidarity Accord."`,
    sourceBLabel: 'Nairobi Chronicle Press Dispatch (Archival Record B)',
    sourceBText: `THE NAIROBI CHRONICLE - ORAL HISTORY CHRONICLE
Tape #14 Archival Reel

"Oral history tape #14 recalls the Transatlantic Cultural Peace Exchange at the Harlem Community Arts Hall beginning on 1969-08-19.
Dr. Marcus Kwame delivered the keynote speech before an estimated crowd of 600 attendees.
The session was preserved on East African Magnetic Reel #14."`,
    hasCorr: true,
    corrLabel: 'Official Printed Congress Programme (Neutral Ground Truth C)',
    corrText: `OFFICIAL PRINTED PROGRAMME: TRANSATLANTIC CULTURAL PEACE EXCHANGE
Opening Ceremony: 1969-08-12 at Harlem Community Arts Hall
Keynote Address: Dr. Marcus Kwame
Closing Plenary: 1969-08-19`,
    shortExplanation:
      'Two community accounts report conflicting dates (Aug 12 vs Aug 19) and attendance figures. ClearTrace refuses to hallucinate a compromise until contemporary printed evidence corroborates the opening ceremony.',
    evidenceGuidance: {
      date: 'Original printed contemporary programme or dated newspaper bulletin',
      attendance: 'Archival delegate registration ledger or photographic crowd count',
    },
    mettaCode: `!(import! &self ClearTraceHistoriography)

(add-atom &self (OralStatement (Source "Harlem") (Date "1969-08-12") (Quorum 450)))
(add-atom &self (ChronicleStatement (Source "Nairobi") (Date "1969-08-19") (Quorum 600)))

(= (evaluate-chronology $s1 $s2)
   (PreserveContradiction (DateVariance 7-days) (AttendanceSpread 150-delegates)))

!(evaluate-chronology &self-Oral &self-Chronicle)
;; OUTPUT: (PreserveContradiction (DateVariance 7-days) (Attribution Preserved))`
  },
  {
    id: 'rights',
    name: 'Incantio Music IP',
    badge: 'Track 02 · Challenge 2 & 7',
    partner: 'Incantio Music IP & Royalties',
    challenge: 'Challenge 2: The Agent That Grows Up & Challenge 7: Trusted With Money',
    subtitle: 'Signed Split Sheet vs. DSP Streaming Remittance',
    category: 'Commercial IP',
    domain: 'rights',
    title: 'Signed Studio Split Sheet vs DSP Royalty Statement',
    isSynthetic: true,
    sourceALabel: 'Signed Studio Split Sheet (Contract Record A)',
    sourceAText: `SPLIT AGREEMENT: TRACK "MIDNIGHT CIPHER" (ISRC: US-INC-26-00412)
Date: 12 March 2025
Parties:
- Producer: Marcus "K-Vibe" Omondi -> 50.0% Master & Publishing
- Vocalist: Sarah Jenkins -> 50.0% Master & Publishing
Territory: Worldwide
Eligible distributable revenue reported for Q3 2026: $12,000.00.`,
    sourceBLabel: 'DSP Royalty Statement Q3 2026 (Remittance Record B)',
    sourceBText: `DSP DISTRIBUTION REMITTANCE: Q3-2026
Track: "Midnight Cipher" (ISRC: US-INC-26-00412)
Eligible distributable revenue for Q3 2026: $12,000.00.
Co-Writer A allocated royalty share: 35.0% ($4,200.00 paid).
Territory applied: North America Only.
Variance Note: Distributor deduction for regional sub-publishing.`,
    hasCorr: true,
    corrLabel: 'Incantio Master Publishing License (3rd-Party Proof C)',
    corrText: `BMI WORK REGISTRATION TICKET #994218
Work: "Midnight Cipher" (ISRC: US-INC-26-00412)
Registered Owner: Marcus Omondi (50.000% Share Certified Worldwide)
Status: Active & Undisputed on $12,000.00 gross revenue.`,
    shortExplanation:
      'Contract promises 50% worldwide royalties ($6,000.00), but DSP paid only 35% ($4,200.00), leaving a 15.0 percentage-point gap and a verified $1,800.00 shortfall.',
    evidenceGuidance: {
      split: 'Countersigned publisher administration agreement or registered PRO split sheet',
      territory: 'Worldwide master sync release schedule or sub-publishing license waiver',
    },
    mettaCode: `!(import! &self ClearTraceMusic)

(add-atom &self (ContractShare (Track "Midnight Cipher") (Rate 0.50)))
(add-atom &self (DspRemittance (Track "Midnight Cipher") (Rate 0.35) (GrossPool 12000.0)))

(= (calculate-underpayment $track)
   (let* (($expected (* 12000.0 0.50))
          ($actual (* 12000.0 0.35)))
     (Dispute (Expected $expected) (Paid $actual) (Delta (- $expected $actual)))))

!(calculate-underpayment "Midnight Cipher")
;; OUTPUT: (Dispute (Expected 6000.0) (Paid 4200.0) (Delta 1800.0))`
  },
  {
    id: 'invoice',
    name: 'B2B Procurement & HFAS',
    badge: 'Track 02 · Challenge 1',
    partner: 'Harlem Fine Arts / Enterprise',
    challenge: 'Challenge 1: The Glass Box Agent',
    subtitle: 'Authorized Purchase Order vs. Supplier Invoice Line Items',
    category: 'Operations',
    domain: 'invoice',
    title: 'Purchase Order PO-2026-089 vs Supplier Invoice INV-2026-104',
    isSynthetic: true,
    sourceALabel: 'Purchase Order #PO-2026-089 (Authorized Record A)',
    sourceAText: `PURCHASE ORDER: PO-2026-089
Buyer: Nairobi County Education Directorate
Supplier: Savannah Craft Supplies Ltd
Date Authorized: 14 January 2026

LINE ITEMS:
1. Hardwood Drafting Boards (Grade-A)
   Quantity: 90 units
   Unit Price: KSh 500.00
   Line Subtotal: KSh 45,000.00

TERMS:
Net 30. Delivery to Central Warehouse Nairobi.
Authorized Signature: Director P. Mwangi`,
    sourceBLabel: 'Supplier Invoice #INV-2026-104 (Billing Record B)',
    sourceBText: `INVOICE: INV-2026-104
Supplier: Savannah Craft Supplies Ltd
Billed To: Nairobi County Education Directorate
Reference: PO-2026-089
Date Issued: 28 January 2026

BILLED ITEMS:
1. Hardwood Drafting Boards (Grade-A)
   Billed Qty: 100 units
   Unit Price: KSh 500.00
   Line Subtotal: KSh 50,000.00

TOTAL DUE: KSh 50,000.00
Bank Details: KCB Bank, Industrial Area Branch`,
    hasCorr: true,
    corrLabel: 'Approved Change Order Docket #A-02 (Neutral Evidence C)',
    corrText: `ADDENDUM / CHANGE ORDER: PO-2026-089-A2
Date: 20 January 2026
Authorized Increase: 10 additional drafting boards approved for delivery.
Signed: Procurement Oversight Board.`,
    shortExplanation:
      'Buyer authorized 90 units (KSh 45,000), but supplier billed for 100 units (KSh 50,000), creating a KSh 5,000 potential overcharge. Payment held pending authorized amendment.',
    evidenceGuidance: {
      quantity: 'Countersigned PO Amendment (PO-AMD) or Goods Received Note (GRN)',
      total: 'Credit Note from supplier or formal procurement board waiver',
    },
    mettaCode: `!(import! &self ClearTraceProcurement)

(add-atom &SpaceA (Claim (Document "PO-2026-089") (Prop "quantity") (Value 90)))
(add-atom &SpaceB (Claim (Document "INV-2026-104") (Prop "quantity") (Value 100)))

(= (reconcile $p $va $vb)
   (if (== $va $vb)
       (Agreed $p $va)
       (Dispute (Prop $p) (DocA $va) (DocB $vb) (Delta (- $vb $va)))))

!(reconcile "quantity" 90 100)
;; OUTPUT: (Dispute (Prop "quantity") (DocA 90) (DocB 100) (Delta 10))`
  },
  {
    id: 'custom',
    name: 'Custom Document Audit',
    badge: 'Enterprise Investigation',
    partner: 'Independent Multi-Tenant',
    challenge: 'Custom Multi-Agent Deliberation',
    subtitle: 'Upload or Paste Any Pair of Conflicting Records',
    category: 'Custom Domain',
    domain: 'general',
    title: 'Custom Document Reconciliation',
    isSynthetic: false,
    sourceALabel: 'First Document (Record A - e.g. Contract / PO)',
    sourceAText: `CONTRACT CLAUSE 14.1 (SERVICE LEVEL AGREEMENT)
Uptime Guarantee: 99.95% measured monthly.
Scheduled Maintenance: Sunday 02:00 UTC - 04:00 UTC.
Penalty Default: 15% billing credit per 0.1% breach.`,
    sourceBLabel: 'Second Document (Record B - e.g. Invoice / Report)',
    sourceBText: `MONTHLY OPS LOG - VENDOR RECONCILIATION
Reported Monthly Uptime: 99.40%
Maintenance Outage Claimed: Tuesday 14:00 UTC (Unscheduled)
Billing Credit Issued: 5.0% flat`,
    hasCorr: true,
    corrLabel: 'Optional Third Evidence (Record C - e.g. Telemetry / Addendum)',
    corrText: `INDEPENDENT TELEMETRY LOG
Measured Monthly Availability: 99.38%
P99 Outage Duration: 4h 12m`,
    shortExplanation:
      'Verifies contractual commitments against operational telemetry or performance records without hallucinating averages.',
    evidenceGuidance: {
      uptime: 'Independent telemetry log or external monitoring audit report',
      credit: 'Credit note or authorized billing reconciliation agreement',
    },
    mettaCode: `!(import! &self ClearTraceCustom)

(add-atom &self (CustomClaimA (Target 99.95)))
(add-atom &self (CustomClaimB (Reported 99.40)))

(= (evaluate-custom $a $b)
   (if (== $a $b) (Matched $a) (Disputed $a $b)))

!(evaluate-custom 99.95 99.40)
;; OUTPUT: (Disputed 99.95 99.40)`
  }
];

export const FIELD_NAMES = {
  authorized_quantity: 'Purchase Order Quantity',
  total_amount_ksh: 'Total Billed Amount',
  unit_price_ksh: 'Unit Price',
  po_reference: 'Purchase Order Reference',
  supplier_name: 'Supplier Name',
  split_percentage: 'Producer Royalty Percentage',
  eligible_revenue_usd: 'Total Streaming Revenue',
  isrc_code: 'Track ISRC Code',
  territory: 'Publishing Territory',
  work_id: 'Master Catalog ID',
  event_date: 'Event Opening Date',
  attendee_estimate: 'Attendee Count',
  event_title: 'Official Event Name',
  keynote_speaker: 'Keynote Speaker',
  venue: 'Venue Location',
  accord_signed: 'Signed Accord / Document',
  archival_medium: 'Recording Medium',
};

export const formatFieldName = (name) => {
  if (name === null || name === undefined) return 'Document Detail';
  const str = String(name);
  const clean = str.replace(/\(.*\)/, '').trim();
  if (FIELD_NAMES[clean]) return FIELD_NAMES[clean];
  return clean
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};
