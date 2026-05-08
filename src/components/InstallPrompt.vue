<template>
  <div v-if="deferredPrompt" class="install-banner">
    <div class="install-content">
      <span class="install-icon">📱</span>
      <div class="install-text">
        <strong>Install Listara App</strong>
        <span>Get faster access</span>
      </div>
      <button @click="installApp" class="install-btn">Install</button>
      <button @click="dismissPrompt" class="close-btn">✕</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const deferredPrompt = ref(null)

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
  })
})

const installApp = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    deferredPrompt.value = null
  }
}

const dismissPrompt = () => {
  deferredPrompt.value = null
}
</script>

<style scoped>
.install-banner {
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background: white;
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  z-index: 10000;
  animation: slideUp 0.3s ease;
}
.install-content {
  display: flex;
  align-items: center;
  gap: 12px;
}
.install-icon { font-size: 32px; }
.install-text { flex: 1; }
.install-text strong { display: block; font-size: 14px; }
.install-text span { font-size: 11px; color: #666; }
.install-btn { background: #FF6B35; color: white; border: none; padding: 8px 16px; border-radius: 30px; cursor: pointer; }
.close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #999; }
@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>