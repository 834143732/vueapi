
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import { isAuthenticated, isTokenExpired, logout } from './API/auth';

const router = useRouter();
const checkInterval = ref<number | null>(null);

// Function to check token expiration
const checkTokenExpiration = () => {
  console.log('Checking token expiration...');

  // Only check if user is authenticated (has a token)
  if (isAuthenticated()) {
    // If token is expired, logout and redirect to login page
    if (isTokenExpired()) {
      console.log('Token has expired, logging out...');
      logout(router, '登录已过期，请重新登录');
    }
  }
};

onMounted(() => {
  console.log('App mounted, setting up token expiration check');

  // Check token expiration immediately
  checkTokenExpiration();

  // Set up interval to check token expiration every minute
  checkInterval.value = window.setInterval(() => {
    checkTokenExpiration();
  }, 60000); // Check every minute
});

onBeforeUnmount(() => {
  console.log('App unmounting, clearing token expiration check interval');

  // Clear the interval when component is unmounted
  if (checkInterval.value !== null) {
    clearInterval(checkInterval.value);
    checkInterval.value = null;
  }
});
</script>


<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
/* Global styles for Element Plus message component */
.el-message {
  z-index: 9999 !important; /* Ensure messages appear above all other content */
  top: 20px !important; /* Position at the top of the page */
}

/* Token expiration message specific styles */
.el-message--warning {
  background-color: #fdf6ec !important;
  border-color: #f5dab1 !important;
  padding: 12px 20px !important;
  font-size: 14px !important;
  font-weight: bold !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

/* App container styles */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100vw;
  height: 100vh;
  margin: 0 auto;
  padding: 0; /* Remove padding to ensure full-width layout */
  font-weight: normal;
  position: relative; /* For proper positioning of notifications */
  overflow-x: hidden; /* Prevent horizontal scrolling */
  background-color: #f5f5f5;
}
</style>
