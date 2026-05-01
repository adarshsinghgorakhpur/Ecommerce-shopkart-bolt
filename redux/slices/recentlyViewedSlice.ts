import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/types';

interface State { products: Product[] }

const load = (): Product[] => {
  if (typeof window === 'undefined') return [];
  try { const s = localStorage.getItem('recentlyViewed'); return s ? JSON.parse(s) : []; } catch { return []; }
};
const save = (p: Product[]) => { if (typeof window !== 'undefined') localStorage.setItem('recentlyViewed', JSON.stringify(p)); };

const initialState: State = { products: load() };

const slice = createSlice({
  name: 'recentlyViewed', initialState,
  reducers: {
    addRecentlyViewed(state, action: PayloadAction<Product>) {
      state.products = state.products.filter(p => p.id !== action.payload.id);
      state.products.unshift(action.payload);
      if (state.products.length > 20) state.products = state.products.slice(0, 20);
      save(state.products);
    },
    clearRecentlyViewed(state) { state.products = []; save(state.products); },
  },
});

export const { addRecentlyViewed, clearRecentlyViewed } = slice.actions;
export default slice.reducer;
