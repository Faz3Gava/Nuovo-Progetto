import React, { useState } from 'react';
import { 
  Home, 
  Factory, 
  Trees, 
  Store, 
  Sun, 
  Zap, 
  ZapOff, 
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { IBuildingDescription, IBuildingState, Point } from '../types';
import { Grid } from '../domain/map/Grid';

interface GridCanvasProps {
  grid: Grid;
  selectedTool: string | null; // 'select' | 'demolish' | typeId
  selectedBuildingDescription: IBuildingDescription | null;
  selectedCell: Point | null;
  onSelectCell: (point: Point | null) => void;
  onCellClick: (x: number, y: number) => void;
  onQuickDemolish: (x: number, y: number) => void;
}

export const GridCanvas: React.FC<GridCanvasProps> = ({
  grid,
  selectedTool,
  selectedBuildingDescription,
  selectedCell,
  onSelectCell,
  onCellClick,
  onQuickDemolish
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);

  const dimensions = grid.getDimensions();
  const width = dimensions.width;
  const height = dimensions.height;

  // Compute which cells are highlighted by placement preview
  const getPreviewCells = () => {
    if (!hoveredPoint || !selectedBuildingDescription) return { cells: new Set<string>(), isValid: false };

    const footprint = selectedBuildingDescription.footprint;
    const cells = new Set<string>();
    const isValid = grid.isAreaFree(hoveredPoint.x, hoveredPoint.y, footprint);

    for (let dx = 0; dx < footprint.width; dx++) {
      for (let dy = 0; dy < footprint.height; dy++) {
        const cx = hoveredPoint.x + dx;
        const cy = hoveredPoint.y + dy;
        if (cx < width && cy < height) {
          cells.add(`${cx},${cy}`);
        }
      }
    }
    return { cells, isValid };
  };

  const { cells: previewCells, isValid: isPlacementValid } = getPreviewCells();

  // Find if a cell belongs to currently selected building
  const isCellInSelectedBuilding = (x: number, y: number): boolean => {
    if (!selectedCell) return false;
    const selectedObjCell = grid.getCell(selectedCell.x, selectedCell.y);
    const selectedBuilding = selectedObjCell?.getBuilding();
    if (!selectedBuilding) return selectedCell.x === x && selectedCell.y === y;

    const cell = grid.getCell(x, y);
    return cell?.getBuilding() === selectedBuilding;
  };

  const getBuildingVisual = (building: IBuildingState, isOrigin: boolean) => {
    const desc = building.getDescription();
    const type = desc.name.toLowerCase();
    const powered = building.isPowered();

    if (type.includes('house')) {
      return {
        bg: 'bg-gradient-to-br from-amber-700/80 to-orange-900/90 border-orange-600/70',
        accent: 'text-amber-200',
        icon: <Home className="w-5 h-5 text-amber-200" />,
        label: 'House',
        popBadge: '+4'
      };
    } else if (type.includes('factory')) {
      return {
        bg: 'bg-gradient-to-br from-stone-800 to-zinc-950 border-amber-500/60',
        accent: 'text-amber-400',
        icon: <Factory className="w-6 h-6 text-amber-400" />,
        label: 'Factory',
        popBadge: null
      };
    } else if (type.includes('park')) {
      return {
        bg: 'bg-gradient-to-br from-emerald-800/80 to-green-950/90 border-emerald-500/60',
        accent: 'text-emerald-300',
        icon: <Trees className="w-5 h-5 text-emerald-300" />,
        label: 'Park',
        popBadge: '💚'
      };
    } else if (type.includes('commercial')) {
      return {
        bg: 'bg-gradient-to-br from-cyan-900/80 to-blue-950/90 border-cyan-500/60',
        accent: 'text-cyan-300',
        icon: <Store className="w-5 h-5 text-cyan-300" />,
        label: 'Commercial',
        popBadge: '💼'
      };
    } else if (type.includes('solar')) {
      return {
        bg: 'bg-gradient-to-br from-sky-800 to-indigo-950 border-sky-400/60',
        accent: 'text-sky-300',
        icon: <Sun className="w-6 h-6 text-sky-300" />,
        label: 'Solar Plant',
        popBadge: '⚡'
      };
    }

    return {
      bg: 'bg-slate-800 border-slate-600',
      accent: 'text-slate-300',
      icon: <HelpCircle className="w-5 h-5" />,
      label: desc.name,
      popBadge: null
    };
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 overflow-auto bg-slate-950/90">
      {/* Grid container */}
      <div 
        id="grid-canvas-container"
        className="relative bg-slate-900/90 p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-2xl shadow-black/60 max-w-full overflow-auto"
      >
        {/* Placement Status Banner */}
        {selectedBuildingDescription && hoveredPoint && (
          <div className="absolute top-2 left-4 right-4 z-20 pointer-events-none flex justify-between items-center px-3 py-1.5 rounded-lg bg-slate-950/90 backdrop-blur border border-slate-800 text-xs">
            <span className="font-semibold text-slate-200">
              Placing <span className="text-white font-bold">{selectedBuildingDescription.name}</span> ({selectedBuildingDescription.footprint.width}x{selectedBuildingDescription.footprint.height}) at ({hoveredPoint.x}, {hoveredPoint.y})
            </span>
            <span className={`flex items-center gap-1 font-bold ${isPlacementValid ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPlacementValid ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Area Free (${selectedBuildingDescription.constructionCost})
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" /> Invalid / Obstructed
                </>
              )}
            </span>
          </div>
        )}

        {/* The 2D Grid Cells */}
        <div 
          className="grid gap-1 sm:gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
            width: `${width * 54}px`,
            maxWidth: '100%'
          }}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {Array.from({ length: height }).map((_, y) => (
            <React.Fragment key={`row-${y}`}>
              {Array.from({ length: width }).map((_, x) => {
                const cell = grid.getCell(x, y);
                const building = cell?.getBuilding();
                const key = `${x},${y}`;
                const isHovered = hoveredPoint?.x === x && hoveredPoint?.y === y;
                const inPreview = previewCells.has(key);
                const isSelected = isCellInSelectedBuilding(x, y);
                const isDemolishTarget = selectedTool === 'demolish' && isHovered && building;

                const isOrigin = building ? building.getPosition().x === x && building.getPosition().y === y : false;
                const visual = building ? getBuildingVisual(building, isOrigin) : null;

                return (
                  <div
                    key={key}
                    id={`cell-${x}-${y}`}
                    onClick={() => {
                      if (selectedTool === 'demolish' && building) {
                        onQuickDemolish(x, y);
                      } else {
                        onCellClick(x, y);
                      }
                    }}
                    onMouseEnter={() => setHoveredPoint({ x, y })}
                    className={`
                      relative aspect-square w-11 sm:w-13 h-11 sm:h-13 rounded-lg flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-150 text-xs font-mono
                      ${building ? visual?.bg : 'bg-slate-900 hover:bg-slate-800/80 border border-slate-800/80'}
                      ${isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 z-10 shadow-lg shadow-cyan-500/20' : ''}
                      ${inPreview && isPlacementValid ? 'bg-emerald-500/30 border-2 border-emerald-400 ring-2 ring-emerald-500/40 z-10 animate-pulse' : ''}
                      ${inPreview && !isPlacementValid ? 'bg-rose-500/30 border-2 border-rose-500 ring-2 ring-rose-500/40 z-10' : ''}
                      ${isDemolishTarget ? 'bg-rose-600/70 border-2 border-rose-400 animate-pulse text-white z-10' : ''}
                    `}
                    title={building ? `${building.getType()} (${building.isPowered() ? 'Powered' : 'Unpowered'}) at (${x},${y})` : `Empty Plot (${x},${y})`}
                  >
                    {/* Grid coordinate watermark on empty tiles */}
                    {!building && !inPreview && (
                      <span className="text-[9px] text-slate-700 font-mono select-none">
                        {x},{y}
                      </span>
                    )}

                    {/* Building Visual Representation */}
                    {building && (
                      <>
                        {isOrigin ? (
                          <div className="flex flex-col items-center justify-center pointer-events-none">
                            <div className="relative">
                              {visual?.icon}
                              {/* Power indicator badge */}
                              <span 
                                className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-slate-950 flex items-center justify-center ${
                                  building.isPowered() ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-rose-500'
                                }`}
                                title={building.isPowered() ? 'Powered' : 'Offline / Unpowered'}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-white tracking-tight mt-0.5 max-w-[46px] truncate leading-none">
                              {visual?.label}
                            </span>
                          </div>
                        ) : (
                          // Secondary cell in multi-cell footprint (e.g. 2x2 Factory)
                          <div className="flex flex-col items-center justify-center pointer-events-none opacity-40">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400/50" />
                          </div>
                        )}
                      </>
                    )}

                    {/* Demolish Hover Overlay */}
                    {isDemolishTarget && (
                      <div className="absolute inset-0 flex items-center justify-center bg-rose-950/80 rounded-lg">
                        <Trash2 className="w-5 h-5 text-rose-300 animate-bounce" />
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Bottom helper text */}
        <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 px-1 gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Powered
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Unpowered
            </span>
            <span className="text-slate-500">
              Grid: {width} × {height} ({width * height} plots)
            </span>
          </div>
          <span className="text-slate-400">
            Click to inspect building or place from toolbar below
          </span>
        </div>
      </div>
    </div>
  );
};
