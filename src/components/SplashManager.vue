<template>
  <div v-if="showSplash" class="splash-overlay">
    <div class="splash-content">
      <div class="logo-icon">🛒</div>
      <h1 class="logo-text">LISTARA</h1>
      <p class="tagline">Smart Kitchen Management</p>
      <div class="loading-bar">
        <div class="loading-progress"></div>
      </div>
      <div class="percentage">{{ percentage }}%</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showSplash = ref(true)
const percentage = ref(0)

onMounted(() => {
  const interval = setInterval(() => {
    if (percentage.value < 100) {
      percentage.value += 10
    } else {
      clearInterval(interval)
      setTimeout(() => {
        showSplash.value = false
      }, 500)
    }
  }, 1000)
})
</script>

<style scoped>
.splash-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #FF6B35, #E8551E);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeOut 0.5s ease forwards;
  animation-delay: 10s;
}

.splash-content {
  text-align: center;
  padding: 40px;
  animation: fadeIn 0.5s ease;
}

.logo-icon {
  font-size: 80px;
  animation: bounce 1s ease infinite;
}

.logo-text {
  font-size: 48px;
  font-weight: 800;
  color: white;
  margin: 20px 0 10px;
}

.tagline {
  color: rgba(255,255,255,0.9);
  margin-bottom: 30px;
}

.loading-bar {
  width: 200px;
  height: 4px;
  background: rgba(255,255,255,0.3);
  border-radius: 4px;
  margin: 20px auto;
  overflow: hidden;
}

.loading-progress {
  width: 0%;
  height: 100%;
  background: white;
  border-radius: 4px;
  animation: load 10s linear forwards;
}

.percentage {
  color: white;
  font-size: 24px;
  font-weight: 700;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes fadeOut {
  to { opacity: 0; visibility: hidden; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes load {
  to { width: 100%; }
}
</style>