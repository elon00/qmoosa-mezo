/**
 * QMOOSA MEZO — x402 On-Chain Settlement Verifier
 * 
 * Verifies on-chain payment settlements on Mezo Testnet (Chain ID 31611):
 * 1. Checks transaction receipt via Mezo Testnet RPC.
 * 2. Confirms status == 1 (successful execution).
 * 3. Parses ERC-20 Transfer event log to ensure:
 *    - Token address matches canonical MUSD (0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503).
 *    - Recipient matches official merchant PAY_TO address.
 *    - Transferred amount matches or exceeds required price.
 * 4. Strictly protects against replay attacks by recording consumed receipt hashes.
 */

import { createPublicClient, http, decodeEventLog, parseAbiItem } from "viem";
import crypto from "node:crypto";
import { MEZO_TESTNET_CONFIG } from "../defi/vault.js";

export interface SettlementReceipt {
  receiptId: string;
  txHash: string;
  blockNumber: bigint;
  buyer: string;
  merchant: string;
  amountMUSD: string;
  rawAmount: bigint;
  tokenAddress: string;
  network: string;
  timestamp: number;
  verifiedAt: number;
  integrityHash: string;
}

const TRANSFER_EVENT = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)"
);

export class SettlementVerifier {
  private static consumedTransactions = new Set<string>();
  private static receiptLedger = new Map<string, SettlementReceipt>();

  private static client = createPublicClient({
    transport: http(MEZO_TESTNET_CONFIG.rpcUrl)
  });

  /**
   * Verifies an on-chain MUSD transfer on Mezo Testnet and produces a tamper-proof receipt.
   */
  public static async verifyOnChainSettlement(
    txHash: string,
    expectedMerchant: string,
    expectedMinMUSD: number
  ): Promise<{
    verified: boolean;
    reason?: string;
    receipt?: SettlementReceipt;
  }> {
    const normalizedTx = txHash.toLowerCase();

    // 1. Replay Resistance Check
    if (this.consumedTransactions.has(normalizedTx)) {
      return {
        verified: false,
        reason: `Replay Protection: Transaction ${txHash} has already been consumed and cannot be reused.`
      };
    }

    try {
      // 2. Fetch Transaction Receipt from Mezo Testnet RPC
      const receipt = await this.client.getTransactionReceipt({
        hash: txHash as `0x${string}`
      });

      if (!receipt) {
        return {
          verified: false,
          reason: `Transaction ${txHash} not found on Mezo Testnet.`
        };
      }

      // 3. Confirm Success Status
      if (receipt.status !== "success") {
        return {
          verified: false,
          reason: `Transaction ${txHash} reverted or failed on Mezo Testnet.`
        };
      }

      // 4. Parse Transfer Event Logs
      let matchedTransfer: { from: string; to: string; value: bigint } | null = null;
      for (const log of receipt.logs) {
        if (log.address.toLowerCase() === MEZO_TESTNET_CONFIG.musdAddress.toLowerCase()) {
          try {
            const decoded = decodeEventLog({
              abi: [TRANSFER_EVENT],
              data: log.data,
              topics: log.topics
            });
            if (decoded.eventName === "Transfer") {
              const { from, to, value } = decoded.args as { from: string; to: string; value: bigint };
              if (to.toLowerCase() === expectedMerchant.toLowerCase()) {
                matchedTransfer = { from, to, value };
                break;
              }
            }
          } catch {
            // Not a Transfer event or signature mismatch, continue checking
          }
        }
      }

      if (!matchedTransfer) {
        return {
          verified: false,
          reason: `No matching MUSD Transfer event found to merchant ${expectedMerchant} in tx ${txHash}.`
        };
      }

      // 5. Check Amount Threshold
      // 1 MUSD = 10^18 wei
      const minWei = BigInt(Math.floor(expectedMinMUSD * 1e18));
      if (matchedTransfer.value < minWei) {
        return {
          verified: false,
          reason: `Insufficient MUSD payment. Transferred: ${matchedTransfer.value} wei, Required minimum: ${minWei} wei.`
        };
      }

      // 6. Record and Issue Verifiable Receipt
      this.consumedTransactions.add(normalizedTx);

      const now = Date.now();
      const receiptId = `rcpt_${crypto.randomBytes(8).toString("hex")}`;
      const formattedAmount = (Number(matchedTransfer.value) / 1e18).toFixed(6);

      const integrityHash = crypto
        .createHash("sha256")
        .update(
          `${receiptId}:${normalizedTx}:${receipt.blockNumber}:${matchedTransfer.from}:${matchedTransfer.to}:${matchedTransfer.value}`
        )
        .digest("hex");

      const settlementReceipt: SettlementReceipt = {
        receiptId,
        txHash: normalizedTx,
        blockNumber: receipt.blockNumber,
        buyer: matchedTransfer.from,
        merchant: matchedTransfer.to,
        amountMUSD: formattedAmount,
        rawAmount: matchedTransfer.value,
        tokenAddress: MEZO_TESTNET_CONFIG.musdAddress,
        network: MEZO_TESTNET_CONFIG.caip2,
        timestamp: now,
        verifiedAt: now,
        integrityHash
      };

      this.receiptLedger.set(receiptId, settlementReceipt);

      return {
        verified: true,
        receipt: settlementReceipt
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        verified: false,
        reason: `RPC verification error: ${msg}`
      };
    }
  }

  public static getReceipt(receiptId: string): SettlementReceipt | undefined {
    return this.receiptLedger.get(receiptId);
  }

  public static listReceipts(): SettlementReceipt[] {
    return Array.from(this.receiptLedger.values());
  }

  public static resetCache(): void {
    this.consumedTransactions.clear();
    this.receiptLedger.clear();
  }
}
