import { ResourceDeltaData } from '../../types';

/**
 * Value Object that represents a variation (delta) of city metrics
 * produced by a tick phase or a policy strategy.
 */
export class ResourceDelta implements ResourceDeltaData {
  public readonly budgetDelta: number;
  public readonly pollutionDelta: number;
  public readonly populationDelta: number;
  public readonly happinessDelta: number;

  constructor(
    budgetDelta: number = 0,
    pollutionDelta: number = 0,
    populationDelta: number = 0,
    happinessDelta: number = 0
  ) {
    this.budgetDelta = Number.isFinite(budgetDelta) ? budgetDelta : 0;
    this.pollutionDelta = Number.isFinite(pollutionDelta) ? pollutionDelta : 0;
    this.populationDelta = Number.isInteger(populationDelta) ? populationDelta : Math.round(populationDelta);
    this.happinessDelta = Number.isFinite(happinessDelta) ? happinessDelta : 0;
  }

  public static zero(): ResourceDelta {
    return new ResourceDelta(0, 0, 0, 0);
  }

  public isEmpty(): boolean {
    return (
      this.budgetDelta === 0 &&
      this.pollutionDelta === 0 &&
      this.populationDelta === 0 &&
      this.happinessDelta === 0
    );
  }

  public merge(other: ResourceDeltaData): ResourceDelta {
    return new ResourceDelta(
      this.budgetDelta + (other.budgetDelta || 0),
      this.pollutionDelta + (other.pollutionDelta || 0),
      this.populationDelta + (other.populationDelta || 0),
      this.happinessDelta + (other.happinessDelta || 0)
    );
  }
}
