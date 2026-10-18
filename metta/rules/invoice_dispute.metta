;; Operational Invoice Dispute Rules
(= (evaluate-invoice-quantity $po $inv $amd) (if (== $po $inv) (RULE_VERIFIED qty $inv) (CONTRADICTION qty $po $inv)))
