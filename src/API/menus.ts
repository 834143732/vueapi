import axios from './index';

// Mock data for menus - aligned with database schema
const mockMenus = [
  {
    ID: 1,
    Title: 'Company News',
    SubTitle: 'NEWS',
    Content: '<p>Company related news and announcements</p>',
    Level: 1,
    MenuID: 0,
    Sorts: 0,
    imgUrl: null,
    Description: 'Company related news and announcements'
  }
];

// Get all menus
export const getMenus = async () => {
  try {
    console.log('Attempting to fetch menus from API at http://localhost:5000/menus...');

    // Get the token from localStorage
    const token = localStorage.getItem('token');
    console.log('Current token for menus request:', token);

    // Create headers with the token
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    console.log('Request headers for menus:', headers);

    // Log the full request details for debugging
    console.log('Making request to:', axios.defaults.baseURL + '/menus');

    // Make the request with explicit headers
    const response = await axios.get('/menus', { headers });

    console.log('Successfully fetched menus from API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching menus from API:', error);
    console.log('Returning mock menu data instead');
    // Return mock data if the server is not available
    return mockMenus;
  }
};

// Get menu by ID
export const getMenuById = async (id: number) => {
  try {
    console.log(`Attempting to fetch menu with ID ${id} from API...`);
    const response = await axios.get(`/menus/${id}`);
    console.log(`Successfully fetched menu with ID ${id} from API:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching menu with ID ${id} from API:`, error);
    console.log(`Returning mock menu data for ID ${id} instead`);
    // Return mock data if the server is not available
    const mockMenu = mockMenus.find(menu => menu.ID === id);
    if (mockMenu) {
      return mockMenu;
    } else {
      throw new Error(`Menu with ID ${id} not found in mock data`);
    }
  }
};

// Get menus by menu ID
export const getMenusByMenuId = async (menuId: number) => {
  try {
    console.log(`Attempting to fetch menus with menu ID ${menuId} from API...`);
    const response = await axios.get(`/menus/menu/${menuId}`);
    console.log(`Successfully fetched menus with menu ID ${menuId} from API:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching menus with menu ID ${menuId} from API:`, error);
    console.log(`Returning empty array for menu ID ${menuId} instead`);
    // Return empty array if the server is not available
    return [];
  }
};

// Get menus count
export const getMenusCount = async () => {
  try {
    console.log('Attempting to fetch menus count from API...');
    const response = await axios.get('/menus/count');
    console.log('Successfully fetched menus count from API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching menus count from API:', error);
    console.log('Returning mock menus count instead');
    // Return mock count if the server is not available
    return { count: mockMenus.length };
  }
};

// Create a new menu
export const createMenu = async (menuData: { Title: string; SubTitle?: string; Content?: string; Description?: string; Level?: number; MenuID?: number }) => {
  try {
    console.log('Attempting to create menu via API:', menuData);
    const response = await axios.post('/menus', menuData);
    console.log('Successfully created menu via API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating menu via API:', error);
    console.log('Simulating menu creation with mock data');
    // Simulate menu creation if the server is not available
    const newId = Math.max(...mockMenus.map(menu => menu.ID)) + 1;
    const newMenu = {
      ID: newId,
      Title: menuData.Title,
      SubTitle: menuData.SubTitle || '',
      Content: menuData.Content || `<p>${menuData.Description || ''}</p>`,
      Level: menuData.Level || 1,
      MenuID: menuData.MenuID || 0,
      Sorts: mockMenus.length,
      imgUrl: null,
      Description: menuData.Description || ''
    };
    mockMenus.push(newMenu);
    return newMenu;
  }
};

// Update a menu
export const updateMenu = async (id: number, menuData: { Title?: string; SubTitle?: string; Content?: string; Description?: string; Level?: number; Sorts?: number }) => {
  try {
    console.log(`Attempting to update menu with ID ${id} via API:`, menuData);
    const response = await axios.put(`/menus/${id}`, menuData);
    console.log(`Successfully updated menu with ID ${id} via API:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating menu with ID ${id} via API:`, error);
    console.log(`Simulating menu update with mock data for ID ${id}`);
    // Simulate menu update if the server is not available
    const menuIndex = mockMenus.findIndex(menu => menu.ID === id);
    if (menuIndex !== -1) {
      mockMenus[menuIndex] = {
        ...mockMenus[menuIndex],
        Title: menuData.Title || mockMenus[menuIndex].Title,
        SubTitle: menuData.SubTitle || mockMenus[menuIndex].SubTitle,
        Content: menuData.Content || mockMenus[menuIndex].Content,
        Description: menuData.Description || mockMenus[menuIndex].Description,
        Level: menuData.Level !== undefined ? menuData.Level : mockMenus[menuIndex].Level,
        Sorts: menuData.Sorts !== undefined ? menuData.Sorts : mockMenus[menuIndex].Sorts
      };
      return mockMenus[menuIndex];
    } else {
      throw new Error(`Menu with ID ${id} not found in mock data`);
    }
  }
};

// Delete a menu
export const deleteMenu = async (id: number) => {
  try {
    console.log(`Attempting to delete menu with ID ${id} via API...`);
    const response = await axios.delete(`/menus/${id}`);
    console.log(`Successfully deleted menu with ID ${id} via API:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error deleting menu with ID ${id} via API:`, error);
    console.log(`Simulating menu deletion with mock data for ID ${id}`);
    // Simulate menu deletion if the server is not available
    const menuIndex = mockMenus.findIndex(menu => menu.ID === id);
    if (menuIndex !== -1) {
      const deletedMenu = mockMenus[menuIndex];
      mockMenus.splice(menuIndex, 1);
      return { success: true, message: 'Menu deleted successfully', data: deletedMenu };
    } else {
      throw new Error(`Menu with ID ${id} not found in mock data`);
    }
  }
};
