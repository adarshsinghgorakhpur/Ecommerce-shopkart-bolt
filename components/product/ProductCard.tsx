'use client';

import { memo, useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, GitCompare, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { addToCart } from '@/redux/slices/cartSlice';
import { addToCompare } from '@/redux/slices/compareSlice';
import { useAppDispatch } from '@/redux/hooks';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const primaryImage = useMemo(
    () => product.images?.find((img) => img.is_primary) ?? product.images?.[0],
    [product.images]
  );

  const imageUrl = useMemo(
    () => primaryImage?.url ?? '/placeholder.png',
    [primaryImage?.url]
  );

  const imageAlt = useMemo(
    () => primaryImage?.alt_text ?? product.name,
    [primaryImage?.alt_text, product.name]
  );

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dispatch(addToCart({ product }));
    },
    [dispatch, product]
  );

  const handleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsWishlisted((prev) => !prev);
    },
    []
  );

  const handleCompare = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dispatch(addToCompare(product));
    },
    [dispatch, product]
  );

  const isLowStock = useMemo(() => product.stock > 0 && product.stock <= 5, [product.stock]);
  const isOutOfStock = useMemo(() => product.stock === 0, [product.stock]);

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="group relative flex gap-4 rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
      >
        <Link href={`/product/${product.slug}`} className="flex flex-1 gap-4">
          <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-md">
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="128px"
              placeholder="blur"
              blurDataURL="/placeholder.png"
            />
            {product.discount_percent > 0 && (
              <Badge className="absolute left-1 top-1 bg-red-500 text-white text-[10px]">
                {product.discount_percent}% OFF
              </Badge>
            )}
            {product.is_flash_sale && (
              <Badge className="absolute right-1 top-1 bg-orange-500 text-white text-[10px]">
                FLASH
              </Badge>
            )}
          </div>

          <div className="flex flex-1 flex-col justify-between">
            <div>
              <h3 className="line-clamp-2 font-semibold text-foreground group-hover:text-primary">
                {product.name}
              </h3>
              {product.brand && (
                <p className="text-xs text-muted-foreground">{product.brand}</p>
              )}
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {product.short_description}
              </p>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-foreground">
                  ₹{product.selling_price.toLocaleString()}
                </span>
                {product.base_price > product.selling_price && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{product.base_price.toLocaleString()}
                  </span>
                )}
              </div>
              <Badge variant="secondary" className="gap-1 text-xs">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {product.rating.toFixed(1)}
              </Badge>
            </div>

            {isLowStock && (
              <p className="mt-1 text-xs font-medium text-orange-500">
                Only {product.stock} left in stock!
              </p>
            )}
            {isOutOfStock && (
              <p className="mt-1 text-xs font-medium text-red-500">Out of stock</p>
            )}
          </div>
        </Link>

        <div className="flex flex-col items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleWishlist}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleCompare}
          >
            <GitCompare className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            size="icon"
            className="h-8 w-8"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  // Grid view (default)
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <Link href={`/product/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            placeholder="blur"
            blurDataURL="/placeholder.png"
          />

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.discount_percent > 0 && (
              <Badge className="bg-red-500 text-white text-[10px]">
                {product.discount_percent}% OFF
              </Badge>
            )}
            {product.is_flash_sale && (
              <Badge className="bg-orange-500 text-white text-[10px]">
                <Zap className="mr-1 h-3 w-3" />
                FLASH SALE
              </Badge>
            )}
          </div>

          {/* Hover actions */}
          <div className="absolute right-2 top-2 flex flex-col gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full shadow-sm"
              onClick={handleWishlist}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full shadow-sm"
              onClick={handleCompare}
            >
              <GitCompare className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="h-8 w-8 rounded-full shadow-sm"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>

          {/* Stock warning overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded bg-black/70 px-3 py-1 text-sm font-medium text-white">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-3">
          {product.brand && (
            <p className="text-xs text-muted-foreground">{product.brand}</p>
          )}
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary">
            {product.name}
          </h3>

          <div className="mt-auto flex items-center gap-2 pt-2">
            <span className="text-base font-bold text-foreground">
              ₹{product.selling_price.toLocaleString()}
            </span>
            {product.base_price > product.selling_price && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{product.base_price.toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {product.rating.toFixed(1)} ({product.review_count})
            </Badge>
            {isLowStock && (
              <span className="text-[10px] font-medium text-orange-500">
                Only {product.stock} left!
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default memo(ProductCard);

