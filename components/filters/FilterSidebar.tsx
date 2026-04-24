'use client';

import { useMemo } from 'react';
import { Star, X } from 'lucide-react';
import { Category, Product } from '@/types';
import { PRICE_RANGES } from '@/constants';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  categories: Category[];
  products: Product[];
  selectedCategory: string;
  selectedBrands: string[];
  selectedRating: number;
  priceRange: [number, number];
  onCategoryChange: (categoryId: string) => void;
  onBrandChange: (brand: string, checked: boolean) => void;
  onRatingChange: (rating: number) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onClear: () => void;
}

export default function FilterSidebar({
  categories,
  products,
  selectedCategory,
  selectedBrands,
  selectedRating,
  priceRange,
  onCategoryChange,
  onBrandChange,
  onRatingChange,
  onPriceRangeChange,
  onClear,
}: FilterSidebarProps) {
  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    [products]
  );

  const maxPrice = useMemo(
    () => Math.max(...products.map((p) => p.selling_price), 0),
    [products]
  );

  const ratingOptions = [4, 3, 2, 1];

  const hasActiveFilters =
    selectedCategory !== '' ||
    selectedBrands.length > 0 ||
    selectedRating > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < maxPrice;

  return (
    <aside className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
            <X className="mr-1 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      <Separator />

      {/* Category Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Category</h3>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => onCategoryChange('')}
            className={cn(
              'rounded-md px-3 py-1.5 text-left text-sm transition-colors',
              selectedCategory === ''
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            )}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                'rounded-md px-3 py-1.5 text-left text-sm transition-colors',
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range Slider */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Price Range</h3>
        <Slider
          min={0}
          max={maxPrice}
          step={1}
          value={priceRange}
          onValueChange={(value) => onPriceRangeChange(value as [number, number])}
          className="w-full"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Rs.{priceRange[0]}</span>
          <span>Rs.{priceRange[1]}</span>
        </div>

        {/* Price Range Presets */}
        <div className="flex flex-wrap gap-2">
          {PRICE_RANGES.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              className={cn(
                'text-xs',
                priceRange[0] === preset.min &&
                  priceRange[1] === preset.max &&
                  'border-primary bg-primary/10'
              )}
              onClick={() => onPriceRangeChange([preset.min, preset.max])}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Brand Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Brand</h3>
        <div className="flex flex-col gap-2.5">
          {brands.map((brand) => (
            <label
              key={brand}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={selectedBrands.includes(brand)}
                onCheckedChange={(checked) =>
                  onBrandChange(brand, checked === true)
                }
              />
              <span>{brand}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Rating Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Rating</h3>
        <div className="flex flex-col gap-1.5">
          {ratingOptions.map((rating) => (
            <button
              key={rating}
              onClick={() => onRatingChange(selectedRating === rating ? 0 : rating)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors',
                selectedRating === rating
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-4 w-4',
                    i < rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground/30'
                  )}
                />
              ))}
              <span className="ml-1">& Up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Clear All Button (bottom) */}
      {hasActiveFilters && (
        <>
          <Separator />
          <Button variant="outline" className="w-full" onClick={onClear}>
            Clear All Filters
          </Button>
        </>
      )}
    </aside>
  );
}
