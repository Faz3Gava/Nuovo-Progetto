package com.citylogic.domain.map;

import com.citylogic.domain.buildings.IBuildingState;
import com.citylogic.domain.core.Dimension;

import java.util.List;
import java.util.Optional;

/**
 * Read-only port for querying the city spatial grid and buildings.
 */
public interface IGridReadPort {
    String getTerrainAt(int x, int y);
    Optional<IBuildingState> getBuildingById(String id);
    List<IBuildingState> getAllBuildings();
    List<IBuildingState> getAdjacentBuildings(String id, int radius);
    boolean isAreaFree(int x, int y, Dimension footprint);
    Dimension getDimensions();
    boolean isWithinBounds(int x, int y);
}
