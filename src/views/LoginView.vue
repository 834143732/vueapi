
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { User, Lock } from '@element-plus/icons-vue';
import Login from '../API/login';
import { logout } from '../API/auth';

// 定义表单数据
const username = ref('');
const password = ref('');
const rememberPassword = ref(false);
const errorMessage = ref('');
const router = useRouter();
// 在组件挂载时清除任何现有的会话
onMounted(() => {
  console.log('Login page loaded, clearing any existing session...');
  // 清除会话但不跳转
  logout();
  
  // 加载记住的密码
  const savedUsername = localStorage.getItem('rememberedUsername');
  const savedPassword = localStorage.getItem('rememberedPassword');
  if (savedUsername && savedPassword) {
    username.value = savedUsername;
    password.value = savedPassword;
    rememberPassword.value = true;
  }
});

const handleLogin = async () => {
  // 获取表单数据
  const formData = {
    username: username.value,
    password: password.value
  };

  const response = await Login(formData);

  // Check if login was successful
  if (response && response.success) {
    console.log('Login successful, user info:', response);
    
    // 处理记住密码
    if (rememberPassword.value) {
      localStorage.setItem('rememberedUsername', username.value);
      localStorage.setItem('rememberedPassword', password.value);
    } else {
      localStorage.removeItem('rememberedUsername');
      localStorage.removeItem('rememberedPassword');
    }
    
    // Store user info in localStorage or sessionStorage if needed
    localStorage.setItem('user', JSON.stringify(response));
    
    // Store account config for form field visibility
    const accountConfig = {
      imgUrlCount: response.imgUrlCount || 0,
      contentCount: response.contentCount || 0,
      seoConfig: response.seoConfig || 0
    };
    localStorage.setItem('accountConfig', JSON.stringify(accountConfig));
    console.log('Account config stored:', accountConfig);
    
    // Check if super admin
    if (response.isSuperAdmin) {
      console.log('Super admin login, redirecting to admin page');
      router.push('/super-admin');
    } else {
      console.log('Normal user login, redirecting to main page');
      router.push('/');
    }
  } else {
    // Display error message
    errorMessage.value = response?.message || '用户名或密码错误';
  }
}

</script>

<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- 头部 -->
      <div class="login-header">
        <div class="logo">
          <img src="/logo.svg" alt="Logo" class="logo-image" />
        </div>
        <div class="header-text">
          <h1 class="title">后台管理系统</h1>
          <p class="subtitle">欢迎回来，请登录您的账户</p>
        </div>
      </div>

      <!-- 登录表单 -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-item">
          <el-input
            v-model="username"
            :prefix-icon="User"
            size="large"
            placeholder="请输入用户名"
            clearable
          />
        </div>

        <div class="form-item">
          <el-input
            v-model="password"
            :prefix-icon="Lock"
            type="password"
            size="large"
            placeholder="请输入密码"
            show-password
            clearable
          />
        </div>

        <div class="remember-password">
          <el-checkbox v-model="rememberPassword">
            记住密码
          </el-checkbox>
        </div>

        <div v-if="errorMessage" class="error-message">
          <i class="error-icon">⚠</i>
          {{ errorMessage }}
        </div>

        <el-button 
          type="primary" 
          native-type="submit" 
          class="login-button"
          size="large"
        >
          登录
        </el-button>
      </form>
    </div>
  </div>
</template>


<style scoped>
* {
  box-sizing: border-box;
}

.login-page {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  font-size: 10px;
}

/* 背景装饰圆圈 */
.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 50rem;
  height: 50rem;
  top: -10rem;
  left: -10rem;
  animation-delay: 0s;
}

.circle-2 {
  width: 35rem;
  height: 35rem;
  bottom: -10rem;
  right: -5rem;
  animation-delay: 3s;
}

.circle-3 {
  width: 25rem;
  height: 25rem;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 6s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(3rem, -3rem) scale(1.1);
  }
  66% {
    transform: translate(-3rem, 3rem) scale(0.9);
  }
}

/* 登录卡片 */
.login-card {
  position: relative;
  z-index: 10;
  width: 36rem;
  padding: 2.5rem 3rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(1.5rem);
  border-radius: 1.4rem;
  border: 0.1rem solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.2);
  animation: slideIn 0.6s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-3rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 头部 */
.login-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.logo {
  flex-shrink: 0;
}

.logo-image {
  width: 5rem;
  height: 5rem;
  object-fit: contain;
  filter: drop-shadow(0 0.4rem 0.8rem rgba(0, 0, 0, 0.15));
}

.title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.4rem 0;
  text-align: left;
}

.subtitle {
  font-size: 0.9rem;
  color: #718096;
  margin: 0;
  text-align: left;
}

.header-text {
  flex: 1;
}

/* 登录表单 */
.login-form {
  margin-top: 0;
}

.form-item {
  margin-bottom: 1.5rem;
}

.form-item :deep(.el-input) {
  font-size: 1rem;
}

.form-item :deep(.el-input__wrapper) {
  border-radius: 0.8rem;
  padding: 0.4rem 1.2rem;
  box-shadow: 0 0.2rem 0.8rem rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.form-item :deep(.el-input__wrapper:hover),
.form-item :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0.4rem 1.2rem rgba(102, 126, 234, 0.2);
}

/* 记住密码 */
.remember-password {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: flex-start;
}

.remember-password :deep(.el-checkbox__label) {
  font-size: 0.9rem;
  color: #4a5568;
}

/* 错误消息 */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 1.5rem;
  background: #fee2e2;
  border: 0.1rem solid #fecaca;
  border-radius: 0.8rem;
  color: #dc2626;
  font-size: 0.9rem;
  margin-bottom: 2rem;
  animation: shake 0.5s;
}

.error-icon {
  font-style: normal;
  font-size: 1.6rem;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-0.5rem); }
  75% { transform: translateX(0.5rem); }
}

/* 登录按钮 */
.login-button {
  width: 100%;
  padding: 1.4rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 0.8rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 0.8rem 1.6rem rgba(102, 126, 234, 0.3);
  transition: all 0.3s;
}

.login-button:hover {
  transform: translateY(-0.2rem);
  box-shadow: 0 1rem 2rem rgba(102, 126, 234, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-card {
    width: 90%;
    max-width: 40rem;
    padding: 3rem 2.5rem;
  }

  .title {
    font-size: 2.4rem;
  }

  .circle-1,
  .circle-2 {
    display: none;
  }

  .quick-login-buttons {
    flex-direction: column;
  }
}
</style>
