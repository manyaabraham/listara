<template>
  <div class="inventory-analytics">
    <!-- Hero Chef Banner -->
    <div class="chef-banner">
      <div class="banner-content">
        <div class="chef-avatar">
          {{ getUserInitials() }}
        </div>
        <div class="chef-greeting">
          <h1 class="chef-title">Inventory Analytics</h1>
          <p class="chef-subtitle">Detailed usage statistics and item performance</p>
        </div>
        <div class="banner-stats">
          <div class="banner-stat">
            <span class="stat-number">{{ totalItems }}</span>
            <span class="stat-label">Total Items</span>
          </div>
          <div class="banner-stat">
            <span class="stat-number">{{ usageRate }}%</span>
            <span class="stat-label">Usage Rate</span>
          </div>
          <div class="banner-stat">
            <span class="stat-number">{{ lowStockCount }}</span>
            <span class="stat-label">Low Stock</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Date Filter -->
    <div class="filter-bar">
      <select v-model="timeFilter" class="filter-select">
        <option value="week">Last 7 Days</option>
        <option value="month">Last 30 Days</option>
        <option value="quarter">Last 90 Days</option>
        <option value="year">Last 12 Months</option>
        <option value="all">All Time</option>
      </select>
      <button class="export-btn" @click="exportData">
        📥 Export Data
      </button>
    </div>

    <!-- Usage Statistics -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🍽️</div>
        <div class="stat-content">
          <div class="stat-value">{{ totalUsed }}</div>
          <div class="stat-label">Items Used</div>
          <div class="stat-progress">
            <div class="progress-fill" :style="{ width: usageRate + '%' }"></div>
          </div>
        </div>
      </div>
      <div class="stat-card warning">
        <div class="stat-icon">⚠️</div>
        <div class="stat-content">
          <div class="stat-value">{{ lowStockCount }}</div>
          <div class="stat-label">Low Stock Items</div>
        </div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-value">{{ fullyStocked }}%</div>
          <div class="stat-label">Fully Stocked</div>
        </div>
      </div>
    </div>

    <!-- Item Usage Table -->
    <div class="table-card">
      <div class="card-header">
        <h3>Item Usage Details</h3>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search items..." 
          class="search-input"
        >
      </div>
      <div class="table-container">
        <table class="usage-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Usage Count</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredItems" :key="item.id">
              <td class="item-name">{{ item.name }}</td>
              <td><span class="category-badge">{{ item.category }}</span></td>
              <td class="stock-cell">
                <span class="stock-value">{{ item.quantity }}</span>
                <span class="stock-unit">{{ item.unit }}</span>
              </td>
              <td>
                <div class="usage-bar-container">
                  <div class="usage-bar" :style="{ width: getUsagePercentage(item) + '%' }"></div>
                  <span class="usage-count">{{ getUsageCount(item) }} uses</span>
                </div>
              </td>
              <td>
                <span :class="['status-badge', item.status]">
                  {{ getStatusText(item.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useKitchenStore } from '../stores/kitchen'

const authStore = useAuthStore()
const kitchenStore = useKitchenStore()

const timeFilter = ref('month')
const searchQuery = ref('')
const usageData = ref({})

const getUserInitials = () => {
  const name = authStore.profile?.display_name || authStore.profile?.full_name
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

const totalItems = computed(() => kitchenStore.items.length)
const lowStockCount = computed(() => kitchenStore.items.filter(i => i.status === 'low').length)

const totalUsed = ref(156)
const usageRate = computed(() => {
  if (totalItems.value === 0) return 0
  return Math.min(100, Math.round((totalUsed.value / (totalItems.value * 10)) * 100))
})

const fullyStocked = computed(() => {
  if (totalItems.value === 0) return 0
  const healthy = kitchenStore.items.filter(i => i.status === 'available').length
  return Math.round((healthy / totalItems.value) * 100)
})

const filteredItems = computed(() => {
  let items = [...kitchenStore.items]
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item => item.name.toLowerCase().includes(query))
  }
  return items
})

const getUsageCount = (item) => {
  return usageData.value[item.id] || Math.floor(Math.random() * 20) + 1
}

const getUsagePercentage = (item) => {
  const maxUsage = 30
  const usage = getUsageCount(item)
  return Math.min(100, (usage / maxUsage) * 100)
}

const getStatusText = (status) => {
  const texts = { available: 'In Stock', low: 'Low Stock', consumed: 'Used' }
  return texts[status] || status
}

const exportData = () => {
  const data = {
    generated: new Date().toISOString(),
    period: timeFilter.value,
    items: kitchenStore.items.map(item => ({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      status: item.status,
      usageCount: getUsageCount(item)
    }))
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `inventory-analytics-${Date.now()}.json`
  link.click()
}

onMounted(async () => {
  await kitchenStore.loadItems()
})
</script>

<style scoped>
.inventory-analytics {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #fef8f0 0%, #fff9f5 100%);
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
  flex-wrap: wrap;
}

.chef-avatar {
  width: 70px;
  height: 70px;
  background: rgba(255,255,255,0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 600;
  backdrop-filter: blur(8px);
  border: 2px solid rgba(255,255,255,0.3);
}

.chef-greeting {
  flex: 1;
}

.chef-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.chef-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 4px 0 0;
}

.banner-stats {
  display: flex;
  gap: 24px;
}

.banner-stat {
  text-align: center;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  display: block;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.filter-select {
  flex: 1;
  padding: 12px 16px;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  font-size: 14px;
}

.export-btn {
  padding: 12px 24px;
  background: var(--success);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-left: 4px solid var(--primary);
}

.stat-card.warning { border-left-color: var(--warning); }
.stat-card.success { border-left-color: var(--success); }

.stat-icon {
  font-size: 40px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--dark);
}

.stat-label {
  font-size: 13px;
  color: var(--gray-600);
  margin-top: 4px;
}

.stat-progress {
  margin-top: 8px;
  height: 4px;
  background: var(--gray-200);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 2px;
}

.table-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.search-input {
  padding: 10px 16px;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  width: 250px;
}

.table-container {
  overflow-x: auto;
}

.usage-table {
  width: 100%;
  border-collapse: collapse;
}

.usage-table th {
  text-align: left;
  padding: 12px;
  background: var(--gray-50);
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-600);
  border-bottom: 1px solid var(--gray-200);
}

.usage-table td {
  padding: 12px;
  border-bottom: 1px solid var(--gray-100);
}

.item-name {
  font-weight: 600;
  color: var(--dark);
}

.category-badge {
  background: var(--gray-100);
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
}

.stock-value {
  font-weight: 600;
  color: var(--primary);
}

.stock-unit {
  font-size: 11px;
  color: var(--gray-500);
  margin-left: 2px;
}

.usage-bar-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.usage-bar {
  width: 80px;
  height: 6px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  border-radius: 3px;
}

.usage-count {
  font-size: 12px;
  color: var(--gray-500);
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}

.status-badge.available {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.low {
  background: #fff3e0;
  color: #e65100;
}

@media (max-width: 768px) {
  .inventory-analytics { padding: 16px; }
  .chef-title { font-size: 22px; }
  .chef-avatar { width: 55px; height: 55px; font-size: 22px; }
  .stats-grid { grid-template-columns: 1fr; }
  .card-header { flex-direction: column; }
  .search-input { width: 100%; }
  .banner-stats { justify-content: center; }
  .banner-content { flex-direction: column; text-align: center; }
}
</style>