<template>
  <div class="welcome-container">
    <div class="welcome-banner">
      <img src="@/assets/images/welcome-banner.svg" alt="欢迎使用后台管理系统" />
    </div>
    <p class="welcome-text">这是一个基于 Vue 3 和 Element Plus 构建的后台管理系统</p>
    <div class="welcome-info">
      <p>当前用户: <strong>{{ username }}</strong></p>
      <p>登录时间: <strong>{{ loginTime }}</strong></p>
    </div>
    <el-card class="welcome-card">
      <template #header>
        <div>
          <span>系统信息</span>
        </div>
      </template>
      <div class="system-info">
        <p><el-icon><Monitor /></el-icon> 系统版本: v1.0.0</p>
        <p><el-icon><Connection /></el-icon> 服务器状态: 正常</p>
        <p><el-icon><User /></el-icon> 在线用户: 1</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Monitor, Connection, User } from '@element-plus/icons-vue';

const username = ref('admin');
const loginTime = ref('');

onMounted(() => {
  // 获取当前时间作为登录时间
  const now = new Date();
  loginTime.value = now.toLocaleString();

  // 尝试从localStorage获取用户信息
  const userInfo = localStorage.getItem('user');
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo);
      if (user.username) {
        username.value = user.username;
      }
    } catch (e) {
      console.error('Failed to parse user info:', e);
    }
  }
});
</script>

<style scoped>
.welcome-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.welcome-banner {
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.welcome-banner img {
  width: 100%;
  display: block;
}

.welcome-text {
  font-size: 16px;
  color: #606266;
  margin-bottom: 30px;
  text-align: center;
}

.welcome-info {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.welcome-card {
  margin-top: 20px;
}


.system-info p {
  margin: 10px 0;
  display: flex;
  align-items: center;
}

.system-info .el-icon {
  margin-right: 8px;
  color: #409EFF;
}
</style>
