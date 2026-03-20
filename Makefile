SHELL := /bin/sh

.PHONY: help contracts-build contracts-test api-build indexer-check verify

help:
	@printf '%s\n' \
		'Available targets:' \
		'  make contracts-build  Build Starknet contracts' \
		'  make contracts-test   Run Starknet contract tests' \
		'  make api-build        Build the Go API' \
		'  make indexer-check    Validate the indexer Python package metadata' \
		'  make verify           Run the stable monorepo checks'

contracts-build:
	@command -v scarb >/dev/null || { echo 'Missing scarb'; exit 1; }
	cd protocol/contracts && scarb build

contracts-test:
	@command -v snforge >/dev/null || { echo 'Missing snforge'; exit 1; }
	cd protocol/contracts && snforge test --package contracts

api-build:
	@command -v go >/dev/null || { echo 'Missing go'; exit 1; }
	cd services/api && go build ./...

indexer-check:
	@command -v python3 >/dev/null || { echo 'Missing python3'; exit 1; }
	cd services/indexer/cotp_indexer && python3 -m py_compile __init__.py

verify: contracts-test api-build indexer-check
