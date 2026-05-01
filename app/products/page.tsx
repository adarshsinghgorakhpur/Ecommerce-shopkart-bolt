'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useGetProductsQuery, useGetCategoriesQuery } from '@/redux/api/apiSlice';
import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/product/SkeletonCard';
import FilterSidebar from '@/components/filters/FilterSidebar';
import { SORT_OPTIONS } from '@/constants';
import type { SortOption } from '@/types';

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 999999]);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const PER_PAGE = 12;

  const { data: categories } = useGetCategoriesQuery();
  const { data: allProducts, isLoading } = useGetProductsQuery({ category: selectedCategory, search: searchParam, sortBy });

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts.filter(p => {
      if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false;
      if (p.rating < selectedRating) return false;
      if (p.selling_price < priceRange[0] || p.selling_price > priceRange[1]) return false;
      return true;
    });
  }, [allProducts, selectedBrands, selectedRating, priceRange]);

  const paginatedProducts = useMemo(() => filteredProducts.slice((page - 1) * PER_PAGE, page * PER_PAGE), [filteredProducts, page]);
  const totalPages = Math.ceil(filteredProducts.length / PER_PAGE);

  const clearFilters = () => { setSelectedCategory(''); setSelectedBrands([]); setSelectedRating(0); setPriceRange([0, 999999]); setSortBy('relevance'); setPage(1); };

  const filterContent = <FilterSidebar categories={categories || []} products={allProducts || []} selectedCategory={selectedCategory} selectedBrands={selectedBrands} selectedRating={selectedRating} priceRange={priceRange} onCategoryChange={c => { setSelectedCategory(c); setPage(1); }} onBrandChange={setSelectedBrands} onRatingChange={setSelectedRating} onPriceChange={setPriceRange} onClear={clearFilters} />;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold">{searchParam ? `Results for "${searchParam}"` : selectedCategory ? categories?.find(c => c.slug === selectedCategory)?.name || 'Products' : 'All Products'}</h1><p className="text-sm text-muted-foreground mt-1">{filteredProducts.length} products found</p></div>
        <div className="flex items-center gap-2">
          <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}><SheetTrigger asChild><Button variant="outline" size="sm" className="md:hidden"><SlidersHorizontal className="h-4 w-4 mr-1" /> Filters</Button></SheetTrigger><SheetContent side="left" className="w-80"><SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader><div className="mt-4">{filterContent}</div></SheetContent></Sheet>
          <Select value={sortBy} onValueChange={v => setSortBy(v as SortOption)}><SelectTrigger className="w-[180px] h-9 text-sm"><SelectValue placeholder="Sort by" /></SelectTrigger><SelectContent>{SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
          <div className="hidden sm:flex border rounded-md"><Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" className="h-9 w-9" onClick={() => setViewMode('grid')}><LayoutGrid className="h-4 w-4" /></Button><Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" className="h-9 w-9" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button></div>
        </div>
      </div>
      {(selectedCategory || selectedBrands.length || selectedRating || priceRange[0] > 0 || priceRange[1] < 999999) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCategory && <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs">{categories?.find(c => c.slug === selectedCategory)?.name}<X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory('')} /></span>}
          {selectedBrands.map(b => <span key={b} className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs">{b}<X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedBrands(selectedBrands.filter(x => x !== b))} /></span>)}
          {selectedRating > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs">{selectedRating}+ Stars<X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedRating(0)} /></span>}
        </div>
      )}
      <div className="flex gap-6">
        <aside className="hidden md:block w-64 flex-shrink-0"><div className="sticky top-24 rounded-lg border p-4 max-h-[calc(100vh-8rem)] overflow-y-auto">{filterContent}</div></aside>
        <div className="flex-1">
          {isLoading ? <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>{Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>
          : paginatedProducts.length ? <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>{paginatedProducts.map(p => <ProductCard key={p.id} product={p} viewMode={viewMode} />)}</div>
          : <div className="flex flex-col items-center justify-center py-20 text-center"><p className="text-lg font-medium">No products found</p><p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p><Button variant="outline" className="mt-4" onClick={clearFilters}>Clear Filters</Button></div>}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => <Button key={i + 1} variant={page === i + 1 ? 'default' : 'outline'} size="sm" onClick={() => setPage(i + 1)}>{i + 1}</Button>)}
              {totalPages > 5 && <span className="text-muted-foreground">...</span>}
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return <Suspense fallback={<div className="container mx-auto px-4 py-6"><div className="grid grid-cols-4 gap-3">{Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div></div>}><ProductsContent /></Suspense>;
}
