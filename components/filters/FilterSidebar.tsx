'use client';

import { useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Star } from 'lucide-react';
import { PRICE_RANGES } from '@/constants';
import type { Product, Category } from '@/types';

interface Props {
  categories: Category[]; products: Product[]; selectedCategory: string;
  selectedBrands: string[]; selectedRating: number; priceRange: [number, number];
  onCategoryChange: (c: string) => void; onBrandChange: (b: string[]) => void;
  onRatingChange: (r: number) => void; onPriceChange: (r: [number, number]) => void;
  onClear: () => void;
}

export default function FilterSidebar({ categories, products, selectedCategory, selectedBrands, selectedRating, priceRange, onCategoryChange, onBrandChange, onRatingChange, onPriceChange, onClear }: Props) {
  const brands = useMemo(() => Array.from(new Set(products.map(p => p.brand).filter(Boolean))), [products]);
  const maxPrice = useMemo(() => Math.max(...products.map(p => p.selling_price), 10000), [products]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h3 className="font-semibold">Filters</h3><Button variant="ghost" size="sm" onClick={onClear} className="text-xs">Clear All</Button></div>
      <Separator />
      <div>
        <h4 className="text-sm font-medium mb-3">Category</h4>
        <div className="space-y-2">
          <button onClick={() => onCategoryChange('')} className={`block text-sm w-full text-left px-2 py-1 rounded transition-colors ${!selectedCategory ? 'bg-accent font-medium' : 'text-muted-foreground hover:text-foreground'}`}>All Categories</button>
          {categories.map(c => <button key={c.id} onClick={() => onCategoryChange(c.slug)} className={`block text-sm w-full text-left px-2 py-1 rounded transition-colors ${selectedCategory === c.slug ? 'bg-accent font-medium' : 'text-muted-foreground hover:text-foreground'}`}>{c.name}</button>)}
        </div>
      </div>
      <Separator />
      <div>
        <h4 className="text-sm font-medium mb-3">Price Range</h4>
        <Slider value={priceRange} onValueChange={v => onPriceChange(v as [number, number])} min={0} max={maxPrice} step={100} className="mb-3" />
        <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Rs.{priceRange[0].toLocaleString()}</span><span>Rs.{priceRange[1].toLocaleString()}</span></div>
        <div className="mt-3 space-y-1.5">{PRICE_RANGES.map(r => <button key={r.label} onClick={() => onPriceChange([r.min, r.max])} className="block text-xs text-muted-foreground hover:text-foreground transition-colors">{r.label}</button>)}</div>
      </div>
      <Separator />
      {brands.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Brand</h4>
          <div className="space-y-2">{brands.map(b => <label key={b} className="flex items-center gap-2 text-sm"><Checkbox checked={selectedBrands.includes(b)} onCheckedChange={c => { if (c) onBrandChange([...selectedBrands, b]); else onBrandChange(selectedBrands.filter(x => x !== b)); }} />{b}</label>)}</div>
        </div>
      )}
      <Separator />
      <div>
        <h4 className="text-sm font-medium mb-3">Customer Rating</h4>
        <div className="space-y-1.5">{[4, 3, 2, 1].map(r => (
          <button key={r} onClick={() => onRatingChange(selectedRating === r ? 0 : r)} className={`flex items-center gap-1.5 w-full px-2 py-1 rounded text-sm transition-colors ${selectedRating === r ? 'bg-accent' : 'hover:bg-accent/50'}`}>
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3 w-3 ${i < r ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />)}
            <span className="text-xs text-muted-foreground">& up</span>
          </button>
        ))}</div>
      </div>
    </div>
  );
}
