import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'
import { useAuthStore } from './auth'

export const useShoppingStore = defineStore('shopping', {
  state: () => ({
    list: null,
    items: [],
    loading: false
  }),

  actions: {
    async loadList() {
      const auth = useAuthStore()
      if (!auth.user) return
      
      this.loading = true
      
      // Get or create active shopping list
      let { data: list, error: listError } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', auth.user.id)
        .eq('status', 'pending')
        .maybeSingle()
      
      if (!list && !listError) {
        const { data: newList, error: createError } = await supabase
          .from('shopping_lists')
          .insert([{ user_id: auth.user.id, name: 'Shopping List' }])
          .select()
          .single()
        
        if (!createError && newList) {
          list = newList
        }
      }
      
      if (list) {
        const { data: items, error: itemsError } = await supabase
          .from('shopping_list_items')
          .select('*')
          .eq('shopping_list_id', list.id)
          .order('created_at', { ascending: false })
        
        if (!itemsError && items) {
          this.items = items
          this.list = list
        }
      }
      
      this.loading = false
    },

    async addItem(item) {
      const auth = useAuthStore()
      if (!auth.user) return null
      
      // Ensure we have an active shopping list
      if (!this.list) {
        await this.loadList()
      }
      
      if (!this.list) {
        // Create a new shopping list
        const { data: newList, error: createError } = await supabase
          .from('shopping_lists')
          .insert([{ user_id: auth.user.id, name: 'Shopping List' }])
          .select()
          .single()
        
        if (createError || !newList) {
          console.error('Error creating shopping list:', createError)
          return null
        }
        this.list = newList
      }
      
      const newItem = {
        shopping_list_id: this.list.id,
        item_name: item.item_name,
        quantity: parseFloat(item.quantity),
        unit: item.unit || 'pcs',
        auto_added: item.auto_added || false,
        kitchen_item_id: item.kitchen_item_id || null,
        status: 'pending',
        created_at: new Date()
      }
      
      const { data, error } = await supabase
        .from('shopping_list_items')
        .insert([newItem])
        .select()
      
      if (error) {
        console.error('Error adding shopping item:', error)
        throw error
      }
      
      if (data && data.length > 0) {
        this.items.unshift(data[0])
        return data[0]
      }
      
      return null
    },

    async updateItemStatus(id, status) {
      const { data, error } = await supabase
        .from('shopping_list_items')
        .update({ status, updated_at: new Date() })
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
        .from('shopping_list_items')
        .delete()
        .eq('id', id)
      
      if (!error) {
        this.items = this.items.filter(i => i.id !== id)
      }
      return { error }
    },

    async markAllPurchased() {
      for (const item of this.items) {
        if (item.status === 'pending') {
          await this.updateItemStatus(item.id, 'purchased')
        }
      }
      await this.loadList()
    },

    async clearPurchased() {
      const purchasedItems = this.items.filter(i => i.status === 'purchased')
      for (const item of purchasedItems) {
        await this.removeItem(item.id)
      }
      await this.loadList()
    },

    downloadList() {
      const pending = this.items.filter(i => i.status === 'pending')
      let text = 'LISTARA SHOPPING LIST\n'
      text += '='.repeat(40) + '\n'
      text += `Generated: ${new Date().toLocaleString()}\n\n`
      
      pending.forEach((item, index) => {
        text += `${index + 1}. ${item.item_name} - ${item.quantity} ${item.unit}\n`
      })
      
      if (pending.length === 0) {
        text += 'No pending items! 🎉\n'
      }
      
      text += '\n' + '='.repeat(40) + '\n'
      text += 'Happy Shopping! 🛒'
      
      const blob = new Blob([text], { type: 'text/plain' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `listara-shopping-${Date.now()}.txt`
      link.click()
      URL.revokeObjectURL(link.href)
    }
  }
})