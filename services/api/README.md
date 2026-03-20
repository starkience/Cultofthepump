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
