<template>
  <div v-if="showInstallPrompt" class="install-prompt">
    <div class="install-card">
      <div class="install-icon">📱</div>
      <h3>Install Listara App</h3>
      <p>Get the best experience with our mobile app</p>
      <div class="install-buttons">
        <button @click="installApp" class="install-btn">Install Now</button>
        <button @click="dismissPrompt" class="later-btn">Later</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showInstallPrompt = ref(false)
let deferredPrompt = null

onMounted(() => {
  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    showInstallPrompt.value = false
    return
  }
  
  // Check if user dismissed before
  if (localStorage.getItem('installDismissed')) {
    showInstallPrompt.value = false
    return
  }
  
  // Listen for install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    // Show prompt after 3 seconds
    setTimeout(() => {
      showInstallPrompt.value = true
    }, 3000)
  })
})

const installApp = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      showInstallPrompt.value = false
      localStorage.setItem('installAccepted', 'true')
    }
    deferredPrompt = null
  } else {
    // Fallback instructions
    alert('To install:\n\nAndroid: Chrome menu → "Install App"\n\niOS: Share button → "Add to Home Screen"')
  }
}

const dismissPrompt = () => {
  showInstallPrompt.value = false
  localStorage.setItem('installDismissed', 'true')
}
</script>

<style scoped>
.install-prompt {
  position: fixed;
  bottom: 100px;
  left: 20px;
  right: 20px;
  z-index: 10000;
  animation: slideUp 0.3s ease;
}

.install-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  border: 1px solid rgba(0,0,0,0.1);
}

.install-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.install-card h3 {
  margin-bottom: 5px;
  color: var(--dark);
}

.install-card p {
  font-size: 13px;
  color: var(--gray-600);
  margin-bottom: 15px;
}

.install-buttons {
  display: flex;
  gap: 12px;
}

.install-btn {
  flex: 1;
  background: var(--primary);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
}

.later-btn {
  flex: 1;
  background: var(--gray-100);
  color: var(--dark);
  border: none;
  padding: 12px;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>