'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Banner } from '@/types';

interface Props { banners: Banner[]; }

export default function BannerCarousel({ banners }: Props) {
  const [current, setCurrent] = useState(0);
  const next = useCallback(() => setCurrent(c => (c + 1) % banners.length), [banners.length]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + banners.length) % banners.length), [banners.length]);

  useEffect(() => { const t = setInterval(next, 5000); return () => clearInterval(t); }, [next]);
  if (!banners.length) return null;

  return (
    <div className="relative overflow-hidden rounded-xl bg-muted">
      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="relative aspect-[21/9] sm:aspect-[3/1]">
          <Link href={banners[current].link_url}>
            <Image src={banners[current].image_url} alt={banners[current].title} fill className="object-cover" sizes="100vw" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <h2 className="text-2xl sm:text-4xl font-bold">{banners[current].title}</h2>
              <p className="mt-1 text-sm sm:text-lg opacity-90">{banners[current].subtitle}</p>
              <Button className="mt-3 bg-white text-black hover:bg-white/90" size="sm">Shop Now</Button>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>
      <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 h-8 w-8 rounded-full" onClick={prev}><ChevronLeft className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 h-8 w-8 rounded-full" onClick={next}><ChevronRight className="h-4 w-4" /></Button>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {banners.map((_, i) => (<button key={i} onClick={() => setCurrent(i)} className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />))}
      </div>
    </div>
  );
}
