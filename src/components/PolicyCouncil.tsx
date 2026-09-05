import React from 'react';
import { 
  Flame, 
  X, 
  Check, 
  ShieldAlert, 
  TrendingUp, 
  Leaf, 
  Sparkles,
  DollarSign
} from 'lucide-react';
import { IPolicyStrategy } from '../types';
import { GameEngine } from '../application/GameEngine';

interface PolicyCouncilProps {
  isOpen: boolean;
  onClose: () => void;
  availablePolicies: IPolicyStrategy[];
  activePolicyNames: string[];
  onTogglePolicy: (policy: IPolicyStrategy) => void;
  gameEngine: GameEngine;
}

export const PolicyCouncil: React.FC<PolicyCouncilProps> = ({
  isOpen,
  onClose,
  availablePolicies,
  activePolicyNames,
  onTogglePolicy,
  gameEngine
}) => {
  if (!isOpen) return null;

  const gridReader = gameEngine.getGridReader();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        id="policy-council-modal"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-heading">
                Municipal Policy Council
              </h2>
              <p className="text-xs text-slate-400">
                Enact municipal ordinances evaluated every tick during the Policy Phase.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Policies List */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="text-xs text-slate-400 bg-indigo-950/40 border border-indigo-800/40 rounded-xl p-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Policies dynamically modify resources produced by powered structures. You can activate or revoke them anytime without penalty.
            </span>
          </div>

          <div className="grid gap-3">
            {availablePolicies.map((policy) => {
              const isActive = activePolicyNames.includes(policy.getName());

              // Calculate preview effect across current grid
              let previewBudget = 0;
              let previewPollution = 0;
              let previewHappiness = 0;
              let affectedCount = 0;

              for (const b of gridReader.getAllBuildings()) {
                if (b.isPowered()) {
                  const mod = policy.calculateModifier(b, gridReader);
                  if (mod && (mod.budgetDelta !== 0 || mod.pollutionDelta !== 0 || mod.happinessDelta !== 0)) {
                    previewBudget += mod.budgetDelta;
                    previewPollution += mod.pollutionDelta;
                    previewHappiness += mod.happinessDelta;
                    affectedCount++;
                  }
                }
              }

              return (
                <div
                  key={policy.getId()}
                  id={`policy-card-${policy.getId()}`}
                  className={`p-4 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-slate-850 border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white font-heading">
                          {policy.getName()}
                        </h3>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Active Law
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300">
                        {policy.getDescription()}
                      </p>
                    </div>

                    <button
                      id={`toggle-policy-${policy.getId()}`}
                      onClick={() => onTogglePolicy(policy)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
                        isActive
                          ? 'bg-rose-600/90 hover:bg-rose-500 text-white border-rose-500 shadow-sm'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-sm'
                      }`}
                    >
                      {isActive ? 'Repeal Policy' : 'Enact Policy'}
                    </button>
                  </div>

                  {/* Impact preview */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] gap-2">
                    <span className="text-slate-400">
                      Impact on current grid ({affectedCount} structures affected):
                    </span>
                    <div className="flex items-center gap-3 font-mono font-semibold">
                      <span className={previewBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        Budget: {previewBudget >= 0 ? `+$${previewBudget}` : `-$${Math.abs(previewBudget)}`}/t
                      </span>
                      <span className={previewPollution <= 0 ? 'text-emerald-400' : 'text-purple-400'}>
                        Smog: {previewPollution > 0 ? `+${previewPollution}` : previewPollution}/t
                      </span>
                      <span className={previewHappiness >= 0 ? 'text-amber-400' : 'text-rose-400'}>
                        Happiness: {previewHappiness >= 0 ? `+${previewHappiness}%` : `${previewHappiness}%`}/t
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {activePolicyNames.length} of {availablePolicies.length} ordinances currently in effect
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors border border-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
