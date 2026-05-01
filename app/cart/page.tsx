'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, Tag, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { removeFromCart, updateQuantity, applyCoupon, removeCoupon, selectCartItems, selectCartSubtotal, selectCartTotalMRP, selectCartDiscount, selectDeliveryCharge, selectCartTotal, selectCouponCode, selectCouponDiscount } from '@/redux/slices/cartSlice';
import { useGetCouponQuery } from '@/redux/api/apiSlice';
import { FREE_DELIVERY_THRESHOLD } from '@/constants';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const totalMRP = useAppSelector(selectCartTotalMRP);
  const discount = useAppSelector(selectCartDiscount);
  const deliveryCharge = useAppSelector(selectDeliveryCharge);
  const total = useAppSelector(selectCartTotal);
  const couponCode = useAppSelector(selectCouponCode);
  const couponDiscount = useAppSelector(selectCouponDiscount);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const { data: coupon } = useGetCouponQuery(couponInput, { skip: !couponInput });

  const handleApplyCoupon = useCallback(() => {
    if (!couponInput.trim()) return;
    if (!coupon) { setCouponError('Invalid or expired coupon code'); return; }
    if (subtotal < coupon.min_order_value) { setCouponError(`Minimum order Rs.${coupon.min_order_value} required`); return; }
    let disc = 0;
    if (coupon.discount_type === 'percentage') { disc = (subtotal * coupon.discount_value) / 100; if (coupon.max_discount > 0) disc = Math.min(disc, coupon.max_discount); }
    else { disc = coupon.discount_value; }
    dispatch(applyCoupon({ code: couponInput.toUpperCase(), discount: disc }));
    setCouponError('');
  }, [couponInput, coupon, subtotal, dispatch]);

  const handleUpdateQuantity = useCallback((productId: string, variantId: string | undefined, quantity: number) => {
    dispatch(updateQuantity({ productId, variantId, quantity }));
  }, [dispatch]);

  const handleRemoveItem = useCallback((productId: string, variantId: string | undefined) => {
    dispatch(removeFromCart({ productId, variantId }));
  }, [dispatch]);

  const handleRemoveCoupon = useCallback(() => {
    dispatch(removeCoupon());
  }, [dispatch]);

  if (items.length === 0) return <div className="container mx-auto px-4 py-20 text-center"><ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" /><h2 className="text-2xl font-bold mt-4">Your cart is empty</h2><p className="text-muted-foreground mt-2">Add items to get started</p><Link href="/products"><Button className="mt-6">Shop Now</Button></Link></div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({items.length} items)</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-3">
          <AnimatePresence>{items.map(item => (
            <motion.div key={`${item.product.id}-${item.selectedVariant?.id || ''}`} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20, height: 0 }} className="flex gap-4 rounded-lg border bg-card p-4">
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted"><Image src={item.product.images?.[0]?.url || 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg'} alt={item.product.name} fill className="object-cover" sizes="96px" /></div>
              <div className="flex flex-1 flex-col justify-between">
                <div><p className="text-xs text-muted-foreground">{item.product.brand}</p><h3 className="font-medium text-sm line-clamp-1">{item.product.name}</h3>{item.selectedVariant && <p className="text-xs text-muted-foreground mt-0.5">{item.selectedVariant.variant_type}: {item.selectedVariant.variant_value}</p>}</div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item.product.id, item.selectedVariant?.id, item.quantity - 1)} disabled={item.quantity <= 1}><Minus className="h-3 w-3" /></Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item.product.id, item.selectedVariant?.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock}><Plus className="h-3 w-3" /></Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">Rs.{(item.product.selling_price * item.quantity).toLocaleString()}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-500" onClick={() => handleRemoveItem(item.product.id, item.selectedVariant?.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}</AnimatePresence>
        </div>
        <div className="rounded-lg border bg-card p-5 h-fit sticky top-24">
          <h3 className="font-semibold mb-4">Price Details</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Price ({items.length} items)</span><span>Rs.{totalMRP.toLocaleString()}</span></div>
            <div className="flex justify-between text-green-600"><span>Discount</span><span>-Rs.{discount.toLocaleString()}</span></div>
            {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Coupon ({couponCode})</span><span>-Rs.{couponDiscount.toLocaleString()}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Delivery</span><span className={deliveryCharge === 0 ? 'text-green-600' : ''}>{deliveryCharge === 0 ? 'FREE' : `Rs.${deliveryCharge}`}</span></div>
            <Separator />
            <div className="flex justify-between font-bold text-base pt-1"><span>Total</span><span>Rs.{total.toLocaleString()}</span></div>
          </div>
          {subtotal < FREE_DELIVERY_THRESHOLD && <p className="mt-3 text-xs text-muted-foreground">Add Rs.{(FREE_DELIVERY_THRESHOLD - subtotal).toLocaleString()} more for free delivery</p>}
          <div className="mt-4">
            {couponCode ? (
              <div className="flex items-center justify-between rounded-md border bg-green-50 dark:bg-green-950/20 px-3 py-2"><div className="flex items-center gap-2 text-sm"><Tag className="h-4 w-4 text-green-600" /><span className="font-medium text-green-600">{couponCode}</span><span className="text-green-600">-Rs.{couponDiscount}</span></div><Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleRemoveCoupon}>Remove</Button></div>
            ) : (<div className="flex gap-2"><Input placeholder="Enter coupon code" value={couponInput} onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }} className="h-9 text-sm uppercase" /><Button size="sm" variant="outline" onClick={handleApplyCoupon} className="h-9">Apply</Button></div>)}
            {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
          </div>
          <Link href="/checkout"><Button className="w-full mt-4 h-11 bg-orange-500 hover:bg-orange-600 text-white">Proceed to Checkout</Button></Link>
        </div>
      </div>
    </div>
  );
}
