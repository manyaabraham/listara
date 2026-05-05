<template>
  <div class="profile-page">
    <div class="profile-header card">
      <div class="profile-avatar">
        <div class="avatar-placeholder">
          {{ authStore.profile?.full_name?.charAt(0) || 'U' }}
        </div>
      </div>
      <h2>{{ authStore.profile?.full_name }}</h2>
      <p>{{ authStore.user?.email }}</p>
    </div>

    <div class="install-section card">
      <h3>📱 Install App</h3>
      <p>Get Listara on your home screen for easy access</p>
      <button @click="showInstallInstructions" class="btn btn-primary">
        Install Listara
      </button>
    </div>

    <div class="profile-stats card">
      <h3>Your Kitchen Stats</h3>
      <div class="stats-list">
        <div class="stat-row">
          <span>Total Items</span>
          <span class="stat-value">{{ kitchenStore.items.length }}</span>
        </div>
        <div class="stat-row">
          <span>Low Stock Items</span>
          <span class="stat-value">{{ lowStockCount }}</span>
        </div>
        <div class="stat-row">
          <span>Shopping Items</span>
          <span class="stat-value">{{ pendingShopping.length }}</span>
        </div>
      </div>
    </div>

    <div class="profile-actions card">
      <h3>Account Settings</h3>
      <button @click="logout" class="btn btn-danger">Logout</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useKitchenStore } from '../stores/kitchen'
import { useShoppingStore } from '../stores/shopping'

const router = useRouter()
const authStore = useAuthStore()
const kitchenStore = useKitchenStore()
const shoppingStore = useShoppingStore()

const lowStockCount = computed(() => kitchenStore.items.filter(i => i.status === 'low').length)
const pendingShopping = computed(() => shoppingStore.items.filter(i => i.status === 'pending'))

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}

const showInstallInstructions = () => {
  // Check if app is already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    alert('✨ Listara is already installed on your device!')
    return
  }

  // Check if browser supports PWA installation
  if ('BeforeInstallPromptEvent' in window) {
    alert('📱 Tap the install button that appears in your browser address bar!')
  } else {
    // Show manual instructions
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

    if (isIOS) {
      alert('📱 To install Listara on iPhone/iPad:\n\n1. Tap the Share button (⬆️)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" in the top right')
    } else {
      alert('📱 To install Listara on Android:\n\n1. Tap the menu (3 dots) in Chrome\n2. Tap "Install App" or "Add to Home Screen"\n3. Tap "Install" to confirm')
    }
  }
}

onMounted(async () => {
  await kitchenStore.loadItems()
  await shoppingStore.loadList()
})
</script>

<style scoped>
.profile-page {
  max-width: 600px;
  margin: 0 auto;
}

.profile-header {
  text-align: center;
  margin-bottom: 20px;
}

.install-section {
  text-align: center;
  margin-bottom: 20px;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(78, 205, 196, 0.1));
  border: 2px solid var(--primary);
}

.install-section h3 {
  color: var(--primary);
  margin-bottom: 8px;
}

.install-section p {
  color: var(--gray-600);
  font-size: 14px;
  margin-bottom: 15px;
}

.install-section .btn-primary {
  background: var(--primary);
  color: white;
  padding: 12px 24px;
  font-size: 16px;
}

.profile-avatar {
  margin-bottom: 16px;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
}

.profile-header h2 {
  margin-bottom: 4px;
}

.profile-header p {
  color: var(--gray-600);
}

.stats-list {
  margin-top: 16px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--gray-200);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-value {
  font-weight: bold;
  color: var(--primary);
}

.profile-actions {
  text-align: center;
}

.btn-danger {
  background: var(--danger);
  color: white;
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-danger:hover {
  background: #d32f2f;
  transform: translateY(-2px);
}

.btn-primary {
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}
</style>
