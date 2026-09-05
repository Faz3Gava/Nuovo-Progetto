import React from 'react';
import { 
  Play, 
  Pause, 
  FastForward, 
  RotateCcw, 
  Coins, 
  Users, 
  Smile, 
  CloudFog, 
  Building2, 
  AlertTriangle,
  Flame,
  FileCode
} from 'lucide-react';
import { CitySnapshotData, ResourceDeltaData } from '../types';

interface HeaderProps {
  snapshot: CitySnapshotData;
  lastDelta: ResourceDeltaData;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepTick: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  totalBuildings: number;
  poweredBuildings: number;
  bankruptcyThreshold: number;
  onOpenPolicies: () => void;
  activePoliciesCount: number;
  onOpenJavaCode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  snapshot,
  lastDelta,
  isPlaying,
  onTogglePlay,
  onStepTick,
  onReset,
  speed,
  onSpeedChange,
  totalBuildings,
  poweredBuildings,
  bankruptcyThreshold,
  onOpenPolicies,
  activePoliciesCount,
  onOpenJavaCode
}) => {
  const isNearBankruptcy = snapshot.budget < 0;
  const isCritical = snapshot.budget < bankruptcyThreshold + 2000;

  const formatDelta = (val: number, isCurrency = false, isPercent = false) => {
    if (val === 0) return '±0';
    const sign = val > 0 ? '+' : '';
    if (isCurrency) return `${sign}$${val.toFixed(0)}`;
    if (isPercent) return `${sign}${val.toFixed(1)}%`;
    return `${sign}${val.toFixed(0)}`;
  };

  const getHappinessColor = (happiness: number) => {
    if (happiness >= 75) return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50';
    if (happiness >= 45) return 'text-amber-400 bg-amber-950/40 border-amber-800/50';
    return 'text-rose-400 bg-rose-950/40 border-rose-800/50';
  };

  const getPollutionColor = (pollution: number) => {
    if (pollution <= 10) return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50';
    if (pollution <= 35) return 'text-amber-400 bg-amber-950/40 border-amber-800/50';
    return 'text-purple-400 bg-purple-950/40 border-purple-800/50';
  };

  return (
    <header className="bg-slate-900/95 border-b border-slate-800 text-slate-100 backdrop-blur sticky top-0 z-30">
      {/* Top Bar: Title & Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-heading">
                CityLogic
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                Tick #{snapshot.tickCount}
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Transactional Simulation & Spatial Domain Engine
            </p>
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          <button
            id="play-pause-btn"
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            title={isPlaying ? 'Pause simulation' : 'Start auto simulation'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause' : 'Simulate'}</span>
          </button>

          <button
            id="step-tick-btn"
            onClick={onStepTick}
            disabled={isPlaying}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 border border-slate-700"
            title="Advance 1 simulation tick"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Step Tick</span>
          </button>

          <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
            {[1, 2, 4].map(s => (
              <button
                key={s}
                id={`speed-btn-${s}x`}
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-1 rounded text-xs font-mono font-medium transition-colors ${
                  speed === s
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            id="reset-city-btn"
            onClick={onReset}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors ml-1"
            title="Reset to fresh city grid"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Actions Group */}
        <div className="flex items-center gap-2">
          {/* Policy Council Trigger */}
          <button
            id="open-policies-btn"
            onClick={onOpenPolicies}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white transition-all shadow-sm cursor-pointer"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Policies</span>
            <span className="w-5 h-5 rounded-full bg-indigo-600/80 text-white flex items-center justify-center text-[10px] font-bold">
              {activePoliciesCount}
            </span>
          </button>

          {/* Java & JavaFX Code Viewer Trigger */}
          {onOpenJavaCode && (
            <button
              id="open-javacode-btn"
              onClick={onOpenJavaCode}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-xs font-medium text-orange-300 hover:text-orange-200 transition-all shadow-sm cursor-pointer"
              title="Inspect ported Java & JavaFX classes and download Maven project"
            >
              <FileCode className="w-4 h-4 text-orange-400" />
              <span>JavaFX Code</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="bg-slate-950/60 border-t border-slate-850 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
          {/* Budget Metric */}
          <div
            id="kpi-budget"
            className={`px-3 py-2 rounded-xl border transition-all ${
              isCritical
                ? 'bg-rose-950/60 border-rose-700 text-rose-300 animate-pulse'
                : isNearBankruptcy
                ? 'bg-amber-950/50 border-amber-800 text-amber-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-0.5">
              <span className="flex items-center gap-1.5 font-medium">
                <Coins className="w-3.5 h-3.5 text-emerald-400" /> Treasury
              </span>
              <span
                className={`text-[11px] font-mono font-semibold ${
                  lastDelta.budgetDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatDelta(lastDelta.budgetDelta, true)}/t
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-base sm:text-lg font-bold font-mono tracking-tight text-white">
                ${snapshot.budget.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              {isNearBankruptcy && (
                <span className="text-[10px] flex items-center gap-0.5 text-rose-400 font-medium">
                  <AlertTriangle className="w-3 h-3" /> Debt
                </span>
              )}
            </div>
          </div>

          {/* Population Metric */}
          <div
            id="kpi-population"
            className="px-3 py-2 rounded-xl border bg-slate-900/80 border-slate-800 text-slate-200"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-0.5">
              <span className="flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5 text-cyan-400" /> Citizens
              </span>
              <span
                className={`text-[11px] font-mono font-semibold ${
                  lastDelta.populationDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatDelta(lastDelta.populationDelta)}/t
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-base sm:text-lg font-bold font-mono text-white">
                {snapshot.population.toLocaleString('en-US')}
              </span>
              <span className="text-[10px] text-slate-400">Total</span>
            </div>
          </div>

          {/* Happiness Metric */}
          <div
            id="kpi-happiness"
            className={`px-3 py-2 rounded-xl border ${getHappinessColor(snapshot.happiness)}`}
          >
            <div className="flex items-center justify-between text-xs mb-0.5 opacity-90">
              <span className="flex items-center gap-1.5 font-medium">
                <Smile className="w-3.5 h-3.5" /> Happiness
              </span>
              <span className="text-[11px] font-mono font-semibold">
                {formatDelta(lastDelta.happinessDelta, false, true)}/t
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base sm:text-lg font-bold font-mono text-white">
                {snapshot.happiness.toFixed(1)}%
              </span>
              <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-2">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, snapshot.happiness))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Pollution Metric */}
          <div
            id="kpi-pollution"
            className={`px-3 py-2 rounded-xl border ${getPollutionColor(snapshot.pollution)}`}
          >
            <div className="flex items-center justify-between text-xs mb-0.5 opacity-90">
              <span className="flex items-center gap-1.5 font-medium">
                <CloudFog className="w-3.5 h-3.5" /> Pollution
              </span>
              <span className="text-[11px] font-mono font-semibold">
                {formatDelta(lastDelta.pollutionDelta)}/t
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-base sm:text-lg font-bold font-mono text-white">
                {snapshot.pollution.toFixed(1)}
              </span>
              <span className="text-[10px] opacity-80">
                {snapshot.pollution < 10 ? 'Pristine' : snapshot.pollution < 40 ? 'Moderate' : 'Dense'}
              </span>
            </div>
          </div>

          {/* Buildings Metric */}
          <div
            id="kpi-buildings"
            className="px-3 py-2 rounded-xl border bg-slate-900/80 border-slate-800 text-slate-200 col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-0.5">
              <span className="flex items-center gap-1.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Structures
              </span>
              <span className="text-[11px] text-emerald-400 font-mono font-medium">
                {poweredBuildings} Active
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-base sm:text-lg font-bold font-mono text-white">
                {totalBuildings}
              </span>
              <span className="text-[10px] text-slate-400">
                {totalBuildings > 0 ? `${Math.round((poweredBuildings / totalBuildings) * 100)}% Powered` : '0 on grid'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
