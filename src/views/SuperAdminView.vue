<template>
  <div class="super-admin-container">
    <!-- 固定退出按钮 -->
    <div class="top-bar">
      <span class="page-title">超级管理员</span>
      <div class="top-bar-actions">
        <el-button type="primary" @click="showAddAccountDialog">新增账户</el-button>
        <el-button type="danger" @click="handleLogout">退出登录</el-button>
      </div>
    </div>

    <el-card class="admin-card">
      <template #header>
        <div class="card-header">
          <span>账户管理</span>
        </div>
      </template>

      <el-table :data="accounts" style="width: 100%" v-loading="loading">
        <el-table-column prop="ID" label="ID" width="80" />
        <el-table-column label="用户名" min-width="120">
          <template #default="scope">
            <div v-if="editingCell.id === scope.row.ID && editingCell.field === 'UserName'">
              <el-input
                v-model="editingCell.value"
                size="small"
                @blur="saveField(scope.row, 'UserName')"
                @keyup.enter="saveField(scope.row, 'UserName')"
                ref="editInputRef"
                placeholder="请输入用户名"
              />
            </div>
            <div v-else class="editable-cell" @dblclick="startEdit(scope.row, 'UserName')">
              {{ scope.row.UserName || '双击编辑' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="昵称" min-width="120">
          <template #default="scope">
            <div v-if="editingCell.id === scope.row.ID && editingCell.field === 'Nick'">
              <el-input
                v-model="editingCell.value"
                size="small"
                @blur="saveField(scope.row, 'Nick')"
                @keyup.enter="saveField(scope.row, 'Nick')"
                ref="editInputRef"
                placeholder="请输入昵称"
              />
            </div>
            <div v-else class="editable-cell" @dblclick="startEdit(scope.row, 'Nick')">
              {{ scope.row.Nick || '双击编辑' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="API地址" min-width="200">
          <template #default="scope">
            <div v-if="editingCell.id === scope.row.ID && editingCell.field === 'APIBaseURL'">
              <el-input
                v-model="editingCell.value"
                size="small"
                @blur="saveUrl(scope.row, 'APIBaseURL')"
                @keyup.enter="saveUrl(scope.row, 'APIBaseURL')"
                ref="editInputRef"
                placeholder="请输入API地址"
              />
            </div>
            <div v-else class="editable-cell" @click="startEdit(scope.row, 'APIBaseURL')">
              {{ scope.row.APIBaseURL || '点击编辑' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="图片地址" min-width="180">
          <template #default="scope">
            <div v-if="editingCell.id === scope.row.ID && editingCell.field === 'ImageBaseURL'">
              <el-input
                v-model="editingCell.value"
                size="small"
                @blur="saveUrl(scope.row, 'ImageBaseURL')"
                @keyup.enter="saveUrl(scope.row, 'ImageBaseURL')"
                ref="editInputRef"
                placeholder="请输入图片地址"
              />
            </div>
            <div v-else class="editable-cell" @click="startEdit(scope.row, 'ImageBaseURL')">
              {{ scope.row.ImageBaseURL || '点击编辑' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="Status" label="状态" width="100">
          <template #default="scope">
            <el-tag 
              :type="scope.row.Status === 1 ? 'success' : 'danger'"
              style="cursor: pointer;"
              @click="toggleStatus(scope.row)"
            >
              {{ scope.row.Status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="showResetPasswordDialog(scope.row)">
              重置密码
            </el-button>
            <el-button type="success" size="small" @click="showSeoConfigDialog(scope.row)">
              SEO配置
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Reset Password Dialog -->
    <el-dialog v-model="resetPasswordDialogVisible" title="重置密码" width="400px">
      <el-form :model="resetPasswordForm" :rules="resetPasswordRules" ref="resetPasswordFormRef" label-width="100px">
        <el-form-item label="账户">
          <el-input :value="selectedAccount?.UserName" disabled />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="resetPasswordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="resetPasswordForm.confirmPassword" type="password" placeholder="请确认新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetPasswordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleResetPassword" :loading="resetting">确认重置</el-button>
      </template>
    </el-dialog>

    <!-- Add Account Dialog -->
    <el-dialog v-model="addAccountDialogVisible" title="新增账户" width="500px">
      <el-form :model="addAccountForm" :rules="addAccountRules" ref="addAccountFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addAccountForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addAccountForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="addAccountForm.confirmPassword" type="password" placeholder="请确认密码" show-password />
        </el-form-item>
        <el-form-item label="昵称" prop="nick">
          <el-input v-model="addAccountForm.nick" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="API地址" prop="apiBaseURL">
          <el-input v-model="addAccountForm.apiBaseURL" placeholder="请输入API地址" />
        </el-form-item>
        <el-form-item label="图片地址" prop="imageBaseURL">
          <el-input v-model="addAccountForm.imageBaseURL" placeholder="请输入图片地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addAccountDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddAccount" :loading="adding">确认新增</el-button>
      </template>
    </el-dialog>

    <!-- SEO Config Dialog -->
    <el-dialog v-model="seoConfigDialogVisible" title="SEO配置" width="600px">
      <el-form :model="seoConfigForm" ref="seoConfigFormRef" label-width="100px">
        <el-form-item label="账户">
          <el-input :value="selectedAccountForSeo?.UserName" disabled />
        </el-form-item>
        <el-form-item label="SEO标题">
          <el-input v-model="seoConfigForm.seoTitle" placeholder="请输入SEO标题" />
        </el-form-item>
        <el-form-item label="SEO关键词">
          <el-input v-model="seoConfigForm.seoKeyword" placeholder="请输入SEO关键词，多个关键词用逗号分隔" />
        </el-form-item>
        <el-form-item label="SEO描述">
          <el-input 
            v-model="seoConfigForm.seoDescription" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入SEO描述" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="seoConfigDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveSeoConfig" :loading="savingSeo">保存配置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance } from 'element-plus';
import axios from 'axios';
import { getToken, logout } from '../API/auth';

const router = useRouter();

// Auth API URL
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5001';

interface Account {
  ID: number;
  UserName: string;
  Nick: string;
  APIBaseURL: string;
  ImageBaseURL: string;
  Status: number;
  CreatedAt: string;
  UpdatedAt: string;
}

const accounts = ref<Account[]>([]);
const loading = ref(false);
const resetPasswordDialogVisible = ref(false);
const selectedAccount = ref<Account | null>(null);
const resetting = ref(false);
const resetPasswordFormRef = ref<FormInstance>();
const editInputRef = ref();

// Add account state
const addAccountDialogVisible = ref(false);
const adding = ref(false);
const addAccountFormRef = ref<FormInstance>();

// SEO config state
const seoConfigDialogVisible = ref(false);
const selectedAccountForSeo = ref<Account | null>(null);
const savingSeo = ref(false);
const seoConfigFormRef = ref<FormInstance>();
const seoConfigForm = reactive({
  seoTitle: '',
  seoKeyword: '',
  seoDescription: ''
});

// Inline editing state
const editingCell = reactive({
  id: null as number | null,
  field: '' as string,
  value: ''
});

const resetPasswordForm = reactive({
  newPassword: '',
  confirmPassword: ''
});

const addAccountForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  nick: '',
  apiBaseURL: '',
  imageBaseURL: ''
});

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== resetPasswordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const validateAddConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== addAccountForm.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const resetPasswordRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
};

const addAccountRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度至少为3位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateAddConfirmPassword, trigger: 'blur' }
  ],
  nick: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ]
};

// Start inline editing
const startEdit = (account: Account, field: 'APIBaseURL' | 'ImageBaseURL' | 'UserName' | 'Nick') => {
  editingCell.id = account.ID;
  editingCell.field = field;
  editingCell.value = account[field] || '';
  
  nextTick(() => {
    editInputRef.value?.focus();
  });
};

// Save URL on blur
const saveUrl = async (account: Account, field: 'APIBaseURL' | 'ImageBaseURL') => {
  const newValue = editingCell.value.trim();
  const oldValue = account[field] || '';
  
  // Clear editing state
  const accountId = editingCell.id;
  editingCell.id = null;
  editingCell.field = '';
  
  // Skip if no change
  if (newValue === oldValue) {
    return;
  }

  try {
    const token = getToken();
    const updateData = {
      apiBaseURL: field === 'APIBaseURL' ? newValue : account.APIBaseURL,
      imageBaseURL: field === 'ImageBaseURL' ? newValue : account.ImageBaseURL
    };

    const response = await axios.put(
      `${AUTH_API_URL}/api/admin/accounts/${accountId}/urls`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      // Update local data
      account[field] = newValue;
      ElMessage.success('保存成功');
    } else {
      ElMessage.error(response.data.message || '保存失败');
    }
  } catch (error: any) {
    console.error('Error saving URL:', error);
    ElMessage.error(error.response?.data?.message || '保存失败');
  }
};

// Save field (UserName or Nick) on blur
const saveField = async (account: Account, field: 'UserName' | 'Nick') => {
  const newValue = editingCell.value.trim();
  const oldValue = account[field] || '';
  
  // Clear editing state
  const accountId = editingCell.id;
  editingCell.id = null;
  editingCell.field = '';
  
  // Skip if no change
  if (newValue === oldValue) {
    return;
  }

  // Validate that field is not empty
  if (!newValue) {
    ElMessage.warning(field === 'UserName' ? '用户名不能为空' : '昵称不能为空');
    return;
  }

  try {
    const token = getToken();
    const updateData = {
      userName: field === 'UserName' ? newValue : account.UserName,
      nick: field === 'Nick' ? newValue : account.Nick
    };

    const response = await axios.put(
      `${AUTH_API_URL}/api/admin/accounts/${accountId}/info`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      // Update local data
      account[field] = newValue;
      ElMessage.success('保存成功');
    } else {
      ElMessage.error(response.data.message || '保存失败');
    }
  } catch (error: any) {
    console.error('Error saving field:', error);
    ElMessage.error(error.response?.data?.message || '保存失败');
  }
};

// Fetch all accounts
const fetchAccounts = async () => {
  loading.value = true;
  try {
    const token = getToken();
    const response = await axios.get(`${AUTH_API_URL}/api/admin/accounts`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.data.success) {
      accounts.value = response.data.data;
    } else {
      ElMessage.error(response.data.message || '获取账户列表失败');
    }
  } catch (error: any) {
    console.error('Error fetching accounts:', error);
    if (error.response?.status === 403) {
      ElMessage.error('无权限访问，请使用超级管理员账号登录');
      router.push('/login');
    } else {
      ElMessage.error('获取账户列表失败');
    }
  } finally {
    loading.value = false;
  }
};

// Show add account dialog
const showAddAccountDialog = () => {
  addAccountForm.username = '';
  addAccountForm.password = '';
  addAccountForm.confirmPassword = '';
  addAccountForm.nick = '';
  addAccountForm.apiBaseURL = '';
  addAccountForm.imageBaseURL = '';
  addAccountDialogVisible.value = true;
};

// Handle add account
const handleAddAccount = async () => {
  if (!addAccountFormRef.value) return;
  
  try {
    const valid = await addAccountFormRef.value.validate();
    if (!valid) return;

    adding.value = true;
    const token = getToken();
    
    const response = await axios.post(
      `${AUTH_API_URL}/api/admin/accounts`,
      {
        username: addAccountForm.username,
        password: addAccountForm.password,
        nick: addAccountForm.nick,
        apiBaseURL: addAccountForm.apiBaseURL,
        imageBaseURL: addAccountForm.imageBaseURL
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      ElMessage.success('账户创建成功');
      addAccountDialogVisible.value = false;
      fetchAccounts(); // Refresh the list
    } else {
      ElMessage.error(response.data.message || '创建账户失败');
    }
  } catch (error: any) {
    console.error('Error creating account:', error);
    ElMessage.error(error.response?.data?.message || '创建账户失败');
  } finally {
    adding.value = false;
  }
};

// Show reset password dialog
const showResetPasswordDialog = (account: Account) => {
  selectedAccount.value = account;
  resetPasswordForm.newPassword = '';
  resetPasswordForm.confirmPassword = '';
  resetPasswordDialogVisible.value = true;
};

// Reset password
const handleResetPassword = async () => {
  if (!resetPasswordFormRef.value) return;
  
  try {
    const valid = await resetPasswordFormRef.value.validate();
    if (!valid) return;

    resetting.value = true;
    const token = getToken();
    
    const response = await axios.post(
      `${AUTH_API_URL}/api/admin/accounts/${selectedAccount.value?.ID}/reset-password`,
      { newPassword: resetPasswordForm.newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      ElMessage.success(`用户 ${selectedAccount.value?.UserName} 的密码已重置`);
      resetPasswordDialogVisible.value = false;
    } else {
      ElMessage.error(response.data.message || '密码重置失败');
    }
  } catch (error: any) {
    console.error('Error resetting password:', error);
    ElMessage.error(error.response?.data?.message || '密码重置失败');
  } finally {
    resetting.value = false;
  }
};

// Toggle account status
const toggleStatus = async (account: Account) => {
  const newStatus = account.Status === 1 ? 0 : 1;
  const action = newStatus === 1 ? '启用' : '禁用';
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}账户 "${account.UserName}" 吗？${newStatus === 0 ? '禁用后该账户将无法登录。' : ''}`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    const token = getToken();
    const response = await axios.put(
      `${AUTH_API_URL}/api/admin/accounts/${account.ID}/status`,
      { status: newStatus },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      // Update local data
      account.Status = newStatus;
      ElMessage.success(`账户 ${account.UserName} 已${action}`);
    } else {
      ElMessage.error(response.data.message || '操作失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Error toggling status:', error);
      ElMessage.error(error.response?.data?.message || '操作失败');
    }
  }
};

// Show SEO config dialog
const showSeoConfigDialog = async (account: Account) => {
  selectedAccountForSeo.value = account;
  seoConfigForm.seoTitle = '';
  seoConfigForm.seoKeyword = '';
  seoConfigForm.seoDescription = '';
  seoConfigDialogVisible.value = true;
  
  // Fetch current SEO config
  try {
    const token = getToken();
    const response = await axios.get(
      `${AUTH_API_URL}/api/admin/accounts/${account.ID}/seo`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    if (response.data.success && response.data.data) {
      seoConfigForm.seoTitle = response.data.data.SEOTitle || '';
      seoConfigForm.seoKeyword = response.data.data.SEOKeyword || '';
      seoConfigForm.seoDescription = response.data.data.SEODescription || '';
    }
  } catch (error: any) {
    console.error('Error fetching SEO config:', error);
    ElMessage.warning('获取当前SEO配置失败');
  }
};

// Save SEO config
const handleSaveSeoConfig = async () => {
  if (!selectedAccountForSeo.value) return;
  
  savingSeo.value = true;
  try {
    const token = getToken();
    const response = await axios.put(
      `${AUTH_API_URL}/api/admin/accounts/${selectedAccountForSeo.value.ID}/seo`,
      {
        seoTitle: seoConfigForm.seoTitle,
        seoKeyword: seoConfigForm.seoKeyword,
        seoDescription: seoConfigForm.seoDescription
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.success) {
      ElMessage.success('SEO配置保存成功');
      seoConfigDialogVisible.value = false;
    } else {
      ElMessage.error(response.data.message || 'SEO配置保存失败');
    }
  } catch (error: any) {
    console.error('Error saving SEO config:', error);
    ElMessage.error(error.response?.data?.message || 'SEO配置保存失败');
  } finally {
    savingSeo.value = false;
  }
};

// Logout
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    logout(router);
  }).catch(() => {});
};

onMounted(() => {
  // Check if user is super admin
  const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
  if (!isSuperAdmin) {
    ElMessage.error('无权限访问');
    router.push('/');
    return;
  }
  
  fetchAccounts();
});
</script>

<style scoped>
.super-admin-container {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.admin-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 18px;
  font-weight: bold;
}

.editable-cell {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  min-height: 24px;
  color: #606266;
}

.editable-cell:hover {
  background-color: #f0f2f5;
  color: #409eff;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto 20px auto;
  padding: 0 10px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.top-bar-actions {
  display: flex;
  gap: 10px;
}
</style>
