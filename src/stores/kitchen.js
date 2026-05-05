import { defineStore } from 'pinia'
import { 
  getKitchenItems, 
  addKitchenItem, 
  updateKitchenItem, 
  deleteKitchenItem,
  addConsumption 
} from '../services/supabase'
import { useAuthStore } from './auth'

export const useKitchenStore = defineStore('kitchen', {
  state: () => ({
    items: [],
    loading: false
  }),

  actions: {
    async loadItems() {
      const auth = useAuthStore()
      if (!auth.user) return
      
      this.loading = true
      const { data, error } = await getKitchenItems(auth.user.id)
      
      if (!error && data) {
        this.items = data
      }
      
      this.loading = false
    },

    async addItem(item) {
      const auth = useAuthStore()
      
      const newItem = {
        ...item,
        user_id: auth.user.id,
        status: item.quantity >= 1 ? 'available' : 'low'
      }
      
      const { data, error } = await addKitchenItem(newItem)
      
      if (!error && data) {
        this.items.unshift(data)
        return data
      }
      
      throw error
    },

    async updateItem(id, updates) {
      const { data, error } = await updateKitchenItem(id, updates)
      
      if (!error && data) {
        const index = this.items.findIndex(i => i.id === id)
        if (index !== -1) {
          this.items[index] = data
        }
      }
      
      return { data, error }
    },

    async removeItem(id) {
      const { error } = await deleteKitchenItem(id)
      
      if (!error) {
        this.items = this.items.filter(i => i.id !== id)
      }
      
      return { error }
    },

    async consumeItem(id, quantityUsed) {
      const item = this.items.find(i => i.id === id)
      if (!item) return
      
      const newQuantity = Math.max(0, item.quantity - quantityUsed)
      const newStatus = newQuantity === 0 ? 'consumed' : (newQuantity < 1 ? 'low' : 'available')
      
      // Update item quantity
      await this.updateItem(id, {
        quantity: newQuantity,
        status: newStatus
      })
      
      // Record consumption
      const auth = useAuthStore()
      await addConsumption({
        kitchen_item_id: id,
        user_id: auth.user.id,
        quantity_used: quantityUsed,
        used_for: 'manual'
      })
      
      await this.loadItems()
    }
  }
})