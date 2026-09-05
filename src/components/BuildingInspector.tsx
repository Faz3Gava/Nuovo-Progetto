import React from 'react';
import { 
  Building2, 
  MapPin, 
  Maximize2, 
  Zap, 
  ZapOff, 
  Trash2, 
  X, 
  Coins, 
  Users, 
  Smile, 
  CloudFog,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { IBuildingState, Point } from '../types';
import { Grid } from '../domain/map/Grid';

interface BuildingInspectorProps {
  selectedPoint: Point | null;
  grid: Grid;
  onClose: () => void;
  onTogglePower: (buildingId: string) => void;
  onDemolish: (x: number, y: number) => void;
  onQuickPlace?: (typeId: string) => void;
}

export const BuildingInspector: React.FC<BuildingInspectorProps> = ({
  selectedPoint,
  grid,
  onClose,
  onTogglePower,
  onDemolish,
  onQuickPlace
}) => {
  if (!selectedPoint) return null;

  const cell = grid.getCell(selectedPoint.x, selectedPoint.y);
  const building = cell?.getBuilding();

  if (!building) {
    return (
      <div 
        id="building-inspector-panel"
        className="w-80 bg-slate-900 border-l border-slate-800 p-4 flex flex-col justify-between text-slate-100 shadow-2xl z-20"
      >
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Empty Plot</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Position
              </span>
              <span className="font-mono font-bold text-white">
                ({selectedPoint.x}, {selectedPoint.y})
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400">Terrain Type</span>
              <span className="font-semibold text-emerald-400">Zoned Land</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400">Ground Pollution</span>
              <span className="font-mono text-slate-200">
                {cell?.getPollutionLevel() ?? 0} ppm
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-400 text-center">
            Select a building from the toolbar to construct on this plot.
          </p>
        </div>
      </div>
    );
  }

  const desc = building.getDescription();
  const origin = building.getPosition();
  const isPowered = building.isPowered();
  const baseProd = building.getBaseProduction();
  const currentProd = building.getCurrentProduction();
  const adjacent = grid.getAdjacentBuildings(building.getId(), 2);

  return (
    <div 
      id="building-inspector-panel"
      className="w-80 bg-slate-900 border-l border-slate-800 p-4 flex flex-col justify-between text-slate-100 shadow-2xl z-20 overflow-y-auto"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">{desc.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isPowered ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}>
                {isPowered ? 'Powered' : 'Offline'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ID: {building.getId().substring(0, 8)}...
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Spatial Coordinates & Footprint */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] flex items-center gap-1 mb-0.5">
              <MapPin className="w-3 h-3 text-cyan-400" /> Origin
            </span>
            <span className="font-mono font-bold text-white">
              ({origin.x}, {origin.y})
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] flex items-center gap-1 mb-0.5">
              <Maximize2 className="w-3 h-3 text-indigo-400" /> Footprint
            </span>
            <span className="font-mono font-bold text-white">
              {desc.footprint.width} × {desc.footprint.height}
            </span>
          </div>
        </div>

        {/* Power State Controller */}
        <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPowered ? (
                <Zap className="w-4 h-4 text-emerald-400" />
              ) : (
                <ZapOff className="w-4 h-4 text-rose-400" />
              )}
              <span className="text-xs font-semibold text-slate-200">
                Electrical Grid Link
              </span>
            </div>
            <button
              id="toggle-building-power-btn"
              onClick={() => onTogglePower(building.getId())}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                isPowered
                  ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              {isPowered ? 'Active' : 'Disconnected'}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {isPowered
              ? 'Consuming maintenance and generating tick resource deltas.'
              : 'Temporarily disabled. Produces 0 resources and generates no municipal output.'}
          </p>
        </div>

        {/* Resource Production Breakdown */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Output per Tick
          </h4>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Coins className="w-3.5 h-3.5 text-emerald-400" /> Revenue
              </span>
              <span className={`font-mono font-bold ${currentProd.budgetDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {currentProd.budgetDelta >= 0 ? `+$${currentProd.budgetDelta}` : `-$${Math.abs(currentProd.budgetDelta)}`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Users className="w-3.5 h-3.5 text-cyan-400" /> Population
              </span>
              <span className="font-mono font-bold text-cyan-300">
                {currentProd.populationDelta > 0 ? `+${currentProd.populationDelta}` : currentProd.populationDelta}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Smile className="w-3.5 h-3.5 text-amber-400" /> Happiness
              </span>
              <span className="font-mono font-bold text-amber-300">
                {currentProd.happinessDelta > 0 ? `+${currentProd.happinessDelta}%` : `${currentProd.happinessDelta}%`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <CloudFog className="w-3.5 h-3.5 text-purple-400" /> Pollution
              </span>
              <span className="font-mono font-bold text-purple-300">
                {currentProd.pollutionDelta > 0 ? `+${currentProd.pollutionDelta}` : `${currentProd.pollutionDelta}`}
              </span>
            </div>
          </div>
        </div>

        {/* Spatial Neighbors / Chebyshev Proximity */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">
              Adjacent Buildings
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Radius ≤ 2
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] max-h-24 overflow-y-auto">
            {adjacent.length === 0 ? (
              <span className="text-slate-500 italic">No neighbors nearby</span>
            ) : (
              <ul className="space-y-1">
                {adjacent.map(n => (
                  <li key={n.getId()} className="flex items-center justify-between text-slate-300">
                    <span>{n.getType()}</span>
                    <span className="font-mono text-slate-500 text-[10px]">
                      ({n.getPosition().x}, {n.getPosition().y})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Demolish Action */}
      <div className="pt-4 border-t border-slate-800">
        <button
          id="demolish-selected-building-btn"
          onClick={() => onDemolish(origin.x, origin.y)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-lg shadow-rose-600/20"
        >
          <Trash2 className="w-4 h-4" />
          <span>Demolish (Recover ${Math.floor(desc.constructionCost * 0.5)})</span>
        </button>
      </div>
    </div>
  );
};
