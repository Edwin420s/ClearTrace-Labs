;; ============================================================================
;; ClearTrace Labs — Operational Record Dispute Rules
;; Domain: Purchase Order vs Supplier Invoice Reconciliation
;; Rule Principle: Hard physical/financial lockout against unauthorized billing
;; ============================================================================

;; Evaluate billed quantity against PO and optional approved amendment
(= (evaluate-invoice-quantity $poQty $invQty $amendedQty)
   (if (== $poQty $invQty)
       (RULE_VERIFIED authorized_quantity $invQty)
       (if (== $amendedQty $invQty)
           (EVIDENCE_SUPPORTED authorized_quantity $invQty "Approved_Amendment_Verified")
           (CONTRADICTION authorized_quantity $poQty $invQty))))

;; Calculate excess billed units
(= (calculate-excess-units $poQty $invQty)
   (- $invQty $poQty))

;; Calculate financial variance in local currency (KSh)
(= (calculate-disputed-amount $excessUnits $unitPrice)
   (* $excessUnits $unitPrice))
