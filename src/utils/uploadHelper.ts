import { getToken, getAPIBaseURL } from '../API/auth';
import { getUploadConfig } from '../config/uploadConfig';

/**
 * 获取 API URL，优先从 localStorage 获取
 */
const getApiUrl = (): string => {
    return getAPIBaseURL() || 'http://localhost:5000';
};

/**
 * 上传文件到本地服务器（通用函数）
 * @param file 文件对象
 * @param uploadType 上传类型：'thumbnail' 或 'content'
 * @returns 上传后的文件URL
 */
const uploadToLocalServerInternal = async (file: File, uploadType: string = 'thumbnail'): Promise<string> => {
    try {
        console.log(`[Local] Starting upload to local server (type: ${uploadType})...`);

        // 获取认证token
        const token = getToken();
        if (!token) {
            console.error('[Local] No authentication token found');
            return '';
        }

        // 创建FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('uploadType', uploadType);

        // 获取API URL - 使用 /upload-local 端点（直接本地上传）
        const apiUrl = getApiUrl();
        const uploadUrl = `${apiUrl}/upload-local`;

        console.log('[Local] Uploading to:', uploadUrl);

        // 上传文件
        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Upload failed with status ${response.status}`);
        }

        const result = await response.json();

        if (result.code === 200 && result.data && result.data.url) {
            console.log('[Local] File uploaded successfully:', result.data);
            const fileUrl = result.data.url;
            console.log('[Local] File URL:', fileUrl);
            return fileUrl;
        } else {
            console.error('[Local] Upload failed:', result.message);
            return '';
        }
    } catch (error) {
        console.error('[Local] Error uploading to local server:', error);
        return '';
    }
};

/**
 * 上传文件到本地服务器
 * @param file 文件对象
 * @param folder 文件夹路径（可选，已弃用）
 * @returns 上传后的文件URL
 */
export const uploadToLocalServer = async (file: File, folder: string = 'thumbnail'): Promise<string> => {
    return uploadToLocalServerInternal(file, 'thumbnail');
};


/**
 * 缩略图上传函数 - 上传到 thumbnail 文件夹
 * @param file 文件对象
 * @returns 上传后的文件URL
 */
export const uploadThumbnail = async (file: File): Promise<string> => {
    console.log('[Thumbnail] Starting thumbnail upload...');
    return await uploadToLocalServerInternal(file, 'thumbnail');
};

/**
 * 编辑器内容图片上传函数 - 上传到 content/YYYYMMDD 文件夹
 * @param file 文件对象
 * @returns 上传后的文件URL
 */
export const uploadContent = async (file: File): Promise<string> => {
    console.log('[Content] Starting content upload...');
    return await uploadToLocalServerInternal(file, 'content');
};

/**
 * 统一上传函数 - 直接上传到本地
 * @param file 文件对象
 * @param folder 文件夹路径（已弃用，使用 uploadThumbnail 或 uploadContent）
 * @returns 上传后的文件URL
 */
export const uploadFile = async (file: File, folder: string = 'thumbnail'): Promise<string> => {
    console.log('[Upload] Starting file upload...');

    // 直接使用本地上传
    return await uploadToLocalServer(file, folder);
};

/**
 * 为wangeditor编辑器配置上传
 * 编辑器图片和视频上传到 content 文件夹（按日期分类）
 * @returns 编辑器配置对象
 */
export const getEditorUploadConfig = () => {
    const config = getUploadConfig();

    return {
        placeholder: '请输入内容...',
        MENU_CONF: {
            uploadImage: {
                // 自定义上传函数 - 上传到 content 文件夹
                customUpload: async (file: File, insertFn: (url: string) => void) => {
                    try {
                        console.log('[Editor] Image upload started');
                        const url = await uploadContent(file);
                        if (url) {
                            console.log('[Editor] Inserting image URL:', url);
                            insertFn(url);
                        } else {
                            console.error('[Editor] Failed to get image URL');
                        }
                    } catch (error) {
                        console.error('[Editor] Image upload failed:', error);
                    }
                },
                fieldName: 'file',
            },
            uploadVideo: {
                // 自定义视频上传函数 - 上传到 content 文件夹
                customUpload: async (file: File, insertFn: (url: string) => void) => {
                    try {
                        console.log('[Editor] Video upload started');
                        const url = await uploadContent(file);
                        if (url) {
                            console.log('[Editor] Inserting video URL:', url);
                            insertFn(url);
                        } else {
                            console.error('[Editor] Failed to get video URL');
                        }
                    } catch (error) {
                        console.error('[Editor] Video upload failed:', error);
                    }
                },
                fieldName: 'file',
            }
        }
    };
};
