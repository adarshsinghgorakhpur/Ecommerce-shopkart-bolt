'use client';

import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import type { Product } from '@/types';

interface TrendingSectionProps {
  products: Product[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export default function TrendingSection({ products }: TrendingSectionProps) {
  const trendingProducts = products.filter((p) => p.is_trending);

  if (!trendingProducts.length) return null;

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Trending Now
          </h2>
          <p className="text-xs text-muted-foreground">
            Most popular picks this week
          </p>
        </div>
      </div>

      {/* Product grid with staggered animation */}
      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {trendingProducts.map((product) => (
          <motion.div key={product.id} variants={itemVariants}>
            <ProductCard product={product} viewMode="grid" />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
