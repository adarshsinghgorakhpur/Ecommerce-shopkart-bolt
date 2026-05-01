'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetProductsQuery } from '@/redux/api/apiSlice';
import ProductCard from '@/components/product/ProductCard';
import { supabase } from '@/services/supabase';

export default function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) { const { data } = await supabase.from('wishlist').select('product_id').eq('user_id', user.id); setWishlistIds((data || []).map((d: { product_id: string }) => d.product_id)); }
      setLoading(false);
    };
    fetch();
  }, []);

  const { data: products } = useGetProductsQuery({}, { skip: wishlistIds.length === 0 });
  const wishlistProducts = products?.filter(p => wishlistIds.includes(p.id)) || [];

  if (loading) return <div className="container mx-auto px-4 py-6"><h1 className="text-2xl font-bold mb-6">My Wishlist</h1><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />)}</div></div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">My Wishlist ({wishlistProducts.length})</h1>
      {wishlistProducts.length === 0 ? <div className="text-center py-20"><Heart className="h-16 w-16 mx-auto text-muted-foreground" /><h2 className="text-xl font-bold mt-4">Your wishlist is empty</h2><p className="text-muted-foreground mt-2">Save items you love for later</p><a href="/products"><Button className="mt-6">Browse Products</Button></a></div>
      : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">{wishlistProducts.map(p => <ProductCard key={p.id} product={p} />)}</div>}
    </div>
  );
}
