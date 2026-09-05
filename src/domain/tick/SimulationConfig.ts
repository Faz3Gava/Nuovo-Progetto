import { ITickPhase } from '../../types';
import { ProductionPhase } from './ProductionPhase';
import { PolicyEvaluationPhase } from './PolicyEvaluationPhase';

export class TickPhaseFactory {
  public static readonly PHASE_PRODUCTION = 'PRODUCTION';
  public static readonly PHASE_POLICY = 'POLICY';

  public createPhases(enabledPhases: string[]): {
    phases: ITickPhase[];
    policyPhase?: PolicyEvaluationPhase;
  } {
    const phases: ITickPhase[] = [];
    let policyPhase: PolicyEvaluationPhase | undefined;

    for (const name of enabledPhases) {
      if (name === TickPhaseFactory.PHASE_PRODUCTION) {
        phases.push(new ProductionPhase());
      } else if (name === TickPhaseFactory.PHASE_POLICY) {
        policyPhase = new PolicyEvaluationPhase();
        phases.push(policyPhase);
      } else {
        throw new Error(`Unknown phase: ${name}`);
      }
    }

    return { phases, policyPhase };
  }
}

export class SimulationConfig {
  constructor(public readonly enabledPhases: string[] = [
    TickPhaseFactory.PHASE_PRODUCTION,
    TickPhaseFactory.PHASE_POLICY
  ]) {}

  public static defaultConfig(): SimulationConfig {
    return new SimulationConfig();
  }
}
