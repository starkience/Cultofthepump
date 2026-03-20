# COTP indexer

Dipdup based indexer for COTP contracts, launched tokens and Ekubo pools.

## Running locally

Make sure you have Docker installed, then follow the [instructions](./cotp_indexer/README.md#usage).

## Using the Hasura console

If you have a local instance running you can access the console at [http://127.0.0.1:8080/](http://127.0.0.1:8080/console).  
Hasura provides an interface for basic DB management as well as a GraphQL playground for making queries.

## Using GenQL generated client

[GenQL](https://genql.dev/) is a library that allows to automatically generate typed SDK for a given GraphQL schema (or introspection endpoint). Check out the [sample app](./cotp_indexer_client/README.md) which showcases how to use GQL queries and websocket subscriptions.

## Public endpoint

Sepolia
```
https://35.208.25.99.nip.io/v1/graphql
```