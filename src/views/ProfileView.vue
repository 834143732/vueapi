<template>
  <div class="profile-container">

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="profile-card">
          <div class="user-info">
            <el-avatar :size="100" :src="userInfo.avatar" />
            <h2 class="username">{{ userInfo.username }}</h2>
            <p class="role">{{ userInfo.role }}</p>
            <p class="last-login">上次登录: {{ userInfo.lastLogin }}</p>
          </div>
          <el-divider />
          <div class="quick-stats">
            <div class="stat-item">
              <h3>{{ userInfo.loginCount }}</h3>
              <p>登录次数</p>
            </div>
            <div class="stat-item">
              <h3>{{ userInfo.daysActive }}</h3>
              <p>活跃天数</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-card>
              <el-form
                :model="basicForm"
                label-width="100px"
                :rules="basicRules"
                ref="basicFormRef"
              >
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="basicForm.username" disabled />
                </el-form-item>
                <el-form-item label="昵称" prop="nickname">
                  <el-input v-model="basicForm.nickname" placeholder="请输入昵称" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="basicForm.email" placeholder="请输入邮箱" />
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="basicForm.phone" placeholder="请输入手机号" />
                </el-form-item>
                <el-form-item label="个人简介">
                  <el-input
                    v-model="basicForm.bio"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入个人简介"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleUpdateBasic">保存修改</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-tab-pane>

          <el-tab-pane label="修改密码" name="password">
            <el-card>
              <el-form
                :model="passwordForm"
                label-width="100px"
                :rules="passwordRules"
                ref="passwordFormRef"
              >
                <el-form-item label="当前密码" prop="currentPassword">
                  <el-input
                    v-model="passwordForm.currentPassword"
                    type="password"
                    placeholder="请输入当前密码"
                    show-password
                  />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input
                    v-model="passwordForm.newPassword"
                    type="password"
                    placeholder="请输入新密码"
                    show-password
                  />
                </el-form-item>
                <el-form-item label="确认新密码" prop="confirmPassword">
                  <el-input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    placeholder="请再次输入新密码"
                    show-password
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleUpdatePassword">修改密码</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-tab-pane>

          <el-tab-pane label="头像设置" name="avatar">
            <el-card>
              <div class="avatar-container">
                <div class="current-avatar">
                  <h3>当前头像</h3>
                  <el-avatar :size="120" :src="userInfo.avatar" />
                </div>
                <div class="upload-avatar">
                  <h3>上传新头像</h3>
                  <el-upload
                    class="avatar-uploader"
                    action="#"
                    :show-file-list="false"
                    :auto-upload="false"
                    :on-change="handleAvatarChange"
                  >
                    <img v-if="avatarUrl" :src="avatarUrl" class="avatar-preview" />
                    <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                  </el-upload>
                  <div class="avatar-tip">支持 jpg、png 格式，文件大小不超过 2MB</div>
                </div>
              </div>
              <div class="avatar-actions">
                <el-button type="primary" @click="handleUpdateAvatar" :disabled="!avatarUrl">保存头像</el-button>
              </div>
            </el-card>
          </el-tab-pane>

          <el-tab-pane label="登录日志" name="logs">
            <el-card>
              <el-table :data="loginLogs" style="width: 100%">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="loginTime" label="登录时间" width="180" />
                <el-table-column prop="ip" label="IP地址" width="150" />
                <el-table-column prop="location" label="登录地点" />
                <el-table-column prop="device" label="设备信息" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'">
                      {{ scope.row.status === 'success' ? '成功' : '失败' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, UploadFile } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

// 用户信息
const userInfo = reactive({
  username: 'admin',
  nickname: '管理员',
  email: 'admin@example.com',
  phone: '13800138000',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  role: '超级管理员',
  lastLogin: '2023-04-14 10:30:00',
  loginCount: 128,
  daysActive: 45,
  bio: '系统管理员，负责系统的日常维护和管理。'
});

// 表单相关
const activeTab = ref('basic');
const basicFormRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();
const avatarUrl = ref('');

// 基本信息表单
const basicForm = reactive({
  username: userInfo.username,
  nickname: userInfo.nickname,
  email: userInfo.email,
  phone: userInfo.phone,
  bio: userInfo.bio
});

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 表单验证规则
const basicRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
};

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 登录日志
const loginLogs = ref([
  {
    id: 1,
    loginTime: '2023-04-14 10:30:00',
    ip: '192.168.1.1',
    location: '中国 广东 深圳',
    device: 'Chrome 98.0.4758.102 / Windows 10',
    status: 'success'
  },
  {
    id: 2,
    loginTime: '2023-04-13 15:45:22',
    ip: '192.168.1.1',
    location: '中国 广东 深圳',
    device: 'Chrome 98.0.4758.102 / Windows 10',
    status: 'success'
  },
  {
    id: 3,
    loginTime: '2023-04-12 09:12:05',
    ip: '192.168.1.1',
    location: '中国 广东 深圳',
    device: 'Chrome 98.0.4758.102 / Windows 10',
    status: 'success'
  },
  {
    id: 4,
    loginTime: '2023-04-11 18:30:45',
    ip: '192.168.1.1',
    location: '中国 广东 深圳',
    device: 'Chrome 98.0.4758.102 / Windows 10',
    status: 'failed'
  },
  {
    id: 5,
    loginTime: '2023-04-11 18:29:30',
    ip: '192.168.1.1',
    location: '中国 广东 深圳',
    device: 'Chrome 98.0.4758.102 / Windows 10',
    status: 'failed'
  }
]);

onMounted(() => {
  // 从localStorage获取用户信息
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user.username) {
        userInfo.username = user.username;
        basicForm.username = user.username;
      }
    } catch (e) {
      console.error('Failed to parse user info:', e);
    }
  }
});

// 处理头像上传
const handleAvatarChange = (file: UploadFile) => {
  // 在实际应用中，这里应该上传图片到服务器，然后获取图片URL
  // 这里为了演示，直接使用本地预览
  const reader = new FileReader();
  reader.onload = (e) => {
    avatarUrl.value = e.target?.result as string;
  };
  reader.readAsDataURL(file.raw!);
};

// 更新基本信息
const handleUpdateBasic = async () => {
  if (!basicFormRef.value) return;

  await basicFormRef.value.validate((valid) => {
    if (!valid) return;
    // 更新用户信息
    userInfo.nickname = basicForm.nickname;
    userInfo.email = basicForm.email;
    userInfo.phone = basicForm.phone;
    userInfo.bio = basicForm.bio;

    ElMessage({
      type: 'success',
      message: '基本信息更新成功'
    });
  });
};

// 更新密码
const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return;

  await passwordFormRef.value.validate((valid) => {
    if (!valid) return;
    // 在实际应用中，这里应该调用API更新密码

    // 模拟密码验证
    if (passwordForm.currentPassword !== 'admin') {
      ElMessage({
        type: 'error',
        message: '当前密码不正确'
      });
      return;
    }

    ElMessage({
      type: 'success',
      message: '密码修改成功'
    });

    // 重置表单
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
  });
};

// 更新头像
const handleUpdateAvatar = () => {
  if (!avatarUrl.value) {
    ElMessage({
      type: 'warning',
      message: '请先上传新头像'
    });
    return;
  }

  // 更新头像
  userInfo.avatar = avatarUrl.value;

  ElMessage({
    type: 'success',
    message: '头像更新成功'
  });

  // 重置
  avatarUrl.value = '';
};
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  color: #409EFF;
}

.profile-card {
  height: 100%;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.username {
  margin-top: 15px;
  margin-bottom: 5px;
  font-size: 20px;
}

.role {
  color: #909399;
  margin-bottom: 5px;
}

.last-login {
  font-size: 12px;
  color: #909399;
}

.quick-stats {
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
}

.stat-item {
  text-align: center;
}

.stat-item h3 {
  margin: 0;
  font-size: 24px;
  color: #409EFF;
}

.stat-item p {
  margin: 5px 0 0;
  font-size: 14px;
  color: #909399;
}

.avatar-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.current-avatar, .upload-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-uploader {
  width: 120px;
  height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-uploader:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  display: block;
}

.avatar-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.avatar-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
