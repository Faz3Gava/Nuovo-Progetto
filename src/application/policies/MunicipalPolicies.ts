import { IBuildingState, IGridReadPort, IPolicyStrategy, ResourceDeltaData } from '../../types';
import { ResourceDelta } from '../../domain/core/ResourceDelta';

/**
 * Environmental Tax (Tassa Ambientale)
 * Imposes a pollution fee on all industrial factories: generates revenue but slightly dampens happiness.
 */
export class EnvironmentalTaxPolicy implements IPolicyStrategy {
  public getId(): string {
    return 'policy_environmental_tax';
  }

  public getName(): string {
    return 'Environmental Tax';
  }

  public getDescription(): string {
    return 'Levies a $60 municipal fee per active factory, generating revenue while slightly reducing industrial happiness (-1.5).';
  }

  public calculateModifier(building: IBuildingState, grid: IGridReadPort): ResourceDeltaData {
    const desc = building.getDescription();
    if (desc.category === 'industrial' || desc.name.toLowerCase().includes('factory')) {
      return new ResourceDelta(60.0, 0, 0, -1.5);
    }
    return ResourceDelta.zero();
  }
}

/**
 * Green Subsidy (Sussidio Verde)
 * Funds public park enhancements, increasing happiness and clearing smog.
 */
export class GreenSubsidyPolicy implements IPolicyStrategy {
  public getId(): string {
    return 'policy_green_subsidy';
  }

  public getName(): string {
    return 'Green Subsidy';
  }

  public getDescription(): string {
    return 'Allocates $15 per park for landscaping and botanical care, gaining +2.5 happiness and cleansing 2.0 pollution.';
  }

  public calculateModifier(building: IBuildingState, grid: IGridReadPort): ResourceDeltaData {
    const desc = building.getDescription();
    if (desc.category === 'civic' || desc.name.toLowerCase().includes('park')) {
      return new ResourceDelta(-15.0, -2.0, 0, 2.5);
    }
    return ResourceDelta.zero();
  }
}

/**
 * Eco-Buffer Zone
 * Spatial policy: Industrial factories buffered by parks within radius 2 gain eco-compliance bonuses.
 */
export class EcoBufferZonePolicy implements IPolicyStrategy {
  public getId(): string {
    return 'policy_eco_buffer';
  }

  public getName(): string {
    return 'Eco-Buffer Initiative';
  }

  public getDescription(): string {
    return 'Factories located near a park (radius 2) filter emissions: reduces pollution by -4 per adjacent park.';
  }

  public calculateModifier(building: IBuildingState, grid: IGridReadPort): ResourceDeltaData {
    const desc = building.getDescription();
    if (desc.category === 'industrial' || desc.name.toLowerCase().includes('factory')) {
      const adjacent = grid.getAdjacentBuildings(building.getId(), 2);
      const nearbyParks = adjacent.filter(
        b => b.getDescription().category === 'civic' || b.getDescription().name.toLowerCase().includes('park')
      ).length;

      if (nearbyParks > 0) {
        return new ResourceDelta(0, -4.0 * nearbyParks, 0, 1.0 * nearbyParks);
      }
    }
    return ResourceDelta.zero();
  }
}

/**
 * High-Density Housing Subsidy
 * Subsidizes residential zones to attract new families faster.
 */
export class HousingInitiativePolicy implements IPolicyStrategy {
  public getId(): string {
    return 'policy_housing_initiative';
  }

  public getName(): string {
    return 'Housing Development Grant';
  }

  public getDescription(): string {
    return 'Invests $8 per house in civic amenities: accelerates population influx (+2 citizens per house).';
  }

  public calculateModifier(building: IBuildingState, grid: IGridReadPort): ResourceDeltaData {
    const desc = building.getDescription();
    if (desc.category === 'residential' || desc.name.toLowerCase().includes('house')) {
      return new ResourceDelta(-8.0, 0, 2, 1.0);
    }
    return ResourceDelta.zero();
  }
}
