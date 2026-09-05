import { Point } from '../../types';
import { BuildingInstance } from '../buildings/BuildingInstance';

export class Cell {
  public readonly x: number;
  public readonly y: number;
  public readonly position: Point;
  public pollutionLevel: number;
  public currentBuilding: BuildingInstance | null;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.position = { x, y };
    this.pollutionLevel = 0;
    this.currentBuilding = null;
  }

  public isOccupied(): boolean {
    return this.currentBuilding !== null;
  }

  public setBuilding(building: BuildingInstance): void {
    this.currentBuilding = building;
  }

  public clear(): void {
    this.currentBuilding = null;
  }

  public getBuilding(): BuildingInstance | null {
    return this.currentBuilding;
  }

  public getPollutionLevel(): number {
    return this.pollutionLevel;
  }
}
