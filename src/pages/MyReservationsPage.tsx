import { Component, createSignal, createEffect, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Reservation, ReservationFormData } from '@/types';
import { apiClient } from '@/services/api';
import { formatDateTime, formatReservationStatus, getStatusColorClass, canEditReservation, canCancelReservation } from '@/utils/format';
import { validateForm, reservationValidationRules } from '@/utils/validation';
import LoadingSpinner from '@/components/LoadingSpinner';
import Modal from '@/components/Modal';

const MyReservationsPage: Component = () => {
  const navigate = useNavigate();
  
  const [reservations, setReservations] = createSignal<Reservation[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  
  // 编辑模态框状态
  const [showEditModal, setShowEditModal] = createSignal(false);
  const [selectedReservation, setSelectedReservation] = createSignal<Reservation | null>(null);
  const [editFormData, setEditFormData] = createSignal<ReservationFormData>({
    guestName: '',
    phoneNumber: '',
    email: '',
    arrivalTime: '',
    tableSize: 2,
    specialRequests: ''
  });
  const [editErrors, setEditErrors] = createSignal<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = createSignal(false);
  
  // 取消模态框状态
  const [showCancelModal, setShowCancelModal] = createSignal(false);
  const [cancelReason, setCancelReason] = createSignal('');
  const [isCancelling, setIsCancelling] = createSignal(false);

  // 加载预订列表
  const loadReservations = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await apiClient.getUserReservations();
      
      if (response.success) {
        setReservations(response.data.data || []);
      } else {
        setError(response.message || '加载预订列表失败');
      }
    } catch (error: any) {
      console.error('Load reservations error:', error);
      setError(error?.message || '网络连接失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 页面加载时获取预订列表
  createEffect(() => {
    loadReservations();
  });

  // 打开编辑模态框
  const openEditModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setEditFormData({
      guestName: reservation.guestName,
      phoneNumber: reservation.phoneNumber,
      email: reservation.email,
      arrivalTime: new Date(reservation.arrivalTime).toISOString().slice(0, 16),
      tableSize: reservation.tableSize,
      specialRequests: reservation.specialRequests || ''
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  // 处理编辑表单输入
  const handleEditInputChange = (field: keyof ReservationFormData, value: string | number) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除该字段的错误
    if (editErrors()[field]) {
      setEditErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 提交编辑
  const handleEditSubmit = async (e: Event) => {
    e.preventDefault();
    
    const reservation = selectedReservation();
    if (!reservation) return;

    // 验证表单
    const validationErrors = validateForm(editFormData(), reservationValidationRules);
    if (Object.keys(validationErrors).length > 0) {
      setEditErrors(validationErrors);
      return;
    }

    setIsUpdating(true);

    try {
      const response = await apiClient.updateReservation(reservation.id, editFormData());
      
      if (response.success) {
        // 更新本地列表
        setReservations(prev => 
          prev.map(r => r.id === reservation.id ? response.data : r)
        );
        setShowEditModal(false);
      } else {
        setEditErrors({ general: response.message || '更新失败' });
      }
    } catch (error: any) {
      console.error('Update reservation error:', error);
      setEditErrors({ general: error?.message || '网络连接失败' });
    } finally {
      setIsUpdating(false);
    }
  };

  // 打开取消模态框
  const openCancelModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setCancelReason('');
    setShowCancelModal(true);
  };

  // 取消预订
  const handleCancelReservation = async () => {
    const reservation = selectedReservation();
    if (!reservation || !cancelReason().trim()) return;

    setIsCancelling(true);

    try {
      const response = await apiClient.cancelReservation(reservation.id, cancelReason());
      
      if (response.success) {
        // 更新本地列表
        setReservations(prev => 
          prev.map(r => r.id === reservation.id ? response.data : r)
        );
        setShowCancelModal(false);
      } else {
        setError(response.message || '取消失败');
      }
    } catch (error: any) {
      console.error('Cancel reservation error:', error);
      setError(error?.message || '网络连接失败');
    } finally {
      setIsCancelling(false);
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
    <div class="my-reservations-page">
      <div class="container">
        <div class="page-header">
          <h1>我的预订</h1>
          <button 
            class="btn btn-primary"
            onClick={() => navigate('/reservations')}
          >
            新建预订
          </button>
        </div>

        <Show when={isLoading()}>
          <LoadingSpinner message="加载预订列表..." />
        </Show>

        <Show when={error()}>
          <div class="alert alert-error">
            {error()}
            <button 
              class="btn btn-outline"
              onClick={loadReservations}
              style="margin-left: 1rem;"
            >
              重试
            </button>
          </div>
        </Show>

        <Show when={!isLoading() && !error()}>
          <Show 
            when={reservations().length > 0}
            fallback={
              <div class="empty-state card">
                <h3>暂无预订</h3>
                <p>您还没有任何预订记录</p>
                <button 
                  class="btn btn-primary"
                  onClick={() => navigate('/reservations')}
                >
                  立即预订
                </button>
              </div>
            }
          >
            <div class="reservations-list">
              <For each={reservations()}>
                {(reservation) => (
                  <div class="reservation-card card">
                    <div class="reservation-header">
                      <div class="reservation-info">
                        <h3>{reservation.guestName}</h3>
                        <p class="reservation-time">{formatDateTime(reservation.arrivalTime)}</p>
                      </div>
                      <div class={`status-badge ${getStatusColorClass(reservation.status)}`}>
                        {formatReservationStatus(reservation.status)}
                      </div>
                    </div>

                    <div class="reservation-details">
                      <div class="detail-item">
                        <span class="label">桌位人数:</span>
                        <span class="value">{reservation.tableSize}人</span>
                      </div>
                      <div class="detail-item">
                        <span class="label">联系电话:</span>
                        <span class="value">{reservation.phoneNumber}</span>
                      </div>
                      <div class="detail-item">
                        <span class="label">邮箱地址:</span>
                        <span class="value">{reservation.email}</span>
                      </div>
                      <Show when={reservation.specialRequests}>
                        <div class="detail-item">
                          <span class="label">特殊要求:</span>
                          <span class="value">{reservation.specialRequests}</span>
                        </div>
                      </Show>
                    </div>

                    <div class="reservation-actions">
                      <Show when={canEditReservation(reservation.status)}>
                        <button 
                          class="btn btn-outline"
                          onClick={() => openEditModal(reservation)}
                        >
                          编辑
                        </button>
                      </Show>
                      
                      <Show when={canCancelReservation(reservation.status)}>
                        <button 
                          class="btn btn-danger"
                          onClick={() => openCancelModal(reservation)}
                        >
                          取消
                        </button>
                      </Show>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Show>

        {/* 编辑模态框 */}
        <Modal
          isOpen={showEditModal()}
          onClose={() => setShowEditModal(false)}
          title="编辑预订"
        >
          <form onSubmit={handleEditSubmit}>
            <div class="form-group">
              <label class="form-label">客人姓名 *</label>
              <input
                type="text"
                class={`form-control ${editErrors().guestName ? 'error' : ''}`}
                value={editFormData().guestName}
                onInput={(e) => handleEditInputChange('guestName', e.target.value)}
                disabled={isUpdating()}
              />
              {editErrors().guestName && <div class="form-error">{editErrors().guestName}</div>}
            </div>

            <div class="form-group">
              <label class="form-label">联系电话 *</label>
              <input
                type="tel"
                class={`form-control ${editErrors().phoneNumber ? 'error' : ''}`}
                value={editFormData().phoneNumber}
                onInput={(e) => handleEditInputChange('phoneNumber', e.target.value)}
                disabled={isUpdating()}
              />
              {editErrors().phoneNumber && <div class="form-error">{editErrors().phoneNumber}</div>}
            </div>

            <div class="form-group">
              <label class="form-label">邮箱地址 *</label>
              <input
                type="email"
                class={`form-control ${editErrors().email ? 'error' : ''}`}
                value={editFormData().email}
                onInput={(e) => handleEditInputChange('email', e.target.value)}
                disabled={isUpdating()}
              />
              {editErrors().email && <div class="form-error">{editErrors().email}</div>}
            </div>

            <div class="form-group">
              <label class="form-label">到达时间 *</label>
              <input
                type="datetime-local"
                class={`form-control ${editErrors().arrivalTime ? 'error' : ''}`}
                value={editFormData().arrivalTime}
                onInput={(e) => handleEditInputChange('arrivalTime', e.target.value)}
                disabled={isUpdating()}
              />
              {editErrors().arrivalTime && <div class="form-error">{editErrors().arrivalTime}</div>}
            </div>

            <div class="form-group">
              <label class="form-label">桌位人数 *</label>
              <select
                class={`form-control form-select ${editErrors().tableSize ? 'error' : ''}`}
                value={editFormData().tableSize}
                onChange={(e) => handleEditInputChange('tableSize', parseInt(e.target.value))}
                disabled={isUpdating()}
              >
                <For each={tableSizeOptions}>
                  {(option) => <option value={option.value}>{option.label}</option>}
                </For>
              </select>
              {editErrors().tableSize && <div class="form-error">{editErrors().tableSize}</div>}
            </div>

            <div class="form-group">
              <label class="form-label">特殊要求</label>
              <textarea
                class="form-control"
                value={editFormData().specialRequests || ''}
                onInput={(e) => handleEditInputChange('specialRequests', e.target.value)}
                rows="3"
                disabled={isUpdating()}
              ></textarea>
            </div>

            {editErrors().general && (
              <div class="alert alert-error">
                {editErrors().general}
              </div>
            )}

            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                onClick={() => setShowEditModal(false)}
                disabled={isUpdating()}
              >
                取消
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                disabled={isUpdating()}
              >
                {isUpdating() ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </Modal>

        {/* 取消模态框 */}
        <Modal
          isOpen={showCancelModal()}
          onClose={() => setShowCancelModal(false)}
          title="取消预订"
        >
          <div>
            <p>您确定要取消这个预订吗？此操作不可撤销。</p>
            
            <div class="form-group">
              <label class="form-label">取消原因 *</label>
              <textarea
                class="form-control"
                value={cancelReason()}
                onInput={(e) => setCancelReason(e.target.value)}
                placeholder="请说明取消原因"
                rows="3"
                disabled={isCancelling()}
              ></textarea>
            </div>

            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling()}
              >
                保留预订
              </button>
              <button
                type="button"
                class="btn btn-danger"
                onClick={handleCancelReservation}
                disabled={isCancelling() || !cancelReason().trim()}
              >
                {isCancelling() ? '取消中...' : '确认取消'}
              </button>
            </div>
          </div>
        </Modal>
      </div>

      <style>{`
        .my-reservations-page {
          padding: 2rem 0;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2rem;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .reservations-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .reservation-card {
          padding: 1.5rem;
        }

        .reservation-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .reservation-info h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 0.25rem 0;
        }

        .reservation-time {
          color: #6c757d;
          font-size: 0.875rem;
          margin: 0;
        }

        .reservation-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-item .label {
          font-size: 0.875rem;
          color: #6c757d;
          font-weight: 500;
        }

        .detail-item .value {
          color: #333;
        }

        .reservation-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
        }

        .empty-state h3 {
          color: #6c757d;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #6c757d;
          margin-bottom: 1.5rem;
        }

        /* 移动端响应式 */
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .page-header h1 {
            font-size: 1.5rem;
          }

          .reservation-header {
            flex-direction: column;
            gap: 1rem;
          }

          .reservation-details {
            grid-template-columns: 1fr;
          }

          .reservation-actions {
            justify-content: stretch;
          }

          .reservation-actions .btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default MyReservationsPage;