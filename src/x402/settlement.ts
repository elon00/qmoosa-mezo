/**
 * A Transfer event alone is not authenticated x402 authorization for an order.
 * Legacy settlement verifier used float amounts and a non-durable Set.
 * Hold all public consumption until an authenticated, durable, atomic,
 * order/merchant/amount/nonce-bound flow is implemented and tested.
 */
export interface SettlementReceipt {
  receiptId: string;
  txHash: string;
  buyer: string;
  merchant: string;
  network: string;
  verifiedAt: number;
}

export class SettlementVerifier {
  static async verifyOnChainSettlement(
    _txHash: string,
    _expectedMerchant: string,
    _expectedMinMUSD: number
  ): Promise<{verified: false; reason: string}> {
    return {
      verified: false,
      reason: "SETTLEMENT_DISABLED: require authenticated x402 verification, durable unique payment ledger, and order-bound atomic fulfillment"
    };
  }

  static getReceipt(_receiptId: string): undefined {
    return undefined;
  }

  static listReceipts(): SettlementReceipt[] {
    return [];
  }

  static resetCache(): void {
    // Intentionally no in-memory receipts or replay authorization.
  }
}
