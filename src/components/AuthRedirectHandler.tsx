import { createEffect, onCleanup } from 'solid-js';
import { useNavigate } from '@solidjs/router';

/**
 * 处理认证相关的路由跳转
 * 
 */
export const AuthRedirectHandler = () => {
  const navigate = useNavigate();

  createEffect(() => {
    const handleAuthRedirect = (event: CustomEvent) => {
      const { path } = event.detail;
      console.log('认证重定向:', path);
      navigate(path, { replace: true });
    };

    // 监听认证重定向事件
    window.addEventListener('auth-redirect', handleAuthRedirect as EventListener);

    // 清理函数
    onCleanup(() => {
      window.removeEventListener('auth-redirect', handleAuthRedirect as EventListener);
    });
  });

  // 这个组件不渲染任何内容
  return null;
};