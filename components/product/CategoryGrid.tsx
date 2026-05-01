'use client';

import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Category } from '@/types';

interface Props { categories: Category[]; }

function CategoryGrid({ categories }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
      {categories.map((cat, i) => (
        <Link key={cat.id} href={`/products?category=${cat.slug}`}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.03 }} className="group relative flex flex-col items-center gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md">
            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-muted">
              <Image src={cat.image_url || 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg'} alt={cat.name} fill className="object-cover transition-transform group-hover:scale-110" sizes="80px" />
            </div>
            <span className="text-sm font-medium text-center">{cat.name}</span>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}

export default memo(CategoryGrid);
