import { defineStore } from 'pinia'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/supabase'
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
      const { data, error } = await getNotifications(auth.user.id)
      
      if (!error && data) {
        this.notifications = data
      }
      
      this.loading = false
    },

    async markAsRead(id) {
      const { error } = await markNotificationRead(id)
      
      if (!error) {
        const notification = this.notifications.find(n => n.id === id)
        if (notification) {
          notification.is_read = true
        }
      }
    },

    async markAllAsRead() {
      const auth = useAuthStore()
      const { error } = await markAllNotificationsRead(auth.user.id)
      
      if (!error) {
        this.notifications.forEach(n => {
          n.is_read = true
        })
      }
    }
  }
})