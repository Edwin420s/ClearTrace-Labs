<!-- ClearTrace Labs Documentation -->
# ClearTrace Labs — Cryptographic Audit & Replay Specification

## Abstract
This document formalizes the tamper-evident SHA-256 hash chaining and Merkle decision replay proofs implemented in ClearTrace Labs.

---

## 1. Tamper-Evident SHA-256 Event Chain

Every case operation (creation, isolated ingestion, agent extraction, negotiation round, MeTTa reduction, reviewer decision) is serialized and appended to an unalterable hash chain in SQLite (`audit_events`).

### Hash Chaining Formula
For block index $i \ge 0$:
$$\text{prev\_hash}_0 = \text{GENESIS\_HASH\_CLEARTRACE\_LABS\_00000000000000000000000000000000000000000000}$$
$$\text{curr\_hash}_i = \text{SHA-256}\left( i \parallel \text{case\_id} \parallel \text{timestamp} \parallel \text{event\_type} \parallel \text{actor} \parallel \text{details\_canonical\_json} \parallel \text{prev\_hash}_i \right)$$

If any attacker modifies any row in the database, recomputing the hash chain fails immediately at the tampered block:
$$\text{verify\_audit\_chain}(\text{case\_id}) \to (\text{False}, [\dots])$$

---

## 2. Decision Replay Certificates & Merkle Root

### Leaf Hashing
Leaves are generated for all sources, negotiation steps, and symbolic findings:
$$\text{Leaf}_k = \text{SHA-256}(\text{CanonicalJSON}(\text{Entity}_k))$$

### Merkle Tree Construction
Pairwise hashing reduces the leaves to a single 256-bit root:
$$\text{Parent}(L, R) = \text{SHA-256}(L \parallel \text{":"} \parallel R)$$
$$\text{merkle\_root} = \text{MerkleReduce}(\text{Leaves})$$

### Certificate Digest & Verification Hash
$$\text{decision\_digest} = \text{SHA-256}\left(\text{CanonicalJSON}\left(\{ \text{case\_id}, \text{domain}, \text{merkle\_root}, \text{rules\_signature}, \text{timestamp} \}\right)\right)$$
$$\text{verification\_hash} = \text{SHA-256}\left(\text{CanonicalJSON}\left(\{ \text{case\_id}, \text{domain}, \text{decision\_digest}, \text{merkle\_root}, \text{status}, \dots \}\right)\right)$$

### Offline Verification CLI
Judges and external auditors can verify any certificate offline in 1 line:
```bash
python3 scripts/verify_replay_cert.py [path_to_bundle.json]
```
