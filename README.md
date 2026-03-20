# Cultofthepump Monorepo

Personal private monorepo workspace for the Cult of the Pump codebases.

## Structure

- `.github/`
  Shared GitHub profile and repository metadata imported from `cultofthepump/.github`.
- `apps/interface/`
  Frontend application imported from `cultofthepump/interface`.
- `services/api/`
  REST API imported from `cultofthepump/api`.
- `services/indexer/`
  Indexer services and client imported from `cultofthepump/indexer`.
- `protocol/contracts/`
  Starknet contracts workspace imported from the upgraded local `cultofthepump/contracts` tree.
- `docs/manifesto/`
  Project manifesto imported from `cultofthepump/manifesto`.
- `archive/import-snapshots/`
  Local ignored import staging snapshots, kept out of the active workspace.

## Root Commands

- `make contracts-build`
- `make contracts-test`
- `make api-build`
- `make indexer-check`
- `make verify`

See `docs/SETUP.md` for the minimal setup flow.

## Notes

- The primary active codepaths are `apps/`, `services/`, and `protocol/`.
- `protocol/contracts/contracts/manual/fork_tests.cairo` contains the live fork tests removed from the default test run because public RPC compatibility was not stable enough for a hermetic baseline.
