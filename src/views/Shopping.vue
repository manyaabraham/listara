<template>
  <div class="shopping-page">
    <div class="page-header">
      <h2>🛒 Shopping List</h2>
      <button @click="downloadList" class="btn btn-primary">📥 Download</button>
    </div>

    <div class="stats-bar card">
      <div class="stat">
        <span class="stat-number">{{ pendingItems.length }}</span>
        <span class="stat-label">To Buy</span>
      </div>
      <div class="stat">
        <span class="stat-number">{{ purchasedItems.length }}</span>
        <span class="stat-label">Purchased</span>
      </div>
    </div>

    <div v-if="shoppingStore.loading" class="loading">Loading...</div>
    
    <div v-else class="shopping-items">
      <div v-for="item in shoppingStore.items" :key="item.id" class="shopping-item">
        <label class="checkbox">
          <input 
            type="checkbox" 
            :checked="item.status === 'purchased'"
            @change="togglePurchase(item)"
          >
          <span :class="{ purchased: item.status === 'purchased' }">
            {{ item.item_name }}
          </span>
        </label>
        <div class="item-details">
          <span class="quantity">{{ item.quantity }} {{ item.unit }}</span>
          <span v-if="item.auto_added" class="auto-badge">Auto</span>
          <button @click="removeItem(item.id)" class="delete-btn-small">🗑️</button>
        </div>
      </div>
      
      <div v-if="shoppingStore.items.length === 0" class="empty-state">
        🎉 No items in shopping list!
      </div>
    </div>

    <div v-if="pendingItems.length > 0" class="bulk-actions">
      <button @click="markAllPurchased" class="btn btn-secondary">✓ Mark All Purchased</button>
      <button @click="clearPurchased" class="btn btn-outline">Clear Purchased</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useShoppingStore } from '../stores/shopping'

const shoppingStore = useShoppingStore()

const pendingItems = computed(() => shoppingStore.items.filter(i => i.status === 'pending'))
const purchasedItems = computed(() => shoppingStore.items.filter(i => i.status === 'purchased'))

const togglePurchase = async (item) => {
  const newStatus = item.status === 'pending' ? 'purchased' : 'pending'
  await shoppingStore.updateItemStatus(item.id, newStatus)
}

const removeItem = async (id) => {
  if (confirm('Remove this item from shopping list?')) {
    await shoppingStore.removeItem(id)
  }
}

const markAllPurchased = async () => {
  await shoppingStore.markAllPurchased()
}

const clearPurchased = async () => {
  await shoppingStore.clearPurchased()
}

const downloadList = () => {
  shoppingStore.downloadList()
}

onMounted(async () => {
  await shoppingStore.loadList()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats-bar {
  display: flex;
  gap: 20px;
  justify-content: space-around;
  margin-bottom: 20px;
  text-align: center;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: var(--primary);
  display: block;
}

.stat-label {
  font-size: 14px;
  color: var(--gray-600);
}

.shopping-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  margin-bottom: 8px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.checkbox input {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.purchased {
  text-decoration: line-through;
  color: var(--gray-500);
}

.item-details {
  display: flex;
  gap: 10px;
  align-items: center;
}

.quantity {
  font-weight: 600;
  color: var(--primary);
}

.auto-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: #E3F2FD;
  color: var(--info);
  border-radius: 10px;
}

.delete-btn-small {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  opacity: 0.5;
}

.delete-btn-small:hover {
  opacity: 1;
}

.bulk-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  position: sticky;
  bottom: 80px;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: var(--gray-500);
}

@media (max-width: 768px) {
  .bulk-actions {
    flex-direction: column;
  }
}
</style>