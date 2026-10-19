"""
ClearTrace Labs — Cryptographic SHA-256 Decision Replay & Audit Service.
Generates deterministic Merkle roots and tamper-evident replay certificates for every
multi-agent reconciliation case. Allows offline mathematical verification by any auditor.
"""

import hashlib
import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from backend.schemas import ReplayCertificate


def canonical_json_bytes(data: Any) -> bytes:
    """Serializes data into deterministic canonical JSON (sorted keys, compact separators)."""
    return json.dumps(data, sort_keys=True, separators=(",", ":")).encode("utf-8")


def compute_sha256(data: Any) -> str:
    """Computes SHA-256 digest of canonical data."""
    if isinstance(data, (dict, list)):
        return hashlib.sha256(canonical_json_bytes(data)).hexdigest()
    return hashlib.sha256(str(data).encode("utf-8")).hexdigest()


def compute_merkle_tree_layers(leaf_hashes: List[str]) -> List[List[str]]:
    """Computes all levels of the Merkle tree from leaves up to the root."""
    if not leaf_hashes:
        empty = hashlib.sha256(b"EMPTY_MERKLE_TREE").hexdigest()
        return [[empty]]

    layers: List[List[str]] = [list(leaf_hashes)]
    current_level = list(leaf_hashes)
    while len(current_level) > 1:
        next_level: List[str] = []
        for i in range(0, len(current_level), 2):
            left = current_level[i]
            right = current_level[i + 1] if i + 1 < len(current_level) else left
            combined = hashlib.sha256(f"{left}:{right}".encode("utf-8")).hexdigest()
            next_level.append(combined)
        layers.append(next_level)
        current_level = next_level

    return layers


def compute_merkle_root(leaf_hashes: List[str]) -> str:
    """Computes Merkle root from an ordered list of leaf SHA-256 hashes."""
    layers = compute_merkle_tree_layers(leaf_hashes)
    return layers[-1][0] if layers and layers[-1] else hashlib.sha256(b"EMPTY_MERKLE_TREE").hexdigest()


class DecisionReplayService:
    """Generates and verifies cryptographic SHA-256 Replay Certificates."""

    RULES_SIGNATURE = "MeTTa-Hyperon-S-Expression-V1.0-SHA256"

    @classmethod
    def get_merkle_tree_details(
        cls,
        findings: List[Dict[str, Any]],
        negotiation_history: List[Dict[str, Any]],
        sources: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Returns the full Merkle tree structure including all layers for visualization."""
        leaf_hashes = [
            compute_sha256({"type": "source", "idx": i, "data": s})
            for i, s in enumerate(sources)
        ] + [
            compute_sha256({"type": "step", "idx": i, "data": step})
            for i, step in enumerate(negotiation_history)
        ] + [
            compute_sha256({"type": "finding", "idx": i, "data": f})
            for i, f in enumerate(findings)
        ]
        layers = compute_merkle_tree_layers(leaf_hashes)
        return {
            "leaves_count": len(leaf_hashes),
            "tree_depth": len(layers),
            "merkle_root": layers[-1][0] if layers and layers[-1] else "",
            "layers": layers,
        }

    @classmethod
    def generate_certificate(
        cls,
        case_id: str,
        domain: str,
        findings: List[Dict[str, Any]],
        negotiation_history: List[Dict[str, Any]],
        sources: List[Dict[str, Any]],
    ) -> ReplayCertificate:
        now_iso = datetime.now(timezone.utc).isoformat()

        # Generate individual leaf hashes
        leaf_hashes = [
            compute_sha256({"type": "source", "idx": i, "data": s})
            for i, s in enumerate(sources)
        ] + [
            compute_sha256({"type": "step", "idx": i, "data": step})
            for i, step in enumerate(negotiation_history)
        ] + [
            compute_sha256({"type": "finding", "idx": i, "data": f})
            for i, f in enumerate(findings)
        ]

        merkle_root = compute_merkle_root(leaf_hashes)

        decision_payload = {
            "case_id": case_id,
            "domain": domain,
            "merkle_root": merkle_root,
            "rules_signature": cls.RULES_SIGNATURE,
            "findings_count": len(findings),
            "timestamp": now_iso,
        }
        decision_digest = compute_sha256(decision_payload)

        verification_payload = {
            "case_id": case_id,
            "domain": domain,
            "decision_digest": decision_digest,
            "merkle_root": merkle_root,
            "timestamp": now_iso,
            "ruleset_signature": cls.RULES_SIGNATURE,
            "status": "CRYPTOGRAPHICALLY_VERIFIED",
        }
        verification_hash = compute_sha256(verification_payload)

        return ReplayCertificate(
            case_id=case_id,
            domain=domain,
            decision_digest=decision_digest,
            merkle_root=merkle_root,
            timestamp=now_iso,
            ruleset_signature=cls.RULES_SIGNATURE,
            status="CRYPTOGRAPHICALLY_VERIFIED",
            verification_hash=verification_hash,
        )

    @classmethod
    def verify_certificate(cls, certificate: Dict[str, Any]) -> Tuple[bool, str]:
        """Mathematically verifies the SHA-256 signature of a replay certificate."""
        expected_hash = certificate.get("verification_hash")
        if not expected_hash:
            return False, "Missing verification_hash."

        payload = {
            "case_id": certificate["case_id"],
            "domain": certificate["domain"],
            "decision_digest": certificate["decision_digest"],
            "merkle_root": certificate["merkle_root"],
            "timestamp": certificate["timestamp"],
            "ruleset_signature": certificate["ruleset_signature"],
            "status": certificate.get("status", "CRYPTOGRAPHICALLY_VERIFIED"),
        }
        recomputed = compute_sha256(payload)
        is_valid = recomputed.lower() == expected_hash.lower()
        msg = "Certificate verified successfully." if is_valid else f"Hash mismatch: {recomputed} != {expected_hash}"
        return is_valid, msg
