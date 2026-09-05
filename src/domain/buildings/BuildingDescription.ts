import { IBuildingDescription, Dimension, ResourceDeltaData } from '../../types';
import { ResourceDelta } from '../core/ResourceDelta';

export class BuildingDescription implements IBuildingDescription {
  public readonly typeId: string;
  public readonly name: string;
  public readonly constructionCost: number;
  public readonly baseMaintenanceCost: number;
  public readonly footprint: Dimension;
  public readonly baseProduction: ResourceDeltaData;
  public readonly icon?: string;
  public readonly category?: 'residential' | 'industrial' | 'civic' | 'commercial' | 'utility';
  public readonly descriptionText?: string;

  constructor(
    name: string,
    constructionCost: number,
    baseMaintenanceCost: number,
    footprint: Dimension,
    baseProduction: ResourceDeltaData = ResourceDelta.zero(),
    category: 'residential' | 'industrial' | 'civic' | 'commercial' | 'utility' = 'residential',
    icon?: string,
    descriptionText?: string
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error('BuildingDescription name cannot be null or blank');
    }
    if (constructionCost < 0 || baseMaintenanceCost < 0) {
      throw new Error('Costs cannot be negative');
    }
    if (!footprint) {
      throw new Error('Footprint cannot be null');
    }
    this.name = name;
    this.typeId = name.trim().toLowerCase().replace(/\s+/g, '_');
    this.constructionCost = constructionCost;
    this.baseMaintenanceCost = baseMaintenanceCost;
    this.footprint = footprint;
    this.baseProduction = baseProduction;
    this.category = category;
    this.icon = icon;
    this.descriptionText = descriptionText;
  }
}
