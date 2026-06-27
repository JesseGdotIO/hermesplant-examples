"""
01-call-endpoint.py

Direct x402 call to Hermes Plant's DealAnalyzer (DCF/IRR) endpoint using the
official `x402` Python package. Reads WALLET_PRIVATE_KEY from env.

    WALLET_PRIVATE_KEY=0x... python 01-call-endpoint.py
"""
import json
import os
import sys

from eth_account import Account
from x402.client import X402Client

BASE = os.environ.get("HERMES_BASE_URL", "https://hermesplant.com")
ENDPOINT = os.environ.get("HERMES_ENDPOINT", "/agent-services/dealanalyzer")

pk = os.environ.get("WALLET_PRIVATE_KEY")
if not pk:
    print("Set WALLET_PRIVATE_KEY (0x-prefixed EOA on Base mainnet).", file=sys.stderr)
    sys.exit(2)

account = Account.from_key(pk)
client = X402Client(account=account)

response = client.request(
    "POST",
    f"{BASE}{ENDPOINT}",
    json={
        "cashflows": [-1_000_000, 250_000, 250_000, 300_000, 400_000],
        "discountRate": 0.10,
    },
)

response.raise_for_status()
print("DealAnalyzer result:")
print(json.dumps(response.json(), indent=2))

settlement = response.headers.get("PAYMENT-RESPONSE")
if settlement:
    print("\nSettlement (PAYMENT-RESPONSE header):")
    print(settlement)
