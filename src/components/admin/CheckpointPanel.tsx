import type { Checkpoint, AdditionalCondition } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Zap, CheckSquare, Square } from 'lucide-react';
import { useState } from 'react';

interface CheckpointPanelProps {
  checkpoints: Checkpoint[];
  onToggle: (cpId: string, active: boolean) => void;
}

const ADDITIONAL_CONDITIONS: AdditionalCondition[] = [
  'Speed Restriction', 'Signal Halt', 'Unscheduled Stoppage', 'Maintenance Block',
];

export function CheckpointPanel({ checkpoints, onToggle }: CheckpointPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const activeCount = checkpoints.filter(c => c.isActive).length;
  const checkpointIntervalKm = checkpoints.length > 1
    ? checkpoints[1].distanceKm - checkpoints[0].distanceKm
    : 0;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="card p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">Route Checkpoints</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            One checkpoint every {checkpointIntervalKm} km along the route. Admin only.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-orange-500">{activeCount}</p>
          <p className="text-xs text-slate-500">active / {checkpoints.length}</p>
        </div>
      </div>

      {/* Admin-only notice */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/50 rounded-xl text-xs text-orange-600 dark:text-orange-400">
        <Zap size={12} />
        Checkpoint data is restricted to Admin interface only. Passengers never see these controls.
      </div>

      {/* Checkpoint list */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
        {checkpoints.map((cp) => (
          <div key={cp.id} className={`card overflow-hidden transition-all ${cp.isActive ? 'border-orange-300 dark:border-orange-700' : ''}`}>
            <div
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              onClick={() => setExpanded(expanded === cp.id ? null : cp.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  cp.isActive ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-slate-100 dark:bg-slate-800'
                }`}>
                  <MapPin size={14} className={cp.isActive ? 'text-orange-500' : 'text-slate-400'} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{cp.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{cp.distanceKm} km from origin</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {cp.isActive && (
                  <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-semibold">
                    Active
                  </span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onToggle(cp.id, !cp.isActive); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    cp.isActive
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                      : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                  }`}
                >
                  {cp.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {expanded === cp.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-slate-100 dark:border-slate-800 px-3 pb-3 pt-2"
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Active conditions at this checkpoint:</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ADDITIONAL_CONDITIONS.map(cond => {
                      const isActive = cp.activeConditions.includes(cond);
                      return (
                        <div key={cond} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs ${
                          isActive ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {isActive ? <CheckSquare size={12} /> : <Square size={12} />}
                          {cond}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 text-xs text-slate-400 dark:text-slate-500 font-mono">
                    Coords: [{cp.coordinates[0].toFixed(4)}, {cp.coordinates[1].toFixed(4)}]
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
