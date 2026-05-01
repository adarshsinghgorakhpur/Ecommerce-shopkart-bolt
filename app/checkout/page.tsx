'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, MapPin, CreditCard, Package, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { selectCartItems, selectCartSubtotal, selectCartDiscount, selectDeliveryCharge, selectCartTotal, selectCouponCode, selectCouponDiscount, clearCart } from '@/redux/slices/cartSlice';
import { useCreateOrderMutation, useGetAddressesQuery, useAddAddressMutation } from '@/redux/api/apiSlice';
import { PAYMENT_METHODS, DELIVERY_ESTIMATE_DAYS } from '@/constants';

type Step = 'address' | 'payment' | 'review';

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

  const [currentStep, setCurrentStep] = useState<Step>('address');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '', label: 'Home' });

  const { data: addresses } = useGetAddressesQuery('current');
  const [addAddress] = useAddAddressMutation();
  const [createOrder] = useCreateOrderMutation();

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'address', label: 'Address', icon: <MapPin className="h-4 w-4" /> },
    { id: 'payment', label: 'Payment', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'review', label: 'Review', icon: <Package className="h-4 w-4" /> },
  ];
  const stepIndex = steps.findIndex(s => s.id === currentStep);

  const handleAddAddress = async () => { await addAddress({ ...newAddress, user_id: 'current', id: '' } as any); setShowNewAddress(false); };

  const handlePlaceOrder = useCallback(async () => {
    const orderItems = items.map(item => ({
      id: '', order_id: '', product_id: item.product.id, product_name: item.product.name,
      variant_info: item.selectedVariant ? `${item.selectedVariant.variant_type}: ${item.selectedVariant.variant_value}` : '',
      quantity: item.quantity, price: item.product.selling_price, image_url: item.product.images?.[0]?.url || '',
    }));
    await createOrder({ userId: 'current', addressId: selectedAddress, items: orderItems, subtotal, discount, deliveryCharge, total, paymentMethod, couponCode });
    dispatch(clearCart());
    setOrderPlaced(true);
  }, [items, selectedAddress, subtotal, discount, deliveryCharge, total, paymentMethod, couponCode, createOrder, dispatch]);

  if (items.length === 0 && !orderPlaced) { if (typeof window !== 'undefined') router.push('/cart'); return null; }

  if (orderPlaced) return (
    <div className="container mx-auto px-4 py-20 text-center max-w-md">
      <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center"><Check className="h-10 w-10 text-green-600" /></div>
      <h2 className="text-2xl font-bold mt-6">Order Placed Successfully!</h2>
      <p className="text-muted-foreground mt-2">Your order will be delivered within {DELIVERY_ESTIMATE_DAYS} business days.</p>
      <div className="mt-6 space-y-2"><Link href="/orders"><Button className="w-full">View Orders</Button></Link><Link href="/"><Button variant="outline" className="w-full">Continue Shopping</Button></Link></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="flex items-center gap-2 mb-8">{steps.map((step, i) => (<div key={step.id} className="flex items-center gap-2 flex-1"><button onClick={() => { if (i < stepIndex) setCurrentStep(step.id); }} className={`flex items-center gap-2 text-sm font-medium ${i <= stepIndex ? 'text-primary' : 'text-muted-foreground'}`}><span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${i < stepIndex ? 'bg-primary text-primary-foreground' : i === stepIndex ? 'border-2 border-primary text-primary' : 'border text-muted-foreground'}`}>{i < stepIndex ? <Check className="h-3.5 w-3.5" /> : step.icon}</span><span className="hidden sm:inline">{step.label}</span></button>{i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}</div>))}</div>
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div>
          {currentStep === 'address' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Select Delivery Address</h2>
              {addresses?.map(addr => (<label key={addr.id} className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${selectedAddress === addr.id ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground'}`}><RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}><RadioGroupItem value={addr.id} /></RadioGroup><div><p className="font-medium text-sm">{addr.full_name} <span className="text-muted-foreground font-normal text-xs ml-1">{addr.label}</span></p><p className="text-sm text-muted-foreground mt-0.5">{addr.address_line1}, {addr.city}, {addr.state} - {addr.pincode}</p><p className="text-xs text-muted-foreground mt-0.5">{addr.phone}</p></div></label>))}
              {!showNewAddress ? <Button variant="outline" onClick={() => setShowNewAddress(true)}>+ Add New Address</Button> : (
                <div className="rounded-lg border p-4 space-y-3"><h3 className="font-medium text-sm">New Address</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Full Name</Label><Input value={newAddress.full_name} onChange={e => setNewAddress({ ...newAddress, full_name: e.target.value })} className="h-9" /></div>
                    <div><Label className="text-xs">Phone</Label><Input value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} className="h-9" /></div>
                    <div className="col-span-2"><Label className="text-xs">Address Line 1</Label><Input value={newAddress.address_line1} onChange={e => setNewAddress({ ...newAddress, address_line1: e.target.value })} className="h-9" /></div>
                    <div className="col-span-2"><Label className="text-xs">Address Line 2</Label><Input value={newAddress.address_line2} onChange={e => setNewAddress({ ...newAddress, address_line2: e.target.value })} className="h-9" /></div>
                    <div><Label className="text-xs">City</Label><Input value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} className="h-9" /></div>
                    <div><Label className="text-xs">State</Label><Input value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} className="h-9" /></div>
                    <div><Label className="text-xs">Pincode</Label><Input value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} className="h-9" /></div>
                  </div>
                  <div className="flex gap-2"><Button size="sm" onClick={handleAddAddress}>Save Address</Button><Button size="sm" variant="outline" onClick={() => setShowNewAddress(false)}>Cancel</Button></div>
                </div>
              )}
              <Button className="mt-4" disabled={!selectedAddress} onClick={() => setCurrentStep('payment')}>Continue to Payment</Button>
            </div>
          )}
          {currentStep === 'payment' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Select Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                {PAYMENT_METHODS.map(m => <label key={m.id} className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${paymentMethod === m.id ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground'}`}><RadioGroupItem value={m.id} /><span className="font-medium text-sm">{m.label}</span></label>)}
              </RadioGroup>
              {paymentMethod === 'upi' && <div><Label className="text-xs">UPI ID</Label><Input placeholder="yourname@upi" className="h-9 mt-1" /></div>}
              {paymentMethod === 'card' && <div className="space-y-3"><div><Label className="text-xs">Card Number</Label><Input placeholder="1234 5678 9012 3456" className="h-9 mt-1" /></div><div className="grid grid-cols-2 gap-3"><div><Label className="text-xs">Expiry</Label><Input placeholder="MM/YY" className="h-9 mt-1" /></div><div><Label className="text-xs">CVV</Label><Input placeholder="123" type="password" className="h-9 mt-1" /></div></div></div>}
              <div className="flex gap-2 mt-4"><Button variant="outline" onClick={() => setCurrentStep('address')}>Back</Button><Button onClick={() => setCurrentStep('review')}>Review Order</Button></div>
            </div>
          )}
          {currentStep === 'review' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <div className="rounded-lg border p-4 space-y-3">{items.map(item => <div key={`${item.product.id}-${item.selectedVariant?.id}`} className="flex items-center gap-3"><div className="h-12 w-12 rounded bg-muted flex-shrink-0 overflow-hidden"><img src={item.product.images?.[0]?.url || ''} alt="" className="h-full w-full object-cover" /></div><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.product.name}</p><p className="text-xs text-muted-foreground">Qty: {item.quantity}</p></div><span className="text-sm font-medium">Rs.{(item.product.selling_price * item.quantity).toLocaleString()}</span></div>)}</div>
              <div className="flex gap-2 mt-4"><Button variant="outline" onClick={() => setCurrentStep('payment')}>Back</Button><Button className="bg-orange-500 hover:bg-orange-600 text-white flex-1" onClick={handlePlaceOrder}>Place Order - Rs.{total.toLocaleString()}</Button></div>
            </div>
          )}
        </div>
        <div className="rounded-lg border bg-card p-4 h-fit sticky top-24">
          <h3 className="font-semibold text-sm mb-3">Price Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>Rs.{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-green-600"><span>Discount</span><span>-Rs.{discount.toLocaleString()}</span></div>
            {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Coupon</span><span>-Rs.{couponDiscount.toLocaleString()}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{deliveryCharge === 0 ? <span className="text-green-600">FREE</span> : `Rs.${deliveryCharge}`}</span></div>
            <Separator /><div className="flex justify-between font-bold"><span>Total</span><span>Rs.{total.toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
