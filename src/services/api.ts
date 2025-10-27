import { ApiResponse, User, Reservation, LoginFormData, ReservationFormData, PaginatedResponse } from '@/types';
import { encodePassword } from '@/utils/crypto';
import { graphqlClient } from './graphql';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken() {
    this.token = localStorage.getItem('auth_token');
  }

  private saveToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  private removeToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // 检查是否是认证错误
        if (response.status === 401 || 
            data.code === 'TOKEN_EXPIRED' ||
            data.code === 'TOKEN_INVALID' ||
            data.code === 'UNAUTHENTICATED' ||
            data.message?.includes('jwt expired') ||
            data.message?.includes('token') ||
            data.message?.includes('认证')) {
          this.handleAuthError(data.code || 'AUTH_ERROR');
        }
        throw new ApiError(response.status, data.message || 'API请求失败', data);
      }

      // 适配后端响应格式
      if (data.code !== undefined) {
        // 如果有分页信息，重新构造响应格式
        if (data.info && data.total !== undefined) {
          return {
            success: data.code === 0,
            data: {
              data: data.data,
              pagination: {
                page: data.info.page,
                limit: data.info.limit,
                total: data.total,
                totalPages: data.info.totalPages
              }
            },
            message: data.message
          } as ApiResponse<T>;
        }
        
        // 普通响应格式
        return {
          success: data.code === 0,
          data: data.data,
          message: data.message
        } as ApiResponse<T>;
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // 网络错误或其他错误
      throw new ApiError(0, '网络连接失败，请检查网络连接');
    }
  }

  // 身份验证相关
  async login(credentials: LoginFormData): Promise<ApiResponse<{ token: string; user: User }>> {
    // 对密码进行Base64编码（避免明文传输）
    const encodedPassword = encodePassword(credentials.password);
    
    const response = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: credentials.email, // 支持用户名或邮箱登录
        password: encodedPassword, // 传递编码后的密码
        userType: credentials.userType, // 传递用户类型
      }),
    });

    if (response.success && response.data.token) {
      this.saveToken(response.data.token);
    }

    return response;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<ApiResponse<{ token: string; user: User }>> {
    // 对密码进行Base64编码（避免明文传输）
    const encodedPassword = encodePassword(userData.password);
    
    const response = await this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...userData,
        password: encodedPassword, // 传递编码后的密码
      }),
    });

    if (response.success && response.data.token) {
      this.saveToken(response.data.token);
    }

    return response;
  }

  logout() {
    this.removeToken();
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private handleAuthError(errorCode: string = 'AUTH_ERROR') {
    // 清除本地token和用户信息
    this.removeToken();
    localStorage.removeItem('user_info');
    
    // 根据错误代码设置不同的消息
    let message = 'JWT已过期，请重新登录';
    switch (errorCode) {
      case 'TOKEN_EXPIRED':
        message = 'JWT已过期，请重新登录';
        break;
      case 'TOKEN_INVALID':
        message = 'JWT无效，请重新登录';
        break;
      case 'USER_NOT_FOUND':
        message = '用户不存在，请重新登录';
        break;
      case 'UNAUTHENTICATED':
        message = '需要用户认证，请登录';
        break;
      default:
        message = '认证失败，请重新登录';
    }
    
    // 触发全局认证错误事件
    window.dispatchEvent(new CustomEvent('auth-error', { 
      detail: { 
        message,
        code: errorCode
      } 
    }));
  }

  // 预订相关API - 使用GraphQL实现
  async createReservation(reservationData: ReservationFormData): Promise<ApiResponse<Reservation>> {
    // 原REST API调用（已注释）
    // return this.request<Reservation>('/reservations', {
    //   method: 'POST',
    //   body: JSON.stringify(reservationData),
    // });

    // 使用GraphQL实现
    if (this.token) {
      graphqlClient.setToken(this.token);
    }
    return await graphqlClient.createReservation(reservationData);
  }

  async getUserReservations(options?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<Reservation>>> {
    // 原REST API调用（已注释）
    // const params = new URLSearchParams();
    // if (options?.page) params.append('page', options.page.toString());
    // if (options?.limit) params.append('limit', options.limit.toString());
    // if (options?.status) params.append('status', options.status);
    // const queryString = params.toString();
    // const url = queryString ? `/reservations?${queryString}` : '/reservations';
    // return this.request<PaginatedResponse<Reservation>>(url);

    // 使用GraphQL实现
    if (this.token) {
      graphqlClient.setToken(this.token);
    }
    return await graphqlClient.getUserReservations(options);
  }

  async getAllReservations(options?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    searchTerm?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse<PaginatedResponse<Reservation>>> {
    // 原REST API调用（已注释）
    // const params = new URLSearchParams();
    // if (options?.page) params.append('page', options.page.toString());
    // if (options?.limit) params.append('limit', options.limit.toString());
    // if (options?.status) params.append('status', options.status);
    // if (options?.startDate) params.append('startDate', options.startDate);
    // if (options?.endDate) params.append('endDate', options.endDate);
    // if (options?.searchTerm) params.append('search', options.searchTerm);
    // if (options?.sortBy) params.append('sortBy', options.sortBy);
    // if (options?.sortOrder) params.append('sortOrder', options.sortOrder);
    // const queryString = params.toString();
    // const url = queryString ? `/reservations/admin?${queryString}` : '/reservations/admin';
    // return this.request<PaginatedResponse<Reservation>>(url);

    // 使用GraphQL实现
    if (this.token) {
      graphqlClient.setToken(this.token);
    }
    return await graphqlClient.getAllReservations(options);
  }

  async getReservationById(id: string): Promise<ApiResponse<Reservation>> {
    // 原REST API调用（已注释）
    // return this.request<Reservation>(`/reservations/${id}`);

    // 使用GraphQL实现
    if (this.token) {
      graphqlClient.setToken(this.token);
    }
    return await graphqlClient.getReservationById(id);
  }

  async updateReservation(id: string, updates: Partial<ReservationFormData>): Promise<ApiResponse<Reservation>> {
    // 原REST API调用（已注释）
    // return this.request<Reservation>(`/reservations/${id}`, {
    //   method: 'PUT',
    //   body: JSON.stringify(updates),
    // });

    // 使用GraphQL实现
    if (this.token) {
      graphqlClient.setToken(this.token);
    }
    return await graphqlClient.updateReservation(id, updates);
  }

  async updateReservationStatus(
    id: string,
    status: string,
    reason?: string
  ): Promise<ApiResponse<Reservation>> {
    // 原REST API调用（已注释）
    // return this.request<Reservation>(`/reservations/${id}/status`, {
    //   method: 'PUT',
    //   body: JSON.stringify({ status, reason }),
    // });

    // 使用GraphQL实现
    if (this.token) {
      graphqlClient.setToken(this.token);
    }
    return await graphqlClient.updateReservationStatus(id, status, reason);
  }

  async cancelReservation(id: string, reason: string): Promise<ApiResponse<Reservation>> {
    // 原REST API调用（已注释）
    // return this.request<Reservation>(`/reservations/${id}/cancel`, {
    //   method: 'PUT',
    //   body: JSON.stringify({ reason }),
    // });

    // 使用GraphQL实现
    if (this.token) {
      graphqlClient.setToken(this.token);
    }
    return await graphqlClient.cancelReservation(id, reason);
  }

  async getTodayReservations(status?: string): Promise<ApiResponse<Reservation[]>> {
    // 原REST API调用（已注释）
    // const params = new URLSearchParams();
    // if (status) params.append('status', status);
    // const queryString = params.toString();
    // const url = queryString ? `/reservations/today?${queryString}` : '/reservations/today';
    // return this.request<Reservation[]>(url);

    // 使用GraphQL实现
    if (this.token) {
      graphqlClient.setToken(this.token);
    }
    return await graphqlClient.getTodayReservations(status);
  }
}

// 导出单例实例
export const apiClient = new ApiClient(API_BASE_URL);
export { ApiError };