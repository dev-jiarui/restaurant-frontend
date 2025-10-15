import { Component, Show, createEffect } from 'solid-js';
import { ModalProps } from '@/types';

const Modal: Component<ModalProps> = (props) => {
  // 处理ESC键关闭模态框
  createEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && props.isOpen) {
        props.onClose();
      }
    };

    if (props.isOpen) {
      document.addEventListener('keydown', handleEscape);
      // 防止背景滚动
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  });

  // 点击背景关闭模态框
  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      props.onClose();
    }
  };

  return (
    <Show when={props.isOpen}>
      <div class="modal-overlay" onClick={handleOverlayClick}>
        <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div class="modal-header">
            <h2 id="modal-title" class="modal-title">{props.title}</h2>
            <button
              class="modal-close"
              onClick={props.onClose}
              aria-label="关闭模态框"
              type="button"
            >
              ×
            </button>
          </div>
          <div class="modal-body">
            {props.children}
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          animation: slideIn 0.2s ease-out;
        }

        .modal-header {
          padding: 1.5rem 1.5rem 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e1e5e9;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
          color: #333;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.25rem;
          color: #6c757d;
          line-height: 1;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background-color: #f8f9fa;
          color: #333;
        }

        .modal-close:focus {
          outline: 2px solid #007bff;
          outline-offset: 2px;
        }

        .modal-body {
          padding: 0 1.5rem 1.5rem;
        }

        /* 动画 */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* 移动端响应式 */
        @media (max-width: 768px) {
          .modal-overlay {
            padding: 0.5rem;
          }

          .modal-content {
            max-width: 100%;
            max-height: 95vh;
          }

          .modal-header,
          .modal-body {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .modal-title {
            font-size: 1.125rem;
          }
        }

        /* 高对比度模式支持 */
        @media (prefers-contrast: high) {
          .modal-overlay {
            background-color: rgba(0, 0, 0, 0.8);
          }

          .modal-content {
            border: 2px solid #333;
          }

          .modal-close {
            border: 1px solid #6c757d;
          }
        }

        /* 减少动画模式支持 */
        @media (prefers-reduced-motion: reduce) {
          .modal-overlay,
          .modal-content {
            animation: none;
          }
        }
      `}</style>
    </Show>
  );
};

export default Modal;