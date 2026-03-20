# Setup

## Protocol

- Install `scarb 2.13.1`
- Install `starknet-foundry 0.58.0`
- Run `cd protocol/contracts && scarb build`
- Run `cd protocol/contracts && snforge test --package contracts`

## API

- Install Go
- Run `cd services/api && go build ./...`

## Indexer

- Install Python 3
- Run `cd services/indexer/cotp_indexer && python3 -m py_compile __init__.py`

## Root

- Run `make verify` from the repository root for the stable baseline checks
