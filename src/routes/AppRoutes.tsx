import { Component, Show } from 'solid-js';
import { Routes, Route, Navigate } from '@solidjs/router';
import { useAuth } from '@/contexts/AuthContext';

// 页面组件
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ReservationPage from '@/pages/ReservationPage';
import MyReservationsPage from '@/pages/MyReservationsPage';
import AdminReservationListPage from '@/pages/AdminReservationListPage';
import AdminReservationDetailPage from '@/pages/AdminReservationDetailPage';
import LoadingSpinner from '@/components/LoadingSpinner';

// 路由组件
const ProtectedRoute: Component<{ children: any; requiredRole?: 'guest' | 'employee' }> = (props) => {
  const auth = useAuth();

  return (
    <Show
      when={!auth.isLoading()}
      fallback={<LoadingSpinner message="加载中..." />}
    >
      <Show
        when={auth.isAuthenticated()}
        fallback={<Navigate href="/login" />}
      >
        <Show
          when={!props.requiredRole || auth.userRole() === props.requiredRole}
          fallback={<div class="container"><div class="alert alert-error">您没有访问此页面的权限</div></div>}
        >
          {props.children}
        </Show>
      </Show>
    </Show>
  );
};

// 公共路由组件（已登录用户重定向）
const PublicRoute: Component<{ children: any }> = (props) => {
  const auth = useAuth();

  return (
    <Show
      when={!auth.isLoading()}
      fallback={<LoadingSpinner message="加载中..." />}
    >
      <Show
        when={!auth.isAuthenticated()}
        fallback={
          <Navigate href={auth.userRole() === 'employee' ? '/admin/reservations' : '/reservations'} />
        }
      >
        {props.children}
      </Show>
    </Show>
  );
};

const AppRoutes: Component = () => {
  return (
    <Routes>
      {/* 公共路由 */}
      <Route path="/login" component={() => (
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      )} />

      <Route path="/register" component={() => (
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      )} />

      {/* 客人路由 */}
      <Route path="/reservations" component={() => (
        <ProtectedRoute requiredRole="guest">
          <ReservationPage />
        </ProtectedRoute>
      )} />

      <Route path="/my-reservations" component={() => (
        <ProtectedRoute requiredRole="guest">
          <MyReservationsPage />
        </ProtectedRoute>
      )} />

      {/* 员工路由 */}
      <Route path="/admin/reservations" component={() => (
        <ProtectedRoute requiredRole="employee">
          <AdminReservationListPage />
        </ProtectedRoute>
      )} />

      <Route path="/admin/reservations/:id" component={() => (
        <ProtectedRoute requiredRole="employee">
          <AdminReservationDetailPage />
        </ProtectedRoute>
      )} />

      {/* 默认重定向 */}
      <Route path="/" component={() => <Navigate href="/login" />} />
      
      {/* 404页面 */}
      <Route path="*" component={() => (
        <div class="container">
          <div class="card">
            <h1>页面未找到</h1>
            <p>您访问的页面不存在。</p>
            <a href="/login" class="btn btn-primary">返回登录</a>
          </div>
        </div>
      )} />
    </Routes>
  );
};

export default AppRoutes;