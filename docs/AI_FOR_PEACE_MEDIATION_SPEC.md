<!-- ClearTrace Labs Documentation -->
# ClearTrace Labs — AI for Peace Narrative Mediation Specification

**Track 02 Partner Brief**: AI for Peace  
**Brief Requirement**: *"Two communities’ accounts of one event, mediated to one story."*  
**Problem Context**: Harlem Fine Arts Show (HFAS) 2026 Archive & Nairobi Oral History Exchange  

---

## 1. The Core Sociotechnical Problem

When two historical archives or community memories describe a shared event, differences routinely emerge regarding dates, attendees, locations, or formal accords. 

### Why Standard Generative AI Fails:
Standard Large Language Models (LLMs) operate by probabilistic token generation. When given two conflicting statements:
- *Source A*: "Event commenced August 12, 1969 with 300 delegates."
- *Source B*: "Event commenced August 14, 1969 with 80 delegates."

A typical generative LLM frequently invents a synthetic compromise:
> *"The event likely began on August 13 with approximately 190 participants..."*

This **hallucinated middle ground erases historical truth**, falsifies community memory, and invalidates cultural provenance.

### The ClearTrace Labs Symbolic Solution:
ClearTrace Labs replaces generative approximation with **SingularityNET Hyperon / MeTTa symbolic deduction**:
1. **Preserve Contradictions**: Disputed facts remain marked `CONTRADICTION` with zero value synthesis unless independent evidence is verified.
2. **Attribute Unilateral Claims**: Facts reported by only one community are classified `SOURCE_EXCLUSIVE` to preserve archival uniqueness.
3. **Resolve Via Corroboration**: When a third independent historical record (such as an original printed event programme) is introduced, the system transitions to `EVIDENCE_SUPPORTED` with full citation.

---

## 2. MeTTa Knowledge Representation

### Symbolic Atom Types:
```metta
(: Entity Type)
(: Property Type)
(: Value Type)
(: CommunityArchive Type)

;; Define Archives
(CommunityArchive HarlemArchive)
(CommunityArchive NairobiArchive)
(CommunityArchive ThirdPartyArchivalProgramme)
```

### Reduction Axioms:
```metta
;; Preserved Contradiction Rule
(= (classify-claims $prop $valA $valB () $truth)
   (if (== $valA $valB)
       (AGREEMENT $prop $valA)
       (CONTRADICTION $prop $valA $valB)))

;; Third-Party Corroboration Rule
(= (classify-claims $prop $valA $valB $corroboratedVal $truth)
   (if (== $valA $valB)
       (AGREEMENT $prop $valA)
       (if (== $corroboratedVal $valA)
           (EVIDENCE_SUPPORTED $prop $valA "Harlem_Corroborated_By_Programme")
           (if (== $corroboratedVal $valB)
               (EVIDENCE_SUPPORTED $prop $valB "Nairobi_Corroborated_By_Programme")
               (CONTRADICTION $prop $valA $valB)))))
```

---

## 3. The 5 Synthetic Demonstration Properties

ClearTrace Labs includes a synthetic dataset modeling the 1969 Harlem–Nairobi Cultural Peace Exchange:

| Property | Harlem Source (Agent A) | Nairobi Source (Agent B) | 3rd Source (Event Programme) | Reconciled Finding |
| :--- | :--- | :--- | :--- | :--- |
| `venue` | Studio Museum Harlem | Studio Museum Harlem | Studio Museum Harlem | `AGREEMENT` |
| `event_date` | 1969-08-12 | 1969-08-14 | 1969-08-12 | `CONTRADICTION` (Rounds 1–2) $\to$ `EVIDENCE_SUPPORTED` (Round 3) |
| `attendee_estimate` | 300 delegates | 80 delegates | N/A | `CONTRADICTION` (Dispute Preserved) |
| `accord_signed` | True | *Not Mentioned* | N/A | `SOURCE_EXCLUSIVE` (Harlem Archive) |
| `archival_medium` | *Not Mentioned* | 16mm Reel Audio | N/A | `SOURCE_EXCLUSIVE` (Nairobi Archive) |

---

## 4. Glass-Box Attribution

In the ClearTrace Labs user interface, reviewers can click on any property finding to inspect:
- The exact quote and archival citation from Agent A
- The exact quote and archival citation from Agent B
- The step-by-step MeTTa rewrite trace showing how the rule arrived at `CONTRADICTION` or `EVIDENCE_SUPPORTED`
- The SHA-256 Merkle leaf hash for independent cryptographic verification.
