/**
 * QMOOSA MEZO — Agent Policy & Spending Controller
 * 
 * Enforces:
 * 1. Per-request MUSD payment caps.
 * 2. 24-hour sliding window daily budgets.
 * 3. Sensitive operation approval gates.
 * 4. Distinct agent identity and permission tracking.
 */

export interface AgentPolicyConfig {
  agentId: string;
  name: string;
  maxPerRequestMUSD: number; // e.g. 0.01 ($0.01)
  maxDailyMUSD: number;      // e.g. 1.00 ($1.00)
  allowedServices: string[]; // List of permitted service IDs or ["*"]
  requiresApprovalFor: string[]; // Sensitive operations e.g. ["contract_deploy", "vault_deposit"]
}

export interface SpendRecord {
  timestamp: number;
  amountMUSD: number;
  serviceId: string;
  txHash?: string;
}

export class AgentPolicyEngine {
  private policies = new Map<string, AgentPolicyConfig>();
  private spendHistory = new Map<string, SpendRecord[]>();

  constructor() {
    // Default system policy for autonomous micro-agents
    this.registerPolicy({
      agentId: "agent_default",
      name: "Standard Autonomous Assistant",
      maxPerRequestMUSD: 0.01,
      maxDailyMUSD: 1.00,
      allowedServices: ["*"],
      requiresApprovalFor: ["vault_deposit", "contract_deploy", "admin_transfer"]
    });
  }

  public registerPolicy(config: AgentPolicyConfig): void {
    this.policies.set(config.agentId, config);
    if (!this.spendHistory.has(config.agentId)) {
      this.spendHistory.set(config.agentId, []);
    }
  }

  public getPolicy(agentId: string): AgentPolicyConfig | undefined {
    return this.policies.get(agentId) ?? this.policies.get("agent_default");
  }

  /**
   * Calculates the agent's total spend within the past 24 hours.
   */
  public get24hSpend(agentId: string): number {
    const records = this.spendHistory.get(agentId) || [];
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return records
      .filter((r) => r.timestamp >= oneDayAgo)
      .reduce((sum, r) => sum + r.amountMUSD, 0);
  }

  /**
   * Evaluates if a proposed transaction violates any policy limits or requires manual approval.
   */
  public evaluateSpend(
    agentId: string,
    amountMUSD: number,
    serviceId: string,
    operationType: string = "service_call"
  ): {
    approved: boolean;
    reason?: string;
    requiresManualApproval: boolean;
  } {
    const policy = this.getPolicy(agentId);
    if (!policy) {
      return { approved: false, reason: `No policy found for agent ${agentId}`, requiresManualApproval: false };
    }

    // 1. Check Service Permission
    if (!policy.allowedServices.includes("*") && !policy.allowedServices.includes(serviceId)) {
      return {
        approved: false,
        reason: `Service '${serviceId}' not permitted for agent ${agentId}`,
        requiresManualApproval: false
      };
    }

    // 2. Check Per-Request Cap
    if (amountMUSD > policy.maxPerRequestMUSD) {
      return {
        approved: false,
        reason: `Amount $${amountMUSD} exceeds per-request cap of $${policy.maxPerRequestMUSD} MUSD`,
        requiresManualApproval: false
      };
    }

    // 3. Check 24-hour Daily Budget
    const current24h = this.get24hSpend(agentId);
    if (current24h + amountMUSD > policy.maxDailyMUSD) {
      return {
        approved: false,
        reason: `Spend of $${amountMUSD} would exceed daily budget (Spent: $${current24h.toFixed(4)}, Max: $${policy.maxDailyMUSD} MUSD)`,
        requiresManualApproval: false
      };
    }

    // 4. Check Sensitive Operation Gate
    if (policy.requiresApprovalFor.includes(operationType)) {
      return {
        approved: false,
        reason: `Operation '${operationType}' requires explicit human out-of-band authorization`,
        requiresManualApproval: true
      };
    }

    return { approved: true, requiresManualApproval: false };
  }

  /**
   * Records a successfully executed and settled transaction into the agent's ledger.
   */
  public recordSpend(agentId: string, amountMUSD: number, serviceId: string, txHash?: string): void {
    if (!this.spendHistory.has(agentId)) {
      this.spendHistory.set(agentId, []);
    }
    this.spendHistory.get(agentId)!.push({
      timestamp: Date.now(),
      amountMUSD,
      serviceId,
      txHash
    });
  }

  /**
   * Resets spend history (for testing purposes).
   */
  public resetHistory(agentId?: string): void {
    if (agentId) {
      this.spendHistory.set(agentId, []);
    } else {
      this.spendHistory.clear();
    }
  }
}
