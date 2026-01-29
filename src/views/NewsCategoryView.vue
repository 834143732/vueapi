<template>
  <div class="news-category-container">

    <!-- 根据当前路由显示不同内容 -->
    <div v-if="currentRoute === 'add' || isEdit">
      <!-- 添加分类表单 -->
      <el-card class="category-card">
        <template #header>
          <div>
            <span>{{ isEdit ? '编辑分类' : '添加分类' }}</span>
          </div>
        </template>

        <el-form :model="categoryForm" label-width="80px" :rules="rules" ref="categoryFormRef">
          <el-form-item label="分类名称" prop="name">
            <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
          </el-form-item>
          <el-form-item label="副标题" prop="slug">
            <el-input v-model="categoryForm.slug" placeholder="请输入副标题" />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input v-model="categoryForm.description" placeholder="请输入描述" type="textarea" :rows="3" />
          </el-form-item>
          <el-form-item label="缩略图">
            <div class="thumbnail-upload-container">
              <div v-if="categoryForm.imgUrl" class="thumbnail-preview">
                <img :src="categoryForm.imgUrl" :alt="categoryForm.name" class="preview-thumbnail" />
                <div class="thumbnail-actions">
                  <el-button size="small" type="primary" @click="handlePreviewThumbnail">查看</el-button>
                  <el-button size="small" type="danger" @click="removeThumbnail">删除</el-button>
                </div>
              </div>
              <div v-else class="thumbnail-upload-area">
                <el-upload
                  action="#"
                  :auto-upload="false"
                  :on-change="handleThumbnailSelect"
                  accept="image/*"
                  drag
                >
                  <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                  <div class="el-upload__text">
                    拖拽图片到此或<em>点击上传</em>
                  </div>
                </el-upload>
              </div>
              <div v-if="thumbnailUploading" class="upload-progress">
                <el-progress :percentage="uploadProgress" />
              </div>
            </div>
          </el-form-item>
          <el-form-item label="内容" prop="content">
            <div class="editor-container">
              <Toolbar
                style="border-bottom: 1px solid #ccc"
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
              />
              <Editor
                style="height: 400px; overflow-y: hidden;"
                v-model="categoryForm.content"
                :defaultConfig="editorConfig"
                @onCreated="handleCreated"
              />
            </div>
          </el-form-item>
          <el-form-item label="父级分类">
            <el-select v-model="categoryForm.menuID" placeholder="选择父级分类（可选）" clearable>
              <el-option label="无（顶级分类）" :value="0" />
              <el-option
                v-for="item in parentCategories"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="categoryForm.sort" :min="0" :max="999" />
          </el-form-item>
          <el-form-item label="状态">
            <el-switch
              v-model="categoryForm.status"
              :active-value="1"
              :inactive-value="0"
              active-text="启用"
              inactive-text="禁用"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSaveCategory">{{ isEdit ? '保存修改' : '添加分类' }}</el-button>
            <el-button v-if="isEdit" @click="resetForm">取消</el-button>
            <el-button @click="navigateToList">查看分类</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 分类列表，只在列表页面显示 -->
    <div v-else-if="currentRoute === 'list'">
      <el-card class="category-list-card">
        <!-- 搜索和操作栏 -->
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索分类名称..."
            clearable
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <el-button type="success" @click="navigateToAdd" class="add-button">
            + 新增分类
          </el-button>
        </div>

        <el-table :data="filteredCategoryList" style="width: 100%" border size="large">
          <el-table-column label="No." width="60" align="center">
            <template #default="scope">
              {{ filteredCategoryList.indexOf(scope.row) + 1 }}
            </template>
          </el-table-column>
          <el-table-column label="分类名称" min-width="200">
            <template #default="scope">
              <div
                v-if="editingId !== scope.row.id"
                @click="startEdit(scope.row)"
                class="editable-cell"
              >
                <span v-if="scope.row.menuID && scope.row.menuID > 0" class="category-icon" :style="{ marginLeft: getIndentPadding(scope.row) }">- </span>
                <span v-else :style="{ marginLeft: getIndentPadding(scope.row) }"></span>
                {{ scope.row.name }}
              </div>
              <el-input
                v-else
                v-model="editingName"
                @blur="saveEdit(scope.row)"
                @keyup.enter="saveEdit(scope.row)"
                autofocus
                size="small"
                :style="{ marginLeft: getIndentPadding(scope.row) }"
              />
            </template>
          </el-table-column>
          <el-table-column label="缩略图" width="120">
            <template #default="scope">
              <div v-if="scope.row.imgUrl" class="thumbnail-container">
                <el-image
                  style="width: 80px; height: 50px"
                  :src="scope.row.imgUrl"
                  fit="cover"
                  :preview-src-list="[scope.row.imgUrl]"
                  preview-teleported
                  hide-on-click-modal
                />
              </div>
              <div v-else class="no-image">无图片</div>
            </template>
          </el-table-column>
          <el-table-column prop="slug" label="副标题" />
          <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
          <el-table-column label="排序" width="120">
            <template #default="scope">
              <template v-if="scope.row.menuID !== 0">
                <div
                  v-if="editingSortId !== scope.row.id"
                  @click="startEditSort(scope.row)"
                  class="editable-sort-cell"
                >
                  {{ scope.row.sort }}
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
              <span v-else class="no-sort">-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button size="small" type="success" @click="handleEdit(scope.row)"><span style="font-size: 14px; margin-right: 4px;">✏️</span>编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
        </el-card>
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog
      v-model="showImagePreview"
      title="图片预览"
      width="60%"
      :close-on-click-modal="true"
    >
      <div class="image-preview-container">
        <img :src="previewImageUrl" :alt="previewImageUrl" class="preview-image" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, shallowRef, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import '@wangeditor/editor/dist/css/style.css';
import { getMenus, createMenu, updateMenu, deleteMenu } from '../API/menus';
import { getEditorUploadConfig, uploadFile, uploadThumbnail } from '../utils/uploadHelper';
import { addUrlPrefix } from '../utils/imageUrlHelper';
import { getAPIBaseURL } from '../API/auth';

const router = useRouter();
const route = useRoute();

// 根据当前路由确定显示模式：'add' 或 'list'
const currentRoute = computed(() => {
  if (route.path.includes('/add')) {
    return 'add';
  } else if (route.path.includes('/list')) {
    return 'list';
  } else {
    return 'add'; // 默认显示添加页面
  }
});

// 导航到添加分类页面
const navigateToAdd = () => {
  router.push('/news-category/add');
};

// 导航到分类列表页面
const navigateToList = () => {
  router.push('/news-category/list');
};

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  content: string;
  sort: number;
  status: number; // 1: 启用, 0: 禁用
  level?: number; // 层级
  menuID?: number; // 父级菜单ID
  imgUrl?: string; // 缩略图URL
}

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();

// 编辑器配置
const toolbarConfig = {};

// 编辑器配置
const editorConfig = getEditorUploadConfig();

// 组件销毁时，销毁编辑器实例
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

// 编辑器创建完成时的回调
const handleCreated = (editor: any) => {
  editorRef.value = editor;
};

// 分类表单
const categoryFormRef = ref<FormInstance>();
const categoryForm = reactive<CategoryItem>({
  id: 0,
  name: '',
  slug: '',
  description: '',
  content: '',
  sort: 0,
  status: 1
});

// 表单验证规则 - 只有分类名称是必选的
const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' }
  ]
};

// 编辑状态
const isEdit = ref(false);

// 分类列表
const categoryList = ref<CategoryItem[]>([]);

// 搜索关键词
const searchKeyword = ref('');

// 加载状态
const loading = ref(false);

// 父级分类列表（用于下拉选择）
const parentCategories = computed(() => {
  return categoryList.value.filter(item => !item.menuID || item.menuID === 0);
});

// 过滤后的分类列表（根据搜索关键词）
const filteredCategoryList = computed(() => {
  if (!searchKeyword.value.trim()) {
    return categoryList.value;
  }

  const keyword = searchKeyword.value.toLowerCase();
  return categoryList.value.filter(item =>
    item.name.toLowerCase().includes(keyword) ||
    item.slug.toLowerCase().includes(keyword) ||
    item.description.toLowerCase().includes(keyword)
  );
});

// 编辑分类名称相关
const editingId = ref<number | null>(null);
const editingName = ref('');

// 编辑排序相关
const editingSortId = ref<number | null>(null);
const editingSortValue = ref(0);

// 图片预览相关
const previewImageUrl = ref('');
const showImagePreview = ref(false);

// 缩略图上传相关
const thumbnailUploading = ref(false);
const uploadProgress = ref(0);
const selectedThumbnailFile = ref<File | null>(null);

// 获取分类列表
const fetchCategories = async () => {
  loading.value = true;
  try {
    console.log('Fetching categories from API...');
    const response = await getMenus();
    console.log('API response:', response);

    // 确保数据是数组格式
    const menus = Array.isArray(response) ? response : (response.data || []);

    // 映射字段名
    const mappedList = menus.map((menu: any) => ({
      id: menu.ID || 0,
      name: menu.Title || '',
      slug: menu.SubTitle || '',
      description: menu.Description || '',
      content: menu.Content || '',
      sort: menu.Sorts || 0,
      status: menu.Status !== undefined ? menu.Status : 1,
      level: menu.Level || 1,
      menuID: menu.MenuID || 0,
      imgUrl: addUrlPrefix(menu.ImgUrl || menu.imgUrl || '')
    }));

    // 按层级和排序排列
    categoryList.value = sortByHierarchy(mappedList);

    console.log('Mapped category list:', categoryList.value);
  } catch (error) {
    console.error('Error fetching categories:', error);
    ElMessage.error('获取分类列表失败');
  } finally {
    loading.value = false;
  }
};

// 按层级排序分类
const sortByHierarchy = (items: CategoryItem[]): CategoryItem[] => {
  const result: CategoryItem[] = [];
  const itemMap = new Map<number, CategoryItem[]>();

  // 按 MenuID 分组
  items.forEach(item => {
    const menuID = item.menuID || 0;
    if (!itemMap.has(menuID)) {
      itemMap.set(menuID, []);
    }
    itemMap.get(menuID)!.push(item);
  });

  // 对每组内的项按 sort 降序排序（排序值越大越靠前）
  itemMap.forEach(group => {
    group.sort((a, b) => (b.sort || 0) - (a.sort || 0));
  });

  // 递归函数：按层级添加项
  const addItemsRecursively = (parentID: number) => {
    const children = itemMap.get(parentID) || [];
    children.forEach(item => {
      result.push(item);
      // 如果这个项有子分类，递归添加
      addItemsRecursively(item.id);
    });
  };

  // 从顶级分类开始（MenuID = 0）
  addItemsRecursively(0);

  return result;
};

// 获取缩进距离 - 支持多层级递归缩进
const getIndentPadding = (row: CategoryItem): string => {
  // 计算当前项的层级深度
  let depth = 0;
  let currentItem = row;

  // 通过追踪 menuID 来计算深度
  while (currentItem.menuID && currentItem.menuID > 0) {
    depth++;
    // 在列表中查找父项
    const parentItem = categoryList.value.find(item => item.id === currentItem.menuID);
    if (parentItem) {
      currentItem = parentItem;
    } else {
      break; // 找不到父项，停止
    }
  }

  // 每层缩进 40px
  return `${depth * 40}px`;
};

// 处理缩略图选择
const handleThumbnailSelect = async (file: any) => {
  if (!file.raw) return;

  selectedThumbnailFile.value = file.raw;
  thumbnailUploading.value = true;
  uploadProgress.value = 0;

  try {
    console.log('[Thumbnail] Starting upload:', file.raw.name);

    // 模拟上传进度
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += Math.random() * 30;
      }
    }, 200);

    // 上传文件 - 使用缩略图专用上传函数
    const url = await uploadThumbnail(file.raw);

    clearInterval(progressInterval);
    uploadProgress.value = 100;

    if (url) {
      console.log('[Thumbnail] Upload successful:', url);
      categoryForm.imgUrl = url;
      ElMessage.success('缩略图上传成功');
    } else {
      throw new Error('上传失败，请重试');
    }
  } catch (error: any) {
    console.error('[Thumbnail] Upload failed:', error);
    ElMessage.error(error.message || '缩略图上传失败');
    categoryForm.imgUrl = '';
  } finally {
    thumbnailUploading.value = false;
    uploadProgress.value = 0;
    selectedThumbnailFile.value = null;
  }
};

// 预览缩略图
const handlePreviewThumbnail = () => {
  if (categoryForm.imgUrl) {
    previewImageUrl.value = categoryForm.imgUrl;
    showImagePreview.value = true;
  }
};

// 删除缩略图
const removeThumbnail = () => {
  categoryForm.imgUrl = '';
  selectedThumbnailFile.value = null;
  ElMessage.success('缩略图已删除');
};

// 重置表单
const resetForm = () => {
  categoryForm.id = 0;
  categoryForm.name = '';
  categoryForm.slug = '';
  categoryForm.description = '';
  categoryForm.content = '';
  categoryForm.sort = 0;
  categoryForm.status = 1;
  categoryForm.menuID = 0;
  categoryForm.level = 1;
  categoryForm.imgUrl = '';
  isEdit.value = false;
  selectedThumbnailFile.value = null;
};

// 编辑分类
const handleEdit = (row: CategoryItem) => {
  isEdit.value = true;
  Object.assign(categoryForm, row);
};

// 删除分类
const handleDelete = async (row: CategoryItem) => {

  ElMessageBox.confirm(
    `确定要删除分类"${row.name}"吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      console.log(`Deleting category with ID ${row.id}`);

      // 调用API删除分类
      const result = await deleteMenu(row.id);
      console.log('Delete result:', result);

      // 更新前端数据
      categoryList.value = categoryList.value.filter(item => item.id !== row.id);

      ElMessage({
        type: 'success',
        message: '删除成功'
      });

      // 重新获取分类列表
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      ElMessage.error('删除失败');
    }
  }).catch(() => {});
};

// 保存分类
const handleSaveCategory = async () => {
  if (!categoryFormRef.value) return;

  try {
    const valid = await categoryFormRef.value.validate() as boolean;
    if (valid) {
      if (isEdit.value) {
        // 编辑现有分类
        try {
          console.log('Updating category with ID:', categoryForm.id);

          // 准备更新的数据
          const menuData = {
            Title: categoryForm.name,
            SubTitle: categoryForm.slug,
            Description: categoryForm.description,
            Content: categoryForm.content,
            Sorts: categoryForm.sort,
            MenuID: categoryForm.menuID || 0,
            Level: categoryForm.menuID && categoryForm.menuID > 0 ? 2 : 1,
            imgUrl: categoryForm.imgUrl || ''
          };

          console.log('Update data:', menuData);

          // 调用API更新分类
          const result = await updateMenu(categoryForm.id, menuData);
          console.log('Update result:', result);

          // 更新前端数据
          const index = categoryList.value.findIndex(item => item.id === categoryForm.id);
          if (index !== -1) {
            categoryList.value[index] = { ...categoryForm };
          }

          ElMessage({
            type: 'success',
            message: '修改成功'
          });

          resetForm();
          // 重新获取分类列表
          await fetchCategories();
        } catch (error) {
          console.error('Error updating category:', error);
          ElMessage.error('修改失败');
        }
      } else {
        // 添加新分类
        try {
          console.log('Creating new category:', categoryForm.name);

          // 准备创建的数据
          const menuData = {
            Title: categoryForm.name,
            SubTitle: categoryForm.slug,
            Description: categoryForm.description,
            Content: categoryForm.content,
            Sorts: categoryForm.sort,
            MenuID: categoryForm.menuID || 0,
            Level: categoryForm.menuID && categoryForm.menuID > 0 ? 2 : 1,
            imgUrl: categoryForm.imgUrl || ''
          };

          console.log('Create data:', menuData);

          // 调用API创建分类
          const result = await createMenu(menuData);
          console.log('Create result:', result);

          // 如果有返回的ID，使用返回的ID，否则生成一个新ID
          let newId;
          if (result && (result.id || result.ID || (result.insertId !== undefined))) {
            newId = result.id || result.ID || result.insertId;
          } else {
            newId = Math.max(...categoryList.value.map(item => item.id), 0) + 1;
          }

          console.log('New category ID:', newId);

          // 更新前端数据
          categoryList.value.push({
            ...categoryForm,
            id: newId
          });

          ElMessage({
            type: 'success',
            message: '添加成功'
          });

          resetForm();
          // 重新获取分类列表
          await fetchCategories();
        } catch (error) {
          console.error('Error creating category:', error);
          ElMessage.error('添加失败');
        }
      }
    }
  } catch (error) {
    console.error('Validation error:', error);
  }
};

// 开始编辑分类名称
const startEdit = (row: CategoryItem) => {
  editingId.value = row.id;
  editingName.value = row.name;
};

// 保存编辑的分类名称
const saveEdit = async (row: CategoryItem) => {
  if (!editingName.value.trim()) {
    ElMessage({
      type: 'warning',
      message: '分类名称不能为空'
    });
    editingId.value = null;
    return;
  }

  if (editingName.value === row.name) {
    // 名称没有改变
    editingId.value = null;
    return;
  }

  const oldName = row.name;

  try {
    // 获取令牌
    const token = localStorage.getItem('token');
    console.log('[saveEdit] Token:', token);

    if (!token) {
      ElMessage({
        type: 'error',
        message: '未登录，请先登录'
      });
      editingId.value = null;
      return;
    }

    // 调用API保存到数据库
    // 使用 Title 字段对应数据库中的分类名称
    const response = await fetch(`${getAPIBaseURL()}/menus/${row.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        Title: editingName.value
      })
    });

    console.log('[saveEdit] Response status:', response.status);
    const responseData = await response.json();
    console.log('[saveEdit] Response data:', responseData);

    if (!response.ok) {
      throw new Error(responseData.message || responseData.error || '保存失败');
    }

    // 更新本地数据
    row.name = editingName.value;
    editingId.value = null;

    // 显示成功提示
    ElMessage({
      type: 'success',
      message: `分类名称已从"${oldName}"更新为"${editingName.value}"`
    });
  } catch (error: any) {
    console.error('保存分类名称失败:', error);
    ElMessage({
      type: 'error',
      message: error.message || '保存失败，请重试'
    });
    editingId.value = null;
  }
};

// 开始编辑排序
const startEditSort = (row: CategoryItem) => {
  editingSortId.value = row.id;
  editingSortValue.value = row.sort;
};

// 排序值改变时自动保存
const handleSortChange = async (row: CategoryItem, newVal: number) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      ElMessage.error('未登录，请先登录');
      return;
    }

    const response = await fetch(`${getAPIBaseURL()}/menus/${row.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        Sorts: newVal
      })
    });

    if (!response.ok) {
      throw new Error('保存排序失败');
    }

    ElMessage.success('排序已保存');
  } catch (error: any) {
    console.error('保存排序失败:', error);
    ElMessage.error(error.message || '保存排序失败');
  }
};

// 排序输入框失去焦点时保存并恢复为标签
const handleSortBlur = async (row: CategoryItem) => {
  // 如果值没有变化，直接恢复为标签
  if (editingSortValue.value === row.sort) {
    editingSortId.value = null;
    return;
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      ElMessage.error('未登录，请先登录');
      editingSortId.value = null;
      return;
    }

    const response = await fetch(`${getAPIBaseURL()}/menus/${row.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        Sorts: editingSortValue.value
      })
    });

    if (!response.ok) {
      throw new Error('保存排序失败');
    }

    // 更新本地数据
    row.sort = editingSortValue.value;
    ElMessage.success('排序已保存');
  } catch (error: any) {
    console.error('保存排序失败:', error);
    ElMessage.error(error.message || '保存排序失败');
  } finally {
    // 恢复为标签显示
    editingSortId.value = null;
  }
};

// 保存编辑的排序
const saveSortEdit = async (row: CategoryItem) => {
  if (editingSortValue.value === row.sort) {
    // 排序没有改变
    editingSortId.value = null;
    return;
  }

  const oldSort = row.sort;

  try {
    // 获取令牌
    const token = localStorage.getItem('token');
    console.log('[saveSortEdit] Token:', token);

    if (!token) {
      ElMessage({
        type: 'error',
        message: '未登录，请先登录'
      });
      editingSortId.value = null;
      return;
    }

    // 调用API保存到数据库
    const response = await fetch(`${getAPIBaseURL()}/menus/${row.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        Sorts: editingSortValue.value
      })
    });

    console.log('[saveSortEdit] Response status:', response.status);
    const responseData = await response.json();
    console.log('[saveSortEdit] Response data:', responseData);

    if (!response.ok) {
      throw new Error(responseData.message || responseData.error || '保存失败');
    }

    // 更新本地数据
    row.sort = editingSortValue.value;
    editingSortId.value = null;

    // 显示成功提示
    ElMessage({
      type: 'success',
      message: `排序已从 ${oldSort} 更新为 ${editingSortValue.value}`
    });
  } catch (error: any) {
    console.error('保存排序失败:', error);
    ElMessage({
      type: 'error',
      message: error.message || '保存失败，请重试'
    });
    editingSortId.value = null;
  }
};

// 预览图片
const handlePreviewImage = (imgUrl: string) => {
  if (imgUrl) {
    previewImageUrl.value = imgUrl;
    showImagePreview.value = true;
  }
};

// 处理搜索
const handleSearch = () => {
  // 搜索功能通过计算属性 filteredCategoryList 实现
  // 这里可以添加额外的搜索逻辑，如显示搜索结果提示
  if (searchKeyword.value.trim()) {
    ElMessage.info(`找到 ${filteredCategoryList.value.length} 个匹配的分类`);
  } else {
    ElMessage.info(`显示全部 ${categoryList.value.length} 个分类`);
  }
};

// 在组件挂载时获取分类列表
onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.news-category-container {
  padding: 12px;
}

.page-title {
  margin-bottom: 10px;
  color: #409EFF;
}

.category-card, .category-list-card {
  margin-bottom: 10px;
}

.editable-cell {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  line-height: 1.4;
  font-size: 15px;
}

.editable-cell:hover {
  background-color: #f0f9ff;
  color: #409EFF;
}

.category-icon {
  color: #909399;
  margin-right: 8px;
  font-weight: bold;
}

.editable-sort-cell {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  line-height: 1.4;
  font-size: 15px;
  min-width: 20px;
  justify-content: center;
}

.editable-sort-cell:hover {
  background-color: #f0f9ff;
  color: #409EFF;
}

.thumbnail-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.thumbnail-image {
  width: 100px;
  height: 75px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #dcdfe6;
}

.thumbnail-image:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.no-image {
  color: #909399;
  font-size: 14px;
  text-align: center;
}

.image-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-height: 600px;
  overflow: auto;
}

.preview-image {
  max-width: 100%;
  max-height: 600px;
  border-radius: 4px;
}

.thumbnail-upload-container {
  width: 100%;
}

.thumbnail-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.preview-thumbnail {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.thumbnail-actions {
  display: flex;
  gap: 8px;
}

.thumbnail-upload-area {
  width: 100%;
}

.upload-progress {
  margin-top: 12px;
}

.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
}

.search-input {
  flex: 1;
  max-width: 300px;
}

.add-button {
  min-width: 100px;
}

</style>
