<template>
  <div class="chef-messaging-profile">
    <div class="profile-container">
      <!-- Back Button -->
      <button class="back-btn" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>

      <!-- Profile Picture Section -->
      <div class="profile-pic-section">
        <div class="profile-pic-wrapper" @click="isOwnProfile ? triggerFileUpload() : null">
          <div class="profile-pic">
            <img v-if="profilePictureUrl" :src="profilePictureUrl" alt="Profile Picture">
            <div v-else class="profile-pic-placeholder">
              {{ getInitials(selectedChef?.full_name) }}
            </div>
            <div v-if="isOwnProfile" class="edit-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          </div>
          <div v-if="isOwnProfile && uploading" class="uploading-overlay">
            <div class="spinner"></div>
            <span>Uploading...</span>
          </div>
          <p v-if="isOwnProfile" class="change-photo-text">Tap to change profile photo</p>
        </div>
      </div>

      <!-- Profile Info -->
      <div class="profile-info">
        <div class="info-group">
          <div class="info-label">Display Name</div>
          <div class="info-value">{{ selectedChef?.full_name || 'Chef' }}</div>
          <button v-if="isOwnProfile" class="edit-info-btn" @click="editName">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 3l4 4-7 7H10v-4l7-7z"/>
            </svg>
            Edit
          </button>
        </div>

        <div class="info-group">
          <div class="info-label">Chef ID</div>
          <div class="info-value chef-id-value">
            {{ selectedChef?.chef_id || 'Loading...' }}
            <button class="copy-id-btn" @click="copyChefId" title="Copy Chef ID">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="info-group">
          <div class="info-label">Email</div>
          <div class="info-value">{{ selectedChef?.email || authStore.user?.email }}</div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button v-if="isOwnProfile" class="account-settings-btn" @click="goToAccountSettings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          Account Settings
        </button>
      </div>
    </div>

    <!-- Edit Name Modal -->
    <div v-if="showNameModal" class="modal-overlay" @click.self="closeNameModal">
      <div class="edit-modal">
        <div class="modal-header">
          <h3>Edit Display Name</h3>
          <button class="close-modal" @click="closeNameModal">×</button>
        </div>
        <div class="modal-body">
          <input 
            type="text" 
            v-model="editNameValue" 
            placeholder="Enter your display name"
            class="edit-input"
            autofocus
          >
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeNameModal">Cancel</button>
          <button class="save-btn" @click="saveName" :disabled="saving">Save</button>
        </div>
      </div>
    </div>

    <!-- Hidden file input -->
    <input 
      type="file" 
      ref="fileInput" 
      accept="image/jpeg,image/png,image/jpg,image/webp" 
      style="display: none" 
      @change="uploadProfilePicture"
    >
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const selectedChef = ref(null)
const isOwnProfile = ref(false)
const fileInput = ref(null)
const showNameModal = ref(false)
const editNameValue = ref('')
const saving = ref(false)
const uploading = ref(false)
const profilePictureUrl = ref('')

const getInitials = (name) => {
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

const copyChefId = () => {
  if (selectedChef.value?.chef_id) {
    navigator.clipboard.writeText(selectedChef.value.chef_id)
    alert('Chef ID copied to clipboard!')
  }
}

const triggerFileUpload = () => {
  fileInput.value.click()
}

const uploadProfilePicture = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    alert('Please select a valid image file (JPEG, PNG, or WEBP)')
    return
  }
  
  if (file.size > 2 * 1024 * 1024) {
    alert('Image size must be less than 2MB')
    return
  }
  
  uploading.value = true
  
  try {
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileExt = file.name.split('.').pop()
    const fileName = `${selectedChef.value.id}/${timestamp}_${randomString}.${fileExt}`
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('chef-profiles')
      .upload(fileName, file)
    
    if (uploadError) {
      console.error('Upload error details:', uploadError)
      alert('Error uploading image: ' + uploadError.message)
      uploading.value = false
      return
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('chef-profiles')
      .getPublicUrl(fileName)
    
    // Update profile in database
    const { error: updateError } = await supabase
      .from('chef_profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', selectedChef.value.id)
    
    if (updateError) {
      alert('Error updating profile: ' + updateError.message)
    } else {
      profilePictureUrl.value = publicUrl
      selectedChef.value.avatar_url = publicUrl
      alert('Profile picture updated successfully!')
    }
  } catch (error) {
    console.error('Upload error:', error)
    alert('Failed to upload image. Please try again.')
  } finally {
    uploading.value = false
  }
}

const editName = () => {
  editNameValue.value = selectedChef.value?.full_name || ''
  showNameModal.value = true
}

const saveName = async () => {
  if (!editNameValue.value.trim()) {
    alert('Please enter a display name')
    return
  }
  
  saving.value = true
  
  const { error } = await supabase
    .from('chef_profiles')
    .update({ full_name: editNameValue.value.trim() })
    .eq('id', selectedChef.value.id)
  
  if (error) {
    alert('Error saving name: ' + error.message)
  } else {
    selectedChef.value.full_name = editNameValue.value.trim()
    closeNameModal()
    alert('Display name updated successfully!')
  }
  
  saving.value = false
}

const closeNameModal = () => {
  showNameModal.value = false
  editNameValue.value = ''
}

const goToAccountSettings = () => {
  router.push('/chef-account-settings')
}

const loadProfileData = async () => {
  const profileId = route.params.id
  const currentUserId = authStore.user?.id
  
  isOwnProfile.value = profileId === currentUserId
  
  const { data: profileData, error: profileError } = await supabase
    .from('chef_profiles')
    .select('*')
    .eq('id', profileId)
    .single()
  
  if (profileError) {
    console.error('Error loading profile:', profileError)
    return
  }
  
  if (profileData) {
    selectedChef.value = profileData
    profilePictureUrl.value = profileData.avatar_url || ''
  }
}

onMounted(() => {
  loadProfileData()
})
</script>

<style scoped>
.chef-messaging-profile {
  min-height: 100vh;
  background: linear-gradient(135deg, #fef8f0 0%, #fff9f5 100%);
}

.profile-container {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  min-height: 100vh;
  position: relative;
}

.back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0,0,0,0.5);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
  z-index: 10;
}

.back-btn:hover {
  background: rgba(0,0,0,0.7);
}

/* Profile Picture Section */
.profile-pic-section {
  display: flex;
  justify-content: center;
  padding: 80px 20px 40px;
  background: linear-gradient(135deg, #fc6731, #F7A440);
}

.profile-pic-wrapper {
  text-align: center;
  cursor: pointer;
  position: relative;
}

.profile-pic {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto;
}

.profile-pic img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.profile-pic-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56px;
  font-weight: bold;
  color: white;
  border: 4px solid white;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.edit-icon {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: #25D366;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  color: white;
}

.uploading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: white;
  font-size: 12px;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.change-photo-text {
  margin-top: 12px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  opacity: 0.9;
}

/* Profile Info */
.profile-info {
  padding: 20px;
}

.info-group {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-label {
  width: 110px;
  font-size: 14px;
  color: #8e8e8e;
}

.info-value {
  flex: 1;
  font-size: 16px;
  color: #1a1a1a;
}

.chef-id-value {
  font-family: monospace;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-id-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.copy-id-btn:hover {
  background: #f0f0f0;
}

.edit-info-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 13px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.2s;
}

.edit-info-btn:hover {
  background: rgba(255,107,53,0.1);
}

/* Action Buttons */
.action-buttons {
  padding: 20px;
}

.account-settings-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: #f0f0f0;
  color: #1a1a1a;
}

.account-settings-btn:hover {
  background: #e0e0e0;
}

/* Modal */
.modal-overlay {
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

.edit-modal {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
}

.close-modal {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.edit-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 14px;
  outline: none;
}

.edit-input:focus {
  border-color: var(--primary);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #f0f0f0;
}

.cancel-btn, .save-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.save-btn {
  background: var(--primary);
  color: white;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-pic {
    width: 120px;
    height: 120px;
  }
  
  .profile-pic-placeholder {
    font-size: 48px;
  }
  
  .info-group {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .info-label {
    width: 100%;
  }
  
  .edit-info-btn {
    margin-left: auto;
  }
}
</style>