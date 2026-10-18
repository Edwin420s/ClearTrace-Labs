.PHONY: help test verify seed
help:
	@echo 'ClearTrace Labs Makefile'
test:
	pytest -v tests/test_cleartrace.py
seed:
	python3 scripts/seed_presets.py
