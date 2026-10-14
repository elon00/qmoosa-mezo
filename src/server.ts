/**
 * QMOOSA MEZO — Autonomous AI Payment & DeFi Hub Server
 * 
 * Implements:
 * - Official @x402/express middleware, @x402/evm ExactEvmScheme, @x402/paywall
 * - Target Chain: Mezo Testnet (eip155:31611)
 * - Token: Canonical MUSD (0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503)
 * - Facilitator: https://facilitator.vativ.io
 * - Protected AI Marketplace, Conway automaton API, and PQC verification
 */

import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { createPaywall } from "@x402/paywall";
import { evmPaywall } from "@x402/paywall/evm";

import { MEZO_TESTNET_CONFIG, DeFiVaultManager } from "./defi/vault.js";
import { MarketplaceManager } from "./marketplace/catalog.js";
import { CellularAutomaton, TransactionStateMachine } from "./core/conway.js";
import { MLDSAEngine } from "./crypto/mldsa.js";
import { AgentPolicyEngine } from "./agents/policy.js";
import { QRPaymentEngine } from "./wallet/qr.js";
import { SettlementVerifier } from "./x402/settlement.js";

dotenv.config();

const PORT = Number(process.env.PORT ?? 4021);
const NETWORK = "eip155:31611"; // Mezo testnet
const PAY_TO = process.env.PAY_TO;
if (!PAY_TO || !/^0x[a-fA-F0-9]{40}$/.test(PAY_TO) || /^0x0{40}$/i.test(PAY_TO)) {
  throw new Error("Set a valid, nonzero PAY_TO merchant address before starting the payment server");
}
const FACILITATOR_URL = process.env.FACILITATOR_URL ?? "https://facilitator.vativ.io";
const DEFAULT_PRICE = process.env.PRICE ?? "$0.001";

export const app = express();
app.use(express.json());

// Initialize engines
const agentPolicy = new AgentPolicyEngine();
const conwayGrid = new CellularAutomaton(16, 16);
conwayGrid.seedPattern("glider", 2, 2);

// Wire x402 Resource Server & Paywall
const facilitator = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
const resourceServer = new x402ResourceServer(facilitator).register(
  NETWORK,
  new ExactEvmScheme()
);

const paywall = createPaywall().withNetwork(evmPaywall).build();

// --- 1. Official x402 Paywall Protected Route ---
app.use(
  paymentMiddleware(
    {
      "GET /": {
        accepts: {
          scheme: "exact",
          price: DEFAULT_PRICE,
          network: NETWORK,
          payTo: PAY_TO
        },
        description: `QMOOSA MEZO Gateway — pay ${DEFAULT_PRICE} in MUSD to unlock premium access`
      },
      "POST /api/bazaar/premium": {
        accepts: {
          scheme: "exact",
          price: "$0.005",
          network: NETWORK,
          payTo: PAY_TO
        },
        description: "QMOOSA Autonomous Logic Engine — pay $0.005 in MUSD to execute deep audit"
      }
    },
    resourceServer,
    {
      appName: "QMOOSA MEZO — Autonomous AI Payment & DeFi Hub",
      testnet: true
    },
    paywall
  )
);

// Unlocked Root
app.get("/", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    project: "QMOOSA MEZO — Autonomous AI Payment & DeFi Hub",
    network: "Mezo Testnet (eip155:31611)",
    asset: "MUSD (0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503)",
    message: "Paid! You unlocked the QMOOSA MEZO Gateway.",
    timestamp: Date.now()
  });
});

// --- 2. AI Marketplace (Bazaar) Routes ---
app.get("/api/bazaar", (_req: Request, res: Response) => {
  res.json({
    success: true,
    services: MarketplaceManager.listServices(),
    merchant: PAY_TO,
    network: NETWORK
  });
});

app.post("/api/bazaar/:serviceId/execute", async (req: Request, res: Response): Promise<void> => {
  const { serviceId } = req.params;
  const { prompt, receiptTxHash, agentId } = req.body;

  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "Missing or invalid prompt parameter" });
    return;
  }

  const service = MarketplaceManager.getService(serviceId);
  if (!service) {
    res.status(404).json({ error: `Service ${serviceId} not found` });
    return;
  }

  // Evaluate agent budget policy if agentId is provided
  if (agentId) {
    const evalResult = agentPolicy.evaluateSpend(agentId, service.priceNumeric, serviceId);
    if (!evalResult.approved) {
      res.status(403).json({
        error: "Agent spending policy violation",
        reason: evalResult.reason,
        requiresManualApproval: evalResult.requiresManualApproval
      });
      return;
    }
  }

  // Require verified payment receipt
  if (!receiptTxHash) {
    res.status(402).json({
      error: "Payment required",
      price: service.priceMUSD,
      payTo: PAY_TO,
      network: NETWORK,
      asset: MEZO_TESTNET_CONFIG.musdAddress,
      qrURI: QRPaymentEngine.createPaymentURI(PAY_TO, service.priceMUSD, serviceId)
    });
    return;
  }

  try {
    // Block direct service execution until the receipt is linked to a unique, signed
    // x402 order and verified by a trusted settlement/authorization service.
    res.status(503).json({ error: "Order-bound payment authorization not implemented; refusing service access" });
    return;
    // Deliberately disabled: a caller-supplied transaction hash cannot authorize an order.
    const result = await MarketplaceManager.executeService(serviceId, prompt, receiptTxHash);
    if (agentId) {
      agentPolicy.recordSpend(agentId, service.priceNumeric, serviceId, receiptTxHash);
    }
    res.json({ success: true, result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

// --- 3. Mezo DeFi & Tokenomics Routes ---
app.get("/api/defi/status", async (_req: Request, res: Response) => {
  res.json({
    success: true,
    network: MEZO_TESTNET_CONFIG,
    tokenomics: DeFiVaultManager.getTokenomicsDisclosure(),
    mainnetPolicy: "LOCKED"
  });
});

app.get("/api/defi/balance/:address", async (req: Request, res: Response): Promise<void> => {
  try {
    const balance = await DeFiVaultManager.getMUSDBalance(req.params.address);
    res.json({ success: true, address: req.params.address, ...balance });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

// --- 4. QR Code Payment Generator ---
app.get("/api/qr/generate", async (req: Request, res: Response): Promise<void> => {
  try {
    const recipient = (req.query.recipient as string) || PAY_TO;
    const amount = (req.query.amount as string) || DEFAULT_PRICE;
    const serviceId = (req.query.serviceId as string) || "qmoosa-fast-inference";

    const uri = QRPaymentEngine.createPaymentURI(recipient, amount, serviceId);
    const dataUrl = await QRPaymentEngine.generateDataURL(uri);

    res.json({ success: true, uri, qrCodeDataUrl: dataUrl });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: msg });
  }
});

// --- 5. Settlement Verification & Receipts ---
app.post("/api/settlement/verify", async (req: Request, res: Response): Promise<void> => {
  const { txHash, minAmountMUSD } = req.body;
  if (!txHash) {
    res.status(400).json({ error: "Missing txHash parameter" });
    return;
  }

  const expectedMin = minAmountMUSD ? Number(minAmountMUSD) : 0.001;
  const result = await SettlementVerifier.verifyOnChainSettlement(txHash, PAY_TO, expectedMin);

  if (result.verified) {
    res.json({ success: true, receipt: result.receipt });
  } else {
    res.status(400).json({ success: false, reason: result.reason });
  }
});

app.get("/api/receipts", (_req: Request, res: Response) => {
  res.json({
    success: true,
    receipts: SettlementVerifier.listReceipts()
  });
});

// --- 6. Conway Automaton & State Machine ---
app.post("/api/conway/step", (_req: Request, res: Response) => {
  conwayGrid.step();
  res.json({
    success: true,
    liveCells: conwayGrid.getLiveCellCount(),
    entropyHash: conwayGrid.getEntropyHash(),
    grid: conwayGrid.grid
  });
});

app.post("/api/conway/tx-intent", (req: Request, res: Response) => {
  const { buyer, merchant, amount, serviceId } = req.body;
  const intent = TransactionStateMachine.createIntent(
    buyer || "0x0000000000000000000000000000000000000001",
    merchant || PAY_TO,
    amount || DEFAULT_PRICE,
    serviceId || "qmoosa-fast-inference"
  );
  res.json({ success: true, intent });
});

// --- 7. NIST FIPS 204 Post-Quantum Cryptography ---
app.post("/api/pqc/keygen", (_req: Request, res: Response) => {
  res.status(503).json({ error: "NIST ML-DSA not implemented; HMAC prototype disabled" });
  return;
  const keyPair = MLDSAEngine.generateKeyPair("ML-DSA-65");
  res.json({
    success: true,
    keyId: keyPair.keyId,
    algorithm: keyPair.algorithm,
    publicKey: keyPair.publicKey,
    createdAt: keyPair.createdAt
  });
});

app.post("/api/pqc/verify", (req: Request, res: Response) => {
  res.status(503).json({ error: "NIST ML-DSA not implemented; HMAC prototype disabled" });
  return;
  const envelope = req.body;
  const result = MLDSAEngine.verify(envelope);
  res.json({ success: true, ...result });
});

// --- 8. Health & Reality Check ---
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "HEALTHY",
    service: "qmoosa-mezo",
    version: "4.0.0",
    network: "Mezo Testnet (eip155:31611)",
    musdToken: MEZO_TESTNET_CONFIG.musdAddress,
    facilitatorUrl: FACILITATOR_URL,
    timestamp: Date.now()
  });
});

export function startServer(port: number = PORT) {
  return app.listen(port, () => {
    console.log(`QMOOSA MEZO Gateway active on http://localhost:${port}/`);
    console.log(`Target Network: ${NETWORK} | Token: ${MEZO_TESTNET_CONFIG.musdAddress}`);
    console.log(`Facilitator: ${FACILITATOR_URL}`);
  });
}

if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  startServer(PORT);
}
