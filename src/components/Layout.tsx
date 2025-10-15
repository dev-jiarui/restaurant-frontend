import { Component, Show } from 'solid-js';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from './Navigation';

interface LayoutProps {
  children: any;
}

const Layout: Component<LayoutProps> = (props) => {
  const auth = useAuth();

  return (
    <div class="app-layout">
      <Show when={auth.isAuthenticated()}>
        <Navigation 
          userRole={auth.userRole()} 
          onLogout={auth.logout} 
        />
      </Show>
      
      <main class="main-content">
        {props.children}
      </main>

      <style jsx>{`
        .app-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .main-content {
          flex: 1;
          padding: 2rem 0;
        }

        /* 当没有导航栏时，调整主内容区域 */
        .app-layout:not(:has(.navbar)) .main-content {
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default Layout;