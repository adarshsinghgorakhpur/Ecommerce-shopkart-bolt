'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { Zap, Clock } from 'lucide-react';
import ProductCard from './ProductCard';
import type { Product } from '@/types';

interface Props { products: Product[]; }

function FlashSaleSection({ products }: Props) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const firstProduct = useMemo(() => products.find(p => p.flash_sale_ends_at), [products]);
  const limitedProducts = useMemo(() => products.slice(0, 5), [products]);
  
  useEffect(() => {
    if (!firstProduct?.flash_sale_ends_at) return;
    const calc = () => {
      const diff = Math.max(0, new Date(firstProduct.flash_sale_ends_at!).getTime() - Date.now());
      return { hours: Math.floor(diff / 3600000), minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000) };
    };
    setTimeLeft(calc());
    const t = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(t);
  }, [firstProduct]);

  if (!products.length) return null;

  return (
    <div className="rounded-xl border bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2"><Zap className="h-5 w-5 text-red-600 fill-red-600" /><h2 className="text-xl font-bold text-red-600">Flash Sale</h2></div>
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="h-4 w-4 text-red-600" />
            <div className="flex gap-1">
              {[{ v: timeLeft.hours, l: 'h' }, { v: timeLeft.minutes, l: 'm' }, { v: timeLeft.seconds, l: 's' }].map(t => (
                <span key={t.l} className="inline-flex items-center rounded bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white">{String(t.v).padStart(2, '0')}{t.l}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {limitedProducts.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}

export default memo(FlashSaleSection);
