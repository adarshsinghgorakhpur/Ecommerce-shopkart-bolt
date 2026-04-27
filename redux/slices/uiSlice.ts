import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
interface UIState { darkMode: boolean; mobileMenuOpen: boolean; searchOpen: boolean; cartDrawerOpen: boolean; }
const initialState: UIState = { darkMode: true, mobileMenuOpen: false, searchOpen: false, cartDrawerOpen: false };
const uiSlice = createSlice({
  name: 'ui', initialState,
  reducers: {
    toggleDarkMode(state) { state.darkMode = !state.darkMode; if (typeof window !== 'undefined') { localStorage.setItem('darkMode', String(state.darkMode)); document.documentElement.classList.toggle('dark', state.darkMode); } },
    setMobileMenuOpen(state, action: PayloadAction<boolean>) { state.mobileMenuOpen = action.payload; },
    setSearchOpen(state, action: PayloadAction<boolean>) { state.searchOpen = action.payload; },
    setCartDrawerOpen(state, action: PayloadAction<boolean>) { state.cartDrawerOpen = action.payload; },
  },
});
export const { toggleDarkMode, setMobileMenuOpen, setSearchOpen, setCartDrawerOpen } = uiSlice.actions;
export default uiSlice.reducer;
