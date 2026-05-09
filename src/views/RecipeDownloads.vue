<template>
  <div class="recipe-downloads">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">←</button>
      <h1>My Downloaded Recipes</h1>
      <div class="menu-container">
        <button class="three-dots" @click="showMenu = !showMenu">⋮</button>
        <div v-if="showMenu" class="dropdown-menu">
          <div class="dropdown-item" @click="clearAllDownloads">
            <span>🗑️</span> Clear All
          </div>
        </div>
      </div>
    </div>


    <div class="recipes-grid">
      <div v-for="recipe in savedRecipes" :key="recipe.id" class="recipe-card">
        <div class="recipe-image">
          <img :src="recipe.image || 'https://placehold.co/300x200/FF6B35/white?text=No+Image'" :alt="recipe.title">
          <button class="remove-btn" @click="removeRecipe(recipe.id)">✕</button>
        </div>
        <div class="recipe-info">
          <h3 class="recipe-title">{{ truncateText(recipe.title, 50) }}</h3>
          <div class="recipe-meta">
            <span>⏱️ {{ recipe.readyInMinutes || 'N/A' }} min</span>
            <span>🍽️ {{ recipe.servings || 'N/A' }}</span>
          </div>
          <button class="view-btn" @click="viewRecipe(recipe)">View Recipe →</button>
        </div>
      </div>

      <div v-if="savedRecipes.length === 0" class="empty-state">
        <div class="empty-icon">📚</div>
        <h3>No saved recipes yet</h3>
        <p>Go to FlavorScout and save recipes you love!</p>
        <button class="go-search-btn" @click="goToSearch">🔍 Search Recipes</button>
      </div>
    </div>

    <!-- Recipe Details Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ selectedRecipe?.title }}</h3>
          <button class="close-modal" @click="closeModal">×</button>
        </div>
        <div class="modal-body" v-if="selectedRecipe">
          <img :src="selectedRecipe.image" :alt="selectedRecipe.title" class="modal-image">
          
          <div class="detail-stats">
            <div class="stat"><span>⏱️ Time</span><strong>{{ selectedRecipe.readyInMinutes || 'N/A' }} min</strong></div>
            <div class="stat"><span>🍽️ Servings</span><strong>{{ selectedRecipe.servings || 'N/A' }}</strong></div>
          </div>

          <div class="detail-section">
            <h4>🥗 Ingredients</h4>
            <ul class="ingredients-list">
              <li v-for="(ing, idx) in selectedRecipe.extendedIngredients" :key="idx">{{ ing.original }}</li>
            </ul>
          </div>

          <div class="detail-section">
            <h4>👨‍🍳 Instructions</h4>
            <div v-if="selectedRecipe.instructions" class="instructions-text" v-html="selectedRecipe.instructions"></div>
            <p v-else class="instructions-text">Instructions not available.</p>
          </div>

          <a :href="selectedRecipe.sourceUrl" target="_blank" class="source-link">View Full Recipe →</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const savedRecipes = ref([])
const showModal = ref(false)
const selectedRecipe = ref(null)
const showMenu = ref(false)

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const loadSavedRecipes = async () => {
  const user = authStore.user
  if (!user) return

  const { data, error } = await supabase
    .from('saved_recipes')
    .select('*')
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false })

  if (!error && data) {
    savedRecipes.value = data.map(item => ({
      id: item.recipe_id,
      title: item.recipe_title,
      image: item.recipe_image,
      readyInMinutes: item.recipe_data?.readyInMinutes,
      servings: item.recipe_data?.servings,
      extendedIngredients: item.recipe_data?.extendedIngredients,
      instructions: item.recipe_data?.instructions,
      sourceUrl: item.recipe_data?.sourceUrl,
      aggregateLikes: item.recipe_data?.aggregateLikes
    }))
  }
}

const removeRecipe = async (recipeId) => {
  if (confirm('Remove this recipe from your downloads?')) {
    const user = authStore.user
    const { error } = await supabase
      .from('saved_recipes')
      .delete()
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId.toString())

    if (!error) {
      await loadSavedRecipes()
      alert('Recipe removed')
    }
  }
}

const clearAllDownloads = async () => {
  if (confirm('Remove ALL downloaded recipes? This cannot be undone.')) {
    const user = authStore.user
    const { error } = await supabase
      .from('saved_recipes')
      .delete()
      .eq('user_id', user.id)

    if (!error) {
      await loadSavedRecipes()
      alert('All recipes cleared')
      showMenu.value = false
    }
  }
}

const viewRecipe = (recipe) => {
  selectedRecipe.value = recipe
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedRecipe.value = null
}

const goToSearch = () => {
  router.push('/recipe-search')
}

// Close menu when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.menu-container')) {
    showMenu.value = false
  }
}

onMounted(() => {
  loadSavedRecipes()
  document.addEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.recipe-downloads {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #fef8f0 0%, #fff9f5 100%);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.back-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
}

.back-btn:hover {
  background: rgba(0,0,0,0.05);
}

.page-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--dark);
}

.menu-container {
  position: relative;
}

.three-dots {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
}

.dropdown-menu {
  position: absolute;
  top: 45px;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  min-width: 150px;
  overflow: hidden;
  z-index: 100;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.stats-banner {
  background: linear-gradient(135deg, #FF6B35, #E8551E);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: center;
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  color: white;
  display: block;
}

.stat-label {
  font-size: 14px;
  color: rgba(255,255,255,0.9);
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.recipe-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.recipe-image {
  position: relative;
  height: 160px;
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.6);
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
}

.recipe-info {
  padding: 15px;
}

.recipe-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
}

.recipe-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #888;
  margin-bottom: 12px;
}

.view-btn {
  width: 100%;
  padding: 8px;
  background: var(--gray-100);
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.view-btn:hover {
  background: var(--primary);
  color: white;
}

.empty-state {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 15px;
  opacity: 0.5;
}

.go-search-btn {
  margin-top: 20px;
  padding: 12px 24px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-container {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.detail-stats {
  display: flex;
  gap: 15px;
  padding: 15px;
}

.stat {
  flex: 1;
  text-align: center;
  padding: 10px;
  background: var(--gray-50);
  border-radius: 10px;
}

.detail-section {
  padding: 0 15px 15px;
}

.ingredients-list {
  list-style: none;
  padding: 0;
}

.ingredients-list li {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.source-link {
  display: block;
  margin: 15px;
  padding: 12px;
  text-align: center;
  background: var(--primary);
  color: white;
  text-decoration: none;
  border-radius: 10px;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 18px;
  }
  
  .stat-number {
    font-size: 28px;
  }
}
</style>