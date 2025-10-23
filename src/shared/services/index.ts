import { API_ENDPOINTS } from '../constants';
import { ApiResponse, PaginatedResponse } from '../types';

// Base API service class
class BaseApiService {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseUrl = API_ENDPOINTS.BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('indostreet_auth_token');
      const headers = {
        ...this.defaultHeaders,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Request failed',
        };
      }

      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  protected async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  protected async post<T>(
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async put<T>(
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async patch<T>(
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  protected async getPaginated<T>(
    endpoint: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<T>> {
    const url = `${endpoint}?page=${page}&limit=${limit}`;
    return this.request<T[]>(url) as Promise<PaginatedResponse<T>>;
  }
}

// Authentication service
export class AuthService extends BaseApiService {
  async login(email: string, password: string, userType: string) {
    return this.post(`${API_ENDPOINTS.AUTH}/login`, {
      email,
      password,
      userType,
    });
  }

  async register(userData: any) {
    return this.post(`${API_ENDPOINTS.AUTH}/register`, userData);
  }

  async logout() {
    return this.post(`${API_ENDPOINTS.AUTH}/logout`);
  }

  async refreshToken() {
    return this.post(`${API_ENDPOINTS.AUTH}/refresh`);
  }

  async forgotPassword(email: string) {
    return this.post(`${API_ENDPOINTS.AUTH}/forgot-password`, { email });
  }

  async resetPassword(token: string, password: string) {
    return this.post(`${API_ENDPOINTS.AUTH}/reset-password`, {
      token,
      password,
    });
  }
}

// User service
export class UserService extends BaseApiService {
  async getProfile() {
    return this.get(`${API_ENDPOINTS.USERS}/profile`);
  }

  async updateProfile(data: any) {
    return this.put(`${API_ENDPOINTS.USERS}/profile`, data);
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    // Override content-type for file upload
    return fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.USERS}/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('indostreet_auth_token')}`,
      },
      body: formData,
    }).then(res => res.json());
  }
}

// Booking service
export class BookingService extends BaseApiService {
  async getBookings(page?: number, limit?: number) {
    return this.getPaginated(`${API_ENDPOINTS.BOOKINGS}`, page, limit);
  }

  async getBookingById(id: string) {
    return this.get(`${API_ENDPOINTS.BOOKINGS}/${id}`);
  }

  async createBooking(bookingData: any) {
    return this.post(`${API_ENDPOINTS.BOOKINGS}`, bookingData);
  }

  async updateBooking(id: string, data: any) {
    return this.put(`${API_ENDPOINTS.BOOKINGS}/${id}`, data);
  }

  async cancelBooking(id: string, reason?: string) {
    return this.patch(`${API_ENDPOINTS.BOOKINGS}/${id}/cancel`, { reason });
  }

  async confirmBooking(id: string) {
    return this.patch(`${API_ENDPOINTS.BOOKINGS}/${id}/confirm`);
  }
}

// Service service
export class ServiceService extends BaseApiService {
  async getServices(category?: string) {
    const endpoint = category 
      ? `${API_ENDPOINTS.SERVICES}?category=${category}`
      : API_ENDPOINTS.SERVICES;
    return this.get(endpoint);
  }

  async getServiceById(id: string) {
    return this.get(`${API_ENDPOINTS.SERVICES}/${id}`);
  }

  async createService(serviceData: any) {
    return this.post(`${API_ENDPOINTS.SERVICES}`, serviceData);
  }

  async updateService(id: string, data: any) {
    return this.put(`${API_ENDPOINTS.SERVICES}/${id}`, data);
  }

  async deleteService(id: string) {
    return this.delete(`${API_ENDPOINTS.SERVICES}/${id}`);
  }
}

// Export service instances
export const authService = new AuthService();
export const userService = new UserService();
export const bookingService = new BookingService();
export const serviceService = new ServiceService();