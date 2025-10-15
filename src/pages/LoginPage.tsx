import { Component, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useAuth } from '@/contexts/AuthContext';
import { LoginFormData } from '@/types';
import { validateForm, loginValidationRules } from '@/utils/validation';

const LoginPage: Component = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  
  const [formData, setFormData] = createSignal<LoginFormData>({
    email: '',
    password: '',
    userType: 'guest'
  });
  
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [submitError, setSubmitError] = createSignal('');

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
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

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    // 验证表单
    const validationErrors = validateForm(formData(), loginValidationRules);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const result = await auth.login(
        formData().email,
        formData().password,
        formData().userType
      );

      if (result.success) {
        // 验证用户选择的类型与实际角色是否匹配
        const actualRole = auth.userRole();
        const selectedType = formData().userType;
        
        if (selectedType === 'employee' && actualRole !== 'employee') {
          setSubmitError('您没有餐厅员工权限，请选择"客人"登录');
          auth.logout(); // 登出用户
          return;
        }
        
        if (selectedType === 'guest' && actualRole === 'employee') {
          // 员工选择客人登录是允许的，但提示可以使用员工权限
          console.log('员工以客人身份登录');
        }
        
        // 根据用户的实际角色重定向
        const redirectPath = actualRole === 'employee' 
          ? '/admin/reservations' 
          : '/reservations';
        navigate(redirectPath);
      } else {
        setSubmitError(result.error || '登录失败，请检查用户名和密码');
      }
    } catch (error) {
      console.error('Login error:', error);
      setSubmitError('登录过程中发生错误，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="login-page">
      <div class="container">
        <div class="login-container">
          <div class="login-card card">
            <div class="login-header">
              <h1>希尔顿餐厅预订系统</h1>
              <p>请登录您的账户</p>
            </div>

            <form onSubmit={handleSubmit} class="login-form">
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

              {/* 用户名/邮箱 */}
              <div class="form-group">
                <label class="form-label">用户名或邮箱</label>
                <input
                  type="email"
                  class={`form-control ${errors().email ? 'error' : ''}`}
                  value={formData().email}
                  onInput={(e) => handleInputChange('email', e.target.value)}
                  placeholder="请输入用户名或邮箱地址"
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
                  placeholder="请输入密码"
                  disabled={isSubmitting()}
                />
                {errors().password && <div class="form-error">{errors().password}</div>}
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
                class="btn btn-primary login-btn"
                disabled={isSubmitting()}
              >
                {isSubmitting() ? (
                  <>
                    <span class="spinner spinner-small"></span>
                    登录中...
                  </>
                ) : (
                  '登录'
                )}
              </button>
            </form>

            <div class="login-footer">
              <p>还没有账户？ <a href="/register" class="register-link">立即注册</a></p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 1rem;
        }

        .login-container {
          width: 100%;
          max-width: 400px;
        }

        .login-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .login-header {
          text-align: center;
          padding: 2rem 2rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .login-header h1 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .login-header p {
          opacity: 0.9;
          font-size: 0.875rem;
        }

        .login-form {
          padding: 2rem;
        }

        .login-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .login-footer {
          text-align: center;
          padding: 0 2rem 2rem;
          font-size: 0.875rem;
          color: #6c757d;
        }

        .register-link {
          color: #007bff;
          text-decoration: none;
        }

        .register-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .login-header,
          .login-form,
          .login-footer {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;