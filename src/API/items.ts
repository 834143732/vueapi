import axios from './index';

// Mock data for items - aligned with database schema
const mockItems = [
  {
    ID: 1,
    MenuID: 1,
    Title: 'Company Successfully Held 2023 Annual Technology Summit',
    Content: 'Our company successfully held the annual technology summit on October 15, 2023...',
    SubTitle: 'Tech Summit 2023',
    AddTime: '2023-10-16 09:00:00',
    Model: 'news',
    Description: 'Technology experts from all over the country gathered to discuss the latest technology trends in the industry.',
    imgUrl: '/images/tech-summit.jpg',
    Reading: 1250,
    Content1: null,
    IsShow: 1,
    Sorts: 0,
    Deleted: 0,
    imgUrl1: null,
    imgUrl2: null,
    imgUrl3: null,
    imgUrl4: null,
    imgUrl5: null,
    Content2: null,
    Content3: null,
    IsRecommend: 1,
    Parameter1: null,
    Parameter2: null,
    Parameter3: null,
    Parameter4: null,
    Parameter5: null,
    Parameter6: null,
    UpdateTime: '2023-10-16 09:00:00'
  }
];

// Get all items
export const getItems = async () => {
  try {
    console.log('Attempting to fetch items from API at http://localhost:5000/items...');

    // Get the token from localStorage
    const token = localStorage.getItem('token');
    console.log('Current token for items request:', token);

    // Create headers with the token
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    console.log('Request headers for items:', headers);

    // Log the full request details for debugging
    console.log('Making request to:', axios.defaults.baseURL + '/items');

    // Make the request with explicit headers
    const response = await axios.get('/items', { headers });

    console.log('Successfully fetched items from API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching items from API:', error);
    console.log('Returning mock item data instead');
    // Return mock data if the server is not available
    return mockItems;
  }
};

// Get item by ID
export const getItemById = async (id: number) => {
  try {
    console.log(`Attempting to fetch item with ID ${id} from API...`);
    const response = await axios.get(`/items/${id}`);
    console.log(`Successfully fetched item with ID ${id} from API:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching item with ID ${id} from API:`, error);
    console.log(`Returning mock item data for ID ${id} instead`);
    // Return mock data if the server is not available
    const mockItem = mockItems.find(item => item.ID === id);
    if (mockItem) {
      return mockItem;
    } else {
      throw new Error(`Item with ID ${id} not found in mock data`);
    }
  }
};

// Get items by menu ID
export const getItemsByMenuId = async (menuId: number) => {
  try {
    console.log(`Attempting to fetch items with menu ID ${menuId} from API...`);
    const response = await axios.get(`/items/menu/${menuId}`);
    console.log(`Successfully fetched items with menu ID ${menuId} from API:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching items with menu ID ${menuId} from API:`, error);
    console.log(`Returning filtered mock items for menu ID ${menuId} instead`);
    // Return filtered mock data if the server is not available
    return mockItems.filter(item => item.MenuID === menuId);
  }
};

// Get items count
export const getItemsCount = async () => {
  try {
    console.log('Attempting to fetch items count from API...');
    const response = await axios.get('/items/count');
    console.log('Successfully fetched items count from API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching items count from API:', error);
    console.log('Returning mock items count instead');
    // Return mock count if the server is not available
    return { count: mockItems.length };
  }
};

// Create a new item
export const createItem = async (itemData: any) => {
  try {
    console.log('Attempting to create item via API:', itemData);

    // Get the token from localStorage
    const token = localStorage.getItem('token');
    console.log('Current token for item creation:', token);

    // Create headers with the token
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    console.log('Request headers for item creation:', headers);

    const response = await axios.post('/items', itemData, { headers });
    console.log('Successfully created item via API:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating item via API:', error);

    // 获取错误详情
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    const errorCode = error.response?.status || 'Unknown';

    console.error(`[CreateItem] Error details - Code: ${errorCode}, Message: ${errorMessage}`);

    // 不再使用模拟数据，直接抛出错误
    throw new Error(`Failed to create item: ${errorMessage}`);
  }
};

// Update an item
export const updateItem = async (id: number, itemData: any) => {
  try {
    console.log(`Attempting to update item with ID ${id} via API:`, itemData);

    // Get the token from localStorage
    const token = localStorage.getItem('token');
    console.log('Current token for item update:', token);

    // Create headers with the token
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    console.log('Request headers for item update:', headers);

    const response = await axios.put(`/items/${id}`, itemData, { headers });
    console.log(`Successfully updated item with ID ${id} via API:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating item with ID ${id} via API:`, error);

    // 获取错误详情
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    const errorCode = error.response?.status || 'Unknown';

    console.error(`[UpdateItem] Error details - Code: ${errorCode}, Message: ${errorMessage}`);

    // 不再使用模拟数据，直接抛出错误
    throw new Error(`Failed to update item: ${errorMessage}`);
  }
};

// Delete an item
export const deleteItem = async (id: number) => {
  try {
    console.log(`Attempting to delete item with ID ${id} via API...`);

    // Get the token from localStorage
    const token = localStorage.getItem('token');
    console.log('Current token for item deletion:', token);

    // Create headers with the token
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    console.log('Request headers for item deletion:', headers);

    const response = await axios.delete(`/items/${id}`, { headers });
    console.log(`Successfully deleted item with ID ${id} via API:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error deleting item with ID ${id} via API:`, error);
    console.log(`Simulating item deletion with mock data for ID ${id}`);
    // Simulate item deletion if the server is not available
    const itemIndex = mockItems.findIndex(item => item.ID === id);
    if (itemIndex !== -1) {
      // Instead of actually deleting, mark as deleted (soft delete)
      const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      mockItems[itemIndex] = {
        ...mockItems[itemIndex],
        Deleted: 1,
        UpdateTime: currentTime
      };
      return { success: true, message: 'Item deleted successfully', data: mockItems[itemIndex] };
    } else {
      throw new Error(`Item with ID ${id} not found in mock data`);
    }
  }
};
