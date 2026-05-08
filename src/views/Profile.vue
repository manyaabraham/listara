<template>
  <div class="profile-page">
    <!-- Profile Header Card -->
    <div class="profile-card">
      <!-- Three Dots Menu -->
      <div class="menu-container">
        <button class="menu-trigger" @click="toggleMenu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="5" r="1.5"/>
            <circle cx="12" cy="12" r="1.5"/>
            <circle cx="12" cy="19" r="1.5"/>
          </svg>
        </button>
        
        <div v-if="showMenu" class="dropdown-menu" @click.stop>
          <div class="dropdown-item" @click="goToEditProfile">
            <span class="dropdown-icon">✎</span>
            <span>Edit Profile</span>
          </div>
          <div class="dropdown-item" @click="goToChangePassword">
            <span class="dropdown-icon">🔒</span>
            <span>Change Password</span>
          </div>
          <hr class="dropdown-divider">
          <div class="dropdown-item logout-item" @click="logout">
            <span class="dropdown-icon">🚪</span>
            <span>Sign Out</span>
          </div>
        </div>
      </div>

      <div class="profile-cover"></div>
      <div class="profile-avatar-wrapper">
        <div class="profile-avatar" @click="goToEditProfile">
          <img v-if="authStore.profile?.avatar_url" :src="authStore.profile.avatar_url" alt="Profile">
          <div v-else class="avatar-placeholder">
            {{ getUserInitials() }}
          </div>
          <div class="avatar-edit-badge">
            <span>✎</span>
          </div>
        </div>
      </div>
      <div class="profile-info">
        <h2>{{ displayName }}</h2>
        <p class="user-email">{{ authStore.user?.email }}</p>
        <div class="account-status">
          <span class="status-badge" :class="accountStatus.class">
            {{ accountStatus.icon }} {{ accountStatus.text }}
          </span>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="stats-section">
      <div class="stat-card" @click="goToKitchen">
        <div class="stat-number">{{ kitchenStore.items.length }}</div>
        <div class="stat-label">Kitchen Items</div>
      </div>
      <div class="stat-card" @click="goToShopping">
        <div class="stat-number">{{ pendingShopping.length }}</div>
        <div class="stat-label">Shopping Items</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ lowStockCount }}</div>
        <div class="stat-label">Low Stock</div>
      </div>
    </div>

    <!-- Member Since -->
    <div class="member-since">
      <p>Member since {{ formatDate(authStore.user?.created_at) }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useKitchenStore } from '../stores/kitchen'
import { useShoppingStore } from '../stores/shopping'

const router = useRouter()
const authStore = useAuthStore()
const kitchenStore = useKitchenStore()
const shoppingStore = useShoppingStore()

const showMenu = ref(false)

const lowStockCount = computed(() => kitchenStore.items.filter(i => i.status === 'low').length)
const pendingShopping = computed(() => shoppingStore.items.filter(i => i.status === 'pending'))

const displayName = computed(() => {
  return authStore.profile?.display_name || authStore.profile?.full_name || authStore.user?.email?.split('@')[0] || 'User'
})

const accountStatus = computed(() => {
  const isVerified = authStore.user?.email_confirmed_at || authStore.user?.confirmed_at
  if (isVerified) {
    return { class: 'active', icon: '●', text: 'Active' }
  }
  return { class: 'pending', icon: '○', text: 'Pending' }
})

const formatDate = (dateString) => {
  if (!dateString) return 'Not available'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const getUserInitials = () => {
  const name = authStore.profile?.display_name || authStore.profile?.full_name
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const closeMenu = () => {
  showMenu.value = false
}

const goToEditProfile = () => {
  closeMenu()
  router.push('/profile/edit')
}

const goToChangePassword = () => {
  closeMenu()
  router.push('/profile/change-password')
}

const goToKitchen = () => {
  router.push('/kitchen')
}

const goToShopping = () => {
  router.push('/shopping')
}

const logout = async () => {
  closeMenu()
  await authStore.logout()
  router.push('/login')
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  const menuContainer = document.querySelector('.menu-container')
  if (menuContainer && !menuContainer.contains(event.target)) {
    showMenu.value = false
  }
}

onMounted(async () => {
  await kitchenStore.loadItems()
  await shoppingStore.loadList()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.profile-page {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.profile-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: relative;
}

.menu-container {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
}

.menu-trigger {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--dark);
  backdrop-filter: blur(4px);
}

.menu-trigger:hover {
  background: white;
  transform: scale(1.05);
}

.dropdown-menu {
  position: absolute;
  top: 45px;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  overflow: hidden;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

.dropdown-icon {
  font-size: 16px;
  width: 20px;
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

.profile-cover {
  height: 100px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
}

.profile-avatar-wrapper {
  display: flex;
  justify-content: center;
  margin-top: -50px;
}

.profile-avatar {
  position: relative;
  cursor: pointer;
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: 500;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.profile-avatar img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-edit-badge {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: var(--primary);
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border: 2px solid white;
  cursor: pointer;
}

.profile-info {
  text-align: center;
  padding: 20px 20px 24px;
}

.profile-info h2 {
  margin-bottom: 6px;
  color: var(--dark);
  font-size: 24px;
  font-weight: 600;
}

.user-email {
  color: var(--gray-600);
  font-size: 14px;
  margin-bottom: 12px;
}

.account-status {
  margin-top: 8px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.pending {
  background: #fff3e0;
  color: #e65100;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 16px;
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: var(--gray-600);
}

.member-since {
  text-align: center;
  padding: 16px;
  color: var(--gray-500);
  font-size: 12px;
}

@media (max-width: 480px) {
  .profile-page {
    padding: 16px;
  }
  
  .avatar-placeholder,
  .profile-avatar img {
    width: 80px;
    height: 80px;
    font-size: 32px;
  }
  
  .profile-avatar-wrapper {
    margin-top: -40px;
  }
  
  .profile-cover {
    height: 80px;
  }
  
  .stat-number {
    font-size: 22px;
  }
  
  .dropdown-menu {
    min-width: 160px;
  }
}
</style>