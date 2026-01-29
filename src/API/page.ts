import axios from './index';

// Mock data for pages
const mockPages = [
  {
    id: 1,
    title: '关于我们',
    slug: 'about',
    content: '<h1>关于我们</h1><p>我们是一家专业的技术公司，致力于为客户提供优质的产品和服务。</p><h2>我们的使命</h2><p>通过技术创新，为客户创造价值，推动行业发展。</p><h2>我们的愿景</h2><p>成为行业领先的技术服务提供商。</p><h2>我们的价值观</h2><ul><li>诚信：以诚待人，以信立业</li><li>创新：持续创新，追求卓越</li><li>合作：团队协作，共创未来</li><li>责任：承担责任，回馈社会</li></ul>',
    status: 1,
    sort: 0,
    createTime: '2023-01-15 10:30:00',
    updateTime: '2023-01-15 10:30:00'
  },
  {
    id: 2,
    title: '联系方式',
    slug: 'contact',
    content: '<h1>联系我们</h1><p>如果您有任何问题或建议，请随时与我们联系。</p><h2>联系信息</h2><ul><li><strong>电话：</strong>400-123-4567</li><li><strong>邮箱：</strong>contact@example.com</li><li><strong>地址：</strong>北京市朝阳区xxx街道xxx号</li><li><strong>邮编：</strong>100000</li></ul><h2>工作时间</h2><p>周一至周五：9:00 - 18:00<br>周六至周日：10:00 - 16:00</p><h2>在线客服</h2><p>您也可以通过我们的在线客服系统获得即时帮助。</p>',
    status: 1,
    sort: 1,
    createTime: '2023-01-16 14:20:00',
    updateTime: '2023-01-16 14:20:00'
  },
  {
    id: 3,
    title: '服务条款',
    slug: 'terms',
    content: '<h1>服务条款</h1><p>欢迎使用我们的服务。请仔细阅读以下条款。</p><h2>服务说明</h2><p>我们提供的服务包括但不限于：</p><ul><li>技术咨询服务</li><li>软件开发服务</li><li>系统维护服务</li><li>培训服务</li></ul><h2>用户责任</h2><p>用户在使用我们的服务时，应当：</p><ul><li>遵守相关法律法规</li><li>不得恶意攻击系统</li><li>保护账户安全</li><li>及时更新联系信息</li></ul><h2>免责声明</h2><p>在法律允许的范围内，我们不对因使用本服务而产生的任何直接或间接损失承担责任。</p>',
    status: 1,
    sort: 2,
    createTime: '2023-01-18 09:15:00',
    updateTime: '2023-01-18 09:15:00'
  },
  {
    id: 4,
    title: '隐私政策',
    slug: 'privacy',
    content: '<h1>隐私政策</h1><p>我们非常重视您的隐私保护。</p><h2>信息收集</h2><p>我们可能收集的信息包括：</p><ul><li>个人身份信息（姓名、邮箱、电话等）</li><li>使用信息（访问时间、页面浏览记录等）</li><li>设备信息（IP地址、浏览器类型等）</li></ul><h2>信息使用</h2><p>我们收集的信息将用于：</p><ul><li>提供和改进服务</li><li>与您沟通</li><li>发送重要通知</li><li>进行数据分析</li></ul><h2>信息保护</h2><p>我们采取适当的安全措施来保护您的个人信息，防止未经授权的访问、使用或披露。</p><h2>信息共享</h2><p>除非获得您的明确同意或法律要求，我们不会与第三方共享您的个人信息。</p>',
    status: 1,
    sort: 3,
    createTime: '2023-01-20 16:45:00',
    updateTime: '2023-01-20 16:45:00'
  }
];

// Get all pages
export const getPages = async () => {
  try {
    console.log('Attempting to fetch pages from API at http://localhost:5000/pages...');
    const response = await axios.get('/pages');
    console.log('Successfully fetched pages from API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching pages from API:', error);
    console.log('Returning mock page data instead');
    // Return mock data if the server is not available
    return mockPages;
  }
};

// Get page by ID
export const getPageById = async (id: number) => {
  try {
    console.log(`Attempting to fetch page with ID ${id} from API...`);
    const response = await axios.get(`/pages/${id}`);
    console.log(`Successfully fetched page with ID ${id} from API:`, response.data);

    // 后端返回的是数组，需要取第一个元素
    const data = Array.isArray(response.data) ? response.data[0] : response.data;
    return data;
  } catch (error) {
    console.error(`Error fetching page with ID ${id} from API:`, error);
    console.log(`Returning mock page data for ID ${id} instead`);
    // Return mock data if the server is not available
    const mockPage = mockPages.find(page => page.id === id);
    if (mockPage) {
      return mockPage;
    } else {
      throw new Error(`Page with ID ${id} not found in mock data`);
    }
  }
};

// Get page by slug
export const getPageBySlug = async (slug: string) => {
  try {
    console.log(`Attempting to fetch page with slug ${slug} from API...`);
    const response = await axios.get(`/pages/slug/${slug}`);
    console.log(`Successfully fetched page with slug ${slug} from API:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching page with slug ${slug} from API:`, error);
    console.log(`Returning mock page data for slug ${slug} instead`);
    // Return mock data if the server is not available
    const mockPage = mockPages.find(page => page.slug === slug);
    if (mockPage) {
      return mockPage;
    } else {
      throw new Error(`Page with slug ${slug} not found in mock data`);
    }
  }
};

// Get pages count
export const getPagesCount = async () => {
  try {
    console.log('Attempting to fetch pages count from API...');
    const response = await axios.get('/pages/count');
    console.log('Successfully fetched pages count from API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching pages count from API:', error);
    console.log('Returning mock pages count instead');
    // Return mock data if the server is not available
    return { count: mockPages.length };
  }
};

// Create a new page
export const createPage = async (pageData: any) => {
  try {
    console.log('Attempting to create page via API:', pageData);
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post('/pages', pageData, { headers });
    console.log('Successfully created page via API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating page via API:', error);
    console.log('Simulating page creation with mock data');
    // Simulate page creation if the server is not available
    const newId = Math.max(...mockPages.map(page => page.id)) + 1;
    const newPage = {
      id: newId,
      title: pageData.title,
      slug: pageData.slug,
      content: pageData.content || '',
      status: pageData.status || 1,
      sort: pageData.sort || mockPages.length,
      createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updateTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    mockPages.push(newPage);
    return newPage;
  }
};

// Update a page
export const updatePage = async (id: number, pageData: any) => {
  try {
    console.log(`Attempting to update page with ID ${id} via API:`, pageData);
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.put(`/pages/${id}`, pageData, { headers });
    console.log(`Successfully updated page with ID ${id} via API:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating page with ID ${id} via API:`, error);
    console.log(`Simulating page update with mock data for ID ${id}`);
    // Simulate page update if the server is not available
    const pageIndex = mockPages.findIndex(page => page.id === id);
    if (pageIndex !== -1) {
      mockPages[pageIndex] = {
        ...mockPages[pageIndex],
        ...pageData,
        updateTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };
      return mockPages[pageIndex];
    } else {
      throw new Error(`Page with ID ${id} not found in mock data`);
    }
  }
};

// Delete a page
export const deletePage = async (id: number) => {
  try {
    console.log(`Attempting to delete page with ID ${id} via API...`);
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.delete(`/pages/${id}`, { headers });
    console.log(`Successfully deleted page with ID ${id} via API:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error deleting page with ID ${id} via API:`, error);
    console.log(`Simulating page deletion with mock data for ID ${id}`);
    // Simulate page deletion if the server is not available
    const pageIndex = mockPages.findIndex(page => page.id === id);
    if (pageIndex !== -1) {
      const deletedPage = mockPages[pageIndex];
      mockPages.splice(pageIndex, 1);
      return { success: true, message: 'Page deleted successfully', data: deletedPage };
    } else {
      throw new Error(`Page with ID ${id} not found in mock data`);
    }
  }
};

// Update page status
export const updatePageStatus = async (id: number, status: number) => {
  try {
    console.log(`Attempting to update page status with ID ${id} via API:`, { status });
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.patch(`/pages/${id}/status`, { status }, { headers });
    console.log(`Successfully updated page status with ID ${id} via API:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating page status with ID ${id} via API:`, error);
    console.log(`Simulating page status update with mock data for ID ${id}`);
    // Simulate page status update if the server is not available
    const pageIndex = mockPages.findIndex(page => page.id === id);
    if (pageIndex !== -1) {
      mockPages[pageIndex].status = status;
      mockPages[pageIndex].updateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      return mockPages[pageIndex];
    } else {
      throw new Error(`Page with ID ${id} not found in mock data`);
    }
  }
};

// Export mock data for testing
export { mockPages };
