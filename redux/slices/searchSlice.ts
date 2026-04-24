import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
interface SearchState { query: string; history: string[]; suggestions: string[]; }
const load = (): string[] => { if (typeof window === 'undefined') return []; try { const s = localStorage.getItem('searchHistory'); return s ? JSON.parse(s) : []; } catch { return []; } };
const save = (h: string[]) => { if (typeof window !== 'undefined') localStorage.setItem('searchHistory', JSON.stringify(h)); };
const initialState: SearchState = { query: '', history: load(), suggestions: [] };
const searchSlice = createSlice({
  name: 'search', initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) { state.query = action.payload; },
    addToHistory(state, action: PayloadAction<string>) { const q = action.payload.trim(); if (!q) return; state.history = state.history.filter(h => h.toLowerCase() !== q.toLowerCase()); state.history.unshift(q); if (state.history.length > 10) state.history = state.history.slice(0, 10); save(state.history); },
    clearHistory(state) { state.history = []; save(state.history); },
    setSuggestions(state, action: PayloadAction<string[]>) { state.suggestions = action.payload; },
  },
});
export const { setQuery, addToHistory, clearHistory, setSuggestions } = searchSlice.actions;
export default searchSlice.reducer;
