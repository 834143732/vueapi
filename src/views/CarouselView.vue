<template>
  <div class="carousel-container">
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
        </div>
        <el-button type="success" size="small" @click="handleAddCarousel">➕ 添加</el-button>
      </div>
    </el-card>

    <el-card class="carousel-card">

      <el-table :data="sortedCarouselList" style="width: 100%">
        <el-table-column prop="ID" label="ID" width="60" />
        <el-table-column prop="Title" label="标题" width="150" />
        <el-table-column label="图片" width="150">
          <template #default="scope">
            <el-image
              style="width: 80px; height: 50px"
              :src="getImageUrl(scope.row.ImageUrl)"
              fit="cover"
              :preview-src-list="[getImageUrl(scope.row.ImageUrl)]"
            />
          </template>
        </el-table-column>
        <el-table-column prop="LinkUrl" label="链接" min-width="120" show-overflow-tooltip />
        <el-table-column prop="Sorts" label="排序" width="70" />
        <el-table-column prop="Status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.Status === 1 ? 'success' : 'info'">
              {{ scope.row.Status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-space :size="2" wrap>
              <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button
                size="small"
                :type="scope.row.Status === 1 ? 'warning' : 'success'"
                @click="handleToggleStatus(scope.row)"
              >
                {{ scope.row.Status === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑轮播图' : '添加轮播图'"
      width="50%"
    >
      <el-form :model="carouselForm" label-width="100px" :rules="rules" ref="carouselFormRef">
        <el-form-item label="分类" prop="CategoryID">
          <el-select v-model="carouselForm.CategoryID" placeholder="请选择分类">
            <el-option
              v-for="category in categories"
              :key="category.ID"
              :label="category.Title"
              :value="category.ID"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="Title">
          <el-input v-model="carouselForm.Title" placeholder="请输入轮播图标题" />
        </el-form-item>
        <el-form-item label="描述" prop="Description">
          <el-input v-model="carouselForm.Description" placeholder="请输入轮播图描述" type="textarea" />
        </el-form-item>
        <el-form-item label="图片" prop="ImageUrl">
          <el-upload
            class="carousel-image-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleImageChange"
          >
            <img v-if="carouselForm.ImageUrl" :src="carouselForm.ImageUrl" class="carousel-image" />
            <el-icon v-else class="carousel-image-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="image-tip">建议尺寸: 1920 x 500 像素</div>
        </el-form-item>
        <el-form-item label="链接" prop="LinkUrl">
          <el-input v-model="carouselForm.LinkUrl" placeholder="请输入轮播图链接" />
        </el-form-item>
        <el-form-item label="排序" prop="Sorts">
          <el-input-number v-model="carouselForm.Sorts" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="carouselForm.Status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveCarousel">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import type { FormInstance, UploadFile } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import {
  getCarouselCategories,
  getCarouselItemsByCategory,
  createCarouselItem,
  updateCarouselItem,
  deleteCarouselItem
} from '../API/carousel';
import { getImageBaseUrl } from '../utils/imageUrlHelper';
import { uploadThumbnail } from '../utils/uploadHelper';

interface CarouselCategory {
  ID: number;
  Title: string;
  Description: string;
  Sorts: number;
  Status: number;
}

interface CarouselItem {
  ID?: number;
  CategoryID: number;
  Title: string;
  Description: string;
  ImageUrl: string;
  LinkUrl: string;
  Sorts: number;
  Status: number;
}

const categories = ref<CarouselCategory[]>([]);
const carouselList = ref<CarouselItem[]>([]);
const selectedCategoryId = ref<number>(0);

// 计算属性：将启用的数据排在前面，禁用的数据排在后面
const sortedCarouselList = computed(() => {
  const enabled = carouselList.value.filter(item => item.Status === 1);
  const disabled = carouselList.value.filter(item => item.Status === 0);
  return [...enabled, ...disabled];
});

const dialogVisible = ref(false);
const isEdit = ref(false);
const carouselFormRef = ref<FormInstance>();
const carouselForm = reactive<CarouselItem>({
  CategoryID: 0,
  Title: '',
  Description: '',
  ImageUrl: '',
  LinkUrl: '',
  Sorts: 0,
  Status: 1
});

const rules = {
  CategoryID: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  Title: [
    { required: true, message: '请输入轮播图标题', trigger: 'blur' },
    { max: 100, message: '标题长度不能超过100个字符', trigger: 'blur' }
  ],
  ImageUrl: [
    { required: true, message: '请上传轮播图图片', trigger: 'change' }
  ]
};

const resetForm = () => {
  carouselForm.ID = undefined;
  carouselForm.CategoryID = selectedCategoryId.value || 0;
  carouselForm.Title = '';
  carouselForm.Description = '';
  carouselForm.ImageUrl = '';
  carouselForm.LinkUrl = '';
  carouselForm.Sorts = 0;
  carouselForm.Status = 1;
};

const getImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${getImageBaseUrl()}/${url}`;
};

const loadCategories = async () => {
  try {
    const data = await getCarouselCategories();
    categories.value = data;
    if (data.length > 0 && selectedCategoryId.value === 0) {
      selectedCategoryId.value = data[0].ID;
      await loadCarouselItems();
    }
  } catch (error) {
    ElMessage.error('加载分类失败');
    console.error(error);
  }
};

const selectCategory = async (categoryId: number) => {
  selectedCategoryId.value = categoryId;
  await loadCarouselItems();
};

const loadCarouselItems = async () => {
  if (selectedCategoryId.value === 0) return;
  try {
    const data = await getCarouselItemsByCategory(selectedCategoryId.value);
    carouselList.value = data;
  } catch (error) {
    ElMessage.error('加载轮播图失败');
    console.error(error);
  }
};

const handleAddCategory = () => {
  ElMessage.info('分类管理功能开发中...');
};

const handleAddCarousel = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

const handleEdit = (row: CarouselItem) => {
  isEdit.value = true;
  Object.assign(carouselForm, row);
  dialogVisible.value = true;
};

const handleToggleStatus = async (row: CarouselItem) => {
  const newStatus = row.Status === 1 ? 0 : 1;
  const statusText = newStatus === 1 ? '启用' : '禁用';

  ElMessageBox.confirm(
    `确定要${statusText}该轮播图吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await updateCarouselItem(row.ID!, {
        ...row,
        Status: newStatus
      });
      ElMessage({
        type: 'success',
        message: `${statusText}成功`
      });
      await loadCarouselItems();
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

const handleDelete = (row: CarouselItem) => {
  ElMessageBox.confirm(
    `确定要删除轮播图 "${row.Title}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteCarouselItem(row.ID!);
      ElMessage({
        type: 'success',
        message: '删除成功'
      });
      await loadCarouselItems();
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

const handleImageChange = async (file: UploadFile) => {
  if (!file || !file.raw) {
    ElMessage.error('文件读取失败');
    return;
  }

  try {
    const loadingInstance = ElLoading.service({
      fullscreen: false,
      text: '图片上传中...'
    });

    try {
      const uploadedUrl = await uploadThumbnail(file.raw);

      if (uploadedUrl) {
        carouselForm.ImageUrl = uploadedUrl;
        ElMessage.success('图片上传成功');
        console.log('Uploaded image URL:', uploadedUrl);
      } else {
        ElMessage.error('图片上传失败');
      }
    } finally {
      loadingInstance.close();
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    ElMessage.error('图片上传失败');
  }
};

const handleSaveCarousel = async () => {
  if (!carouselFormRef.value) return;

  await carouselFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await updateCarouselItem(carouselForm.ID!, carouselForm);
          ElMessage({
            type: 'success',
            message: '编辑成功'
          });
        } else {
          await createCarouselItem(carouselForm);
          ElMessage({
            type: 'success',
            message: '添加成功'
          });
        }
        dialogVisible.value = false;
        await loadCarouselItems();
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败');
      }
    }
  });
};

onMounted(() => {
  loadCategories();
});
</script>

<style scoped>
.carousel-container {
  padding: 20px;
}

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

.carousel-card {
  margin-bottom: 20px;
}

.carousel-image-uploader {
  width: 200px;
  height: 112px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.carousel-image-uploader:hover {
  border-color: #409EFF;
}

.carousel-image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 112px;
  line-height: 112px;
  text-align: center;
}

.carousel-image {
  width: 200px;
  height: 112px;
  display: block;
  object-fit: cover;
}

.image-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>

