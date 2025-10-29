// Validate API URL configuration
if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn('NEXT_PUBLIC_API_URL not configured, using default');
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

// Helper function to check if error is a normal validation error
const isNormalValidationError = (errorMessage: string): boolean => {
  const normalErrors = [
    'ایمیل یا رمز عبور اشتباه است',
    'حساب کاربری غیرفعال است',
    'اطلاعات وارد شده صحیح نیست',
    'کاربری با این ایمیل قبلاً ثبت شده است',
    'دسترسی غیرمجاز - توکن نامعتبر',
    'دسترسی غیرمجاز',
    'شما قبلاً برای این محصول نظر ثبت کردهاید'
  ];
  
  return normalErrors.some(normalError => errorMessage.includes(normalError));
};


class ApiClient {
  private getAuthHeader(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    
    // Try to get token from localStorage first
    let token = localStorage.getItem('token');
    
    // If not found, try to get from auth store
    if (!token) {
      try {
        const { useAuthStore } = require('@/store/authStore');
        token = useAuthStore.getState().token;
      } catch (error) {
        // Silently handle error
      }
    }
    
    return token ? { Authorization: `Bearer ${token}` } : {} as Record<string, string>;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Check if this is an auth check request
    const isAuthCheck = endpoint.includes('/auth/me') || endpoint.includes('/auth/profile');
    
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

    try {
      const response = await fetch(url, config);
      
      // Check if response has content
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', jsonError);
          data = { message: 'خطا در پردازش پاسخ سرور' };
        }
      } else {
        // If not JSON, try to get text
        try {
          const text = await response.text();
          data = { message: text || 'خطا در درخواست' };
        } catch (textError) {
          console.error('Failed to parse text response:', textError);
          data = { message: 'خطا در درخواست' };
        }
      }

      if (!response.ok) {
        // Only log unexpected errors, not normal validation errors or auth check failures
        const isNormalError = data.message && isNormalValidationError(data.message);
        
        // Don't log if it's a normal error OR if it's an auth check with 401/403
        if (!isNormalError && !(isAuthCheck && (response.status === 401 || response.status === 403))) {
          console.error('Request failed:', {
            url,
            status: response.status,
            statusText: response.statusText,
            data: data
          });
        }
        // For auth check failures, we silently handle them without any logging
        
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error('ایمیل یا رمز عبور اشتباه است');
        } else if (response.status === 403) {
          throw new Error('دسترسی غیرمجاز');
        } else if (response.status === 404) {
          throw new Error('منبع یافت نشد');
        } else if (response.status === 409) {
          throw new Error(data.message || 'کاربری با این ایمیل قبلاً ثبت شده است');
        } else if (response.status === 500) {
          throw new Error('خطا در سرور. لطفاً دوباره تلاش کنید');
        } else {
          throw new Error(data.message || `خطا در درخواست (${response.status})`);
        }
      }

      return data;
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Don't log network errors during auth checks to avoid console spam
        const isAuthCheck = endpoint.includes('/auth/me') || endpoint.includes('/auth/profile');
        if (!isAuthCheck) {
          console.error('Network error:', error);
        }
        throw new Error('خطا در اتصال به اینترنت. لطفاً اتصال خود را بررسی کنید');
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(refreshToken?: string) {
    return this.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
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

  async getSearchSuggestions(searchTerm: string, limit: number = 3) {
    if (!searchTerm.trim()) return { products: [] };
    try {
      const result = await this.request(`/products?search=${encodeURIComponent(searchTerm)}&limit=${limit}`);
      console.log('Search suggestions result:', result);
      return result;
    } catch (error) {
      console.error('Search suggestions API error:', error);
      throw error;
    }
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  async getBestSellingProducts(limit: number = 8) {
    return this.request(`/products/best-selling?limit=${limit}`)
  }

  // Categories
  async getCategories() {
    return this.request('/categories');
  }

  async getCategoriesTree() {
    return this.request('/categories'); // backend flat for now; could switch to /categories/tree if added
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

  async updateCategory(id: string, categoryData: any) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async getCategoryProducts(id: string, params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/categories/${id}/products${query}`);
  }

  // Orders
  async validateCart(items: any[]) {
    return this.request('/orders/validate-cart', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  async createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : ''
    return this.request(`/orders${query}`);
  }

  async getOrdersByUser(userId: string) {
    const query = `?${new URLSearchParams({ userId })}`
    return this.request(`/orders${query}`)
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
    const body = productData instanceof FormData ? productData : JSON.stringify(productData);
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body,
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

  // Likes
  async likeProduct(productId: string) {
    return this.request(`/users/me/likes/${productId}`, {
      method: 'POST',
    });
  }

  async unlikeProduct(productId: string) {
    return this.request(`/users/me/likes/${productId}`, {
      method: 'DELETE',
    });
  }

  async getLikedProducts(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : ''
    return this.request(`/users/me/likes${query}`);
  }

  async getProductLikesCount(productId: string) {
    return this.request(`/products/${productId}/likes/count`);
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
    return this.request('/products/reviews/all');
  }

  async deleteReview(reviewId: string) {
    return this.request(`/products/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  async replyToReview(reviewId: string, comment: string) {
    return this.request(`/products/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }

  async likeReview(reviewId: string) {
    return this.request(`/products/reviews/${reviewId}/like`, {
      method: 'POST',
    });
  }

  async dislikeReview(reviewId: string) {
    return this.request(`/products/reviews/${reviewId}/dislike`, {
      method: 'POST',
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

  async getAttribute(id: string) {
    return this.request(`/attributes/${id}`);
  }

  // Brands
  async getBrands() {
    return this.request('/brands');
  }

  async createBrand(brandData: FormData) {
    return this.request('/brands', {
      method: 'POST',
      body: brandData,
    });
  }

  async updateBrand(id: string, brandData: FormData) {
    return this.request(`/brands/${id}`, {
      method: 'PUT',
      body: brandData,
    });
  }

  async deleteBrand(id: string) {
    return this.request(`/brands/${id}`, {
      method: 'DELETE',
    });
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

  async assignAttributeToCategory(categoryId: string, attributeId: string) {
    return this.request('/attributes/assign', {
      method: 'POST',
      body: JSON.stringify({ categoryId, attributeId }),
    });
  }

  async removeAttributeFromCategory(categoryId: string, attributeId: string) {
    return this.request('/attributes/remove', {
      method: 'POST',
      body: JSON.stringify({ categoryId, attributeId }),
    });
  }


  async addAccessoryToProduct(productId: string, accessoryData: {
    accessoryId: string;
    isSuggested?: boolean;
    bundleDiscount?: number;
    displayOrder?: number;
  }) {
    return this.request(`/products/${productId}/accessories`, {
      method: 'POST',
      body: JSON.stringify(accessoryData),
    });
  }

  async removeAccessoryFromProduct(productId: string, accessoryId: string) {
    return this.request(`/products/${productId}/accessories/${accessoryId}`, {
      method: 'DELETE',
    });
  }

  async getProductAccessories(productId: string) {
    return this.request(`/products/${productId}/accessories`);
  }

  // Sliders
  async getSliders() {
    try {
      return await this.request('/sliders');
    } catch (error) {
      // Return empty sliders if endpoint doesn't exist or fails
      return { sliders: [] };
    }
  }
}

export const api = new ApiClient();