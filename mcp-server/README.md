# Hermes Plant MCP server

Stdio MCP bridge for [Hermes Plant](https://hermesplant.com), a hosted catalog of deterministic finance and quant APIs metered over x402.

This package is intentionally thin. It gives MCP clients and registries a runnable stdio server that exposes Hermes Plant discovery surfaces and can introspect the hosted Streamable HTTP MCP endpoint. Paid finance tools remain on `https://hermesplant.com/mcp` and require an x402-capable runtime with wallet authorization.

## Tools

- `hermesplant_x402_manifest` - Fetches `https://hermesplant.com/.well-known/x402`.
- `hermesplant_llms_catalog` - Fetches `https://hermesplant.com/llms.txt`.
- `hermesplant_api_catalog` - Fetches `https://hermesplant.com/.well-known/api-catalog`.
- `hermesplant_mcp_server_card` - Fetches `https://hermesplant.com/.well-known/mcp/server-card.json`.
- `hermesplant_list_hosted_tools` - Connects to `https://hermesplant.com/mcp` and lists the hosted tools.

## Run locally

```bash
npm install
npm start
```

For custom deployments:

```bash
HERMES_BASE_URL=https://hermesplant.com HERMES_MCP_URL=https://hermesplant.com/mcp npm start
```

## Docker

```bash
docker build -t hermesplant-mcp-server .
docker run --rm -i hermesplant-mcp-server
```

The server speaks MCP over stdio. Registry crawlers such as Glama can start the container and inspect the tool list without secrets or funded wallets.
