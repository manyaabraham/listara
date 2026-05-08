<template>
  <div class="change-password-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">←</button>
      <h1>Change Password</h1>
    </div>

    <div class="form-card">
      <div class="form-group">
        <label>Current Password</label>
        <input 
          type="password" 
          v-model="currentPassword" 
          placeholder="Enter your current password"
          class="form-input"
        >
      </div>

      <div class="form-group">
        <label>New Password</label>
        <input 
          type="password" 
          v-model="newPassword" 
          placeholder="Enter new password"
          class="form-input"
        >
        <p class="field-hint">Must be at least 6 characters</p>
      </div>

      <div class="form-group">
        <label>Confirm New Password</label>
        <input 
          type="password" 
          v-model="confirmPassword" 
          placeholder="Confirm your new password"
          class="form-input"
        >
      </div>

      <div class="button-group">
        <button class="btn-save" @click="updatePassword" :disabled="loading">
          {{ loading ? 'Updating...' : 'Update Password' }}
        </button>
        <button class="btn-cancel" @click="$router.back()">
          Cancel
        </button>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../services/supabase'

const router = useRouter()
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')

const updatePassword = async () => {
  errorMessage.value = ''

  if (newPassword.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  loading.value = true

  const { error } = await supabase.auth.updateUser({
    password: newPassword.value
  })

  if (error) {
    errorMessage.value = error.message
  } else {
    alert('Password updated successfully!')
    router.back()
  }

  loading.value = false
}
</script>

<style scoped>
.change-password-page {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--dark);
  padding: 8px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.form-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--dark);
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--gray-300);
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
}

.field-hint {
  font-size: 11px;
  color: var(--gray-500);
  margin-top: 4px;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-save {
  flex: 1;
  background: var(--primary);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  background: var(--primary-dark);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  flex: 1;
  background: var(--gray-200);
  color: var(--dark);
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: var(--gray-300);
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background: #ffebee;
  color: #c62828;
  border-radius: 12px;
  font-size: 14px;
  text-align: center;
}
</style>