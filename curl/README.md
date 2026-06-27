# curl / Bash examples

Two scripts, both runnable with stock `bash` + `curl` + `jq`.

| Script | What it shows |
|---|---|
| [`01-discover.sh`](./01-discover.sh) | Fetches every Hermes Plant discovery surface (llms.txt, openapi.json, .well-known/x402, api-catalog, mcp/server-card.json) and prints the key fields. No payment required. |
| [`02-call-endpoint.sh`](./02-call-endpoint.sh) | Walks the full x402 handshake against a paid endpoint — shows the 402 challenge, the signature payload, and the 200 response. **Requires a wallet helper** (see below). |

## Running

```sh
bash curl/01-discover.sh
```

```sh
# Set required env vars first.
export WALLET_PRIVATE_KEY="0x..."          # EOA private key on Base mainnet
export X402_NETWORK="eip155:8453"          # Base mainnet (use eip155:84532 for Sepolia)
bash curl/02-call-endpoint.sh
```

## Wallet signing in pure shell

`02-call-endpoint.sh` shells out to a small Node.js helper (`./sign.mjs`) for the EIP-712 USDC authorization signature. Pure Bash + `openssl` can't do secp256k1 + EIP-712 reliably, so we use Node — but the script structure stays Bash-first so you can see every header on the wire.
