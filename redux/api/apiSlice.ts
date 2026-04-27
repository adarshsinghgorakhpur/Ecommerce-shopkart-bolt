import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '@/services/supabase';
import type { Product, Category, Banner, Review, Coupon, Order, Address, OrderItem } from '@/types';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  keepUnusedDataFor: 60,
  refetchOnMountOrArgChange: false,
  refetchOnFocus: false,
  tagTypes: ['Products', 'Categories', 'Banners', 'Reviews', 'Orders', 'Wishlist', 'Addresses', 'Coupons'],
  endpoints: (builder) => ({
    getProducts: builder.query<
      Product[],
      { category?: string; search?: string; trending?: boolean; flashSale?: boolean; sortBy?: string; limit?: number; brand?: string[] | string; minPrice?: number; maxPrice?: number; minRating?: number }
    >({
      queryFn: async (params) => {
        let q = supabase
          .from('products')
          .select('*, images:product_images(*), variants:product_variants(*), category:categories(*)')
          .eq('is_active', true);

        if (params.category) {
          const { data: cat } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', params.category)
            .maybeSingle();
          if (cat) q = q.eq('category_id', cat.id);
        }

        if (params.trending) q = q.eq('is_trending', true);
        if (params.flashSale) q = q.eq('is_flash_sale', true);
        if (params.brand) {
          const brands = Array.isArray(params.brand) ? params.brand : [params.brand];
          q = q.in('brand', brands);
        }
        if (typeof params.minPrice === 'number') q = q.gte('selling_price', params.minPrice);
        if (typeof params.maxPrice === 'number') q = q.lte('selling_price', params.maxPrice);
        if (typeof params.minRating === 'number') q = q.gte('rating', params.minRating);
        if (params.search) q = q.or(`name.ilike.%${params.search}%,brand.ilike.%${params.search}%,description.ilike.%${params.search}%`);

        if (params.sortBy === 'price_low') q = q.order('selling_price', { ascending: true });
        else if (params.sortBy === 'price_high') q = q.order('selling_price', { ascending: false });
        else if (params.sortBy === 'rating') q = q.order('rating', { ascending: false });
        else if (params.sortBy === 'newest') q = q.order('created_at', { ascending: false });
        else q = q.order('review_count', { ascending: false });

        if (params.limit) q = q.limit(params.limit);
        const { data, error } = await q;
        if (error) return { error: { status: 500, data: error.message } };
        return { data: data as Product[] };
      },
      providesTags: ['Products'],
    }),
    getWishlistProducts: builder.query<Product[], string>({
      queryFn: async (userId) => {
        if (!userId) return { data: [] };
        const { data: wishlist, error: wishlistError } = await supabase
          .from('wishlist')
          .select('product_id')
          .eq('user_id', userId);

        if (wishlistError) return { error: { status: 500, data: wishlistError.message } };

        const ids = wishlist?.map((item) => item.product_id) ?? [];
        if (ids.length === 0) return { data: [] };

        const { data, error } = await supabase
          .from('products')
          .select('*, images:product_images(*), variants:product_variants(*), category:categories(*)')
          .in('id', ids);

        if (error) return { error: { status: 500, data: error.message } };
        return { data: data as Product[] };
      },
      providesTags: ['Wishlist'],
    }),
    getProduct: builder.query<Product, string>({
      queryFn: async (slug) => {
        const { data, error } = await supabase.from('products').select('*, images:product_images(*), variants:product_variants(*), category:categories(*)').eq('slug', slug).maybeSingle();
        if (error) return { error: { status: 500, data: error.message } };
        return { data: data as Product };
      },
      providesTags: ['Products'],
    }),
    getCategories: builder.query<Category[], void>({
      queryFn: async () => { const { data, error } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order'); if (error) return { error: { status: 500, data: error.message } }; return { data: data as Category[] }; },
      providesTags: ['Categories'],
    }),
    getBanners: builder.query<Banner[], void>({
      queryFn: async () => { const { data, error } = await supabase.from('banners').select('*').eq('is_active', true).order('sort_order'); if (error) return { error: { status: 500, data: error.message } }; return { data: data as Banner[] }; },
      providesTags: ['Banners'],
    }),
    getReviews: builder.query<Review[], string>({
      queryFn: async (productId) => { const { data, error } = await supabase.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false }); if (error) return { error: { status: 500, data: error.message } }; return { data: data as Review[] }; },
      providesTags: ['Reviews'],
    }),
    getCoupon: builder.query<Coupon | null, string>({
      queryFn: async (code) => { const { data, error } = await supabase.from('coupons').select('*').eq('code', code).eq('is_active', true).maybeSingle(); if (error) return { error: { status: 500, data: error.message } }; if (!data) return { data: null }; if (data.valid_until && new Date(data.valid_until) < new Date()) return { data: null }; if (data.usage_count >= data.usage_limit) return { data: null }; return { data: data as Coupon }; },
    }),
    getOrders: builder.query<Order[], string>({
      queryFn: async (userId) => { const { data, error } = await supabase.from('orders').select('*, items:order_items(*), address:addresses(*)').eq('user_id', userId).order('created_at', { ascending: false }); if (error) return { error: { status: 500, data: error.message } }; return { data: data as Order[] }; },
      providesTags: ['Orders'],
    }),
    createOrder: builder.mutation<Order, { userId: string; addressId: string; items: OrderItem[]; subtotal: number; discount: number; deliveryCharge: number; total: number; paymentMethod: string; couponCode: string }>({
      queryFn: async (d) => {
        const { data: order, error } = await supabase.from('orders').insert({ user_id: d.userId, address_id: d.addressId, subtotal: d.subtotal, discount: d.discount, delivery_charge: d.deliveryCharge, total: d.total, payment_method: d.paymentMethod, coupon_code: d.couponCode, status: 'confirmed' }).select().single();
        if (error) return { error: { status: 500, data: error.message } };
        const items = d.items.map(i => ({ ...i, order_id: order.id }));
        await supabase.from('order_items').insert(items);
        return { data: order as Order };
      },
      invalidatesTags: ['Orders'],
    }),
    getAddresses: builder.query<Address[], string>({
      queryFn: async (userId) => { const { data, error } = await supabase.from('addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false }); if (error) return { error: { status: 500, data: error.message } }; return { data: data as Address[] }; },
      providesTags: ['Addresses'],
    }),
    addAddress: builder.mutation<Address, Omit<Address, 'id'>>({
      queryFn: async (addr) => { const { data, error } = await supabase.from('addresses').insert({ ...addr }).select().single(); if (error) return { error: { status: 500, data: error.message } }; return { data: data as Address }; },
      invalidatesTags: ['Addresses'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetCategoriesQuery,
  useGetBannersQuery,
  useGetReviewsQuery,
  useGetCouponQuery,
  useGetOrdersQuery,
  useCreateOrderMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
  useGetWishlistProductsQuery,
} = api;
