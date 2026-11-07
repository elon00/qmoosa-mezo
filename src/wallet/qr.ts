/**
 * QMOOSA MEZO — QR Code Payment & Multi-Wallet Abstraction
 * 
 * Supports:
 * - Generating EIP-681 standard payment URIs for Mezo Testnet (31611) MUSD
 * - Rendering SVG and Data-URL QR codes
 * - Safe parsing and validation of incoming QR payloads
 * - Prevention of silent recipient or network hijacking
 */

import QRCode from "qrcode";
import { MEZO_TESTNET_CONFIG } from "../defi/vault.js";

export interface QRPaymentRequest {
  chainId: number;
  tokenAddress: string;
  recipient: string;
  amountMUSD: string;
  serviceId?: string;
  nonce?: string;
  uri: string;
}

export class QRPaymentEngine {
  /**
   * Generates a standard EIP-681 / x402 payment URI for MUSD on Mezo Testnet.
   * Format: ethereum:<tokenAddress>@<chainId>/transfer?address=<recipient>&uint256=<amountWei>
   */
  public static createPaymentURI(
    recipient: string,
    amountMUSD: string,
    serviceId?: string,
    nonce?: string
  ): string {
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient) || /^0x0{40}$/i.test(recipient)) {
      throw new Error(`Invalid recipient address format: ${recipient}`);
    }

    // Reject excessive precision and malformed amounts rather than silently rounding.
    const amount = amountMUSD.replace(/^\$/, "").trim();
    if (!/^(0|[1-9][0-9]*)(\.[0-9]{1,18})?$/.test(amount)) {
      throw new Error("Invalid MUSD amount or precision");
    }
    const [whole, decimal = ""] = amount.split(".");
    const fraction = decimal.padEnd(18, "0");
    const amountBigInt = BigInt(whole) * 10n ** 18n + BigInt(fraction);
    if (amountBigInt <= 0n) throw new Error("Amount must be positive");
    const amountWei = amountBigInt.toString();

    let uri = `ethereum:${MEZO_TESTNET_CONFIG.musdAddress}@${MEZO_TESTNET_CONFIG.id}/transfer?address=${recipient}&uint256=${amountWei}`;
    if (serviceId) {
      uri += `&serviceId=${encodeURIComponent(serviceId)}`;
    }
    if (nonce) {
      uri += `&nonce=${encodeURIComponent(nonce)}`;
    }

    return uri;
  }

  /**
   * Generates a Data URL (PNG base64) QR code for mobile wallets.
   */
  public static async generateDataURL(uri: string): Promise<string> {
    return QRCode.toDataURL(uri, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 320,
      color: {
        dark: "#000000",
        light: "#FFFFFF"
      }
    });
  }

  /**
   * Parses and validates an incoming payment URI.
   * Enforces that chainId is strictly Mezo Testnet (31611) and token is canonical MUSD.
   */
  public static parseAndValidateURI(uri: string): QRPaymentRequest {
    if (!uri.startsWith("ethereum:")) {
      throw new Error("Invalid URI: Must start with 'ethereum:' protocol scheme");
    }

    const withoutScheme = uri.slice("ethereum:".length);
    const [targetWithChain, paramsString] = withoutScheme.split("?");
    const [tokenWithFunction, chainPart] = targetWithChain.split("@");

    const chainId = chainPart ? parseInt(chainPart, 10) : MEZO_TESTNET_CONFIG.id;
    if (chainId !== MEZO_TESTNET_CONFIG.id) {
      throw new Error(`Security Violation: Network mismatch! Expected Mezo Testnet (${MEZO_TESTNET_CONFIG.id}), got ${chainId}`);
    }

    const tokenAddress = tokenWithFunction.split("/")[0].toLowerCase();
    if (tokenAddress !== MEZO_TESTNET_CONFIG.musdAddress.toLowerCase()) {
      throw new Error(`Security Violation: Token mismatch! Expected canonical MUSD (${MEZO_TESTNET_CONFIG.musdAddress}), got ${tokenAddress}`);
    }

    const params = new URLSearchParams(paramsString || "");
    const recipient = params.get("address");
    const amountWei = params.get("uint256");

    if (!recipient || !recipient.startsWith("0x")) {
      throw new Error("Invalid or missing recipient in QR URI");
    }

    if (!amountWei) {
      throw new Error("Missing amount in QR URI");
    }

    const amountBigInt = BigInt(amountWei);
    const whole = amountBigInt / 10n ** 18n;
    const rem = amountBigInt % 10n ** 18n;
    const formatted = `${whole}.${rem.toString().padStart(18, "0").replace(/0+$/, "") || "0"}`;

    return {
      chainId,
      tokenAddress,
      recipient,
      amountMUSD: formatted,
      serviceId: params.get("serviceId") || undefined,
      nonce: params.get("nonce") || undefined,
      uri
    };
  }
}
