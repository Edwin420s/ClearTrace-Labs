.PHONY: help test verify
help:
	@echo 'ClearTrace Labs Makefile'
test:
	pytest -v tests/test_cleartrace.py
