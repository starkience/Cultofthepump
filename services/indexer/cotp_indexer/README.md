# COTP indexer

## Installation

This project is based on [DipDup](https://dipdup.io), a framework for building featureful dapps.

You need a Linux/macOS system with Python 3.12 installed. To install DipDup with pipx or use our installer:

```shell
curl -Lsf https://dipdup.io/install.py | python3.12
```

See the [Installation](https://dipdup.io/docs/installation) page for all options.

## Usage

Spawn a Compose stack with PostgreSQL and Hasura:

```shell
# Build an image
make image
# Configure environment variables
cp deploy/.env.default deploy/.env
# Create services
make up
# Stop & delete all services and remove persistent volumes
make down
```

Check the console at [http://127.0.0.1:8080/](http://127.0.0.1:8080/console)

## Sepolia configuration

The indexer is now wired for the current Sepolia deployment by default.

Relevant environment variables:

```shell
export NODE_URL=https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_10/<api-key>
export FACTORY_CONTRACT_ADDRESS=0x0135abb443cbba9738fe63d55a06810fdf14b605ddc5262220a889411baede25
export SWAP_CONTRACT_ADDRESS=0x07a6c0500a1596c0a501156ba660c84c461a599053ab96319d61dfc2626a45b9
export TOKEN_TEMPLATE_ADDRESS=0x051edfc985b303c7517e1daadd972b8edbe4bfd8484edc6f9a810704c0931975
export INDEXER_FIRST_LEVEL=0
```

`TOKEN_TEMPLATE_ADDRESS` is only used as an ABI reference contract. New cult token contracts are still registered dynamically from `ShitcoinLaunched` events.

For new launches, token-specific indexes are now registered dynamically from the actual launch event instead of a hardcoded block height.

## Development setup

To set up the development environment:

```shell
pdm install
$(pdm venv activate)
```

Run `make all` to run full CI check or `make help` to see other available commands.

## Deploy to GKE

See [instructions](./deploy/k8s/README.md)
