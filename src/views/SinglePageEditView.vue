<template>
  <div class="single-page-edit-container">
    <el-card class="page-card">
      <template #header>
        <div>
          <span>{{ isEdit ? '编辑单页' : '添加单页' }}</span>
        </div>
      </template>

      <el-form
        :model="pageForm"
        label-width="100px"
        :rules="rules"
        ref="pageFormRef"
        class="page-form"
        v-loading="loading"
      >
        <el-form-item label="页面标题" prop="title">
          <el-input v-model="pageForm.title" placeholder="请输入页面标题" />
        </el-form-item>

        <el-form-item label="副标题">
          <el-input v-model="pageForm.subTitle" placeholder="请输入副标题" />
        </el-form-item>

        <el-form-item label="缩略图">
          <el-upload
            class="avatar-uploader"
            action="#"
            :auto-upload="false"
            :on-change="handleThumbnailChange"
            :show-file-list="false"
          >
            <img v-if="pageForm.thumbnail" :src="pageForm.thumbnail" alt="缩略图" style="width: 100px; height: 100px; object-fit: cover;" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="描述">
          <el-input v-model="pageForm.description" type="textarea" :rows="3" placeholder="请输入页面描述" />
        </el-form-item>

        <el-form-item label="页面内容" prop="content">
          <div class="editor-container">
            <Toolbar
              style="border-bottom: 1px solid #ccc"
              :editor="editorRef"
              :defaultConfig="toolbarConfig"
            />
            <Editor
              style="height: 400px; overflow-y: hidden;"
              v-model="pageForm.content"
              :defaultConfig="editorConfig"
              @onCreated="handleCreated"
            />
          </div>
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="pageForm.sort" :min="0" :max="999" />
        </el-form-item>

        <div class="form-actions">
          <el-form-item>
            <el-button type="primary" @click="handleSavePage" :loading="loading">保存</el-button>
            <el-button @click="handleCancel" :disabled="loading">取消</el-button>
            <el-button v-if="isEdit" type="danger" @click="handleDeletePage" :loading="loading">删除</el-button>
          </el-form-item>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, shallowRef, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import '@wangeditor/editor/dist/css/style.css';
import { getPageById, createPage, updatePage } from '../API/page';
import { uploadThumbnail } from '../utils/uploadHelper';
import { getAPIBaseURL, getToken } from '../API/auth';

const router = useRouter();
const route = useRoute();

// 表单引用
const pageFormRef = ref<FormInstance>();

// 是否为编辑模式
const isEdit = ref(false);

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();

// 编辑器配置
const toolbarConfig = {};
const getApiBaseUrl = () => getAPIBaseURL() || 'http://127.0.0.1:3000';
const editorConfig = {
  placeholder: '请输入页面内容...',
  autoFocus: false,
  MENU_CONF: {
    uploadImage: {
      server: `${getApiBaseUrl()}/upload`,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      fieldName: 'file',
      maxFileSize: 5 * 1024 * 1024,
      allowedFileTypes: ['image/*'],
      customInsert(res: any, insertFn: any) {
        const url = res.data?.url || res.url;
        insertFn(url, '', '');
      }
    }
  },
  // 设置编辑器的其他配置
  hoverbarKeys: {
    text: {
      menuKeys: ['bold', 'italic', 'through', 'underline', 'code', 'clearStyle'],
    },
  },
};

// 编辑器创建完成后，设置默认对齐方式
const setEditorDefaultAlign = (editor: any) => {
  if (editor) {
    // 使用 setTimeout 确保 DOM 完全渲染
    setTimeout(() => {
      const editorDom = editor.getElem();
      if (!editorDom) return;

      // 强制设置所有相关元素的 text-align 为 left
      const setLeftAlign = () => {
        // 设置编辑器主容器
        const textContainer = editorDom.querySelector('.w-e-text-container');
        if (textContainer) {
          textContainer.style.setProperty('text-align', 'left', 'important');
        }

        // 设置 slate 编辑器
        const slateEditor = editorDom.querySelector('[data-slate-editor]');
        if (slateEditor) {
          slateEditor.style.setProperty('text-align', 'left', 'important');
        }

        // 设置所有段落元素
        const allElements = editorDom.querySelectorAll('.w-e-text-container p, .w-e-text-container div, .w-e-text-container h1, .w-e-text-container h2, .w-e-text-container h3, .w-e-text-container h4, .w-e-text-container h5, .w-e-text-container h6');
        allElements.forEach((el: any) => {
          el.style.setProperty('text-align', 'left', 'important');
        });
      };

      // 立即执行一次
      setLeftAlign();

      // 监听内容变化
      editor.on('change', setLeftAlign);

      // 使用 MutationObserver 监听 DOM 变化
      const observer = new MutationObserver(setLeftAlign);
      const textContainer = editorDom.querySelector('.w-e-text-container');
      if (textContainer) {
        observer.observe(textContainer, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style']
        });
      }
    }, 100);
  }
};

// 组件销毁时，销毁编辑器实例
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

// 编辑器创建完成时的回调
const handleCreated = (editor: any) => {
  editorRef.value = editor;
  // 设置默认对齐方式为左对齐
  setEditorDefaultAlign(editor);
};

// 单页表单数据
interface PageForm {
  id: number;
  title: string;
  slug: string;
  subTitle: string;
  thumbnail: string;
  description: string;
  content: string;
  sort: number;
  createTime: string;
  updateTime: string;
}

const pageForm = reactive<PageForm>({
  id: 0,
  title: '',
  slug: '',
  subTitle: '',
  thumbnail: '',
  description: '',
  content: '',
  sort: 0,
  createTime: '',
  updateTime: ''
});

// 加载状态
const loading = ref(false);

// 表单验证规则 - 只有标题是必填项
const rules = {
  title: [
    { required: true, message: '请输入页面标题', trigger: 'blur' },
    { min: 2, max: 255, message: '长度在 2 到 255 个字符', trigger: 'blur' }
  ]
};

// 处理缩略图上传
const handleThumbnailChange = async (file: any) => {
  if (!file || !file.raw) return;

  try {
    const loadingInstance = ElLoading.service({
      target: document.querySelector('.single-page-edit-container') as HTMLElement || undefined,
      text: '图片上传中...'
    });

    const url = await uploadThumbnail(file.raw);

    if (url) {
      pageForm.thumbnail = url;
      ElMessage({
        type: 'success',
        message: '图片上传成功'
      });
    }

    loadingInstance.close();
  } catch (error) {
    console.error('Error uploading thumbnail:', error);
    ElMessage({
      type: 'error',
      message: '图片上传失败'
    });
  }
};

// 获取页面数据
const loadPageData = async (id: number) => {
  try {
    loading.value = true;
    const pageData = await getPageById(id);
    if (pageData) {
      // 映射后端返回的数据到前端期望的格式
      const mappedData = {
        id: pageData.ID || pageData.id || 0,
        title: pageData.Title || pageData.title || '',
        slug: pageData.Slug || pageData.slug || '',
        subTitle: pageData.SubTitle || pageData.subTitle || '',
        thumbnail: pageData.imgUrl || pageData.thumbnail || '',
        description: pageData.Description || pageData.description || '',
        content: pageData.Content || pageData.content || '',
        sort: pageData.Sorts || pageData.sort || 0,
        createTime: pageData.CreateTime || pageData.createTime || '',
        updateTime: pageData.UpdateTime || pageData.updateTime || ''
      };
      Object.assign(pageForm, mappedData);
      console.log('Loaded page data:', mappedData);
    } else {
      ElMessage.error('页面不存在');
      router.push('/single-page');
    }
  } catch (error) {
    console.error('加载页面数据失败:', error);
    ElMessage.error('加载页面数据失败');
    router.push('/single-page');
  } finally {
    loading.value = false;
  }
};

// 保存页面
const handleSavePage = async () => {
  if (!pageFormRef.value) return;

  try {
    const valid = await pageFormRef.value.validate();
    if (valid) {
      loading.value = true;

      if (isEdit.value) {
        // 编辑模式：更新现有页面
        await updatePage(pageForm.id, {
          title: pageForm.title,
          subTitle: pageForm.subTitle,
          imgUrl: pageForm.thumbnail,
          description: pageForm.description,
          content: pageForm.content,
          sort: pageForm.sort
        });
        ElMessage({
          type: 'success',
          message: '页面更新成功'
        });
      } else {
        // 新增模式：添加新页面
        await createPage({
          title: pageForm.title,
          subTitle: pageForm.subTitle,
          imgUrl: pageForm.thumbnail,
          description: pageForm.description,
          content: pageForm.content,
          sort: pageForm.sort
        });
        ElMessage({
          type: 'success',
          message: '页面添加成功'
        });
      }

      // 跳转到单页列表页
      router.push('/single-page');
    }
  } catch (error) {
    console.error('保存页面失败:', error);
    ElMessage({
      type: 'error',
      message: '保存页面失败'
    });
  } finally {
    loading.value = false;
  }
};

// 取消
const handleCancel = () => {
  ElMessageBox.confirm(
    '确定要取消编辑吗？未保存的数据将丢失',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    router.push('/single-page');
  }).catch(() => {});
};

// 删除页面
const handleDeletePage = () => {
  ElMessageBox.confirm(
    '确定要删除此页面吗？此操作不可撤销',
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      loading.value = true;
      await updatePage(pageForm.id, {
        title: pageForm.title,
        subTitle: pageForm.subTitle,
        imgUrl: pageForm.thumbnail,
        description: pageForm.description,
        content: pageForm.content,
        sort: pageForm.sort,
        deleted: 1
      });
      ElMessage({
        type: 'success',
        message: '页面已删除'
      });
      router.push('/single-page');
    } catch (error) {
      console.error('删除页面失败:', error);
      ElMessage({
        type: 'error',
        message: '删除页面失败'
      });
    } finally {
      loading.value = false;
    }
  }).catch(() => {});
};

onMounted(() => {
  // 检查是否为编辑模式
  const id = route.query.id;
  if (id) {
    isEdit.value = true;
    const pageId = parseInt(id as string);

    // 加载页面数据
    loadPageData(pageId);
  }
});
</script>

<style scoped>
.single-page-edit-container {
  padding: 20px;
}

.page-card {
  margin-bottom: 20px;
}

.page-form {
  max-width: 1000px;
}

.form-actions {
  margin-top: 20px;
  border-top: 1px solid #EBEEF5;
  padding-top: 20px;
}

.editor-container {
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  margin-bottom: 20px;
}

.editor-container .w-e-toolbar {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  z-index: 1;
}

.editor-container .w-e-text-container {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

/* 设置编辑器内容默认左对齐 - 全面覆盖 */
.editor-container .w-e-text-container,
.editor-container .w-e-text-container p,
.editor-container .w-e-text-container div,
.editor-container .w-e-text-container [data-slate-editor],
.editor-container .w-e-text-container [data-slate-node="element"],
.editor-container .w-e-text {
  text-align: left !important;
}

/* 确保所有段落元素都是左对齐 */
.editor-container .w-e-text-container h1,
.editor-container .w-e-text-container h2,
.editor-container .w-e-text-container h3,
.editor-container .w-e-text-container h4,
.editor-container .w-e-text-container h5,
.editor-container .w-e-text-container h6,
.editor-container .w-e-text-container ul,
.editor-container .w-e-text-container ol,
.editor-container .w-e-text-container blockquote,
.editor-container .w-e-text-container pre {
  text-align: left !important;
}

.slug-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: inline-block;
}

.avatar-uploader:hover {
  border-color: #40a9ff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
