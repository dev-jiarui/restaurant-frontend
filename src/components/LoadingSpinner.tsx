import { Component } from 'solid-js';
import { LoadingSpinnerProps } from '@/types';

const LoadingSpinner: Component<LoadingSpinnerProps> = (props) => {
  const size = () => props.size || 'medium';
  const message = () => props.message || '加载中...';

  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  };

  return (
    <div class="loading-container">
      <div class={`spinner ${sizeClasses[size()]}`}></div>
      <div class="loading-message">{message()}</div>
      
      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
        }
        
        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        .spinner-small {
          width: 20px;
          height: 20px;
          border-width: 2px;
        }
        
        .spinner-medium {
          width: 40px;
          height: 40px;
          border-width: 3px;
        }
        
        .spinner-large {
          width: 60px;
          height: 60px;
          border-width: 4px;
        }
        
        .loading-message {
          color: #6c757d;
          font-size: 0.875rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;