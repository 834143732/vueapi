<template>
  <div class="list-page-container">
    <el-card class="list-card">
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item>
            <template #label>
              <span class="label-with-icon">
                <el-icon color="#409EFF"><Document /></el-icon>
                <span>标题</span>
              </span>
            </template>
            <el-input
              v-model="searchForm.title"
              placeholder="输入标题"
              clearable
              @input="handleTitleInput"
            />
          </el-form-item>
          <el-form-item>
            <template #label>
              <span class="label-with-icon">
                <el-icon color="#409EFF"><Folder /></el-icon>
                <span>分类</span>
              </span>
            </template>
            <el-select v-model="searchForm.categoryId" placeholder="请选择" clearable @change="handleCategoryChange" style="width: 180px;">
              <el-option
                v-for="item in categoryOptions"
                :key="item.id"
                :label="item.displayName || item.name"
                :value="item.id"
                :class="`category-depth-${item.depth || 0}`"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button @click="handleAddNews" type="success">+ 新增品项</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-container">
        <el-table
          :data="newsList"
          style="width: 100%"
          border
          v-loading="loading"
          :header-cell-style="{backgroundColor: '#f5f7fa', color: '#606266'}"
          :row-class-name="tableRowClassName"
        >
          <el-table-column label="封面图片" width="120">
            <template #default="scope">
              <el-image
                style="width: 80px; height: 45px; border-radius: 4px;"
                :src="scope.row.imgUrl"
                fit="cover"
                :preview-src-list="[scope.row.imgUrl]"
                preview-teleported
                hide-on-click-modal
              >
                <template #error>
                  <div class="image-placeholder">
                    <i class="el-icon-picture-outline"></i>
                  </div>
                </template>
              </el-image>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
          <el-table-column prop="categoryName" label="分类" width="120" />
          <el-table-column prop="publishTime" label="发布时间" width="180" />
          <el-table-column prop="viewCount" label="浏览量" width="100">
            <template #default="scope">
              <span class="view-count">
                <i class="el-icon-view"></i> {{ scope.row.viewCount }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="排序" width="120">
            <template #default="scope">
              <div
                v-if="editingSortId !== scope.row.id"
                @click="startEditSort(scope.row)"
                class="editable-sort-cell"
              >
                {{ scope.row.sorts || 0 }}
              </div>
              <el-input-number
                v-else
                v-model="editingSortValue"
                @blur="handleSortBlur(scope.row)"
                @change="handleSortBlur(scope.row)"
                @keyup.enter="handleSortBlur(scope.row)"
                :min="0"
                :max="999"
                autofocus
                size="small"
                style="width: 100px;"
              />
            </template>
          </el-table-column>
          <el-table-column label="推荐" width="100" align="center">
            <template #default="scope">
              <el-switch
                v-model="scope.row.isRecommend"
                :active-value="1"
                :inactive-value="0"
                active-color="#E6A23C"
                inactive-color="#dcdfe6"
                @change="handleRecommendChange(scope.row)"
                :loading="scope.row.recommendLoading"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <div class="operation-buttons">
                <el-button size="small" type="success" @click="handleEdit(scope.row)">
                  <span style="font-size: 14px; margin-right: 4px;">✏️</span>
                  编辑
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Document, Folder } from '@element-plus/icons-vue';
import { getItems, getItemsByMenuId, deleteItem, updateItem } from '../API/items';
import { getMenus } from '../API/menus';

const router = useRouter();

// 搜索表单
const searchForm = reactive({
  title: '',
  categoryId: null as number | null,
  status: ''
});

// 分页相关
const total = ref(0);
const pageSize = ref(10);
const currentPage = ref(1);
const loading = ref(false);

// 排序编辑相关
const editingSortId = ref<number | null>(null);
const editingSortValue = ref(0);

// 开始编辑排序
const startEditSort = (row: NewsItem) => {
  editingSortId.value = row.id;
  editingSortValue.value = row.sorts || 0;
};

// 排序输入框失去焦点时保存
const handleSortBlur = async (row: NewsItem) => {
  const newSort = editingSortValue.value;
  if (newSort === (row.sorts || 0)) {
    editingSortId.value = null;
    return;
  }

  try {
    await updateItem(row.id, { Sorts: newSort });
    row.sorts = newSort;
    ElMessage.success('排序已保存');
  } catch (error: any) {
    console.error('保存排序失败:', error);
    ElMessage.error('保存排序失败');
  } finally {
    editingSortId.value = null;
  }
};

// 切换推荐状态
const handleRecommendChange = async (row: NewsItem) => {
  row.recommendLoading = true;
  try {
    await updateItem(row.id, { IsRecommend: row.isRecommend });
    ElMessage.success(row.isRecommend === 1 ? '已设为推荐' : '已取消推荐');
  } catch (error: any) {
    console.error('更新推荐状态失败:', error);
    // 回滚状态
    row.isRecommend = row.isRecommend === 1 ? 0 : 1;
    ElMessage.error('更新推荐状态失败');
  } finally {
    row.recommendLoading = false;
  }
};

// 分类选项接口
interface CategoryOption {
  id: number;
  name: string;
  menuID?: number;
  sort?: number;
  displayName?: string; // 带缩进的显示名称
  depth?: number; // 层级深度
}

// 分类选项
const categoryOptions = ref<CategoryOption[]>([]);

// 新闻相关的分类ID列表（包括MenuID=2的所有子分类）
const newsCategoryIds = ref<number[]>([]);

// 列表数据
interface NewsItem {
  id: number;
  title: string;
  categoryId: number;
  categoryName: string;
  image?: string;
  imgUrl?: string; // 缩略图URL
  summary: string;
  content?: string;
  subTitle?: string;
  author: string;
  publishTime: string;
  isTop: number;
  isRecommend: number;
  status: number;
  viewCount: number;
  sorts?: number;
  model?: string;
  deleted?: number;
  updateTime?: string;  // 用于排序
  addTime?: string;     // 用于排序
  recommendLoading?: boolean; // 推荐状态更新中
}

const newsList = ref<NewsItem[]>([]);

// 表格行样式
const tableRowClassName = ({ row }: { row: NewsItem }) => {
  if (row.isTop === 1) {
    return 'top-row';
  }
  return '';
};

// 格式化发布时间为中文格式（年月日时分秒）
const formatPublishTime = (dateString: string | Date): string => {
  try {
    let date: Date;

    if (typeof dateString === 'string') {
      // 处理 ISO 格式或其他格式的字符串
      date = new Date(dateString);
    } else if (dateString instanceof Date) {
      date = dateString;
    } else {
      return '未知时间';
    }

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '未知时间';
    }

    // 格式化为中文格式：年月日时分秒
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '未知时间';
  }
};

// 按层级排序分类
const sortCategoriesByHierarchy = (items: CategoryOption[]): CategoryOption[] => {
  const result: CategoryOption[] = [];
  const itemMap = new Map<number, CategoryOption[]>();

  // 按 MenuID 分组
  items.forEach(item => {
    const menuID = item.menuID || 0;
    if (!itemMap.has(menuID)) {
      itemMap.set(menuID, []);
    }
    itemMap.get(menuID)!.push(item);
  });

  // 对每组内的项按 sort 排序
  itemMap.forEach(group => {
    group.sort((a, b) => (a.sort || 0) - (b.sort || 0));
  });

  // 递归函数：按层级添加项
  const addItemsRecursively = (parentID: number, depth: number = 0) => {
    const children = itemMap.get(parentID) || [];
    children.forEach(item => {
      // 生成带缩进的显示名称
      const indent = depth > 0 ? '-'.repeat(depth) + ' ' : '';
      item.displayName = indent + item.name;
      item.depth = depth; // 保存层级深度
      result.push(item);
      // 如果这个项有子分类，递归添加
      addItemsRecursively(item.id, depth + 1);
    });
  };

  // 从顶级分类开始（MenuID = 0）
  addItemsRecursively(0);

  return result;
};

// 获取分类选项
const fetchCategories = async () => {
  try {
    console.log('Fetching categories from API...');
    const response = await getMenus();
    console.log('Categories API response:', response);

    // 处理API返回的数据
    const menus = Array.isArray(response) ? response :
               (response.data ? response.data : []);

    // 收集所有新闻相关的分类ID（MenuID=2的所有分类）
    newsCategoryIds.value = menus
      .filter((menu: any) => menu.MenuID === 2)
      .map((menu: any) => menu.ID);
    // 也要包含MenuID=2本身
    newsCategoryIds.value.push(2);
    console.log('News category IDs to filter:', newsCategoryIds.value);

    // 映射字段并添加层级信息，排除 ID=2 的新闻分类及其子分类
    const mappedCategories = menus
      .filter((menu: any) => menu.ID !== 2 && menu.MenuID !== 2) // 排除新闻分类（ID=2）及其子分类（MenuID=2）
      .map((menu: any) => ({
        id: menu.ID || 0,
        name: menu.Title || 'Unnamed Category',
        menuID: menu.MenuID || 0,
        sort: menu.Sorts || 0
      }));

    // 按层级排序
    categoryOptions.value = sortCategoriesByHierarchy(mappedCategories);

    console.log('Processed categories:', categoryOptions.value);
  } catch (error) {
    console.error('Error fetching categories:', error);
    ElMessage.error('获取分类失败');
    // 设置默认分类以防数据加载失败
    categoryOptions.value = [
      { id: 1, name: '公司新闻', displayName: '公司新闻' },
      { id: 3, name: '技术分享', displayName: '技术分享' },
      { id: 4, name: '活动公告', displayName: '活动公告' }
    ];
  }
};

// 标题输入时自动搜索
const handleTitleInput = () => {
  currentPage.value = 1;
  fetchData();
};

// 分类变化时自动搜索
const handleCategoryChange = () => {
  currentPage.value = 1;
  fetchData();
};

// 重置搜索
const resetSearch = () => {
  searchForm.title = '';
  searchForm.categoryId = null;
  searchForm.status = '';
  currentPage.value = 1;
  fetchData();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchData();
};

// 页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  fetchData();
};

// 获取数据
const fetchData = async () => {
  loading.value = true;

  try {
    console.log('Fetching items from API...');
    // 获取所有列表数据
    const response = await getItems();
    console.log('Items API response:', response);

    // 处理API返回的数据
    const items = Array.isArray(response) ? response :
               (response.data ? response.data : []);

    console.log('Processed items data:', items);

    // 将后端数据转换为前端需要的格式
    let fetchedList: NewsItem[] = items.map((item: any) => {
      // 从数据库字段映射到前端字段
      const menuInfo = categoryOptions.value.find(cat => cat.id === item.MenuID);

      return {
        id: item.ID || 0,
        title: item.Title || '',
        categoryId: item.MenuID || 0,
        categoryName: menuInfo ? menuInfo.name : 'Uncategorized',
        imgUrl: item.ImgUrl || 'https://via.placeholder.com/800x450?text=No+Image',
        summary: item.Description || '',
        content: item.Content || '',
        subTitle: item.SubTitle || '',
        author: item.Parameter1 || 'Unknown Author',
        publishTime: formatPublishTime(item.AddTime || item.UpdateTime || new Date().toISOString()),
        isTop: 0, // Not available in current schema
        isRecommend: item.IsRecommend || 0,
        status: item.IsShow || 0, // IsShow=1 means published, IsShow=0 means draft
        viewCount: item.Reading || 0,
        sorts: item.Sorts || 0,
        model: item.Model || '',
        deleted: item.Deleted || 0,
        updateTime: item.UpdateTime || '',  // 保存原始时间用于排序
        addTime: item.AddTime || ''         // 保存原始时间用于排序
      };
    });

    // Filter out deleted items and news items (MenuID = 2 and all its subcategories)
    fetchedList = fetchedList.filter((item: NewsItem) =>
      item.deleted === 0 && !newsCategoryIds.value.includes(item.categoryId)
    );

    console.log('Mapped items list:', fetchedList);

    // 按标题筛选
    if (searchForm.title) {
      fetchedList = fetchedList.filter((item: NewsItem) =>
        item.title.toLowerCase().includes(searchForm.title.toLowerCase())
      );
    }

    // 按分类筛选
    if (searchForm.categoryId !== null) {
      fetchedList = fetchedList.filter((item: NewsItem) =>
        item.categoryId === searchForm.categoryId
      );
    }

    // 按状态筛选
    if (searchForm.status !== '') {
      fetchedList = fetchedList.filter((item: NewsItem) =>
        item.status === parseInt(searchForm.status as string)
      );
    }

    // 按 UpdateTime 和 AddTime 排序（最新的在前面）
    fetchedList.sort((a, b) => {
      // 优先按 UpdateTime 排序
      const updateTimeA = a.updateTime ? new Date(a.updateTime).getTime() : 0;
      const updateTimeB = b.updateTime ? new Date(b.updateTime).getTime() : 0;

      if (updateTimeA !== updateTimeB) {
        return updateTimeB - updateTimeA;  // 降序：最新的在前
      }

      // 如果 UpdateTime 相同，按 AddTime 排序
      const addTimeA = a.addTime ? new Date(a.addTime).getTime() : 0;
      const addTimeB = b.addTime ? new Date(b.addTime).getTime() : 0;
      return addTimeB - addTimeA;  // 降序：最新的在前
    });

    // 更新总数
    total.value = fetchedList.length;

    // 分页
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;

    // 更新列表
    newsList.value = fetchedList.slice(start, end);
  } catch (error) {
    console.error('Error fetching data:', error);
    ElMessage.error('获取数据失败');

    // 使用默认数据
    newsList.value = [
      {
        id: 1,
        title: '公司成功举办2023年度技术峰会',
        categoryId: 1,
        categoryName: '公司新闻',
        imgUrl: 'https://via.placeholder.com/800x450?text=Tech+Summit+2023',
        summary: '我们公司于2023年10月15日成功举办了年度技术峰会，汇聚了来自全国各地的技术专家，共同探讨行业最新的技术发展趋势。',
        author: '张三',
        publishTime: '2023-10-16 09:00:00',
        isTop: 1,
        isRecommend: 1,
        status: 1,
        viewCount: 1250
      }
    ];

    total.value = newsList.value.length;
  } finally {
    loading.value = false;
  }
};

// 新增品项
const handleAddNews = () => {
  router.push('/news-edit');
};

// 编辑新闻
const handleEdit = (row: any) => {
  router.push(`/news-edit?id=${row.id}`);
};

// Delete item
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除 "${row.title}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      console.log(`Deleting item with ID ${row.id}`);
      // Call API to delete item
      const result = await deleteItem(row.id);
      console.log('Delete result:', result);

      // Remove from frontend list
      const index = newsList.value.findIndex((item: NewsItem) => item.id === row.id);
      if (index !== -1) {
        newsList.value.splice(index, 1);
        total.value--;
      }

      ElMessage({
        type: 'success',
        message: '删除成功'
      });

      // Refresh data
      await fetchData();
    } catch (error) {
      console.error(`Error deleting item:`, error);
      ElMessage.error('删除失败');
    }
  }).catch(() => {});
};

onMounted(async () => {
  // 先获取分类数据
  await fetchCategories();
  // 然后获取列表数据
  await fetchData();
});
</script>

<style scoped>
/* Main container */
.list-page-container {
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

/* Header section */
.list-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
}

.header-title {
  display: flex;
  align-items: center;
}

.header-title h2 {
  margin: 0;
  font-size: 22px;
  color: #303133;
  font-weight: 600;
}

.title-icon {
  width: 24px;
  height: 24px;
  margin-right: 10px;
  background: linear-gradient(135deg, #409EFF, #67C23A);
  border-radius: 6px;
  position: relative;
}

.title-icon:before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.add-button {
  background: linear-gradient(135deg, #409EFF, #67C23A);
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* Card */
.list-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  overflow: hidden;
  background-color: #fff;
}

/* Search bar */
.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f9fafc;
  border-radius: 4px;
  border-bottom: 1px solid #ebeef5;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

/* Label with icon */
.label-with-icon {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.label-with-icon i {
  font-size: 14px;
  color: #606266;
}

/* 减少表单项的 label 间距 */
.search-form :deep(.el-form-item__label) {
  padding-right: 8px;
  margin-right: 0;
}

/* Table container */
.table-container {
  padding: 0 20px;
}

/* Image placeholder */
.image-placeholder {
  width: 80px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #909399;
}

/* View count */
.view-count {
  display: flex;
  align-items: center;
  color: #606266;
}

.view-count i {
  margin-right: 5px;
  color: #909399;
}

/* Tag container */
.tag-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

/* Operation buttons */
.operation-buttons {
  display: flex;
  gap: 10px;
}

/* Editable sort cell */
.editable-sort-cell {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.editable-sort-cell:hover {
  background-color: #f0f9eb;
  color: #67c23a;
}

/* Pagination */
.pagination-container {
  margin-top: 20px;
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #ebeef5;
}

/* Table row styles */
.top-row {
  background-color: rgba(64, 158, 255, 0.1);
}

.top-row:hover td {
  background-color: rgba(64, 158, 255, 0.2) !important;
}
</style>

<!-- Global styles for category depth colors -->
<style>
.el-select-dropdown__item.category-depth-0 {
  background-color: #dbeafe !important;
}

.el-select-dropdown__item.category-depth-0:hover {
  background-color: #bfdbfe !important;
}

.el-select-dropdown__item.category-depth-1 {
  background-color: #eff6ff !important;
}

.el-select-dropdown__item.category-depth-1:hover {
  background-color: #dbeafe !important;
}

.el-select-dropdown__item.category-depth-2 {
  background-color: #f8fafc !important;
}

.el-select-dropdown__item.category-depth-2:hover {
  background-color: #e0f2fe !important;
}

.el-select-dropdown__item.category-depth-3 {
  background-color: #fafbfc !important;
}

.el-select-dropdown__item.category-depth-3:hover {
  background-color: #e0f2fe !important;
}
</style>
