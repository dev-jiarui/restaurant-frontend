import { createContext, useContext, createSignal, createEffect, ParentComponent } from 'solid-js';
import { User } from '@/types';
import { apiClient } from '@/services/api';

interface AuthContextType {
  user: () => User | null;
  isAuthenticated: () => boolean;
  userRole: () => 'guest' | 'employee';
  login: (email: string, password: string, userType: 'guest' | 'employee') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: () => boolean;
}

const AuthContext = createContext<AuthContextType>();

export const AuthProvider: ParentComponent = (props) => {
  const [user, setUser] = createSignal<User | null>(null);
  const [isLoading, setIsLoading] = createSignal(true);

  // 初始化时检查本地存储的token
  createEffect(() => {
    const checkAuth = async () => {
      if (apiClient.isAuthenticated()) {
        // 从localStorage恢复用户信息
        const savedUser = localStorage.getItem('user_info');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (error) {
            console.error('Failed to parse saved user info:', error);
            apiClient.logout();
          }
        }
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  });

  const login = async (email: string, password: string, userType: 'guest' | 'employee'): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await apiClient.login({ email, password, userType });

      if (response.success) {
        setUser(response.data.user);
        // 保存用户信息到localStorage
        localStorage.setItem('user_info', JSON.stringify(response.data.user));
        return { success: true };
      }
      return { success: false, error: response.message || '登录失败' };
    } catch (error: any) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error?.message || '网络连接失败，请检查网络连接' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
    localStorage.removeItem('user_info');
  };

  const isAuthenticated = () => !!user();

  const userRole = (): 'guest' | 'employee' => {
    const currentUser = user();
    if (!currentUser) return 'guest';

    // 根据用户角色映射到前端角色
    return currentUser.role === 'admin' ? 'employee' : 'guest';
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    userRole,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};