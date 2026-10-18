;; Incantio Rights & Royalty Rules
(= (evaluate-royalty-split $agreed $reported) (if (== $agreed $reported) (RULE_VERIFIED split $agreed) (CONTRADICTION split $agreed $reported)))
