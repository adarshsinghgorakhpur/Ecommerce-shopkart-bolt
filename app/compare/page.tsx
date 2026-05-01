'use client';

import { X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { removeFromCompare, clearCompare } from '@/redux/slices/compareSlice';

export default function ComparePage() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(s => s.compare.products);

  if (products.length === 0) return <div className="container mx-auto px-4 py-20 text-center"><h2 className="text-2xl font-bold">No products to compare</h2><p className="text-muted-foreground mt-2">Add products to compare them side by side</p><a href="/products"><Button className="mt-6">Browse Products</Button></a></div>;

  const fields = [
    { label: 'Price', getValue: (p: any) => `Rs.${p.selling_price.toLocaleString()}` },
    { label: 'MRP', getValue: (p: any) => `Rs.${p.base_price.toLocaleString()}` },
    { label: 'Discount', getValue: (p: any) => `${p.discount_percent}% off` },
    { label: 'Rating', getValue: (p: any) => `${p.rating} / 5` },
    { label: 'Reviews', getValue: (p: any) => p.review_count.toLocaleString() },
    { label: 'Brand', getValue: (p: any) => p.brand },
    { label: 'Stock', getValue: (p: any) => p.stock > 0 ? `${p.stock} available` : 'Out of stock' },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold">Compare Products</h1><Button variant="outline" size="sm" onClick={() => dispatch(clearCompare())}>Clear All</Button></div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead><tr><th className="p-3 text-left text-sm font-medium text-muted-foreground w-32">Feature</th>{products.map(p => <th key={p.id} className="p-3 text-center relative"><Button variant="ghost" size="icon" className="absolute right-1 top-1 h-6 w-6" onClick={() => dispatch(removeFromCompare(p.id))}><X className="h-3 w-3" /></Button><div className="flex flex-col items-center gap-2"><div className="h-20 w-20 rounded-lg bg-muted overflow-hidden"><img src={p.images?.[0]?.url || ''} alt={p.name} className="h-full w-full object-cover" /></div><span className="text-sm font-medium text-center">{p.name}</span></div></th>)}</tr></thead>
          <tbody>{fields.map(f => <tr key={f.label} className="border-t"><td className="p-3 text-sm font-medium text-muted-foreground">{f.label}</td>{products.map(p => <td key={p.id} className="p-3 text-sm text-center">{f.getValue(p)}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
