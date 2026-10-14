/**
 * QMOOSA MEZO — Conway Automaton Engine
 * 
 * Implements:
 * 1. Mathematical B3/S23 Game of Life cellular automaton for deterministic entropy generation.
 * 2. Deterministic 10-state transaction orchestration automaton.
 * 
 * Safety Invariant:
 * The Conway automaton state machine CANNOT independently authorize blockchain transfers.
 */

import crypto from "node:crypto";

// --- Mathematical B3/S23 Cellular Automaton ---

export type Grid = number[][];

export class CellularAutomaton {
  public rows: number;
  public cols: number;
  public grid: Grid;

  constructor(rows: number = 16, cols: number = 16, initialPattern?: Grid) {
    this.rows = rows;
    this.cols = cols;
    if (initialPattern) {
      this.grid = initialPattern;
    } else {
      this.grid = this.createEmptyGrid();
    }
  }

  public createEmptyGrid(): Grid {
    return Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
  }

  public seedPattern(name: "glider" | "blinker" | "beacon" | "block", startRow: number = 1, startCol: number = 1): void {
    if (name === "glider") {
      const coords = [[0, 1], [1, 2], [2, 0], [2, 1], [2, 2]];
      for (const [r, c] of coords) {
        if (startRow + r < this.rows && startCol + c < this.cols) {
          this.grid[startRow + r][startCol + c] = 1;
        }
      }
    } else if (name === "blinker") {
      const coords = [[0, 0], [0, 1], [0, 2]];
      for (const [r, c] of coords) {
        if (startRow + r < this.rows && startCol + c < this.cols) {
          this.grid[startRow + r][startCol + c] = 1;
        }
      }
    } else if (name === "beacon") {
      const coords = [[0, 0], [0, 1], [1, 0], [2, 3], [3, 2], [3, 3]];
      for (const [r, c] of coords) {
        if (startRow + r < this.rows && startCol + c < this.cols) {
          this.grid[startRow + r][startCol + c] = 1;
        }
      }
    } else if (name === "block") {
      const coords = [[0, 0], [0, 1], [1, 0], [1, 1]];
      for (const [r, c] of coords) {
        if (startRow + r < this.rows && startCol + c < this.cols) {
          this.grid[startRow + r][startCol + c] = 1;
        }
      }
    }
  }

  public countNeighbors(r: number, c: number): number {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = (r + dr + this.rows) % this.rows;
        const nc = (c + dc + this.cols) % this.cols;
        count += this.grid[nr][nc];
      }
    }
    return count;
  }

  /**
   * Standard Conway B3/S23 transition rule:
   * - Birth: Dead cell with exactly 3 neighbors becomes alive.
   * - Survival: Live cell with 2 or 3 neighbors stays alive.
   * - Death: All other live cells die (underpopulation or overpopulation).
   */
  public step(): void {
    const nextGrid = this.createEmptyGrid();
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const neighbors = this.countNeighbors(r, c);
        const alive = this.grid[r][c] === 1;
        if (alive && (neighbors === 2 || neighbors === 3)) {
          nextGrid[r][c] = 1;
        } else if (!alive && neighbors === 3) {
          nextGrid[r][c] = 1;
        }
      }
    }
    this.grid = nextGrid;
  }

  public getEntropyHash(): string {
    const serialized = JSON.stringify(this.grid);
    return crypto.createHash("sha256").update(serialized).digest("hex");
  }

  public getLiveCellCount(): number {
    return this.grid.reduce((sum, row) => sum + row.reduce((rSum, cell) => rSum + cell, 0), 0);
  }
}

// --- Deterministic 10-State Transaction Automaton ---

export type TxState =
  | "CREATED"
  | "VALIDATED"
  | "AUTHORIZATION_REQUIRED"
  | "AUTHORIZED"
  | "SETTLING"
  | "SETTLED"
  | "EXECUTING"
  | "VERIFIED"
  | "FAILED"
  | "CANCELLED";

export interface StateTransitionEvent {
  from: TxState;
  to: TxState;
  timestamp: number;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentIntent {
  id: string;
  buyer: string;
  merchant: string;
  amount: string; // in MUSD (e.g. "0.001")
  asset: string;  // e.g. "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503"
  network: string; // e.g. "eip155:31611"
  serviceId: string;
  state: TxState;
  history: StateTransitionEvent[];
  settlementTxHash?: string;
  createdAt: number;
  updatedAt: number;
}

export class TransactionStateMachine {
  private static readonly VALID_TRANSITIONS: Record<TxState, TxState[]> = {
    CREATED: ["VALIDATED", "FAILED", "CANCELLED"],
    VALIDATED: ["AUTHORIZATION_REQUIRED", "FAILED", "CANCELLED"],
    AUTHORIZATION_REQUIRED: ["AUTHORIZED", "FAILED", "CANCELLED"],
    AUTHORIZED: ["SETTLING", "FAILED", "CANCELLED"],
    SETTLING: ["SETTLED", "FAILED"],
    SETTLED: ["EXECUTING", "FAILED"],
    EXECUTING: ["VERIFIED", "FAILED"],
    VERIFIED: [], // Terminal successful state
    FAILED: [],   // Terminal error state
    CANCELLED: [] // Terminal cancel state
  };

  public static isValidTransition(from: TxState, to: TxState): boolean {
    const allowed = this.VALID_TRANSITIONS[from];
    return allowed ? allowed.includes(to) : false;
  }

  public static createIntent(
    buyer: string,
    merchant: string,
    amount: string,
    serviceId: string,
    asset: string = "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503",
    network: string = "eip155:31611"
  ): PaymentIntent {
    const now = Date.now();
    const id = `tx_${crypto.randomBytes(12).toString("hex")}`;
    return {
      id,
      buyer: buyer.toLowerCase(),
      merchant: merchant.toLowerCase(),
      amount,
      asset: asset.toLowerCase(),
      network,
      serviceId,
      state: "CREATED",
      history: [
        {
          from: "CREATED",
          to: "CREATED",
          timestamp: now,
          reason: "Intent created"
        }
      ],
      createdAt: now,
      updatedAt: now
    };
  }

  public static transition(
    intent: PaymentIntent,
    to: TxState,
    reason?: string,
    metadata?: Record<string, unknown>
  ): PaymentIntent {
    if (!this.isValidTransition(intent.state, to)) {
      throw new Error(
        `[Automaton Error] Illegal state transition from '${intent.state}' to '${to}' for intent ${intent.id}`
      );
    }

    const now = Date.now();
    const event: StateTransitionEvent = {
      from: intent.state,
      to,
      timestamp: now,
      reason,
      metadata
    };

    intent.state = to;
    intent.history.push(event);
    intent.updatedAt = now;

    if (metadata?.txHash && typeof metadata.txHash === "string") {
      intent.settlementTxHash = metadata.txHash;
    }

    return intent;
  }

  public static replayEvents(initialIntent: PaymentIntent, events: StateTransitionEvent[]): PaymentIntent {
    const replayed = { ...initialIntent, history: [...initialIntent.history] };
    for (const ev of events) {
      if (!this.isValidTransition(replayed.state, ev.to)) {
        throw new Error(`[Automaton Replay Error] Invalid replayed transition to ${ev.to}`);
      }
      replayed.state = ev.to;
      replayed.history.push(ev);
      replayed.updatedAt = ev.timestamp;
    }
    return replayed;
  }
}
