'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Minus, Plus, Trash2, Tag, Truck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  selectCartItems,
  selectCartCount,
  selectCartSubtotal,
  selectCartTotalMRP,
  selectCartDiscount,
  selectDeliveryCharge,
  selectCartTotal,
  selectCouponCode,
  selectCouponDiscount,
  removeFromCart,
  updateQuantity,
  applyCoupon,
  removeCoupon,
} from '@/redux/slices/cartSlice';
import { useGetCouponQuery } from '@/redux/api/apiSlice';
import { FREE_DELIVERY_THRESHOLD } from '@/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const dispatch = useAppDispatch();

  const items = useAppSelector(selectCartItems);
  const cartCount = useAppSelector(selectCartCount);
  const subtotal = useAppSelector(selectCartSubtotal);
  const totalMRP = useAppSelector(selectCartTotalMRP);
  const discount = useAppSelector(selectCartDiscount);
  const deliveryCharge = useAppSelector(selectDeliveryCharge);
  const total = useAppSelector(selectCartTotal);
  const couponCode = useAppSelector(selectCouponCode);
  const couponDiscount = useAppSelector(selectCouponDiscount);

  const [couponInput, setCouponInput] = useState('');
  const [couponToValidate, setCouponToValidate] = useState('');
  const [couponError, setCouponError] = useState('');

  const {
    data: validatedCoupon,
    isFetching: validatingCoupon,
    error: couponQueryError,
  } = useGetCouponQuery(couponToValidate, {
    skip: !couponToValidate,
  });

  // Handle coupon validation result
  useEffect(() => {
    if (!couponToValidate) return;

    if (couponQueryError) {
      setCouponError('Invalid or expired coupon code');
      setCouponToValidate('');
      return;
    }

    if (validatedCoupon === undefined || validatedCoupon === null) return; // still loading

    if (validatedCoupon === null) {
      setCouponError('Invalid or expired coupon code');
      setCouponToValidate('');
      return;
    }

    if (subtotal < validatedCoupon.min_order_value) {
      setCouponError(`Minimum order value is Rs.${validatedCoupon.min_order_value}`);
      setCouponToValidate('');
      return;
    }

    let discountAmount = 0;
    if (validatedCoupon.discount_type === 'percentage') {
      discountAmount = (subtotal * validatedCoupon.discount_value) / 100;
      if (validatedCoupon.max_discount > 0) {
        discountAmount = Math.min(discountAmount, validatedCoupon.max_discount);
      }
    } else {
      discountAmount = validatedCoupon.discount_value;
    }
    dispatch(applyCoupon({ code: validatedCoupon.code, discount: discountAmount }));
    setCouponToValidate('');
  }, [couponToValidate, validatedCoupon, couponQueryError, subtotal, dispatch]);

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    setCouponError('');
    setCouponToValidate(couponInput.trim());
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setCouponInput('');
    setCouponToValidate('');
    setCouponError('');
  };

  const handleRemoveItem = (productId: string, variantId?: string) => {
    dispatch(removeFromCart({ productId, variantId }));
  };

  const handleUpdateQuantity = (productId: string, variantId: string | undefined, quantity: number) => {
    dispatch(updateQuantity({ productId, variantId, quantity }));
  };

  const amountForFreeDelivery = FREE_DELIVERY_THRESHOLD - subtotal;
  const freeDeliveryProgress = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full bg-muted p-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Button asChild className="mt-6" size="lg">
            <Link href="/products">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Shop Now
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">
        Shopping Cart ({cartCount} item{cartCount !== 1 ? 's' : ''})
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="popLayout">
            {items.map((item) => {
              const itemKey = `${item.product.id}-${item.selectedVariant?.id || 'default'}`;
              const imageUrl = item.product.images?.[0]?.url || '/placeholder.png';
              const variantInfo = item.selectedVariant
                ? `${item.selectedVariant.variant_type}: ${item.selectedVariant.variant_value}`
                : '';

              return (
                <motion.div
                  key={itemKey}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                  className="mb-4"
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border"
                        >
                          <Image
                            src={imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </Link>

                        {/* Product Details */}
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <Link
                              href={`/product/${item.product.slug}`}
                              className="font-medium hover:underline line-clamp-1"
                            >
                              {item.product.name}
                            </Link>
                            {variantInfo && (
                              <p className="mt-0.5 text-sm text-muted-foreground">
                                {variantInfo}
                              </p>
                            )}
                            <div className="mt-1 flex items-center gap-2">
                              <span className="font-semibold">
                                Rs.{(item.product.selling_price * item.quantity).toLocaleString()}
                              </span>
                              {item.product.discount_percent > 0 && (
                                <>
                                  <span className="text-sm text-muted-foreground line-through">
                                    Rs.{(item.product.base_price * item.quantity).toLocaleString()}
                                  </span>
                                  <span className="text-xs font-medium text-green-600">
                                    {item.product.discount_percent}% off
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Quantity Controls & Remove */}
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.product.id,
                                    item.selectedVariant?.id,
                                    item.quantity - 1
                                  )
                                }
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="flex h-8 w-10 items-center justify-center rounded-md border text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.product.id,
                                    item.selectedVariant?.id,
                                    item.quantity + 1
                                  )
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() =>
                                handleRemoveItem(item.product.id, item.selectedVariant?.id)
                              }
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Price Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Price Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Price ({cartCount} item{cartCount !== 1 ? 's' : ''})
                  </span>
                  <span>Rs.{totalMRP.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Discount</span>
                  <span className="text-green-600">-Rs.{discount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Charge</span>
                  <span className={deliveryCharge === 0 ? 'text-green-600' : ''}>
                    {deliveryCharge === 0 ? 'FREE' : `Rs.${deliveryCharge}`}
                  </span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Coupon ({couponCode})</span>
                    <span className="text-green-600">-Rs.{couponDiscount.toLocaleString()}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>Rs.{total.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <p className="text-xs text-green-600 font-medium">
                    You will save Rs.{(discount + couponDiscount).toLocaleString()} on this order
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Coupon Input */}
            <Card>
              <CardContent className="p-4">
                {couponCode ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        Coupon &quot;{couponCode}&quot; applied
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive h-auto p-0"
                      onClick={handleRemoveCoupon}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          setCouponError('');
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || !couponInput.trim()}
                      >
                        {validatingCoupon ? 'Checking...' : 'Apply'}
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-destructive">{couponError}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Free Delivery Threshold */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  {amountForFreeDelivery > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Add Rs.{amountForFreeDelivery.toLocaleString()} more for free delivery
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-green-600">
                      You qualify for free delivery!
                    </p>
                  )}
                </div>
                {amountForFreeDelivery > 0 && (
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all duration-500"
                      style={{ width: `${freeDeliveryProgress}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Checkout Button */}
            <Button asChild size="lg" className="w-full">
              <Link href="/checkout">
                Proceed to Checkout
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
