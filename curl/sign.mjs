#!/usr/bin/env node
// Tiny helper: read an x402 PAYMENT-REQUIRED challenge from argv[2], produce
// the PAYMENT-SIGNATURE header value (b64 PaymentPayload) using x402-fetch.
//
//   node sign.mjs '<decoded JSON challenge>'
//
// Reads WALLET_PRIVATE_KEY from env. Uses the official x402 EVM signer so the
// signature exactly matches what the Coinbase facilitator expects.
import { signPaymentRequirements } from '@x402/evm';
import { privateKeyToAccount } from 'viem/accounts';

const challengeJson = process.argv[2];
if (!challengeJson) {
  console.error('usage: node sign.mjs <decoded challenge json>');
  process.exit(2);
}

const pk = process.env.WALLET_PRIVATE_KEY;
if (!pk) {
  console.error('WALLET_PRIVATE_KEY env var required');
  process.exit(2);
}

const account = privateKeyToAccount(pk);
const challenge = JSON.parse(challengeJson);

// Pick the first PaymentRequirements entry. Real clients should pick the
// scheme/network they hold funds on.
const requirements = challenge.accepts?.[0] ?? challenge;

const payload = await signPaymentRequirements(account, requirements);
const header = Buffer.from(JSON.stringify(payload)).toString('base64');
console.log(header);
