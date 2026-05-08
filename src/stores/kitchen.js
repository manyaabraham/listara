import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'
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
      
      const { data, error } = await supabase
        .from('kitchen_items')
        .select('*')
        .eq('user_id', auth.user.id)
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        this.items = data
      } else if (error) {
        console.error('Error loading items:', error)
      }
      
      this.loading = false
    },

    async addItem(item) {
      const auth = useAuthStore()
      if (!auth.user) {
        console.error('No user logged in')
        return null
      }
      
      const newItem = {
        user_id: auth.user.id,
        name: item.name,
        quantity: parseFloat(item.quantity),
        unit: item.unit || 'pcs',
        category: item.category || 'Other',
        expiry_date: item.expiry_date || null,
        auto_shopping: item.auto_shopping !== false,
        status: parseFloat(item.quantity) >= 1 ? 'available' : 'low',
        created_at: new Date(),
        updated_at: new Date()
      }
      
      const { data, error } = await supabase
        .from('kitchen_items')
        .insert([newItem])
        .select()
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      if (data && data.length > 0) {
        this.items.unshift(data[0])
        return data[0]
      }
      
      return null
    },

    async updateItem(id, updates) {
      const { data, error } = await supabase
        .from('kitchen_items')
        .update(updates)
        .eq('id', id)
        .select()
      
      if (!error && data && data.length > 0) {
        const index = this.items.findIndex(i => i.id === id)
        if (index !== -1) {
          this.items[index] = data[0]
        }
        return data[0]
      }
      throw error
    },

    async removeItem(id) {
      const { error } = await supabase
        .from('kitchen_items')
        .delete()
        .eq('id', id)
      
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
      
      const { data, error } = await supabase
        .from('kitchen_items')
        .update({ 
          quantity: newQuantity, 
          status: newStatus,
          updated_at: new Date()
        })
        .eq('id', id)
        .select()
      
      if (!error && data && data.length > 0) {
        const index = this.items.findIndex(i => i.id === id)
        if (index !== -1) {
          this.items[index] = data[0]
        }
        
        // Add to shopping list if consumed completely
        if (newQuantity === 0 && item.auto_shopping) {
          const shoppingStore = useShoppingStore()
          await shoppingStore.addItem({
            item_name: item.name,
            quantity: 1,
            unit: item.unit,
            auto_added: true,
            kitchen_item_id: id
          })
        }
      }
      return { data, error }
    }
  }
})