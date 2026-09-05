import { CitySnapshotData, ICityEventPublisher, IGridReadPort, IPolicyStrategy, ITickPhase, ResourceDeltaData } from '../../types';
import { CityAggregate } from '../core/CityAggregate';
import { ResourceDelta } from '../core/ResourceDelta';
import { PolicyEvaluationPhase } from './PolicyEvaluationPhase';
import { SimulationConfig, TickPhaseFactory } from './SimulationConfig';

export class SimulationEngine {
  private readonly cityState: CityAggregate;
  private readonly gridReader: IGridReadPort;
  private readonly eventPublisher: ICityEventPublisher;
  private readonly phases: ITickPhase[];
  private readonly policyPhase?: PolicyEvaluationPhase;
  private lastDelta: ResourceDeltaData = ResourceDelta.zero();

  constructor(
    cityState: CityAggregate,
    gridReader: IGridReadPort,
    eventPublisher: ICityEventPublisher,
    config: SimulationConfig = SimulationConfig.defaultConfig(),
    factory: TickPhaseFactory = new TickPhaseFactory()
  ) {
    if (!cityState) throw new Error('cityState cannot be null');
    if (!gridReader) throw new Error('gridReader cannot be null');
    if (!eventPublisher) throw new Error('eventPublisher cannot be null');

    this.cityState = cityState;
    this.gridReader = gridReader;
    this.eventPublisher = eventPublisher;

    const created = factory.createPhases(config.enabledPhases);
    this.phases = created.phases;
    this.policyPhase = created.policyPhase;
  }

  /**
   * Advances the simulation by one transactional tick.
   * Rollback is performed automatically if domain invariants are violated.
   */
  public advanceTick(): { snapshot: CitySnapshotData; delta: ResourceDeltaData } {
    // 1. Transactional backup
    const startSnapshot = this.cityState.exportSnapshot();

    // 2. Execute tick pipeline
    let totalDelta = ResourceDelta.zero();
    for (const phase of this.phases) {
      const delta = phase.execute(startSnapshot, this.gridReader);
      totalDelta = totalDelta.merge(delta);
    }

    // 3. Commit delta or rollback
    try {
      this.cityState.applyDelta(totalDelta);
    } catch (err: unknown) {
      this.cityState.restoreFromSnapshot(startSnapshot);
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Simulation Tick Failed (Rolled back): ${msg}`);
    }

    const currentSnapshot = this.cityState.exportSnapshot();
    this.lastDelta = totalDelta;

    // 4. Notify observers
    this.eventPublisher.publish(currentSnapshot, totalDelta);

    return { snapshot: currentSnapshot, delta: totalDelta };
  }

  public getCurrentSnapshot(): CitySnapshotData {
    return this.cityState.exportSnapshot();
  }

  public getLastDelta(): ResourceDeltaData {
    return this.lastDelta;
  }

  public loadState(snapshot: CitySnapshotData): void {
    this.cityState.restoreFromSnapshot(snapshot);
    this.eventPublisher.publish(this.cityState.exportSnapshot(), ResourceDelta.zero());
  }

  public activatePolicy(policy: IPolicyStrategy): void {
    if (!this.policyPhase) {
      throw new Error('PolicyEvaluationPhase is not enabled in simulation pipeline');
    }
    this.policyPhase.activatePolicy(policy);
  }

  public deactivatePolicy(policyName: string): void {
    if (!this.policyPhase) {
      throw new Error('PolicyEvaluationPhase is not enabled in simulation pipeline');
    }
    this.policyPhase.deactivatePolicy(policyName);
  }

  public getActivePolicyNames(): string[] {
    return this.policyPhase ? this.policyPhase.getActivePolicyNames() : [];
  }

  public getActivePolicies(): IPolicyStrategy[] {
    return this.policyPhase ? this.policyPhase.getActivePolicies() : [];
  }
}
