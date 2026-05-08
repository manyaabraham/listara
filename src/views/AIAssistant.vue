<template>
  <div class="ai-assistant-page">
    <!-- Fixed Header -->
    <div class="ai-header">
      <div class="header-content">
        <button class="menu-btn" @click="openSidePanel">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div class="ai-avatar">🤖</div>
        <div class="header-text">
          <h1>Abraham AI</h1>
          <p>Your Kitchen Assistant</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="action-btn" @click="clearChat">Clear</button>
        <button class="action-btn back-btn" @click="goBack">←</button>
      </div>
    </div>

    <!-- Scrollable Chat Messages -->
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
        <div class="message-avatar">{{ msg.role === 'user' ? getUserInitials() : '🤖' }}</div>
        <div class="message-bubble" 
             @contextmenu.prevent="showContextMenu($event, index)"
             @touchstart="startLongPress(index)"
             @touchend="cancelLongPress"
             @touchmove="cancelLongPress">
          <div class="message-text">{{ msg.content }}</div>
          <div class="message-time">{{ msg.time }}</div>
        </div>
      </div>
      <div v-if="loading" class="message assistant">
        <div class="message-avatar">🤖</div>
        <div class="message-bubble typing">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <div v-if="contextMenuVisible" class="context-menu" :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }">
      <div class="context-item" @click="deleteMessage(contextMenuIndex)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13"/>
        </svg>
        <span>Delete Message</span>
      </div>
    </div>

    <!-- Fixed Input Area - NOW VISIBLE -->
    <div class="chat-input-area">
      <input 
        type="text" 
        v-model="userInput" 
        @keypress.enter="sendMessage"
        placeholder="Ask me about recipes, cooking tips, or kitchen organization..."
        class="chat-input"
      >
      <button @click="sendMessage" class="send-btn" :disabled="!userInput.trim() || loading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useKitchenStore } from '../stores/kitchen'

const router = useRouter()
const authStore = useAuthStore()
const kitchenStore = useKitchenStore()

const userInput = ref('')
const loading = ref(false)
const messagesContainer = ref(null)
let pressTimer = null

const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextMenuIndex = ref(null)

const messages = ref([
  {
    role: 'assistant',
    content: `Hello! I am Abraham AI 🤖

I can:
• Suggest recipes based on your kitchen
• Help with cooking techniques
• Guide meal planning
• Analyze your stored ingredients

Ask me anything.`,
    time: new Date().toLocaleTimeString()
  }
])

const openSidePanel = () => {
  window.dispatchEvent(new CustomEvent('openSidePanel'))
}

const getUserInitials = () => {
  const profile = authStore.profile
  if (!profile) return 'U'
  const name = profile.display_name || profile.full_name
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const goBack = () => router.back()

const deleteMessage = (index) => {
  if (index !== null && messages.value[index]) {
    messages.value.splice(index, 1)
    contextMenuVisible.value = false
    if (messages.value.length === 0) {
      messages.value.push({
        role: 'assistant',
        content: "Chat cleared. I'm Abraham AI. What would you like to do next?",
        time: new Date().toLocaleTimeString()
      })
    }
    saveMessagesToStorage()
  }
}

const showContextMenu = (event, index) => {
  event.preventDefault()
  contextMenuIndex.value = index
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  contextMenuVisible.value = true
  
  setTimeout(() => {
    const clickHandler = () => {
      contextMenuVisible.value = false
      document.removeEventListener('click', clickHandler)
    }
    document.addEventListener('click', clickHandler, { once: true })
  }, 100)
}

const startLongPress = (index) => {
  pressTimer = setTimeout(() => {
    contextMenuIndex.value = index
    contextMenuX.value = window.innerWidth / 2
    contextMenuY.value = window.innerHeight / 2
    contextMenuVisible.value = true
    
    setTimeout(() => {
      const clickHandler = () => {
        contextMenuVisible.value = false
        document.removeEventListener('click', clickHandler)
      }
      document.addEventListener('click', clickHandler, { once: true })
    }, 100)
  }, 500)
}

const cancelLongPress = () => {
  if (pressTimer) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
}

const clearChat = () => {
  if (confirm('Clear all chat messages?')) {
    messages.value = [
      {
        role: 'assistant',
        content: "Chat cleared. I'm Abraham AI. What would you like to do next?",
        time: new Date().toLocaleTimeString()
      }
    ]
    saveMessagesToStorage()
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const saveMessagesToStorage = () => {
  localStorage.setItem('ai_chat_messages', JSON.stringify(messages.value))
}

const loadMessagesFromStorage = () => {
  const saved = localStorage.getItem('ai_chat_messages')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (parsed && parsed.length > 0) {
        messages.value = parsed
      }
    } catch (e) {
      console.error('Failed to load messages', e)
    }
  }
}

const generateSmartResponse = (input) => {
  const text = input.toLowerCase()
  const items = kitchenStore.items || []

  if (text.includes('recipe') || text.includes('cook')) {
    if (items.length === 0) {
      return "You currently have no items in your kitchen inventory. Add ingredients so I can suggest recipes tailored to you."
    }
    const ingredientList = items.slice(0, 5).map(i => i.name).join(', ')
    return `Based on your available ingredients (${ingredientList}${items.length > 5 ? '...' : ''}), you could prepare:

1. A simple stir-fry using mixed ingredients
2. A light soup combining available vegetables
3. A sautéed dish with spices

Tip: Start by heating oil, add aromatics like onions/garlic, then layer ingredients based on cooking time.`
  }

  if (text.includes('store') || text.includes('preserve')) {
    return `Food storage tips:

• Keep vegetables in a cool, dry place or fridge
• Store cooked food in airtight containers
• Label items with dates
• Use FIFO method (First In First Out)

This reduces waste and improves food safety.`
  }

  if (text.includes('plan') || text.includes('meal')) {
    return `Meal planning strategy:

1. Check your kitchen inventory
2. Prioritize perishable items
3. Plan 2–3 core meals
4. Reuse ingredients across meals

This improves efficiency and reduces cost.`
  }

  if (text.includes('kitchen') || text.includes('inventory')) {
    if (items.length === 0) {
      return "Your kitchen inventory is currently empty. Start adding items so I can assist better."
    }
    return `You currently have ${items.length} items in your kitchen.

To optimize usage:
• Group similar items
• Track expiration dates
• Plan meals around expiring items`
  }

  return `I understand you're asking about "${input}".

Here's a helpful approach:
• Break the problem into steps
• Use available ingredients efficiently
• Apply basic cooking techniques like sautéing, boiling, or roasting

If you want a more precise answer, include ingredients or a specific goal.`
}

const sendMessage = async () => {
  if (!userInput.value.trim() || loading.value) return

  const input = userInput.value

  messages.value.push({
    role: 'user',
    content: input,
    time: new Date().toLocaleTimeString()
  })

  userInput.value = ''
  await scrollToBottom()
  saveMessagesToStorage()

  loading.value = true

  setTimeout(async () => {
    const response = generateSmartResponse(input)

    messages.value.push({
      role: 'assistant',
      content: response,
      time: new Date().toLocaleTimeString()
    })

    loading.value = false
    await scrollToBottom()
    saveMessagesToStorage()
  }, 600)
}

onMounted(() => {
  loadMessagesFromStorage()
  kitchenStore.loadItems?.()
  scrollToBottom()
})

onUnmounted(() => {
  if (pressTimer) {
    clearTimeout(pressTimer)
  }
})
</script>

<style scoped>
.ai-assistant-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #fef8f0 0%, #fff9f5 100%);
  overflow: hidden;
}

/* Fixed Header */
.ai-header {
  background: linear-gradient(135deg, #fc6731, #F7A440);
  padding: 16px 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}

.menu-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.05);
}

.ai-avatar {
  width: 48px;
  height: 48px;
  background: rgba(255,255,255,0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.header-text h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.header-text p {
  font-size: 12px;
  opacity: 0.9;
  margin: 2px 0 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  padding: 8px 16px;
  border-radius: 30px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.back-btn {
  width: 36px;
  padding: 8px;
  font-size: 18px;
}

.action-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-1px);
}

/* Scrollable Chat Messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f8f9fa;
}

.chat-messages::-webkit-scrollbar {
  width: 5px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.2);
  border-radius: 10px;
}

.message {
  display: flex;
  gap: 12px;
  animation: fadeIn 0.3s ease;
}

.message.user {
  justify-content: flex-end;
}

.message.user .message-avatar {
  order: 2;
  background: var(--primary);
}

.message.user .message-bubble {
  background: var(--primary);
  color: white;
  order: 1;
  cursor: pointer;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  flex-shrink: 0;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.message-bubble:hover {
  background: #f0f0f0;
  transform: scale(1.01);
}

.message.user .message-bubble:hover {
  background: var(--primary-dark);
}

.message-text {
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-time {
  font-size: 10px;
  color: rgba(0,0,0,0.4);
  margin-top: 6px;
}

.message.user .message-time {
  color: rgba(255,255,255,0.7);
}

/* Typing Animation */
.typing {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  align-items: center;
}

.typing span {
  width: 8px;
  height: 8px;
  background: var(--gray-400);
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing span:nth-child(2) { animation-delay: 0.2s; }
.typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-10px); opacity: 1; }
}

/* Fixed Input Area - VISIBLE AT BOTTOM */
.chat-input-area {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-top: 1px solid var(--gray-200);
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--gray-300);
  border-radius: 30px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.chat-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(255,107,53,0.1);
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
  background: var(--primary-dark);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Context Menu */
.context-menu {
  position: fixed;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 170px;
  overflow: hidden;
  z-index: 2000;
  animation: menuFadeIn 0.2s ease;
}

@keyframes menuFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.context-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  color: var(--danger);
  font-size: 14px;
  font-weight: 500;
}

.context-item:hover {
  background: #ffebee;
}

.context-item svg {
  stroke: var(--danger);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 768px) {
  .ai-header {
    padding: 12px 16px;
  }
  
  .ai-avatar {
    width: 40px;
    height: 40px;
    font-size: 22px;
  }
  
  .header-text h1 {
    font-size: 18px;
  }
  
  .header-text p {
    font-size: 11px;
  }
  
  .message-bubble {
    max-width: 85%;
  }
  
  .chat-messages {
    padding: 16px;
  }
  
  .chat-input-area {
    padding: 12px 16px;
  }
  
  .action-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .menu-btn {
    width: 36px;
    height: 36px;
  }
}
</style>