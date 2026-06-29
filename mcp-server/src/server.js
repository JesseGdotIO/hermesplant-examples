#!/usr/bin/env node
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const DEFAULT_BASE_URL = "https://hermesplant.com";
const DEFAULT_MCP_URL = "https://hermesplant.com/mcp";

const baseUrl = (process.env.HERMES_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
const hostedMcpUrl = process.env.HERMES_MCP_URL ?? DEFAULT_MCP_URL;

const tools = [
  {
    name: "hermesplant_x402_manifest",
    description:
      "Fetch the live Hermes Plant x402 discovery manifest, including network, facilitator, and payment metadata.",
    inputSchema: emptyInputSchema(),
  },
  {
    name: "hermesplant_llms_catalog",
    description:
      "Fetch Hermes Plant's llms.txt catalog for agent-readable endpoint and usage context.",
    inputSchema: emptyInputSchema(),
  },
  {
    name: "hermesplant_api_catalog",
    description:
      "Fetch Hermes Plant's RFC 9727-style API catalog for machine-readable service discovery.",
    inputSchema: emptyInputSchema(),
  },
  {
    name: "hermesplant_mcp_server_card",
    description:
      "Fetch Hermes Plant's MCP server descriptor for the hosted Streamable HTTP endpoint.",
    inputSchema: emptyInputSchema(),
  },
  {
    name: "hermesplant_list_hosted_tools",
    description:
      "Connect to the hosted Hermes Plant MCP endpoint and list its advertised tools. Paid tool calls still require an x402-capable runtime and wallet approval.",
    inputSchema: emptyInputSchema(),
  },
];

const server = new Server(
  {
    name: "hermesplant-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case "hermesplant_x402_manifest":
        return textResult(await fetchText(`${baseUrl}/.well-known/x402`, "application/json"));
      case "hermesplant_llms_catalog":
        return textResult(await fetchText(`${baseUrl}/llms.txt`, "text/plain"));
      case "hermesplant_api_catalog":
        return textResult(await fetchText(`${baseUrl}/.well-known/api-catalog`, "application/json"));
      case "hermesplant_mcp_server_card":
        return textResult(
          await fetchText(`${baseUrl}/.well-known/mcp/server-card.json`, "application/json"),
        );
      case "hermesplant_list_hosted_tools":
        return textResult(await listHostedTools());
      default:
        return {
          isError: true,
          content: [{ type: "text", text: `Unknown tool: ${request.params.name}` }],
        };
    }
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);

function emptyInputSchema() {
  return {
    type: "object",
    properties: {},
    additionalProperties: false,
  };
}

function textResult(text) {
  return {
    content: [{ type: "text", text }],
  };
}

async function fetchText(url, accept) {
  const response = await fetch(url, {
    headers: {
      Accept: accept,
      "User-Agent": "hermesplant-mcp-server/0.1",
    },
  });

  if (!response.ok) {
    throw new Error(`Hermes Plant request failed: ${response.status} ${response.statusText} (${url})`);
  }

  return response.text();
}

async function listHostedTools() {
  const transport = new StreamableHTTPClientTransport(new URL(hostedMcpUrl));
  const client = new Client(
    { name: "hermesplant-mcp-server-bridge", version: "0.1.0" },
    { capabilities: {} },
  );

  try {
    await client.connect(transport);
    const { tools: hostedTools } = await client.listTools();

    return JSON.stringify(
      {
        hostedMcpUrl,
        toolCount: hostedTools.length,
        tools: hostedTools.map((tool) => ({
          name: tool.name,
          description: tool.description ?? "",
          inputSchema: tool.inputSchema ?? null,
        })),
      },
      null,
      2,
    );
  } finally {
    await client.close().catch(() => {});
  }
}
