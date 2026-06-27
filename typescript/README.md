# TypeScript examples

End-to-end TypeScript clients that call Hermes Plant endpoints.

| File | What it shows |
|---|---|
| [`src/01-call-endpoint.ts`](./src/01-call-endpoint.ts) | Direct x402 call using `x402-fetch` (drop-in `fetch` wrapper that handles the 402 challenge automatically). |
| [`src/02-mcp-client.ts`](./src/02-mcp-client.ts) | Streamable-HTTP MCP client that connects to `hermesplant.com/mcp`, lists tools, and invokes one. |

## Setup

```sh
cd typescript
npm install
```

Set wallet env:

```sh
export WALLET_PRIVATE_KEY="0x..."   # EOA private key, Base mainnet
```

## Run

```sh
npm run example:call         # direct x402 call
npm run example:mcp          # MCP client
```

## Production note

`x402-fetch` is the official TypeScript adapter from the [x402-foundation/x402](https://github.com/x402-foundation/x402) monorepo. Pin a specific version in your own apps — the v0.x API may still evolve.
