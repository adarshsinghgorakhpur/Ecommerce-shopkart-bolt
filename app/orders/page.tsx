'use client';

import { useState, useEffect } from 'react';
import { Package, ChevronDown, ChevronUp, Truck, CircleCheck as CheckCircle, Clock, Circle as XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/services/supabase';
import { ORDER_STATUS_COLORS } from '@/constants';
import type { Order } from '@/types';

const statusIcons: Record<string, React.ReactNode> = { pending: <Clock className="h-4 w-4" />, confirmed: <CheckCircle className="h-4 w-4" />, shipped: <Truck className="h-4 w-4" />, delivered: <CheckCircle className="h-4 w-4" />, cancelled: <XCircle className="h-4 w-4" /> };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase.from('orders').select('*, items:order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false });
      setOrders((data as Order[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="container mx-auto px-4 py-6 max-w-4xl"><h1 className="text-2xl font-bold mb-6">My Orders</h1>{Array.from({ length: 3 }).map((_, i) => <div key={i} className="rounded-lg border p-4 mb-3 animate-pulse"><div className="h-5 w-32 bg-muted rounded mb-3" /><div className="h-4 w-48 bg-muted rounded" /></div>)}</div>;
  if (orders.length === 0) return <div className="container mx-auto px-4 py-20 text-center"><Package className="h-16 w-16 mx-auto text-muted-foreground" /><h2 className="text-2xl font-bold mt-4">No orders yet</h2><p className="text-muted-foreground mt-2">Start shopping to see your orders here</p><a href="/products"><Button className="mt-6">Shop Now</Button></a></div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <div className="space-y-3">{orders.map(order => (
        <div key={order.id} className="rounded-lg border bg-card">
          <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)} className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">{statusIcons[order.status]}<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ORDER_STATUS_COLORS[order.status] || ''}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></div>
              <div className="text-left"><p className="text-sm font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p><p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p></div>
            </div>
            <div className="flex items-center gap-3"><span className="font-bold text-sm">Rs.{order.total.toLocaleString()}</span>{expandedOrder === order.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</div>
          </button>
          {expandedOrder === order.id && (
            <div className="px-4 pb-4"><Separator className="mb-3" />
              <div className="space-y-2">{order.items?.map(item => <div key={item.id} className="flex items-center gap-3"><div className="h-12 w-12 rounded bg-muted flex-shrink-0 overflow-hidden">{item.image_url && <img src={item.image_url} alt="" className="h-full w-full object-cover" />}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.product_name}</p>{item.variant_info && <p className="text-xs text-muted-foreground">{item.variant_info}</p>}<p className="text-xs text-muted-foreground">Qty: {item.quantity}</p></div><span className="text-sm font-medium">Rs.{item.price.toLocaleString()}</span></div>)}</div>
              <Separator className="my-3" />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>Rs.{order.subtotal.toLocaleString()}</span></div>
                {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-Rs.{order.discount.toLocaleString()}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{order.delivery_charge === 0 ? 'FREE' : `Rs.${order.delivery_charge}`}</span></div>
                <Separator className="my-1" /><div className="flex justify-between font-bold"><span>Total</span><span>Rs.{order.total.toLocaleString()}</span></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Payment: {order.payment_method.toUpperCase()}</p>
            </div>
          )}
        </div>
      ))}</div>
    </div>
  );
}
