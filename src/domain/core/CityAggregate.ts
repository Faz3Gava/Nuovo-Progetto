import { ResourceDeltaData, CitySnapshotData } from '../../types';
import { CitySnapshot } from './CitySnapshot';

/**
 * Aggregate Root for global city state (DDD pattern).
 * The only place where city metrics can be mutated, purely through applyDelta.
 */
export class CityAggregate {
  public static readonly MIN_BUDGET: number = -10000;
  public static readonly MIN_HAPPINESS: number = 0.0;
  public static readonly MAX_HAPPINESS: number = 100.0;

  private budget: number;
  private pollution: number;
  private population: number;
  private happiness: number;
  private tickCount: number;

  constructor(
    initialBudget: number = 1500,
    initialPopulation: number = 0,
    initialHappiness: number = 50.0
  ) {
    this.budget = initialBudget;
    this.pollution = 0.0;
    this.population = initialPopulation;
    this.happiness = CityAggregate.clamp(initialHappiness);
    this.tickCount = 0;
    this.validateInvariants();
  }

  public applyDelta(delta: ResourceDeltaData): void {
    const nextBudget = this.budget + delta.budgetDelta;
    const nextPollution = Math.max(0.0, this.pollution + delta.pollutionDelta);
    const nextPopulation = this.population + delta.populationDelta;
    const nextHappiness = CityAggregate.clamp(this.happiness + delta.happinessDelta);

    // Check invariants
    if (nextBudget < CityAggregate.MIN_BUDGET) {
      throw new Error(
        `Invariant violated: budget $${nextBudget.toFixed(2)} is below bankruptcy threshold $${CityAggregate.MIN_BUDGET}`
      );
    }
    if (nextPopulation < 0) {
      throw new Error(
        `Invariant violated: population cannot be negative (${nextPopulation})`
      );
    }

    this.budget = nextBudget;
    this.pollution = nextPollution;
    this.population = nextPopulation;
    this.happiness = nextHappiness;
    this.tickCount++;
  }

  public exportSnapshot(): CitySnapshot {
    return new CitySnapshot(
      this.budget,
      this.pollution,
      this.population,
      this.happiness,
      this.tickCount
    );
  }

  public restoreFromSnapshot(snapshot: CitySnapshotData): void {
    this.budget = snapshot.budget;
    this.pollution = snapshot.pollution;
    this.population = snapshot.population;
    this.happiness = snapshot.happiness;
    this.tickCount = snapshot.tickCount;
    this.validateInvariants();
  }

  private validateInvariants(): void {
    if (this.budget < CityAggregate.MIN_BUDGET) {
      throw new Error(
        `Invariant violated: budget ${this.budget} is below bankruptcy threshold ${CityAggregate.MIN_BUDGET}`
      );
    }
    if (this.population < 0) {
      throw new Error(`Invariant violated: negative population (${this.population})`);
    }
  }

  private static clamp(value: number): number {
    return Math.min(CityAggregate.MAX_HAPPINESS, Math.max(CityAggregate.MIN_HAPPINESS, value));
  }
}
