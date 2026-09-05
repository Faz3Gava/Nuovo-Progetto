import { CitySnapshotData, IGridReadPort, ITickPhase, ResourceDeltaData } from '../../types';
import { ResourceDelta } from '../core/ResourceDelta';

/**
 * Production Phase: sums the base contribution of all POWERED buildings
 * on the grid. Unpowered buildings do not produce anything.
 */
export class ProductionPhase implements ITickPhase {
  public execute(snapshot: CitySnapshotData, grid: IGridReadPort): ResourceDeltaData {
    let total = ResourceDelta.zero();

    for (const building of grid.getAllBuildings()) {
      if (building.isPowered()) {
        total = total.merge(building.getBaseProduction());
      }
    }

    return total;
  }
}
