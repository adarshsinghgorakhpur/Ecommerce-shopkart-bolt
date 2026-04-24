export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const SORT_OPTIONS: { value: import('@/types').SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' }, { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' }, { value: 'rating', label: 'Rating' },
  { value: 'newest', label: 'Newest First' }, { value: 'popularity', label: 'Popularity' },
];
export const PRICE_RANGES = [
  { label: 'Under Rs.500', min: 0, max: 500 }, { label: 'Rs.500 - Rs.1000', min: 500, max: 1000 },
  { label: 'Rs.1000 - Rs.5000', min: 1000, max: 5000 }, { label: 'Rs.5000 - Rs.10000', min: 5000, max: 10000 },
  { label: 'Above Rs.10000', min: 10000, max: 999999 },
];
export const PAYMENT_METHODS = [{ id: 'upi', label: 'UPI' }, { id: 'card', label: 'Credit/Debit Card' }, { id: 'cod', label: 'Cash on Delivery' }];
export const ORDER_STATUS_COLORS: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800', shipped: 'bg-indigo-100 text-indigo-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' };
export const DELIVERY_ESTIMATE_DAYS = 3;
export const FREE_DELIVERY_THRESHOLD = 500;
export const DELIVERY_CHARGE = 40;
export const NAV_LINKS = [
  { label: 'Electronics', href: '/products?category=electronics' }, { label: 'Fashion', href: '/products?category=fashion' },
  { label: 'Home & Kitchen', href: '/products?category=home-kitchen' }, { label: 'Sports', href: '/products?category=sports' },
  { label: 'Books', href: '/products?category=books' }, { label: 'Beauty', href: '/products?category=beauty' },
];
