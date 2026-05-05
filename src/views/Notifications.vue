<template>
  <div class="notifications-page">
    <div class="page-header">
      <h2>🔔 Notifications</h2>
      <button 
        v-if="notificationStore.unreadCount > 0"
        @click="markAllRead" 
        class="btn btn-secondary"
      >
        Mark All Read
      </button>
    </div>

    <div v-if="notificationStore.loading" class="loading">Loading...</div>
    
    <div v-else class="notifications-list">
      <div 
        v-for="notification in notificationStore.notifications" 
        :key="notification.id"
        :class="['notification-item', { unread: !notification.is_read }]"
        @click="markAsRead(notification.id)"
      >
        <div class="notification-icon">
          {{ getNotificationIcon(notification.type) }}
        </div>
        <div class="notification-content">
          <h4>{{ notification.title }}</h4>
          <p>{{ notification.message }}</p>
          <small>{{ formatTime(notification.created_at) }}</small>
        </div>
      </div>
      
      <div v-if="notificationStore.notifications.length === 0" class="empty-state">
        🔔 No notifications yet
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const notificationStore = useNotificationStore()

const getNotificationIcon = (type) => {
  const icons = {
    expiry: '⚠️',
    low_stock: '📦',
    shopping: '🛒',
    recipe: '🍳'
  }
  return icons[type] || '🔔'
}

const formatTime = (date) => {
  const now = new Date()
  const notifDate = new Date(date)
  const diff = Math.floor((now - notifDate) / 1000 / 60)
  
  if (diff < 1) return 'Just now'
  if (diff < 60) return `${diff} minutes ago`
  if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`
  return notifDate.toLocaleDateString()
}

const markAsRead = async (id) => {
  await notificationStore.markAsRead(id)
}

const markAllRead = async () => {
  await notificationStore.markAllAsRead()
}

onMounted(async () => {
  await notificationStore.loadNotifications()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 4px solid transparent;
}

.notification-item.unread {
  background: #FFF8F0;
  border-left-color: var(--primary);
}

.notification-item:hover {
  transform: translateX(4px);
}

.notification-icon {
  font-size: 28px;
}

.notification-content {
  flex: 1;
}

.notification-content h4 {
  margin-bottom: 4px;
  color: var(--dark);
}

.notification-content p {
  color: var(--gray-600);
  font-size: 14px;
  margin-bottom: 4px;
}

.notification-content small {
  color: var(--gray-400);
  font-size: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: var(--gray-500);
  font-size: 16px;
}
</style>