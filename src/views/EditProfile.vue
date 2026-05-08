<template>
  <div class="edit-profile-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">←</button>
      <h1>Edit Profile</h1>
    </div>

    <div class="form-card">
      <!-- Form Fields -->
      <div class="form-group">
        <label>Display Name</label>
        <input 
          type="text" 
          v-model="formData.display_name" 
          placeholder="How you want to be called"
          class="form-input"
        >
        <p class="field-hint">This is how your name appears to others</p>
      </div>

      <div class="form-group">
        <label>Full Name</label>
        <input 
          type="text" 
          v-model="formData.full_name" 
          placeholder="Your full name"
          class="form-input"
        >
      </div>

      <div class="form-group">
        <label>Email Address</label>
        <input 
          type="email" 
          v-model="formData.email" 
          disabled
          class="form-input disabled"
        >
        <p class="field-hint">Email cannot be changed</p>
      </div>

      <div class="form-group">
        <label>Phone Number</label>
        <input 
          type="tel" 
          v-model="formData.phone" 
          placeholder="Optional"
          class="form-input"
        >
      </div>

      <div class="button-group">
        <button class="btn-save" @click="saveChanges" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
        <button class="btn-cancel" @click="$router.back()">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../services/supabase'

const router = useRouter()
const authStore = useAuthStore()

const saving = ref(false)

const formData = ref({
  display_name: '',
  full_name: '',
  email: '',
  phone: ''
})

const loadProfile = () => {
  formData.value = {
    display_name: authStore.profile?.display_name || authStore.profile?.full_name || '',
    full_name: authStore.profile?.full_name || '',
    email: authStore.user?.email || '',
    phone: authStore.profile?.phone || ''
  }
}

const saveChanges = async () => {
  saving.value = true

  const updates = {}
  
  if (formData.value.display_name !== undefined) {
    updates.display_name = formData.value.display_name
  }
  if (formData.value.full_name !== undefined) {
    updates.full_name = formData.value.full_name
  }
  if (formData.value.phone !== undefined) {
    updates.phone = formData.value.phone
  }
  
  updates.updated_at = new Date()

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', authStore.user.id)

  if (error) {
    console.error('Save error:', error)
    alert('Error saving changes: ' + error.message)
  } else {
    await authStore.loadProfile()
    alert('Profile updated successfully!')
    router.back()
  }

  saving.value = false
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.edit-profile-page {
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

.form-input.disabled {
  background: var(--gray-100);
  color: var(--gray-600);
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
</style>