<template>
  <div class="header-container">
    <div class="header-decoration">
      <img src="@/assets/images/header-decoration.svg" alt="Header Decoration" />
    </div>
    <div class="merged-header">
      <div class="breadcrumb-container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">
            首页
          </el-breadcrumb-item>
          <el-breadcrumb-item v-if="currentRoute">
            {{ currentRoute }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <div class="user-info">
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-dropdown-link">
          <el-avatar :size="32" :src="userInfo.avatar" />
          <span class="username">{{ userInfo.username }}</span>
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="changePassword">
              <el-icon><lock /></el-icon>
              <span>修改密码</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><switch-button /></el-icon>
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 修改密码弹框 -->
    <el-dialog v-model="changePasswordDialogVisible" title="修改密码" width="400px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请确认新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="changePasswordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword" :loading="changingPassword">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { ArrowDown, Lock, SwitchButton } from '@element-plus/icons-vue';
import { removeToken, logout, getToken } from '../API/auth';
import axios from 'axios';

const router = useRouter();
const route = useRoute();

// 用户信息
const userInfo = reactive({
  username: 'admin',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
});

// Auth API URL
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5001';

// 修改密码状态
const changePasswordDialogVisible = ref(false);
const changingPassword = ref(false);
const passwordFormRef = ref<FormInstance>();

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
};

// 当前路由名称
const currentRoute = computed(() => {
  const routeMap: Record<string, string> = {
    'Welcome': '欢迎页',
    'SinglePage': '单页管理',
    'SinglePageEdit': '编辑单页',
    'Messages': '在线留言',
    'Carousel': '轮播图管理',
    'NewsList': '列表页面',
    'NewsCategory': '分类管理',
    'NewsCategoryAdd': '添加分类',
    'NewsCategoryList': '列表分类',
    'NewsEdit': '新增内容',
    'NewsManage': '新闻管理'
  };

  return routeMap[route.name as string] || '';
});

// 判断是否显示新增内容按钮
const showAddNewsButton = computed(() => {
  // 在列表相关页面显示新增内容按钮
  return route.name === 'NewsList' || route.name === 'NewsEdit' ||
         route.name === 'NewsCategory' || route.name === 'NewsCategoryAdd' ||
         route.name === 'NewsCategoryList';
});

// 导航到新增内容页面
const navigateToAddNews = () => {
  router.push('/news-edit');
};

// 下拉菜单命令处理
const handleCommand = (command: string) => {
  switch (command) {
    case 'changePassword':
      showChangePasswordDialog();
      break;
    case 'logout':
      handleLogout();
      break;
  }
};

// 显示修改密码弹框
const showChangePasswordDialog = () => {
  passwordForm.oldPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
  changePasswordDialogVisible.value = true;
};

// 处理修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return;
  
  try {
    const valid = await passwordFormRef.value.validate();
    if (!valid) return;

    changingPassword.value = true;
    const token = getToken();
    
    const response = await axios.post(
      `${AUTH_API_URL}/api/auth/change-password`,
      {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      ElMessage.success('密码修改成功');
      changePasswordDialogVisible.value = false;
    } else {
      ElMessage.error(response.data.message || '密码修改失败');
    }
  } catch (error: any) {
    console.error('Error changing password:', error);
    ElMessage.error(error.response?.data?.message || '密码修改失败');
  } finally {
    changingPassword.value = false;
  }
};

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 重置用户信息
    userInfo.username = '';

    // 使用综合退出功能
    logout(router);

    ElMessage({
      type: 'success',
      message: '退出登录成功'
    });
  }).catch(() => {
    // 用户取消退出
    console.log('Logout cancelled by user');
  });
};

onMounted(() => {
  // 从localStorage获取用户信息
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user.username) {
        userInfo.username = user.username;
      }
    } catch (e) {
      console.error('Failed to parse user info:', e);
    }
  }
});
</script>

<style scoped>
.header-container {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.header-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 0;
}

.header-decoration img {
  width: 100%;
  display: block;
}

.merged-header {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-right: 20px;
}

.add-btn {
  margin-left: 20px;
  color: #fff;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin: 0 8px;
  font-size: 14px;
  color: #606266;
  min-width: 80px;
  text-align: center;
}

.breadcrumb-container {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #ffffff;
  border-radius: 4px;
  margin: 8px 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
</style>
