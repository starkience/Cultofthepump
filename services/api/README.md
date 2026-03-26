<div align="center">
  <h1>COTP API</h1>
  <img src="https://e7.pngegg.com/pngimages/327/1022/png-clipart-man-flexing-muscles-like-mcnally-people-barechested-sportsmen-and-bodybuilders-thumbnail.png" alt="cotp" height="300"/>

  [![Check Workflow Status](https://github.com/cultofthepump/api/actions/workflows/check.yml/badge.svg)](https://github.com/cultofthepump/api/actions/workflows/check.yml)

</div>

## Getting Started

Download and install [golang](https://go.dev/doc/install). It is helpful to develop
within a `GOROOT` as follows:

```bash
go get ./...
go install ./...
cotp-api
```

## Database Connection

- DB credentials must be passed to config as [YAML](./internal/config/config.go)
- Project expects Postgres
- Run table schema

```bash
psql postgres -U <user> -d <table_name> -f sql/create-tokens.sql
```

Example `conf.yml`:

```yaml
DBHost: localhost
DBUser: postgres
DBName: cotp
DBPassword: postgres
```

## Metadata API

M2 turns this service into a simple metadata registry for launched cults.

Endpoints:

- `GET /healthz`
- `GET /tokens`
- `GET /tokens?network=sepolia`
- `GET /tokens?network=sepolia&address=0x...`
- `POST /tokens`

Example payload:

```json
{
  "name": "Cult of the Pump",
  "symbol": "COTP",
  "address": "0x0135abb443cbba9738fe63d55a06810fdf14b605ddc5262220a889411baede25",
  "description": "Sepolia launch entry",
  "imageUrl": "https://example.com/cults/cotp.png",
  "manifesto": "Simple frontend manifesto copy.",
  "network": "sepolia",
  "createdBy": "0x0023a47088e3af2d48e957b8b2af946147a0894da1c22d1bfeb280a6a74f3181",
  "transactionHash": "0x05d7011c8d6e37c093065689f22b7461de6476f112c90c49c400dc5cf882b1da"
}
```

Notes:

- `POST /tokens` upserts by `(network, address)`
- `imageUrl` is an offchain URL; binary image upload is intentionally out of scope for M2
- `manifesto` remains offchain and is meant to be rendered by the frontend
