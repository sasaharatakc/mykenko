// ── Product ───────────────────────────────────────────────────────────────────
export interface Product {
  id: number
  name: string
  slug: string
  description: string | null
  content?: string | null
  image: string | null
  images: string[]
  sku: string | null
  barcode?: string | null
  price: number
  sale_price: number | null
  current_price: number
  is_on_sale: boolean
  discount_percent: number
  in_stock: boolean
  stock_status: 'in_stock' | 'out_of_stock' | 'pre_order'
  quantity: number
  is_featured: boolean
  is_digital: boolean
  product_type?: string
  weight?: number | null
  brand?: Brand | null
  categories?: ProductCategory[]
  tags?: ProductTag[]
  labels?: ProductLabel[]
  store?: StoreBasic | null
  attribute_sets?: AttributeSet[]
  variations?: ProductVariation[]
  reviews_avg: number
  reviews_count: number
  has_variations?: boolean
  sale_ends_at?: string | null
  specification_table?: SpecificationTable | null
  options?: ProductOption[]
  minimum_order_quantity?: number | null
  maximum_order_quantity?: number | null
  created_at: string
}

export interface Brand {
  id: number
  name: string
  slug: string
  logo: string | null
}

export interface ProductCategory {
  id: number
  name: string
  slug: string
  description: string | null
  image: string | null
  icon: string | null
  parent_id: number | null
  order: number
  is_featured: boolean
  children?: ProductCategory[]
  parent?: ProductCategory | null
}

export interface ProductTag {
  id: number
  name: string
  slug: string
}

export interface ProductLabel {
  id: number
  name: string
  color: string
}

export interface AttributeSet {
  id: number
  title: string
  display_layout: 'dropdown' | 'button' | 'color' | 'image'
  use_image_from_product_variation: boolean
  attributes: Attribute[]
}

export interface Attribute {
  id: number
  title: string
  color: string | null
  image: string | null
  slug: string | null
}

export interface ProductVariation {
  id: number
  is_default: boolean
  product: VariationProduct | null
  variation_items: VariationItem[]
}

export interface VariationProduct {
  id: number
  price: number
  sale_price: number | null
  current_price: number
  in_stock: boolean
  quantity: number
  image: string | null
  sku: string | null
}

export interface VariationItem {
  attribute_id: number
  attribute: { id: number; title: string; color: string | null; attribute_set_id: number | null } | null
}

export interface SpecificationTable {
  name: string
  groups: SpecificationGroup[]
}

export interface SpecificationGroup {
  name: string
  attributes: { name: string; value: string }[]
}

export interface ProductOption {
  id: number
  name: string
  type: string
  required: boolean
  values: ProductOptionValue[]
}

export interface ProductOptionValue {
  id: number
  name: string
  price: number
  price_type: string
  image: string | null
}

// ── Store ─────────────────────────────────────────────────────────────────────
export interface StoreBasic {
  id: number
  name: string
  slug: string
  logo: string | null
  is_verified?: boolean
}

export interface Store extends StoreBasic {
  email: string | null
  phone: string | null
  address: string | null
  cover_image: string | null
  description: string | null
  website: string | null
  social_links: Record<string, string>
  city: string | null
  state: string | null
  country: string | null
  is_verified: boolean
  rating: number
  rating_count: number
  total_sales: number
  products_count?: number
  created_at: string
}

// ── Order ─────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'pending' | 'processing' | 'shipped'
  | 'delivered' | 'completed' | 'cancelled' | 'refunded'

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Order {
  id: number
  code: string
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: string | null
  sub_total: number
  tax_amount: number
  shipping_amount: number
  discount_amount: number
  total_amount: number
  coupon_code: string | null
  shipping_method?: string | null
  note?: string | null
  item_count?: number
  shipping_address?: OrderAddress | null
  billing_address?: OrderAddress | null
  products?: OrderProduct[]
  payment?: Payment | null
  shipment?: Shipment | null
  histories?: OrderHistory[]
  invoice?: Invoice | null
  returns?: OrderReturn[]
  store?: StoreBasic | null
  can_cancel?: boolean
  can_return?: boolean
  created_at: string
  completed_at?: string | null
}

export interface OrderAddress {
  name: string
  email: string | null
  phone: string | null
  address: string
  city: string | null
  state: string | null
  country: string | null
  zip_code: string | null
}

export interface OrderProduct {
  id: number
  product_id: number | null
  product_name: string
  product_image: string | null
  qty: number
  price: number
  sub_total: number
  variation_name: string | null
  options?: Record<string, string> | null
  slug?: string | null
  has_review?: boolean
}

export interface Payment {
  id: number
  payment_channel: string
  amount: number
  status: PaymentStatus
  charge_id: string | null
}

export interface Shipment {
  id?: number
  tracking_id: string | null
  carrier: string | null
  shipping_method: string | null
  status: string
  estimated_delivery_date: string | null
  histories: ShipmentHistory[]
}

export interface ShipmentHistory {
  id: number
  action: string
  description: string | null
  created_at: string
}

export interface OrderHistory {
  id: number
  action: string
  description: string | null
  created_at: string
}

export interface Invoice {
  id: number
  code: string
  status: string
  amount: number
}

export interface OrderReturn {
  id: number
  return_reason: string | null
  status: string
  created_at: string
}

// ── Cart ──────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: number
  qty: number
  price: number
  subtotal: number
  options: Record<string, string>
  product: {
    id: number
    name: string
    slug: string
    image: string | null
    sku: string | null
    in_stock: boolean
    quantity: number
  } | null
  variation?: {
    id: number
    attributes: { set: string; value: string; color?: string | null }[]
  } | null
  store_id: number | null
}

export interface CartSummary {
  sub_total: number
  subtotal: number
  item_count: number
  discount: number
  tax: number
  shipping: number
  total: number
  coupon?: { code: string; discount: number } | null
}

// ── Customer ──────────────────────────────────────────────────────────────────
export interface Customer {
  id: number
  name: string
  email: string
  phone: string | null
  avatar: string | null
  dob: string | null
  gender: 'male' | 'female' | 'other' | null
  is_active: boolean
  email_verified_at: string | null
  created_at: string
}

export interface CustomerAddress {
  id: number
  name: string
  email: string | null
  phone: string | null
  address: string
  city: string | null
  state: string | null
  country: string | null
  zip_code: string | null
  is_default: boolean
}

// ── Blog ──────────────────────────────────────────────────────────────────────
export interface Blog {
  id: number
  title: string
  slug: string
  description: string | null
  content?: string | null
  image: string | null
  author: { id: number; name: string; avatar: string | null } | null
  categories?: BlogCategory[]
  tags?: BlogTag[]
  views: number
  is_featured: boolean
  published_at: string | null
  created_at: string
  related_posts?: Blog[]
}

export interface BlogCategory {
  id: number
  name: string
  slug: string
  posts_count?: number
}

export interface BlogTag {
  id: number
  name: string
  slug: string
}

// ── Review ────────────────────────────────────────────────────────────────────
export interface Review {
  id: number
  star: number
  comment: string | null
  images: string[]
  customer: { name: string; avatar: string | null } | null
  replies: ReviewReply[]
  created_at: string
}

export interface ReviewReply {
  id: number
  content: string
  user: { name: string } | null
  created_at: string
}

export interface ReviewStats {
  average: number
  total: number
  distribution: Record<number, number>
}

// ── Flash Sale ────────────────────────────────────────────────────────────────
export interface FlashSale {
  id: number
  name: string
  ends_at: string
  remaining_seconds: number
  products: (Product & { flash_sale_price: number; flash_sale_quantity: number; flash_sale_sold: number })[]
}

// ── Pagination ────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page?: number
    total: number
    from?: number | null
    to?: number | null
  }
}
