<template>
  <div id="app">
      <div id="app">
    <SplashManager />
    <!-- rest of your app -->
  </div>
    <div v-if="authStore.user" class="app-layout">
      <!-- Side Panel Overlay -->
      <div v-if="sidePanelOpen" class="side-panel-overlay" @click="closeSidePanel"></div>

      <!-- Side Panel (Slides from left) -->
      <div class="side-panel" :class="{ 'open': sidePanelOpen }">
        <div class="side-panel-header">
          <div class="side-panel-avatar">
            {{ getUserInitials() }}
          </div>
          <div class="side-panel-user">
            <h3>{{ getUserFullName() }}</h3>
            <p>{{ authStore.user?.email }}</p>
          </div>
          <button class="close-side-panel" @click="closeSidePanel">✕</button>
        </div>

        <div class="side-panel-menu">
          <div class="menu-item" @click="navigateTo('/dashboard')">
            <img src="/icons/home.svg" alt="Home" class="menu-icon">
            <span>Dashboard</span>
          </div>
          <div class="menu-item" @click="navigateTo('/kitchen')">
            <img src="/icons/kitchen.svg" alt="Kitchen" class="menu-icon">
            <span>Kitchen Inventory</span>
          </div>
          <div class="menu-item" @click="navigateTo('/shopping')">
            <img src="/icons/shopping.svg" alt="Shopping" class="menu-icon">
            <span>Shopping List</span>
          </div>
          <div class="menu-item" @click="navigateTo('/recipes')">
            <img src="/icons/recipes.svg" alt="Recipes" class="menu-icon">
            <span>Recipes</span>
          </div>
          <div class="menu-item" @click="navigateTo('/reports')">
            <img src="/icons/report.svg" alt="Reports" class="menu-icon">
            <span>Analytics</span>
          </div>
 
          <div class="menu-item" @click="navigateTo('/chefscorner')">
            <img src="/icons/hat.svg" alt="Chef" class="menu-icon">
            <span>Chef's Corner</span>
          </div>
          <div class="menu-item" @click="navigateTo('/profile')">
            <img src="/icons/profile.svg" alt="Profile" class="menu-icon">
            <span>My Profile</span>
          </div>
          <div class="menu-item" @click="navigateTo('/settings')">
            <img src="/icons/settings.svg" alt="Settings" class="menu-icon">
            <span>Settings</span>
          </div>
        </div>

        <div class="side-panel-footer">
          <div class="menu-item logout" @click="logout">
            <img src="/icons/logout.svg" alt="Logout" class="menu-icon">
            <span>Sign Out</span>
          </div>
        </div>
      </div>

      <!-- Top Header Bar - Hidden on Chef's Corner pages -->
      <header class="top-header" v-if="!isChefsCornerPage">
        <div class="header-left">
          <button class="menu-btn" @click="openSidePanel">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <h1 class="app-logo">Listara</h1>
        </div>

        <div class="header-right">
          <div class="notification-icon" @click="toggleNotifications">
            <img src="/icons/bell.svg" alt="Notifications" class="icon-svg">
            <span v-if="unreadCount > 0" class="notification-badge-top">{{ unreadCount }}</span>
          </div>

          <div class="user-avatar" @click="goToProfile">
            {{ getUserInitials() }}
          </div>

          <div class="dropdown-trigger" @click="toggleUserMenu">
            <img src="/icons/menu-dots.svg" alt="Menu" class="icon-svg">
          </div>

          <div v-if="showUserMenu" class="dropdown-menu" @click.stop>
            <div class="dropdown-item" @click="quickAddItem">
              <img src="/icons/add.svg" alt="Add" class="dropdown-icon-svg">
              <span>Add Item</span>
            </div>
            <div class="dropdown-item" @click="goToShopping">
              <img src="/icons/shopping.svg" alt="Shopping" class="dropdown-icon-svg">
              <span>View Shopping List</span>
            </div>
            <div class="dropdown-item" @click="scanBarcode">
              <img src="/icons/scan.svg" alt="Scan" class="dropdown-icon-svg">
              <span>Scan Item</span>
            </div>
            <div class="dropdown-item" @click="generateReport">
              <img src="/icons/report.svg" alt="Report" class="dropdown-icon-svg">
              <span>Generate Report</span>
            </div>
            <hr class="dropdown-divider">
            <div class="dropdown-item" @click="goToSettings">
              <img src="/icons/settings.svg" alt="Settings" class="dropdown-icon-svg">
              <span>Settings</span>
            </div>
            <hr class="dropdown-divider">
            <div class="dropdown-item logout-item" @click="logout">
              <img src="/icons/logout.svg" alt="Logout" class="dropdown-icon-svg">
              <span>Sign Out</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Notifications Panel -->
      <div v-if="showNotifications" class="notifications-panel" @click.stop>
        <div class="notifications-header">
          <button class="back-btn" @click="toggleNotifications">←</button>
          <h3>Notifications</h3>
          <button v-if="unreadCount > 0" @click="markAllRead" class="mark-read-btn">Mark all</button>
        </div>
        <div class="notifications-list">
          <div v-for="notif in notifications" :key="notif.id" class="notification-item" :class="{ unread: !notif.is_read }">
            <div class="notif-icon">
              <img :src="getNotificationIcon(notif.type)" alt="" class="notif-icon-svg">
            </div>
            <div class="notif-content">
              <div class="notif-title">{{ notif.title }}</div>
              <div class="notif-message">{{ notif.message }}</div>
              <div class="notif-time">{{ formatTime(notif.created_at) }}</div>
            </div>
          </div>
          <div v-if="notifications.length === 0" class="empty-notifications">
            No notifications
          </div>
        </div>
      </div>

      <!-- Bottom Navigation - Hidden on Chef's Corner pages -->
      <nav class="bottom-nav" v-if="!isChefsCornerPage">
        <router-link to="/dashboard" class="nav-item">
          <img src="/icons/home.svg" alt="Home" class="nav-icon-svg">
          <span class="nav-label">Home</span>
        </router-link>
        <router-link to="/kitchen" class="nav-item">
          <img src="/icons/kitchen.svg" alt="Kitchen" class="nav-icon-svg">
          <span class="nav-label">Kitchen</span>
        </router-link>
        <router-link to="/shopping" class="nav-item">
          <img src="/icons/shopping.svg" alt="Shopping" class="nav-icon-svg">
          <span class="nav-label">Shopping</span>
        </router-link>
        <router-link to="/recipes" class="nav-item">
          <img src="/icons/recipes.svg" alt="Recipes" class="nav-icon-svg">
          <span class="nav-label">Recipes</span>
        </router-link>
        <router-link to="/reports" class="nav-item">
          <img src="/icons/report.svg" alt="Reports" class="nav-icon-svg">
          <span class="nav-label">Reports</span>
        </router-link>
      </nav>

      <main class="main-content" :class="{ 'fullscreen-mode': isChefsCornerPage }">
        <router-view />
      </main>

      <!-- Floating AI Assistant Button - Hidden on Chef's Corner pages -->
      <button v-if="!isChefsCornerPage" class="floating-ai-btn" @click="goToAIAssistant">
        <div class="ai-icon">🤖</div>
        <div class="ai-pulse"></div>
      </button>

      <InstallPrompt />
    </div>
    <router-view v-else />
  </div>
</template>

<script setup>
import { onMounted, computed, ref, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useKitchenStore } from './stores/kitchen'
import { useShoppingStore } from './stores/shopping'
import { useNotificationStore } from './stores/notifications'
import SplashManager from './components/SplashManager.vue'
import InstallPrompt from './components/InstallPrompt.vue'
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const kitchenStore = useKitchenStore()
const shoppingStore = useShoppingStore()
const notificationStore = useNotificationStore()

const showUserMenu = ref(false)
const showNotifications = ref(false)
const sidePanelOpen = ref(false)
const isChefsCornerPage = ref(false)

const unreadCount = computed(() => notificationStore.unreadCount)
const notifications = computed(() => notificationStore.notifications)


// Define Chef's Corner related paths
const chefsCornerPaths = [
  '/chefscorner',
  '/chef-chat',
  '/chef-messaging-profile',
  '/chef-account-settings'
]

// Watch route changes to detect Chef's Corner pages
watch(() => route.path, (newPath) => {
  // Check if current path is in Chef's Corner paths
  isChefsCornerPage.value = chefsCornerPaths.some(path => newPath.startsWith(path))
}, { immediate: true })

const getUserInitials = () => {
  const name = authStore.profile?.display_name || authStore.profile?.full_name
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

const getUserFullName = () => {
  return authStore.profile?.display_name || authStore.profile?.full_name || 'User'
}

const openSidePanel = () => {
  sidePanelOpen.value = true
}

const closeSidePanel = () => {
  sidePanelOpen.value = false
}

const navigateTo = (path) => {
  sidePanelOpen.value = false
  router.push(path)
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  if (showNotifications.value) showNotifications.value = false
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  if (showUserMenu.value) showUserMenu.value = false
}

const goToProfile = () => {
  router.push('/profile')
}

const goToSettings = () => {
  showUserMenu.value = false
  router.push('/settings')
}

const goToShopping = () => {
  showUserMenu.value = false
  router.push('/shopping')
}

const goToAIAssistant = () => {
  router.push('/ai-assistant')
}

const quickAddItem = () => {
  showUserMenu.value = false
  if (window.openAddItemModal) {
    window.openAddItemModal()
  } else {
    router.push('/dashboard')
    setTimeout(() => {
      if (window.openAddItemModal) {
        window.openAddItemModal()
      }
    }, 500)
  }
}

const scanBarcode = () => {
  showUserMenu.value = false
  alert('Barcode scanner feature coming soon!')
}

const generateReport = () => {
  showUserMenu.value = false
  router.push('/reports')
}

const logout = async () => {
  showUserMenu.value = false
  sidePanelOpen.value = false
  await authStore.logout()
  router.push('/login')
}

const markAllRead = async () => {
  await notificationStore.markAllAsRead()
}

const getNotificationIcon = (type) => {
  const icons = {
    expiry: '/icons/warning.svg',
    low_stock: '/icons/alert.svg',
    shopping: '/icons/cart.svg',
    recipe: '/icons/recipe.svg'
  }
  return icons[type] || '/icons/bell.svg'
}

const formatTime = (date) => {
  if (!date) return ''
  const now = new Date()
  const notifDate = new Date(date)
  const diff = Math.floor((now - notifDate) / 1000 / 60)

  if (diff < 1) return 'Just now'
  if (diff < 60) return `${diff} minutes ago`
  if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`
  return notifDate.toLocaleDateString()
}

// Handle swipe gestures for side panel
let touchStartX = 0
let touchEndX = 0

const handleTouchStart = (event) => {
  touchStartX = event.changedTouches[0].screenX
}

const handleTouchEnd = (event) => {
  touchEndX = event.changedTouches[0].screenX
  const swipeDistance = touchEndX - touchStartX

  if (swipeDistance > 50 && touchStartX < 50) {
    sidePanelOpen.value = true
  }

  if (swipeDistance < -50 && sidePanelOpen.value) {
    sidePanelOpen.value = false
  }
}

// Close dropdowns when clicking outside
const handleClickOutside = (event) => {
  const header = document.querySelector('.top-header')
  if (header && !header.contains(event.target)) {
    showUserMenu.value = false
    showNotifications.value = false
  }
}

// Handle side panel open event from AI Assistant
const handleOpenSidePanel = () => {
  sidePanelOpen.value = true
}

onMounted(async () => {
  await authStore.loadUser()
  if (authStore.user) {
    await notificationStore.loadNotifications()
    await kitchenStore.loadItems()
    await shoppingStore.loadList()
  }
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('touchstart', handleTouchStart)
  document.addEventListener('touchend', handleTouchEnd)

  // Add event listener for side panel
  window.addEventListener('openSidePanel', handleOpenSidePanel)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('touchend', handleTouchEnd)

  // Remove event listener for side panel
  window.removeEventListener('openSidePanel', handleOpenSidePanel)
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-layout {
  min-height: 100vh;
  padding-bottom: 70px;
}

/* Side Panel Overlay */
.side-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

/* Side Panel */
.side-panel {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 85%;
  max-width: 320px;
  background: linear-gradient(135deg, #fff9f5 0%, #ffffff 100%);
  z-index: 2001;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.side-panel.open {
  transform: translateX(0);
}

.side-panel-header {
  background: linear-gradient(135deg, #FF6B35, #F7A440);
  padding: 30px 20px;
  text-align: center;
  position: relative;
}

.side-panel-avatar {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
  color: white;
  margin: 0 auto 15px;
  backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.side-panel-user h3 {
  color: white;
  font-size: 18px;
  margin-bottom: 4px;
}

.side-panel-user p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

.close-side-panel {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 18px;
  transition: all 0.2s;
}

.close-side-panel:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.side-panel-menu {
  flex: 1;
  padding: 20px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--dark);
  font-size: 15px;
  font-weight: 500;
}

.menu-item:hover {
  background: rgba(255, 107, 53, 0.1);
  padding-left: 28px;
}

.menu-icon {
  width: 22px;
  height: 22px;
}

.menu-item.logout {
  border-top: 1px solid var(--gray-200);
  margin-top: 10px;
  color: var(--danger);
}

.menu-item.logout:hover {
  background: rgba(244, 67, 54, 0.1);
}

.side-panel-footer {
  padding: 20px 0;
  border-top: 1px solid var(--gray-200);
}

/* Top Header */
.top-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  z-index: 1001;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.2s;
}

.menu-btn:hover {
  background: var(--gray-100);
}

.app-logo {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

.notification-icon {
  position: relative;
  cursor: pointer;
  padding: 8px;
}

.icon-svg {
  width: 22px;
  height: 22px;
  display: block;
}

.notification-badge-top {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--danger);
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: bold;
  min-width: 18px;
  text-align: center;
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.dropdown-trigger {
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.dropdown-trigger:hover {
  background: var(--gray-100);
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  top: 55px;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 210px;
  overflow: hidden;
  z-index: 1002;
  animation: fadeIn 0.2s ease;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  color: var(--dark);
  font-size: 14px;
}

.dropdown-item:hover {
  background: var(--gray-100);
}

.dropdown-icon-svg {
  width: 18px;
  height: 18px;
}

.dropdown-divider {
  height: 1px;
  background: var(--gray-200);
  margin: 4px 0;
  border: none;
}

.logout-item {
  color: var(--danger);
}

.logout-item:hover {
  background: #ffebee;
}

/* Notifications Panel */
.notifications-panel {
  position: absolute;
  top: 65px;
  right: 20px;
  width: 350px;
  max-height: 450px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1002;
  animation: fadeIn 0.2s ease;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--gray-200);
}

.notifications-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  flex: 1;
  text-align: center;
}

.back-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--primary);
  padding: 0;
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mark-read-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 12px;
  cursor: pointer;
}

.notifications-list {
  max-height: 380px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--gray-100);
  cursor: pointer;
}

.notification-item.unread {
  background: rgba(255, 107, 53, 0.05);
}

.notification-item:hover {
  background: var(--gray-50);
}

.notif-icon-svg {
  width: 20px;
  height: 20px;
}

.notif-content {
  flex: 1;
}

.notif-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.notif-message {
  font-size: 12px;
  color: var(--gray-600);
  margin-bottom: 4px;
}

.notif-time {
  font-size: 10px;
  color: var(--gray-400);
}

.empty-notifications {
  text-align: center;
  padding: 40px;
  color: var(--gray-500);
  font-size: 14px;
}

/* Bottom Navigation */
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
  transition: transform 0.3s ease;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.3s;
  gap: 4px;
}

.nav-icon-svg {
  width: 24px;
  height: 24px;
  display: block;
}

.nav-label {
  font-size: 11px;
  color: var(--gray-600);
}

.router-link-active .nav-label {
  color: var(--primary);
  font-weight: 600;
}

.router-link-active {
  background: rgba(255, 107, 53, 0.1);
}

.main-content {
  padding: 80px 20px 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
}

/* Fullscreen mode for Chef's Corner pages */
.main-content.fullscreen-mode {
  padding: 0;
  max-width: 100%;
  min-height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
}

/* Floating AI Button */
.floating-ai-btn {
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), #F7A440);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
  transition: all 0.3s;
  z-index: 999;
}

.floating-ai-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.6);
}

.ai-icon {
  font-size: 28px;
}

.ai-pulse {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
  background: rgba(255, 107, 53, 0.4);
  animation: pulse 2s infinite;
  z-index: -1;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    padding: 80px 16px 20px;
  }

  .main-content.fullscreen-mode {
    padding: 0;
  }

  .notifications-panel {
    width: calc(100vw - 40px);
    right: 20px;
    left: 20px;
  }

  .side-panel {
    width: 80%;
    max-width: 280px;
  }

  .floating-ai-btn {
    bottom: 80px;
    right: 16px;
    width: 50px;
    height: 50px;
  }

  .ai-icon {
    font-size: 24px;
  }
}

@media (min-width: 769px) {
  .bottom-nav {
    display: none;
  }

  .app-layout {
    padding-bottom: 0;
  }

  .menu-btn {
    display: none;
  }

  .header-left {
    gap: 0;
  }
}
</style>