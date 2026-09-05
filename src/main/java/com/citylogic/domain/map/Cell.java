package com.citylogic.domain.map;

import com.citylogic.domain.buildings.BuildingInstance;
import com.citylogic.domain.core.Point;

/**
 * Individual tile/cell in the city matrix.
 */
public class Cell {
    private final int x;
    private final int y;
    private final Point position;
    private double pollutionLevel;
    private BuildingInstance currentBuilding;

    public Cell(int x, int y) {
        this.x = x;
        this.y = y;
        this.position = new Point(x, y);
        this.pollutionLevel = 0.0;
        this.currentBuilding = null;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public Point getPosition() {
        return position;
    }

    public boolean isOccupied() {
        return currentBuilding != null;
    }

    public BuildingInstance getBuilding() {
        return currentBuilding;
    }

    public void setBuilding(BuildingInstance building) {
        this.currentBuilding = building;
    }

    public void clear() {
        this.currentBuilding = null;
    }

    public double getPollutionLevel() {
        return pollutionLevel;
    }

    public void setPollutionLevel(double pollutionLevel) {
        this.pollutionLevel = Math.max(0.0, pollutionLevel);
    }
}
