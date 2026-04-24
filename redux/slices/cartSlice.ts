import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, Product, ProductVariant } from '@/types';
import { FREE_DELIVERY_THRESHOLD, DELIVERY_CHARGE } from '@/constants';

interface CartState { items: CartItem[]; couponCode: string; couponDiscount: number; }
const loadCart = (): CartItem[] => { if (typeof window === 'undefined') return []; try { const s = localStorage.getItem('cart'); return s ? JSON.parse(s) : []; } catch { return []; } };
const saveCart = (items: CartItem[]) => { if (typeof window === 'undefined') return; localStorage.setItem('cart', JSON.stringify(items)); };
const initialState: CartState = { items: loadCart(), couponCode: '', couponDiscount: 0 };

const cartSlice = createSlice({
  name: 'cart', initialState,
  reducers: {
    addToCart(state, action: PayloadAction<{ product: Product; variant?: ProductVariant; quantity?: number }>) {
      const { product, variant, quantity = 1 } = action.payload;
      const existing = state.items.find(i => i.product.id === product.id && i.selectedVariant?.id === variant?.id);
      if (existing) { existing.quantity += quantity; } else { state.items.push({ product, quantity, selectedVariant: variant }); }
      saveCart(state.items);
    },
    removeFromCart(state, action: PayloadAction<{ productId: string; variantId?: string }>) {
      state.items = state.items.filter(i => !(i.product.id === action.payload.productId && i.selectedVariant?.id === action.payload.variantId));
      saveCart(state.items);
    },
    updateQuantity(state, action: PayloadAction<{ productId: string; variantId?: string; quantity: number }>) {
      const item = state.items.find(i => i.product.id === action.payload.productId && i.selectedVariant?.id === action.payload.variantId);
      if (item) item.quantity = Math.max(1, action.payload.quantity);
      saveCart(state.items);
    },
    clearCart(state) { state.items = []; state.couponCode = ''; state.couponDiscount = 0; saveCart(state.items); },
    applyCoupon(state, action: PayloadAction<{ code: string; discount: number }>) { state.couponCode = action.payload.code; state.couponDiscount = action.payload.discount; },
    removeCoupon(state) { state.couponCode = ''; state.couponDiscount = 0; },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, applyCoupon, removeCoupon } = cartSlice.actions;
export const selectCartItems = (s: { cart: CartState }) => s.cart.items;
export const selectCartCount = (s: { cart: CartState }) => s.cart.items.reduce((a, i) => a + i.quantity, 0);
export const selectCartSubtotal = (s: { cart: CartState }) => s.cart.items.reduce((a, i) => a + i.product.selling_price * i.quantity, 0);
export const selectCartTotalMRP = (s: { cart: CartState }) => s.cart.items.reduce((a, i) => a + i.product.base_price * i.quantity, 0);
export const selectCartDiscount = (s: { cart: CartState }) => selectCartTotalMRP(s) - selectCartSubtotal(s);
export const selectDeliveryCharge = (s: { cart: CartState }) => selectCartSubtotal(s) >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
export const selectCartTotal = (s: { cart: CartState }) => selectCartSubtotal(s) + selectDeliveryCharge(s) - s.cart.couponDiscount;
export const selectCouponCode = (s: { cart: CartState }) => s.cart.couponCode;
export const selectCouponDiscount = (s: { cart: CartState }) => s.cart.couponDiscount;
export default cartSlice.reducer;
