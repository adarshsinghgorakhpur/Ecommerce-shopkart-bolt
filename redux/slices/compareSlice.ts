import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/types';

interface CompareState { products: Product[] }

const load = (): Product[] => {
  if (typeof window === 'undefined') return [];
  try { const s = localStorage.getItem('compare'); return s ? JSON.parse(s) : []; } catch { return []; }
};
const save = (p: Product[]) => { if (typeof window !== 'undefined') localStorage.setItem('compare', JSON.stringify(p)); };

const initialState: CompareState = { products: load() };

const compareSlice = createSlice({
  name: 'compare', initialState,
  reducers: {
    addToCompare(state, action: PayloadAction<Product>) {
      if (state.products.length < 4 && !state.products.find(p => p.id === action.payload.id)) {
        state.products.push(action.payload); save(state.products);
      }
    },
    removeFromCompare(state, action: PayloadAction<string>) {
      state.products = state.products.filter(p => p.id !== action.payload); save(state.products);
    },
    clearCompare(state) { state.products = []; save(state.products); },
  },
});

export const { addToCompare, removeFromCompare, clearCompare } = compareSlice.actions;
export default compareSlice.reducer;
