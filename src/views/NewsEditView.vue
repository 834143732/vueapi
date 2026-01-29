<template>
  <div class="news-edit-container">

    <el-card class="news-card">
      <el-form
        :model="newsForm"
        label-width="100px"
        :rules="rules"
        ref="newsFormRef"
        class="news-form"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="newsForm.title" placeholder="请输入标题" />
        </el-form-item>

        <el-form-item label="分类" prop="categoryId">
          <el-select
            v-model="newsForm.categoryId"
            placeholder="请选择分类"
            style="width: 100%"
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.id"
              :label="item.displayName || item.name"
              :value="item.id"
              :class="`category-depth-${item.depth || 0}`"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="缩略图" prop="coverImage">
          <el-upload
            class="news-image-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleCoverImageChange"
          >
            <img v-if="newsForm.coverImage" :src="newsForm.coverImage" class="news-image" />
            <el-icon v-else class="news-image-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="image-tip">建议尺寸: 800 x 450 像素</div>
        </el-form-item>

        <el-form-item label="缩略图1" v-if="accountConfig.imgUrlCount >= 1">
          <el-upload
            class="news-image-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="(file: any) => handleExtraImageChange(file, 1)"
          >
            <img v-if="newsForm.imgUrl1" :src="newsForm.imgUrl1" class="news-image" />
            <el-icon v-else class="news-image-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="缩略图2" v-if="accountConfig.imgUrlCount >= 2">
          <el-upload
            class="news-image-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="(file: any) => handleExtraImageChange(file, 2)"
          >
            <img v-if="newsForm.imgUrl2" :src="newsForm.imgUrl2" class="news-image" />
            <el-icon v-else class="news-image-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="缩略图3" v-if="accountConfig.imgUrlCount >= 3">
          <el-upload
            class="news-image-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="(file: any) => handleExtraImageChange(file, 3)"
          >
            <img v-if="newsForm.imgUrl3" :src="newsForm.imgUrl3" class="news-image" />
            <el-icon v-else class="news-image-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="缩略图4" v-if="accountConfig.imgUrlCount >= 4">
          <el-upload
            class="news-image-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="(file: any) => handleExtraImageChange(file, 4)"
          >
            <img v-if="newsForm.imgUrl4" :src="newsForm.imgUrl4" class="news-image" />
            <el-icon v-else class="news-image-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="缩略图5" v-if="accountConfig.imgUrlCount >= 5">
          <el-upload
            class="news-image-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="(file: any) => handleExtraImageChange(file, 5)"
          >
            <img v-if="newsForm.imgUrl5" :src="newsForm.imgUrl5" class="news-image" />
            <el-icon v-else class="news-image-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="摘要" prop="summary">
          <el-input
            v-model="newsForm.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入新闻摘要"
          />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <div class="editor-container">
            <div class="editor-toolbar-wrapper">
              <Toolbar
                style="flex: 1;"
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
              />
              <el-button type="info" size="small" @click="showSourceCode(1)" class="source-btn">
                &lt;/&gt; 源代码
              </el-button>
            </div>
            <Editor
              style="height: 400px; overflow-y: hidden;"
              v-model="newsForm.content"
              :defaultConfig="editorConfig"
              @onCreated="handleCreated"
            />
          </div>
        </el-form-item>

        <el-form-item label="内容1" prop="content1" v-if="accountConfig.contentCount >= 1">
          <div class="editor-container">
            <div class="editor-toolbar-wrapper">
              <Toolbar
                style="flex: 1;"
                :editor="editorRef2"
                :defaultConfig="toolbarConfig"
              />
              <el-button type="info" size="small" @click="showSourceCode(2)" class="source-btn">
                &lt;/&gt; 源代码
              </el-button>
            </div>
            <Editor
              style="height: 400px; overflow-y: hidden;"
              v-model="newsForm.content1"
              :defaultConfig="editorConfig2"
              @onCreated="handleCreated2"
            />
          </div>
        </el-form-item>

        <el-form-item label="内容2" prop="content2" v-if="accountConfig.contentCount >= 2">
          <div class="editor-container">
            <div class="editor-toolbar-wrapper">
              <Toolbar
                style="flex: 1;"
                :editor="editorRef3"
                :defaultConfig="toolbarConfig"
              />
              <el-button type="info" size="small" @click="showSourceCode(3)" class="source-btn">
                &lt;/&gt; 源代码
              </el-button>
            </div>
            <Editor
              style="height: 400px; overflow-y: hidden;"
              v-model="newsForm.content2"
              :defaultConfig="editorConfig3"
              @onCreated="handleCreated3"
            />
          </div>
        </el-form-item>

        <el-form-item label="内容3" prop="content3" v-if="accountConfig.contentCount >= 3">
          <div class="editor-container">
            <div class="editor-toolbar-wrapper">
              <Toolbar
                style="flex: 1;"
                :editor="editorRef4"
                :defaultConfig="toolbarConfig"
              />
              <el-button type="info" size="small" @click="showSourceCode(4)" class="source-btn">
                &lt;/&gt; 源代码
              </el-button>
            </div>
            <Editor
              style="height: 400px; overflow-y: hidden;"
              v-model="newsForm.content3"
              :defaultConfig="editorConfig4"
              @onCreated="handleCreated4"
            />
          </div>
        </el-form-item>

        <!-- 源代码编辑模态框 -->
        <el-dialog
          v-model="sourceCodeDialog.visible"
          :title="'编辑源代码 - ' + (['内容', '内容1', '内容2', '内容3'][sourceCodeDialog.editorIndex - 1] || '内容')"
          width="80%"
          :close-on-click-modal="false"
        >
          <el-input
            v-model="sourceCodeDialog.html"
            type="textarea"
            :rows="20"
            placeholder="在此编辑 HTML 源代码..."
            style="font-family: monospace;"
          />
          <template #footer>
            <el-button @click="sourceCodeDialog.visible = false">取消</el-button>
            <el-button type="primary" @click="applySourceCode">应用</el-button>
          </template>
        </el-dialog>

        <el-form-item label="SEO标题" v-if="accountConfig.seoConfig === 1">
          <el-input v-model="newsForm.seoTitle" placeholder="请输入SEO标题" />
        </el-form-item>

        <el-form-item label="SEO关键词" v-if="accountConfig.seoConfig === 1">
          <el-input v-model="newsForm.seoKeyword" placeholder="请输入SEO关键词，多个关键词用逗号分隔" />
        </el-form-item>

        <el-form-item label="SEO描述" v-if="accountConfig.seoConfig === 1">
          <el-input
            v-model="newsForm.seoDescription"
            type="textarea"
            :rows="2"
            placeholder="请输入SEO描述"
          />
        </el-form-item>

        <el-form-item label="发布时间">
          <el-date-picker
            v-model="newsForm.publishTime"
            type="datetime"
            placeholder="选择发布时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="是否推荐">
          <el-switch
            v-model="newsForm.isRecommend"
            :active-value="1"
            :inactive-value="0"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="newsForm.sort" :min="0" :max="999" />
        </el-form-item>

        <div class="form-actions">
          <el-form-item>
            <el-button type="primary" @click="handleSaveNews">保存</el-button>
            <el-button @click="handleCancel">取消</el-button>
            <el-button v-if="isEdit" type="danger" @click="handleDeleteNews">删除</el-button>
          </el-form-item>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, shallowRef, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import type { FormInstance, UploadFile } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import '@wangeditor/editor/dist/css/style.css';
import { getItemById, updateItem, createItem, deleteItem } from '../API/items';
import { getMenus } from '../API/menus';
import { uploadThumbnail } from '../utils/uploadHelper';
import { getAPIBaseURL, getImageBaseURL, getToken } from '../API/auth';

const router = useRouter();
const route = useRoute();

// 表单引用
const newsFormRef = ref<FormInstance>();

// 是否为编辑模式
const isEdit = ref(false);

// 账户配置 - 控制表单字段显示
const accountConfig = reactive({
  imgUrlCount: 0,  // 0-5: 控制缩略图字段数量
  contentCount: 0, // 0-3: 控制内容字段数量
  seoConfig: 0     // 0-1: 是否显示 SEO 字段
});

// 从 localStorage 读取账户配置
const loadAccountConfig = () => {
  try {
    const configStr = localStorage.getItem('accountConfig');
    if (configStr) {
      const config = JSON.parse(configStr);
      accountConfig.imgUrlCount = config.imgUrlCount || 0;
      accountConfig.contentCount = config.contentCount || 0;
      accountConfig.seoConfig = config.seoConfig || 0;
      console.log('Account config loaded:', accountConfig);
    }
  } catch (error) {
    console.error('Failed to load account config:', error);
  }
};

// 标签相关
const inputTagVisible = ref(false);
const inputTagValue = ref('');
const tagInputRef = ref();

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();
const editorRef2 = shallowRef();
const editorRef3 = shallowRef();
const editorRef4 = shallowRef();

// 编辑器配置
const toolbarConfig = {};
const getApiBaseUrl = () => getAPIBaseURL() || 'http://127.0.0.1:3000';
const editorConfig = {
  placeholder: '请输入内容...',
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
  }
};

const editorConfig2 = {
  placeholder: '请输入内容1...',
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
  }
};

const editorConfig3 = {
  placeholder: '请输入内容2...',
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
  }
};

const editorConfig4 = {
  placeholder: '请输入内容3...',
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
  }
};

// 移除 URL 前缀，只保存相对路径到数据库
const removeUrlPrefix = (url: string): string => {
  if (!url) return '';
  // 匹配 http://xxx:port/ 或 https://xxx:port/ 前缀
  const prefixPattern = /^https?:\/\/[^\/]+/;
  return url.replace(prefixPattern, '');
};

// 添加 URL 前缀，用于显示图片
const addUrlPrefix = (url: string): string => {
  if (!url) return '';
  // 如果已经有完整 URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // 添加 API 基础 URL，移除末尾斜杠避免双斜杠
  let baseUrl = getImageBaseURL() || getAPIBaseURL() || 'http://127.0.0.1:3000';
  baseUrl = baseUrl.replace(/\/+$/, ''); // 移除末尾斜杠
  // 规范化 url 开头的斜杠（移除多余的斜杠，确保只有一个）
  const cleanUrl = url.replace(/^\/+/, '');
  return `${baseUrl}/${cleanUrl}`;
};

// 处理富文本内容中的图片URL，添加前缀
const addUrlPrefixToContentImages = (htmlContent: string): string => {
  if (!htmlContent) return '';
  
  // 正则匹配 img 标签的 src 属性
  return htmlContent.replace(/(<img[^>]+src=["'])([^"']+)(["'][^>]*>)/gi, (match, prefix, url, suffix) => {
    // 如果 URL 已经有完整的 http/https 前缀，不做处理
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return match;
    }
    // 添加 URL 前缀
    const fullUrl = addUrlPrefix(url);
    return `${prefix}${fullUrl}${suffix}`;
  });
};

// 移除富文本内容中的图片URL前缀，只保存相对路径到数据库
const removeUrlPrefixFromContentImages = (htmlContent: string): string => {
  if (!htmlContent) return '';
  
  // 正则匹配 img 标签的 src 属性
  return htmlContent.replace(/(<img[^>]+src=["'])([^"']+)(["'][^>]*>)/gi, (match, prefix, url, suffix) => {
    // 移除 URL 前缀
    const relativeUrl = removeUrlPrefix(url);
    return `${prefix}${relativeUrl}${suffix}`;
  });
};

// 源代码编辑模态框状态
const sourceCodeDialog = reactive({
  visible: false,
  html: '',
  editorIndex: 1 as 1 | 2 | 3 | 4
});

// 显示源代码
const showSourceCode = (editorIndex: 1 | 2 | 3 | 4) => {
  sourceCodeDialog.editorIndex = editorIndex;
  if (editorIndex === 1) {
    sourceCodeDialog.html = newsForm.content || '';
  } else if (editorIndex === 2) {
    sourceCodeDialog.html = newsForm.content1 || '';
  } else if (editorIndex === 3) {
    sourceCodeDialog.html = newsForm.content2 || '';
  } else {
    sourceCodeDialog.html = newsForm.content3 || '';
  }
  sourceCodeDialog.visible = true;
};

// 应用源代码
const applySourceCode = () => {
  const html = sourceCodeDialog.html;
  const editorIndex = sourceCodeDialog.editorIndex;

  // 先关闭模态框
  sourceCodeDialog.visible = false;

  // 更新表单数据（这是真正保存到数据库的数据）
  if (editorIndex === 1) {
    newsForm.content = html;
  } else if (editorIndex === 2) {
    newsForm.content1 = html;
  } else if (editorIndex === 3) {
    newsForm.content2 = html;
  } else {
    newsForm.content3 = html;
  }

  // 提示用户
  ElMessage.success('源代码已应用（编辑器显示可能简化，但保存的是完整HTML）');
};


// 组件销毁时，销毁编辑器实例
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor != null) {
    editor.destroy();
  }
  const editor2 = editorRef2.value;
  if (editor2 != null) {
    editor2.destroy();
  }
  const editor3 = editorRef3.value;
  if (editor3 != null) {
    editor3.destroy();
  }
  const editor4 = editorRef4.value;
  if (editor4 != null) {
    editor4.destroy();
  }
});

// 编辑器创建完成时的回调
const handleCreated = (editor: any) => {
  editorRef.value = editor;
};

// 编辑器2创建完成时的回调
const handleCreated2 = (editor: any) => {
  editorRef2.value = editor;
};

// 编辑器3创建完成时的回调
const handleCreated3 = (editor: any) => {
  editorRef3.value = editor;
};

// 编辑器4创建完成时的回调
const handleCreated4 = (editor: any) => {
  editorRef4.value = editor;
};

// 新闻表单数据
interface NewsForm {
  id: number;
  title: string;
  categoryId: number;
  coverImage: string;
  imgUrl1: string;
  imgUrl2: string;
  imgUrl3: string;
  imgUrl4: string;
  imgUrl5: string;
  summary: string;
  content: string;   // 对应数据库 Content
  content1: string;  // 对应数据库 Content1
  content2: string;  // 对应数据库 Content2
  content3: string;  // 对应数据库 Content3
  author: string;
  source: string;
  seoTitle: string;
  seoKeyword: string;
  seoDescription: string;
  publishTime: string | Date; // 可以是字符串或 Date 对象
  isTop: number; // 1: 是, 0: 否
  isRecommend: number; // 1: 是, 0: 否
  status: number; // 1: 发布, 0: 草稿
  sort: number;
  tags: string[];
  viewCount: number;
}

// 分类选项接口
interface CategoryOption {
  id: number;
  name: string;
  displayName?: string; // 可选属性
  menuID?: number;
  sort?: number;
  depth?: number; // 层级深度
}

const newsForm = reactive<NewsForm>({
  id: 0,
  title: '',
  categoryId: 0,
  coverImage: '',
  imgUrl1: '',
  imgUrl2: '',
  imgUrl3: '',
  imgUrl4: '',
  imgUrl5: '',
  summary: '',
  content: '',
  content1: '',
  content2: '',
  content3: '',
  author: '',
  source: '',
  seoTitle: '',
  seoKeyword: '',
  seoDescription: '',
  publishTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
  isTop: 0,
  isRecommend: 0,
  status: 1,
  sort: 0,
  tags: [],
  viewCount: 0
});

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 255, message: '长度在 2 到 255 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ]
};

// 分类选项（模拟数据）
const categoryOptions = ref<CategoryOption[]>([
  {
    id: 1,
    name: '公司新闻'
  },
  {
    id: 2,
    name: '行业动态'
  },
  {
    id: 3,
    name: '技术分享'
  },
  {
    id: 4,
    name: '活动公告'
  }
]);

// 处理缩略图上传
const handleCoverImageChange = async (file: UploadFile) => {
  try {
    if (!file.raw) {
      ElMessage.error('文件读取失败');
      return;
    }

    // 显示加载状态
    const loadingInstance = ElLoading.service({
      fullscreen: false,
      text: '图片上传中...'
    });

    try {
      // 上传图片到服务器
      const uploadedUrl = await uploadThumbnail(file.raw);

      if (uploadedUrl) {
        // 设置表单中的图片URL
        newsForm.coverImage = uploadedUrl;
        ElMessage.success('图片上传成功');
        console.log('Uploaded image URL:', uploadedUrl);
      } else {
        ElMessage.error('图片上传失败');
      }
    } finally {
      // 关闭加载状态
      loadingInstance.close();
    }
  } catch (error) {
    console.error('Error uploading cover image:', error);
    ElMessage.error('图片上传失败');
  }
};

// 处理额外缩略图上传
const handleExtraImageChange = async (file: UploadFile, index: number) => {
  try {
    if (!file.raw) {
      ElMessage.error('文件读取失败');
      return;
    }

    const loadingInstance = ElLoading.service({
      fullscreen: false,
      text: '图片上传中...'
    });

    try {
      const uploadedUrl = await uploadThumbnail(file.raw);

      if (uploadedUrl) {
        // 根据 index 设置对应的图片URL
        switch (index) {
          case 1:
            newsForm.imgUrl1 = uploadedUrl;
            break;
          case 2:
            newsForm.imgUrl2 = uploadedUrl;
            break;
          case 3:
            newsForm.imgUrl3 = uploadedUrl;
            break;
          case 4:
            newsForm.imgUrl4 = uploadedUrl;
            break;
          case 5:
            newsForm.imgUrl5 = uploadedUrl;
            break;
        }
        ElMessage.success('图片上传成功');
        console.log(`Uploaded image ${index} URL:`, uploadedUrl);
      } else {
        ElMessage.error('图片上传失败');
      }
    } finally {
      loadingInstance.close();
    }
  } catch (error) {
    console.error('Error uploading extra image:', error);
    ElMessage.error('图片上传失败');
  }
};

// 显示标签输入框
const showTagInput = () => {
  inputTagVisible.value = true;
  nextTick(() => {
    tagInputRef.value.focus();
  });
};

// 添加标签
const handleAddTag = () => {
  if (inputTagValue.value) {
    if (!newsForm.tags.includes(inputTagValue.value)) {
      newsForm.tags.push(inputTagValue.value);
    }
  }
  inputTagVisible.value = false;
  inputTagValue.value = '';
};
//FIXME: 12121
// 移除标签
const handleRemoveTag = (tag: string) => {
  newsForm.tags = newsForm.tags.filter(item => item !== tag);
};

// 保存新闻
const handleSaveNews = async () => {
  if (!newsFormRef.value) return;

  try {
    const valid = await newsFormRef.value.validate();
    if (valid) {
      // 格式化 AddTime 为 MySQL 可以接受的格式
      let formattedAddTime = '';
      if (newsForm.publishTime) {
        if (typeof newsForm.publishTime === 'string') {
          // 如果是 ISO 格式的字符串，转换为 MySQL 格式
          if (newsForm.publishTime.includes('T')) {
            formattedAddTime = newsForm.publishTime.slice(0, 19).replace('T', ' ');
          } else {
            // 已经是 MySQL 格式
            formattedAddTime = newsForm.publishTime;
          }
        } else if (newsForm.publishTime instanceof Date) {
          // 如果是 Date 对象，转换为字符串
          formattedAddTime = newsForm.publishTime.toISOString().slice(0, 19).replace('T', ' ');
        } else {
          // 其他情况，尝试转换
          formattedAddTime = new Date(newsForm.publishTime).toISOString().slice(0, 19).replace('T', ' ');
        }
      } else {
        // 如果没有设置发布时间，使用当前时间
        formattedAddTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      }

      // 准备要保存的数据，映射到数据库字段
      const itemData = {
        Title: newsForm.title,
        MenuID: newsForm.categoryId,
        ImgUrl: removeUrlPrefix(newsForm.coverImage),  // 使用大写 ImgUrl
        ImgUrl1: removeUrlPrefix(newsForm.imgUrl1),
        ImgUrl2: removeUrlPrefix(newsForm.imgUrl2),
        ImgUrl3: removeUrlPrefix(newsForm.imgUrl3),
        ImgUrl4: removeUrlPrefix(newsForm.imgUrl4),
        ImgUrl5: removeUrlPrefix(newsForm.imgUrl5),
        Description: newsForm.summary,
        Content: removeUrlPrefixFromContentImages(newsForm.content),
        Content1: removeUrlPrefixFromContentImages(newsForm.content1),
        Content2: removeUrlPrefixFromContentImages(newsForm.content2),
        Content3: removeUrlPrefixFromContentImages(newsForm.content3),
        AddTime: formattedAddTime,
        IsRecommend: newsForm.isRecommend,
        IsShow: 1, // 默认发布
        Sorts: newsForm.sort,
        Reading: newsForm.viewCount,
        SEOTitle: newsForm.seoTitle,
        SEOKeyword: newsForm.seoKeyword,
        SEODescription: newsForm.seoDescription
      };



      try {
        if (isEdit.value && newsForm.id) {
          // 更新现有新闻
          await updateItem(newsForm.id, itemData);
          ElMessage({
            type: 'success',
            message: '新闻更新成功'
          });
        } else {
          // 创建新新闻
          await createItem(itemData);
          ElMessage({
            type: 'success',
            message: '新闻添加成功'
          });
        }

        // 根据类型跳转到相应的列表页
        const isNewsManage = route.query.type === 'news';
        router.push(isNewsManage ? '/news-manage' : '/news-list');
      } catch (apiError) {
        console.error('API error:', apiError);
        ElMessage.error(isEdit.value ? '更新新闻失败' : '添加新闻失败');
      }
    }
  } catch (error) {
    console.error('Validation failed', error);
    return;
  }
};

// 删除新闻
const handleDeleteNews = () => {
  ElMessageBox.confirm(
    `确定要删除 "${newsForm.title}" 吗？此操作不可撤销`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      if (newsForm.id) {
        await deleteItem(newsForm.id);
        ElMessage({
          type: 'success',
          message: '删除成功'
        });
        const isNewsManage = route.query.type === 'news';
        router.push(isNewsManage ? '/news-manage' : '/news-list');
      }
    } catch (error) {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }).catch(() => {
    // 用户取消删除
  });
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
    const isNewsManage = route.query.type === 'news';
    router.push(isNewsManage ? '/news-manage' : '/news-list');
  }).catch(() => {});
};

// 加载新闻数据
const loadNewsData = async (id: number) => {
  try {
    const itemData = await getItemById(id);
    if (itemData) {
      // 格式化 AddTime 为正确的字符串格式
      let formattedAddTime = '';
      if (itemData.AddTime) {
        if (typeof itemData.AddTime === 'string') {
          // 如果已经是字符串，直接使用
          formattedAddTime = itemData.AddTime;
        } else if (itemData.AddTime instanceof Date) {
          // 如果是 Date 对象，转换为字符串
          formattedAddTime = itemData.AddTime.toISOString().slice(0, 19).replace('T', ' ');
        } else {
          // 其他情况，尝试转换
          formattedAddTime = new Date(itemData.AddTime).toISOString().slice(0, 19).replace('T', ' ');
        }
      }

      // 映射数据库字段到表单字段
      Object.assign(newsForm, {
        id: itemData.ID || 0,
        title: itemData.Title || '',
        categoryId: itemData.MenuID || 0,
        coverImage: addUrlPrefix(itemData.ImgUrl || itemData.Image || itemData.ImgUrl || ''),  // 添加 URL 前缀用于显示
        imgUrl1: addUrlPrefix(itemData.ImgUrl1 || ''),
        imgUrl2: addUrlPrefix(itemData.ImgUrl2 || ''),
        imgUrl3: addUrlPrefix(itemData.ImgUrl3 || ''),
        imgUrl4: addUrlPrefix(itemData.ImgUrl4 || ''),
        imgUrl5: addUrlPrefix(itemData.ImgUrl5 || ''),
        summary: itemData.Description || '',
        content: addUrlPrefixToContentImages(itemData.Content || ''),
        content1: addUrlPrefixToContentImages(itemData.Content1 || ''),
        content2: addUrlPrefixToContentImages(itemData.Content2 || ''),
        content3: addUrlPrefixToContentImages(itemData.Content3 || ''),
        author: itemData.Parameter1 || '',
        source: itemData.Parameter2 || '',
        seoTitle: itemData.SEOTitle || '',
        seoKeyword: itemData.SEOKeyword || '',
        seoDescription: itemData.SEODescription || '',
        publishTime: formattedAddTime,
        isTop: itemData.IsTop || 0,
        isRecommend: itemData.IsRecommend || 0,
        status: itemData.IsShow || 0,
        sort: itemData.Sorts || 0,
        tags: [],
        viewCount: itemData.Reading || 0
      });
    } else {
      ElMessage.error('新闻不存在');
      const isNewsManage = route.query.type === 'news';
      router.push(isNewsManage ? '/news-manage' : '/news-list');
    }
  } catch (error) {
    console.error('加载新闻数据失败:', error);
    ElMessage.error('加载新闻数据失败');
    const isNewsManage = route.query.type === 'news';
    router.push(isNewsManage ? '/news-manage' : '/news-list');
  }
};

// 按层级排序分类
const sortCategoriesByHierarchy = (items: any[]): any[] => {
  const result: any[] = [];
  const itemMap = new Map<number, any[]>();

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

// 加载分类数据
const loadCategories = async () => {
  try {
    const response = await getMenus();
    const menus = Array.isArray(response) ? response : (response.data || []);

    // 检查是否为新闻管理模式
    const isNewsManage = route.query.type === 'news';

    // 映射字段并添加层级信息
    let mappedCategories = menus.map((menu: any) => ({
      id: menu.ID || 0,
      name: menu.Title || 'Unnamed Category',
      menuID: menu.MenuID || 0,
      sort: menu.Sorts || 0
    }));

    // 如果是新闻管理模式，只显示 ID=2 的分类及其子分类
    if (isNewsManage) {
      // 显示 ID=2 本身和 MenuID=2 的所有子分类
      mappedCategories = mappedCategories.filter((menu: any) => menu.id === 2 || menu.menuID === 2);
    } else {
      // 列表管理模式，排除 ID=2 的新闻分类及其子分类
      mappedCategories = mappedCategories.filter((menu: any) => menu.id !== 2 && menu.menuID !== 2);
    }

    // 按层级排序
    const sortedCategories = sortCategoriesByHierarchy(mappedCategories);
    categoryOptions.value = sortedCategories;

    return sortedCategories;
  } catch (error) {
    console.error('加载分类失败:', error);
    return [];
  }
};

onMounted(async () => {
  // 加载账户配置
  loadAccountConfig();
  
  // 先加载分类数据
  const loadedCategories = await loadCategories();

  // 检查是否为编辑模式
  const id = route.query.id;
  if (id) {
    isEdit.value = true;
    const itemId = parseInt(id as string);
    // 加载新闻数据
    await loadNewsData(itemId);
  } else {
    // 新增模式
    const isNewsManage = route.query.type === 'news';
    if (isNewsManage) {
      // 新闻管理模式：默认选择 ID=2 的分类或其子分类
      // 优先选择 ID=2 的子分类，如果没有则选择 ID=2
      console.log('Loaded categories:', loadedCategories);

      // 从加载的分类中查找 MenuID=2 的子分类
      const newsSubCategories = loadedCategories.filter((cat: any) => cat.menuID === 2);
      console.log('News sub-categories (MenuID=2):', newsSubCategories);

      if (newsSubCategories.length > 0) {
        // 有子分类，选择第一个子分类
        newsForm.categoryId = newsSubCategories[0].id;
        console.log('Set default category to sub-category:', newsSubCategories[0].id, newsSubCategories[0].name);
      } else {
        // 没有子分类，直接选择 ID=2
        newsForm.categoryId = 2;
        console.log('Set default category to: 2 (News category itself)');
      }
    }
  }
});
</script>

<style scoped>
.news-edit-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  color: #409EFF;
}

.news-card {
  margin-bottom: 20px;
}

.news-form {
  max-width: 1000px;
}

.form-actions {
  margin-top: 20px;
  border-top: 1px solid #EBEEF5;
  padding-top: 20px;
}

.news-image-uploader {
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

.news-image-uploader:hover {
  border-color: #409EFF;
}

.news-image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 112px;
  line-height: 112px;
  text-align: center;
}

.news-image {
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

.editor-container {
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  margin-bottom: 20px;
}

.editor-toolbar-wrapper {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ccc;
}

.source-btn {
  margin: 4px 8px;
  white-space: nowrap;
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

/* 编辑器内容样式 - 允许 HTML 内联样式生效 */
.editor-container :deep(.w-e-text-container) {
  text-align: left;
}

.editor-container :deep(.w-e-text-container p),
.editor-container :deep(.w-e-text p),
.editor-container :deep([data-slate-node="element"]) {
  /* 不使用 !important，允许内联样式覆盖 */
  text-align: inherit;
}

/* 保留 HTML 中的样式 */
.editor-container :deep([style]) {
  /* 允许内联样式生效 */
}

.editor-container :deep(span[style]),
.editor-container :deep(p[style]),
.editor-container :deep(div[style]) {
  /* 确保带 style 属性的元素样式生效 */
}

.tag-input {
  width: 100px;
  margin-right: 10px;
  vertical-align: bottom;
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

<!-- 非 scoped 样式，用于编辑器内部动态 HTML 内容 -->
<style>
/* 编辑器基本样式 */
.editor-container .w-e-text-container [style] {
  /* 允许内联样式生效 */
}

/* 确保加粗、斜体、下划线正常显示 */
.editor-container .w-e-text-container strong,
.editor-container .w-e-text-container b,
.editor-container .w-e-text-container .token.bold,
.editor-container .w-e-text-container strong.token.bold {
  font-weight: bold !important;
}

.editor-container .w-e-text-container em,
.editor-container .w-e-text-container i,
.editor-container .w-e-text-container .token.italic {
  font-style: italic !important;
}

.editor-container .w-e-text-container u,
.editor-container .w-e-text-container .token.underline {
  text-decoration: underline !important;
}

.editor-container .w-e-text-container s,
.editor-container .w-e-text-container strike,
.editor-container .w-e-text-container .token.strike {
  text-decoration: line-through !important;
}

/* 让编辑器内容继承内联样式 */
.editor-container .w-e-scroll div[data-slate-node="element"] {
  text-align: inherit;
}

/* 确保 span 内的文字继承父元素样式 */
.editor-container .w-e-text-container strong span,
.editor-container .w-e-text-container b span,
.editor-container .w-e-text-container .token.bold span {
  font-weight: inherit !important;
}

.editor-container .w-e-text-container em span,
.editor-container .w-e-text-container i span,
.editor-container .w-e-text-container .token.italic span {
  font-style: inherit !important;
}
</style>
