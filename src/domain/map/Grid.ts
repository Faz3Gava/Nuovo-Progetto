import { Dimension, IBuildingDescription, IBuildingState, IGridCommandPort, IGridReadPort } from '../../types';
import { BuildingFactory } from '../buildings/BuildingFactory';
import { BuildingInstance } from '../buildings/BuildingInstance';
import { Cell } from './Cell';

export class Grid implements IGridReadPort, IGridCommandPort {
  private readonly dimensions: Dimension;
  private readonly map: Cell[][];
  private readonly factory: BuildingFactory;
  private readonly activeBuildings: Map<string, BuildingInstance> = new Map();

  constructor(dimensions: Dimension, factory: BuildingFactory = new BuildingFactory()) {
    if (!dimensions || dimensions.width <= 0 || dimensions.height <= 0) {
      throw new Error('Valid grid dimensions must be provided');
    }
    this.dimensions = dimensions;
    this.factory = factory;

    this.map = [];
    for (let x = 0; x < dimensions.width; x++) {
      this.map[x] = [];
      for (let y = 0; y < dimensions.height; y++) {
        this.map[x][y] = new Cell(x, y);
      }
    }
  }

  public getDimensions(): Dimension {
    return this.dimensions;
  }

  public getCell(x: number, y: number): Cell | null {
    if (!this.isWithinBounds(x, y)) {
      return null;
    }
    return this.map[x][y];
  }

  public getTerrainAt(x: number, y: number): string | null {
    if (!this.isWithinBounds(x, y)) {
      return null;
    }
    return 'land';
  }

  public getBuildingById(id: string): IBuildingState | undefined {
    return this.activeBuildings.get(id);
  }

  public getAllBuildings(): IBuildingState[] {
    return Array.from(this.activeBuildings.values());
  }

  public getAdjacentBuildings(id: string, radius: number): IBuildingState[] {
    if (!id || radius < 0) {
      return [];
    }
    const origin = this.activeBuildings.get(id);
    if (!origin) {
      return [];
    }

    const ox = origin.position.x;
    const oy = origin.position.y;
    const adjacent: IBuildingState[] = [];

    for (const building of this.activeBuildings.values()) {
      if (building.getId() === id) {
        continue;
      }
      const dx = Math.abs(building.position.x - ox);
      const dy = Math.abs(building.position.y - oy);
      if (Math.max(dx, dy) <= radius) {
        adjacent.push(building);
      }
    }

    return adjacent;
  }

  public isAreaFree(x: number, y: number, footprint: Dimension): boolean {
    return this.validateSpatialPlacement(x, y, footprint);
  }

  public validateSpatialPlacement(x: number, y: number, footprint: Dimension): boolean {
    if (!footprint) {
      return false;
    }
    if (!this.isWithinBounds(x, y)) {
      return false;
    }
    if (
      !this.isWithinBounds(
        x + footprint.width - 1,
        y + footprint.height - 1
      )
    ) {
      return false;
    }

    for (let offsetX = 0; offsetX < footprint.width; offsetX++) {
      for (let offsetY = 0; offsetY < footprint.height; offsetY++) {
        const cell = this.map[x + offsetX][y + offsetY];
        if (cell.isOccupied()) {
          return false;
        }
      }
    }
    return true;
  }

  public constructBuildingAt(
    x: number,
    y: number,
    desc: IBuildingDescription
  ): BuildingInstance {
    if (!desc) {
      throw new Error('BuildingDescription cannot be null');
    }
    if (!this.validateSpatialPlacement(x, y, desc.footprint)) {
      throw new Error('Cannot construct building at the requested position');
    }

    const building = this.factory.createBuilding(desc, x, y);
    const footprint = desc.footprint;

    for (let offsetX = 0; offsetX < footprint.width; offsetX++) {
      for (let offsetY = 0; offsetY < footprint.height; offsetY++) {
        this.map[x + offsetX][y + offsetY].setBuilding(building);
      }
    }

    this.activeBuildings.set(building.getId(), building);
    return building;
  }

  public removeBuildingAt(x: number, y: number): BuildingInstance | null {
    if (!this.isWithinBounds(x, y)) {
      return null;
    }
    const cell = this.map[x][y];
    if (!cell.isOccupied() || !cell.currentBuilding) {
      return null;
    }

    const building = cell.currentBuilding;
    const footprint = building.description.footprint;
    const originX = building.position.x;
    const originY = building.position.y;

    for (let offsetX = 0; offsetX < footprint.width; offsetX++) {
      for (let offsetY = 0; offsetY < footprint.height; offsetY++) {
        const cx = originX + offsetX;
        const cy = originY + offsetY;
        if (this.isWithinBounds(cx, cy)) {
          const current = this.map[cx][cy];
          if (current.currentBuilding === building) {
            current.clear();
          }
        }
      }
    }

    this.activeBuildings.delete(building.getId());
    return building;
  }

  public isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.dimensions.width && y < this.dimensions.height;
  }
}
