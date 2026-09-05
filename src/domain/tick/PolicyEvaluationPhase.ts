import { CitySnapshotData, IGridReadPort, IPolicyStrategy, ITickPhase, ResourceDeltaData } from '../../types';
import { ResourceDelta } from '../core/ResourceDelta';

/**
 * Policy Evaluation Phase: applies all active municipal ordinances
 * (IPolicyStrategy instances) to each powered building on the grid
 * and accumulates the resulting modifiers.
 */
export class PolicyEvaluationPhase implements ITickPhase {
  private readonly activePolicies: Map<string, IPolicyStrategy> = new Map();

  public activatePolicy(policy: IPolicyStrategy): void {
    if (!policy) {
      throw new Error('Policy cannot be null');
    }
    const name = policy.getName();
    if (!this.activePolicies.has(name)) {
      this.activePolicies.set(name, policy);
    }
  }

  public deactivatePolicy(policyName: string): void {
    if (!policyName) {
      throw new Error('Policy name cannot be null');
    }
    this.activePolicies.delete(policyName);
  }

  public getActivePolicyNames(): string[] {
    return Array.from(this.activePolicies.keys());
  }

  public getActivePolicies(): IPolicyStrategy[] {
    return Array.from(this.activePolicies.values());
  }

  public execute(snapshot: CitySnapshotData, grid: IGridReadPort): ResourceDeltaData {
    let total = ResourceDelta.zero();

    const buildings = grid.getAllBuildings();
    const policies = Array.from(this.activePolicies.values());

    for (const building of buildings) {
      if (!building.isPowered()) {
        continue;
      }
      for (const policy of policies) {
        const mod = policy.calculateModifier(building, grid);
        if (mod) {
          total = total.merge(mod);
        }
      }
    }

    return total;
  }
}
