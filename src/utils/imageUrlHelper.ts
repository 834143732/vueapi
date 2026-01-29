/**
 * 图片 URL 处理工具
 * 用于处理从后端返回的图片 URL，自动添加前缀（备用方案）
 */

import { getImageBaseURL } from '../API/auth';

/**
 * 获取图片基础 URL
 * @returns 图片基础 URL，例如 http://8.159.148.91:3004
 */
export const getImageBaseUrl = (): string => {
  // First try to get from localStorage (set during login)
  const dynamicUrl = getImageBaseURL();
  if (dynamicUrl) {
    return dynamicUrl;
  }
  // Fallback for development
  return 'http://localhost:5000';
};

/**
 * 检查 URL 是否已经有前缀
 * @param url 要检查的 URL
 * @returns 如果已经有前缀则返回 true
 */
export const hasUrlPrefix = (url: string | undefined): boolean => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * 为单个 URL 添加前缀
 * @param url 原始 URL
 * @returns 添加前缀后的 URL
 */
export const addUrlPrefix = (url: string | undefined): string => {
  if (!url) return '';

  // 如果已经有前缀，直接返回
  if (hasUrlPrefix(url)) {
    return url;
  }

  // 添加前缀，处理路径开头的斜杠以避免双斜杠
  const baseUrl = getImageBaseUrl();
  const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
  return `${baseUrl}/${cleanUrl}`;
};

/**
 * 为对象中的图片字段添加 URL 前缀
 * @param obj 要处理的对象
 * @param imageFields 图片字段名称数组
 * @returns 处理后的对象
 */
export const addUrlPrefixToObject = <T extends Record<string, any>>(
  obj: T,
  imageFields: string[] = ['imgUrl', 'Image', 'image', 'imgUrl']
): T => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  // 创建对象的浅拷贝
  const result = { ...obj } as Record<string, any>;

  // 为每个图片字段添加前缀
  imageFields.forEach(field => {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = addUrlPrefix(result[field]);
    }
  });

  return result as T;
};

/**
 * 为数组中的每个对象添加 URL 前缀
 * @param arr 要处理的数组
 * @param imageFields 图片字段名称数组
 * @returns 处理后的数组
 */
export const addUrlPrefixToArray = <T extends Record<string, any>>(
  arr: T[],
  imageFields: string[] = ['imgUrl', 'Image', 'image', 'imgUrl']
): T[] => {
  if (!Array.isArray(arr)) {
    return arr;
  }

  return arr.map(item => addUrlPrefixToObject(item, imageFields));
};

/**
 * 为菜单数据添加 URL 前缀
 * 菜单表中的图片字段：imgUrl
 * @param data 菜单数据
 * @returns 处理后的数据
 */
export const addUrlPrefixToMenus = <T extends Record<string, any>>(
  data: T | T[]
): T | T[] => {
  const imageFields = ['imgUrl'];

  if (Array.isArray(data)) {
    return addUrlPrefixToArray(data, imageFields);
  } else {
    return addUrlPrefixToObject(data, imageFields);
  }
};

/**
 * 为项目/文章数据添加 URL 前缀
 * 项目表中的图片字段：imgUrl, imgUrl1, imgUrl2, imgUrl3, imgUrl4, imgUrl5, Image
 * @param data 项目数据
 * @returns 处理后的数据
 */
export const addUrlPrefixToItems = <T extends Record<string, any>>(
  data: T | T[]
): T | T[] => {
  const imageFields = ['imgUrl', 'imgUrl1', 'imgUrl2', 'imgUrl3', 'imgUrl4', 'imgUrl5', 'Image'];

  if (Array.isArray(data)) {
    return addUrlPrefixToArray(data, imageFields);
  } else {
    return addUrlPrefixToObject(data, imageFields);
  }
};

/**
 * 为分页响应数据添加 URL 前缀
 * @param response 分页响应对象，包含 data 和 pagination
 * @param prefixFn 前缀处理函数（如 addUrlPrefixToMenus）
 * @returns 处理后的响应对象
 */
export const addUrlPrefixToPaginatedResponse = <T extends Record<string, any>>(
  response: { data: T | T[]; pagination?: any },
  prefixFn: (data: T | T[]) => T | T[]
): { data: T | T[]; pagination?: any } => {
  if (!response || typeof response !== 'object') {
    return response;
  }

  const result = { ...response };

  // 处理 data 字段
  if (result.data) {
    result.data = prefixFn(result.data);
  }

  return result;
};

