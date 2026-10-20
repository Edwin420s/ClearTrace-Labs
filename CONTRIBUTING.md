# Contributing to ClearTrace Labs

Thank you for your interest in contributing to **ClearTrace Labs**! We welcome contributions that advance symbolic multi-agent reasoning, SingularityNET Hyperon / MeTTa integration, and verifiable decision workflows.

---

## Code of Conduct & Standards

ClearTrace Labs adheres strictly to:
1. **Rule 03 — Transparent AI Disclosure**: All contributions must disclose any AI-assisted code generation.
2. **Rule 05 — Permission & Synthetic Data**: Real-world private community data or unreleased artist IP must never be committed. Always use synthetic demo datasets labeled `[SYNTHETIC DEMO]`.
3. **Glass-Box Principle**: No probabilistic smoothing or browser-side logic faking. Every state change and conclusion must be traceable to a MeTTa symbolic reduction or explicit human adjudicator input.

---

## Development Workflow

### 1. Prerequisites
- Python 3.10+ (or Python 3.11/3.14)
- Node.js 18+ and npm 9+
- Git

### 2. Setup
```bash
# Clone and enter the directory
git clone https://github.com/Edwin420s/ClearTrace-Labs.git
cd ClearTrace-Labs

# Python Virtual Environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Frontend Setup
cd frontend
npm install
cd ..
```

### 3. Running Acceptance Tests
Before submitting any pull request, ensure all 33 acceptance and security tests pass:
```bash
make verify
# or
pytest -v tests/
```

### 4. Code Formatting & Linting
- Follow PEP 8 for Python.
- Follow standard JavaScript / JSX formatting with clean components.

---

## Pull Request Guidelines
1. Fork the repo and create your branch from `main`: `git checkout -b feature/symbolic-rule-improvement`.
2. Commit clear, descriptive messages: `git commit -m "feat(metta): add territory variance check rule"`.
3. Push to your branch and open a PR against `main`.
4. State whether any new MeTTa rules or database schemas were introduced.
