import { Component, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { validateForm, loginValidationRules } from '@/utils/validation';
import { apiClient } from '@/services/api';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: 'guest' | 'employee';
}

const RegisterPage: Component = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = createSignal<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'guest'
  });
  
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [submitError, setSubmitError] = createSignal('');
  const [submitSuccess, setSubmitSuccess] = createSignal(false);

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除该字段的错误
    if (errors()[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateRegisterForm = () => {
    const data = formData();
    const validationErrors: Record<string, string> = {};

    // 用户名验证
    if (!data.username.trim()) {
      validationErrors.username = '用户名不能为空';
    } else if (data.username.length < 2) {
      validationErrors.username = '用户名至少需要2个字符';
    }

    // 邮箱验证
    if (!data.email.trim()) {
      validationErrors.email = '邮箱不能为空';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      validationErrors.email = '请输入有效的邮箱地址';
    }

    // 密码验证
    if (!data.password) {
      validationErrors.password = '密码不能为空';
    } else if (data.password.length < 6) {
      validationErrors.password = '密码长度至少6位';
    }

    // 确认密码验证
    if (!data.confirmPassword) {
      validationErrors.confirmPassword = '请确认密码';
    } else if (data.password !== data.confirmPassword) {
      validationErrors.confirmPassword = '两次输入的密码不一致';
    }

    return validationErrors;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    // 验证表单
    const validationErrors = validateRegisterForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await apiClient.register({
        username: formData().username,
        email: formData().email,
        password: formData().password,
        role: formData().userType === 'employee' ? 'admin' : 'user'
      });

      if (response.success) {
        setSubmitSuccess(true);
        // 2秒后跳转到登录页面
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setSubmitError(response.message || '注册失败');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      setSubmitError(error?.message || '网络连接失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="register-page">
      <div class="container">
        <div class="register-container">
          <div class="register-card card">
            <div class="register-header">
              <h1>注册账户</h1>
              <p>创建您的希尔顿餐厅预订账户</p>
            </div>

            {submitSuccess() ? (
              <div class="success-message">
                <div class="alert alert-success">
                  <h3>注册成功！</h3>
                  <p>您的账户已创建成功，2秒后将跳转到登录页面。</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} class="register-form">
                {/* 用户类型选择 */}
                <div class="form-group">
                  <label class="form-label">用户类型</label>
                  <select
                    class="form-control form-select"
                    value={formData().userType}
                    onChange={(e) => handleInputChange('userType', e.target.value)}
                  >
                    <option value="guest">客人</option>
                    <option value="employee">餐厅员工</option>
                  </select>
                </div>

                {/* 用户名 */}
                <div class="form-group">
                  <label class="form-label">用户名</label>
                  <input
                    type="text"
                    class={`form-control ${errors().username ? 'error' : ''}`}
                    value={formData().username}
                    onInput={(e) => handleInputChange('username', e.target.value)}
                    placeholder="请输入用户名"
                    disabled={isSubmitting()}
                  />
                  {errors().username && <div class="form-error">{errors().username}</div>}
                </div>

                {/* 邮箱 */}
                <div class="form-group">
                  <label class="form-label">邮箱地址</label>
                  <input
                    type="email"
                    class={`form-control ${errors().email ? 'error' : ''}`}
                    value={formData().email}
                    onInput={(e) => handleInputChange('email', e.target.value)}
                    placeholder="请输入邮箱地址"
                    disabled={isSubmitting()}
                  />
                  {errors().email && <div class="form-error">{errors().email}</div>}
                </div>

                {/* 密码 */}
                <div class="form-group">
                  <label class="form-label">密码</label>
                  <input
                    type="password"
                    class={`form-control ${errors().password ? 'error' : ''}`}
                    value={formData().password}
                    onInput={(e) => handleInputChange('password', e.target.value)}
                    placeholder="请输入密码（至少6位）"
                    disabled={isSubmitting()}
                  />
                  {errors().password && <div class="form-error">{errors().password}</div>}
                </div>

                {/* 确认密码 */}
                <div class="form-group">
                  <label class="form-label">确认密码</label>
                  <input
                    type="password"
                    class={`form-control ${errors().confirmPassword ? 'error' : ''}`}
                    value={formData().confirmPassword}
                    onInput={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="请再次输入密码"
                    disabled={isSubmitting()}
                  />
                  {errors().confirmPassword && <div class="form-error">{errors().confirmPassword}</div>}
                </div>

                {/* 提交错误 */}
                {submitError() && (
                  <div class="alert alert-error">
                    {submitError()}
                  </div>
                )}

                {/* 提交按钮 */}
                <button
                  type="submit"
                  class="btn btn-primary register-btn"
                  disabled={isSubmitting()}
                >
                  {isSubmitting() ? (
                    <>
                      <span class="spinner spinner-small"></span>
                      注册中...
                    </>
                  ) : (
                    '立即注册'
                  )}
                </button>
              </form>
            )}

            <div class="register-footer">
              <p>已有账户？ <a href="/login" class="login-link">立即登录</a></p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .register-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 1rem;
        }

        .register-container {
          width: 100%;
          max-width: 450px;
        }

        .register-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .register-header {
          text-align: center;
          padding: 2rem 2rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .register-header h1 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .register-header p {
          opacity: 0.9;
          font-size: 0.875rem;
        }

        .register-form {
          padding: 2rem;
        }

        .register-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .register-footer {
          text-align: center;
          padding: 0 2rem 2rem;
          font-size: 0.875rem;
          color: #6c757d;
        }

        .login-link {
          color: #007bff;
          text-decoration: none;
        }

        .login-link:hover {
          text-decoration: underline;
        }

        .success-message {
          text-align: center;
          padding: 2rem;
        }

        .success-message h3 {
          color: #155724;
          margin-bottom: 1rem;
        }

        @media (max-width: 480px) {
          .register-header,
          .register-form,
          .register-footer {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;