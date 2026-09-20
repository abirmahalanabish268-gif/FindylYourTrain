import { create } from 'zustand';
import type { TrainState, TrainConditions, Checkpoint } from '../types';
import { buildInitialState, recalculateWithConditions, tickTrain } from '../mock/simulation';

interface TrainStore {
  trains: Record<string, TrainState>;
  selectedTrainNumber: string | null;
  isSimulating: boolean;

  // Actions
  selectTrain: (n: string | null) => void;
  applyConditions: (trainNumber: string, conditions: TrainConditions) => void;
  toggleCheckpoint: (trainNumber: string, cpId: string, active: boolean) => void;
  tick: () => void;
  startSimulation: () => void;
  stopSimulation: () => void;
}

let simInterval: ReturnType<typeof setInterval> | null = null;

export const useTrainStore = create<TrainStore>((set, get) => ({
  trains: buildInitialState(),
  selectedTrainNumber: null,
  isSimulating: false,

  selectTrain: (n) => set({ selectedTrainNumber: n }),

  applyConditions: (trainNumber, conditions) => {
    set(s => {
      const prev = s.trains[trainNumber];
      if (!prev) return s;
      return {
        trains: {
          ...s.trains,
          [trainNumber]: recalculateWithConditions(prev, conditions),
        },
      };
    });
  },

  toggleCheckpoint: (trainNumber, cpId, active) => {
    set(s => {
      const prev = s.trains[trainNumber];
      if (!prev) return s;
      const checkpoints: Checkpoint[] = prev.info.checkpoints.map(cp =>
        cp.id === cpId ? { ...cp, isActive: active } : cp
      );
      return {
        trains: {
          ...s.trains,
          [trainNumber]: { ...prev, info: { ...prev.info, checkpoints } },
        },
      };
    });
  },

  tick: () => {
    set(s => {
      const updated: Record<string, TrainState> = {};
      for (const [num, state] of Object.entries(s.trains)) {
        updated[num] = tickTrain(state);
      }
      return { trains: updated };
    });
  },

  startSimulation: () => {
    if (simInterval) return;
    simInterval = setInterval(() => {
      get().tick();
    }, 3000);
    set({ isSimulating: true });
  },

  stopSimulation: () => {
    if (simInterval) {
      clearInterval(simInterval);
      simInterval = null;
    }
    set({ isSimulating: false });
  },
}));
