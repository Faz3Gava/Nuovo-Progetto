import { CitySnapshotData } from '../../types';

/**
 * Immutable snapshot of city metrics at a given simulation instant.
 */
export class CitySnapshot implements CitySnapshotData {
  public readonly budget: number;
  public readonly pollution: number;
  public readonly population: number;
  public readonly happiness: number;
  public readonly tickCount: number;

  constructor(
    budget: number,
    pollution: number,
    population: number,
    happiness: number,
    tickCount: number
  ) {
    this.budget = budget;
    this.pollution = Math.max(0, pollution);
    this.population = Math.max(0, population);
    this.happiness = Math.min(100, Math.max(0, happiness));
    this.tickCount = Math.max(0, tickCount);
  }
}
