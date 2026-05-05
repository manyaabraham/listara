<template>
  <div class="dashboard">
    <div class="welcome-card card">
      <h2>Welcome back, {{ authStore.profile?.full_name?.split(' ')[0] || 'User' }}! 👨‍🍳</h2>
      <p>Your kitchen has {{ kitchenStore.items.length }} items</p>
    </div>

    <div class="stats-grid grid grid-3">
      <div class="stat-card">
        <div class="stat-emoji">🥬</div>
        <div class="stat-number">{{ kitchenStore.items.length }}</div>
        <div class="stat-label">Total Items</div>
      </div>
      <div class="stat-card">
        <div class="stat-emoji">⚠️</div>
        <div class="stat-number">{{ lowStockCount }}</div>
        <div class="stat-label">Low Stock</div>
      </div>
      <div class="stat-card">
        <div class="stat-emoji">🛒</div>
        <div class="stat-number">{{ pendingShopping.length }}</div>
        <div class="stat-label">To Buy</div>
      </div>
    </div>

    <div class="content-grid grid grid-2">
      <div class="card">
        <div class="card-header">
          <h3>📋 Low Stock Items</h3>
          <router-link to="/kitchen" class="link">View All →</router-link>
        </div>
        <div v-if="lowStockItems.length > 0" class="item-list">
          <div v-for="item in lowStockItems.slice(0, 5)" :key="item.id" class="item-row">
            <span>{{ item.name }}</span>
            <span class="badge">{{ item.quantity }} {{ item.unit }} left</span>
          </div>
        </div>
        <p v-else class="empty-state">🎉 No low stock items!</p>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>🛒 Shopping List</h3>
          <router-link to="/shopping" class="link">View All →</router-link>
        </div>
        <div v-if="pendingShopping.length > 0" class="item-list">
          <div v-for="item in pendingShopping.slice(0, 5)" :key="item.id" class="item-row">
            <span>{{ item.item_name }}</span>
            <span class="badge">{{ item.quantity }} {{ item.unit }}</span>
          </div>
        </div>
        <p v-else class="empty-state">✅ All caught up!</p>
      </div>
    </div>

    <div class="quick-actions card">
      <h3 class="mb-2">Quick Actions</h3>
      <div class="action-buttons">
        <button @click="quickAddItem" class="btn btn-outline">➕ Add Item</button>
        <button @click="goTo('/shopping')" class="btn btn-outline">🛒 View Shopping</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useKitchenStore } from '../stores/kitchen'
import { useShoppingStore } from '../stores/shopping'

const router = useRouter()
const authStore = useAuthStore()
const kitchenStore = useKitchenStore()
const shoppingStore = useShoppingStore()

const lowStockItems = computed(() => kitchenStore.items.filter(i => i.status === 'low'))
const lowStockCount = computed(() => lowStockItems.value.length)
const pendingShopping = computed(() => shoppingStore.items.filter(i => i.status === 'pending'))

const goTo = (path) => {
  router.push(path)
}

const quickAddItem = async () => {
  const name = prompt('Item name:')
  if (name) {
    const quantity = parseFloat(prompt('Quantity:'))
    const unit = prompt('Unit (kg, pcs, L):') || 'pcs'
    const category = prompt('Category (Vegetables, Fruits, Meat, Dairy, Grains, Other):') || 'Other'
    
    await kitchenStore.addItem({ 
      name, 
      quantity, 
      unit, 
      category,
      expiry_date: null
    })
  }
}

onMounted(async () => {
  await kitchenStore.loadItems()
  await shoppingStore.loadList()
})
</script>

<style scoped>
.dashboard {
  animation: fadeIn 0.5s;
}

.welcome-card {
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.stat-emoji {
  font-size: 40px;
  margin-bottom: 8px;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: var(--primary);
}

.stat-label {
  color: var(--gray-600);
  font-size: 14px;
  margin-top: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.link {
  color: var(--primary);
  text-decoration: none;
  font-size: 14px;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--gray-200);
}

.badge {
  background: var(--gray-200);
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--gray-500);
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>