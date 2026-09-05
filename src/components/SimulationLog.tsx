import React from 'react';
import { Terminal, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { SimulationLogEntry } from '../types';

interface SimulationLogProps {
  logs: SimulationLogEntry[];
}

export const SimulationLog: React.FC<SimulationLogProps> = ({ logs }) => {
  return (
    <div className="bg-slate-950/80 border-t border-slate-800 p-2.5 sm:p-3 text-xs">
      <div className="max-w-7xl mx-auto flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-slate-400 font-mono shrink-0">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-300">City Event Feed:</span>
        </div>

        <div className="flex-1 overflow-x-auto whitespace-nowrap flex items-center gap-3">
          {logs.slice(0, 4).map((entry) => {
            return (
              <div
                key={entry.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 font-mono text-[11px]"
              >
                {entry.type === 'error' && <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />}
                {entry.type === 'success' && <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />}
                {entry.type === 'info' && <Info className="w-3 h-3 text-cyan-400 shrink-0" />}
                <span className="text-slate-500">T#{entry.tick}</span>
                <span className={entry.type === 'error' ? 'text-rose-300 font-bold' : 'text-slate-300'}>
                  {entry.message}
                </span>
              </div>
            );
          })}
          {logs.length === 0 && (
            <span className="text-slate-500 italic text-[11px]">
              Ready. Place buildings and start the simulation to see tick events.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
