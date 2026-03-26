# GraphQL Bridge

Node.js/Express GraphQL bridge over DipDup's Postgres database.
Runs on port 42000 and is used by the frontend's `cotpIndexerApiClient`.

## Start

```bash
cd services/graphql-bridge
node index.js
```

## Requires

- Postgres running locally with DipDup DB (`dipdup` user, `dipdup` db, `dipdup` password)
