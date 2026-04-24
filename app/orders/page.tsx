'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/services/supabase';
import type { Order } from '@/types';
import { ORDER_STATUS_COLORS } from '@/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, Truck, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react';

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending: Clock,
  confirmed: CheckCircle,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data, error } = await supabase
          .from('orders')
          .select('*, items:order_items(*), address:addresses(*)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleExpand = (orderId: string) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 rounded-full bg-muted p-6">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">No orders yet</h2>
          <p className="mt-2 text-muted-foreground">
            You haven&apos;t placed any orders. Start shopping!
          </p>
          <Button asChild className="mt-6" size="lg">
            <Link href="/products">
              <Package className="mr-2 h-5 w-5" />
              Shop Now
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrder === order.id;
          const StatusIcon = STATUS_ICONS[order.status] || Clock;
          const statusColor = ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800';

          return (
            <Card key={order.id}>
              <CardContent className="p-0">
                {/* Order Header */}
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                    <span className="text-sm font-medium">
                      Order #{order.id.slice(0, 8)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(order.created_at)}
                    </span>
                    <Badge className={`${statusColor} text-xs w-fit`}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      Rs.{order.total.toLocaleString()}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded Order Details */}
                {isExpanded && (
                  <div className="border-t">
                    {/* Order Items */}
                    <div className="p-4 space-y-3">
                      <h4 className="text-sm font-semibold">Items</h4>
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                            <Image
                              src={item.image_url || '/placeholder.png'}
                              alt={item.product_name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">
                              {item.product_name}
                            </p>
                            {item.variant_info && (
                              <p className="text-xs text-muted-foreground">
                                {item.variant_info}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <span className="text-sm font-semibold whitespace-nowrap">
                            Rs.{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="p-4 space-y-2">
                      <h4 className="text-sm font-semibold">Price Details</h4>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>Rs.{order.subtotal.toLocaleString()}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Discount</span>
                          <span className="text-green-600">-Rs.{order.discount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery</span>
                        <span className={order.delivery_charge === 0 ? 'text-green-600' : ''}>
                          {order.delivery_charge === 0 ? 'FREE' : `Rs.${order.delivery_charge}`}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>Rs.{order.total.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {order.address && (
                      <>
                        <Separator />
                        <div className="p-4">
                          <h4 className="mb-1 text-sm font-semibold">Shipping Address</h4>
                          <p className="text-sm text-muted-foreground">
                            {order.address.full_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.address.address_line1}
                            {order.address.address_line2 && `, ${order.address.address_line2}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.address.city}, {order.address.state} - {order.address.pincode}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
