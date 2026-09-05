import { IBuildingState, Point, IBuildingDescription, ResourceDeltaData } from '../../types';
import { ResourceDelta } from '../core/ResourceDelta';

export class BuildingInstance implements IBuildingState {
  public readonly id: string;
  public readonly description: IBuildingDescription;
  public readonly position: Point;
  private powered: boolean;
  public currentMaintenanceCost: number;

  constructor(description: IBuildingDescription, x: number, y: number, id?: string) {
    if (!description) {
      throw new Error('BuildingDescription cannot be null');
    }
    this.id = id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `b_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
    this.description = description;
    this.position = { x, y };
    this.powered = true;
    this.currentMaintenanceCost = description.baseMaintenanceCost;
  }

  public getId(): string {
    return this.id;
  }

  public getType(): string {
    return this.description.name;
  }

  public getPosition(): Point {
    return this.position;
  }

  public getDescription(): IBuildingDescription {
    return this.description;
  }

  public isPowered(): boolean {
    return this.powered;
  }

  public setPowered(powered: boolean): void {
    this.powered = powered;
  }

  public getBaseProduction(): ResourceDeltaData {
    return this.description.baseProduction;
  }

  public getCurrentProduction(): ResourceDeltaData {
    if (!this.powered) {
      return ResourceDelta.zero();
    }
    return this.description.baseProduction;
  }
}
