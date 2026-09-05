import { BuildingCatalog } from './BuildingCatalog';
import { BuildingDescription } from '../domain/buildings/BuildingDescription';
import { Dimension } from '../domain/map/Dimension';
import { ResourceDelta } from '../domain/core/ResourceDelta';

export class ApplicationBuildingDescriptionProvider {
  public static initDefaultCatalog(catalog: BuildingCatalog): void {
    if (!catalog) {
      throw new Error('catalog cannot be null');
    }

    // 1. House (from original Java ApplicationBuildingDescriptionProvider)
    // Impatta esclusivamente la popolazione (incremento di +4)
    const house = new BuildingDescription(
      'House',
      100,
      1,
      new Dimension(1, 1),
      new ResourceDelta(0, 0.0, 4, 0.0),
      'residential',
      'Home',
      'Residential housing providing living space for 4 citizens.'
    );
    catalog.register(house);

    // 2. Factory (from original Java ApplicationBuildingDescriptionProvider)
    // Generates strong budget revenue (+150) but produces substantial pollution (+10)
    const factory = new BuildingDescription(
      'Factory',
      1000,
      5,
      new Dimension(2, 2),
      new ResourceDelta(150.0, 10.0, 0, 0.0),
      'industrial',
      'Factory',
      'Heavy manufacturing that generates revenue at the cost of pollution.'
    );
    catalog.register(factory);

    // 3. Park (from original Java ApplicationBuildingDescriptionProvider)
    // Impatta esclusivamente la felicità della città (+2.0)
    const park = new BuildingDescription(
      'Park',
      150,
      0,
      new Dimension(1, 1),
      new ResourceDelta(0, 0.0, 0, 2.0),
      'civic',
      'Trees',
      'Recreational public park that elevates citizen happiness.'
    );
    catalog.register(park);

    // 4. Commercial Store / Hub
    // Provides job opportunities, moderate tax revenue (+45) and minor happiness (+0.5)
    const commercial = new BuildingDescription(
      'Commercial Hub',
      350,
      2,
      new Dimension(1, 1),
      new ResourceDelta(45.0, 1.0, 0, 0.5),
      'commercial',
      'Store',
      'Retail and service district contributing steady tax revenue.'
    );
    catalog.register(commercial);

    // 5. Solar Plant
    // Clean energy infrastructure that reduces city pollution footprint
    const solarPlant = new BuildingDescription(
      'Solar Plant',
      750,
      4,
      new Dimension(2, 2),
      new ResourceDelta(-25.0, -4.0, 0, 1.0),
      'utility',
      'Sun',
      'Renewable solar farm providing clean electricity and mitigating smog.'
    );
    catalog.register(solarPlant);
  }
}
