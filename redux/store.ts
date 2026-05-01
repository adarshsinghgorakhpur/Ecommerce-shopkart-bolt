import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import compareReducer from './slices/compareSlice';
import recentlyViewedReducer from './slices/recentlyViewedSlice';
import searchReducer from './slices/searchSlice';
import { api } from './api/apiSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer, auth: authReducer, ui: uiReducer,
    compare: compareReducer, recentlyViewed: recentlyViewedReducer,
    search: searchReducer, [api.reducerPath]: api.reducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
