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

## Development setup

To set up the development environment:

```shell
pdm install
$(pdm venv activate)
```

Run `make all` to run full CI check or `make help` to see other available commands.

## Deploy to GKE

See [instructions](./deploy/k8s/README.md)