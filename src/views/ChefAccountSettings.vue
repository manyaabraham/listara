<template>
  <div class="account-settings">
    <div class="settings-container">
      <div class="settings-header">
        <button class="back-btn" @click="$router.back()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h2>Account Settings</h2>
      </div>

      <div class="settings-list">
        <div class="setting-item" @click="changeDisplayName">
          <div class="setting-icon">✎</div>
          <div class="setting-info">
            <div class="setting-title">Display Name</div>
            <div class="setting-value">{{ userFullName }}</div>
          </div>
          <div class="setting-arrow">→</div>
        </div>

        <div class="setting-item" @click="changeEmail">
          <div class="setting-icon">📧</div>
          <div class="setting-info">
            <div class="setting-title">Email Address</div>
            <div class="setting-value">{{ userEmail }}</div>
          </div>
          <div class="setting-arrow">→</div>
        </div>

        <div class="setting-item" @click="changePassword">
          <div class="setting-icon">🔒</div>
          <div class="setting-info">
            <div class="setting-title">Password</div>
            <div class="setting-value">••••••••</div>
          </div>
          <div class="setting-arrow">→</div>
        </div>

        <div class="setting-item" @click="showChefId">
          <div class="setting-icon">🆔</div>
          <div class="setting-info">
            <div class="setting-title">My Chef ID</div>
            <div class="setting-value chef-id">{{ chefId }}</div>
          </div>
          <button class="copy-chef-id" @click.stop="copyChefId">Copy</button>
        </div>
      </div>

      <div class="danger-zone">
        <div class="danger-item" @click="deleteAccount">
          <div class="danger-icon">⚠️</div>
          <div class="danger-info">
            <div class="danger-title">Delete Account</div>
            <div class="danger-desc">Permanently delete your account and all data</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const userFullName = ref('')
const userEmail = ref('')
const chefId = ref('')

const changeDisplayName = () => {
  router.push('/profile')
}

const changeEmail = () => {
  alert('Email change feature coming soon. Please contact support.')
}

const changePassword = () => {
  router.push('/change-password')
}

const showChefId = () => {
  alert(`Your Chef ID: ${chefId.value}`)
}

const copyChefId = () => {
  navigator.clipboard.writeText(chefId.value)
  alert('Chef ID copied to clipboard!')
}

const deleteAccount = () => {
  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    alert('Account deletion request sent. Please contact support.')
  }
}

onMounted(() => {
  userFullName.value = authStore.profile?.full_name || 'Chef'
  userEmail.value = authStore.user?.email || ''
  
  // Load chef ID from database
  const loadChefId = async () => {
    const { data } = await supabase
      .from('chef_profiles')
      .select('chef_id')
      .eq('id', authStore.user?.id)
      .single()
    if (data) {
      chefId.value = data.chef_id
    }
  }
  loadChefId()
})
</script>

<style scoped>
.account-settings {
  min-height: 100vh;
  background: #f5f5f5;
}

.settings-container {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  min-height: 100vh;
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  background: white;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:hover {
  background: #f0f0f0;
}

.settings-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.settings-list {
  padding: 8px 0;
}

.setting-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:hover {
  background: #fafafa;
}

.setting-icon {
  font-size: 22px;
  width: 40px;
}

.setting-info {
  flex: 1;
}

.setting-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.setting-value {
  font-size: 13px;
  color: #8e8e8e;
}

.chef-id {
  font-family: monospace;
  font-size: 12px;
}

.setting-arrow {
  color: #c0c0c0;
  font-size: 18px;
}

.copy-chef-id {
  background: var(--primary);
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
}

.danger-zone {
  margin-top: 30px;
  border-top: 8px solid #f0f0f0;
  padding: 8px 0;
}

.danger-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.danger-item:hover {
  background: #fff0f0;
}

.danger-icon {
  font-size: 22px;
  width: 40px;
}

.danger-info {
  flex: 1;
}

.danger-title {
  font-size: 16px;
  font-weight: 500;
  color: #e53935;
  margin-bottom: 4px;
}

.danger-desc {
  font-size: 12px;
  color: #8e8e8e;
}
</style>