<template>
  <div class="chefs-corner">
    <div class="clean-header">
      <h1 class="page-title">Chef's Corner</h1>
      <div class="header-right">
        <div class="user-badge">
          <div class="user-avatar-mini">{{ getUserInitials() }}</div>
          <div class="user-id">{{ currentUserChefId || 'Loading...' }}</div>
        </div>
        <div class="global-menu">
          <button class="three-dots" @click="toggleGlobalMenu">⋮</button>
          <div v-if="showGlobalMenu" class="dropdown-global">
            <div class="dropdown-item" @click="$router.push('/settings')">⚙️ Settings</div>
            <div class="dropdown-item" @click="showMyProfile">👤 My Profile</div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" @click="exportChats">📥 Export Chats</div>
            <div class="dropdown-item" @click="clearAllChats">🗑️ Clear All Chats</div>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-system">
      <!-- Contacts Sidebar -->
      <div class="contacts-sidebar" :class="{ 'mobile-hidden': selectedConversation && isMobile }">
        <div class="sidebar-header">
          <h3>Messages</h3>
          <button class="new-chat-btn" @click="showNewChatModal = true">+ New</button>
        </div>
        <div class="search-contacts">
          <input type="text" v-model="contactSearch" placeholder="Search contacts..." class="search-input">
        </div>
        <div class="contacts-list">
          <div v-for="conv in filteredConversations" :key="conv.id" class="contact-item" :class="{ active: selectedConversation?.id === conv.id }" @click="selectConversation(conv)">
            <div class="contact-avatar">{{ getInitials(conv.otherParticipant?.full_name || conv.otherParticipant?.username) }}</div>
            <div class="contact-info">
              <div class="contact-name">{{ conv.otherParticipant?.full_name || conv.otherParticipant?.username }}</div>
              <div class="contact-last-msg">{{ conv.last_message || 'Tap to chat' }}</div>
            </div>
            <div class="contact-meta">
              <span class="contact-time">{{ formatTime(conv.last_message_time) }}</span>
              <span v-if="conv.unreadCount" class="unread-badge">{{ conv.unreadCount }}</span>
            </div>
          </div>
          <div v-if="filteredConversations.length === 0" class="no-contacts">
            <p>No conversations yet</p>
            <p class="small">Click "New" to start chatting</p>
          </div>
        </div>
      </div>

      <!-- Chat Area -->
  
    </div>

    <!-- New Chat Modal -->
    <div v-if="showNewChatModal" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <h3>Start New Chat</h3>
        <input type="text" v-model="chefIdSearch" placeholder="Enter Chef ID (starts with 02)" class="chef-id-input" maxlength="12">
        <button @click="searchChef" class="search-btn" :disabled="chefIdSearch.length < 10">Search</button>
        <div v-if="searchedChef" class="search-result">
          <div class="result-avatar">{{ getInitials(searchedChef.full_name || searchedChef.username) }}</div>
          <div class="result-info">
            <div class="result-name">{{ searchedChef.full_name || searchedChef.username }}</div>
            <div class="result-id">{{ searchedChef.chef_id }}</div>
          </div>
          <button @click="startChat" class="start-btn">Message</button>
        </div>
        <div v-if="chefNotFound" class="not-found">❌ Chef not found</div>
        <button class="close-modal" @click="closeModal">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const currentUserId = ref(null)
const currentUserChefId = ref(null)
const conversations = ref([])
const selectedConversation = ref(null)
const contactSearch = ref('')
const isMobile = ref(window.innerWidth <= 768)
const showGlobalMenu = ref(false)
const showNewChatModal = ref(false)
const chefIdSearch = ref('')
const searchedChef = ref(null)
const chefNotFound = ref(false)

const filteredConversations = computed(() => {
  if (!contactSearch.value) return conversations.value
  return conversations.value.filter(c => 
    (c.otherParticipant?.full_name || c.otherParticipant?.username).toLowerCase().includes(contactSearch.value.toLowerCase())
  )
})

const getUserInitials = () => {
  const name = authStore.profile?.display_name || authStore.profile?.full_name
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

const getInitials = (name) => {
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000) return date.toLocaleDateString([], { weekday: 'short' })
  return date.toLocaleDateString()
}

const toggleGlobalMenu = () => {
  showGlobalMenu.value = !showGlobalMenu.value
}

const showMyProfile = () => {
  router.push(`/chef-messaging-profile/${currentUserId.value}`)
}

const exportChats = () => {
  const exportData = JSON.stringify(conversations.value, null, 2)
  const blob = new Blob([exportData], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `chats_export_${Date.now()}.json`
  link.click()
  showGlobalMenu.value = false
}

const clearAllChats = () => {
  if (confirm('Clear ALL chats? This cannot be undone.')) {
    alert('All chats cleared')
    showGlobalMenu.value = false
  }
}

const loadConversations = async () => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      participant1:chef_profiles!conversations_participant1_id_fkey(*),
      participant2:chef_profiles!conversations_participant2_id_fkey(*)
    `)
    .or(`participant1_id.eq.${currentUserId.value},participant2_id.eq.${currentUserId.value}`)
    .order('last_message_time', { ascending: false })
  
  if (!error && data) {
    const processed = []
    for (const conv of data) {
      const other = conv.participant1_id === currentUserId.value ? conv.participant2 : conv.participant1
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .eq('receiver_id', currentUserId.value)
        .eq('is_read', false)
      
      processed.push({
        ...conv,
        otherParticipant: other,
        unreadCount: count || 0
      })
    }
    conversations.value = processed
  }
}

const selectConversation = (conv) => {
  selectedConversation.value = conv
  if (isMobile.value) {
    // On mobile, hide sidebar
    document.querySelector('.contacts-sidebar')?.classList.add('mobile-hidden')
  }
}

const searchChef = async () => {
  const { data, error } = await supabase
    .from('chef_profiles')
    .select('*')
    .eq('chef_id', chefIdSearch.value)
    .neq('id', currentUserId.value)
    .single()
  
  if (error || !data) {
    chefNotFound.value = true
    searchedChef.value = null
  } else {
    chefNotFound.value = false
    searchedChef.value = data
  }
}

const startChat = async () => {
  // Check if conversation exists
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .or(`and(participant1_id.eq.${currentUserId.value},participant2_id.eq.${searchedChef.value.id}),and(participant1_id.eq.${searchedChef.value.id},participant2_id.eq.${currentUserId.value})`)
    .single()
  
  if (existing) {
    selectedConversation.value = existing
    closeModal()
    return
  }
  
  // Create new conversation
  const { data, error } = await supabase
    .from('conversations')
    .insert([{
      participant1_id: currentUserId.value,
      participant2_id: searchedChef.value.id
    }])
    .select()
  
  if (!error && data) {
    await loadConversations()
    selectedConversation.value = data[0]
    closeModal()
  }
}

const closeModal = () => {
  showNewChatModal.value = false
  chefIdSearch.value = ''
  searchedChef.value = null
  chefNotFound.value = false
}

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  currentUserId.value = user.id
  
  // Get or create chef profile
  let { data: profile } = await supabase
    .from('chef_profiles')
    .select('*')
    .eq('id', currentUserId.value)
    .single()
  
  if (!profile) {
    const { data: newProfile } = await supabase
      .from('chef_profiles')
      .insert([{
        id: currentUserId.value,
        username: authStore.profile?.display_name || user.email?.split('@')[0],
        full_name: authStore.profile?.full_name || 'Chef'
      }])
      .select()
      .single()
    profile = newProfile
  }
  
  currentUserChefId.value = profile.chef_id
  await loadConversations()
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.chefs-corner {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #fef8f0 0%, #fff9f5 100%);
}

.clean-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid rgba(0,0,0,0.08);
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--primary);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--gray-100);
  padding: 5px 12px;
  border-radius: 30px;
}

.user-avatar-mini {
  width: 30px;
  height: 30px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 12px;
}

.user-id {
  font-size: 11px;
  font-family: monospace;
  color: var(--gray-600);
}

.global-menu {
  position: relative;
}

.three-dots {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  padding: 5px 10px;
}

.dropdown-global {
  position: absolute;
  top: 40px;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  min-width: 180px;
  z-index: 100;
}

.dropdown-item {
  padding: 10px 15px;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: var(--gray-50);
}

.dropdown-divider {
  height: 1px;
  background: var(--gray-200);
  margin: 5px 0;
}

.chat-system {
  display: flex;
  flex: 1;
  overflow: hidden;
  margin: 12px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.contacts-sidebar {
  width: 320px;
  border-right: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  background: white;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--gray-200);
}

.sidebar-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.new-chat-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
}

.search-contacts {
  padding: 12px;
  border-bottom: 1px solid var(--gray-200);
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--gray-200);
  border-radius: 25px;
  outline: none;
}

.contacts-list {
  flex: 1;
  overflow-y: auto;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid var(--gray-100);
}

.contact-item:hover {
  background: var(--gray-50);
}

.contact-item.active {
  background: rgba(255,107,53,0.08);
  border-left: 3px solid var(--primary);
}

.contact-avatar {
  width: 48px;
  height: 48px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.contact-last-msg {
  font-size: 12px;
  color: var(--gray-500);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-meta {
  text-align: right;
}

.contact-time {
  font-size: 10px;
  color: var(--gray-400);
}

.unread-badge {
  background: var(--primary);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  display: inline-block;
  margin-top: 5px;
}

.no-contacts {
  text-align: center;
  padding: 40px;
  color: var(--gray-500);
}

.small {
  font-size: 11px;
  margin-top: 5px;
}

.chat-area {
  flex: 1;
  background: #f8f9fa;
}

.chat-iframe {
  width: 100%;
  height: 100%;
}

.no-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--gray-500);
  text-align: center;
}

.no-chat-icon {
  font-size: 64px;
  margin-bottom: 15px;
  opacity: 0.4;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 24px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
}

.modal-content h3 {
  margin-bottom: 20px;
}

.chef-id-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--gray-300);
  border-radius: 12px;
  margin-bottom: 15px;
  font-family: monospace;
  font-size: 14px;
}

.search-btn {
  width: 100%;
  padding: 12px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  margin-bottom: 15px;
  cursor: pointer;
}

.search-result {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: var(--gray-50);
  border-radius: 16px;
  margin-bottom: 15px;
}

.result-avatar {
  width: 50px;
  height: 50px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 20px;
  color: white;
}

.result-info {
  flex: 1;
}

.result-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.result-id {
  font-size: 12px;
  color: var(--gray-500);
  font-family: monospace;
}

.start-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
}

.not-found {
  text-align: center;
  color: var(--danger);
  margin-bottom: 15px;
}

.close-modal {
  width: 100%;
  padding: 10px;
  background: var(--gray-100);
  border: none;
  border-radius: 12px;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 768px) {
  .contacts-sidebar {
    width: 100%;
  }
  
  .contacts-sidebar.mobile-hidden {
    display: none;
  }
  
  .chat-area.mobile-full {
    width: 100%;
  }
  
  .chat-system {
    margin: 8px;
  }
}
</style>