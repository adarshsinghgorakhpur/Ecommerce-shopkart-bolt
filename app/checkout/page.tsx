'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, CreditCard, Package, Check, Plus, Truck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  selectCartItems,
  selectCartSubtotal,
  selectCartDiscount,
  selectDeliveryCharge,
  selectCartTotal,
  selectCouponCode,
  selectCouponDiscount,
  clearCart,
} from '@/redux/slices/cartSlice';
import {
  useCreateOrderMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
} from '@/redux/api/apiSlice';
import { PAYMENT_METHODS, DELIVERY_ESTIMATE_DAYS } from '@/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Address } from '@/types';

const STEPS = [
  { id: 1, label: 'Address', icon: MapPin },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Review', icon: Package },
];

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const discount = useAppSelector(selectCartDiscount);
  const deliveryCharge = useAppSelector(selectDeliveryCharge);
  const total = useAppSelector(selectCartTotal);
  const couponCode = useAppSelector(selectCouponCode);
  const couponDiscount = useAppSelector(selectCouponDiscount);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: '',
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false,
  });

  // Get user ID from auth (using supabase for now)
  const [userId, setUserId] = useState('');
  useEffect(() => {
    const getUser = async () => {
      const { supabase } = await import('@/services/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  const { data: addresses, isLoading: addressesLoading } = useGetAddressesQuery(userId, {
    skip: !userId,
  });

  const [addAddressMutation, { isLoading: addingAddress }] = useAddAddressMutation();
  const [createOrderMutation, { isLoading: creatingOrder }] = useCreateOrderMutation();

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      if (typeof window !== 'undefined') {
        router.push('/cart');
      }
    }
  }, [items.length, orderPlaced, router]);

  // Set first address as default selected
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  const handleAddAddress = async () => {
    if (!userId) return;
    try {
      const result = await addAddressMutation({
        user_id: userId,
        ...addressForm,
      }).unwrap();
      setSelectedAddressId(result.id);
      setShowAddressForm(false);
      setAddressForm({
        label: '',
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false,
      });
    } catch {
      // Error handled silently
    }
  };

  const handlePlaceOrder = async () => {
    if (!userId || !selectedAddressId) return;

    const orderItems = items.map((item) => ({
      id: '',
      order_id: '',
      product_id: item.product.id,
      product_name: item.product.name,
      variant_info: item.selectedVariant
        ? `${item.selectedVariant.variant_type}: ${item.selectedVariant.variant_value}`
        : '',
      quantity: item.quantity,
      price: item.product.selling_price,
      image_url: item.product.images?.[0]?.url || '',
    }));

    try {
      await createOrderMutation({
        userId,
        addressId: selectedAddressId,
        items: orderItems,
        subtotal,
        discount,
        deliveryCharge,
        total,
        paymentMethod,
        couponCode,
      }).unwrap();

      dispatch(clearCart());
      setOrderPlaced(true);
    } catch {
      // Error handled silently
    }
  };

  const canProceedToPayment = selectedAddressId !== '';
  const canProceedToReview =
    paymentMethod === 'cod' ||
    (paymentMethod === 'upi' && upiId.trim() !== '') ||
    (paymentMethod === 'card' && cardNumber.trim() !== '' && cardExpiry.trim() !== '' && cardCvv.trim() !== '');

  // Order placed success state
  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full bg-green-100 p-6">
            <Check className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Order Placed Successfully!</h1>
          <p className="mt-2 text-muted-foreground">
            Your order has been confirmed and will be delivered within {DELIVERY_ESTIMATE_DAYS} business days.
          </p>
          <Button asChild className="mt-6" size="lg">
            <a href="/">Continue Shopping</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-center">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isCompleted
                    ? 'bg-green-100 text-green-700'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{step.label}</span>
              </div>
              {index < STEPS.length - 1 && (
                <div className="mx-2 h-[2px] w-8 bg-muted sm:w-16" />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Address */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Select Delivery Address</h2>

              {addressesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : (
                <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                  {addresses?.map((address) => (
                    <div key={address.id} className="flex items-start gap-3 rounded-lg border p-4">
                      <RadioGroupItem value={address.id} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{address.full_name}</span>
                          {address.is_default && (
                            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {address.address_line1}
                          {address.address_line2 && `, ${address.address_line2}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                        <p className="text-sm text-muted-foreground">Phone: {address.phone}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* Add New Address */}
              {!showAddressForm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowAddressForm(true)}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Address
                </Button>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">New Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="addr-label">Label</Label>
                        <Input
                          id="addr-label"
                          placeholder="Home, Office, etc."
                          value={addressForm.label}
                          onChange={(e) =>
                            setAddressForm((prev) => ({ ...prev, label: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="addr-name">Full Name</Label>
                        <Input
                          id="addr-name"
                          placeholder="Full name"
                          value={addressForm.full_name}
                          onChange={(e) =>
                            setAddressForm((prev) => ({ ...prev, full_name: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="addr-phone">Phone</Label>
                        <Input
                          id="addr-phone"
                          placeholder="Phone number"
                          value={addressForm.phone}
                          onChange={(e) =>
                            setAddressForm((prev) => ({ ...prev, phone: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="addr-pincode">Pincode</Label>
                        <Input
                          id="addr-pincode"
                          placeholder="Pincode"
                          value={addressForm.pincode}
                          onChange={(e) =>
                            setAddressForm((prev) => ({ ...prev, pincode: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addr-line1">Address Line 1</Label>
                      <Input
                        id="addr-line1"
                        placeholder="House no., Building, Street"
                        value={addressForm.address_line1}
                        onChange={(e) =>
                          setAddressForm((prev) => ({ ...prev, address_line1: e.target.value }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addr-line2">Address Line 2</Label>
                      <Input
                        id="addr-line2"
                        placeholder="Area, Colony, Landmark (Optional)"
                        value={addressForm.address_line2}
                        onChange={(e) =>
                          setAddressForm((prev) => ({ ...prev, address_line2: e.target.value }))
                        }
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="addr-city">City</Label>
                        <Input
                          id="addr-city"
                          placeholder="City"
                          value={addressForm.city}
                          onChange={(e) =>
                            setAddressForm((prev) => ({ ...prev, city: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="addr-state">State</Label>
                        <Input
                          id="addr-state"
                          placeholder="State"
                          value={addressForm.state}
                          onChange={(e) =>
                            setAddressForm((prev) => ({ ...prev, state: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddAddress}
                        disabled={addingAddress}
                        className="flex-1"
                      >
                        {addingAddress ? 'Saving...' : 'Save Address'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddressForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!canProceedToPayment}
                >
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Select Payment Method</h2>

              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                {PAYMENT_METHODS.map((method) => (
                  <div key={method.id} className="flex items-center gap-3 rounded-lg border p-4">
                    <RadioGroupItem value={method.id} />
                    <Label htmlFor={method.id} className="flex-1 cursor-pointer font-medium">
                      {method.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* UPI Input */}
              {paymentMethod === 'upi' && (
                <div className="space-y-2 rounded-lg border p-4">
                  <Label htmlFor="upi-id">UPI ID</Label>
                  <Input
                    id="upi-id"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your UPI ID (e.g., name@bank)
                  </p>
                </div>
              )}

              {/* Card Input */}
              {paymentMethod === 'card' && (
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-expiry">Expiry Date</Label>
                      <Input
                        id="card-expiry"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-cvv">CVV</Label>
                      <Input
                        id="card-cvv"
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        maxLength={3}
                        type="password"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* COD Note */}
              {paymentMethod === 'cod' && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <p className="text-sm text-yellow-800">
                    Cash on Delivery: Pay when your order is delivered. Additional COD charges may apply.
                  </p>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back to Address
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!canProceedToReview}
                >
                  Review Order
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Review Your Order</h2>

              {/* Delivery Address */}
              {addresses && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Delivery Address</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                        Change
                      </Button>
                    </div>
                    {(() => {
                      const addr = addresses.find((a) => a.id === selectedAddressId);
                      if (!addr) return null;
                      return (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p className="font-medium text-foreground">{addr.full_name}</p>
                          <p>
                            {addr.address_line1}
                            {addr.address_line2 && `, ${addr.address_line2}`}
                          </p>
                          <p>
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Payment Method */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Payment Method</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
                      Change
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}
                    {paymentMethod === 'upi' && upiId && ` (${upiId})`}
                    {paymentMethod === 'card' && cardNumber && ` (****${cardNumber.slice(-4)})`}
                  </p>
                </CardContent>
              </Card>

              {/* Delivery Estimate */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Estimated delivery within <span className="font-medium">{DELIVERY_ESTIMATE_DAYS} business days</span>
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items ({items.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.map((item) => {
                    const imageUrl = item.product.images?.[0]?.url || '/placeholder.png';
                    return (
                      <div key={`${item.product.id}-${item.selectedVariant?.id || 'default'}`} className="flex gap-3">
                        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border">
                          <Image
                            src={imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                          {item.selectedVariant && (
                            <p className="text-xs text-muted-foreground">
                              {item.selectedVariant.variant_type}: {item.selectedVariant.variant_value}
                            </p>
                          )}
                          <p className="text-sm">
                            Rs.{item.product.selling_price.toLocaleString()} x {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-medium">
                          Rs.{(item.product.selling_price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back to Payment
                </Button>
                <Button
                  onClick={handlePlaceOrder}
                  disabled={creatingOrder}
                  size="lg"
                >
                  {creatingOrder ? 'Placing Order...' : 'Place Order'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Price Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Price Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Rs.{subtotal.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="text-green-600">-Rs.{discount.toLocaleString()}</span>
                  </div>
                )}

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

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>Rs.{total.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
