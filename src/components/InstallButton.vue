<template>
  <div v-if="showButton" class="install-button" @click="promptInstall">
    <span>📱</span>
    <span>Install App</span>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showButton = ref(false)
let deferredPrompt = null

onMounted(() => {
  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    showButton.value = false
    return
  }

  // Listen for install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    showButton.value = true
  })
})

const promptInstall = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      showButton.value = false
    }
    deferredPrompt = null
  } else {
    // Show instructions
    alert('To install:\n\nAndroid: Tap menu → "Install App"\n\niOS: Tap Share → "Add to Home Screen"')
  }
}
</script>

<style scoped>
.install-button {
  position: fixed;
  bottom: 80px;
  left: 20px;
  right: 20px;
  background: #FF6B35;
  color: white;
  padding: 15px;
  border-radius: 50px;
  text-align: center;
  font-weight: bold;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  animation: slideUp 0.3s ease;
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
</style>
