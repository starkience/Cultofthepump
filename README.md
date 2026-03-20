# Cultofthepump Monorepo

Personal private monorepo workspace for the Cult of the Pump codebases.

## Layout

- `.github/`: imported from `cultofthepump/.github`
- `api/`: imported from `cultofthepump/api`
- `contracts/`: imported from the local upgraded `cultofthepump/contracts` working tree
- `indexer/`: imported from `cultofthepump/indexer`
- `interface/`: imported from `cultofthepump/interface`
- `manifesto/`: imported from `cultofthepump/manifesto`
- `org-monorepo/`: imported from `cultofthepump/monorepo`

## Notes

- The `contracts/` subtree includes the Starknet/Cairo upgrade work performed locally.
- `contracts/contracts/manual/fork_tests.cairo` contains the live fork tests that were removed from the default package test run because public RPC compatibility was not stable enough for a hermetic baseline.
