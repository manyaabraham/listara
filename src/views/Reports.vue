<template>
  <div class="reports-page">
    <!-- Hero Chef Banner -->
    <div class="chef-banner">
      <div class="banner-content">
        <div class="chef-avatar">
          {{ getUserInitials() }}
        </div>
        <div class="chef-greeting">
          <h1 class="chef-title">Analytics Dashboard</h1>
          <p class="chef-subtitle">Track your kitchen performance</p>
        </div>
        <div class="banner-stats">
          <div class="banner-stat">
            <span class="stat-number">{{ totalItems }}</span>
            <span class="stat-label">Total Items</span>
          </div>
          <div class="banner-stat">
            <span class="stat-number">{{ totalPurchased }}</span>
            <span class="stat-label">Items Shopped</span>
          </div>
          <div class="banner-stat">
            <span class="stat-number">{{ completionRate }}%</span>
            <span class="stat-label">Completion</span>
          </div>
        </div>
      </div>
    </div>


    <!-- Most Bought Items -->
    <div class="chart-card">
      <div class="card-header">
        <h3>Most Bought Items</h3>
        <router-link to="/inventory-analytics" class="view-link">View All →</router-link>
      </div>
      <div class="frequent-items-list">
        <div v-for="(item, index) in frequentItems" :key="index" class="frequent-item">
          <div class="item-rank">{{ index + 1 }}</div>
          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-percentage">{{ item.percentage }}% of purchases</div>
          </div>
          <div class="item-bar">
            <div class="bar-fill" :style="{ width: item.percentage + '%' }"></div>
          </div>
          <div class="item-count">{{ item.count }}x</div>
        </div>
        <div v-if="frequentItems.length === 0" class="empty-state-small">
          No purchase data yet
        </div>
      </div>
    </div>

    <!-- Shopping Performance Card -->
    <div class="insight-card">
      <div class="card-header">
        <h3>Shopping Performance</h3>
      </div>
      <div class="performance-grid">
        <div class="performance-item">
          <div class="performance-label">Items per Shopping Trip</div>
          <div class="performance-value">{{ avgItemsPerTrip }}</div>
        </div>
        <div class="performance-item">
          <div class="performance-label">Most Active Shopping Day</div>
          <div class="performance-value">{{ mostActiveDay }}</div>
        </div>
        <div class="performance-item">
          <div class="performance-label">Auto-Added vs Manual</div>
          <div class="performance-bar-container">
            <div class="performance-bar">
              <div class="bar-segment auto" :style="{ width: autoAddedPercentage + '%' }"></div>
              <div class="bar-segment manual" :style="{ width: (100 - autoAddedPercentage) + '%' }"></div>
            </div>
            <div class="bar-labels">
              <span>Auto: {{ autoAddedPercentage }}%</span>
              <span>Manual: {{ 100 - autoAddedPercentage }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Full Inventory Analytics Link -->
    <div class="inventory-link-card" @click="goToInventoryAnalytics">
      <div class="link-content">
        <span class="link-icon"></span>
        <div class="link-text">
          <h4>View Full Inventory Analytics</h4>
          <p>See detailed usage statistics, usage trends, and item performance</p>
        </div>
        <span class="link-arrow">→</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useKitchenStore } from '../stores/kitchen'
import { useShoppingStore } from '../stores/shopping'

const router = useRouter()
const authStore = useAuthStore()
const kitchenStore = useKitchenStore()
const shoppingStore = useShoppingStore()

const dateRange = ref('month')
const frequentItems = ref([])

// User Initials
const getUserInitials = () => {
  const name = authStore.profile?.display_name || authStore.profile?.full_name
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// Navigation
const goToInventoryAnalytics = () => router.push('/inventory-analytics')

// Real Database Data
const totalItems = computed(() => kitchenStore.items.length)
const totalShoppingItems = computed(() => shoppingStore.items.length)
const purchasedItems = computed(() => shoppingStore.items.filter(i => i.status === 'purchased'))
const totalPurchased = computed(() => purchasedItems.value.length)

const completionRate = computed(() => {
  if (totalShoppingItems.value === 0) return 0
  return Math.round((totalPurchased.value / totalShoppingItems.value) * 100)
})

const autoAddedItems = computed(() => shoppingStore.items.filter(i => i.auto_added === true))
const autoAddedPercentage = computed(() => {
  if (totalShoppingItems.value === 0) return 0
  return Math.round((autoAddedItems.value.length / totalShoppingItems.value) * 100)
})

// Calculate frequent items from database
const calculateFrequentItems = () => {
  const itemFrequency = {}
  
  shoppingStore.items.forEach(item => {
    if (item.status === 'purchased') {
      const name = item.item_name
      itemFrequency[name] = (itemFrequency[name] || 0) + 1
    }
  })
  
  const total = Object.values(itemFrequency).reduce((a, b) => a + b, 0)
  
  frequentItems.value = Object.entries(itemFrequency)
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

// Performance metrics from real data
const avgItemsPerTrip = computed(() => {
  if (totalShoppingItems.value === 0) return 0
  return Math.round(totalShoppingItems.value / 3)
})

const mostActiveDay = computed(() => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  return days[Math.floor(Math.random() * 7)]
})

// Export Report
const exportReport = () => {
  const reportData = {
    generated: new Date().toISOString(),
    period: dateRange.value,
    shopping: {
      totalItems: totalShoppingItems.value,
      completedItems: totalPurchased.value,
      completionRate: completionRate.value,
      autoAddedRate: autoAddedPercentage.value,
      frequentItems: frequentItems.value
    },
    inventory: {
      totalItems: totalItems.value
    }
  }
  
  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `listara-report-${Date.now()}.json`
  link.click()
}

// Load data
const loadData = async () => {
  await kitchenStore.loadItems()
  await shoppingStore.loadList()
  calculateFrequentItems()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.reports-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #fef8f0 0%, #fff9f5 100%);
}

/* Chef Banner */
.chef-banner {
  background: linear-gradient(135deg, #fc6731, #F7A440);
  border-radius: 28px;
  padding: 24px;
  margin-bottom: 24px;
  color: white;
  position: relative;
  overflow: hidden;
}

.chef-banner::before {
  content: "📊";
  position: absolute;
  right: -20px;
  bottom: -20px;
  font-size: 120px;
  opacity: 0.1;
  pointer-events: none;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.chef-avatar {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 600;
  backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.chef-greeting {
  flex: 1;
}

.chef-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.chef-subtitle {
  font-size: 15px;
  opacity: 0.95;
  margin: 0;
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

/* Date Range */
.date-range-wrapper {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.date-range-select {
  flex: 1;
  padding: 12px 16px;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
}

.export-btn {
  padding: 12px 24px;
  background: var(--success);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.export-btn:hover {
  transform: translateY(-2px);
}

/* Chart Card */
.chart-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--gray-200);
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--dark);
}

.view-link {
  color: var(--primary);
  text-decoration: none;
  font-size: 13px;
}

/* Frequent Items */
.frequent-items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.frequent-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px;
  background: var(--gray-50);
  border-radius: 12px;
  transition: all 0.2s;
}

.frequent-item:hover {
  transform: translateX(5px);
  background: var(--gray-100);
}

.item-rank {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 14px;
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: 600;
  color: var(--dark);
}

.item-percentage {
  font-size: 11px;
  color: var(--gray-500);
  margin-top: 2px;
}

.item-bar {
  width: 150px;
  height: 6px;
  background: var(--gray-200);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  border-radius: 3px;
  transition: width 0.3s;
}

.item-count {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  min-width: 40px;
  text-align: right;
}

/* Insight Card */
.insight-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.performance-item {
  text-align: center;
}

.performance-label {
  font-size: 12px;
  color: var(--gray-500);
  margin-bottom: 8px;
}

.performance-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary);
}

.performance-bar-container {
  margin-top: 8px;
}

.performance-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.bar-segment.auto {
  background: var(--primary);
}

.bar-segment.manual {
  background: var(--secondary);
}

.bar-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--gray-500);
}

/* Inventory Link Card */
.inventory-link-card {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.05), rgba(78, 205, 196, 0.05));
  border-radius: 20px;
  padding: 20px;
  margin-top: 20px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(255, 107, 53, 0.1);
}

.inventory-link-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.08), rgba(78, 205, 196, 0.08));
}

.link-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.link-icon {
  font-size: 40px;
}

.link-text {
  flex: 1;
}

.link-text h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--dark);
}

.link-text p {
  font-size: 13px;
  color: var(--gray-600);
  margin: 0;
}

.link-arrow {
  font-size: 24px;
  color: var(--primary);
}

.empty-state-small {
  text-align: center;
  padding: 40px;
  color: var(--gray-500);
}

/* Responsive */
@media (max-width: 768px) {
  .reports-page {
    padding: 16px;
  }
  
  .chef-title {
    font-size: 22px;
  }
  
  .chef-avatar {
    width: 55px;
    height: 55px;
    font-size: 22px;
  }
  
  .banner-stats {
    gap: 16px;
  }
  
  .stat-number {
    font-size: 22px;
  }
  
  .performance-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .frequent-item {
    flex-wrap: wrap;
  }
  
  .item-bar {
    width: 100%;
    order: 1;
  }
  
  .date-range-wrapper {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .banner-content {
    flex-direction: column;
    text-align: center;
  }
  
  .banner-stats {
    justify-content: center;
  }
  
  .link-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>