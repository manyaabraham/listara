<template>
  <div class="settings-page">
    <div class="chef-banner">
      <div class="banner-content">
        <div class="chef-avatar">⚙️</div>
        <div class="chef-greeting">
          <h1 class="chef-title">Settings</h1>
          <p class="chef-subtitle">Customize your app experience</p>
        </div>
      </div>
    </div>

    <div class="settings-grid">
      <div class="settings-card">
        <div class="card-header">
          <span class="card-icon">🔔</span>
          <h3>Notifications</h3>
        </div>
        <div class="setting-item">
          <label class="switch-label">
            <span>Push Notifications</span>
            <label class="switch">
              <input type="checkbox" v-model="settings.notifications">
              <span class="slider"></span>
            </label>
          </label>
        </div>
        <div class="setting-item">
          <label class="switch-label">
            <span>Email Alerts</span>
            <label class="switch">
              <input type="checkbox" v-model="settings.emailAlerts">
              <span class="slider"></span>
            </label>
          </label>
        </div>
      </div>

      <div class="settings-card">
        <div class="card-header">
          <span class="card-icon">🎨</span>
          <h3>Appearance</h3>
        </div>
        <div class="setting-item">
          <label class="switch-label">
            <span>Dark Mode</span>
            <label class="switch">
              <input type="checkbox" v-model="settings.darkMode">
              <span class="slider"></span>
            </label>
          </label>
        </div>
        <div class="setting-item">
          <label class="switch-label">
            <span>Compact View</span>
            <label class="switch">
              <input type="checkbox" v-model="settings.compactView">
              <span class="slider"></span>
            </label>
          </label>
        </div>
      </div>

      <div class="settings-card">
        <div class="card-header">
          <span class="card-icon">🌐</span>
          <h3>Preferences</h3>
        </div>
        <div class="setting-item">
          <label>Default Unit</label>
          <select v-model="settings.defaultUnit" class="select-input">
            <option value="metric">Metric (kg, g, L)</option>
            <option value="imperial">Imperial (lb, oz, gal)</option>
          </select>
        </div>
        <div class="setting-item">
          <label>Language</label>
          <select v-model="settings.language" class="select-input">
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>
      </div>

      <div class="settings-card">
        <div class="card-header">
          <span class="card-icon">💾</span>
          <h3>Data Management</h3>
        </div>
        <div class="setting-item">
          <button class="btn-secondary" @click="exportData">Export Data</button>
        </div>
        <div class="setting-item">
          <button class="btn-danger" @click="clearData">Clear All Data</button>
        </div>
      </div>
    </div>

    <div class="version-info">
      <p>Listara Version 1.0.0</p>
      <p class="copyright">© 2024 Listara. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const settings = ref({
  notifications: true,
  emailAlerts: false,
  darkMode: false,
  compactView: false,
  defaultUnit: 'metric',
  language: 'en'
})

const exportData = () => {
  alert('Data export feature coming soon!')
}

const clearData = () => {
  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
    alert('Data cleared!')
  }
}
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.chef-banner {
  background: linear-gradient(135deg, #fc6731, #F7A440);
  border-radius: 28px;
  padding: 24px;
  margin-bottom: 24px;
  color: white;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.chef-avatar {
  width: 70px;
  height: 70px;
  background: rgba(255,255,255,0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.chef-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.chef-subtitle {
  font-size: 15px;
  opacity: 0.9;
  margin: 0;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.settings-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  border: 1px solid rgba(0,0,0,0.05);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--gray-200);
}

.card-icon {
  font-size: 24px;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--dark);
}

.switch-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.select-input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--gray-300);
  border-radius: 10px;
  font-size: 14px;
  background: white;
}

.btn-secondary, .btn-danger {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: var(--primary);
  color: white;
  border: none;
}

.btn-danger {
  background: #ffebee;
  color: var(--danger);
  border: 1px solid var(--danger);
}

.btn-secondary:hover, .btn-danger:hover {
  transform: translateY(-2px);
}

.version-info {
  text-align: center;
  padding: 20px;
  color: var(--gray-500);
  font-size: 12px;
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .chef-title {
    font-size: 22px;
  }
  
  .chef-avatar {
    width: 55px;
    height: 55px;
    font-size: 26px;
  }
}
</style>