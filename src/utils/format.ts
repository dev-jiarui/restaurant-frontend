// 格式化工具函数

// 格式化日期时间
export function formatDateTime(dateString: string): string {
  try {
    let date: Date;
    
    // 检查是否是时间戳字符串（纯数字字符串）
    if (/^\d+$/.test(dateString)) {
      // 时间戳字符串，转换为数字后创建Date对象
      date = new Date(parseInt(dateString));
    } else {
      // ISO字符串或其他格式，直接创建Date对象
      date = new Date(dateString);
    }
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString);
      return '无效日期';
    }
    
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return '日期格式错误';
  }
}

// 格式化日期
export function formatDate(dateString: string): string {
  try {
    let date: Date;
    
    // 检查是否是时间戳字符串（纯数字字符串）
    if (/^\d+$/.test(dateString)) {
      date = new Date(parseInt(dateString));
    } else {
      date = new Date(dateString);
    }
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString);
      return '无效日期';
    }
    
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return '日期格式错误';
  }
}

// 格式化时间
export function formatTime(dateString: string): string {
  try {
    let date: Date;
    
    // 检查是否是时间戳字符串（纯数字字符串）
    if (/^\d+$/.test(dateString)) {
      date = new Date(parseInt(dateString));
    } else {
      date = new Date(dateString);
    }
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString);
      return '无效时间';
    }
    
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting time:', error, dateString);
    return '时间格式错误';
  }
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
export function formatPhoneLink(phone: string | undefined | null): string {
  if (!phone || typeof phone !== 'string') {
    console.warn('Invalid phone number for formatPhoneLink:', phone);
    return '#'; // 返回无效链接
  }
  return `tel:${phone.replace(/\s+/g, '')}`;
}

// 格式化邮箱链接
export function formatEmailLink(email: string | undefined | null): string {
  if (!email || typeof email !== 'string') {
    console.warn('Invalid email for formatEmailLink:', email);
    return '#'; // 返回无效链接
  }
  return `mailto:${email}`;
}

// 生成datetime-local输入框的默认值
export function getDefaultDateTime(): string {
  const now = new Date();
  // 设置为1小时后
  now.setHours(now.getHours() + 1);
  // 格式化为datetime-local格式（本地时间）
  return formatDateTimeForInput(now.toISOString());
}

// 将ISO日期字符串转换为datetime-local输入框格式（本地时间）
export function formatDateTimeForInput(dateString: string): string {
  try {
    let date: Date;
    
    // 检查是否是时间戳字符串（纯数字字符串）
    if (/^\d+$/.test(dateString)) {
      date = new Date(parseInt(dateString));
    } else {
      date = new Date(dateString);
    }
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.error('Invalid date string for input:', dateString);
      return '';
    }
    
    // 获取本地时间的年、月、日、时、分
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    // 返回datetime-local格式：YYYY-MM-DDTHH:MM
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting date for input:', error, dateString);
    return '';
  }
}

// 检查日期是否为今天
export function isToday(dateString: string): boolean {
  try {
    let date: Date;
    
    // 检查是否是时间戳字符串（纯数字字符串）
    if (/^\d+$/.test(dateString)) {
      date = new Date(parseInt(dateString));
    } else {
      date = new Date(dateString);
    }
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString);
      return false;
    }
    
    const today = new Date();
    return date.toDateString() === today.toDateString();
  } catch (error) {
    console.error('Error checking if date is today:', error, dateString);
    return false;
  }
}

// 检查预订是否可以编辑
export function canEditReservation(status: string): boolean {
  return status === 'Requested' || status === 'Approved';
}

// 检查预订是否可以取消
export function canCancelReservation(status: string): boolean {
  return status === 'Requested' || status === 'Approved';
}