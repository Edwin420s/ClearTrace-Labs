"""
Clearly Labelled Synthetic Demonstration Presets for ClearTrace Labs.
Strictly adheres to Hackathon Rule 05 (Data & Consent): all records are clearly
marked as synthetic demonstration archives.
"""

from typing import Any, Dict

PRESETS: Dict[str, Dict[str, Any]] = {
    "peace": {
        "preset_id": "peace",
        "domain": "peace",
        "badge": "Primary Brief — AI for Peace (Harlem ↔ Nairobi)",
        "title": "[SYNTHETIC DEMO] 1969 Harlem–Nairobi Cultural Peace Exchange",
        "description": (
            "Two community archives describe the same cross-cultural peace gathering. "
            "They agree on the event title, venue, and keynote speaker, but disagree on the start date "
            "and attendee numbers, while each records a unique source-exclusive detail."
        ),
        "sources": [
            {
                "label": "Harlem Living Archive (Synthetic Record A)",
                "source_role": "source_a",
                "raw_text": (
                    "[SYNTHETIC ARCHIVE A] The Transatlantic Cultural Peace Exchange convened at the "
                    "Harlem Community Arts Hall on 1969-08-12. Keynote speaker Dr. Marcus Kwame addressed "
                    "450 registered delegates. The delegates signed the Harlem-Nairobi Cultural Solidarity Accord."
                ),
                "structured_claims": [
                    {
                        "entity": "exchange_1969",
                        "property_name": "event_title",
                        "value": "Transatlantic Cultural Peace Exchange",
                        "evidence_ref": "Harlem Box 4, Fol. 2, Para 1",
                        "original_text": "The Transatlantic Cultural Peace Exchange convened...",
                    },
                    {
                        "entity": "exchange_1969",
                        "property_name": "venue",
                        "value": "Harlem Community Arts Hall",
                        "evidence_ref": "Harlem Box 4, Fol. 2, Para 1",
                        "original_text": "...at the Harlem Community Arts Hall...",
                    },
                    {
                        "entity": "exchange_1969",
                        "property_name": "start_date",
                        "value": "1969-08-12",
                        "evidence_ref": "Harlem Box 4, Fol. 2, Para 1",
                        "original_text": "...convened on 1969-08-12.",
                    },
                    {
                        "entity": "exchange_1969",
                        "property_name": "keynote_speaker",
                        "value": "Dr. Marcus Kwame",
                        "evidence_ref": "Harlem Box 4, Fol. 2, Para 2",
                        "original_text": "Keynote speaker Dr. Marcus Kwame addressed...",
                    },
                    {
                        "entity": "exchange_1969",
                        "property_name": "attendee_estimate",
                        "value": "450 registered delegates",
                        "evidence_ref": "Harlem Box 4, Fol. 2, Para 2",
                        "original_text": "...addressed 450 registered delegates.",
                    },
                    {
                        "entity": "exchange_1969",
                        "property_name": "accord_signed",
                        "value": "Harlem-Nairobi Cultural Solidarity Accord",
                        "evidence_ref": "Harlem Box 4, Fol. 2, Para 3",
                        "original_text": "The delegates signed the Harlem-Nairobi Cultural Solidarity Accord.",
                    },
                ],
                "metadata": {"synthetic_demo": True, "origin_city": "New York"},
            },
            {
                "label": "Nairobi Oral History Chronicle (Synthetic Record B)",
                "source_role": "source_b",
                "raw_text": (
                    "[SYNTHETIC ARCHIVE B] Oral history tape #14 recalls the Transatlantic Cultural Peace Exchange "
                    "at the Harlem Community Arts Hall beginning on 1969-08-19. Dr. Marcus Kwame delivered the "
                    "keynote speech before an estimated crowd of 600 attendees. The session was preserved on "
                    "East African Magnetic Reel #14."
                ),
                "structured_claims": [
                    {
                        "entity": "exchange_1969",
                        "property_name": "event_title",
                        "value": "Transatlantic Cultural Peace Exchange",
                        "evidence_ref": "Nairobi Tape #14, 02:15",
                        "original_text": "...recalls the Transatlantic Cultural Peace Exchange...",
                    },
                    {
                        "entity": "exchange_1969",
                        "property_name": "venue",
                        "value": "Harlem Community Arts Hall",
                        "evidence_ref": "Nairobi Tape #14, 02:40",
                        "original_text": "...at the Harlem Community Arts Hall...",
                    },
                    {
                        "entity": "exchange_1969",
                        "property_name": "start_date",
                        "value": "1969-08-19",
                        "evidence_ref": "Nairobi Tape #14, 03:10",
                        "original_text": "...beginning on 1969-08-19.",
                    },
                    {
                        "entity": "exchange_1969",
                        "property_name": "keynote_speaker",
                        "value": "Dr. Marcus Kwame",
                        "evidence_ref": "Nairobi Tape #14, 04:05",
                        "original_text": "Dr. Marcus Kwame delivered the keynote speech...",
                    },
                    {
                        "entity": "exchange_1969",
                        "property_name": "attendee_estimate",
                        "value": "600 attendees (estimate)",
                        "evidence_ref": "Nairobi Tape #14, 05:12",
                        "original_text": "...before an estimated crowd of 600 attendees.",
                    },
                    {
                        "entity": "exchange_1969",
                        "property_name": "recording_medium",
                        "value": "East African Magnetic Reel #14",
                        "evidence_ref": "Nairobi Tape #14, 06:00",
                        "original_text": "The session was preserved on East African Magnetic Reel #14.",
                    },
                ],
                "metadata": {"synthetic_demo": True, "origin_city": "Nairobi"},
            },
            {
                "label": "Contemporaneous Printed Event Programme (Optional 3rd Evidence)",
                "source_role": "corroboration",
                "raw_text": (
                    "[SYNTHETIC ARCHIVE C] Official Printed Programme: Transatlantic Cultural Peace Exchange, "
                    "Opening Ceremony dated 1969-08-12 at Harlem Community Arts Hall."
                ),
                "structured_claims": [
                    {
                        "entity": "exchange_1969",
                        "property_name": "start_date",
                        "value": "1969-08-12",
                        "evidence_ref": "Printed Programme Cover, Line 3",
                        "original_text": "Opening Ceremony dated 1969-08-12",
                    }
                ],
                "metadata": {"synthetic_demo": True},
            },
        ],
    },
    "rights": {
        "preset_id": "rights",
        "domain": "rights",
        "badge": "Partner Brief — Incantio Music Split & Royalty Audit",
        "title": "[SYNTHETIC DEMO] Incantio Co-Write Split Sheet vs. DSP Royalty Statement",
        "description": (
            "Compares a signed studio session split sheet (50% co-writer share) against a quarterly "
            "distributor royalty statement (35% allocated share) on $12,000 eligible distributable revenue."
        ),
        "sources": [
            {
                "label": "Incantio Signed Studio Split Sheet (Synthetic Agreement v1)",
                "source_role": "source_a",
                "raw_text": (
                    "[SYNTHETIC SPLIT SHEET] Work ID: TRK-PEACE-ANTHEM-01 | ISRC: US-INC-26-00412. "
                    "Co-Writer A (Nairobi Producer) agreed share: 50.0% of net distributable revenue. "
                    "Territory: Worldwide. Sync licensing: Pre-cleared via Incantio. "
                    "Eligible distributable revenue reported for Q3 2026: $12,000.00."
                ),
                "structured_claims": [
                    {
                        "entity": "TRK-PEACE-ANTHEM-01",
                        "property_name": "work_id",
                        "value": "TRK-PEACE-ANTHEM-01",
                        "evidence_ref": "Split Sheet Clause 1.1",
                        "original_text": "Work ID: TRK-PEACE-ANTHEM-01",
                    },
                    {
                        "entity": "TRK-PEACE-ANTHEM-01",
                        "property_name": "isrc_code",
                        "value": "US-INC-26-00412",
                        "evidence_ref": "Split Sheet Clause 1.2",
                        "original_text": "ISRC: US-INC-26-00412",
                    },
                    {
                        "entity": "TRK-PEACE-ANTHEM-01",
                        "property_name": "split_percentage",
                        "value": 50.0,
                        "evidence_ref": "Split Sheet Clause 2.1 (Signed in Session)",
                        "original_text": "Co-Writer A agreed share: 50.0% of net distributable revenue.",
                    },
                    {
                        "entity": "TRK-PEACE-ANTHEM-01",
                        "property_name": "territory",
                        "value": "Worldwide",
                        "evidence_ref": "Split Sheet Clause 3.1",
                        "original_text": "Territory: Worldwide.",
                    },
                    {
                        "entity": "TRK-PEACE-ANTHEM-01",
                        "property_name": "eligible_revenue_usd",
                        "value": 12000.0,
                        "evidence_ref": "Split Sheet Schedule A (Q3 2026)",
                        "original_text": "Eligible distributable revenue reported for Q3 2026: $12,000.00.",
                    },
                ],
                "metadata": {"synthetic_demo": True},
            },
            {
                "label": "DSP Settlement Statement Q3 2026 (Synthetic Statement B)",
                "source_role": "source_b",
                "raw_text": (
                    "[SYNTHETIC DSP STATEMENT] Work ID: TRK-PEACE-ANTHEM-01 | ISRC: US-INC-26-00412. "
                    "Eligible distributable revenue for Q3 2026: $12,000.00. "
                    "Co-Writer A allocated royalty share: 35.0% ($4,200.00 paid). "
                    "Territory applied: North America Only."
                ),
                "structured_claims": [
                    {
                        "entity": "TRK-PEACE-ANTHEM-01",
                        "property_name": "work_id",
                        "value": "TRK-PEACE-ANTHEM-01",
                        "evidence_ref": "Statement Line 10",
                        "original_text": "Work ID: TRK-PEACE-ANTHEM-01",
                    },
                    {
                        "entity": "TRK-PEACE-ANTHEM-01",
                        "property_name": "isrc_code",
                        "value": "US-INC-26-00412",
                        "evidence_ref": "Statement Line 11",
                        "original_text": "ISRC: US-INC-26-00412",
                    },
                    {
                        "entity": "TRK-PEACE-ANTHEM-01",
                        "property_name": "split_percentage",
                        "value": 35.0,
                        "evidence_ref": "Statement Line 14 (Royalty Allocation)",
                        "original_text": "Co-Writer A allocated royalty share: 35.0% ($4,200.00 paid).",
                    },
                    {
                        "entity": "TRK-PEACE-ANTHEM-01",
                        "property_name": "territory",
                        "value": "North America Only",
                        "evidence_ref": "Statement Line 18 (Territory Filter)",
                        "original_text": "Territory applied: North America Only.",
                    },
                    {
                        "entity": "TRK-PEACE-ANTHEM-01",
                        "property_name": "eligible_revenue_usd",
                        "value": 12000.0,
                        "evidence_ref": "Statement Line 12",
                        "original_text": "Eligible distributable revenue for Q3 2026: $12,000.00.",
                    },
                ],
                "metadata": {"synthetic_demo": True},
            },
        ],
    },
    "invoice": {
        "preset_id": "invoice",
        "domain": "invoice",
        "badge": "Registered Problem Case — Purchase Order vs. Supplier Invoice",
        "title": "[SYNTHETIC DEMO] Purchase Order (90 Units) vs. Supplier Invoice (100 Units)",
        "description": (
            "Your original registered ClearTrace scenario: Purchase Order PO-2026-089 authorizes 90 units "
            "at KSh 500/unit (KSh 45,000), while Supplier Invoice INV-8847 bills 100 units at KSh 500/unit "
            "(KSh 50,000) — a 10-unit / KSh 5,000 disputed variance."
        ),
        "sources": [
            {
                "label": "Authorized Purchase Order PO-2026-089 (Source A)",
                "source_role": "source_a",
                "raw_text": (
                    "[SYNTHETIC PO] Purchase Order: PO-2026-089 | Supplier: Savannah Craft Supplies Ltd. "
                    "Item SKU: CANVAS-ROLL-XL. Authorized Quantity: 90 units. "
                    "Agreed Unit Price: KSh 500. Authorized Total: KSh 45,000."
                ),
                "structured_claims": [
                    {
                        "entity": "PO-2026-089",
                        "property_name": "po_reference",
                        "value": "PO-2026-089",
                        "evidence_ref": "PO Header Block",
                        "original_text": "Purchase Order: PO-2026-089",
                    },
                    {
                        "entity": "PO-2026-089",
                        "property_name": "supplier_name",
                        "value": "Savannah Craft Supplies Ltd",
                        "evidence_ref": "PO Vendor Field",
                        "original_text": "Supplier: Savannah Craft Supplies Ltd.",
                    },
                    {
                        "entity": "PO-2026-089",
                        "property_name": "authorized_quantity",
                        "value": 90,
                        "evidence_ref": "PO Line Item 1 (Quantity)",
                        "original_text": "Authorized Quantity: 90 units.",
                    },
                    {
                        "entity": "PO-2026-089",
                        "property_name": "unit_price_ksh",
                        "value": 500,
                        "evidence_ref": "PO Line Item 1 (Unit Price)",
                        "original_text": "Agreed Unit Price: KSh 500.",
                    },
                    {
                        "entity": "PO-2026-089",
                        "property_name": "total_amount_ksh",
                        "value": 45000,
                        "evidence_ref": "PO Footer Total",
                        "original_text": "Authorized Total: KSh 45,000.",
                    },
                ],
                "metadata": {"synthetic_demo": True},
            },
            {
                "label": "Supplier Invoice INV-8847 (Source B)",
                "source_role": "source_b",
                "raw_text": (
                    "[SYNTHETIC INVOICE] Invoice: INV-8847 referencing PO-2026-089 | Supplier: Savannah Craft Supplies Ltd. "
                    "Billed Quantity: 100 units. Unit Price: KSh 500. Billed Total: KSh 50,000."
                ),
                "structured_claims": [
                    {
                        "entity": "PO-2026-089",
                        "property_name": "po_reference",
                        "value": "PO-2026-089",
                        "evidence_ref": "Invoice Ref Field",
                        "original_text": "referencing PO-2026-089",
                    },
                    {
                        "entity": "PO-2026-089",
                        "property_name": "supplier_name",
                        "value": "Savannah Craft Supplies Ltd",
                        "evidence_ref": "Invoice Header",
                        "original_text": "Supplier: Savannah Craft Supplies Ltd.",
                    },
                    {
                        "entity": "PO-2026-089",
                        "property_name": "authorized_quantity",
                        "value": 100,
                        "evidence_ref": "Invoice Line 1 (Billed Qty)",
                        "original_text": "Billed Quantity: 100 units.",
                    },
                    {
                        "entity": "PO-2026-089",
                        "property_name": "unit_price_ksh",
                        "value": 500,
                        "evidence_ref": "Invoice Line 1 (Price)",
                        "original_text": "Unit Price: KSh 500.",
                    },
                    {
                        "entity": "PO-2026-089",
                        "property_name": "total_amount_ksh",
                        "value": 50000,
                        "evidence_ref": "Invoice Total Due",
                        "original_text": "Billed Total: KSh 50,000.",
                    },
                ],
                "metadata": {"synthetic_demo": True},
            },
            {
                "label": "Signed PO Amendment #PO-2026-089-AMD1 (Optional 3rd Evidence)",
                "source_role": "corroboration",
                "raw_text": (
                    "[SYNTHETIC AMENDMENT] Approved Order Amendment #PO-2026-089-AMD1: "
                    "Increases authorized_quantity to 100 units and total_amount_ksh to KSh 50,000."
                ),
                "structured_claims": [
                    {
                        "entity": "PO-2026-089",
                        "property_name": "authorized_quantity",
                        "value": 100,
                        "evidence_ref": "Amendment Clause 1",
                        "original_text": "Increases authorized_quantity to 100 units",
                    },
                    {
                        "entity": "PO-2026-089",
                        "property_name": "total_amount_ksh",
                        "value": 50000,
                        "evidence_ref": "Amendment Clause 2",
                        "original_text": "and total_amount_ksh to KSh 50,000.",
                    },
                ],
                "metadata": {"synthetic_demo": True},
            },
        ],
    },
}
