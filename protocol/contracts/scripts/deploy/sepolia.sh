#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CONFIG_PATH=""
OUTPUT_PATH=""
SNCAST_BIN="${SNCAST_BIN:-sncast}"
SCARB_BIN="${SCARB_BIN:-scarb}"
JQ_BIN="${JQ_BIN:-jq}"
PYTHON_BIN="${PYTHON_BIN:-python3}"

usage() {
  cat <<'EOF'
Usage:
  ./scripts/deploy/sepolia.sh --config <config.json> [--output <deployment-manifest.json>]

Required:
  --config   Path to the Sepolia deployment config JSON.

Optional:
  --output   Path to write the deployment manifest JSON.

Environment:
  STARKNET_ACCOUNT           sncast account alias used by snfoundry.toml
  STARKNET_SEPOLIA_RPC_URL   Sepolia RPC URL used by snfoundry.toml
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --config)
      CONFIG_PATH="$2"
      shift 2
      ;;
    --output)
      OUTPUT_PATH="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -z "$CONFIG_PATH" ]]; then
  echo "--config is required" >&2
  usage >&2
  exit 1
fi

if [[ ! -f "$CONFIG_PATH" ]]; then
  echo "Config file not found: $CONFIG_PATH" >&2
  exit 1
fi

for dependency in "$SNCAST_BIN" "$SCARB_BIN" "$JQ_BIN" "$PYTHON_BIN"; do
  if ! command -v "$dependency" >/dev/null 2>&1; then
    echo "Missing required command: $dependency" >&2
    exit 1
  fi
done

json_get() {
  "$JQ_BIN" -r "$1" "$CONFIG_PATH"
}

normalize_int() {
  "$PYTHON_BIN" - "$1" <<'PY'
import sys

value = sys.argv[1].strip()
base = 16 if value.lower().startswith("0x") else 10
print(int(value, base))
PY
}

u256_parts() {
  "$PYTHON_BIN" - "$1" <<'PY'
import sys

value = sys.argv[1].strip()
base = 16 if value.lower().startswith("0x") else 10
number = int(value, base)
mask = (1 << 128) - 1
print(f"{number & mask} {number >> 128}")
PY
}

fixed_parts() {
  local mag="$1"
  local sign="$2"
  local parts
  parts="$(u256_parts "$mag")"
  if [[ "$sign" == "true" ]]; then
    echo "$parts 1"
  else
    echo "$parts 0"
  fi
}

sncast_base_args() {
  local profile
  profile="$(json_get '.profile')"
  printf '%s\n' "--json" "--wait" "--profile" "$profile"
}

run_sncast() {
  local base_args=()
  while IFS= read -r line; do
    base_args+=("$line")
  done < <(sncast_base_args)

  (
    cd "$ROOT_DIR"
    "$SNCAST_BIN" "${base_args[@]}" "$@"
  )
}

extract_json() {
  "$PYTHON_BIN" - <<'PY'
import sys

lines = sys.stdin.read().splitlines()
json_lines = [line for line in lines if line.lstrip().startswith("{")]
if json_lines:
    candidate = json_lines[-1]
    if candidate.endswith("'"):
        candidate = candidate[:-1]
    sys.stdout.write(candidate)
else:
    sys.stdout.write("\n".join(lines))
PY
}

response_value() {
  local payload="$1"
  local key="$2"
  echo "$payload" | extract_json | "$JQ_BIN" -er --arg key "$key" '.[$key] // .result[$key] // .response[$key]'
}

declare_contract() {
  local contract_name="$1"
  local response
  response="$(run_sncast declare --package contracts --contract-name "$contract_name" 2>&1 || true)"
  if echo "$response" | grep -q "already declared"; then
    local class_hash
    class_hash="$(echo "$response" | grep -Eo '0x[0-9a-fA-F]+' | tail -n 1)"
    if [[ -z "$class_hash" ]]; then
      echo "Failed to recover class hash for already-declared contract: $contract_name" >&2
      return 1
    fi
    printf '%s|%s\n' "$class_hash" ""
    return 0
  fi
  local class_hash
  class_hash="$(response_value "$response" 'class_hash')"
  local tx_hash
  tx_hash="$(echo "$response" | extract_json | "$JQ_BIN" -er '.transaction_hash // .result.transaction_hash // .response.transaction_hash // ""')"
  printf '%s|%s\n' "$class_hash" "$tx_hash"
}

deploy_contract() {
  local class_hash="$1"
  local salt="$2"
  shift 2

  local response
  response="$(run_sncast deploy --class-hash "$class_hash" --salt "$salt" --unique --constructor-calldata "$@" 2>&1 || true)"
  if echo "$response" | grep -q "already deployed at address"; then
    local contract_address
    contract_address="$(echo "$response" | grep -Eo '0x[0-9a-fA-F]+' | tail -n 1)"
    if [[ -z "$contract_address" ]]; then
      echo "Failed to recover already-deployed contract address" >&2
      return 1
    fi
    printf '%s|%s\n' "$contract_address" ""
    return 0
  fi
  local contract_address
  contract_address="$(response_value "$response" 'contract_address')"
  local tx_hash
  tx_hash="$(response_value "$response" 'transaction_hash')"
  printf '%s|%s\n' "$contract_address" "$tx_hash"
}

invoke_contract() {
  local contract_address="$1"
  local function_name="$2"
  shift 2

  local response
  response="$(run_sncast invoke --contract-address "$contract_address" --function "$function_name" --calldata "$@")"
  response_value "$response" 'transaction_hash' >/dev/null
  echo "$response"
}

owner="$(json_get '.owner')"
treasury="$(json_get '.treasury')"
if [[ "$owner" == "0x0000000000000000000000000000000000000000000000000000000000000000" ]]; then
  echo "Config still uses the zero owner address. Update .owner before deploying." >&2
  exit 1
fi
if [[ "$treasury" == "0x0000000000000000000000000000000000000000000000000000000000000000" ]]; then
  echo "Config still uses the zero treasury address. Update .treasury before deploying." >&2
  exit 1
fi

if [[ -z "${STARKNET_ACCOUNT:-}" ]]; then
  echo "STARKNET_ACCOUNT is required" >&2
  exit 1
fi
if [[ -z "${STARKNET_SEPOLIA_RPC_URL:-}" ]]; then
  echo "STARKNET_SEPOLIA_RPC_URL is required" >&2
  exit 1
fi

echo "Building contracts workspace..."
(
  cd "$ROOT_DIR"
  "$SCARB_BIN" build
)

strk_address="$(json_get '.dependencies.strk')"
ekubo_core_address="$(json_get '.dependencies.ekubo_core')"
ekubo_registry_address="$(json_get '.dependencies.ekubo_registry')"
ekubo_positions_address="$(json_get '.dependencies.ekubo_positions')"

bonding_curve_salt="$(json_get '.deployment.contracts.bonding_curve.salt')"
swap_salt="$(json_get '.deployment.contracts.swap.salt')"
factory_salt="$(json_get '.deployment.contracts.factory.salt')"
dutch_auction_salt="$(json_get '.deployment.contracts.dutch_auction.salt')"

bonding_curve_a_mag="$(json_get '.protocol.bonding_curve.a.mag')"
bonding_curve_a_sign="$(json_get '.protocol.bonding_curve.a.sign')"
bonding_curve_k_mag="$(json_get '.protocol.bonding_curve.k.mag')"
bonding_curve_k_sign="$(json_get '.protocol.bonding_curve.k.sign')"
dutch_auction_start_price="$(json_get '.protocol.dutch_auction.start_price')"
dutch_auction_end_price="$(json_get '.protocol.dutch_auction.end_price')"
dutch_auction_start_timestamp="$(json_get '.protocol.dutch_auction.start_timestamp')"
dutch_auction_duration="$(json_get '.protocol.dutch_auction.duration')"

echo "Declaring contracts..."
IFS='|' read -r bonding_curve_class_hash bonding_curve_declare_tx <<<"$(declare_contract bonding_curve)"
IFS='|' read -r swap_class_hash swap_declare_tx <<<"$(declare_contract swap)"
IFS='|' read -r erc20_class_hash erc20_declare_tx <<<"$(declare_contract erc20)"
IFS='|' read -r factory_class_hash factory_declare_tx <<<"$(declare_contract factory)"
IFS='|' read -r dutch_auction_class_hash dutch_auction_declare_tx <<<"$(declare_contract dutch_auction)"

echo "Deploying bonding curve..."
read -r bonding_curve_a_low bonding_curve_a_high bonding_curve_a_sign_felt <<<"$(fixed_parts "$bonding_curve_a_mag" "$bonding_curve_a_sign")"
read -r bonding_curve_k_low bonding_curve_k_high bonding_curve_k_sign_felt <<<"$(fixed_parts "$bonding_curve_k_mag" "$bonding_curve_k_sign")"
IFS='|' read -r bonding_curve_address bonding_curve_deploy_tx <<<"$(deploy_contract \
  "$bonding_curve_class_hash" \
  "$bonding_curve_salt" \
  "$bonding_curve_a_low" "$bonding_curve_a_high" "$bonding_curve_a_sign_felt" \
  "$bonding_curve_k_low" "$bonding_curve_k_high" "$bonding_curve_k_sign_felt")"

echo "Deploying swap..."
IFS='|' read -r swap_address swap_deploy_tx <<<"$(deploy_contract \
  "$swap_class_hash" \
  "$swap_salt" \
  "$strk_address" \
  "$bonding_curve_address" \
  "$treasury" \
  "$ekubo_core_address" \
  "$ekubo_registry_address" \
  "$ekubo_positions_address" \
  "$owner" \
  "$owner")"

echo "Deploying factory..."
IFS='|' read -r factory_address factory_deploy_tx <<<"$(deploy_contract \
  "$factory_class_hash" \
  "$factory_salt" \
  "$erc20_class_hash" \
  "$swap_address" \
  "$strk_address" \
  "$treasury" \
  "$owner")"

echo "Deploying dutch auction..."
read -r dutch_start_low dutch_start_high <<<"$(u256_parts "$dutch_auction_start_price")"
read -r dutch_end_low dutch_end_high <<<"$(u256_parts "$dutch_auction_end_price")"
IFS='|' read -r dutch_auction_address dutch_auction_deploy_tx <<<"$(deploy_contract \
  "$dutch_auction_class_hash" \
  "$dutch_auction_salt" \
  "$dutch_start_low" "$dutch_start_high" \
  "$dutch_end_low" "$dutch_end_high" \
  "$(normalize_int "$dutch_auction_start_timestamp")" \
  "$(normalize_int "$dutch_auction_duration")" \
  "$strk_address" \
  "$factory_address" \
  "$treasury" \
  "$owner")"

echo "Configuring swap.set_factory..."
set_factory_response="$(invoke_contract "$swap_address" "set_factory" "$factory_address")"
set_factory_tx="$(response_value "$set_factory_response" 'transaction_hash')"

echo "Configuring factory.set_dutch_auction..."
set_dutch_auction_response="$(invoke_contract "$factory_address" "set_dutch_auction" "$dutch_auction_address")"
set_dutch_auction_tx="$(response_value "$set_dutch_auction_response" 'transaction_hash')"

if [[ -z "$OUTPUT_PATH" ]]; then
  timestamp="$(date +%Y%m%d-%H%M%S)"
  OUTPUT_PATH="$ROOT_DIR/deployments/runs/sepolia-$timestamp.json"
fi
mkdir -p "$(dirname "$OUTPUT_PATH")"

"$JQ_BIN" -n \
  --arg generated_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg config_path "$CONFIG_PATH" \
  --arg network "$(json_get '.network')" \
  --arg profile "$(json_get '.profile')" \
  --arg owner "$owner" \
  --arg treasury "$treasury" \
  --arg strk "$strk_address" \
  --arg ekubo_core "$ekubo_core_address" \
  --arg ekubo_registry "$ekubo_registry_address" \
  --arg ekubo_positions "$ekubo_positions_address" \
  --arg bonding_curve_class_hash "$bonding_curve_class_hash" \
  --arg bonding_curve_declare_tx "$bonding_curve_declare_tx" \
  --arg bonding_curve_address "$bonding_curve_address" \
  --arg bonding_curve_deploy_tx "$bonding_curve_deploy_tx" \
  --arg swap_class_hash "$swap_class_hash" \
  --arg swap_declare_tx "$swap_declare_tx" \
  --arg swap_address "$swap_address" \
  --arg swap_deploy_tx "$swap_deploy_tx" \
  --arg erc20_class_hash "$erc20_class_hash" \
  --arg erc20_declare_tx "$erc20_declare_tx" \
  --arg factory_class_hash "$factory_class_hash" \
  --arg factory_declare_tx "$factory_declare_tx" \
  --arg factory_address "$factory_address" \
  --arg factory_deploy_tx "$factory_deploy_tx" \
  --arg dutch_auction_class_hash "$dutch_auction_class_hash" \
  --arg dutch_auction_declare_tx "$dutch_auction_declare_tx" \
  --arg dutch_auction_address "$dutch_auction_address" \
  --arg dutch_auction_deploy_tx "$dutch_auction_deploy_tx" \
  --arg set_factory_tx "$set_factory_tx" \
  --arg set_dutch_auction_tx "$set_dutch_auction_tx" \
  '{
    generated_at: $generated_at,
    config_path: $config_path,
    network: $network,
    profile: $profile,
    owner: $owner,
    treasury: $treasury,
    dependencies: {
      strk: $strk,
      ekubo_core: $ekubo_core,
      ekubo_registry: $ekubo_registry,
      ekubo_positions: $ekubo_positions
    },
    declarations: {
      bonding_curve: { class_hash: $bonding_curve_class_hash, transaction_hash: $bonding_curve_declare_tx },
      swap: { class_hash: $swap_class_hash, transaction_hash: $swap_declare_tx },
      erc20: { class_hash: $erc20_class_hash, transaction_hash: $erc20_declare_tx },
      factory: { class_hash: $factory_class_hash, transaction_hash: $factory_declare_tx },
      dutch_auction: { class_hash: $dutch_auction_class_hash, transaction_hash: $dutch_auction_declare_tx }
    },
    deployments: {
      bonding_curve: { address: $bonding_curve_address, transaction_hash: $bonding_curve_deploy_tx },
      swap: { address: $swap_address, transaction_hash: $swap_deploy_tx },
      factory: { address: $factory_address, transaction_hash: $factory_deploy_tx },
      dutch_auction: { address: $dutch_auction_address, transaction_hash: $dutch_auction_deploy_tx }
    },
    configuration: {
      swap_set_factory: {
        transaction_hash: $set_factory_tx
      },
      factory_set_dutch_auction: {
        transaction_hash: $set_dutch_auction_tx
      }
    }
  }' >"$OUTPUT_PATH"

echo "Deployment manifest written to $OUTPUT_PATH"
