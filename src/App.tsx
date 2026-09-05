import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { CityAggregate } from './domain/core/CityAggregate';
import { Grid } from './domain/map/Grid';
import { Dimension } from './domain/map/Dimension';
import { BuildingCatalog } from './application/BuildingCatalog';
import { ApplicationBuildingDescriptionProvider } from './application/ApplicationBuildingDescriptionProvider';
import { PlacementValidator } from './application/PlacementValidator';
import { CityEventPublisher } from './application/EventPublisher';
import { SimulationEngine } from './domain/tick/SimulationEngine';
import { GameEngine } from './application/GameEngine';
import { 
  EnvironmentalTaxPolicy, 
  GreenSubsidyPolicy, 
  EcoBufferZonePolicy, 
  HousingInitiativePolicy 
} from './application/policies/MunicipalPolicies';
import { CitySnapshotData, IPolicyStrategy, Point, ResourceDeltaData, SimulationLogEntry } from './types';
import { ResourceDelta } from './domain/core/ResourceDelta';

import { Header } from './components/Header';
import { GridCanvas } from './components/GridCanvas';
import { BuildToolbar } from './components/BuildToolbar';
import { BuildingInspector } from './components/BuildingInspector';
import { PolicyCouncil } from './components/PolicyCouncil';
import { SimulationLog } from './components/SimulationLog';
import { JavaCodeViewerModal } from './components/JavaCodeViewerModal';

const GRID_WIDTH = 12;
const GRID_HEIGHT = 9;

export function App() {
  // Available Municipal Policies
  const availablePolicies = useMemo<IPolicyStrategy[]>(() => [
    new EnvironmentalTaxPolicy(),
    new GreenSubsidyPolicy(),
    new EcoBufferZonePolicy(),
    new HousingInitiativePolicy(),
  ], []);

  // Initialize Game Architecture
  const { gameEngine, grid, catalog } = useMemo(() => {
    const cityAggregate = new CityAggregate(2500, 0, 70.0);
    const cityGrid = new Grid(new Dimension(GRID_WIDTH, GRID_HEIGHT));
    const cityCatalog = new BuildingCatalog();
    ApplicationBuildingDescriptionProvider.initDefaultCatalog(cityCatalog);

    const validator = new PlacementValidator(cityCatalog);
    const publisher = new CityEventPublisher();
    const simEngine = new SimulationEngine(cityAggregate, cityGrid, publisher);

    const engine = new GameEngine(cityGrid, cityGrid, simEngine, cityCatalog, validator);

    // Initial Starter Town placement
    engine.placeBuilding(3, 3, 'house', false);
    engine.placeBuilding(4, 3, 'house', false);
    engine.placeBuilding(5, 3, 'park', false);
    engine.placeBuilding(3, 5, 'commercial_hub', false);

    return { gameEngine: engine, grid: cityGrid, catalog: cityCatalog };
  }, []);

  // UI Reactive States
  const [snapshot, setSnapshot] = useState<CitySnapshotData>(() => gameEngine.getCitySnapshot());
  const [lastDelta, setLastDelta] = useState<ResourceDeltaData>(() => ResourceDelta.zero());
  const [gridRevision, setGridRevision] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [selectedCell, setSelectedCell] = useState<Point | null>(null);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState<boolean>(false);
  const [isJavaModalOpen, setIsJavaModalOpen] = useState<boolean>(false);
  const [activePolicyNames, setActivePolicyNames] = useState<string[]>([]);
  const [logs, setLogs] = useState<SimulationLogEntry[]>([
    {
      id: 'init-1',
      tick: 0,
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      message: 'Welcome to CityLogic. Starter village established with 2 houses, 1 park, and 1 commercial hub.'
    }
  ]);

  const addLog = useCallback((type: 'info' | 'success' | 'warning' | 'error', message: string, delta?: ResourceDeltaData) => {
    const entry: SimulationLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tick: snapshot.tickCount,
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      delta
    };
    setLogs(prev => [entry, ...prev.slice(0, 19)]);
  }, [snapshot.tickCount]);

  // Execute a single simulation tick
  const handleStepTick = useCallback(() => {
    try {
      const result = gameEngine.advanceTime();
      setSnapshot(result.snapshot);
      setLastDelta(result.delta);
      setGridRevision(r => r + 1);

      if (result.snapshot.budget < 0) {
        addLog('warning', `City in debt! Budget: $${result.snapshot.budget.toFixed(0)}`);
      }
    } catch (err: unknown) {
      setIsPlaying(false);
      const msg = err instanceof Error ? err.message : String(err);
      addLog('error', msg);
    }
  }, [gameEngine, addLog]);

  // Auto-play interval timer
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = Math.max(250, Math.floor(1000 / speed));
    const timer = setInterval(() => {
      handleStepTick();
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, speed, handleStepTick]);

  // Handle cell click on the grid canvas
  const handleCellClick = (x: number, y: number) => {
    if (selectedTool === 'select') {
      setSelectedCell({ x, y });
    } else if (selectedTool === 'demolish') {
      handleDemolish(x, y);
    } else {
      // Place building tool
      const res = gameEngine.placeBuilding(x, y, selectedTool, true);
      if (res.success && res.building) {
        setSnapshot(gameEngine.getCitySnapshot());
        setGridRevision(r => r + 1);
        setSelectedCell({ x, y });
        addLog('success', `Constructed ${res.building.getType()} at (${x}, ${y}) for $${res.building.getDescription().constructionCost}.`);
      } else {
        addLog('error', res.error || 'Failed to place building');
      }
    }
  };

  const handleDemolish = (x: number, y: number) => {
    const cell = grid.getCell(x, y);
    const existing = cell?.getBuilding();
    if (!existing) return;

    const name = existing.getType();
    const res = gameEngine.demolishBuilding(x, y, 0.5);
    if (res.success) {
      setSnapshot(gameEngine.getCitySnapshot());
      setGridRevision(r => r + 1);
      setSelectedCell(null);
      addLog('info', `Demolished ${name} at (${x}, ${y}). Recovered partial salvage funds.`);
    }
  };

  const handleTogglePower = (buildingId: string) => {
    const ok = gameEngine.toggleBuildingPower(buildingId);
    if (ok) {
      setGridRevision(r => r + 1);
      const b = grid.getBuildingById(buildingId);
      if (b) {
        addLog('info', `${b.getType()} grid power: ${b.isPowered() ? 'CONNECTED' : 'DISCONNECTED'}`);
      }
    }
  };

  const handleTogglePolicy = (policy: IPolicyStrategy) => {
    const isCurrentlyActive = activePolicyNames.includes(policy.getName());
    if (isCurrentlyActive) {
      gameEngine.clearCityPolicy(policy.getName());
      setActivePolicyNames(prev => prev.filter(n => n !== policy.getName()));
      addLog('info', `Repealed municipal ordinance: ${policy.getName()}`);
    } else {
      gameEngine.setCityPolicy(policy);
      setActivePolicyNames(prev => [...prev, policy.getName()]);
      addLog('success', `Enacted municipal ordinance: ${policy.getName()}`);
    }
  };

  const handleResetCity = () => {
    setIsPlaying(false);
    // Demolish all buildings
    for (const b of grid.getAllBuildings()) {
      grid.removeBuildingAt(b.getPosition().x, b.getPosition().y);
    }
    // Restore fresh snapshot
    gameEngine.getSimulationEngine().loadState({
      budget: 2500,
      pollution: 0,
      population: 0,
      happiness: 70.0,
      tickCount: 0
    });

    // Place starter buildings
    gameEngine.placeBuilding(3, 3, 'house', false);
    gameEngine.placeBuilding(4, 3, 'house', false);
    gameEngine.placeBuilding(5, 3, 'park', false);
    gameEngine.placeBuilding(3, 5, 'commercial_hub', false);

    setSnapshot(gameEngine.getCitySnapshot());
    setLastDelta(ResourceDelta.zero());
    setSelectedCell(null);
    setGridRevision(r => r + 1);
    addLog('info', 'City reset to initial foundation state ($2,500 treasury).');
  };

  const allBuildings = grid.getAllBuildings();
  const poweredCount = allBuildings.filter(b => b.isPowered()).length;
  const catalogList = catalog.listAll();
  const selectedBuildingDesc = catalog.getByTypeId(selectedTool) || null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Application Header */}
      <Header
        snapshot={snapshot}
        lastDelta={lastDelta}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onStepTick={handleStepTick}
        onReset={handleResetCity}
        speed={speed}
        onSpeedChange={setSpeed}
        totalBuildings={allBuildings.length}
        poweredBuildings={poweredCount}
        bankruptcyThreshold={CityAggregate.MIN_BUDGET}
        onOpenPolicies={() => setIsPolicyModalOpen(true)}
        activePoliciesCount={activePolicyNames.length}
        onOpenJavaCode={() => setIsJavaModalOpen(true)}
      />

      {/* Main Workspace (Grid Canvas + Building Inspector) */}
      <div className="flex-1 flex overflow-hidden relative">
        <GridCanvas
          key={gridRevision}
          grid={grid}
          selectedTool={selectedTool}
          selectedBuildingDescription={selectedBuildingDesc}
          selectedCell={selectedCell}
          onSelectCell={setSelectedCell}
          onCellClick={handleCellClick}
          onQuickDemolish={handleDemolish}
        />

        {selectedCell && (
          <BuildingInspector
            selectedPoint={selectedCell}
            grid={grid}
            onClose={() => setSelectedCell(null)}
            onTogglePower={handleTogglePower}
            onDemolish={handleDemolish}
          />
        )}
      </div>

      {/* Event and Transaction Feed */}
      <SimulationLog logs={logs} />

      {/* Bottom Construction Palette */}
      <BuildToolbar
        catalog={catalogList}
        selectedTool={selectedTool}
        onSelectTool={setSelectedTool}
        playerBudget={snapshot.budget}
      />

      {/* Municipal Policy Council Modal */}
      <PolicyCouncil
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        availablePolicies={availablePolicies}
        activePolicyNames={activePolicyNames}
        onTogglePolicy={handleTogglePolicy}
        gameEngine={gameEngine}
      />

      {/* Java & JavaFX Source Code Inspector and Exporter */}
      <JavaCodeViewerModal
        isOpen={isJavaModalOpen}
        onClose={() => setIsJavaModalOpen(false)}
      />
    </div>
  );
}
export default App;
