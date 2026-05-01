'use client';

import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import ProductCard from './ProductCard';
import type { Product } from '@/types';

interface Props { products: Product[]; }

function TrendingSection({ products }: Props) {
  const limitedProducts = useMemo(() => products.slice(0, 10), [products]);
  
  if (!products.length) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><TrendingUp className="h-5 w-5 text-primary" /><h2 className="text-xl font-bold">Trending Now</h2></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {limitedProducts.map((p, i) => <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}><ProductCard product={p} /></motion.div>)}
      </div>
    </div>
  );
}

export default memo(TrendingSection);
