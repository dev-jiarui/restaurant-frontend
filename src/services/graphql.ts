import { ApiResponse, Reservation, ReservationFormData, PaginatedResponse } from '@/types';

const GRAPHQL_ENDPOINT = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api').replace('/api', '/api/graphql');

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
    extensions?: {
      code: string;
      timestamp: string;
    };
  }>;
}

class GraphQLError extends Error {
  constructor(public errors: GraphQLResponse<any>['errors']) {
    super(errors?.[0]?.message || 'GraphQL请求失败');
    this.name = 'GraphQLError';
  }
}

class GraphQLClient {
  private endpoint: string;
  private token: string | null = null;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
    this.loadToken();
  }

  private loadToken() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  private async query<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          variables
        })
      });

      const result: GraphQLResponse<T> = await response.json();

      if (result.errors && result.errors.length > 0) {
        // 检查是否是JWT过期或认证错误
        const authError = result.errors.find(error => 
          error.extensions?.code === 'TOKEN_EXPIRED' ||
          error.extensions?.code === 'TOKEN_INVALID' ||
          error.extensions?.code === 'UNAUTHENTICATED' ||
          error.extensions?.code === 'USER_NOT_FOUND' ||
          error.extensions?.code === 'AUTH_ERROR' ||
          error.message.includes('jwt expired') || 
          error.message.includes('权限错误') ||
          error.message.includes('需要用户认证') ||
          error.message.includes('token')
        );

        if (authError) {
          // JWT过期或认证失败，触发自动登出
          this.handleAuthError(authError.extensions?.code || 'AUTH_ERROR');
        }

        // 检查是否是验证错误，如果是则显示友好的错误信息
        const validationError = this.extractValidationError(result.errors);
        if (validationError) {
          // 使用 setTimeout 确保 alert 不会阻塞错误处理
          setTimeout(() => alert(validationError), 0);
        }
        
        throw new GraphQLError(result.errors);
      }

      if (!result.data) {
        throw new GraphQLError([{ message: '未收到数据响应' }]);
      }

      return result.data;
    } catch (error) {
      if (error instanceof GraphQLError) {
        throw error;
      }
      throw new GraphQLError([{ message: '网络连接失败，请检查网络连接' }]);
    }
  }

  private extractValidationError(errors: GraphQLResponse<any>['errors']): string | null {
    if (!errors || errors.length === 0) return null;
    
    for (const error of errors) {
      const message = error.message;
      
      // 检查是否是验证错误
      if (message.includes('validation failed:') || message.includes('Reservation validation failed:')) {
        // 提取具体的验证错误信息
        const match = message.match(/:\s*(.+)$/);
        if (match) {
          let validationMessage = match[1];
          
          // 进一步提取字段特定的错误信息
          const fieldMatch = validationMessage.match(/\w+:\s*(.+)/);
          if (fieldMatch) {
            return fieldMatch[1]; // 只返回具体的错误信息，如"到达时间必须晚于当前时间"
          }
          
          return validationMessage;
        }
      }
      
      // 检查其他常见的验证错误模式
      if (message.includes('必须') || message.includes('不能') || message.includes('无效') || message.includes('错误')) {
        return message;
      }
    }
    
    return null;
  }

  private handleAuthError(errorCode: string = 'AUTH_ERROR') {
    // 清除本地token
    this.token = null;
    localStorage.removeItem('auth_token');
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

  // 预订相关GraphQL查询和变更
  async createReservation(reservationData: ReservationFormData): Promise<ApiResponse<Reservation>> {
    const mutation = `
      mutation CreateReservation($input: ReservationInput!) {
        createReservation(input: $input) {
          id
          guestName
          phoneNumber
          email
          arrivalTime
          tableSize
          status
          specialRequests
          createdAt
          updatedAt
          canEdit
          canCancel
          user {
            id
            username
            email
          }
        }
      }
    `;

    try {
      const result = await this.query<{ createReservation: Reservation }>(mutation, {
        input: reservationData
      });

      return {
        success: true,
        data: result.createReservation,
        message: '预订创建成功'
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Reservation,
        message: error instanceof GraphQLError ? error.message : '预订创建失败'
      };
    }
  }

  async getUserReservations(options?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<Reservation>>> {
    const query = `
      query GetUserReservations($pagination: PaginationOptions, $sort: SortOptions, $status: ReservationStatus) {
        getUserReservations(pagination: $pagination, sort: $sort, status: $status) {
          reservations {
            id
            guestName
            phoneNumber
            email
            arrivalTime
            tableSize
            status
            specialRequests
            createdAt
            updatedAt
            canEdit
            canCancel
            user {
              id
              username
              email
            }
          }
          pagination {
            page
            limit
            total
            totalPages
            hasNextPage
            hasPrevPage
          }
        }
      }
    `;

    try {
      const result = await this.query<{ getUserReservations: PaginatedResponse<Reservation> }>(query, {
        pagination: {
          page: options?.page || 1,
          limit: options?.limit || 10
        },
        sort: {
          sortBy: 'arrivalTime',
          sortOrder: 'desc'
        },
        status: options?.status
      });

      return {
        success: true,
        data: {
          data: result.getUserReservations.reservations,
          pagination: result.getUserReservations.pagination
        },
        message: 'success'
      };
    } catch (error) {
      return {
        success: false,
        data: { 
          data: [], 
          pagination: { 
            page: options?.page || 1, 
            limit: options?.limit || 10, 
            total: 0, 
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false
          } 
        },
        message: error instanceof GraphQLError ? error.message : '获取预订列表失败'
      };
    }
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
    const query = `
      query GetAllReservations($filters: ReservationFilters, $pagination: PaginationOptions, $sort: SortOptions) {
        getAllReservations(filters: $filters, pagination: $pagination, sort: $sort) {
          reservations {
            id
            guestName
            phoneNumber
            email
            arrivalTime
            tableSize
            status
            specialRequests
            createdAt
            updatedAt
            canEdit
            canCancel
            user {
              id
              username
              email
              role
            }
            statusHistory {
              status
              reason
              changedAt
              changedBy
            }
          }
          pagination {
            page
            limit
            total
            totalPages
            hasNextPage
            hasPrevPage
          }
        }
      }
    `;

    try {
      const result = await this.query<{ getAllReservations: PaginatedResponse<Reservation> }>(query, {
        filters: {
          status: options?.status,
          startDate: options?.startDate,
          endDate: options?.endDate,
          searchTerm: options?.searchTerm
        },
        pagination: {
          page: options?.page || 1,
          limit: options?.limit || 20
        },
        sort: {
          sortBy: options?.sortBy || 'arrivalTime',
          sortOrder: options?.sortOrder || 'desc'
        }
      });

      return {
        success: true,
        data: {
          data: result.getAllReservations.reservations,
          pagination: result.getAllReservations.pagination
        },
        message: 'success'
      };
    } catch (error) {
      return {
        success: false,
        data: { 
          data: [], 
          pagination: { 
            page: options?.page || 1, 
            limit: options?.limit || 20, 
            total: 0, 
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false
          } 
        },
        message: error instanceof GraphQLError ? error.message : '获取预订列表失败'
      };
    }
  }

  async getReservationById(id: string): Promise<ApiResponse<Reservation>> {
    const query = `
      query GetReservationById($id: ID!) {
        getReservationById(id: $id) {
          id
          guestName
          phoneNumber
          email
          arrivalTime
          tableSize
          status
          specialRequests
          createdAt
          updatedAt
          canEdit
          canCancel
          user {
            id
            username
            email
            role
          }
          statusHistory {
            status
            reason
            changedAt
            changedBy
          }
        }
      }
    `;

    try {
      const result = await this.query<{ getReservationById: Reservation }>(query, { id });

      return {
        success: true,
        data: result.getReservationById,
        message: 'success'
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Reservation,
        message: error instanceof GraphQLError ? error.message : '获取预订详情失败'
      };
    }
  }

  async updateReservation(id: string, updates: Partial<ReservationFormData>): Promise<ApiResponse<Reservation>> {
    const mutation = `
      mutation UpdateReservation($id: ID!, $input: ReservationUpdateInput!) {
        updateReservation(id: $id, input: $input) {
          id
          guestName
          phoneNumber
          email
          arrivalTime
          tableSize
          status
          specialRequests
          createdAt
          updatedAt
          canEdit
          canCancel
        }
      }
    `;

    try {
      const result = await this.query<{ updateReservation: Reservation }>(mutation, {
        id,
        input: updates
      });

      return {
        success: true,
        data: result.updateReservation,
        message: '预订更新成功'
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Reservation,
        message: error instanceof GraphQLError ? error.message : '预订更新失败'
      };
    }
  }

  async updateReservationStatus(
    id: string,
    status: string,
    reason?: string
  ): Promise<ApiResponse<Reservation>> {
    const mutation = `
      mutation UpdateReservationStatus($id: ID!, $status: ReservationStatus!, $reason: String) {
        updateReservationStatus(id: $id, status: $status, reason: $reason) {
          id
          guestName
          phoneNumber
          email
          arrivalTime
          tableSize
          status
          specialRequests
          createdAt
          updatedAt
          canEdit
          canCancel
          user {
            id
            username
            email
            role
          }
          statusHistory {
            status
            reason
            changedAt
            changedBy
          }
        }
      }
    `;

    try {
      const result = await this.query<{ updateReservationStatus: Reservation }>(mutation, {
        id,
        status,
        reason
      });

      return {
        success: true,
        data: result.updateReservationStatus,
        message: '预订状态更新成功'
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Reservation,
        message: error instanceof GraphQLError ? error.message : '预订状态更新失败'
      };
    }
  }

  async cancelReservation(id: string, reason: string): Promise<ApiResponse<Reservation>> {
    const mutation = `
      mutation CancelReservation($id: ID!, $reason: String!) {
        cancelReservation(id: $id, reason: $reason) {
          id
          status
          statusHistory {
            status
            reason
            changedAt
            changedBy
          }
        }
      }
    `;

    try {
      const result = await this.query<{ cancelReservation: Reservation }>(mutation, {
        id,
        reason
      });

      return {
        success: true,
        data: result.cancelReservation,
        message: '预订取消成功'
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Reservation,
        message: error instanceof GraphQLError ? error.message : '预订取消失败'
      };
    }
  }

  async getTodayReservations(status?: string): Promise<ApiResponse<Reservation[]>> {
    const query = `
      query GetTodayReservations($status: ReservationStatus) {
        getTodayReservations(status: $status) {
          id
          guestName
          phoneNumber
          email
          arrivalTime
          tableSize
          status
          specialRequests
          createdAt
          updatedAt
          canEdit
          canCancel
          user {
            id
            username
            email
            role
          }
        }
      }
    `;

    try {
      const result = await this.query<{ getTodayReservations: Reservation[] }>(query, {
        status
      });

      return {
        success: true,
        data: result.getTodayReservations,
        message: 'success'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof GraphQLError ? error.message : '获取今日预订失败'
      };
    }
  }
}

// 导出GraphQL客户端实例
export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT);
export { GraphQLError };