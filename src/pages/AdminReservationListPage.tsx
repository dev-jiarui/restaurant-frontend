import { Component, createSignal, createEffect, For, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { Reservation } from '@/types';
import { apiClient } from '@/services/api';
import { formatDateTime, formatDate, formatReservationStatus, getStatusColorClass, formatPhoneLink, formatEmailLink } from '@/utils/format';
import LoadingSpinner from '@/components/LoadingSpinner';

const AdminReservationListPage: Component = () => {
  const [reservations, setReservations] = createSignal<Reservation[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  
  // 筛选和排序状态
  const [filters, setFilters] = createSignal({
    status: '',
    date: '', // 默认为空，查询所有数据
    searchTerm: ''
  });
  const [sortBy, setSortBy] = createSignal<'arrivalTime' | 'guestName' | 'status'>('arrivalTime');
  const [sortOrder, setSortOrder] = createSignal<'asc' | 'desc'>('desc'); // 默认倒序
  
  // 分页状态
  const [currentPage, setCurrentPage] = createSignal(1);
  const [pagination, setPagination] = createSignal({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // 加载预订列表
  const loadReservations = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const currentFilters = filters();
      const options = {
        page: currentPage(),
        limit: 20,
        status: currentFilters.status || undefined,
        startDate: currentFilters.date ? `${currentFilters.date}T00:00:00` : undefined,
        endDate: currentFilters.date ? `${currentFilters.date}T23:59:59` : undefined,
        searchTerm: currentFilters.searchTerm || undefined,
        sortBy: sortBy(),
        sortOrder: sortOrder()
      };

      const response = await apiClient.getAllReservations(options);
      
      if (response.success) {
        setReservations(response.data.data || []);
        setPagination({
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          total: response.data.pagination.total || 0,
          totalPages: response.data.pagination.totalPages || 0
        });
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

  // 页面加载时和筛选条件变化时重新加载
  createEffect(() => {
    // 只监听筛选条件、排序和当前页码的变化
    filters();
    sortBy();
    sortOrder();
    currentPage();
    
    loadReservations();
  });

  // 处理筛选条件变化
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1); // 重置到第一页
  };

  // 处理排序变化
  const handleSort = (field: 'arrivalTime' | 'guestName' | 'status') => {
    if (sortBy() === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // 重置到第一页
  };

  // 处理分页
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // 获取排序图标
  const getSortIcon = (field: string) => {
    if (sortBy() !== field) return '↕️';
    return sortOrder() === 'asc' ? '↑' : '↓';
  };

  const statusOptions = [
    { label: '全部状态', value: '' },
    { label: '待确认', value: 'Requested' },
    { label: '已确认', value: 'Approved' },
    { label: '已取消', value: 'Cancelled' },
    { label: '已完成', value: 'Completed' }
  ];

  return (
    <div class="admin-reservations-page">
      <div class="container">
        <div class="page-header">
          <h1>预订管理</h1>
          <div class="page-stats">
            <span>共 {pagination().total} 条预订</span>
          </div>
        </div>

        {/* 筛选和搜索 */}
        <div class="filters-section card">
          <div class="filters-row">
            <div class="filter-group">
              <label class="form-label">日期</label>
              <input
                type="date"
                class="form-control"
                value={filters().date}
                onInput={(e) => handleFilterChange('date', e.target.value)}
              />
            </div>

            <div class="filter-group">
              <label class="form-label">状态</label>
              <select
                class="form-control form-select"
                value={filters().status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <For each={statusOptions}>
                  {(option) => <option value={option.value}>{option.label}</option>}
                </For>
              </select>
            </div>

            <div class="filter-group">
              <label class="form-label">搜索</label>
              <input
                type="text"
                class="form-control"
                placeholder="搜索客人姓名或邮箱"
                value={filters().searchTerm}
                onInput={(e) => handleFilterChange('searchTerm', e.target.value)}
              />
            </div>

            <div class="filter-actions">
              <button 
                class="btn btn-outline"
                onClick={loadReservations}
                disabled={isLoading()}
              >
                刷新
              </button>
            </div>
          </div>
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
                <p>当前筛选条件下没有找到预订记录</p>
              </div>
            }
          >
            {/* 桌面端表格视图 */}
            <div class="reservations-table-container card desktop-only">
              <table class="table reservations-table">
                <thead>
                  <tr>
                    <th 
                      class="sortable"
                      onClick={() => handleSort('guestName')}
                    >
                      客人姓名 {getSortIcon('guestName')}
                    </th>
                    <th 
                      class="sortable"
                      onClick={() => handleSort('arrivalTime')}
                    >
                      到达时间 {getSortIcon('arrivalTime')}
                    </th>
                    <th>桌位人数</th>
                    <th>联系方式</th>
                    <th 
                      class="sortable"
                      onClick={() => handleSort('status')}
                    >
                      状态 {getSortIcon('status')}
                    </th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={reservations()}>
                    {(reservation) => (
                      <tr>
                        <td>
                          <div class="guest-info">
                            <div class="guest-name">{reservation.guestName}</div>
                            <div class="guest-email">{reservation.email}</div>
                          </div>
                        </td>
                        <td>
                          <div class="time-info">
                            <div class="date">{formatDate(reservation.arrivalTime)}</div>
                            <div class="time">{formatDateTime(reservation.arrivalTime).split(' ')[1]}</div>
                          </div>
                        </td>
                        <td>{reservation.tableSize}人</td>
                        <td>
                          <div class="contact-info">
                            <a href={formatPhoneLink(reservation.phoneNumber)} class="contact-link">
                              {reservation.phoneNumber}
                            </a>
                          </div>
                        </td>
                        <td>
                          <span class={`status-badge ${getStatusColorClass(reservation.status)}`}>
                            {formatReservationStatus(reservation.status)}
                          </span>
                        </td>
                        <td>
                          <A href={`/admin/reservations/${reservation.id}`} class="btn btn-outline btn-sm">
                            查看详情
                          </A>
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>

            {/* 移动端卡片视图 */}
            <div class="reservations-cards mobile-only">
              <For each={reservations()}>
                {(reservation) => (
                  <div class="reservation-card card">
                    <div class="card-header">
                      <div class="guest-info">
                        <h3>{reservation.guestName}</h3>
                        <p>{formatDateTime(reservation.arrivalTime)}</p>
                      </div>
                      <span class={`status-badge ${getStatusColorClass(reservation.status)}`}>
                        {formatReservationStatus(reservation.status)}
                      </span>
                    </div>

                    <div class="card-body">
                      <div class="info-row">
                        <span class="label">桌位人数:</span>
                        <span class="value">{reservation.tableSize}人</span>
                      </div>
                      <div class="info-row">
                        <span class="label">联系电话:</span>
                        <a href={formatPhoneLink(reservation.phoneNumber)} class="value contact-link">
                          {reservation.phoneNumber}
                        </a>
                      </div>
                      <div class="info-row">
                        <span class="label">邮箱地址:</span>
                        <a href={formatEmailLink(reservation.email)} class="value contact-link">
                          {reservation.email}
                        </a>
                      </div>
                    </div>

                    <div class="card-footer">
                      <A href={`/admin/reservations/${reservation.id}`} class="btn btn-primary btn-sm">
                        查看详情
                      </A>
                    </div>
                  </div>
                )}
              </For>
            </div>

            {/* 分页 */}
            <Show when={pagination().totalPages > 1}>
              <div class="pagination-container">
                <div class="pagination">
                  <button
                    class="btn btn-outline"
                    onClick={() => handlePageChange(currentPage() - 1)}
                    disabled={currentPage() <= 1}
                  >
                    上一页
                  </button>
                  
                  <span class="page-info">
                    第 {currentPage()} 页，共 {pagination().totalPages} 页
                  </span>
                  
                  <button
                    class="btn btn-outline"
                    onClick={() => handlePageChange(currentPage() + 1)}
                    disabled={currentPage() >= pagination().totalPages}
                  >
                    下一页
                  </button>
                </div>
              </div>
            </Show>
          </Show>
        </Show>
      </div>

      <style>{`
        .admin-reservations-page {
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

        .page-stats {
          color: #6c757d;
          font-size: 0.875rem;
        }

        .filters-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
        }

        .filters-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          align-items: end;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-actions {
          display: flex;
          align-items: end;
        }

        .reservations-table-container {
          overflow-x: auto;
          padding: 0;
        }

        .reservations-table {
          margin: 0;
        }

        .reservations-table th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #495057;
          white-space: nowrap;
        }

        .sortable {
          cursor: pointer;
          user-select: none;
          transition: background-color 0.2s ease;
        }

        .sortable:hover {
          background-color: #e9ecef;
        }

        .guest-info .guest-name {
          font-weight: 500;
          color: #333;
        }

        .guest-info .guest-email {
          font-size: 0.875rem;
          color: #6c757d;
        }

        .time-info .date {
          font-weight: 500;
          color: #333;
        }

        .time-info .time {
          font-size: 0.875rem;
          color: #6c757d;
        }

        .contact-link {
          color: #007bff;
          text-decoration: none;
        }

        .contact-link:hover {
          text-decoration: underline;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
        }

        /* 移动端卡片样式 */
        .reservations-cards {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .reservation-card {
          padding: 1rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .card-header .guest-info h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 0.25rem 0;
        }

        .card-header .guest-info p {
          color: #6c757d;
          font-size: 0.875rem;
          margin: 0;
        }

        .card-body {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .info-row .label {
          font-size: 0.875rem;
          color: #6c757d;
          font-weight: 500;
        }

        .info-row .value {
          color: #333;
        }

        .card-footer {
          display: flex;
          justify-content: flex-end;
        }

        /* 分页样式 */
        .pagination-container {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
        }

        .pagination {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .page-info {
          color: #6c757d;
          font-size: 0.875rem;
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
        }

        /* 响应式显示控制 */
        .desktop-only {
          display: block;
        }

        .mobile-only {
          display: none;
        }

        @media (max-width: 768px) {
          .desktop-only {
            display: none;
          }

          .mobile-only {
            display: block;
          }

          .page-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .page-header h1 {
            font-size: 1.5rem;
          }

          .filters-row {
            grid-template-columns: 1fr;
          }

          .filter-actions {
            justify-content: center;
          }

          .pagination {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminReservationListPage;