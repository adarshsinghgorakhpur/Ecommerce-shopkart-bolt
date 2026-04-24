export interface Product {
  id: string; name: string; slug: string; description: string; short_description: string;
  category_id: string; brand: string; base_price: number; selling_price: number;
  discount_percent: number; rating: number; review_count: number; stock: number;
  is_active: boolean; is_trending: boolean; is_flash_sale: boolean;
  flash_sale_ends_at: string | null; created_at: string; updated_at: string;
  images?: ProductImage[]; variants?: ProductVariant[]; category?: Category;
}
export interface ProductImage { id: string; product_id: string; url: string; alt_text: string; sort_order: number; is_primary: boolean; }
export interface ProductVariant { id: string; product_id: string; variant_type: string; variant_value: string; price_adjustment: number; stock: number; sku: string; is_default: boolean; }
export interface Category { id: string; name: string; slug: string; description: string; image_url: string; parent_id: string | null; sort_order: number; is_active: boolean; }
export interface Review { id: string; product_id: string; user_id: string; rating: number; title: string; comment: string; is_verified_purchase: boolean; created_at: string; }
export interface User { id: string; full_name: string; phone: string; avatar_url: string; email?: string; }
export interface Address { id: string; user_id: string; label: string; full_name: string; phone: string; address_line1: string; address_line2: string; city: string; state: string; pincode: string; is_default: boolean; }
export interface Order { id: string; user_id: string; address_id: string; status: OrderStatus; subtotal: number; discount: number; delivery_charge: number; total: number; payment_method: string; coupon_code: string; created_at: string; updated_at: string; items?: OrderItem[]; address?: Address; }
export interface OrderItem { id: string; order_id: string; product_id: string; product_name: string; variant_info: string; quantity: number; price: number; image_url: string; }
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export interface Banner { id: string; title: string; subtitle: string; image_url: string; link_url: string; sort_order: number; is_active: boolean; }
export interface Coupon { id: string; code: string; description: string; discount_type: 'percentage' | 'flat'; discount_value: number; min_order_value: number; max_discount: number; is_active: boolean; valid_from: string; valid_until: string; usage_limit: number; usage_count: number; }
export interface CartItem { product: Product; quantity: number; selectedVariant?: ProductVariant; }
export type SortOption = 'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest' | 'popularity';
