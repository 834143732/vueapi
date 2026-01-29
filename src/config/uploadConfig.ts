/**
 * 上传配置文件
 * 本地上传到 imagefile 文件夹
 */

import { getAPIBaseURL } from '../API/auth';

export interface UploadConfig {
  // 本地上传配置
  local: {
    // 本地上传的端点
    endpoint: string;
    // 本地文件夹路径
    folder: string;
  };
}

/**
 * 获取默认上传配置
 * 动态获取 API URL
 */
const getDefaultUploadConfig = (): UploadConfig => ({
  // 本地上传配置
  local: {
    // 本地上传的端点（从 localStorage 动态获取）
    endpoint: getAPIBaseURL() || 'http://localhost:5000',
    // 本地文件夹路径
    folder: 'imagefile',
  },
});

/**
 * 获取当前上传配置
 * @returns 上传配置对象
 */
export const getUploadConfig = (): UploadConfig => {
  return getDefaultUploadConfig();
};

