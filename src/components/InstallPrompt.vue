<template>
  <div v-if="showPrompt" class="install-prompt">
    <div class="prompt-content">
      <div class="prompt-icon">📱</div>
      <h3>Install Listara App</h3>
      <p>Install Listara on your device for easy access to your kitchen inventory</p>
      <div class="prompt-actions">
        <button @click="installApp" class="btn btn-primary">Install</button>
        <button @click="dismissPrompt" class="btn btn-outline">Later</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showPrompt = ref(false)
let deferredPrompt = null

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    // Don't show immediately, wait a bit
    setTimeout(() => {
      if (!localStorage.getItem('installDismissed')) {
        showPrompt.value = true
      }
    }, 3000)
  })
})

const installApp = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    }
    deferredPrompt = null
    showPrompt.value = false
  }
}

const dismissPrompt = () => {
  showPrompt.value = false
  localStorage.setItem('installDismissed', 'true')
}
</script>

<style scoped>
.install-prompt {
  position: fixed;
  bottom: 80px;
  left: 20px;
  right: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 2000;
  animation: slideUp 0.3s ease;
}

.prompt-content {
  padding: 20px;
  text-align: center;
}

.prompt-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.prompt-content h3 {
  margin-bottom: 8px;
  color: var(--dark);
}

.prompt-content p {
  color: var(--gray-600);
  font-size: 14px;
  margin-bottom: 20px;
}

.prompt-actions {
  display: flex;
  gap: 12px;
}

.prompt-actions .btn {
  flex: 1;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (min-width: 768px) {
  .install-prompt {
    bottom: 20px;
    left: auto;
    right: 20px;
    max-width: 350px;
  }
}
</style>