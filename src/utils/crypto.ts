// 密码加密工具函数

/**
 * 使用SHA-256对密码进行哈希加密
 * @param password 原始密码
 * @returns 加密后的密码哈希值
 */
export async function hashPassword(password: string): Promise<string> {
  // 将密码转换为ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // 使用Web Crypto API进行SHA-256哈希
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // 将ArrayBuffer转换为十六进制字符串
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * 使用Base64编码密码（简单编码，不是加密）
 * @param password 原始密码
 * @returns Base64编码后的密码
 */
export function encodePassword(password: string): string {
  return btoa(password);
}

/**
 * 生成随机盐值
 * @param length 盐值长度
 * @returns 随机盐值
 */
export function generateSalt(length: number = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * 使用盐值对密码进行哈希加密
 * @param password 原始密码
 * @param salt 盐值
 * @returns 加密后的密码哈希值
 */
export async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  const saltedPassword = password + salt;
  return await hashPassword(saltedPassword);
}