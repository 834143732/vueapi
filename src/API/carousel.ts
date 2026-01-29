import axios from './index';

// ==================== 轮播图分类 API ====================

// 获取所有轮播图分类
export const getCarouselCategories = async () => {
  try {
    console.log('Attempting to fetch carousel categories from API...');
    const response = await axios.get('/carousel-categories');
    console.log('Successfully fetched carousel categories:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching carousel categories:', error);
    throw error;
  }
};

// 获取轮播图分类详情
export const getCarouselCategoryById = async (id: number) => {
  try {
    console.log(`Attempting to fetch carousel category with ID ${id}...`);
    const response = await axios.get(`/carousel-categories/${id}`);
    console.log(`Successfully fetched carousel category with ID ${id}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching carousel category with ID ${id}:`, error);
    throw error;
  }
};

// 创建轮播图分类
export const createCarouselCategory = async (categoryData: any) => {
  try {
    console.log('Attempting to create carousel category:', categoryData);
    const response = await axios.post('/carousel-categories', categoryData);
    console.log('Successfully created carousel category:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating carousel category:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    throw new Error(`Failed to create carousel category: ${errorMessage}`);
  }
};

// 更新轮播图分类
export const updateCarouselCategory = async (id: number, categoryData: any) => {
  try {
    console.log(`Attempting to update carousel category with ID ${id}:`, categoryData);
    const response = await axios.put(`/carousel-categories/${id}`, categoryData);
    console.log(`Successfully updated carousel category with ID ${id}:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating carousel category with ID ${id}:`, error);
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    throw new Error(`Failed to update carousel category: ${errorMessage}`);
  }
};

// 删除轮播图分类
export const deleteCarouselCategory = async (id: number) => {
  try {
    console.log(`Attempting to delete carousel category with ID ${id}...`);
    const response = await axios.delete(`/carousel-categories/${id}`);
    console.log(`Successfully deleted carousel category with ID ${id}:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error deleting carousel category with ID ${id}:`, error);
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    throw new Error(`Failed to delete carousel category: ${errorMessage}`);
  }
};

// ==================== 轮播图详情 API ====================

// 获取所有轮播图
export const getCarouselItems = async () => {
  try {
    console.log('Attempting to fetch carousel items from API...');
    const response = await axios.get('/carousel-items');
    console.log('Successfully fetched carousel items:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching carousel items:', error);
    throw error;
  }
};

// 获取指定分类的轮播图
export const getCarouselItemsByCategory = async (categoryId: number) => {
  try {
    console.log(`Attempting to fetch carousel items for category ${categoryId}...`);
    const response = await axios.get(`/carousel-items/category/${categoryId}`);
    console.log(`Successfully fetched carousel items for category ${categoryId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching carousel items for category ${categoryId}:`, error);
    throw error;
  }
};

// 获取轮播图详情
export const getCarouselItemById = async (id: number) => {
  try {
    console.log(`Attempting to fetch carousel item with ID ${id}...`);
    const response = await axios.get(`/carousel-items/${id}`);
    console.log(`Successfully fetched carousel item with ID ${id}:`, response.data);
    const data = Array.isArray(response.data) ? response.data[0] : response.data;
    return data;
  } catch (error) {
    console.error(`Error fetching carousel item with ID ${id}:`, error);
    throw error;
  }
};

// 创建轮播图
export const createCarouselItem = async (itemData: any) => {
  try {
    console.log('Attempting to create carousel item:', itemData);

    // Get the token from localStorage
    const token = localStorage.getItem('token');
    console.log('Current token for carousel item creation:', token);

    // Create headers with the token
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    console.log('Request headers for carousel item creation:', headers);

    const response = await axios.post('/carousel-items', itemData, { headers });
    console.log('Successfully created carousel item:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating carousel item:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    throw new Error(`Failed to create carousel item: ${errorMessage}`);
  }
};

// 更新轮播图
export const updateCarouselItem = async (id: number, itemData: any) => {
  try {
    console.log(`Attempting to update carousel item with ID ${id}:`, itemData);

    // Get the token from localStorage
    const token = localStorage.getItem('token');
    console.log('Current token for carousel item update:', token);

    // Create headers with the token
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    console.log('Request headers for carousel item update:', headers);

    const response = await axios.put(`/carousel-items/${id}`, itemData, { headers });
    console.log(`Successfully updated carousel item with ID ${id}:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating carousel item with ID ${id}:`, error);
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    throw new Error(`Failed to update carousel item: ${errorMessage}`);
  }
};

// 删除轮播图
export const deleteCarouselItem = async (id: number) => {
  try {
    console.log(`Attempting to delete carousel item with ID ${id}...`);

    // Get the token from localStorage
    const token = localStorage.getItem('token');
    console.log('Current token for carousel item deletion:', token);

    // Create headers with the token
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    console.log('Request headers for carousel item deletion:', headers);

    const response = await axios.delete(`/carousel-items/${id}`, { headers });
    console.log(`Successfully deleted carousel item with ID ${id}:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error deleting carousel item with ID ${id}:`, error);
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    throw new Error(`Failed to delete carousel item: ${errorMessage}`);
  }
};

