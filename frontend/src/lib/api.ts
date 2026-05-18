import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: false,
})

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Prefer user (vendor/admin) token when present; fall back to customer token
    const token =
      localStorage.getItem('user_auth_token') || localStorage.getItem('auth_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (res: AxiosResponse) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear whichever token was used so stale tokens don't block re-login.
      // The interceptor adds the user_auth_token first, so if it was present
      // it's the one that caused the 401.
      const hadUserToken = !!localStorage.getItem('user_auth_token')
      if (hadUserToken) {
        localStorage.removeItem('user_auth_token')
      } else {
        localStorage.removeItem('auth_token')
      }
      // Only hard-redirect when on a protected route (admin / vendor / account)
      const protected_paths = ['/admin', '/vendor', '/account', '/checkout']
      if (protected_paths.some((p) => window.location.pathname.startsWith(p))) {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
      }
    }
    return Promise.reject(error)
  }
)

// Customer auth
export const authApi = {
  register: (data: object) => apiClient.post('/auth/register', data),
  login: (data: object) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/me'),
  updateProfile: (data: object) => apiClient.put('/auth/profile', data),
  changePassword: (data: object) => apiClient.put('/auth/password', data),
  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
}

// User auth (vendors & admins – hits the users table, not customers)
export const userAuthApi = {
  login: (data: object) => apiClient.post('/user/auth/login', data),
  logout: () => apiClient.post('/user/auth/logout'),
  me: () => apiClient.get('/user/auth/me'),
}

// Products
export const productApi = {
  list: (params?: object) => apiClient.get('/products', { params }),
  show: (slug: string) => apiClient.get(`/products/${slug}`),
  related: (slug: string) => apiClient.get(`/products/${slug}/related`),
  featured: () => apiClient.get('/products/featured'),
  newArrivals: () => apiClient.get('/products/new-arrivals'),
  bestSellers: () => apiClient.get('/products/best-sellers'),
}

// Categories
export const categoryApi = {
  list: () => apiClient.get('/categories'),
  tree: () => apiClient.get('/categories/tree'),
  show: (slug: string) => apiClient.get(`/categories/${slug}`),
}

// Brands
export const brandApi = {
  list: (params?: object) => apiClient.get('/brands', { params }),
  show: (slug: string) => apiClient.get(`/brands/${slug}`),
}

// Cart — sessionId is passed so guest carts persist across stateless API requests
export const cartApi = {
  get: (sessionId?: string) =>
    apiClient.get('/cart', { params: sessionId ? { session_id: sessionId } : undefined }),
  add: (data: object) => apiClient.post('/cart', data),
  update: (id: number, qty: number, sessionId?: string) =>
    apiClient.put(`/cart/${id}`, { qty, ...(sessionId ? { session_id: sessionId } : {}) }),
  remove: (id: number, sessionId?: string) =>
    apiClient.delete(`/cart/${id}`, { data: sessionId ? { session_id: sessionId } : undefined }),
  clear: (sessionId?: string) =>
    apiClient.delete('/cart', { data: sessionId ? { session_id: sessionId } : undefined }),
  applyCoupon: (code: string, sessionId?: string) =>
    apiClient.post('/cart/coupon', { code, ...(sessionId ? { session_id: sessionId } : {}) }),
}

// Checkout
export const checkoutApi = {
  getShippingRates: (data: object) => apiClient.post('/checkout/shipping-rates', data),
  getPaymentIntent: (data: object) => apiClient.post('/checkout/payment-intent', data),
  placeOrder: (data: object) => apiClient.post('/checkout', data),
  paypalCapture: (orderId: string) => apiClient.post('/checkout/paypal/capture', { order_id: orderId }),
}

// Orders
export const orderApi = {
  list: (params?: object) => apiClient.get('/orders', { params }),
  show: (code: string) => apiClient.get(`/orders/${code}`),
  track: (code: string, token: string) => apiClient.get(`/orders/track/${code}/${token}`),
  cancel: (code: string, reason: string) => apiClient.post(`/orders/${code}/cancel`, { reason }),
  requestReturn: (code: string, data: object) => apiClient.post(`/orders/${code}/return`, data),
  review: (code: string, data: FormData) =>
    apiClient.post(`/orders/${code}/review`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

// Wishlist
export const wishlistApi = {
  list: (params?: object) => apiClient.get('/wishlist', { params }),
  toggle: (productId: number) => apiClient.post('/wishlist/toggle', { product_id: productId }),
  check: (productId: number) => apiClient.get('/wishlist/check', { params: { product_id: productId } }),
}

// Addresses
export const addressApi = {
  list: () => apiClient.get('/addresses'),
  create: (data: object) => apiClient.post('/addresses', data),
  update: (id: number, data: object) => apiClient.put(`/addresses/${id}`, data),
  delete: (id: number) => apiClient.delete(`/addresses/${id}`),
  setDefault: (id: number) => apiClient.post(`/addresses/${id}/default`),
}

// Stores
export const storeApi = {
  list: (params?: object) => apiClient.get('/stores', { params }),
  show: (slug: string) => apiClient.get(`/stores/${slug}`),
  products: (slug: string, params?: object) => apiClient.get(`/stores/${slug}/products`, { params }),
  register: (data: object) => apiClient.post('/stores/register', data),
}

// Reviews
export const reviewApi = {
  list: (productId: number, params?: object) =>
    apiClient.get('/reviews', { params: { product_id: productId, ...params } }),
}

// Flash Sales
export const flashSaleApi = {
  active: () => apiClient.get('/flash-sales/active'),
}

// Blog
export const blogApi = {
  list: (params?: object) => apiClient.get('/blog', { params }),
  show: (slug: string) => apiClient.get(`/blog/${slug}`),
  categories: () => apiClient.get('/blog/categories'),
}

// Newsletter
export const newsletterApi = {
  subscribe: (email: string) => apiClient.post('/newsletter/subscribe', { email }),
}

// Attribute Sets (public read + admin manage)
export const attributeSetApi = {
  list: (params?: object) => apiClient.get('/attribute-sets', { params }),
  show: (id: number) => apiClient.get(`/attribute-sets/${id}`),
}

// Admin
export const adminApi = {
  dashboardStats: () => apiClient.get('/admin/dashboard/stats'),
  recentOrders: () => apiClient.get('/admin/dashboard/recent-orders'),
  salesChart: () => apiClient.get('/admin/dashboard/sales-chart'),

  products: (params?: object) => apiClient.get('/admin/products', { params }),
  showProduct: (id: number) => apiClient.get(`/admin/products/${id}`),
  createProduct: (data: object) => apiClient.post('/admin/products', data),
  updateProduct: (id: number, data: object | FormData) =>
    data instanceof FormData
      ? apiClient.post(`/admin/products/${id}`, data)
      : apiClient.put(`/admin/products/${id}`, data),
  deleteProduct: (id: number) => apiClient.delete(`/admin/products/${id}`),
  bulkProducts: (data: object) => apiClient.post('/admin/products/bulk', data),

  orders: (params?: object) => apiClient.get('/admin/orders', { params }),
  showOrder: (id: number) => apiClient.get(`/admin/orders/${id}`),
  updateOrderStatus: (id: number, data: object) => apiClient.patch(`/admin/orders/${id}/status`, data),
  updateOrderPaymentStatus: (id: number, data: object) => apiClient.patch(`/admin/orders/${id}/payment-status`, data),
  exportOrders: (params?: object) => apiClient.get('/admin/orders/export', { params, responseType: 'blob' }),

  shipments: (params?: object) => apiClient.get('/admin/shipments', { params }),
  showShipment: (id: number) => apiClient.get(`/admin/shipments/${id}`),
  createShipment: (data: object) => apiClient.post('/admin/shipments', data),
  updateShipment: (id: number, data: object) => apiClient.put(`/admin/shipments/${id}`, data),
  addShipmentHistory: (id: number, data: object) => apiClient.post(`/admin/shipments/${id}/history`, data),

  returns: (params?: object) => apiClient.get('/admin/returns', { params }),
  showReturn: (id: number) => apiClient.get(`/admin/returns/${id}`),
  updateReturn: (id: number, data: object) => apiClient.patch(`/admin/returns/${id}`, data),

  customers: (params?: object) => apiClient.get('/admin/customers', { params }),
  showCustomer: (id: number) => apiClient.get(`/admin/customers/${id}`),
  toggleCustomer: (id: number) => apiClient.patch(`/admin/customers/${id}/toggle-status`),
  deleteCustomer: (id: number) => apiClient.delete(`/admin/customers/${id}`),
  exportCustomers: () => apiClient.get('/admin/customers/export', { responseType: 'blob' }),

  stores: (params?: object) => apiClient.get('/admin/stores', { params }),
  showStore: (id: number) => apiClient.get(`/admin/stores/${id}`),
  verifyStore: (id: number) => apiClient.patch(`/admin/stores/${id}/verify`),
  unverifyStore: (id: number) => apiClient.patch(`/admin/stores/${id}/unverify`),
  updateStoreCommission: (id: number, data: object) => apiClient.patch(`/admin/stores/${id}/commission`, data),
  withdrawals: (params?: object) => apiClient.get('/admin/withdrawals', { params }),
  processWithdrawal: (id: number, data: object) => apiClient.patch(`/admin/withdrawals/${id}`, data),

  blogs: (params?: object) => apiClient.get('/admin/blog', { params }),
  showBlog: (id: number) => apiClient.get(`/admin/blog/${id}`),
  createBlog: (data: FormData | object) => apiClient.post('/admin/blog', data),
  updateBlog: (id: number, data: FormData | object) => apiClient.post(`/admin/blog/${id}`, data),
  deleteBlog: (id: number) => apiClient.delete(`/admin/blog/${id}`),

  categories: (params?: object) => apiClient.get('/admin/categories', { params }),
  createCategory: (data: object) => apiClient.post('/admin/categories', data),
  updateCategory: (id: number, data: object) => apiClient.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: number) => apiClient.delete(`/admin/categories/${id}`),

  settings: () => apiClient.get('/admin/settings'),
  updateSettings: (data: object) => apiClient.put('/admin/settings', data),

  // Reviews
  reviews: (params?: object) => apiClient.get('/admin/reviews', { params }),
  updateReview: (id: number, data: object) => apiClient.patch(`/admin/reviews/${id}`, data),
  deleteReview: (id: number) => apiClient.delete(`/admin/reviews/${id}`),

  // Brands
  adminBrands: (params?: object) => apiClient.get('/admin/brands', { params }),
  createBrand: (data: object) => apiClient.post('/admin/brands', data),
  updateBrand: (id: number, data: object | FormData) =>
    data instanceof FormData
      ? apiClient.post(`/admin/brands/${id}`, data)
      : apiClient.put(`/admin/brands/${id}`, data),
  deleteBrand: (id: number) => apiClient.delete(`/admin/brands/${id}`),

  // Discounts
  discounts: (params?: object) => apiClient.get('/admin/discounts', { params }),
  createDiscount: (data: object) => apiClient.post('/admin/discounts', data),
  updateDiscount: (id: number, data: object) => apiClient.put(`/admin/discounts/${id}`, data),
  deleteDiscount: (id: number) => apiClient.delete(`/admin/discounts/${id}`),

  // Flash Sales
  flashSales: (params?: object) => apiClient.get('/admin/flash-sales', { params }),
  showFlashSale: (id: number) => apiClient.get(`/admin/flash-sales/${id}`),
  createFlashSale: (data: object) => apiClient.post('/admin/flash-sales', data),
  updateFlashSale: (id: number, data: object) => apiClient.put(`/admin/flash-sales/${id}`, data),
  deleteFlashSale: (id: number) => apiClient.delete(`/admin/flash-sales/${id}`),
  addFlashSaleProduct: (id: number, data: object) => apiClient.post(`/admin/flash-sales/${id}/products`, data),
  removeFlashSaleProduct: (id: number, data: object) => apiClient.delete(`/admin/flash-sales/${id}/products`, { data }),

  // Taxes
  taxes: () => apiClient.get('/admin/taxes'),
  createTax: (data: object) => apiClient.post('/admin/taxes', data),
  updateTax: (id: number, data: object) => apiClient.put(`/admin/taxes/${id}`, data),
  deleteTax: (id: number) => apiClient.delete(`/admin/taxes/${id}`),

  // Newsletter
  newsletter: (params?: object) => apiClient.get('/admin/newsletter', { params }),
  newsletterStats: () => apiClient.get('/admin/newsletter/stats'),
  deleteSubscriber: (id: number) => apiClient.delete(`/admin/newsletter/${id}`),

  // Product Tags
  productTags: (params?: object) => apiClient.get('/admin/product-tags', { params }),
  createProductTag: (data: object) => apiClient.post('/admin/product-tags', data),
  updateProductTag: (id: number, data: object) => apiClient.put(`/admin/product-tags/${id}`, data),
  deleteProductTag: (id: number) => apiClient.delete(`/admin/product-tags/${id}`),

  // Collections
  collections: (params?: object) => apiClient.get('/admin/collections', { params }),
  createCollection: (data: object) => apiClient.post('/admin/collections', data),
  updateCollection: (id: number, data: object) => apiClient.put(`/admin/collections/${id}`, data),
  deleteCollection: (id: number) => apiClient.delete(`/admin/collections/${id}`),

  // Labels
  labels: () => apiClient.get('/admin/labels'),
  createLabel: (data: object) => apiClient.post('/admin/labels', data),
  updateLabel: (id: number, data: object) => apiClient.put(`/admin/labels/${id}`, data),
  deleteLabel: (id: number) => apiClient.delete(`/admin/labels/${id}`),

  // Invoices
  invoices: (params?: object) => apiClient.get('/admin/invoices', { params }),
  showInvoice: (id: number) => apiClient.get(`/admin/invoices/${id}`),
  downloadInvoice: (id: number) => apiClient.get(`/admin/invoices/${id}/download`, { responseType: 'blob' }),

  // Reports
  reportOverview: (params?: object) => apiClient.get('/admin/reports/overview', { params }),
  reportSalesChart: (params?: object) => apiClient.get('/admin/reports/sales-chart', { params }),
  reportTopProducts: (params?: object) => apiClient.get('/admin/reports/top-products', { params }),
  reportOrdersByStatus: (params?: object) => apiClient.get('/admin/reports/orders-by-status', { params }),

  // Attribute Sets
  attributeSets: (params?: object) => apiClient.get('/admin/attribute-sets', { params }),
  showAttributeSet: (id: number) => apiClient.get(`/admin/attribute-sets/${id}`),
  createAttributeSet: (data: object) => apiClient.post('/admin/attribute-sets', data),
  updateAttributeSet: (id: number, data: object) => apiClient.put(`/admin/attribute-sets/${id}`, data),
  deleteAttributeSet: (id: number) => apiClient.delete(`/admin/attribute-sets/${id}`),
  attributeSetAttributes: (id: number) => apiClient.get(`/admin/attribute-sets/${id}/attributes`),
  createAttribute: (setId: number, data: object) => apiClient.post(`/admin/attribute-sets/${setId}/attributes`, data),
  updateAttribute: (setId: number, attrId: number, data: object) => apiClient.put(`/admin/attribute-sets/${setId}/attributes/${attrId}`, data),
  deleteAttribute: (setId: number, attrId: number) => apiClient.delete(`/admin/attribute-sets/${setId}/attributes/${attrId}`),

  // Specification Tables
  specTables: (params?: object) => apiClient.get('/admin/spec-tables', { params }),
  showSpecTable: (id: number) => apiClient.get(`/admin/spec-tables/${id}`),
  createSpecTable: (data: object) => apiClient.post('/admin/spec-tables', data),
  updateSpecTable: (id: number, data: object) => apiClient.put(`/admin/spec-tables/${id}`, data),
  deleteSpecTable: (id: number) => apiClient.delete(`/admin/spec-tables/${id}`),
  createSpecGroup: (tableId: number, data: object) => apiClient.post(`/admin/spec-tables/${tableId}/groups`, data),
  updateSpecGroup: (groupId: number, data: object) => apiClient.put(`/admin/spec-groups/${groupId}`, data),
  deleteSpecGroup: (groupId: number) => apiClient.delete(`/admin/spec-groups/${groupId}`),
  createSpecAttribute: (groupId: number, data: object) => apiClient.post(`/admin/spec-groups/${groupId}/attributes`, data),
  updateSpecAttribute: (attrId: number, data: object) => apiClient.put(`/admin/spec-attributes/${attrId}`, data),
  deleteSpecAttribute: (attrId: number) => apiClient.delete(`/admin/spec-attributes/${attrId}`),
}

// Vendor
export const vendorApi = {
  dashboard: () => apiClient.get('/vendor/dashboard'),
  recentOrders: () => apiClient.get('/vendor/dashboard/recent-orders'),
  withdraw: (data: object) => apiClient.post('/vendor/withdraw', data),
  withdrawals: () => apiClient.get('/vendor/withdrawals'),

  products: (params?: object) => apiClient.get('/vendor/products', { params }),
  showProduct: (id: number) => apiClient.get(`/vendor/products/${id}`),
  createProduct: (data: object) => apiClient.post('/vendor/products', data),
  updateProduct: (id: number, data: object | FormData) =>
    data instanceof FormData
      ? apiClient.post(`/vendor/products/${id}`, data)
      : apiClient.put(`/vendor/products/${id}`, data),
  deleteProduct: (id: number) => apiClient.delete(`/vendor/products/${id}`),

  orders: (params?: object) => apiClient.get('/vendor/orders', { params }),
  showOrder: (id: number) => apiClient.get(`/vendor/orders/${id}`),
  processOrder: (id: number) => apiClient.post(`/vendor/orders/${id}/process`),
  shipOrder: (id: number, data: object) => apiClient.post(`/vendor/orders/${id}/ship`, data),

  store: () => apiClient.get('/vendor/store'),
  updateStore: (data: object) => apiClient.put('/vendor/store', data),

  // Finance
  earnings: (params?: object) => apiClient.get('/vendor/finance/earnings', { params }),
  financeSettings: () => apiClient.get('/vendor/finance/settings'),
  updateFinanceSettings: (data: object) => apiClient.put('/vendor/finance/settings', data),

  // Inventory
  inventory: (params?: object) => apiClient.get('/vendor/inventory', { params }),
  updateStock: (productId: number, stock: number) => apiClient.put(`/vendor/products/${productId}/stock`, { stock }),

  // Shipments
  shipments: (params?: object) => apiClient.get('/vendor/shipments', { params }),

  // Returns
  returns: (params?: object) => apiClient.get('/vendor/returns', { params }),
  updateReturn: (id: number, data: object) => apiClient.put(`/vendor/returns/${id}`, data),

  // Cancellations
  cancellations: (params?: object) => apiClient.get('/vendor/cancellations', { params }),

  // Marketing
  coupons: (params?: object) => apiClient.get('/vendor/coupons', { params }),
  createCoupon: (data: object) => apiClient.post('/vendor/coupons', data),
  updateCoupon: (id: number, data: object) => apiClient.put(`/vendor/coupons/${id}`, data),
  deleteCoupon: (id: number) => apiClient.delete(`/vendor/coupons/${id}`),

  // Reviews
  reviews: (params?: object) => apiClient.get('/vendor/reviews', { params }),
  replyReview: (id: number, reply: string) => apiClient.post(`/vendor/reviews/${id}/reply`, { reply }),

  // Import/Export
  importProducts: (formData: FormData) => apiClient.post('/vendor/products/import', formData),
  exportProducts: (params?: object) => apiClient.get('/vendor/products/export', { params, responseType: 'blob' }),

  // Variants
  variants: (params?: object) => apiClient.get('/vendor/variants', { params }),
}
