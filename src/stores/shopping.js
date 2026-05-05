import { defineStore } from 'pinia'
import { 
  getActiveShoppingList, 
  addShoppingItem, 
  updateShoppingItem, 
  deleteShoppingItem 
} from '../services/supabase'
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
      const { data, error } = await getActiveShoppingList(auth.user.id)
      
      if (!error && data) {
        this.list = data.list
        this.items = data.items || []
      }
      
      this.loading = false
    },

    async addItem(item) {
      if (!this.list) await this.loadList()
      if (!this.list) return
      
      const newItem = {
        ...item,
        shopping_list_id: this.list.id,
        status: 'pending'
      }
      
      const { data, error } = await addShoppingItem(newItem)
      
      if (!error && data) {
        this.items.unshift(data)
        return data
      }
      
      throw error
    },

    async updateItemStatus(id, status) {
      const { data, error } = await updateShoppingItem(id, { status })
      
      if (!error && data) {
        const index = this.items.findIndex(i => i.id === id)
        if (index !== -1) {
          this.items[index] = data
        }
      }
      
      return { data, error }
    },

    async removeItem(id) {
      const { error } = await deleteShoppingItem(id)
      
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