import { BuildingCatalog } from './BuildingCatalog';
import { IBuildingDescription, IGridReadPort } from '../types';

/**
 * Domain service used by the application facade to validate spatial placement.
 */
export class PlacementValidator {
  constructor(private readonly catalog: BuildingCatalog) {
    if (!catalog) throw new Error('catalog cannot be null');
  }

  public canPlace(x: number, y: number, typeId: string, grid: IGridReadPort): boolean {
    if (!grid || !typeId) {
      return false;
    }
    const description = this.catalog.getByTypeId(typeId);
    if (!description) {
      return false;
    }
    return grid.isAreaFree(x, y, description.footprint);
  }

  public canPlaceDescription(x: number, y: number, description: IBuildingDescription, grid: IGridReadPort): boolean {
    if (!description || !grid) {
      return false;
    }
    return grid.isAreaFree(x, y, description.footprint);
  }
}
