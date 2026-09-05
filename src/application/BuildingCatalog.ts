import { IBuildingDescription } from '../types';

/**
 * Application-level registry for selectable building descriptions.
 */
export class BuildingCatalog {
  private readonly byTypeId: Map<string, IBuildingDescription> = new Map();

  public register(description: IBuildingDescription): void {
    if (!description) {
      throw new Error('description cannot be null');
    }
    this.byTypeId.set(description.typeId, description);
  }

  public intern(description: IBuildingDescription): IBuildingDescription {
    if (!description) {
      throw new Error('description cannot be null');
    }
    if (!this.byTypeId.has(description.typeId)) {
      this.byTypeId.set(description.typeId, description);
    }
    return this.byTypeId.get(description.typeId)!;
  }

  public getByTypeId(typeId: string): IBuildingDescription | undefined {
    if (!typeId) return undefined;
    return this.byTypeId.get(typeId);
  }

  public listAll(): IBuildingDescription[] {
    return Array.from(this.byTypeId.values());
  }
}
