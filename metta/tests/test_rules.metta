;; ============================================================================
;; ClearTrace Labs — MeTTa Native Verification Queries
;; ============================================================================

!(import! &self types)
!(import! &self ../rules/core_reconciliation)
!(import! &self ../rules/peace_narrative)
!(import! &self ../rules/incantio_rights)
!(import! &self ../rules/invoice_dispute)

;; 1. Agreement query
!(classify-claims "venue" "Harlem Arts Hall" "Harlem Arts Hall" "NONE" "Harlem Arts Hall")

;; 2. Contradiction query
!(classify-claims "event_date" "1969-08-12" "1969-08-19" "NONE" "1969-08-12")

;; 3. Corroborated query
!(classify-claims "event_date" "1969-08-12" "1969-08-19" "1969-08-12" "1969-08-12")

;; 4. False consensus rejection (source truth mismatch)
!(classify-claims "unit_price" "600" "600" "NONE" "500")

;; 5. Source exclusive query
!(classify-exclusive "accord_signed" "Source_A" "Harlem-Nairobi Accord")

;; 6. Royalty split contradiction
!(evaluate-royalty-split 50.0 35.0)

;; 7. Invoice quantity contradiction & resolution with amendment
!(evaluate-invoice-quantity 90 100 90)
!(evaluate-invoice-quantity 90 100 100)
