'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Minus,
  Plus,
  Heart,
  GitCompare,
  Share2,
  ShoppingCart,
  Zap,
  Truck,
  Star,
} from 'lucide-react';
import { useGetProductQuery, useGetProductsQuery, useGetReviewsQuery } from '@/redux/api/apiSlice';
import { addRecentlyViewed } from '@/redux/slices/recentlyViewedSlice';
import { addToCart } from '@/redux/slices/cartSlice';
import { addToCompare } from '@/redux/slices/compareSlice';
import { useAppDispatch } from '@/redux/hooks';
import { DELIVERY_ESTIMATE_DAYS, FREE_DELIVERY_THRESHOLD } from '@/constants';
import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/product/SkeletonCard';
import ReviewSection from '@/components/reviews/ReviewSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { ProductVariant } from '@/types';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const slug = params.id as string;

  const { data: product, isLoading: productLoading } = useGetProductQuery(slug);
  const { data: reviews } = useGetReviewsQuery(product?.id || '');
  const { data: similarProducts, isLoading: similarLoading } = useGetProductsQuery(
    { category: product?.category?.slug, limit: 8 },
    { skip: !product?.category }
  );

  // Variant state
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariant>>({});

  // Quantity state
  const [quantity, setQuantity] = useState(1);

  // Image gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);

  // Wishlist state
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Derived data
  const images = product?.images || [];
  const selectedImage = images[selectedImageIndex] || images[0];

  // Group variants by type using Array.from(new Set(...)) to avoid downlevelIteration
  const variantTypes = useMemo(() => {
    if (!product?.variants) return [];
    return Array.from(new Set(product.variants.map((v) => v.variant_type)));
  }, [product?.variants]);

  const variantsByType = useMemo(() => {
    if (!product?.variants) return {};
    const grouped: Record<string, ProductVariant[]> = {};
    product.variants.forEach((v) => {
      if (!grouped[v.variant_type]) grouped[v.variant_type] = [];
      grouped[v.variant_type].push(v);
    });
    return grouped;
  }, [product?.variants]);

  // Calculate current price based on selected variants
  const currentPrice = useMemo(() => {
    if (!product) return 0;
    let price = product.selling_price;
    Object.values(selectedVariants).forEach((variant) => {
      price += variant.price_adjustment;
    });
    return price;
  }, [product, selectedVariants]);

  const currentBasePrice = useMemo(() => {
    if (!product) return 0;
    let price = product.base_price;
    Object.values(selectedVariants).forEach((variant) => {
      price += variant.price_adjustment;
    });
    return price;
  }, [product, selectedVariants]);

  const currentDiscount = useMemo(() => {
    if (currentBasePrice <= 0) return 0;
    return Math.round(((currentBasePrice - currentPrice) / currentBasePrice) * 100);
  }, [currentBasePrice, currentPrice]);

  // Track recently viewed
  const handleTrackRecentlyViewed = useCallback(() => {
    if (product) {
      dispatch(addRecentlyViewed(product));
    }
  }, [product, dispatch]);

  // Track when product loads
  useEffect(() => {
    if (product) {
      handleTrackRecentlyViewed();
    }
  }, [product, handleTrackRecentlyViewed]);

  // Variant selection
  const handleVariantSelect = useCallback(
    (variantType: string, variant: ProductVariant) => {
      setSelectedVariants((prev) => {
        const updated = { ...prev };
        if (prev[variantType]?.id === variant.id) {
          delete updated[variantType];
        } else {
          updated[variantType] = variant;
        }
        return updated;
      });
    },
    []
  );

  // Quantity handlers
  const handleQuantityDecrease = useCallback(() => {
    setQuantity((prev) => Math.max(1, prev - 1));
  }, []);

  const handleQuantityIncrease = useCallback(() => {
    setQuantity((prev) => Math.min(product?.stock || 99, prev + 1));
  }, [product?.stock]);

  // Add to cart
  const handleAddToCart = useCallback(() => {
    if (!product) return;
    const selectedVariantList = Object.values(selectedVariants);
    const selectedVariant =
      selectedVariantList.length > 0 ? selectedVariantList[0] : undefined;
    dispatch(addToCart({ product, variant: selectedVariant, quantity }));
  }, [product, selectedVariants, quantity, dispatch]);

  // Buy now
  const handleBuyNow = useCallback(() => {
    handleAddToCart();
    router.push('/cart');
  }, [handleAddToCart, router]);

  // Compare
  const handleCompare = useCallback(() => {
    if (product) {
      dispatch(addToCompare(product));
    }
  }, [product, dispatch]);

  // Share
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          url: window.location.href,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  }, [product?.name]);

  // Image zoom
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isZooming) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({ x, y });
    },
    [isZooming]
  );

  // Delivery estimate date
  const estimatedDelivery = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + DELIVERY_ESTIMATE_DAYS);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  // Loading state
  if (productLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-lg bg-muted" />
          <div className="space-y-4">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-10 w-48 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg font-medium text-muted-foreground">Product not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/products')}>
          Browse Products
        </Button>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {product.category && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/products?category=${product.category.slug}`}>
                  {product.category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image with Zoom */}
          <div
            className="relative aspect-square cursor-crosshair overflow-hidden rounded-lg border"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
          >
            <div
              className="h-full w-full transition-transform duration-200"
              style={
                isZooming && selectedImage
                  ? {
                      backgroundImage: `url(${selectedImage.url})`,
                      backgroundSize: '200%',
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      backgroundRepeat: 'no-repeat',
                    }
                  : undefined
              }
            >
              {selectedImage && (
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.alt_text || product.name}
                  fill
                  className={isZooming ? 'opacity-0' : 'object-cover'}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  placeholder="blur"
                  blurDataURL="/placeholder.png"
                />
              )}
            </div>

            {/* Badges */}
            <div className="absolute left-3 top-3 flex flex-col gap-1">
              {product.discount_percent > 0 && (
                <Badge className="bg-red-500 text-white">
                  {product.discount_percent}% OFF
                </Badge>
              )}
              {product.is_flash_sale && (
                <Badge className="bg-orange-500 text-white">
                  <Zap className="mr-1 h-3 w-3" />
                  FLASH SALE
                </Badge>
              )}
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                    index === selectedImageIndex
                      ? 'border-primary'
                      : 'border-transparent hover:border-muted-foreground/30'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt_text || `${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                    placeholder="blur"
                    blurDataURL="/placeholder.png"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Brand & Name */}
          <div>
            {product.brand && (
              <p className="text-sm font-medium text-muted-foreground">{product.brand}</p>
            )}
            <h1 className="mt-1 text-2xl font-bold lg:text-3xl">{product.name}</h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              ({product.review_count} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">
              ₹{currentPrice.toLocaleString()}
            </span>
            {currentDiscount > 0 && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  ₹{currentBasePrice.toLocaleString()}
                </span>
                <Badge variant="destructive" className="text-sm">
                  {currentDiscount}% OFF
                </Badge>
              </>
            )}
          </div>

          {/* Short Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.short_description}
          </p>

          <Separator />

          {/* Variant Selection */}
          {variantTypes.map((variantType) => (
            <div key={variantType} className="space-y-2">
              <p className="text-sm font-medium">
                {variantType}:{' '}
                <span className="text-muted-foreground">
                  {selectedVariants[variantType]?.variant_value || 'Select'}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {(variantsByType[variantType] || []).map((variant) => (
                  <Button
                    key={variant.id}
                    variant={
                      selectedVariants[variantType]?.id === variant.id
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => handleVariantSelect(variantType, variant)}
                    disabled={variant.stock === 0}
                  >
                    {variant.variant_value}
                    {variant.price_adjustment !== 0 && (
                      <span className="ml-1 text-xs opacity-70">
                        {variant.price_adjustment > 0 ? '+' : ''}
                        ₹{variant.price_adjustment}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity Picker */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Quantity</p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={handleQuantityDecrease}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="flex h-9 w-12 items-center justify-center rounded-md border text-sm font-medium">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={handleQuantityIncrease}
                disabled={quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
              {isLowStock && (
                <span className="ml-2 text-xs font-medium text-orange-500">
                  Only {product.stock} left in stock!
                </span>
              )}
              {isOutOfStock && (
                <span className="ml-2 text-xs font-medium text-red-500">
                  Out of stock
                </span>
              )}
            </div>
          </div>

          <Separator />

          {/* Delivery Estimate */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span>
                Delivery by{' '}
                <span className="font-medium">{estimatedDelivery}</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {currentPrice >= FREE_DELIVERY_THRESHOLD
                ? 'Free delivery on this order'
                : `Free delivery on orders above ₹${FREE_DELIVERY_THRESHOLD.toLocaleString()}`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="flex-1"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
            >
              Buy Now
            </Button>
          </div>

          {/* Wishlist, Compare, Share */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setIsWishlisted((prev) => !prev)}
            >
              <Heart
                className={`mr-2 h-4 w-4 ${
                  isWishlisted ? 'fill-red-500 text-red-500' : ''
                }`}
              />
              {isWishlisted ? 'Wishlisted' : 'Wishlist'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleCompare}
            >
              <GitCompare className="mr-2 h-4 w-4" />
              Compare
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>

          <Separator />

          {/* Product Description */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Product Description</h2>
            <div
              className="prose prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <Separator className="mb-8" />
        <h2 className="mb-6 text-xl font-bold">Customer Reviews</h2>
        <ReviewSection productId={product.id} reviews={reviews || []} />
      </div>

      {/* Similar Products */}
      {similarProducts && similarProducts.length > 0 && (
        <div className="mt-12">
          <Separator className="mb-8" />
          <h2 className="mb-6 text-xl font-bold">Similar Products</h2>
          {similarLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {similarProducts
                .filter((p) => p.id !== product.id)
                .slice(0, 4)
                .map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
