import { getAPIBaseURL, getToken } from './auth';

// 获取认证头
const getAuthHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// 获取所有留言
export const getMessages = async () => {
    const url = `${getAPIBaseURL()}/messages`;
    const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Failed to fetch messages');
    }

    return response.json();
};

// 获取单条留言
export const getMessage = async (id: number) => {
    const url = `${getAPIBaseURL()}/messages/${id}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Failed to fetch message');
    }

    return response.json();
};

// 删除留言
export const deleteMessage = async (id: number) => {
    const url = `${getAPIBaseURL()}/messages/${id}`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Failed to delete message');
    }

    return response.json();
};
