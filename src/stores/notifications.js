import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'
import { useAuthStore } from './auth'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    loading: false
  }),

  getters: {
    unreadCount: (state) => state.notifications.filter(n => !n.is_read).length
  },

  actions: {
    async loadNotifications() {
      const auth = useAuthStore()
      if (!auth.user) return
      
      this.loading = true
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', auth.user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (!error && data) {
        this.notifications = data
      }
      
      this.loading = false
    },

    async markAsRead(id) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
      
      if (!error) {
        const notification = this.notifications.find(n => n.id === id)
        if (notification) {
          notification.is_read = true
        }
      }
    },

    async markAllAsRead() {
      const auth = useAuthStore()
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', auth.user.id)
        .eq('is_read', false)
      
      if (!error) {
        this.notifications.forEach(n => {
          n.is_read = true
        })
      }
    },

    async addNotification(notification) {
      const auth = useAuthStore()
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: auth.user.id,
          ...notification,
          created_at: new Date()
        }])
        .select()
      
      if (!error && data) {
        this.notifications.unshift(data[0])
        return data[0]
      }
      return null
    }
  }
})