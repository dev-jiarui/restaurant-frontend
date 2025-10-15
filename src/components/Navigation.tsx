import { Component, Show } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import { NavigationProps } from '@/types';

const Navigation: Component<NavigationProps> = (props) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    props.onLogout();
    navigate('/login');
  };

  return (
    <nav class="navbar">
      <div class="container">
        <div class="navbar-brand">
          <A href={props.userRole === 'employee' ? '/admin/reservations' : '/reservations'} class="brand-link">
            希尔顿餐厅预订系统
          </A>
        </div>

        <div class="navbar-menu">
          <Show when={props.userRole === 'guest'}>
            <div class="navbar-nav">
              <A href="/reservations" class="nav-link" activeClass="active">
                预订桌位
              </A>
              <A href="/my-reservations" class="nav-link" activeClass="active">
                我的预订
              </A>
            </div>
          </Show>

          <Show when={props.userRole === 'employee'}>
            <div class="navbar-nav">
              <A href="/admin/reservations" class="nav-link" activeClass="active">
                预订管理
              </A>
            </div>
          </Show>

          <div class="navbar-actions">
            <button 
              class="btn btn-outline logout-btn" 
              onClick={handleLogout}
              type="button"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          background: white;
          border-bottom: 1px solid #e1e5e9;
          padding: 0.75rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .navbar .container {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .navbar-brand {
          font-size: 1.25rem;
          font-weight: 600;
        }

        .brand-link {
          color: #007bff;
          text-decoration: none;
        }

        .brand-link:hover {
          color: #0056b3;
        }

        .navbar-menu {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .navbar-nav {
          display: flex;
          gap: 1rem;
        }

        .nav-link {
          color: #6c757d;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          color: #007bff;
          background-color: #f8f9fa;
        }

        .nav-link.active {
          color: #007bff;
          background-color: #e3f2fd;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
        }

        .logout-btn {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        /* 移动端响应式 */
        @media (max-width: 768px) {
          .navbar .container {
            flex-direction: column;
            gap: 1rem;
          }

          .navbar-menu {
            width: 100%;
            justify-content: space-between;
            gap: 1rem;
          }

          .navbar-nav {
            gap: 0.5rem;
          }

          .nav-link {
            padding: 0.375rem 0.75rem;
            font-size: 0.875rem;
          }

          .logout-btn {
            padding: 0.375rem 0.75rem;
            font-size: 0.875rem;
          }
        }

        @media (max-width: 480px) {
          .navbar-brand {
            font-size: 1rem;
          }

          .navbar-menu {
            flex-direction: column;
            gap: 0.75rem;
          }

          .navbar-nav {
            justify-content: center;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navigation;