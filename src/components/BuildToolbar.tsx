import React from 'react';
import { 
  MousePointer, 
  Trash2, 
  Home, 
  Factory, 
  Trees, 
  Store, 
  Sun,
  Coins
} from 'lucide-react';
import { IBuildingDescription } from '../types';

interface BuildToolbarProps {
  catalog: IBuildingDescription[];
  selectedTool: string; // 'select' | 'demolish' | typeId
  onSelectTool: (tool: string) => void;
  playerBudget: number;
}

export const BuildToolbar: React.FC<BuildToolbarProps> = ({
  catalog,
  selectedTool,
  onSelectTool,
  playerBudget
}) => {
  const getToolIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('house')) return <Home className="w-4 h-4 text-amber-300" />;
    if (lower.includes('factory')) return <Factory className="w-4 h-4 text-amber-400" />;
    if (lower.includes('park')) return <Trees className="w-4 h-4 text-emerald-400" />;
    if (lower.includes('commercial')) return <Store className="w-4 h-4 text-cyan-400" />;
    if (lower.includes('solar')) return <Sun className="w-4 h-4 text-sky-400" />;
    return <Home className="w-4 h-4" />;
  };

  return (
    <div className="bg-slate-900/95 border-t border-slate-800 p-2 sm:p-3 backdrop-blur z-20">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-2">
        {/* Pointer / Select tool */}
        <button
          id="tool-select"
          onClick={() => onSelectTool('select')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
            selectedTool === 'select'
              ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300'
          }`}
          title="Inspect buildings and tiles"
        >
          <MousePointer className="w-4 h-4" />
          <span>Inspect</span>
        </button>

        {/* Demolish / Bulldozer tool */}
        <button
          id="tool-demolish"
          onClick={() => onSelectTool('demolish')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
            selectedTool === 'demolish'
              ? 'bg-rose-600 border-rose-400 text-white shadow-md shadow-rose-600/30'
              : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300'
          }`}
          title="Demolish buildings on the grid (50% refund)"
        >
          <Trash2 className="w-4 h-4 text-rose-300" />
          <span>Demolish</span>
        </button>

        <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

        {/* Buildings from Catalog */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {catalog.map((item) => {
            const isSelected = selectedTool === item.typeId;
            const canAfford = playerBudget >= item.constructionCost;

            return (
              <button
                key={item.typeId}
                id={`tool-building-${item.typeId}`}
                onClick={() => onSelectTool(item.typeId)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border group ${
                  isSelected
                    ? 'bg-emerald-600/90 border-emerald-400 text-white shadow-lg shadow-emerald-600/20 ring-1 ring-emerald-400'
                    : canAfford
                    ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700/80 text-slate-200'
                    : 'bg-slate-900/80 border-slate-800 text-slate-500 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="p-1 rounded-lg bg-slate-900/60 border border-slate-700/50">
                  {getToolIcon(item.name)}
                </div>

                <div className="flex flex-col items-start leading-tight">
                  <span className="font-semibold text-white tracking-tight">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className={`font-mono font-bold flex items-center gap-0.5 ${canAfford ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${item.constructionCost}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {item.footprint.width}×{item.footprint.height}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
