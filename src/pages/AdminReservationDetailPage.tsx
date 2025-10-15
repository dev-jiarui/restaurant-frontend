import { Component, createSignal, createEffect, Show, For } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { Reservation } from '@/types';
import { apiClient } from '@/services/api';
import { formatDateTime, formatReservationStatus, getStatusColorClass, formatPhoneLink, formatEmailLink } from '@/utils/format';
import LoadingSpinner from '@/components/LoadingSpinner';
import Modal from '@/components/Modal';

const AdminReservationDetailPage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  
  const [reservation, setReservation] = createSignal<Reservation | null>(null);
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  
  // 状态更新模态框
  const [showStatusModal, setShowStatusModal] = createSignal(false);
  const [newStatus, setNewStatus] = createSignal('');
  const [statusReason, setStatusReason] = createSignal('');
  const [isUpdatingStatus, setIsUpdatingStatus] = createSignal(false);

  // 加载预订详情
  const loadReservationDetail = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await apiClient.getReservationById(params.id);
      
      if (response.success) {
        setReservation(response.data);
      } else {
        setError(response.message || '加载预订详情失败');
      }
    } catch (error: any) {
      console.error('Load reservation detail error:', error);
      setError(error?.message || '网络连接失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 页面加载时获取预订详情
  createEffect(() => {
    if (params.id) {
      loadReservationDetail();
    }
  });

  // 打开状态更新模态框
  const openStatusModal = (status: string) => {
    setNewStatus(status);
    setStatusReason('');
    setShowStatusModal(true);
  };

  // 更新预订状态
  const handleStatusUpdate = async () => {
    if (!newStatus() || !reservation()) return;

    // 如果是取消状态，必须提供原因
    if (newStatus() === 'Cancelled' && !statusReason().trim()) {
      return;
    }

    setIsUpdatingStatus(true);

    try {
      const response = await apiClient.updateReservationStatus(
        reservation()!.id,
        newStatus(),
        statusReason()
      );
      
      if (response.success) {
        setReservation(response.data);
        setShowStatusModal(false);
      } else {
        setError(response.message || '状态更新失败');
      }
    } catch (error: any) {
      console.error('Update status error:', error);
      setError(error?.message || '网络连接失败');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 获取可用的状态选项
  const getAvailableStatusOptions = (currentStatus: string) => {
    const statusTransitions: Record<string, string[]> = {
      'Requested': ['Approved', 'Cancelled'],
      'Approved': ['Completed', 'Cancelled'],
      'Cancelled': [],
      'Completed': []
    };
    
    return statusTransitions[currentStatus] || [];
  };

  // 获取状态按钮样式
  const getStatusButtonClass = (status: string) => {
    const classMap: Record<string, string> = {
      'Approved': 'btn-success',
      'Cancelled': 'btn-danger',
      'Completed': 'btn-primary'
    };
    return `btn ${classMap[status] || 'btn-secondary'}`;
  };

  // 获取状态中文名称
  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      'Approved': '确认',
      'Cancelled': '取消',
      'Completed': '完成'
    };
    return labelMap[status] || status;
  };

  return (
    <div class="reservation-detail-page">
      <div class="container">
        <div class="page-header">
          <button 
            class="btn btn-outline back-btn"
            onClick={() => navigate('/admin/reservations')}
          >
            ← 返回列表
          </button>
          <h1>预订详情</h1>
        </div>

        <Show when={isLoading()}>
          <LoadingSpinner message="加载预订详情..." />
        </Show>

        <Show when={error()}>
          <div class="alert alert-error">
            {error()}
            <button 
              class="btn btn-outline"
              onClick={loadReservationDetail}
              style="margin-left: 1rem;"
            >
              重试
            </button>
          </div>
        </Show>

        <Show when={!isLoading() && !error() && reservation()}>
          {(res) => (
            <div class="reservation-detail">
              {/* 基本信息卡片 */}
              <div class="detail-card card">
                <div class="card-header">
                  <h2>基本信息</h2>
                  <div class={`status-badge ${getStatusColorClass(res().status)}`}>
                    {formatReservationStatus(res().status)}
                  </div>
                </div>

                <div class="card-body">
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="label">客人姓名</span>
                      <span class="value">{res().guestName}</span>
                    </div>

                    <div class="info-item">
                      <span class="label">到达时间</span>
                      <span class="value">{formatDateTime(res().arrivalTime)}</span>
                    </div>

                    <div class="info-item">
                      <span class="label">桌位人数</span>
                      <span class="value">{res().tableSize}人</span>
                    </div>

                    <div class="info-item">
                      <span class="label">预订时间</span>
                      <span class="value">{formatDateTime(res().createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 联系信息卡片 */}
              <div class="detail-card card">
                <div class="card-header">
                  <h2>联系信息</h2>
                </div>

                <div class="card-body">
                  <div class="contact-grid">
                    <div class="contact-item">
                      <span class="label">联系电话</span>
                      <a href={formatPhoneLink(res().phoneNumber)} class="contact-link">
                        📞 {res().phoneNumber}
                      </a>
                    </div>

                    <div class="contact-item">
                      <span class="label">邮箱地址</span>
                      <a href={formatEmailLink(res().email)} class="contact-link">
                        ✉️ {res().email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* 特殊要求卡片 */}
              <Show when={res().specialRequests}>
                <div class="detail-card card">
                  <div class="card-header">
                    <h2>特殊要求</h2>
                  </div>

                  <div class="card-body">
                    <p class="special-requests">{res().specialRequests}</p>
                  </div>
                </div>
              </Show>

              {/* 状态历史卡片 */}
              <Show when={res().statusHistory && res().statusHistory.length > 0}>
                <div class="detail-card card">
                  <div class="card-header">
                    <h2>状态历史</h2>
                  </div>

                  <div class="card-body">
                    <div class="status-history">
                      <For each={res().statusHistory}>
                        {(history) => (
                          <div class="history-item">
                            <div class="history-status">
                              <span class={`status-badge ${getStatusColorClass(history.status)}`}>
                                {formatReservationStatus(history.status)}
                              </span>
                            </div>
                            <div class="history-details">
                              <div class="history-time">
                                {formatDateTime(history.changedAt)}
                              </div>
                              <Show when={history.reason}>
                                <div class="history-reason">
                                  原因: {history.reason}
                                </div>
                              </Show>
                            </div>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                </div>
              </Show>

              {/* 操作按钮 */}
              <Show when={getAvailableStatusOptions(res().status).length > 0}>
                <div class="actions-card card">
                  <div class="card-header">
                    <h2>操作</h2>
                  </div>

                  <div class="card-body">
                    <div class="action-buttons">
                      <For each={getAvailableStatusOptions(res().status)}>
                        {(status) => (
                          <button
                            class={getStatusButtonClass(status)}
                            onClick={() => openStatusModal(status)}
                          >
                            {getStatusLabel(status)}预订
                          </button>
                        )}
                      </For>
                    </div>
                  </div>
                </div>
              </Show>
            </div>
          )}
        </Show>

        {/* 状态更新模态框 */}
        <Modal
          isOpen={showStatusModal()}
          onClose={() => setShowStatusModal(false)}
          title={`${getStatusLabel(newStatus())}预订`}
        >
          <div>
            <p>您确定要将此预订状态更改为"{formatReservationStatus(newStatus())}"吗？</p>
            
            <Show when={newStatus() === 'Cancelled'}>
              <div class="form-group">
                <label class="form-label">取消原因 *</label>
                <textarea
                  class="form-control"
                  value={statusReason()}
                  onInput={(e) => setStatusReason(e.target.value)}
                  placeholder="请说明取消原因"
                  rows="3"
                  disabled={isUpdatingStatus()}
                ></textarea>
              </div>
            </Show>

            <Show when={newStatus() !== 'Cancelled'}>
              <div class="form-group">
                <label class="form-label">备注</label>
                <textarea
                  class="form-control"
                  value={statusReason()}
                  onInput={(e) => setStatusReason(e.target.value)}
                  placeholder="可选的备注信息"
                  rows="3"
                  disabled={isUpdatingStatus()}
                ></textarea>
              </div>
            </Show>

            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                onClick={() => setShowStatusModal(false)}
                disabled={isUpdatingStatus()}
              >
                取消
              </button>
              <button
                type="button"
                class={getStatusButtonClass(newStatus())}
                onClick={handleStatusUpdate}
                disabled={isUpdatingStatus() || (newStatus() === 'Cancelled' && !statusReason().trim())}
              >
                {isUpdatingStatus() ? '更新中...' : `确认${getStatusLabel(newStatus())}`}
              </button>
            </div>
          </div>
        </Modal>
      </div>

      <style>{`
        .reservation-detail-page {
          padding: 2rem 0;
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2rem;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .reservation-detail {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .detail-card {
          padding: 0;
          overflow: hidden;
        }

        .card-header {
          background-color: #f8f9fa;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e1e5e9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-header h2 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .card-body {
          padding: 1.5rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-item .label {
          font-size: 0.875rem;
          color: #6c757d;
          font-weight: 500;
        }

        .info-item .value {
          color: #333;
          font-weight: 500;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .contact-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .contact-item .label {
          font-size: 0.875rem;
          color: #6c757d;
          font-weight: 500;
        }

        .contact-link {
          color: #007bff;
          text-decoration: none;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .contact-link:hover {
          text-decoration: underline;
        }

        .special-requests {
          color: #333;
          line-height: 1.6;
          margin: 0;
          white-space: pre-wrap;
        }

        .status-history {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .history-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background-color: #f8f9fa;
          border-radius: 6px;
        }

        .history-status {
          flex-shrink: 0;
        }

        .history-details {
          flex: 1;
        }

        .history-time {
          font-size: 0.875rem;
          color: #6c757d;
          margin-bottom: 0.25rem;
        }

        .history-reason {
          color: #333;
          font-size: 0.875rem;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        /* 移动端响应式 */
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .page-header h1 {
            font-size: 1.5rem;
          }

          .card-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .info-grid,
          .contact-grid {
            grid-template-columns: 1fr;
          }

          .history-item {
            flex-direction: column;
            gap: 0.5rem;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminReservationDetailPage;