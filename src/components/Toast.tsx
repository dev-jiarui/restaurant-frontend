import { createSignal, createEffect, Show, For } from 'solid-js';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

export const Toast = (props: ToastProps) => {
  const [visible, setVisible] = createSignal(true);
  const duration = props.duration || 5000;

  createEffect(() => {
    if (visible()) {
      const timer = setTimeout(() => {
        setVisible(false);
        props.onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  });

  const getTypeClass = () => {
    switch (props.type) {
      case 'success': return 'toast-success';
      case 'error': return 'toast-error';
      case 'warning': return 'toast-warning';
      case 'info': return 'toast-info';
      default: return 'toast-info';
    }
  };

  return (
    <Show when={visible()}>
      <div class={`toast ${getTypeClass()}`}>
        <div class="toast-content">
          <span class="toast-message">{props.message}</span>
          <button 
            class="toast-close"
            onClick={() => {
              setVisible(false);
              props.onClose?.();
            }}
          >
            ×
          </button>
        </div>
      </div>
    </Show>
  );
};

// Toast管理器
interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

const [toasts, setToasts] = createSignal<ToastItem[]>([]);
let toastId = 0;

export const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 5000) => {
  const id = ++toastId;
  const newToast: ToastItem = { id, message, type, duration };
  
  setToasts(prev => [...prev, newToast]);

  // 自动移除
  setTimeout(() => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, duration);
};

export const ToastContainer = () => {
  return (
    <div class="toast-container">
      <For each={toasts()}>
        {(toast) => (
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          />
        )}
      </For>
    </div>
  );
};