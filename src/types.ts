/**
 * CityLogic Core Types and Interface Contracts
 * Mirrored directly from the CityLogic Java Domain & Architecture
 */

export interface Point {
  x: number;
  y: number;
}

export interface Dimension {
  width: number;
  height: number;
}

export interface ResourceDeltaData {
  budgetDelta: number;
  pollutionDelta: number;
  populationDelta: number;
  happinessDelta: number;
}

export interface CitySnapshotData {
  budget: number;
  pollution: number;
  population: number;
  happiness: number;
  tickCount: number;
}

export interface IBuildingState {
  getId(): string;
  getType(): string;
  getPosition(): Point;
  getDescription(): IBuildingDescription;
  isPowered(): boolean;
  getBaseProduction(): ResourceDeltaData;
  getCurrentProduction(): ResourceDeltaData;
  setPowered(powered: boolean): void;
}

export interface IBuildingDescription {
  typeId: string;
  name: string;
  constructionCost: number;
  baseMaintenanceCost: number;
  footprint: Dimension;
  baseProduction: ResourceDeltaData;
  icon?: string;
  category?: 'residential' | 'industrial' | 'civic' | 'commercial' | 'utility';
  descriptionText?: string;
}

export interface IGridReadPort {
  getTerrainAt(x: number, y: number): string | null;
  getBuildingById(id: string): IBuildingState | undefined;
  getAllBuildings(): IBuildingState[];
  getAdjacentBuildings(id: string, radius: number): IBuildingState[];
  isAreaFree(x: number, y: number, footprint: Dimension): boolean;
  getDimensions(): Dimension;
}

export interface IGridCommandPort {
  constructBuildingAt(x: number, y: number, desc: IBuildingDescription): IBuildingState;
  removeBuildingAt(x: number, y: number): IBuildingState | null;
}

export interface IPolicyStrategy {
  getName(): string;
  getDescription(): string;
  getId(): string;
  calculateModifier(building: IBuildingState, grid: IGridReadPort): ResourceDeltaData;
}

export interface ITickPhase {
  execute(snapshot: CitySnapshotData, grid: IGridReadPort): ResourceDeltaData;
}

export interface ICityObserver {
  onMetricsChanged(snapshot: CitySnapshotData, delta: ResourceDeltaData): void;
}

export interface ICityEventPublisher {
  publish(snapshot: CitySnapshotData, delta: ResourceDeltaData): void;
  subscribe(observer: ICityObserver): void;
  unsubscribe(observer: ICityObserver): void;
}

export interface SimulationLogEntry {
  id: string;
  tick: number;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  delta?: ResourceDeltaData;
}
