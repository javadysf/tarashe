const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private getAuthHeader() {
    if (typeof window === 'undefined') return {};
    
    // Try to get token from localStorage first
    let token = localStorage.getItem('token');
    
    // If not found, try to get from auth store
    if (!token) {
      try {
        const { useAuthStore } = require('@/store/authStore');
        token = useAuthStore.getState().token;
      } catch (error) {
        console.log('Could not get token from store');
      }
    }
    
    console.log('Auth token:', token ? 'Present' : 'Missing');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Default headers
    const defaultHeaders: Record<string, string> = {
      ...this.getAuthHeader(),
    };
    
    // Only add Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }
    
    const config: RequestInit = {
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    console.log('Request config:', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      bodyType: config.body?.constructor.name
    });

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'خطا در درخواست');
    }

    return data;
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  async updateProfile(userData: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.request('/auth/upload-avatar', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it with boundary
    });
  }

  async uploadProductImages(files: File[], alt?: string) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    if (alt) {
      formData.append('alt', alt);
    }
    
    return this.request('/products/upload-images', {
      method: 'POST',
      body: formData,
    });
  }

  async uploadCategoryImage(file: File, alt?: string) {
    const formData = new FormData();
    formData.append('image', file);
    if (alt) {
      formData.append('alt', alt);
    }
    
    return this.request('/categories/upload-image', {
      method: 'POST',
      body: formData,
    });
  }

  // Products
  async getProducts(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/products${query}`);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  // Categories
  async getCategories() {
    return this.request('/categories');
  }

  async getCategoriesWithAttributes() {
    return this.request('/categories/with-attributes');
  }

  async createCategory(categoryData: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async getCategory(id: string) {
    return this.request(`/categories/${id}`);
  }

  async getCategoryProducts(id: string, params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/categories/${id}/products${query}`);
  }

  // Orders
  async createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders() {
    return this.request('/orders');
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  // Admin Products
  async createProduct(productData: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin Users
  async getUsers(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/users${query}`);
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin Orders
  async updateOrderStatus(id: string, status: string) {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Reviews
  async getProductReviews(productId: string) {
    return this.request(`/products/${productId}/reviews`);
  }

  async createReview(productId: string, reviewData: any) {
    return this.request(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async getAllReviews() {
    return this.request('/reviews');
  }

  async deleteReview(reviewId: string) {
    return this.request(`/products/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  // Admin Stats
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  // Attributes
  async getAttributes() {
    return this.request('/attributes');
  }

  async createAttribute(attributeData: any) {
    return this.request('/attributes', {
      method: 'POST',
      body: JSON.stringify(attributeData),
    });
  }

  async updateAttribute(id: string, attributeData: any) {
    return this.request(`/attributes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(attributeData),
    });
  }

  async deleteAttribute(id: string) {
    return this.request(`/attributes/${id}`, {
      method: 'DELETE',
    });
  }

  async getCategoryAttributes(categoryId: string) {
    return this.request(`/attributes/category/${categoryId}`);
  }

  async assignAttributesToCategory(categoryId: string, attributeIds: string[]) {
    return this.request(`/attributes/category/${categoryId}`, {
      method: 'POST',
      body: JSON.stringify({ attributeIds }),
    });
  }
}

export const api = new ApiClient();