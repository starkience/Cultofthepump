# M2 Metadata Model

This project uses a minimal offchain metadata record for each cult.

## Why

The contract only guarantees onchain launch state. The app still needs a place to store:

- image URL
- manifesto text
- creator address
- deployment transaction reference

## Minimal record

Each cult metadata record should contain:

- `name`
- `symbol`
- `address`
- `description`
- `imageUrl`
- `manifesto`
- `network`
- `createdBy`
- `transactionHash`

## API shape

The metadata registry lives in `services/api` and exposes:

- `GET /healthz`
- `GET /tokens`
- `GET /tokens?network=sepolia`
- `GET /tokens?network=sepolia&address=0x...`
- `POST /tokens`

This lets the frontend join:

- onchain launch/trade state from the indexer
- offchain image/manifesto metadata from the API

## Current interface behavior

The summon flow now persists metadata after a successful Sepolia launch transaction by reading the
`ShitcoinLaunched` event from the receipt and posting the resulting token address plus frontend data to the metadata API.

Image handling remains intentionally narrow for M2:

- external `http(s)` image URLs can be persisted
- browser-local preview URLs such as `blob:` are not persisted
- binary upload/storage is still deferred to the next milestone

## Current Sepolia deployment

- `bondingCurve`: `0x051edfc985b303c7517e1daadd972b8edbe4bfd8484edc6f9a810704c0931975`
- `swap`: `0x07a6c0500a1596c0a501156ba660c84c461a599053ab96319d61dfc2626a45b9`
- `factory`: `0x0135abb443cbba9738fe63d55a06810fdf14b605ddc5262220a889411baede25`
- `dutchAuction`: `0x019326451eb2955333d4238cd2bdd526a1af5cca842511e3246da61f9a1d859a`

## M2 outcome

M2 is complete when:

- Sepolia contract addresses are the defaults for the read stack
- cult metadata can be stored and fetched offchain by token address
- the indexer and demo GraphQL client are environment-driven instead of hardcoded to one setup

That foundation is now in place. The next milestone is wiring the main frontend product pages to these data sources.
