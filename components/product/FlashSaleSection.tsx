'use client';

import { useState, useEffect } from 'react';
import { Zap, Clock } from 'lucide-react';
import ProductCard from './ProductCard';
import type { Product } from '@/types';

interface FlashSaleSectionProps {
  products: Product[];
}

function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true });
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, expired: true };
      }

      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        expired: false,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const result = calculateTimeLeft();
      setTimeLeft(result);
      if (result.expired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

function padZero(n: number) {
  return n.toString().padStart(2, '0');
}

export default function FlashSaleSection({ products }: FlashSaleSectionProps) {
  const flashSaleProducts = products.filter((p) => p.is_flash_sale);

  // Determine the earliest flash sale end time
  const earliestEnd = flashSaleProducts.reduce<string | null>((earliest, p) => {
    if (!p.flash_sale_ends_at) return earliest;
    if (!earliest) return p.flash_sale_ends_at;
    return new Date(p.flash_sale_ends_at) < new Date(earliest)
      ? p.flash_sale_ends_at
      : earliest;
  }, null);

  const { hours, minutes, seconds, expired } = useCountdown(earliestEnd);

  if (!flashSaleProducts.length) return null;

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500 text-white">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Flash Sale
            </h2>
            <p className="text-xs text-muted-foreground">
              Hurry! Deals end soon
            </p>
          </div>
        </div>

        {!expired && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-red-500" />
            <div className="flex items-center gap-1">
              <span className="flex h-8 min-w-[2rem] items-center justify-center rounded-md bg-red-500 px-1.5 text-sm font-bold text-white">
                {padZero(hours)}
              </span>
              <span className="text-sm font-bold text-red-500">:</span>
              <span className="flex h-8 min-w-[2rem] items-center justify-center rounded-md bg-red-500 px-1.5 text-sm font-bold text-white">
                {padZero(minutes)}
              </span>
              <span className="text-sm font-bold text-red-500">:</span>
              <span className="flex h-8 min-w-[2rem] items-center justify-center rounded-md bg-red-500 px-1.5 text-sm font-bold text-white">
                {padZero(seconds)}
              </span>
            </div>
          </div>
        )}
        {expired && (
          <span className="text-sm font-medium text-muted-foreground">
            Sale ended
          </span>
        )}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {flashSaleProducts.map((product) => (
          <ProductCard key={product.id} product={product} viewMode="grid" />
        ))}
      </div>
    </section>
  );
}
