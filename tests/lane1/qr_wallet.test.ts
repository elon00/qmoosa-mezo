import test from "node:test";
import assert from "node:assert/strict";
import { QRPaymentEngine } from "../../src/wallet/qr.js";
import { MEZO_TESTNET_CONFIG } from "../../src/defi/vault.js";

test("LANE 1: QR Payment — Generate Standard EIP-681 URI for Mezo Testnet MUSD", () => {
  const merchant = "0xC3376296a18ef364eA19287203EEd7a87f18e738";
  const uri = QRPaymentEngine.createPaymentURI(merchant, "$0.001", "qmoosa-fast-inference", "nonce_123");

  assert.ok(uri.startsWith("ethereum:0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503@31611/transfer?"));
  assert.ok(uri.includes(`address=${merchant}`));
  assert.ok(uri.includes("uint256=1000000000000000")); // 0.001 * 10^18
  assert.ok(uri.includes("serviceId=qmoosa-fast-inference"));
  assert.ok(uri.includes("nonce=nonce_123"));
});

test("LANE 1: QR Payment — Parse & Validate Valid URI", () => {
  const merchant = "0xC3376296a18ef364eA19287203EEd7a87f18e738";
  const uri = QRPaymentEngine.createPaymentURI(merchant, "$0.005", "qmoosa-deep-reasoning");
  const parsed = QRPaymentEngine.parseAndValidateURI(uri);

  assert.equal(parsed.chainId, 31611);
  assert.equal(parsed.tokenAddress.toLowerCase(), MEZO_TESTNET_CONFIG.musdAddress.toLowerCase());
  assert.equal(parsed.recipient.toLowerCase(), merchant.toLowerCase());
  assert.equal(parsed.amountMUSD, "0.005");
  assert.equal(parsed.serviceId, "qmoosa-deep-reasoning");
});

test("LANE 1: Negative Test — QR Rejected on Network Mismatch (e.g. Ethereum Mainnet 1)", () => {
  const fakeUri = `ethereum:${MEZO_TESTNET_CONFIG.musdAddress}@1/transfer?address=0xC3376296a18ef364eA19287203EEd7a87f18e738&uint256=1000000000000000`;

  assert.throws(
    () => {
      QRPaymentEngine.parseAndValidateURI(fakeUri);
    },
    /Network mismatch/,
    "Must reject URI specifying non-Mezo chain ID"
  );
});

test("LANE 1: Negative Test — QR Rejected on Token Mismatch (e.g. fake USDC)", () => {
  const fakeToken = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const fakeUri = `ethereum:${fakeToken}@31611/transfer?address=0xC3376296a18ef364eA19287203EEd7a87f18e738&uint256=1000000000000000`;

  assert.throws(
    () => {
      QRPaymentEngine.parseAndValidateURI(fakeUri);
    },
    /Token mismatch/,
    "Must reject URI specifying non-canonical MUSD token address"
  );
});

test("LANE 1: QR Code Image Data URL Generation", async () => {
  const merchant = "0xC3376296a18ef364eA19287203EEd7a87f18e738";
  const uri = QRPaymentEngine.createPaymentURI(merchant, "$0.001");
  const dataUrl = await QRPaymentEngine.generateDataURL(uri);

  assert.ok(dataUrl.startsWith("data:image/png;base64,"));
  assert.ok(dataUrl.length > 500);
});
