<script lang="ts" setup>
import {
  Goods,
  Edit,
  Document,
  Files,
  ChatDotRound,
  User,
  Picture,
  Plus,
  List
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <el-row>
    <el-col >
      <div class="menu-header">
        <img src="/logo.svg" alt="Logo" class="menu-icon" />
        <h5 class="mb-2">管理菜单</h5>
      </div>
      <el-menu
        default-active="1-1"
        class="el-menu-vertical-demo pr-2"
        @open="handleOpen"
        @close="handleClose"
        :default-openeds="['1']"
      >

        <el-sub-menu index="1">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>列表管理</span>
          </template>
          <el-menu-item index="1-1" @click="navigateTo('/news-list')">
            <el-icon><List /></el-icon>
            <span>列表管理</span>
          </el-menu-item>
          <el-menu-item index="1-2" @click="navigateTo('/news-category/list')">
            <el-icon><List /></el-icon>
            <span>分类管理</span>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item index="2" @click="navigateTo('/news-manage')">
          <el-icon><Document /></el-icon>
          <span>新闻管理</span>
        </el-menu-item>
        <el-menu-item index="3" @click="navigateTo('/single-page')">
          <el-icon><Files /></el-icon>
          <span>单页管理</span>
        </el-menu-item>
        <el-menu-item index="4" @click="navigateTo('/messages')">
          <el-icon><ChatDotRound /></el-icon>
          <span>在线留言</span>
        </el-menu-item>
        <el-menu-item index="5" @click="navigateTo('/carousel')">
          <el-icon><Picture /></el-icon>
          <span>轮播图管理</span>
        </el-menu-item>
      </el-menu>
    </el-col>
  </el-row>
</template>


<style scoped>
.el-menu-vertical-demo {
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background-color: #e6f1fc;
  border-radius: 4px;
  margin-bottom: 10px;
}

.menu-icon {
  width: 32px;
  height: 32px;
  margin-right: 10px;
}

.mb-2 {
  margin-bottom: 0;
  color: #409EFF;
  font-weight: bold;
}
</style>
