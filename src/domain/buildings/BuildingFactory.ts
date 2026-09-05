import { IBuildingDescription } from '../../types';
import { BuildingInstance } from './BuildingInstance';

export class BuildingFactory {
  public createBuilding(description: IBuildingDescription, x: number, y: number): BuildingInstance {
    return new BuildingInstance(description, x, y);
  }
}
