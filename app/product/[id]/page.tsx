'use client';

import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, Minus, Plus, GitCompare, Share2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch } from '@/redux/hooks';
import { addToCart } from '@/redux/slices/cartSlice';
import { addToCompare } from '@/redux/slices/compareSlice';
import { addRecentlyViewed } from '@/redux/slices/recentlyViewedSlice';
import { useGetProductQuery, useGetProductsQuery, useGetReviewsQuery } from '@/redux/api/apiSlice';
import ProductCard from '@/components/product/ProductCard';
import ReviewSection from '@/components/reviews/ReviewSection';
import { DELIVERY_ESTIMATE_DAYS, FREE_DELIVERY_THRESHOLD } from '@/constants';
import type { ProductVariant } from '@/types';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.id as string;
  const dispatch = useAppDispatch();
  const { data: product, isLoading } = useGetProductQuery(slug);
  const { data: reviews } = useGetReviewsQuery(product?.id || '', { skip: !product?.id });
  const { data: similarProducts } = useGetProductsQuery({ category: product?.category?.slug, limit: 6 }, { skip: !product?.category });

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariant>>({});
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  const images = product?.images || [];
  const variants = product?.variants || [];
  const variantTypes = useMemo(() => Array.from(new Set(variants.map(v => v.variant_type))), [variants]);

  const effectivePrice = useMemo(() => {
    let adj = 0;
    Object.values(selectedVariants).forEach(v => { adj += v.price_adjustment; });
    return (product?.selling_price || 0) + adj;
  }, [product, selectedVariants]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    dispatch(addToCart({ product, variant: Object.values(selectedVariants)[0], quantity }));
  }, [product, selectedVariants, quantity, dispatch]);

  const handleBuyNow = useCallback(() => {
    handleAddToCart();
    window.location.href = '/checkout';
  }, [handleAddToCart]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPosition({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  if (isLoading) return <div className="container mx-auto px-4 py-8"><div className="grid md:grid-cols-2 gap-8"><div className="aspect-square bg-muted animate-pulse rounded-lg" /><div className="space-y-4"><div className="h-6 w-24 bg-muted animate-pulse rounded" /><div className="h-8 w-3/4 bg-muted animate-pulse rounded" /><div className="h-10 w-32 bg-muted animate-pulse rounded" /></div></div></div>;
  if (!product) return <div className="container mx-auto px-4 py-20 text-center"><h2 className="text-2xl font-bold">Product not found</h2></div>;

  dispatch(addRecentlyViewed(product));
  const deliveryDate = new Date(); deliveryDate.setDate(deliveryDate.getDate() + DELIVERY_ESTIMATE_DAYS);

  return (
    <div className="container mx-auto px-4 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <a href="/" className="hover:text-foreground">Home</a><ChevronRight className="h-3 w-3" />
        <a href={`/products?category=${product.category?.slug}`} className="hover:text-foreground">{product.category?.name}</a><ChevronRight className="h-3 w-3" />
        <span className="text-foreground truncate">{product.name}</span>
      </nav>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted cursor-zoom-in" onMouseEnter={() => setIsZooming(true)} onMouseLeave={() => setIsZooming(false)} onMouseMove={handleMouseMove}>
            <Image src={images[selectedImage]?.url || 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg'} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
            {isZooming && <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `url(${images[selectedImage]?.url})`, backgroundSize: '200%', backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%` }} />}
            {product.discount_percent > 0 && <Badge className="absolute left-3 top-3 bg-green-600 text-white">{product.discount_percent}% OFF</Badge>}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">{images.map((img, i) => <button key={img.id} onClick={() => setSelectedImage(i)} className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors ${i === selectedImage ? 'border-primary' : 'border-transparent'}`}><Image src={img.url} alt={img.alt_text} fill className="object-cover" sizes="64px" /></button>)}</div>
        </div>
        <div className="space-y-4">
          <div><p className="text-sm text-muted-foreground uppercase tracking-wide">{product.brand}</p><h1 className="text-2xl font-bold mt-1">{product.name}</h1></div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded bg-green-600 px-2 py-0.5 text-sm font-bold text-white">{product.rating} <Star className="h-3 w-3 fill-white" /></span>
            <span className="text-sm text-muted-foreground">{product.review_count.toLocaleString()} Ratings & {reviews?.length || 0} Reviews</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">Rs.{effectivePrice.toLocaleString()}</span>
            {product.base_price > product.selling_price && (<><span className="text-lg text-muted-foreground line-through">Rs.{product.base_price.toLocaleString()}</span><Badge variant="secondary" className="bg-green-100 text-green-800">{product.discount_percent}% off</Badge></>)}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Available Offers</p>
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground"><span className="font-medium text-foreground">Bank Offer</span> 10% off on HDFC Credit Cards</p>
              <p className="text-muted-foreground"><span className="font-medium text-foreground">Coupon</span> Use WELCOME10 for 10% off</p>
            </div>
          </div>
          <Separator />
          {variantTypes.map(type => (
            <div key={type}>
              <p className="text-sm font-medium mb-2">Select {type.charAt(0).toUpperCase() + type.slice(1)}</p>
              <div className="flex flex-wrap gap-2">{variants.filter(v => v.variant_type === type).map(variant => <Button key={variant.id} variant={selectedVariants[type]?.id === variant.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedVariants(prev => ({ ...prev, [type]: variant }))} className="min-w-[3rem]">{variant.variant_value}</Button>)}</div>
            </div>
          ))}
          <div><p className="text-sm font-medium mb-2">Quantity</p><div className="flex items-center gap-2"><Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-3 w-3" /></Button><span className="w-10 text-center font-medium">{quantity}</span><Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}><Plus className="h-3 w-3" /></Button>{product.stock < 10 && <span className="text-xs text-red-600 font-medium">Only {product.stock} left</span>}</div></div>
          <Separator />
          <div className="flex items-start gap-3 text-sm"><Truck className="h-5 w-5 text-muted-foreground mt-0.5" /><div><p className="font-medium">Delivery by {deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</p><p className="text-muted-foreground">{effectivePrice >= FREE_DELIVERY_THRESHOLD ? <span className="text-green-600 font-medium">FREE Delivery</span> : 'Rs.40 Delivery'}</p></div></div>
          <div className="flex gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Secure Payment</span><span className="flex items-center gap-1"><RotateCcw className="h-3.5 w-3.5" /> 7-Day Returns</span></div>
          <Separator />
          <div className="flex gap-3">
            <Button size="lg" className="flex-1 h-12 text-base" onClick={handleAddToCart}><ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart</Button>
            <Button size="lg" variant="secondary" className="flex-1 h-12 text-base bg-orange-500 hover:bg-orange-600 text-white" onClick={handleBuyNow}>Buy Now</Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setIsWishlisted(!isWishlisted)}><Heart className={`mr-1 h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} /> Wishlist</Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => dispatch(addToCompare(product))}><GitCompare className="mr-1 h-4 w-4" /> Compare</Button>
            <Button variant="outline" size="sm" className="flex-1"><Share2 className="mr-1 h-4 w-4" /> Share</Button>
          </div>
          <div className="pt-4"><h3 className="font-semibold mb-2">Product Description</h3><p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p></div>
        </div>
      </div>
      <div className="mt-12"><ReviewSection productId={product.id} reviews={reviews || []} /></div>
      {similarProducts && similarProducts.length > 1 && (
        <section className="mt-12"><h2 className="text-xl font-bold mb-4">Similar Products</h2><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">{similarProducts.filter(p => p.id !== product.id).map(p => <ProductCard key={p.id} product={p} />)}</div></section>
      )}
    </div>
  );
}
