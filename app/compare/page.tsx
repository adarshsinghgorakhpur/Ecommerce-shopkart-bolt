'use client';

import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { removeFromCompare, clearCompare } from '@/redux/slices/compareSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { X, Star, Trash2 } from 'lucide-react';

import type { Product } from '@/types';

interface FeatureRow {
  label: string;
  getValue: (product: Product) => React.ReactNode;
}

export default function ComparePage() {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.compare.products);

  if (products.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 rounded-full bg-muted p-6">
            <X className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">No products to compare</h2>
          <p className="mt-2 text-muted-foreground">
            Add products to compare and see them side by side.
          </p>
          <Button asChild className="mt-6" size="lg">
            <Link href="/products">Explore Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const features: FeatureRow[] = [
    {
      label: 'Price',
      getValue: (p) => (
        <span className="font-semibold">Rs.{p.selling_price.toLocaleString()}</span>
      ),
    },
    {
      label: 'MRP',
      getValue: (p) => (
        <span className="text-muted-foreground line-through">
          Rs.{p.base_price.toLocaleString()}
        </span>
      ),
    },
    {
      label: 'Discount',
      getValue: (p) =>
        p.discount_percent > 0 ? (
          <span className="text-green-600 font-medium">{p.discount_percent}% off</span>
        ) : (
          <span className="text-muted-foreground">--</span>
        ),
    },
    {
      label: 'Rating',
      getValue: (p) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{p.rating.toFixed(1)}</span>
        </div>
      ),
    },
    {
      label: 'Reviews',
      getValue: (p) => (
        <span className="text-muted-foreground">{p.review_count.toLocaleString()}</span>
      ),
    },
    {
      label: 'Brand',
      getValue: (p) => (
        <span>{p.brand || '--'}</span>
      ),
    },
    {
      label: 'Stock',
      getValue: (p) =>
        p.stock > 0 ? (
          <Badge variant="secondary" className="text-green-700 bg-green-50">
            In Stock ({p.stock})
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-red-700 bg-red-50">
            Out of Stock
          </Badge>
        ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compare Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Comparing {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch(clearCompare())}
          className="gap-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Clear All
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left text-sm font-semibold text-muted-foreground w-32">
                  Feature
                </th>
                {products.map((product) => (
                  <th key={product.id} className="p-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 self-end -mt-2 -mr-2"
                        onClick={() => dispatch(removeFromCompare(product.id))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Link
                        href={`/product/${product.slug}`}
                        className="text-sm font-semibold hover:underline"
                      >
                        {product.name}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, idx) => (
                <tr key={feature.label} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                  <td className="p-4 text-sm font-medium text-muted-foreground">
                    {feature.label}
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 text-center text-sm">
                      {feature.getValue(product)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
