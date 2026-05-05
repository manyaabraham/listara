<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="logo">
        <div class="logo-icon">🍽️</div>
        <h1 class="logo-text">Listara</h1>
        <p class="tagline">Smart Kitchen Manager</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="input-group">
          <label>Email</label>
          <input 
            type="email" 
            v-model="email" 
            class="input-field"
            placeholder="your@email.com"
            required
          />
        </div>

        <div class="input-group">
          <label>Password</label>
          <input 
            type="password" 
            v-model="password" 
            class="input-field"
            placeholder="••••••"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>

        <p class="error-message" v-if="error">{{ error }}</p>
      </form>

      <div class="auth-footer">
        <p>Don't have an account? <router-link to="/register">Sign Up</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  const result = await authStore.login(email.value, password.value)
  
  if (result.error) {
    error.value = result.error.message
  } else {
    router.push('/dashboard')
  }
  
  loading.value = false
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 24px;
  padding: 40px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.logo {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  font-size: 64px;
  margin-bottom: 12px;
}

.logo-text {
  font-size: 32px;
  color: var(--primary);
  margin-bottom: 8px;
}

.tagline {
  color: var(--gray-600);
  font-size: 14px;
}

.auth-form {
  margin-bottom: 24px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--gray-700);
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--gray-200);
}

.auth-footer a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}

.error-message {
  color: var(--danger);
  font-size: 14px;
  text-align: center;
  margin-top: 16px;
}

.btn-primary {
  width: 100%;
}
</style>