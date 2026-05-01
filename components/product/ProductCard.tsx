'use client';

import { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch } from '@/redux/hooks';
import { addToCart } from '@/redux/slices/cartSlice';
import { addToCompare } from '@/redux/slices/compareSlice';
import type { Product } from '@/types';

interface Props { product: Product; viewMode?: 'grid' | 'list'; }

function ProductCard({ product, viewMode = 'grid' }: Props) {
  const dispatch = useAppDispatch();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const primaryImage = product.images?.find(i => i.is_primary) || product.images?.[0];
  const imageUrl = imgError ? 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg' : primaryImage?.url;

  const handleAddToCart = useCallback((e: React.MouseEvent) => { 
    e.preventDefault(); 
    e.stopPropagation(); 
    dispatch(addToCart({ product, quantity: 1 })); 
  }, [dispatch, product]);
  
  const handleWishlist = useCallback((e: React.MouseEvent) => { 
    e.preventDefault(); 
    e.stopPropagation(); 
    setIsWishlisted(!isWishlisted); 
  }, [isWishlisted]);
  
  const handleCompare = useCallback((e: React.MouseEvent) => { 
    e.preventDefault(); 
    e.stopPropagation(); 
    dispatch(addToCompare(product)); 
  }, [dispatch, product]);

  if (viewMode === 'list') {
    return (
      <Link href={`/product/${product.slug}`}>
        <motion.div whileHover={{ y: -2 }} className="flex gap-4 rounded-lg border bg-card p-4 transition-shadow hover:shadow-md">
          <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-md bg-muted">
            <Image src={imageUrl || ''} alt={product.name} fill className="object-cover" sizes="128px" />
            {product.discount_percent > 0 && <Badge className="absolute left-1 top-1 bg-green-600 text-white text-[10px] px-1.5 py-0">{product.discount_percent}% OFF</Badge>}
          </div>
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{product.brand}</p>
              <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="flex items-center gap-0.5 rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{product.rating} <Star className="h-2.5 w-2.5 fill-white" /></span>
                <span className="text-xs text-muted-foreground">({product.review_count.toLocaleString()})</span>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-lg font-bold">Rs.{product.selling_price.toLocaleString()}</span>
              {product.base_price > product.selling_price && (<><span className="text-sm text-muted-foreground line-through">Rs.{product.base_price.toLocaleString()}</span><span className="text-xs font-medium text-green-600">{product.discount_percent}% off</span></>)}
            </div>
            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={handleAddToCart}>Add to Cart</Button>
              <Button size="sm" variant="outline" onClick={handleWishlist}><Heart className={`h-3.5 w-3.5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} /></Button>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link href={`/product/${product.slug}`}>
      <motion.div whileHover={{ y: -4 }} className="group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image src={imageUrl || ''} alt={product.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
          {product.discount_percent > 0 && <Badge className="absolute left-2 top-2 bg-green-600 text-white text-[10px] px-1.5 py-0.5">{product.discount_percent}% OFF</Badge>}
          {product.is_flash_sale && <Badge className="absolute right-2 top-2 bg-red-600 text-white text-[10px] px-1.5 py-0.5 animate-pulse">FLASH SALE</Badge>}
          <div className="absolute bottom-2 left-2 right-2 flex gap-1.5 opacity-0 translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
            <Button size="sm" className="flex-1 h-8 text-xs" onClick={handleAddToCart}><ShoppingCart className="mr-1 h-3 w-3" /> Add</Button>
            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={handleWishlist}><Heart className={`h-3.5 w-3.5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} /></Button>
            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={handleCompare}><GitCompare className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{product.brand}</p>
          <h3 className="font-medium text-sm leading-tight line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-0.5 rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{product.rating} <Star className="h-2.5 w-2.5 fill-white" /></span>
            <span className="text-[11px] text-muted-foreground">({product.review_count.toLocaleString()})</span>
          </div>
          <div className="mt-auto flex items-baseline gap-2 pt-1">
            <span className="text-base font-bold">Rs.{product.selling_price.toLocaleString()}</span>
            {product.base_price > product.selling_price && (<><span className="text-xs text-muted-foreground line-through">Rs.{product.base_price.toLocaleString()}</span><span className="text-xs font-semibold text-green-600">{product.discount_percent}% off</span></>)}
          </div>
          {product.stock < 10 && product.stock > 0 && <p className="text-[11px] text-red-600 font-medium">Only {product.stock} left!</p>}
        </div>
      </motion.div>
    </Link>
  );
}

export default memo(ProductCard);
