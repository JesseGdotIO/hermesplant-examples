/**
 * 01-call-endpoint.ts
 *
 * Calls Hermes Plant's DealAnalyzer endpoint (DCF/IRR) using `x402-fetch`.
 * `x402-fetch` is a drop-in replacement for the global `fetch` that handles
 * the 402 → sign → retry handshake automatically.
 *
 *   WALLET_PRIVATE_KEY=0x... npm run example:call
 */
import { createX402Fetch } from "@x402/fetch";
import { privateKeyToAccount } from "viem/accounts";

const BASE = process.env.HERMES_BASE_URL ?? "https://hermesplant.com";
const ENDPOINT = process.env.HERMES_ENDPOINT ?? "/agent-services/dealanalyzer";

const pk = process.env.WALLET_PRIVATE_KEY as `0x${string}` | undefined;
if (!pk) {
  console.error("Set WALLET_PRIVATE_KEY (0x-prefixed EOA on Base mainnet).");
  process.exit(2);
}

const account = privateKeyToAccount(pk);

// x402-fetch wraps the native fetch — when the server returns 402, it
// inspects the PAYMENT-REQUIRED header, signs the appropriate
// PaymentRequirements with `account`, and retries with PAYMENT-SIGNATURE.
const fetch402 = createX402Fetch({ account });

async function main() {
  const response = await fetch402(`${BASE}${ENDPOINT}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cashflows: [-1_000_000, 250_000, 250_000, 300_000, 400_000],
      discountRate: 0.1,
    }),
  });

  if (!response.ok) {
    console.error(`HTTP ${response.status} ${response.statusText}`);
    console.error(await response.text());
    process.exit(1);
  }

  const result = await response.json();
  console.log("DealAnalyzer result:", JSON.stringify(result, null, 2));

  const settlement = response.headers.get("PAYMENT-RESPONSE");
  if (settlement) {
    const decoded = Buffer.from(settlement, "base64").toString("utf-8");
    console.log("Settlement:", decoded);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
