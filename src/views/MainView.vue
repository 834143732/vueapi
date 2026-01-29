<script setup lang="ts">
import { RouterView } from 'vue-router';
import sideview from '@/views/SideView.vue';
import headerview from '@/views/HeaderView.vue';
import footerview from '@/views/FooterView.vue';

</script>

<template>
  <div>
    <el-container class="border border-black-600 rounded-lg p-4 size-full">
      <el-aside width="210px">
        <sideview />
      </el-aside>
      <el-container>
        <el-header>
          <headerview />
        </el-header>
        <el-main>
          <router-view />
        </el-main>
        <el-footer>
          <footerview />
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.el-container {
  background-color: #f9fafc;
  background-image: url('@/assets/images/bg-pattern.svg');
  background-repeat: repeat;
}

.el-aside {
  background-color: #ffffff;
  margin-right: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.el-header {
  padding: 10px 0;
}

.el-main {
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin: 10px 0;
}

.el-footer {
  background-color: #f5f7fa;
  border-radius: 4px;
  text-align: center;
  padding: 10px 0;
}
</style>
