import { IBuildingDescription, IBuildingState, IGridCommandPort, IGridReadPort, IPolicyStrategy, CitySnapshotData, ResourceDeltaData } from '../types';
import { BuildingCatalog } from './BuildingCatalog';
import { PlacementValidator } from './PlacementValidator';
import { SimulationEngine } from '../domain/tick/SimulationEngine';
import { ResourceDelta } from '../domain/core/ResourceDelta';

/**
 * Application-facing facade that orchestrates placement, demolition, time progression,
 * and policy changes for the UI layer.
 */
export class GameEngine {
  constructor(
    private readonly mapCommander: IGridCommandPort,
    private readonly gridReader: IGridReadPort,
    private readonly simulationEngine: SimulationEngine,
    private readonly catalog: BuildingCatalog,
    private readonly validator: PlacementValidator
  ) {
    if (!mapCommander) throw new Error('mapCommander cannot be null');
    if (!gridReader) throw new Error('gridReader cannot be null');
    if (!simulationEngine) throw new Error('simulationEngine cannot be null');
    if (!catalog) throw new Error('catalog cannot be null');
    if (!validator) throw new Error('validator cannot be null');
  }

  public getGridReader(): IGridReadPort {
    return this.gridReader;
  }

  public getMapCommander(): IGridCommandPort {
    return this.mapCommander;
  }

  public getSimulationEngine(): SimulationEngine {
    return this.simulationEngine;
  }

  public getCatalog(): BuildingCatalog {
    return this.catalog;
  }

  public getCitySnapshot(): CitySnapshotData {
    return this.simulationEngine.getCurrentSnapshot();
  }

  public placeBuilding(
    x: number,
    y: number,
    typeId: string,
    enforceBudget: boolean = true
  ): { success: boolean; building?: IBuildingState; error?: string } {
    if (!typeId || typeId.trim().length === 0) {
      return { success: false, error: 'Invalid building type' };
    }

    const description = this.catalog.getByTypeId(typeId);
    if (!description) {
      return { success: false, error: `Building type '${typeId}' not found in catalog` };
    }

    if (!this.validator.canPlace(x, y, typeId, this.gridReader)) {
      return { success: false, error: 'The selected footprint is blocked or out of bounds' };
    }

    // Check budget constraint
    const currentSnapshot = this.simulationEngine.getCurrentSnapshot();
    if (enforceBudget && currentSnapshot.budget < description.constructionCost) {
      return {
        success: false,
        error: `Insufficient funds: costs $${description.constructionCost} (Available: $${currentSnapshot.budget.toFixed(0)})`
      };
    }

    // Place building onto the grid
    const building = this.mapCommander.constructBuildingAt(x, y, description);

    // Apply immediate construction cost
    if (enforceBudget && description.constructionCost > 0) {
      // Construction delta: negative budget
      const costDelta = new ResourceDelta(-description.constructionCost, 0, 0, 0);
      const updatedSnapshot = {
        ...currentSnapshot,
        budget: currentSnapshot.budget - description.constructionCost
      };
      this.simulationEngine.loadState(updatedSnapshot);
    }

    return { success: true, building };
  }

  public demolishBuilding(x: number, y: number, refundPercent: number = 0.5): { success: boolean; building?: IBuildingState } {
    const cell = (this.gridReader as any).getCell ? (this.gridReader as any).getCell(x, y) : null;
    const existing = cell?.getBuilding ? cell.getBuilding() : null;

    const removed = this.mapCommander.removeBuildingAt(x, y);
    if (!removed) {
      return { success: false };
    }

    // Optional salvage refund
    if (existing && refundPercent > 0) {
      const refund = Math.floor(existing.getDescription().constructionCost * refundPercent);
      if (refund > 0) {
        const currentSnapshot = this.simulationEngine.getCurrentSnapshot();
        this.simulationEngine.loadState({
          ...currentSnapshot,
          budget: currentSnapshot.budget + refund
        });
      }
    }

    return { success: true, building: removed };
  }

  public advanceTime(): { snapshot: CitySnapshotData; delta: ResourceDeltaData } {
    return this.simulationEngine.advanceTick();
  }

  public setCityPolicy(policy: IPolicyStrategy): void {
    this.simulationEngine.activatePolicy(policy);
  }

  public clearCityPolicy(policyName: string): void {
    this.simulationEngine.deactivatePolicy(policyName);
  }

  public toggleBuildingPower(buildingId: string): boolean {
    const building = this.gridReader.getBuildingById(buildingId);
    if (!building) {
      return false;
    }
    building.setPowered(!building.isPowered());
    return true;
  }
}
