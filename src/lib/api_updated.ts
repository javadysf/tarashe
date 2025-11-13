const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

// Helper function to check if error is a normal validation error
const isNormalValidationError = (errorMessage: string): boolean => {
  const normalErrors = [
    'ایمیل یا رمز عبور اشتباه است',
    'حساب کاربری غیرفعال است',
    'اطلاعات وارد شده صحیح نیست',
    'کاربری با این ایمیل قبلاً ثبت شده است',
    'دسترسی غیرمجاز - توکن نامعتبر',
    'دسترسی غیرمجاز'
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
          throw new Error('کاربری با این ایمیل قبلاً ثبت شده است');
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

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) {
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

  // Products
  async getProducts(params: {
    page?: number;
    limit?: number;
    category?: string;
    brand?: string;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    isFeatured?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    
    return this.request(endpoint);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

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

  // Categories
  async getCategories() {
    return this.request('/categories');
  }

  async getCategory(id: string) {
    return this.request(`/categories/${id}`);
  }

  async createCategory(categoryData: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
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

  // Brands
  async getBrands() {
    return this.request('/brands');
  }

  async getBrand(id: string) {
    return this.request(`/brands/${id}`);
  }

  async createBrand(brandData: any) {
    return this.request('/brands', {
      method: 'POST',
      body: JSON.stringify(brandData),
    });
  }

  async updateBrand(id: string, brandData: any) {
    return this.request(`/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(brandData),
    });
  }

  async deleteBrand(id: string) {
    return this.request(`/brands/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async getOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/orders?${queryString}` : '/orders';
    
    return this.request(endpoint);
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  async createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(id: string, orderData: any) {
    return this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrder(id: string) {
    return this.request(`/orders/${id}`, {
      method: 'DELETE',
    });
  }

  // Users
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    
    return this.request(endpoint);
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
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

  // Reviews
  async getReviews(params: {
    page?: number;
    limit?: number;
    productId?: string;
    userId?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/reviews?${queryString}` : '/reviews';
    
    return this.request(endpoint);
  }

  async getReview(id: string) {
    return this.request(`/reviews/${id}`);
  }

  async createReview(reviewData: any) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async updateReview(id: string, reviewData: any) {
    return this.request(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }

  async deleteReview(id: string) {
    return this.request(`/reviews/${id}`, {
      method: 'DELETE',
    });
  }

  // Attributes
  async getAttributes() {
    return this.request('/attributes');
  }

  async getAttribute(id: string) {
    return this.request(`/attributes/${id}`);
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

  // Accessories
  async getAccessories() {
    return this.request('/accessories');
  }

  async getAccessory(id: string) {
    return this.request(`/accessories/${id}`);
  }

  async createAccessory(accessoryData: any) {
    return this.request('/accessories', {
      method: 'POST',
      body: JSON.stringify(accessoryData),
    });
  }

  async updateAccessory(id: string, accessoryData: any) {
    return this.request(`/accessories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(accessoryData),
    });
  }

  async deleteAccessory(id: string) {
    return this.request(`/accessories/${id}`, {
      method: 'DELETE',
    });
  }

  async addAccessoryToProduct(productId: string, accessoryData: {
    accessoryId: string;
    quantity: number;
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

  async getSlider(id: string) {
    return this.request(`/sliders/${id}`);
  }

  async createSlider(sliderData: {
    title: string;
    subtitle?: string;
    description?: string;
    backgroundImage: string;
    buttonText?: string;
    buttonLink?: string;
    isActive: boolean;
    displayOrder: number;
    textColor?: string;
    buttonColor?: string;
    textPosition?: 'left' | 'center' | 'right';
    overlayOpacity?: number;
  }) {
    return this.request('/sliders', {
      method: 'POST',
      body: JSON.stringify(sliderData),
    });
  }

  async updateSlider(id: string, sliderData: {
    title?: string;
    subtitle?: string;
    description?: string;
    backgroundImage?: string;
    buttonText?: string;
    buttonLink?: string;
    isActive?: boolean;
    displayOrder?: number;
    textColor?: string;
    buttonColor?: string;
    textPosition?: 'left' | 'center' | 'right';
    overlayOpacity?: number;
  }) {
    return this.request(`/sliders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sliderData),
    });
  }

  async deleteSlider(id: string) {
    return this.request(`/sliders/${id}`, {
      method: 'DELETE',
    });
  }

  async reorderSliders(sliderIds: string[]) {
    return this.request('/sliders/reorder', {
      method: 'PUT',
      body: JSON.stringify({ sliderIds }),
    });
  }

  // Image Upload
  async uploadImage(formData: FormData) {
    const url = `${API_BASE_URL}/upload/image`;
    
    const config: RequestInit = {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
      },
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'خطا در آپلود تصویر' }));
        throw new Error(errorData.message || `خطا در آپلود (${response.status})`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('خطا در اتصال به اینترنت. لطفاً اتصال خود را بررسی کنید');
      }
      throw error;
    }
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
