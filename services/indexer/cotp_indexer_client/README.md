# COTP indexer client

Demo app showcasing the usage of COTP GraphQL client.

## Generate COTP indexer client

In order to generate typed GraphQL client for a given introspection endpoint you'd need to do the following:

```sh
npm i -g @genql/cli
```

Then in your project root:

```sh
genql --endpoint "$REACT_APP_COTP_INDEXER_GRAPHQL_URL" --output ./src/client
```

Read more at https://genql.dev/docs

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

## Environment

The demo client is now environment-driven:

```sh
export REACT_APP_COTP_INDEXER_GRAPHQL_URL=http://127.0.0.1:8080/v1/graphql
export REACT_APP_COTP_INDEXER_WS_URL=ws://127.0.0.1:8080/v1/graphql
```

Replace those with your Sepolia Hasura endpoint when the shared indexer is deployed.
