<template>
  <div class="kitchen-page">
    <div class="page-header">
      <h2>🥬 My Kitchen</h2>
      <button @click="showAddModal = true" class="btn btn-primary">+ Add Item</button>
    </div>

    <div class="category-filters">
      <button 
        v-for="cat in categories" 
        :key="cat"
        :class="{ active: selectedCategory === cat }"
        @click="selectedCategory = cat"
        class="filter-btn"
      >
        {{ cat }}
      </button>
    </div>

    <div v-if="kitchenStore.loading" class="loading">Loading...</div>
    
    <div v-else class="items-grid grid grid-3">
      <div v-for="item in filteredItems" :key="item.id" class="item-card">
        <div class="item-header">
          <span class="item-emoji">{{ getCategoryEmoji(item.category) }}</span>
          <button @click="deleteItem(item.id)" class="delete-btn">🗑️</button>
        </div>
        <h4>{{ item.name }}</h4>
        <div class="item-details">
          <span class="quantity">{{ item.quantity }} {{ item.unit }}</span>
          <span :class="['status', item.status]">
            {{ item.status === 'low' ? '⚠️ Low' : '✅ Available' }}
          </span>
        </div>
        <div v-if="item.expiry_date" class="expiry">
          Expires: {{ formatDate(item.expiry_date) }}
        </div>
        <div class="item-actions">
          <button @click="useItem(item)" class="btn-small">Used</button>
        </div>
      </div>
    </div>

    <!-- Add Item Modal -->
    <div v-if="showAddModal" class="modal" @click.self="showAddModal = false">
      <div class="modal-content">
        <h3>Add Kitchen Item</h3>
        <form @submit.prevent="addItem">
          <input v-model="newItem.name" placeholder="Item name" class="input-field" required>
          <input v-model.number="newItem.quantity" type="number" step="0.1" placeholder="Quantity" class="input-field" required>
          <select v-model="newItem.unit" class="input-field">
            <option>kg</option>
            <option>pcs</option>
            <option>L</option>
            <option>g</option>
          </select>
          <select v-model="newItem.category" class="input-field">
            <option>Vegetables</option>
            <option>Fruits</option>
            <option>Meat</option>
            <option>Dairy</option>
            <option>Grains</option>
            <option>Other</option>
          </select>
          <input v-model="newItem.expiry_date" type="date" class="input-field">
          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">Add</button>
            <button type="button" @click="showAddModal = false" class="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useKitchenStore } from '../stores/kitchen'

const kitchenStore = useKitchenStore()

const showAddModal = ref(false)
const selectedCategory = ref('All')
const categories = ['All', 'Vegetables', 'Fruits', 'Meat', 'Dairy', 'Grains', 'Other']

const newItem = ref({
  name: '',
  quantity: 1,
  unit: 'pcs',
  category: 'Other',
  expiry_date: ''
})

const filteredItems = computed(() => {
  if (selectedCategory.value === 'All') {
    return kitchenStore.items
  }
  return kitchenStore.items.filter(i => i.category === selectedCategory.value)
})

const getCategoryEmoji = (category) => {
  const emojis = {
    Vegetables: '🥬',
    Fruits: '🍎',
    Meat: '🍖',
    Dairy: '🥛',
    Grains: '🌾',
    Other: '🍽️'
  }
  return emojis[category] || '🍽️'
}

const formatDate = (date) => {
  const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
  if (days < 0) return 'Expired'
  if (days === 0) return 'Today'
  return `${days} days left`
}

const addItem = async () => {
  await kitchenStore.addItem({ ...newItem.value })
  newItem.value = { name: '', quantity: 1, unit: 'pcs', category: 'Other', expiry_date: '' }
  showAddModal.value = false
}

const useItem = async (item) => {
  const used = parseFloat(prompt(`How much ${item.name} did you use? (Current: ${item.quantity} ${item.unit})`))
  if (used && !isNaN(used) && used > 0) {
    await kitchenStore.consumeItem(item.id, used)
  }
}

const deleteItem = async (id) => {
  if (confirm('Remove this item from kitchen?')) {
    await kitchenStore.removeItem(id)
  }
}

onMounted(async () => {
  await kitchenStore.loadItems()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.category-filters {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  margin-bottom: 20px;
  padding-bottom: 8px;
}

.filter-btn {
  padding: 8px 16px;
  background: white;
  border: 2px solid var(--gray-200);
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
}

.filter-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.item-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-emoji {
  font-size: 32px;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  opacity: 0.5;
}

.delete-btn:hover {
  opacity: 1;
}

.item-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0;
}

.quantity {
  font-size: 20px;
  font-weight: bold;
  color: var(--primary);
}

.status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.status.low {
  background: #FFF3E0;
  color: var(--warning);
}

.status.available {
  background: #E8F5E9;
  color: var(--success);
}

.expiry {
  font-size: 12px;
  color: var(--gray-600);
  margin: 8px 0;
}

.item-actions {
  margin-top: 12px;
}

.btn-small {
  width: 100%;
  padding: 8px;
  background: var(--gray-100);
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}
</style>