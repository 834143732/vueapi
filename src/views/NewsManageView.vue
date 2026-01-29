<template>
  <div class="news-container">
    <!-- 分类卡片 -->
    <el-card class="category-card">
      <div class="category-buttons">
        <div class="category-button-group">
          <el-button
            v-for="category in categories"
            :key="category.ID"
            :type="selectedCategoryId === category.ID ? 'primary' : 'default'"
            @click="selectCategory(category.ID)"
          >
            {{ category.Title }}
          </el-button>
          <el-button
            type="danger"
            @click="selectCategory(0)"
          >
            全部新闻
          </el-button>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索标题..."
            :prefix-icon="Search"
            clearable
            style="width: 200px; margin-left: 15px;"
            @input="handleSearch"
          />
        </div>
        <el-button type="success" @click="handleAddNews">+ 添加</el-button>
      </div>
    </el-card>

    <!-- 新闻列表卡片 -->
    <el-card class="news-card">

      <el-table :data="sortedNewsList" style="width: 100%">
        <el-table-column label="No." width="60">
          <template #default="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="Title" label="标题" width="400" />
        <el-table-column label="图片" width="120">
          <template #default="scope">
            <el-image
              style="width: 80px; height: 50px"
              :src="getImageUrl(scope.row.ImgUrl)"
              fit="cover"
              :preview-src-list="[getImageUrl(scope.row.ImgUrl)]"
              preview-teleported
              hide-on-click-modal
            />
          </template>
        </el-table-column>
        <el-table-column prop="Description" label="描述" min-width="100" show-overflow-tooltip />
        <el-table-column label="推荐" width="80" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.IsRecommend"
              :active-value="1"
              :inactive-value="0"
              active-color="#E6A23C"
              inactive-color="#dcdfe6"
              @change="handleRecommendChange(scope.row)"
              :loading="scope.row.recommendLoading"
            />
          </template>
        </el-table-column>
        <el-table-column label="排序" width="100">
          <template #default="scope">
            <div
              v-if="editingSortId !== scope.row.ID"
              @click="startEditSort(scope.row)"
              class="editable-sort-cell"
            >
              {{ scope.row.Sorts || 0 }}
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
              style="width: 80px;"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="scope">
            <el-button size="small" type="success" @click="handleEdit(scope.row)"><span style="font-size: 14px; margin-right: 4px;">✏️</span>编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div style="margin-top: 20px; display: flex; justify-content: center;">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredTotal"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { getMenus } from '../API/menus';
import { getItems, getItemsByMenuId, updateItem, deleteItem } from '../API/items';
import { getImageBaseUrl } from '../utils/imageUrlHelper';

const router = useRouter();

interface Category {
  ID: number;
  Title: string;
  MenuID: number;
  Sorts: number;
}

interface NewsItem {
  ID: number;
  Title: string;
  Description: string;
  ImgUrl: string;
  MenuID: number;
  IsShow: number;
  IsRecommend: number;
  Reading: number;
  AddTime: string;
  UpdateTime: string;
  Content: string;
  Parameter1: string;
  Sorts?: number;
  recommendLoading?: boolean;
}

const categories = ref<Category[]>([]);
const newsList = ref<NewsItem[]>([]);
const selectedCategoryId = ref<number>(0);
const searchKeyword = ref<string>('');

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);

// 排序编辑相关
const editingSortId = ref<number | null>(null);
const editingSortValue = ref(0);

// 搜索处理函数
const handleSearch = () => {
  // 输入时自动过滤，computed 属性会自动更新
  // 搜索时重置到第一页
  currentPage.value = 1;
};

// 开始编辑排序
const startEditSort = (row: NewsItem) => {
  editingSortId.value = row.ID;
  editingSortValue.value = row.Sorts || 0;
};

// 排序输入框失去焦点时保存
const handleSortBlur = async (row: NewsItem) => {
  const newSort = editingSortValue.value;
  if (newSort === (row.Sorts || 0)) {
    editingSortId.value = null;
    return;
  }

  try {
    await updateItem(row.ID, { Sorts: newSort });
    row.Sorts = newSort;
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
    await updateItem(row.ID, { IsRecommend: row.IsRecommend });
    ElMessage.success(row.IsRecommend === 1 ? '已设为推荐' : '已取消推荐');
  } catch (error: any) {
    console.error('更新推荐状态失败:', error);
    // 回滚状态
    row.IsRecommend = row.IsRecommend === 1 ? 0 : 1;
    ElMessage.error('更新推荐状态失败');
  } finally {
    row.recommendLoading = false;
  }
};

// 计算属性：先过滤搜索结果，再将发布的新闻排在前面，草稿排在后面，最后分页
const filteredNewsList = computed(() => {
  let filtered = newsList.value;
  
  // 按搜索关键词过滤
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase();
    filtered = filtered.filter(item => 
      item.Title && item.Title.toLowerCase().includes(keyword)
    );
  }
  
  const published = filtered.filter(item => item.IsShow === 1);
  const draft = filtered.filter(item => item.IsShow !== 1); // 包括 0、undefined、null 等
  return [...published, ...draft];
});

// 过滤后的总数
const filteredTotal = computed(() => filteredNewsList.value.length);

// 分页后的列表
const sortedNewsList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredNewsList.value.slice(start, end);
});

const getImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${getImageBaseUrl()}/${url}`;
};

const loadCategories = async () => {
  try {
    const data = await getMenus();
    // 过滤出 MenuID = 2 的分类（新闻资讯的子分类）
    categories.value = data.filter((item: any) => item.MenuID === 2);

    // 默认选择"全部新闻"
    selectedCategoryId.value = 0;
    await loadNews();
  } catch (error) {
    ElMessage.error('加载分类失败');
    console.error(error);
  }
};

const selectCategory = async (categoryId: number) => {
  selectedCategoryId.value = categoryId;
  currentPage.value = 1; // 切换分类时重置到第一页
  await loadNews();
};

// 分页事件处理
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1; // 改变每页数量时重置到第一页
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

const loadNews = async () => {
  try {
    console.log('loadNews called, selectedCategoryId:', selectedCategoryId.value);
    console.log('categories:', categories.value);
    
    if (selectedCategoryId.value === 0) {
      // 加载所有新闻:包括 MenuID = 2 和所有子分类的新闻
      const allNewsPromises = [
        getItemsByMenuId(2), // MenuID = 2 下的新闻
        ...categories.value.map((cat: Category) => getItemsByMenuId(cat.ID)) // 子分类下的新闻
      ];
      console.log('Number of promises:', allNewsPromises.length);
      const allNewsArrays = await Promise.all(allNewsPromises);
      console.log('allNewsArrays:', allNewsArrays);
      
      // 使用 Map 去重,避免重复数据
      const newsMap = new Map<number, NewsItem>();
      allNewsArrays.flat().forEach((item: NewsItem) => {
        newsMap.set(item.ID, item);
      });
      newsList.value = Array.from(newsMap.values());
      console.log('newsList after deduplication:', newsList.value);
    } else {
      // 加载指定分类的新闻
      const data = await getItemsByMenuId(selectedCategoryId.value);
      console.log('data for category', selectedCategoryId.value, ':', data);
      newsList.value = data;
    }
    console.log('Final newsList.value:', newsList.value);
  } catch (error) {
    ElMessage.error('加载新闻失败');
    console.error('loadNews error:', error);
  }
};

const handleAddNews = () => {
  router.push('/news-edit?type=news');
};

const handleEdit = (row: NewsItem) => {
  router.push(`/news-edit?id=${row.ID}&type=news`);
};

const handleToggleStatus = async (row: NewsItem) => {
  const newStatus = row.IsShow === 1 ? 0 : 1;
  const statusText = newStatus === 1 ? '发布' : '草稿';

  ElMessageBox.confirm(
    `确定要将该新闻设为${statusText}吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await updateItem(row.ID, {
        ...row,
        IsShow: newStatus
      });
      ElMessage({
        type: 'success',
        message: `${statusText}成功`
      });
      await loadNews();
    } catch (error) {
      ElMessage.error(`${statusText}失败`);
    }
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消操作'
    });
  });
};

const handleDelete = (row: NewsItem) => {
  ElMessageBox.confirm(
    `确定要删除新闻 "${row.Title}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteItem(row.ID);
      ElMessage({
        type: 'success',
        message: '删除成功'
      });
      await loadNews();
    } catch (error) {
      ElMessage.error('删除失败');
    }
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消删除'
    });
  });
};

onMounted(() => {
  loadCategories();
});
</script>

<style scoped>
.category-card {
  margin-bottom: 20px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.category-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.category-button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.news-card {
  margin-bottom: 20px;
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
</style>

