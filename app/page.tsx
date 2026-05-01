'use client';

import { useMemo } from 'react';
import { useGetProductsQuery, useGetCategoriesQuery, useGetBannersQuery } from '@/redux/api/apiSlice';
import BannerCarousel from '@/components/product/BannerCarousel';
import CategoryGrid from '@/components/product/CategoryGrid';
import FlashSaleSection from '@/components/product/FlashSaleSection';
import TrendingSection from '@/components/product/TrendingSection';
import ProductCardSkeleton from '@/components/product/SkeletonCard';

export default function HomePage() {
  const { data: banners, isLoading: bannersLoading } = useGetBannersQuery();
  const { data: categories, isLoading: categoriesLoading } = useGetCategoriesQuery();
  
  const trendingQuery = useMemo(() => ({ trending: true, limit: 10 }), []);
  const flashSaleQuery = useMemo(() => ({ flashSale: true, limit: 5 }), []);
  
  const { data: trendingProducts, isLoading: trendingLoading } = useGetProductsQuery(trendingQuery);
  const { data: flashSaleProducts, isLoading: flashLoading } = useGetProductsQuery(flashSaleQuery);

  const skeletonArray = useMemo(() => Array.from({ length: 8 }), []);
  const categorySkeletonArray = useMemo(() => Array.from({ length: 8 }), []);
  const flashSkeletonArray = useMemo(() => Array.from({ length: 5 }), []);
  const trendingSkeletonArray = useMemo(() => Array.from({ length: 10 }), []);

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {bannersLoading ? <div className="aspect-[3/1] rounded-xl bg-muted animate-pulse" /> : banners ? <BannerCarousel banners={banners} /> : null}
      <section>
        <h2 className="text-xl font-bold mb-4">Shop by Category</h2>
        {categoriesLoading ? (
          <div className="grid grid-cols-4 gap-4">{categorySkeletonArray.map((_, i) => <div key={i} className="flex flex-col items-center gap-2"><div className="h-20 w-20 rounded-full bg-muted animate-pulse" /><div className="h-4 w-16 bg-muted animate-pulse rounded" /></div>)}</div>
        ) : categories ? <CategoryGrid categories={categories} /> : null}
      </section>
      {flashLoading ? <div className="rounded-xl border p-6"><div className="h-6 w-40 bg-muted animate-pulse rounded" /><div className="grid grid-cols-5 gap-3 mt-4">{flashSkeletonArray.map((_, i) => <ProductCardSkeleton key={i} />)}</div></div> : flashSaleProducts?.length ? <FlashSaleSection products={flashSaleProducts} /> : null}
      <section>{trendingLoading ? <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">{trendingSkeletonArray.map((_, i) => <ProductCardSkeleton key={i} />)}</div> : trendingProducts ? <TrendingSection products={trendingProducts} /> : null}</section>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white"><h3 className="text-lg font-bold">New User Offer</h3><p className="mt-1 text-sm opacity-90">Get 10% off on your first order. Use code WELCOME10</p><p className="mt-3 text-xs opacity-70">Min order Rs.500 | Max discount Rs.500</p></div>
        <div className="rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white"><h3 className="text-lg font-bold">Free Delivery</h3><p className="mt-1 text-sm opacity-90">On all orders above Rs.500. No code needed.</p><p className="mt-3 text-xs opacity-70">Applicable on all payment methods</p></div>
      </section>
    </div>
  );
}
