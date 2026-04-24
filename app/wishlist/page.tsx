'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/services/supabase';
import { useGetProductsQuery } from '@/redux/api/apiSlice';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import type { Product } from '@/types';

export default function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('wishlist')
          .select('product_id')
          .eq('user_id', session.user.id);

        if (error) throw error;
        if (data) {
          setWishlistIds(data.map((item) => item.product_id));
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const { data: products, isLoading: productsLoading } = useGetProductsQuery(
    { limit: 100 },
    { skip: wishlistIds.length === 0 }
  );

  const wishlistProducts: Product[] = (products || []).filter((p) =>
    wishlistIds.includes(p.id)
  );

  if (loading || productsLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (wishlistProducts.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 rounded-full bg-muted p-6">
            <Heart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">Your wishlist is empty</h2>
          <p className="mt-2 text-muted-foreground">
            Save items you love to your wishlist and find them easily later.
          </p>
          <Button asChild className="mt-6" size="lg">
            <Link href="/products">
              <Heart className="mr-2 h-5 w-5" />
              Explore Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {wishlistProducts.length} item{wishlistProducts.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {wishlistProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
