import { Component, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { ReservationFormData } from '@/types';
import { validateForm, reservationValidationRules } from '@/utils/validation';
import { getDefaultDateTime } from '@/utils/format';
import { apiClient } from '@/services/api';

const ReservationPage: Component = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = createSignal<ReservationFormData>({
    guestName: '',
    phoneNumber: '',
    email: '',
    arrivalTime: getDefaultDateTime(),
    tableSize: 2,
    specialRequests: ''
  });
  
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [submitError, setSubmitError] = createSignal('');
  const [submitSuccess, setSubmitSuccess] = createSignal(false);

  const handleInputChange = (field: keyof ReservationFormData, value: string | number) => {
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
    const validationErrors = validateForm(formData(), reservationValidationRules);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const response = await apiClient.createReservation(formData());

      if (response.success) {
        setSubmitSuccess(true);
        // 3秒后跳转到我的预订页面
        setTimeout(() => {
          navigate('/my-reservations');
        }, 3000);
      } else {
        setSubmitError(response.message || '预订创建失败');
      }
    } catch (error: any) {
      console.error('Reservation creation error:', error);
      setSubmitError(error?.message || '网络连接失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tableSizeOptions = [
    { label: '1人', value: 1 },
    { label: '2人', value: 2 },
    { label: '3人', value: 3 },
    { label: '4人', value: 4 },
    { label: '5人', value: 5 },
    { label: '6人', value: 6 },
    { label: '7人', value: 7 },
    { label: '8人', value: 8 },
    { label: '9人', value: 9 },
    { label: '10人', value: 10 },
    { label: '10人以上', value: 12 }
  ];

  return (
    <div class="reservation-page">
      <div class="container">
        <div class="reservation-container">
          <div class="page-header">
            <h1>预订桌位</h1>
            <p>请填写以下信息完成您的预订</p>
          </div>

          <div class="reservation-card card">
            {submitSuccess() ? (
              <div class="success-message">
                <div class="alert alert-success">
                  <h3>预订成功！</h3>
                  <p>您的预订已提交，我们会尽快处理。3秒后将跳转到"我的预订"页面。</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} class="reservation-form">
                <div class="form-row">
                  {/* 客人姓名 */}
                  <div class="form-group">
                    <label class="form-label">客人姓名 *</label>
                    <input
                      type="text"
                      class={`form-control ${errors().guestName ? 'error' : ''}`}
                      value={formData().guestName}
                      onInput={(e) => handleInputChange('guestName', e.target.value)}
                      placeholder="请输入客人姓名"
                      disabled={isSubmitting()}
                    />
                    {errors().guestName && <div class="form-error">{errors().guestName}</div>}
                  </div>

                  {/* 联系电话 */}
                  <div class="form-group">
                    <label class="form-label">联系电话 *</label>
                    <input
                      type="tel"
                      class={`form-control ${errors().phoneNumber ? 'error' : ''}`}
                      value={formData().phoneNumber}
                      onInput={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="请输入手机号码"
                      disabled={isSubmitting()}
                    />
                    {errors().phoneNumber && <div class="form-error">{errors().phoneNumber}</div>}
                  </div>
                </div>

                <div class="form-row">
                  {/* 邮箱地址 */}
                  <div class="form-group">
                    <label class="form-label">邮箱地址 *</label>
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

                  {/* 桌位人数 */}
                  <div class="form-group">
                    <label class="form-label">桌位人数 *</label>
                    <select
                      class={`form-control form-select ${errors().tableSize ? 'error' : ''}`}
                      value={formData().tableSize}
                      onChange={(e) => handleInputChange('tableSize', parseInt(e.target.value))}
                      disabled={isSubmitting()}
                    >
                      {tableSizeOptions.map(option => (
                        <option value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {errors().tableSize && <div class="form-error">{errors().tableSize}</div>}
                  </div>
                </div>

                {/* 到达时间 */}
                <div class="form-group">
                  <label class="form-label">到达时间 *</label>
                  <input
                    type="datetime-local"
                    class={`form-control ${errors().arrivalTime ? 'error' : ''}`}
                    value={formData().arrivalTime}
                    onInput={(e) => handleInputChange('arrivalTime', e.target.value)}
                    disabled={isSubmitting()}
                  />
                  <div class="form-help">营业时间：10:00 - 22:00</div>
                  {errors().arrivalTime && <div class="form-error">{errors().arrivalTime}</div>}
                </div>

                {/* 特殊要求 */}
                <div class="form-group">
                  <label class="form-label">特殊要求</label>
                  <textarea
                    class="form-control"
                    value={formData().specialRequests || ''}
                    onInput={(e) => handleInputChange('specialRequests', e.target.value)}
                    placeholder="如有特殊要求请在此说明（可选）"
                    rows="3"
                    disabled={isSubmitting()}
                  ></textarea>
                </div>

                {/* 提交错误 */}
                {submitError() && (
                  <div class="alert alert-error">
                    {submitError()}
                  </div>
                )}

                {/* 提交按钮 */}
                <div class="form-actions">
                  <button
                    type="submit"
                    class="btn btn-primary submit-btn"
                    disabled={isSubmitting()}
                  >
                    {isSubmitting() ? (
                      <>
                        <span class="spinner spinner-small"></span>
                        提交中...
                      </>
                    ) : (
                      '提交预订'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    class="btn btn-secondary"
                    onClick={() => navigate('/my-reservations')}
                    disabled={isSubmitting()}
                  >
                    查看我的预订
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .reservation-page {
          min-height: calc(100vh - 200px);
          padding: 2rem 0;
        }

        .reservation-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .page-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .page-header p {
          color: #6c757d;
          font-size: 1rem;
        }

        .reservation-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 2rem;
        }

        .reservation-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-help {
          font-size: 0.875rem;
          color: #6c757d;
          margin-top: 0.25rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 1rem;
        }

        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-width: 120px;
        }

        .success-message {
          text-align: center;
          padding: 2rem;
        }

        .success-message h3 {
          color: #155724;
          margin-bottom: 1rem;
        }

        /* 移动端响应式 */
        @media (max-width: 768px) {
          .reservation-container {
            max-width: 100%;
            padding: 0 1rem;
          }

          .reservation-card {
            padding: 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .form-actions {
            flex-direction: column;
          }

          .page-header h1 {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .reservation-card {
            padding: 1rem;
          }

          .page-header {
            margin-bottom: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ReservationPage;