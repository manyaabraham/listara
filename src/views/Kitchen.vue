<template>
  <div class="kitchen-inventory">
    <!-- Hero Chef Banner -->
    <div class="chef-banner">
      <div class="banner-content">
        <div class="chef-avatar">
          {{ getUserInitials() }}
        </div>
        <div class="chef-greeting">
          <h1 class="chef-title">Your Kitchen Overview</h1>
          <p class="chef-subtitle">
            <span class="chef-title-prefix">Chef</span> 
            {{ getUserFirstName() }}, let's organize your kitchen
          </p>
        </div>
        <div class="banner-stats">
          <div class="banner-stat">
            <span class="stat-number">{{ kitchenStore.items.length }}</span>
            <span class="stat-label">Ingredients</span>
          </div>
          <div class="banner-stat">
            <span class="stat-number">{{ lowStockCount }}</span>
            <span class="stat-label">Low Stock</span>
          </div>
          <div class="banner-stat">
            <span class="stat-number">{{ expiringCount }}</span>
            <span class="stat-label">Expiring</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="action-bar">
      <button class="action-btn primary" @click="openAddModal">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        <span>Add Ingredient</span>
      </button>
    </div>

    <!-- Search & Filter Section -->
    <div class="search-filter-section">
      <div class="search-container">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search your kitchen..." 
          class="search-input"
        >
        <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">×</button>
      </div>
      
      <div class="filter-scroll">
        <button 
          v-for="filter in filters" 
          :key="filter.value"
          :class="['filter-chip', { active: currentFilter === filter.value }]"
          @click="currentFilter = filter.value"
        >
          <span class="filter-icon">{{ filter.icon }}</span>
          {{ filter.label }}
          <span class="filter-badge">{{ getFilterCount(filter.value) }}</span>
        </button>
      </div>
    </div>

    <!-- Inventory Grid -->
    <div class="inventory-grid">
      <div 
        v-for="item in filteredItems" 
        :key="item.id"
        class="inventory-card"
        :class="{ 'low-stock': item.status === 'low', 'expiring': isExpiringSoon(item.expiry_date) }"
        @click="viewItemDetails(item)"
        @contextmenu.prevent="showContextMenu($event, item)"
        @touchstart="startLongPress(item)"
        @touchend="cancelLongPress"
        @touchmove="cancelLongPress"
      >
        <div class="card-glow"></div>
        <div class="card-header">
          <div class="item-icon-large">{{ getCategoryIcon(item.category) }}</div>
          <div class="item-status-indicator" :class="item.status"></div>
        </div>
        <div class="card-body">
          <h3 class="item-name">{{ item.name }}</h3>
          <span class="item-category">{{ item.category }}</span>
        </div>
        <div class="card-footer">
          <div class="quantity-section">
            <span class="quantity-label">Quantity</span>
            <div class="quantity-value">
              <span class="qty-number">{{ item.quantity }}</span>
              <span class="qty-unit">{{ item.unit }}</span>
            </div>
          </div>
          <div class="expiry-section" v-if="item.expiry_date">
            <div class="expiry-badge" :class="getExpiryClass(item.expiry_date)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {{ formatExpiryDate(item.expiry_date) }}
            </div>
          </div>
        </div>
        <div class="card-actions">
          <button class="card-action-btn use" @click.stop="quickUseItem(item)" title="Use">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 12H4M12 4v16"/>
            </svg>
          </button>
          <button class="card-action-btn edit" @click.stop="editItem(item)" title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 3l4 4-7 7H10v-4l7-7z"/>
            </svg>
          </button>
          <button class="card-action-btn delete" @click.stop="deleteItem(item.id)" title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredItems.length === 0" class="empty-state-card">
        <div class="empty-icon">🥬</div>
        <h3>Your kitchen is empty</h3>
        <p>Start adding ingredients to build your kitchen inventory</p>
        <button class="btn-primary" @click="openAddModal">Add Your First Ingredient</button>
      </div>
    </div>

    <!-- Item Details Modal -->
    <div v-if="showDetailsModal" class="modal-overlay" @click.self="closeDetailsModal">
      <div class="modal-container details-modal">
        <div class="modal-header">
          <h3>Ingredient Details</h3>
          <button class="close-btn" @click="closeDetailsModal">×</button>
        </div>
        <div class="item-details-content" v-if="selectedItem">
          <div class="detail-icon">{{ getCategoryIcon(selectedItem.category) }}</div>
          <h2 class="detail-name">{{ selectedItem.name }}</h2>
          <div class="detail-grid">
            <div class="detail-field">
              <label>Category</label>
              <span>{{ selectedItem.category }}</span>
            </div>
            <div class="detail-field">
              <label>Quantity</label>
              <div class="quantity-control">
                <button @click="adjustQuantity(-0.5)" class="qty-btn">-</button>
                <span class="current-qty">{{ selectedItem.quantity }}</span>
                <button @click="adjustQuantity(0.5)" class="qty-btn">+</button>
                <span class="unit-label">{{ selectedItem.unit }}</span>
              </div>
            </div>
            <div class="detail-field">
              <label>Unit</label>
              <span>{{ selectedItem.unit }}</span>
            </div>
            <div class="detail-field">
              <label>Expiry Date</label>
              <input type="date" v-model="editExpiryDate" class="edit-input">
            </div>
            <div class="detail-field">
              <label>Status</label>
              <span :class="['status-badge', selectedItem.status]">{{ getStatusText(selectedItem.status) }}</span>
            </div>
            <div class="detail-field full-width">
              <label>Notes</label>
              <textarea v-model="editNotes" class="edit-textarea" rows="3" placeholder="Add notes about this ingredient..."></textarea>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="closeDetailsModal">Close</button>
            <button class="btn-submit" @click="saveItemChanges">Save Changes</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Item Modal -->
    <div v-if="showAddEditModal" class="modal-overlay" @click.self="closeAddEditModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Edit Ingredient' : 'Add New Ingredient' }}</h3>
          <button class="close-btn" @click="closeAddEditModal">×</button>
        </div>
        <form @submit.prevent="saveItem" class="modal-form">
          <div class="form-group">
            <label>Ingredient Name *</label>
            <input type="text" v-model="formData.name" required placeholder="e.g., Tomatoes, Rice, Milk" class="form-input">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Quantity *</label>
              <input type="number" step="0.1" v-model="formData.quantity" required class="form-input">
            </div>
            <div class="form-group">
              <label>Unit</label>
              <select v-model="formData.unit" class="form-input">
                <option value="pcs">Pieces (pcs)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="L">Liters (L)</option>
                <option value="ml">Milliliters (ml)</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Category</label>
              <select v-model="formData.category" class="form-input">
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Meat">Meat</option>
                <option value="Dairy">Dairy</option>
                <option value="Grains">Grains</option>
                <option value="Spices">Spices</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Expiry Date</label>
              <input type="date" v-model="formData.expiry_date" class="form-input">
            </div>
          </div>
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.auto_shopping">
              <span>Auto-add to shopping list when low</span>
            </label>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeAddEditModal">Cancel</button>
            <button type="submit" class="btn-submit">Save Ingredient</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Quick Use Modal -->
    <div v-if="showUseModal" class="modal-overlay" @click.self="closeUseModal">
      <div class="modal-container use-modal">
        <div class="modal-header">
          <h3>Use Ingredient</h3>
          <button class="close-btn" @click="closeUseModal">×</button>
        </div>
        <div class="use-content">
          <div class="use-item-name">{{ useItemData?.name }}</div>
          <div class="use-current">Current quantity: <strong>{{ useItemData?.quantity }} {{ useItemData?.unit }}</strong></div>
          <div class="form-group">
            <label>How much did you use?</label>
            <div class="quantity-control-large">
              <button @click="useQuantity = Math.max(0, useQuantity - 0.1)" class="qty-btn-large">-</button>
              <input type="number" step="0.1" v-model="useQuantity" class="use-input">
              <button @click="useQuantity += 0.1" class="qty-btn-large">+</button>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="closeUseModal">Cancel</button>
            <button class="btn-submit" @click="confirmUseItem">Use Ingredient</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <div v-if="contextMenuVisible" class="context-menu" :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }">
      <div class="context-item" @click="quickUseItem(contextMenuItem)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 12H4M12 4v16"/>
        </svg>
        <span>Use Ingredient</span>
      </div>
      <div class="context-item" @click="editItem(contextMenuItem)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 3l4 4-7 7H10v-4l7-7z"/>
        </svg>
        <span>Edit Ingredient</span>
      </div>
      <div class="context-divider"></div>
      <div class="context-item delete" @click="deleteItem(contextMenuItem.id)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13"/>
        </svg>
        <span>Delete Ingredient</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useKitchenStore } from '../stores/kitchen'
import { useShoppingStore } from '../stores/shopping'
import { useNotificationStore } from '../stores/notifications'
import { useAuthStore } from '../stores/auth'

const kitchenStore = useKitchenStore()
const shoppingStore = useShoppingStore()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()

// State
const searchQuery = ref('')
const currentFilter = ref('all')
const showDetailsModal = ref(false)
const showAddEditModal = ref(false)
const showUseModal = ref(false)
const selectedItem = ref(null)
const useItemData = ref(null)
const useQuantity = ref(0.5)
const isEditing = ref(false)
const editExpiryDate = ref('')
const editNotes = ref('')

// Context menu
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextMenuItem = ref(null)
let pressTimer = null

// Form data
const formData = ref({
  name: '',
  quantity: 1,
  unit: 'pcs',
  category: 'Vegetables',
  expiry_date: '',
  notes: '',
  auto_shopping: true
})

// Filters with icons
const filters = [
  { value: 'all', label: 'All', icon: '' },
  { value: 'available', label: 'In Stock', icon: '' },
  { value: 'low', label: 'Low Stock', icon: '' },
  { value: 'expiring', label: 'Expiring', icon: '' },
  { value: 'Vegetables', label: 'Veggies', icon: '' },
  { value: 'Fruits', label: 'Fruits', icon: '' },
  { value: 'Meat', label: 'Meat', icon: '' },
  { value: 'Dairy', label: 'Dairy', icon: '' }
]

// Computed
const lowStockCount = computed(() => kitchenStore.items.filter(i => i.status === 'low').length)
const expiringCount = computed(() => kitchenStore.items.filter(i => isExpiringSoon(i.expiry_date)).length)

const filteredItems = computed(() => {
  let items = [...kitchenStore.items]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    )
  }
  
  if (currentFilter.value !== 'all') {
    if (currentFilter.value === 'expiring') {
      items = items.filter(item => isExpiringSoon(item.expiry_date))
    } else if (currentFilter.value === 'available') {
      items = items.filter(item => item.status === 'available')
    } else if (currentFilter.value === 'low') {
      items = items.filter(item => item.status === 'low')
    } else {
      items = items.filter(item => item.category === currentFilter.value)
    }
  }
  
  return items
})

// Helper functions
const getUserInitials = () => {
  const name = authStore.profile?.display_name || authStore.profile?.full_name
  if (!name) return '👤'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

const getUserFirstName = () => {
  const name = authStore.profile?.display_name || authStore.profile?.full_name
  if (!name) return 'Friend'
  return name.split(' ')[0]
}

const getCategoryIcon = (category) => {
  const icons = {
    Vegetables: '🥬',
    Fruits: '🍎',
    Meat: '🍖',
    Dairy: '🥛',
    Grains: '🌾',
    Spices: '🌶️',
    Other: '📦'
  }
  return icons[category] || '🥬'
}

const getFilterCount = (filterValue) => {
  if (filterValue === 'all') return kitchenStore.items.length
  if (filterValue === 'expiring') return kitchenStore.items.filter(i => isExpiringSoon(i.expiry_date)).length
  if (filterValue === 'available') return kitchenStore.items.filter(i => i.status === 'available').length
  if (filterValue === 'low') return kitchenStore.items.filter(i => i.status === 'low').length
  return kitchenStore.items.filter(i => i.category === filterValue).length
}

const isExpiringSoon = (expiryDate) => {
  if (!expiryDate) return false
  const daysLeft = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
  return daysLeft <= 3 && daysLeft >= 0
}

const getExpiryClass = (expiryDate) => {
  if (!expiryDate) return ''
  const daysLeft = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) return 'expired'
  if (daysLeft <= 3) return 'expiring-soon'
  return 'good'
}

const formatExpiryDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const daysLeft = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) return 'Expired'
  if (daysLeft === 0) return 'Today!'
  if (daysLeft <= 3) return `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`
  return d.toLocaleDateString()
}

const getStatusText = (status) => {
  const texts = {
    available: 'In Stock',
    low: 'Low Stock',
    consumed: 'Consumed'
  }
  return texts[status] || status
}

// Event handlers
const viewItemDetails = (item) => {
  selectedItem.value = { ...item }
  editExpiryDate.value = item.expiry_date || ''
  editNotes.value = item.notes || ''
  showDetailsModal.value = true
}

const editItem = (item) => {
  formData.value = {
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    expiry_date: item.expiry_date || '',
    notes: item.notes || '',
    auto_shopping: item.auto_shopping !== false
  }
  isEditing.value = true
  showAddEditModal.value = true
  contextMenuVisible.value = false
}

const deleteItem = async (id) => {
  if (confirm('Remove this ingredient from your pantry?')) {
    await kitchenStore.removeItem(id)
    contextMenuVisible.value = false
    if (showDetailsModal.value) closeDetailsModal()
    await refreshData()
  }
}

const quickUseItem = (item) => {
  useItemData.value = item
  useQuantity.value = 0.5
  showUseModal.value = true
  contextMenuVisible.value = false
  if (showDetailsModal.value) closeDetailsModal()
}

const confirmUseItem = async () => {
  if (useQuantity.value <= 0) {
    alert('Please enter a valid quantity')
    return
  }
  if (useQuantity.value > useItemData.value.quantity) {
    alert(`You only have ${useItemData.value.quantity} ${useItemData.value.unit} available`)
    return
  }
  
  await kitchenStore.consumeItem(useItemData.value.id, useQuantity.value)
  closeUseModal()
  await refreshData()
}

const adjustQuantity = (amount) => {
  if (selectedItem.value) {
    const newQuantity = selectedItem.value.quantity + amount
    if (newQuantity >= 0) {
      selectedItem.value.quantity = parseFloat(newQuantity.toFixed(1))
    }
  }
}

const saveItemChanges = async () => {
  if (selectedItem.value) {
    await kitchenStore.updateItem(selectedItem.value.id, {
      quantity: selectedItem.value.quantity,
      expiry_date: editExpiryDate.value,
      notes: editNotes.value,
      status: selectedItem.value.quantity >= 1 ? 'available' : 'low'
    })
    closeDetailsModal()
    await refreshData()
  }
}

const saveItem = async () => {
  try {
    if (isEditing.value) {
      await kitchenStore.updateItem(formData.value.id, {
        name: formData.value.name,
        quantity: formData.value.quantity,
        unit: formData.value.unit,
        category: formData.value.category,
        expiry_date: formData.value.expiry_date || null,
        notes: formData.value.notes,
        auto_shopping: formData.value.auto_shopping,
        status: formData.value.quantity >= 1 ? 'available' : 'low'
      })
    } else {
      await kitchenStore.addItem({
        name: formData.value.name,
        quantity: formData.value.quantity,
        unit: formData.value.unit,
        category: formData.value.category,
        expiry_date: formData.value.expiry_date || null,
        notes: formData.value.notes,
        auto_shopping: formData.value.auto_shopping
      })
    }
    closeAddEditModal()
    await refreshData()
  } catch (error) {
    console.error('Error saving item:', error)
    alert('Failed to save ingredient. Please try again.')
  }
}

const openAddModal = () => {
  formData.value = {
    name: '',
    quantity: 1,
    unit: 'pcs',
    category: 'Vegetables',
    expiry_date: '',
    notes: '',
    auto_shopping: true
  }
  isEditing.value = false
  showAddEditModal.value = true
}

const refreshData = async () => {
  await kitchenStore.loadItems()
  await shoppingStore.loadList()
  await notificationStore.loadNotifications()
}

// Modal controls
const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedItem.value = null
}

const closeAddEditModal = () => {
  showAddEditModal.value = false
  isEditing.value = false
}

const closeUseModal = () => {
  showUseModal.value = false
  useItemData.value = null
  useQuantity.value = 0.5
}

// Context menu
const showContextMenu = (event, item) => {
  contextMenuVisible.value = true
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  contextMenuItem.value = item
  
  setTimeout(() => {
    const clickHandler = () => {
      contextMenuVisible.value = false
      document.removeEventListener('click', clickHandler)
    }
    document.addEventListener('click', clickHandler, { once: true })
  }, 100)
}

// Long press for mobile
const startLongPress = (item) => {
  pressTimer = setTimeout(() => {
    showContextMenu({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 }, item)
  }, 500)
}

const cancelLongPress = () => {
  if (pressTimer) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
}

// Expose openAddModal to window for dropdown access
if (typeof window !== 'undefined') {
  window.openAddItemModal = openAddModal
}

onMounted(async () => {
  await refreshData()
})

onUnmounted(() => {
  if (pressTimer) clearTimeout(pressTimer)
})
</script>

<style scoped>
.kitchen-inventory {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #fef8f0 0%, #fff9f5 100%);
}

/* Chef Banner */
.chef-banner {
  background: linear-gradient(135deg, #FF6B35, #F7A440);
  border-radius: 28px;
  padding: 24px;
  margin-bottom: 24px;
  color: white;
  position: relative;
  overflow: hidden;
}

.chef-banner::before {
  content: "🍳";
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
  color: white;
  backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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
  color: #FFE66D;
  background: rgba(255, 255, 255, 0);
  padding: 0px 0px;
  border-radius: 20px;
  display: inline-block;
  margin-right: 4px;
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

/* Search & Filter */
.search-filter-section {
  margin-bottom: 24px;
}

.search-container {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 20px;
  padding: 12px 16px;
  gap: 12px;
  margin-bottom: 16px;
  border: 1px solid var(--gray-200);
  transition: all 0.2s;
}

.search-container:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.search-icon {
  flex-shrink: 0;
  color: var(--gray-400);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  background: transparent;
}

.clear-search {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--gray-400);
}

.filter-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 40px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.filter-chip.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.filter-badge {
  background: rgba(0,0,0,0.1);
  padding: 2px 6px;
  border-radius: 20px;
  font-size: 11px;
}

.filter-chip.active .filter-badge {
  background: rgba(255,255,255,0.2);
}

/* Inventory Grid */
.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.inventory-card {
  background: white;
  border-radius: 24px;
  padding: 20px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(0,0,0,0.05);
  overflow: hidden;
}

.inventory-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0,0,0,0.1);
}

.inventory-card.low-stock {
  border-left: 4px solid var(--warning);
}

.inventory-card.expiring {
  border-left: 4px solid #ff9800;
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  opacity: 0;
  transition: opacity 0.3s;
}

.inventory-card:hover .card-glow {
  opacity: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.item-icon-large {
  font-size: 48px;
}

.item-status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.item-status-indicator.available {
  background: var(--success);
  box-shadow: 0 0 8px var(--success);
}

.item-status-indicator.low {
  background: var(--warning);
  box-shadow: 0 0 8px var(--warning);
}

.card-body {
  margin-bottom: 16px;
}

.item-name {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: var(--dark);
}

.item-category {
  font-size: 12px;
  color: var(--gray-500);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.quantity-label {
  font-size: 11px;
  color: var(--gray-500);
  display: block;
}

.qty-number {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}

.qty-unit {
  font-size: 12px;
  color: var(--gray-500);
  margin-left: 2px;
}

.expiry-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 20px;
}

.expiry-badge.expiring-soon {
  background: #fff3e0;
  color: #e65100;
}

.expiry-badge.expired {
  background: #ffebee;
  color: #c62828;
  text-decoration: line-through;
}

.card-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  border-top: 1px solid var(--gray-100);
  padding-top: 12px;
}

.card-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: var(--gray-50);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.card-action-btn.use:hover {
  background: var(--primary);
  color: white;
}

.card-action-btn.edit:hover {
  background: var(--info);
  color: white;
}

.card-action-btn.delete:hover {
  background: var(--danger);
  color: white;
}

/* Empty State */
.empty-state-card {
  background: white;
  border-radius: 24px;
  padding: 60px 20px;
  text-align: center;
  grid-column: 1 / -1;
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
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
  z-index: 1;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: var(--gray-500);
}

/* Form Styles */
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

.checkbox-group {
  margin: 20px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
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

/* Item Details Modal */
.details-modal .item-details-content {
  padding: 24px;
  text-align: center;
}

.detail-icon {
  font-size: 60px;
  margin-bottom: 12px;
}

.detail-name {
  font-size: 24px;
  margin-bottom: 20px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.detail-field {
  text-align: left;
}

.detail-field label {
  display: block;
  font-size: 12px;
  color: var(--gray-500);
  margin-bottom: 4px;
}

.detail-field.full-width {
  grid-column: span 2;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qty-btn {
  width: 30px;
  height: 30px;
  background: var(--gray-100);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
}

.current-qty {
  font-size: 18px;
  font-weight: 600;
  min-width: 40px;
  text-align: center;
}

.unit-label {
  color: var(--gray-500);
}

.edit-input, .edit-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  font-size: 14px;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.status-badge.available {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.low {
  background: #fff3e0;
  color: #e65100;
}

/* Use Modal */
.use-modal .use-content {
  padding: 24px;
  text-align: center;
}

.use-item-name {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
}

.use-current {
  margin-bottom: 20px;
  color: var(--gray-600);
}

.quantity-control-large {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: center;
  margin-top: 8px;
}

.qty-btn-large {
  width: 44px;
  height: 44px;
  background: var(--gray-100);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 20px;
}

.use-input {
  width: 100px;
  height: 44px;
  text-align: center;
  font-size: 18px;
  border: 1px solid var(--gray-300);
  border-radius: 12px;
}

/* Context Menu */
.context-menu {
  position: fixed;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  min-width: 200px;
  overflow: hidden;
  z-index: 1000;
}

.context-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.context-item:hover {
  background: var(--gray-100);
}

.context-item.delete {
  color: var(--danger);
}

.context-divider {
  height: 1px;
  background: var(--gray-200);
  margin: 4px 0;
}

/* Responsive */
@media (max-width: 768px) {
  .kitchen-inventory {
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
  
  .inventory-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-field.full-width {
    grid-column: span 1;
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
  
  .action-btn span {
  width: 40%;
  }
  
  .action-btn {
    padding: 12px;
  }
}
</style>