import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import MainView from '@/views/MainView.vue';
import WelcomeView from '@/views/WelcomeView.vue';
import SinglePageView from '@/views/SinglePageView.vue';
import SinglePageEditView from '@/views/SinglePageEditView.vue';
import MessageView from '@/views/MessageView.vue';
import CarouselView from '@/views/CarouselView.vue';
import ProfileView from '@/views/ProfileView.vue';

import NewsCategoryView from '@/views/NewsCategoryView.vue';
import NewsEditView from '@/views/NewsEditView.vue';
import NewsListView from '@/views/NewsListView.vue';
import NewsManageView from '@/views/NewsManageView.vue';
import SuperAdminView from '@/views/SuperAdminView.vue';

import { isAuthenticated } from '@/API/auth';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/super-admin',
    name: 'SuperAdmin',
    component: SuperAdminView,
  },
  {
    path: '/',
    name: 'Main',
    component: MainView,
    children: [
      {
        path: '',
        name: 'Welcome',
        component: WelcomeView,
      },
      {
        path: 'single-page',
        name: 'SinglePage',
        component: SinglePageView,
      },
      {
        path: 'single-page/edit',
        name: 'SinglePageEdit',
        component: SinglePageEditView,
      },
      {
        path: 'news-manage',
        name: 'NewsManage',
        component: NewsManageView,
      },
      {
        path: 'messages',
        name: 'Messages',
        component: MessageView,
      },
      {
        path: 'carousel',
        name: 'Carousel',
        component: CarouselView,
      },
      {
        path: 'profile',
        name: 'Profile',
        component: ProfileView,
      },

      {
        path: 'news-list',
        name: 'NewsList',
        component: NewsListView,
      },
      {
        path: 'news-category',
        name: 'NewsCategory',
        component: NewsCategoryView,
      },
      {
        path: 'news-category/add',
        name: 'NewsCategoryAdd',
        component: NewsCategoryView,
      },
      {
        path: 'news-category/list',
        name: 'NewsCategoryList',
        component: NewsCategoryView,
      },
      {
        path: 'news-edit',
        name: 'NewsEdit',
        component: NewsEditView,
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory('/'),
  routes,
});

// 路由守卫：检查认证状态
router.beforeEach((to, from, next) => {
  // 登录页面不需要认证
  if (to.path === '/login') {
    next();
    return;
  }

  // 检查是否已认证
  if (isAuthenticated()) {
    next();
  } else {
    // 未认证，重定向到登录页面
    next('/login');
  }
});

export default router;