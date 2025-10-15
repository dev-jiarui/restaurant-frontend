// 表单验证工具函数

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

// 验证单个字段
export function validateField(value: any, rules: ValidationRule): string | null {
  // 必填验证
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return '此字段为必填项';
  }

  // 如果值为空且不是必填，则跳过其他验证
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  const stringValue = String(value);

  // 最小长度验证
  if (rules.minLength && stringValue.length < rules.minLength) {
    return `最少需要${rules.minLength}个字符`;
  }

  // 最大长度验证
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return `最多允许${rules.maxLength}个字符`;
  }

  // 正则表达式验证
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return '格式不正确';
  }

  // 自定义验证
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
}

// 验证整个表单
export function validateForm(data: Record<string, any>, rules: ValidationRules): ValidationErrors {
  const errors: ValidationErrors = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const error = validateField(data[field], fieldRules);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}

// 常用验证规则
export const commonRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return '请输入有效的邮箱地址';
      }
      return null;
    }
  },
  
  password: {
    required: true,
    minLength: 6,
    custom: (value: string) => {
      if (value && value.length < 6) {
        return '密码长度至少6位';
      }
      return null;
    }
  },
  
  phone: {
    required: true,
    pattern: /^1[3-9]\d{9}$/,
    custom: (value: string) => {
      if (value && !/^1[3-9]\d{9}$/.test(value)) {
        return '请输入有效的手机号码';
      }
      return null;
    }
  },
  
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    custom: (value: string) => {
      if (value && value.trim().length < 2) {
        return '姓名至少需要2个字符';
      }
      return null;
    }
  },
  
  tableSize: {
    required: true,
    custom: (value: number) => {
      const num = Number(value);
      if (!num || num < 1 || num > 20) {
        return '桌位人数必须在1-20之间';
      }
      return null;
    }
  },
  
  arrivalTime: {
    required: true,
    custom: (value: string) => {
      if (!value) return '请选择到达时间';
      
      const selectedTime = new Date(value);
      const now = new Date();
      
      if (selectedTime <= now) {
        return '到达时间必须晚于当前时间';
      }
      
      // 检查是否在营业时间内 (假设营业时间为10:00-22:00)
      const hours = selectedTime.getHours();
      if (hours < 10 || hours >= 22) {
        return '请选择营业时间内的时间 (10:00-22:00)';
      }
      
      return null;
    }
  }
};

// 预订表单验证规则
export const reservationValidationRules: ValidationRules = {
  guestName: commonRules.name,
  email: commonRules.email,
  phoneNumber: commonRules.phone,
  arrivalTime: commonRules.arrivalTime,
  tableSize: commonRules.tableSize,
};

// 用户名或邮箱验证规则
const usernameOrEmail = {
  required: true,
  custom: (value: string) => {
    if (!value || value.trim() === '') {
      return '请输入用户名或邮箱地址';
    }
    
    // 如果包含@符号，验证邮箱格式
    if (value.includes('@')) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return '请输入有效的邮箱地址';
      }
    } else {
      // 验证用户名格式（至少2个字符）
      if (value.trim().length < 2) {
        return '用户名至少需要2个字符';
      }
    }
    
    return null;
  }
};

// 登录表单验证规则
export const loginValidationRules: ValidationRules = {
  email: usernameOrEmail,
  password: commonRules.password,
};