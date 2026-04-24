'use client';

import { useState, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import { useGetProductsQuery, useGetCategoriesQuery } from '@/redux/api/apiSlice';
import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/product/SkeletonCard';
import FilterSidebar from '@/components/filters/FilterSidebar';
import { SORT_OPTIONS } from '@/constants';
import type { SortOption } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 12;

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 999999]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { data: products, isLoading: productsLoading } = useGetProductsQuery({
    category: categoryParam,
    search: searchParam,
    sortBy,
  });

  const { data: categories } = useGetCategoriesQuery();

  // Client-side filtering
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let filtered = [...products];

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) => selectedBrands.includes(p.brand));
    }

    if (selectedRating > 0) {
      filtered = filtered.filter((p) => p.rating >= selectedRating);
    }

    filtered = filtered.filter(
      (p) => p.selling_price >= priceRange[0] && p.selling_price <= priceRange[1]
    );

    return filtered;
  }, [products, selectedBrands, selectedRating, priceRange]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Handlers
  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (categoryId) {
        params.set('category', categoryId);
      } else {
        params.delete('category');
      }
      router.push(`/products?${params.toString()}`);
      setCurrentPage(1);
      setMobileFilterOpen(false);
    },
    [searchParams, router]
  );

  const handleBrandChange = useCallback((brand: string, checked: boolean) => {
    setSelectedBrands((prev) =>
      checked ? [...prev, brand] : prev.filter((b) => b !== brand)
    );
    setCurrentPage(1);
  }, []);

  const handleRatingChange = useCallback((rating: number) => {
    setSelectedRating(rating);
    setCurrentPage(1);
  }, []);

  const handlePriceRangeChange = useCallback((range: [number, number]) => {
    setPriceRange(range);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value as SortOption);
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedBrands([]);
    setSelectedRating(0);
    setPriceRange([0, 999999]);
    const params = new URLSearchParams();
    router.push(`/products?${params.toString()}`);
    setCurrentPage(1);
  }, [router]);

  const removeFilterChip = useCallback(
    (type: 'category' | 'brand' | 'rating' | 'price', value?: string) => {
      switch (type) {
        case 'category':
          handleCategoryChange('');
          break;
        case 'brand':
          if (value) handleBrandChange(value, false);
          break;
        case 'rating':
          handleRatingChange(0);
          break;
        case 'price':
          handlePriceRangeChange([0, 999999]);
          break;
      }
    },
    [handleCategoryChange, handleBrandChange, handleRatingChange, handlePriceRangeChange]
  );

  // Active filter chips
  const activeFilters = useMemo(() => {
    const chips: { type: 'category' | 'brand' | 'rating' | 'price'; label: string; value?: string }[] = [];

    if (categoryParam) {
      const cat = categories?.find((c) => c.slug === categoryParam);
      chips.push({ type: 'category', label: cat ? cat.name : categoryParam });
    }

    selectedBrands.forEach((brand) => {
      chips.push({ type: 'brand', label: brand, value: brand });
    });

    if (selectedRating > 0) {
      chips.push({ type: 'rating', label: `${selectedRating}+ Stars` });
    }

    if (priceRange[0] > 0 || priceRange[1] < 999999) {
      chips.push({
        type: 'price',
        label: `Rs.${priceRange[0]} - Rs.${priceRange[1]}`,
      });
    }

    return chips;
  }, [categoryParam, categories, selectedBrands, selectedRating, priceRange]);

  // Pagination page numbers
  const getPageNumbers = useCallback(() => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  const sidebarContent = (
    <FilterSidebar
      categories={categories || []}
      products={products || []}
      selectedCategory={categoryParam}
      selectedBrands={selectedBrands}
      selectedRating={selectedRating}
      priceRange={priceRange}
      onCategoryChange={handleCategoryChange}
      onBrandChange={handleBrandChange}
      onRatingChange={handleRatingChange}
      onPriceRangeChange={handlePriceRangeChange}
      onClear={handleClearFilters}
    />
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {searchParam
            ? `Search results for "${searchParam}"`
            : categoryParam
            ? categories?.find((c) => c.slug === categoryParam)?.name || 'Products'
            : 'All Products'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Toolbar: Sort, View Toggle, Mobile Filter */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4">{sidebarContent}</div>
            </SheetContent>
          </Sheet>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 rounded-md border p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge
              key={`${filter.type}-${filter.value ?? index}`}
              variant="secondary"
              className="gap-1 pr-1"
            >
              {filter.label}
              <button
                onClick={() => removeFilterChip(filter.type, filter.value)}
                className="ml-1 rounded-full p-0.5 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={handleClearFilters}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden w-64 flex-shrink-0 lg:block">
          <div className="sticky top-24">{sidebarContent}</div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {productsLoading ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3'
                  : 'flex flex-col gap-4'
              }
            >
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg font-medium text-muted-foreground">No products found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleClearFilters}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3'
                    : 'flex flex-col gap-4'
                }
              >
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          className={
                            currentPage === 1
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>

                      {getPageNumbers().map((page, index) =>
                        page === 'ellipsis' ? (
                          <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={page}>
                            <PaginationLink
                              isActive={currentPage === page}
                              onClick={() => setCurrentPage(page)}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                          }
                          className={
                            currentPage === totalPages
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <div className="h-8 w-64 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="flex gap-8">
            <div className="hidden w-64 lg:block">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded bg-muted" />
                ))}
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
