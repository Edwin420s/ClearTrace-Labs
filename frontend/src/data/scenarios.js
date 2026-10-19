// ClearTrace Labs — Sample Scenarios & Field Dictionaries

export const SAMPLE_SCENARIOS = [
  {
    id: 'invoice',
    name: 'Procurement (90 vs 100 Units · KSh 5,000 Overcharge)',
    category: 'Operations',
    domain: 'invoice',
    title: 'Purchase Order PO-2026-089 vs Supplier Invoice INV-2026-104',
    isSynthetic: true,
    sourceALabel: 'Purchase Order #PO-2026-089 (Buyer)',
    sourceAText:
      '[SYNTHETIC PURCHASE ORDER] Purchase Order PO-2026-089 issued to Savannah Craft Supplies Ltd. Authorized order: 90 units at KSh 500.00 each. Total authorized: KSh 45,000.00.',
    sourceBLabel: 'Supplier Invoice #INV-2026-104 (Seller)',
    sourceBText:
      '[SYNTHETIC INVOICE] Invoice INV-2026-104 from Savannah Craft Supplies Ltd referencing PO-2026-089. Billed quantity: 100 units at KSh 500.00 each. Total billed: KSh 50,000.00.',
    hasCorr: true,
    corrLabel: 'Signed PO Amendment #PO-2026-089-AMD1',
    corrText:
      '[SYNTHETIC AMENDMENT] Signed PO Amendment #PO-2026-089-AMD1 approved quantity increase to 100 units with revised total of KSh 50,000.00.',
    shortExplanation:
      'The buyer ordered 90 units (KSh 45,000), but the supplier billed for 100 units (KSh 50,000), creating a KSh 5,000 potential overcharge.',
  },
  {
    id: 'rights',
    name: 'Music Royalties (50% vs 35% · $1,800 Missing)',
    category: 'Commercial IP',
    domain: 'rights',
    title: 'Signed Studio Split Sheet vs DSP Royalty Statement',
    isSynthetic: true,
    sourceALabel: 'Signed Studio Split Sheet (Contract)',
    sourceAText:
      '[SYNTHETIC SPLIT SHEET] Work ID: TRK-PEACE-ANTHEM-01 | ISRC: US-INC-26-00412. Co-Writer A (Nairobi Producer) agreed share: 50.0% of net distributable revenue. Territory: Worldwide. Eligible distributable revenue reported for Q3 2026: $12,000.00.',
    sourceBLabel: 'DSP Royalty Statement Q3 2026 (Remittance)',
    sourceBText:
      '[SYNTHETIC DSP STATEMENT] Work ID: TRK-PEACE-ANTHEM-01 | ISRC: US-INC-26-00412. Eligible distributable revenue for Q3 2026: $12,000.00. Co-Writer A allocated royalty share: 35.0% ($4,200.00 paid). Territory applied: North America Only.',
    hasCorr: true,
    corrLabel: 'Incantio Master Publishing License (3rd-Party Proof)',
    corrText:
      '[SYNTHETIC RECORD C] Master copyright registration confirms Co-Writer A agreed share is 50.0% worldwide on $12,000.00 gross revenue.',
    shortExplanation:
      'Contract specifies a 50% producer royalty ($6,000), but DSP remitted 35% ($4,200). Potential underpayment: $1,800 USD.',
  },
  {
    id: 'peace',
    name: 'Oral History (Aug 12 vs Aug 19 Event Dates)',
    category: 'Cultural Archives',
    domain: 'peace',
    title: '1969 Harlem–Nairobi Cultural Peace Exchange',
    isSynthetic: true,
    sourceALabel: 'Harlem Living Archive (Record A)',
    sourceAText:
      '[SYNTHETIC ARCHIVE A] The Transatlantic Cultural Peace Exchange convened at the Harlem Community Arts Hall on 1969-08-12. Keynote speaker Dr. Marcus Kwame addressed 450 registered delegates. The delegates signed the Harlem-Nairobi Cultural Solidarity Accord.',
    sourceBLabel: 'Nairobi Community Chronicle (Record B)',
    sourceBText:
      '[SYNTHETIC ARCHIVE B] Oral history tape #14 recalls the Transatlantic Cultural Peace Exchange at the Harlem Community Arts Hall beginning on 1969-08-19. Dr. Marcus Kwame delivered the keynote speech before an estimated crowd of 600 attendees. The session was preserved on East African Magnetic Reel #14.',
    hasCorr: true,
    corrLabel: 'Contemporaneous Printed Event Programme',
    corrText:
      '[SYNTHETIC CORROBORATING ARCHIVE C] Official Printed Programme: Transatlantic Cultural Peace Exchange, Opening Ceremony dated 1969-08-12 at Harlem Community Arts Hall.',
    shortExplanation:
      'Harlem records August 12 (450 delegates); Nairobi records August 19 (600 attendees). ClearTrace preserves both rather than hallucinating an average.',
  },
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
  if (!name) return 'Document Detail';
  const clean = name.replace(/\(.*\)/, '').trim();
  if (FIELD_NAMES[clean]) return FIELD_NAMES[clean];
  return clean
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};
