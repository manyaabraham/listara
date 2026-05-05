<template>
  <div id="app">
    <div v-if="authStore.user" class="app-layout">
      <nav class="bottom-nav">
        <router-link to="/dashboard" class="nav-item">
          <span class="nav-icon">🏠</span>
          <span class="nav-label">Home</span>
        </router-link>
        <router-link to="/kitchen" class="nav-item">
          <span class="nav-icon">🥬</span>
          <span class="nav-label">Kitchen</span>
        </router-link>
        <router-link to="/shopping" class="nav-item">
          <span class="nav-icon">🛒</span>
          <span class="nav-label">Shopping</span>
        </router-link>
        <router-link to="/notifications" class="nav-item">
          <span class="nav-icon">🔔</span>
          <span class="nav-label" v-if="unreadCount > 0">
            <span class="notification-badge">{{ unreadCount }}</span>
          </span>
          <span class="nav-label">Alerts</span>
        </router-link>
        <router-link to="/profile" class="nav-item">
          <span class="nav-icon">👤</span>
          <span class="nav-label">Profile</span>
        </router-link>
      </nav>
      <main class="main-content">
        <router-view />
      </main>
      <InstallPrompt />
    </div>
    <router-view v-else />
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useAuthStore } from './stores/auth'
import { useNotificationStore } from './stores/notifications'
import InstallPrompt from './components/InstallButton.vue'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const unreadCount = computed(() => notificationStore.unreadCount)

onMounted(async () => {
  await authStore.loadUser()
  if (authStore.user) {
    await notificationStore.loadNotifications()
  }
})
</script>

<style scoped>
/* Your existing styles */
.app-layout {
  padding-bottom: 70px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.3s;
  position: relative;
}

.nav-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.nav-label {
  font-size: 12px;
  color: var(--gray-600);
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--danger);
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: bold;
}

.router-link-active .nav-label {
  color: var(--primary);
  font-weight: 600;
}

.router-link-active {
  background: rgba(255, 107, 53, 0.1);
}

.main-content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (min-width: 769px) {
  .bottom-nav {
    display: none;
  }

  .app-layout {
    padding-bottom: 0;
  }
}
</style>
