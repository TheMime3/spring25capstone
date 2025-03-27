import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GeneratedScript, ScriptHistoryState } from '../types/scriptGenerator';
import { v4 as uuidv4 } from 'uuid';

interface ScriptHistoryStore extends ScriptHistoryState {
  // Actions
  addScript: (content: string, title?: string) => GeneratedScript;
  getScripts: () => GeneratedScript[];
  deleteScript: (id: string) => void;
  clearHistory: () => void;
}

// Initial state
const initialState: ScriptHistoryState = {
  scripts: []
};

export const useScriptHistoryStore = create<ScriptHistoryStore>()(
  persist(
    (set, get) => ({
      // State
      ...initialState,

      // Actions
      addScript: (content, title) => {
        const newScript: GeneratedScript = {
          id: uuidv4(),
          content,
          createdAt: new Date().toISOString(),
          title: title || `Script ${get().scripts.length + 1}`
        };

        set((state) => ({
          scripts: [newScript, ...state.scripts]
        }));

        return newScript;
      },

      getScripts: () => {
        return get().scripts;
      },

      deleteScript: (id) => {
        set((state) => ({
          scripts: state.scripts.filter(script => script.id !== id)
        }));
      },

      clearHistory: () => {
        set({ scripts: [] });
      }
    }),
    {
      name: 'script-history-storage',
    }
  )
);