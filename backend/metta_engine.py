"""
ClearTrace Labs — Symbolic Reasoning Engine Adapter.
Re-exports the robust SymbolicReasoner from metta_runner for seamless backward compatibility.
"""

from backend.metta_runner import (
    SymbolicReasoner,
    MettaSpace,
    MettaInterpreter,
    HYPERON_AVAILABLE,
    CORE_RULES_PATH,
)

__all__ = ["SymbolicReasoner", "MettaSpace", "MettaInterpreter", "HYPERON_AVAILABLE", "CORE_RULES_PATH"]
