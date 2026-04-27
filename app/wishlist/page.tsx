'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/services/supabase';
import { useGetWishlistProductsQuery } from '@/redux/api/apiSlice';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const [userId, setUserId] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing wishlist:', error);
      } finally {
        setInitialized(true);
      }
    };

    fetchUser();
  }, []);

  const { data: wishlistProducts, isLoading: wishlistLoading } = useGetWishlistProductsQuery(userId, {
    skip: !userId,
  });

  const loading = wishlistLoading || !initialized;

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 rounded-full bg-muted p-6">
            <Heart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">Login to view your wishlist</h2>
          <p className="mt-2 text-muted-foreground">
            Sign in to keep your wishlist synced across devices.
          </p>
          <Button asChild className="mt-6" size="lg">
            <Link href="/auth/login">
              <Heart className="mr-2 h-5 w-5" />
              Login
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const products = wishlistProducts || [];

  if (products.length === 0) {
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
          {products.length} item{products.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
