"""
ClearTrace Labs — Dual-Runtime MeTTa Symbolic Reasoning Engine.
Supports native SingularityNET Hyperon (if installed) alongside an embedded
pure-symbolic MeTTa S-expression parser and reduction engine with full
trace inspection and dynamic rule learning.
"""

from __future__ import annotations
import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

try:
    from hyperon import MeTTa as HyperonMeTTa
    HYPERON_AVAILABLE = True
except ImportError:
    HYPERON_AVAILABLE = False

BASE_DIR = Path(__file__).resolve().parent.parent
RULES_DIR = BASE_DIR / "metta" / "rules"
CORE_RULES_PATH = RULES_DIR / "core_reconciliation.metta"
ENGINE_RULES_FALLBACK = BASE_DIR / "engine" / "cleartrace_rules.metta"


# ==============================================================================
# S-Expression AST & Types for Embedded MeTTa Engine
# ==============================================================================

class Atom:
    pass


class Symbol(Atom):
    def __init__(self, name: str) -> None:
        self.name = name

    def __repr__(self) -> str:
        return self.name

    def __eq__(self, other: Any) -> bool:
        return isinstance(other, Symbol) and self.name == other.name

    def __hash__(self) -> int:
        return hash(self.name)


class Variable(Atom):
    def __init__(self, name: str) -> None:
        self.name = name

    def __repr__(self) -> str:
        return f"${self.name}"

    def __eq__(self, other: Any) -> bool:
        return isinstance(other, Variable) and self.name == other.name

    def __hash__(self) -> int:
        return hash(self.name)


class Expression(Atom):
    def __init__(self, children: List[Any]) -> None:
        self.children = children

    def __repr__(self) -> str:
        return "(" + " ".join(repr(c) for c in self.children) + ")"

    def __eq__(self, other: Any) -> bool:
        return isinstance(other, Expression) and self.children == other.children


def tokenize(text: str) -> List[str]:
    cleaned_lines = []
    for line in text.splitlines():
        line = re.sub(r";.*$", "", line)
        cleaned_lines.append(line)
    cleaned = " ".join(cleaned_lines)

    tokens: List[str] = []
    current: List[str] = []
    in_quote = False
    quote_char = ""

    for ch in cleaned:
        if ch in ('"', "'"):
            if in_quote and ch == quote_char:
                in_quote = False
                current.append(ch)
                tokens.append("".join(current))
                current = []
            elif not in_quote:
                in_quote = True
                quote_char = ch
                current.append(ch)
            else:
                current.append(ch)
        elif in_quote:
            current.append(ch)
        elif ch in ("(", ")"):
            if current:
                tokens.append("".join(current))
                current = []
            tokens.append(ch)
        elif ch.isspace():
            if current:
                tokens.append("".join(current))
                current = []
        else:
            current.append(ch)
    if current:
        tokens.append("".join(current))
    return tokens


def parse_tokens(tokens: List[str]) -> List[Any]:
    def parse_one(idx: int) -> Tuple[Any, int]:
        if idx >= len(tokens):
            return None, idx
        token = tokens[idx]
        if token == "(":
            idx += 1
            children = []
            while idx < len(tokens) and tokens[idx] != ")":
                child, idx = parse_one(idx)
                if child is not None:
                    children.append(child)
            return Expression(children), idx + 1
        elif token == ")":
            return None, idx + 1
        elif token.startswith("$"):
            return Variable(token[1:]), idx + 1
        else:
            if token.lower() == "true":
                return True, idx + 1
            if token.lower() == "false":
                return False, idx + 1
            if (token.startswith('"') and token.endswith('"')) or (token.startswith("'") and token.endswith("'")):
                return token[1:-1], idx + 1
            try:
                if "." in token:
                    return float(token), idx + 1
                return int(token), idx + 1
            except ValueError:
                return Symbol(token), idx + 1

    expressions = []
    i = 0
    while i < len(tokens):
        if tokens[i] == "!":
            i += 1
            expr, i = parse_one(i)
            if expr:
                expressions.append(("query", expr))
        else:
            expr, i = parse_one(i)
            if expr:
                expressions.append(("def", expr))
    return expressions


# ==============================================================================
# MeTTa Atomspace & Interpreter
# ==============================================================================

class MettaSpace:
    def __init__(self) -> None:
        self.rules: List[Tuple[Any, Any]] = []
        self.facts: List[Any] = []

    def load_file(self, filepath: str | Path) -> None:
        path = Path(filepath)
        if not path.is_file():
            return
        text = path.read_text(encoding="utf-8")
        parsed = parse_tokens(tokenize(text))
        for _, expr in parsed:
            if isinstance(expr, Expression) and len(expr.children) >= 3 and expr.children[0] == Symbol("="):
                head = expr.children[1]
                body = expr.children[2]
                self.rules.append((head, body))
            else:
                self.facts.append(expr)

    def add_rule_string(self, rule_text: str) -> None:
        parsed = parse_tokens(tokenize(rule_text))
        for _, expr in parsed:
            if isinstance(expr, Expression) and len(expr.children) >= 3 and expr.children[0] == Symbol("="):
                head = expr.children[1]
                body = expr.children[2]
                self.rules.insert(0, (head, body))
            else:
                self.facts.append(expr)


class MettaInterpreter:
    def __init__(self, space: MettaSpace) -> None:
        self.space = space
        self.trace_steps: List[Dict[str, Any]] = []

    def pattern_match(self, pattern: Any, target: Any, bindings: Dict[str, Any]) -> bool:
        if isinstance(pattern, Variable):
            var_name = pattern.name
            if var_name in bindings:
                return bindings[var_name] == target
            bindings[var_name] = target
            return True
        elif isinstance(pattern, Symbol) and isinstance(target, Symbol):
            return pattern.name.lower() == target.name.lower()
        elif isinstance(pattern, Expression) and isinstance(target, Expression):
            if len(pattern.children) != len(target.children):
                return False
            for p, t in zip(pattern.children, target.children):
                if not self.pattern_match(p, t, bindings):
                    return False
            return True
        elif type(pattern) == type(target):
            return pattern == target
        return False

    def substitute(self, expr: Any, bindings: Dict[str, Any]) -> Any:
        if isinstance(expr, Variable):
            return bindings.get(expr.name, expr)
        elif isinstance(expr, Expression):
            return Expression([self.substitute(c, bindings) for c in expr.children])
        return expr

    def evaluate(self, expr: Any) -> Any:
        if not isinstance(expr, Expression):
            return expr

        children = expr.children
        if not children:
            return expr

        head = children[0]

        # Builtin: if
        if head == Symbol("if"):
            if len(children) >= 4:
                cond = self.evaluate(children[1])
                branch = "then" if cond else "else"
                self.trace_steps.append({
                    "type": "CONDITION_EVAL",
                    "expression": repr(children[1]),
                    "result": bool(cond),
                    "branch": branch,
                })
                return self.evaluate(children[2]) if cond else self.evaluate(children[3])

        # Builtin: and
        if head == Symbol("and"):
            for child in children[1:]:
                res = self.evaluate(child)
                if not res:
                    return False
            return True

        # Builtin: or
        if head == Symbol("or"):
            for child in children[1:]:
                res = self.evaluate(child)
                if res:
                    return True
            return False

        # Builtin: not
        if head == Symbol("not"):
            if len(children) >= 2:
                return not bool(self.evaluate(children[1]))

        # Builtin: ==
        if head == Symbol("=="):
            if len(children) >= 3:
                left = self.evaluate(children[1])
                right = self.evaluate(children[2])
                return self._equal(left, right)

        # Builtin: !=
        if head == Symbol("!="):
            if len(children) >= 3:
                left = self.evaluate(children[1])
                right = self.evaluate(children[2])
                return not self._equal(left, right)

        # Builtin Arithmetic: -, +, *, /
        if head in (Symbol("-"), Symbol("+"), Symbol("*"), Symbol("/")):
            if len(children) >= 3:
                lval = float(self.evaluate(children[1]))
                rval = float(self.evaluate(children[2]))
                if head == Symbol("-"):
                    return lval - rval
                elif head == Symbol("+"):
                    return lval + rval
                elif head == Symbol("*"):
                    return lval * rval
                elif head == Symbol("/"):
                    return lval / rval if rval != 0 else 0.0

        # Pattern match against Space rewrite rules
        for r_head, r_body in self.space.rules:
            bindings: Dict[str, Any] = {}
            if self.pattern_match(r_head, expr, bindings):
                substituted_body = self.substitute(r_body, bindings)
                self.trace_steps.append({
                    "type": "REWRITE_RULE_MATCH",
                    "rule_head": repr(r_head),
                    "matched_expression": repr(expr),
                    "bindings": {k: str(v) for k, v in bindings.items()},
                    "reduced_to": repr(substituted_body),
                })
                return self.evaluate(substituted_body)

        return expr

    @staticmethod
    def _equal(a: Any, b: Any) -> bool:
        if a is None and b is None:
            return True
        if a is None or b is None:
            return False
        if isinstance(a, (int, float)) and isinstance(b, (int, float)):
            return abs(float(a) - float(b)) < 1e-6
        sa = str(a).strip().lower()
        sb = str(b).strip().lower()
        return sa == sb


# ==============================================================================
# Symbolic Reasoner Service (Dual Native / Embedded Engine)
# ==============================================================================

class SymbolicReasoner:
    """Dual-runtime MeTTa engine supporting Hyperon and pure symbolic S-expressions."""
    """Executes symbolic truth classification with MeTTa rules and trace generation."""

    def __init__(self) -> None:
        self.hyperon_active = HYPERON_AVAILABLE
        self.space = MettaSpace()
        self._load_knowledge_base()

    def _load_knowledge_base(self) -> None:
        # Load all available metta rule files
        if RULES_DIR.exists():
            for rule_file in sorted(RULES_DIR.glob("*.metta")):
                self.space.load_file(rule_file)
        elif ENGINE_RULES_FALLBACK.exists():
            self.space.load_file(ENGINE_RULES_FALLBACK)

    def evaluate_claim_pair(
        self,
        prop: str,
        val_a: Optional[Any],
        val_b: Optional[Any],
        corroborated_val: Optional[Any] = None,
        source_truth_val: Optional[Any] = None,
        custom_rules: Optional[List[str]] = None,
    ) -> Tuple[str, str, str, List[Dict[str, Any]]]:
        """
        Returns:
            (status, metta_query_expression, raw_output, trace_steps)
        """
        norm_a = self._norm(val_a)
        norm_b = self._norm(val_b)
        norm_corr = self._norm(corroborated_val) if corroborated_val is not None else "NONE"
        norm_truth = self._norm(source_truth_val) if source_truth_val is not None else norm_a

        # Unilateral check
        if val_a is not None and val_b is None:
            expr_str = f'!(classify-exclusive "{prop}" "Source_A" "{norm_a}")'
            raw_out = f'[(SOURCE_EXCLUSIVE "{prop}" "Source_A" "{norm_a}")]'
            trace = [{"type": "SOURCE_EXCLUSIVE_CHECK", "property": prop, "source": "Source_A", "value": norm_a}]
            return "SOURCE_EXCLUSIVE", expr_str, raw_out, trace

        if val_b is not None and val_a is None:
            expr_str = f'!(classify-exclusive "{prop}" "Source_B" "{norm_b}")'
            raw_out = f'[(SOURCE_EXCLUSIVE "{prop}" "Source_B" "{norm_b}")]'
            trace = [{"type": "SOURCE_EXCLUSIVE_CHECK", "property": prop, "source": "Source_B", "value": norm_b}]
            return "SOURCE_EXCLUSIVE", expr_str, raw_out, trace

        if val_a is None and val_b is None:
            expr_str = f'!(classify-missing "{prop}")'
            raw_out = f'[(INSUFFICIENT_EVIDENCE "{prop}")]'
            trace = [{"type": "INSUFFICIENT_EVIDENCE", "property": prop}]
            return "INSUFFICIENT_EVIDENCE", expr_str, raw_out, trace

        expr_str = (
            f'!(classify-claims "{prop}" "{norm_a}" "{norm_b}" '
            f'"{norm_corr}" "{norm_truth}")'
        )

        # Use embedded pure-symbolic MeTTa interpreter with trace steps
        temp_space = MettaSpace()
        temp_space.rules = list(self.space.rules)
        temp_space.facts = list(self.space.facts)

        if custom_rules:
            for cr in custom_rules:
                temp_space.add_rule_string(cr)

        interpreter = MettaInterpreter(temp_space)
        parsed_query = parse_tokens(tokenize(expr_str))

        if parsed_query and parsed_query[0][0] == "query":
            reduced = interpreter.evaluate(parsed_query[0][1])
            raw_out = f"[{repr(reduced)}]"
        else:
            raw_out = "[(UNKNOWN)]"

        trace = list(interpreter.trace_steps)

        # Derive high-level status
        if "RULE_VERIFIED_MISMATCH" in raw_out:
            status = "CONTRADICTION"
        elif "AGREEMENT" in raw_out or "RULE_VERIFIED" in raw_out:
            status = "AGREEMENT"
        elif "EVIDENCE_SUPPORTED" in raw_out:
            status = "EVIDENCE_SUPPORTED"
        elif "SOURCE_EXCLUSIVE" in raw_out:
            status = "SOURCE_EXCLUSIVE"
        elif "INSUFFICIENT_EVIDENCE" in raw_out:
            status = "INSUFFICIENT_EVIDENCE"
        else:
            status = "CONTRADICTION"

        return status, expr_str, raw_out, trace

    @staticmethod
    def _norm(val: Optional[Any]) -> str:
        if val is None:
            return "NONE"
        if isinstance(val, (int, float)):
            return f"{float(val):.4f}".rstrip("0").rstrip(".")
        return str(val).strip()
