<template>
  <div class="shopping-page">
    <!-- Hero Chef Banner -->
    <div class="chef-banner">
      <div class="banner-content">
        <div class="chef-avatar">
          🛒
        </div>
        <div class="chef-greeting">
          <h1 class="chef-title">Shopping List</h1>
          <p class="chef-subtitle">
            <span class="chef-title-prefix">Chef</span> 
            organize your grocery shopping
          </p>
        </div>
        <div class="banner-stats">
          <div class="banner-stat">
            <span class="stat-number">{{ pendingItems.length }}</span>
            <span class="stat-label">To Buy</span>
          </div>
          <div class="banner-stat">
            <span class="stat-number">{{ purchasedItems.length }}</span>
            <span class="stat-label">Purchased</span>
          </div>
          <div class="banner-stat">
            <span class="stat-number">{{ autoAddedCount }}</span>
            <span class="stat-label">Auto-Added</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="action-bar">
      <button class="action-btn primary" @click="downloadList">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span>Download List</span>
      </button>
      <button class="action-btn" @click="shareList">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        <span>Share List</span>
      </button>
    </div>

    <!-- Stats Overview -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-circle-progress">
          <svg width="80" height="80" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#e9ecef" stroke-width="8"/>
            <circle cx="50" cy="50" r="45" fill="none" stroke="#FF6B35" stroke-width="8" 
              :stroke-dasharray="283" :stroke-dashoffset="283 - (283 * completionPercentage / 100)"
              transform="rotate(-90 50 50)"/>
            <text x="50" y="55" text-anchor="middle" fill="#2C3E50" font-size="20" font-weight="700">
              {{ completionPercentage }}%
            </text>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ completionPercentage }}% Complete</div>
          <div class="stat-label">{{ pendingItems.length }} items remaining</div>
        </div>
      </div>
    </div>

    <!-- Shopping Items -->
    <div class="shopping-sections">
      <!-- Pending Items Section -->
      <div class="section-card" v-if="pendingItems.length > 0">
        <div class="section-header">
          <div class="header-left">
            <span class="section-icon">📝</span>
            <h3>Items to Buy</h3>
          </div>
          <span class="section-count">{{ pendingItems.length }}</span>
        </div>
        <div class="items-list">
          <div v-for="item in pendingItems" :key="item.id" class="shopping-item pending">
            <div class="item-checkbox">
              <input 
                type="checkbox" 
                :id="'item-' + item.id"
                :checked="item.status === 'purchased'"
                @change="togglePurchase(item)"
                class="checkbox-input"
              >
              <label :for="'item-' + item.id" class="checkbox-label"></label>
            </div>
            <div class="item-content">
              <div class="item-name">{{ item.item_name }}</div>
              <div class="item-meta">
                <span class="item-quantity">{{ item.quantity }} {{ item.unit }}</span>
                <span v-if="item.auto_added" class="auto-tag">Auto-added from low stock</span>
              </div>
            </div>
            <button class="item-delete" @click="removeItem(item.id)" title="Remove">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Purchased Items Section -->
      <div class="section-card completed" v-if="purchasedItems.length > 0">
        <div class="section-header">
          <div class="header-left">
            <span class="section-icon">✅</span>
            <h3>Purchased Items</h3>
          </div>
          <span class="section-count">{{ purchasedItems.length }}</span>
        </div>
        <div class="items-list">
          <div v-for="item in purchasedItems" :key="item.id" class="shopping-item purchased">
            <div class="item-checkbox">
              <input 
                type="checkbox" 
                :id="'item-purchased-' + item.id"
                :checked="item.status === 'purchased'"
                @change="togglePurchase(item)"
                class="checkbox-input"
              >
              <label :for="'item-purchased-' + item.id" class="checkbox-label checked"></label>
            </div>
            <div class="item-content">
              <div class="item-name completed">{{ item.item_name }}</div>
              <div class="item-meta">
                <span class="item-quantity">{{ item.quantity }} {{ item.unit }}</span>
              </div>
            </div>
            <button class="item-delete" @click="removeItem(item.id)" title="Remove">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="shoppingStore.items.length === 0" class="empty-state-card">
        <div class="empty-icon">🛒</div>
        <h3>Shopping list is empty</h3>
        <p>Items will appear here when added from inventory or manually</p>
        <button class="btn-primary" @click="goToInventory">Browse Your Kitchen</button>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div class="bulk-actions" v-if="pendingItems.length > 0 || purchasedItems.length > 0">
      <button v-if="pendingItems.length > 0" class="btn-secondary" @click="markAllPurchased">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Mark All Purchased
      </button>
      <button v-if="purchasedItems.length > 0" class="btn-outline" @click="clearPurchased">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13"/>
        </svg>
        Clear Purchased Items
      </button>
    </div>

    <!-- Add Item Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Add to Shopping List</h3>
          <button class="close-btn" @click="closeAddModal">×</button>
        </div>
        <form @submit.prevent="addManualItem" class="modal-form">
          <div class="form-group">
            <label>Item Name *</label>
            <input type="text" v-model="manualItem.name" required placeholder="e.g., Milk, Bread, Eggs" class="form-input" autofocus>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Quantity *</label>
              <input type="number" step="0.1" v-model="manualItem.quantity" required class="form-input">
            </div>
            <div class="form-group">
              <label>Unit</label>
              <select v-model="manualItem.unit" class="form-input">
                <option value="pcs">Pieces (pcs)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="L">Liters (L)</option>
                <option value="ml">Milliliters (ml)</option>
              </select>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeAddModal">Cancel</button>
            <button type="submit" class="btn-submit">Add to List</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useShoppingStore } from '../stores/shopping'
import { useKitchenStore } from '../stores/kitchen'
import { useNotificationStore } from '../stores/notifications'

const router = useRouter()
const shoppingStore = useShoppingStore()
const kitchenStore = useKitchenStore()
const notificationStore = useNotificationStore()

const showAddModal = ref(false)
const manualItem = ref({
  name: '',
  quantity: 1,
  unit: 'pcs'
})

const pendingItems = computed(() => shoppingStore.items.filter(i => i.status === 'pending'))
const purchasedItems = computed(() => shoppingStore.items.filter(i => i.status === 'purchased'))
const autoAddedCount = computed(() => shoppingStore.items.filter(i => i.auto_added === true).length)

const completionPercentage = computed(() => {
  const total = shoppingStore.items.length
  if (total === 0) return 0
  const completed = purchasedItems.value.length
  return Math.round((completed / total) * 100)
})

const togglePurchase = async (item) => {
  const newStatus = item.status === 'pending' ? 'purchased' : 'pending'
  await shoppingStore.updateItemStatus(item.id, newStatus)
  
  // If marking as purchased, update the kitchen inventory
  if (newStatus === 'purchased') {
    await kitchenStore.addItem({
      name: item.item_name,
      quantity: item.quantity,
      unit: item.unit,
      category: 'Other',
      expiry_date: null,
      auto_shopping: true
    })
  }
  
  await refreshData()
}

const removeItem = async (id) => {
  if (confirm('Remove this item from shopping list?')) {
    await shoppingStore.removeItem(id)
    await refreshData()
  }
}

const markAllPurchased = async () => {
  for (const item of pendingItems.value) {
    await shoppingStore.updateItemStatus(item.id, 'purchased')
    
    // Add to kitchen inventory
    await kitchenStore.addItem({
      name: item.item_name,
      quantity: item.quantity,
      unit: item.unit,
      category: 'Other',
      expiry_date: null,
      auto_shopping: true
    })
  }
  await refreshData()
}

const clearPurchased = async () => {
  if (confirm('Remove all purchased items from the list?')) {
    for (const item of purchasedItems.value) {
      await shoppingStore.removeItem(item.id)
    }
    await refreshData()
  }
}

const downloadList = () => {
  shoppingStore.downloadList()
}

const shareList = async () => {
  const text = pendingItems.value.map(item => 
    `• ${item.item_name} - ${item.quantity} ${item.unit}`
  ).join('\n')
  
  const shareText = `🛒 My Shopping List\n\n${text}\n\nTotal: ${pendingItems.value.length} items`
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'My Shopping List',
        text: shareText
      })
    } catch (err) {
      console.log('Share cancelled')
    }
  } else {
    await navigator.clipboard.writeText(shareText)
    alert('Shopping list copied to clipboard!')
  }
}

const addManualItem = async () => {
  if (!manualItem.value.name.trim()) {
    alert('Please enter an item name')
    return
  }
  
  await shoppingStore.addItem({
    item_name: manualItem.value.name.trim(),
    quantity: manualItem.value.quantity,
    unit: manualItem.value.unit,
    auto_added: false
  })
  
  manualItem.value = { name: '', quantity: 1, unit: 'pcs' }
  showAddModal.value = false
  await refreshData()
}

const goToInventory = () => {
  router.push('/kitchen')
}

const refreshData = async () => {
  await shoppingStore.loadList()
  await kitchenStore.loadItems()
  await notificationStore.loadNotifications()
}

// Expose function for dropdown access
if (typeof window !== 'undefined') {
  window.openAddShoppingItem = () => { showAddModal.value = true }
}

onMounted(async () => {
  await refreshData()
})
</script>

<style scoped>
.shopping-page {
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
  content: "🛒";
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
  font-size: 32px;
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
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.chef-title-prefix {
  font-weight: 700;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 20px;
  display: inline-block;
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

/* Action Bar */
.action-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: var(--primary);
  color: white;
  border: none;
}

.action-btn.primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* Stats Overview */
.stats-overview {
  margin-bottom: 28px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  border: 1px solid rgba(0,0,0,0.05);
}

.stat-circle-progress {
  position: relative;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--dark);
}

.stat-label {
  font-size: 14px;
  color: var(--gray-600);
  margin-top: 4px;
}

/* Shopping Sections */
.shopping-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 28px;
}

.section-card {
  background: white;
  border-radius: 24px;
  padding: 20px;
  border: 1px solid rgba(0,0,0,0.05);
}

.section-card.completed {
  background: #f8f9fa;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--gray-100);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon {
  font-size: 22px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--dark);
}

.section-count {
  background: var(--primary);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.section-card.completed .section-count {
  background: var(--success);
}

/* Shopping Item */
.shopping-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px;
  background: white;
  border-radius: 16px;
  margin-bottom: 10px;
  transition: all 0.2s;
  border: 1px solid var(--gray-100);
}

.shopping-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.shopping-item.purchased {
  background: #f8f9fa;
  opacity: 0.8;
}

.item-checkbox {
  position: relative;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkbox-label {
  position: relative;
  display: inline-block;
  width: 24px;
  height: 24px;
  background: white;
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.checkbox-label:hover {
  border-color: var(--primary);
}

.checkbox-input:checked + .checkbox-label {
  background: var(--primary);
  border-color: var(--primary);
}

.checkbox-input:checked + .checkbox-label::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.checkbox-label.checked {
  background: var(--success);
  border-color: var(--success);
}

.item-content {
  flex: 1;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--dark);
  margin-bottom: 4px;
}

.item-name.completed {
  text-decoration: line-through;
  color: var(--gray-500);
}

.item-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.item-quantity {
  font-size: 13px;
  color: var(--primary);
  font-weight: 500;
}

.auto-tag {
  font-size: 10px;
  padding: 2px 8px;
  background: #E3F2FD;
  color: #1976D2;
  border-radius: 12px;
}

.item-delete {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: var(--gray-400);
}

.item-delete:hover {
  background: #ffebee;
  color: var(--danger);
}

/* Empty State */
.empty-state-card {
  background: white;
  border-radius: 24px;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state-card h3 {
  font-size: 22px;
  margin-bottom: 8px;
  color: var(--dark);
}

.empty-state-card p {
  color: var(--gray-500);
  margin-bottom: 24px;
}

.btn-primary {
  padding: 12px 24px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

/* Bulk Actions */
.bulk-actions {
  position: sticky;
  bottom: 80px;
  display: flex;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  z-index: 100;
}

.btn-secondary, .btn-outline {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 14px;
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

.btn-secondary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.btn-outline {
  background: white;
  border: 2px solid var(--primary);
  color: var(--primary);
}

.btn-outline:hover {
  background: var(--primary);
  color: white;
  transform: translateY(-2px);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 28px 28px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--gray-200);
  position: sticky;
  top: 0;
  background: white;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: var(--gray-500);
}

.modal-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--gray-300);
  border-radius: 14px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  background: var(--gray-100);
  border: none;
  border-radius: 14px;
  cursor: pointer;
}

.btn-submit {
  flex: 1;
  padding: 12px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 14px;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 768px) {
  .shopping-page {
    padding: 16px;
  }
  
  .chef-title {
    font-size: 22px;
  }
  
  .chef-avatar {
    width: 55px;
    height: 55px;
    font-size: 26px;
  }
  
  .banner-stats {
    gap: 16px;
  }
  
  .stat-number {
    font-size: 22px;
  }
  
  .shopping-item {
    flex-wrap: wrap;
  }
  
  .item-delete {
    margin-left: auto;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .bulk-actions {
    flex-direction: column;
    margin: 0 16px 16px 16px;
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
  
  .stat-card {
    flex-direction: column;
    text-align: center;
  }
  
  .action-btn span {
    display: none;
  }
  
  .action-btn {
    padding: 12px;
  }
}
</style>