// 用户类型
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

// 预订状态枚举
export type ReservationStatus = 'Requested' | 'Approved' | 'Cancelled' | 'Completed';

// 预订数据模型
export interface Reservation {
  id: string;
  guestName: string;
  phoneNumber: string;
  email: string;
  arrivalTime: string;
  tableSize: number;
  status: ReservationStatus;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: Record<string, string>;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 登录表单数据
export interface LoginFormData {
  email: string;
  password: string;
  userType: 'guest' | 'employee';
}

// 预订表单数据
export interface ReservationFormData {
  guestName: string;
  phoneNumber: string;
  email: string;
  arrivalTime: string;
  tableSize: number;
  specialRequests?: string;
}

// 应用状态
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  userRole: 'guest' | 'employee';
}

// 表单字段属性
export interface FormFieldProps {
  label: string;
  type: 'text' | 'email' | 'tel' | 'datetime-local' | 'number' | 'select' | 'password';
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  required?: boolean;
  options?: Array<{label: string, value: string | number}>;
  placeholder?: string;
}

// 模态框属性
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: any;
}

// 加载指示器属性
export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

// 导航组件属性
export interface NavigationProps {
  userRole: 'guest' | 'employee';
  onLogout: () => void;
}

// 错误消息属性
export interface ErrorMessageProps {
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  onDismiss?: () => void;
}