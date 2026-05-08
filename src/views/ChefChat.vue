<template>
  <div class="chef-chat-page">
    <!-- Chat Header -->
    <div class="chat-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <div class="header-info" @click="goToProfile">
        <div class="header-avatar">{{ getInitials(contactName) }}</div>
        <div>
          <h3>{{ contactName }}</h3>
          <p class="online-status" :class="{ online: isOnline }">
            {{ isOnline ? 'Online' : 'Offline' }}
          </p>
        </div>
      </div>
      <div class="menu-container">
        <button class="menu-btn" @click="toggleMenu">⋮</button>
        <div v-if="showMenu" class="dropdown-menu">
          <div class="dropdown-item" @click="clearChat">Clear Chat</div>
          <div class="dropdown-item" @click="blockUser">Block User</div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item delete" @click="deleteConversation">Delete Conversation</div>
        </div>
      </div>
    </div>

    <!-- Messages Container -->
    <div class="messages-container" ref="messagesContainer">
      <div v-for="msg in messages" :key="msg.id" :class="['message', msg.sender_id === currentUserId ? 'sent' : 'received']">
        <div class="message-bubble">
          <div class="message-text">{{ msg.message }}</div>
          <div class="message-time">
            {{ formatTime(msg.created_at) }}
            <span v-if="msg.sender_id === currentUserId" class="read-status">
              {{ msg.is_read ? '✓✓' : '✓' }}
            </span>
          </div>
        </div>
      </div>
      <div v-if="typing" class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-area">
      <input 
        type="text" 
        v-model="newMessage" 
        @keypress.enter="sendMessage"
        placeholder="Type a message..."
        class="message-input"
      >
      <button @click="sendMessage" class="send-btn" :disabled="sending || !newMessage.trim()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const currentUserId = ref(null)
const contactId = ref(null)
const contactName = ref('')
const isOnline = ref(false)
const messages = ref([])
const newMessage = ref('')
const sending = ref(false)
const typing = ref(false)
const showMenu = ref(false)
const messagesContainer = ref(null)

let messageSubscription = null
let typingTimeout = null

const getInitials = (name) => {
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const loadMessages = async () => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', route.params.conversationId)
    .order('created_at', { ascending: true })
  
  if (!error && data) {
    messages.value = data
    scrollToBottom()
    
    // Mark unread messages as read
    const unread = data.filter(m => m.receiver_id === currentUserId.value && !m.is_read)
    for (const msg of unread) {
      await supabase.from('messages').update({ is_read: true }).eq('id', msg.id)
    }
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || sending.value) return
  
  sending.value = true
  
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      conversation_id: route.params.conversationId,
      sender_id: currentUserId.value,
      receiver_id: contactId.value,
      message: newMessage.value,
      is_read: false
    }])
    .select()
  
  if (!error && data) {
    messages.value.push(data[0])
    newMessage.value = ''
    scrollToBottom()
    
    // Update conversation last message
    await supabase
      .from('conversations')
      .update({ last_message: data[0].message, last_message_time: new Date() })
      .eq('id', route.params.conversationId)
  }
  
  sending.value = false
}

const setupRealtime = () => {
  messageSubscription = supabase
    .channel('messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${route.params.conversationId}`
    }, (payload) => {
      if (payload.new.sender_id !== currentUserId.value) {
        messages.value.push(payload.new)
        scrollToBottom()
        
        // Mark as read
        supabase.from('messages').update({ is_read: true }).eq('id', payload.new.id)
      }
    })
    .subscribe()
}

const goToProfile = () => {
  router.push(`/chef-messaging-profile/${contactId.value}`)
}

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const clearChat = () => {
  if (confirm('Clear all messages in this chat?')) {
    alert('Chat cleared')
    showMenu.value = false
  }
}

const blockUser = () => {
  if (confirm(`Block ${contactName.value}? You will no longer receive messages from them.`)) {
    alert('User blocked')
    showMenu.value = false
  }
}

const deleteConversation = () => {
  if (confirm('Delete this entire conversation? This cannot be undone.')) {
    router.back()
  }
  showMenu.value = false
}

// Load contact info and conversation
const loadContactInfo = async () => {
  const { data: conv, error } = await supabase
    .from('conversations')
    .select('participant1_id, participant2_id, participant1:chef_profiles!conversations_participant1_id_fkey(*), participant2:chef_profiles!conversations_participant2_id_fkey(*)')
    .eq('id', route.params.conversationId)
    .single()
  
  if (conv) {
    const other = conv.participant1_id === currentUserId.value ? conv.participant2 : conv.participant1
    contactId.value = other.id
    contactName.value = other.full_name || 'Chef'
    isOnline.value = other.is_online || false
  }
}

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  currentUserId.value = user.id
  
  await loadContactInfo()
  await loadMessages()
  setupRealtime()
})

onUnmounted(() => {
  if (messageSubscription) messageSubscription.unsubscribe()
})

// Close menu when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.menu-container')) {
    showMenu.value = false
  }
}

document.addEventListener('click', handleClickOutside)
</script>

<style scoped>
.chef-chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

/* Chat Header */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid rgba(0,0,0,0.08);
  flex-shrink: 0;
}

.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:hover {
  background: rgba(0,0,0,0.05);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex: 1;
}

.header-avatar {
  width: 45px;
  height: 45px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  color: white;
}

.header-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.online-status {
  font-size: 12px;
  color: #999;
  margin: 2px 0 0;
}

.online-status.online {
  color: #4CAF50;
}

.menu-container {
  position: relative;
}

.menu-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
}

.menu-btn:hover {
  background: rgba(0,0,0,0.05);
}

.dropdown-menu {
  position: absolute;
  top: 45px;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  min-width: 180px;
  overflow: hidden;
  z-index: 100;
}

.dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 4px 0;
}

.delete {
  color: #f44336;
}

/* Messages Container */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
}

.message.sent {
  justify-content: flex-end;
}

.message.received {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 18px;
}

.message.sent .message-bubble {
  background: var(--primary);
  color: white;
}

.message.received .message-bubble {
  background: white;
  color: #1a1a1a;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.message-text {
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-time {
  font-size: 10px;
  margin-top: 4px;
  opacity: 0.7;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.read-status {
  font-size: 10px;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 10px 14px;
  background: white;
  border-radius: 18px;
  width: fit-content;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-8px); opacity: 1; }
}

/* Input Area */
.input-area {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  background: white;
  border-top: 1px solid rgba(0,0,0,0.08);
  flex-shrink: 0;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 25px;
  outline: none;
  font-size: 14px;
}

.message-input:focus {
  border-color: var(--primary);
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--primary);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Scrollbar */
.messages-container::-webkit-scrollbar {
  width: 5px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.2);
  border-radius: 5px;
}
</style>