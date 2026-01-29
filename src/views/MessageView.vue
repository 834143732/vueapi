<template>
  <div class="message-container">

    <el-card class="message-card">

      <el-table :data="filteredMessages" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="content" label="留言内容" show-overflow-tooltip />
        <el-table-column prop="createTime" label="留言时间" width="180" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="totalMessages"
          :page-size="pageSize"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 查看留言对话框 -->
    <el-dialog v-model="dialogVisible" title="留言详情" width="600px">
      <div class="message-detail">
        <div class="detail-item">
          <el-icon class="detail-icon"><User /></el-icon>
          <div class="detail-content">
            <span class="detail-label">姓名</span>
            <span class="detail-value">{{ currentMessage.name || '未填写' }}</span>
          </div>
        </div>
        <div class="detail-item">
          <el-icon class="detail-icon"><Message /></el-icon>
          <div class="detail-content">
            <span class="detail-label">邮箱</span>
            <span class="detail-value">{{ currentMessage.email || '未填写' }}</span>
          </div>
        </div>
        <div class="detail-item">
          <el-icon class="detail-icon"><Phone /></el-icon>
          <div class="detail-content">
            <span class="detail-label">电话</span>
            <span class="detail-value">{{ currentMessage.phone || '未填写' }}</span>
          </div>
        </div>
        <div class="detail-item">
          <el-icon class="detail-icon"><Clock /></el-icon>
          <div class="detail-content">
            <span class="detail-label">留言时间</span>
            <span class="detail-value">{{ currentMessage.createTime || '未知' }}</span>
          </div>
        </div>
        <div class="message-content-section">
          <div class="content-header">
            <el-icon><ChatDotRound /></el-icon>
            <span>留言内容</span>
          </div>
          <div class="message-content-box">{{ currentMessage.content || '无内容' }}</div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { User, Message, Phone, Clock, ChatDotRound } from '@element-plus/icons-vue';
import { getMessages, deleteMessage } from '../API/messages';

interface MessageItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  content: string;
  createTime: string;
  status: 'unread' | 'read' | 'replied';
  reply?: string;
  replyTime?: string;
}

// 留言列表
const messageList = ref<MessageItem[]>([]);
const loading = ref(false);

// 加载留言数据
const loadMessages = async () => {
  try {
    loading.value = true;
    const data = await getMessages();
    
    // 映射后端数据到前端格式
    messageList.value = data.map((item: any) => ({
      id: item.ID || item.id,
      name: item.ContactName || item.name || '',
      email: item.Email || item.email || '',
      phone: item.Phone || item.phone || '',
      content: item.Content || item.content || '',
      createTime: item.AddTime || item.createTime || '',
      status: 'read' as const,
      reply: '',
      replyTime: ''
    }));
  } catch (error) {
    console.error('加载留言失败:', error);
    ElMessage.error('加载留言失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadMessages();
});

const pageSize = 10;
const currentPage = ref(1);
const totalMessages = computed(() => messageList.value.length);
const filterStatus = ref('');

const filteredMessages = computed(() => {
  let result = [...messageList.value];

  if (filterStatus.value) {
    result = result.filter(item => item.status === filterStatus.value);
  }

  // 简单分页，实际应用中应该从后端获取分页数据
  const startIndex = (currentPage.value - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return result.slice(startIndex, endIndex);
});

const dialogVisible = ref(false);
const currentMessage = ref<MessageItem>({
  id: 0,
  name: '',
  email: '',
  phone: '',
  content: '',
  createTime: '',
  status: 'unread'
});

const getStatusText = (status: string) => {
  switch (status) {
    case 'unread':
      return '未读';
    case 'read':
      return '已读';
    case 'replied':
      return '已回复';
    default:
      return '未知';
  }
};

const getStatusType = (status: string) => {
  switch (status) {
    case 'unread':
      return 'danger';
    case 'read':
      return 'warning';
    case 'replied':
      return 'success';
    default:
      return 'info';
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
};

const handleView = (row: MessageItem) => {
  currentMessage.value = { ...row };
  dialogVisible.value = true;
};

const handleDelete = async (row: MessageItem) => {
  ElMessageBox.confirm(
    '确定要删除这条留言吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteMessage(row.id);
      messageList.value = messageList.value.filter(item => item.id !== row.id);
      ElMessage({
        type: 'success',
        message: '删除成功'
      });
    } catch (error) {
      console.error('删除留言失败:', error);
      ElMessage.error('删除失败');
    }
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消删除'
    });
  });
};
</script>

<style scoped>
.message-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  color: #409EFF;
}

.message-card {
  margin-bottom: 20px;
}


.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 美化留言详情 */
.message-detail {
  padding: 10px 0;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 8px;
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
}

.detail-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateX(4px);
}

.detail-icon {
  font-size: 20px;
  color: #409EFF;
  margin-right: 16px;
  flex-shrink: 0;
}

.detail-content {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 15px;
  color: #303133;
  font-weight: 500;
}

.message-content-section {
  margin-top: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #e8f4ff 0%, #f5f7fa 100%);
  border-radius: 12px;
  border: 1px solid #d9ecff;
}

.content-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #409EFF;
  margin-bottom: 12px;
}

.message-content-box {
  background: #ffffff;
  padding: 16px;
  border-radius: 8px;
  min-height: 80px;
  line-height: 1.8;
  font-size: 14px;
  color: #606266;
  white-space: pre-wrap;
  word-break: break-word;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style>

