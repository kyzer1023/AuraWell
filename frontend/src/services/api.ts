const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9090/api';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    request<{ success: boolean; message: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: RegisterData) =>
    request<{ success: boolean; message: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    request<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST',
    }),

  me: () =>
    request<{ success: boolean; user: User }>('/auth/me'),
};

// Products API
export const productsApi = {
  getAll: (category?: string) =>
    request<Product[]>(`/products${category ? `?category=${category}` : ''}`),

  getById: (id: string) =>
    request<Product>(`/products/${id}`),
};

// Cart API
export const cartApi = {
  get: () =>
    request<CartResponse>('/cart'),

  addItem: (productId: string, quantity: number = 1) =>
    request<{ success: boolean; message: string }>('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),

  updateItem: (productId: string, quantity: number) =>
    request<{ success: boolean; message: string }>(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  removeItem: (productId: string) =>
    request<{ success: boolean; message: string }>(`/cart/${productId}`, {
      method: 'DELETE',
    }),

  clear: () =>
    request<{ success: boolean; message: string }>('/cart', {
      method: 'DELETE',
    }),
};

// Orders API
export const ordersApi = {
  getAll: () =>
    request<Order[]>('/orders'),

  create: (shippingAddress: string) =>
    request<{ success: boolean; message: string; orderId: string; totalAmount: number }>('/orders', {
      method: 'POST',
      body: JSON.stringify({ shippingAddress }),
    }),
};

// Admin API
export const adminApi = {
  getProducts: () =>
    request<Product[]>('/admin/products'),

  createProduct: (product: CreateProductData) =>
    request<{ success: boolean; message: string; product: Product }>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),

  updateProduct: (id: string, product: CreateProductData) =>
    request<{ success: boolean; message: string; product: Product }>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }),

  deleteProduct: (id: string) =>
    request<{ success: boolean; message: string }>(`/admin/products/${id}`, {
      method: 'DELETE',
    }),

  getOrders: () =>
    request<Order[]>('/admin/orders'),

  updateOrderStatus: (orderId: string, status: string) =>
    request<{ success: boolean; message: string; order: Order }>('/admin/orders', {
      method: 'PUT',
      body: JSON.stringify({ orderId, status }),
    }),

  uploadImage: async (file: File): Promise<{ success: boolean; imageUrl: string; message?: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to upload image');
    }

    return response.json();
  },
};

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: 'vitamins' | 'supplements' | 'aromatherapy';
  ageGroup: 'toddler' | 'child' | 'teen' | 'adult' | 'elderly' | 'all';
  imageUrl: string;
  createdAt: number;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  ageGroup: string;
  imageUrl: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  imageUrl: string;
  subtotal: number;
}

export interface CartResponse {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  createdAt: number;
}

