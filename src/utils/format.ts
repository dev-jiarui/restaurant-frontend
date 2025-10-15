// 格式化工具函数

// 格式化日期时间
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 格式化日期
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// 格式化时间
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 格式化预订状态
export function formatReservationStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'Requested': '待确认',
    'Approved': '已确认',
    'Cancelled': '已取消',
    'Completed': '已完成',
  };
  return statusMap[status] || status;
}

// 获取状态颜色类名
export function getStatusColorClass(status: string): string {
  const colorMap: Record<string, string> = {
    'Requested': 'status-requested',
    'Approved': 'status-approved',
    'Cancelled': 'status-cancelled',
    'Completed': 'status-completed',
  };
  return colorMap[status] || 'status-default';
}

// 格式化电话号码（添加可点击链接）
export function formatPhoneLink(phone: string): string {
  return `tel:${phone.replace(/\s+/g, '')}`;
}

// 格式化邮箱链接
export function formatEmailLink(email: string): string {
  return `mailto:${email}`;
}

// 生成datetime-local输入框的默认值
export function getDefaultDateTime(): string {
  const now = new Date();
  // 设置为1小时后
  now.setHours(now.getHours() + 1);
  // 格式化为datetime-local格式
  return now.toISOString().slice(0, 16);
}

// 检查日期是否为今天
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

// 检查预订是否可以编辑
export function canEditReservation(status: string): boolean {
  return status === 'Requested' || status === 'Approved';
}

// 检查预订是否可以取消
export function canCancelReservation(status: string): boolean {
  return status === 'Requested' || status === 'Approved';
}