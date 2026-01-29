<template>
  <div class="single-page-container">

    <el-card class="page-card">

      <el-table :data="pageList" style="width: 100%" v-loading="loading">
        <el-table-column label="No." width="80">
          <template #default="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="slug" label="别名" width="120" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button size="small" type="success" @click="handleEdit(scope.row)"><span style="font-size: 14px; margin-right: 4px;">✏️</span>编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getPages } from '../API/page';

const router = useRouter();

interface PageItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  sort: number;
  createTime: string;
  updateTime: string;
}

const pageList = ref<PageItem[]>([]);
const loading = ref(false);

const handleAdd = () => {
  router.push('/single-page/edit');
};

const handleEdit = (row: PageItem) => {
  router.push(`/single-page/edit?id=${row.id}`);
};

// 加载页面列表
const loadPages = async () => {
  try {
    loading.value = true;
    const pages = await getPages();

    // 映射后端返回的数据到前端期望的格式
    pageList.value = pages.map((page: any) => ({
      id: page.ID || page.id || 0,
      title: page.Title || page.title || '',
      slug: page.Slug || page.slug || '',
      content: page.Content || page.content || '',
      sort: page.Sorts || page.sort || 0,
      createTime: page.CreateTime || page.createTime || new Date().toLocaleString(),
      updateTime: page.UpdateTime || page.updateTime || new Date().toLocaleString()
    }));

    console.log('Mapped pages:', pageList.value);
  } catch (error) {
    console.error('加载页面列表失败:', error);
    ElMessage({
      type: 'error',
      message: '加载页面列表失败'
    });
  } finally {
    loading.value = false;
  }
};

// 页面挂载时加载数据
onMounted(() => {
  loadPages();
});
</script>

<style scoped>
.page-title {
  margin-bottom: 20px;
  color: #409EFF;
}

.page-card {
  margin-bottom: 20px;
}


</style>
