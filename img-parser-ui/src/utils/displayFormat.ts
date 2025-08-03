// src/utils/displayFormat.ts

/**
 * 格式化 metadata 为 JSON 字符串（带缩进）
 */
export function formatMetadata(obj: Record<string, any>): string {
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}

/**
 * 小数点截断（默认保留两位）
 */
export function formatNumber(value: number, digits = 2): string {
  return typeof value === 'number' ? value.toFixed(digits) : String(value)
}
