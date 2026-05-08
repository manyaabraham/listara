<template>
  <div class="recipes-page">
    <!-- Hero Chef Banner -->
    <div class="chef-banner">
      <div class="banner-content">
        <div class="chef-avatar">
          🍳
        </div>
        <div class="chef-greeting">
          <h1 class="chef-title">Recipe Studio</h1>
          <p class="chef-subtitle">
            <span class="chef-title-prefix">Chef</span> 
            discover and create amazing dishes
          </p>
        </div>
        <div class="banner-stats">
          <div class="banner-stat">
            <span class="stat-number">{{ recipes.length }}</span>
            <span class="stat-label">Recipes</span>
          </div>
          <div class="banner-stat">
            <span class="stat-number">{{ recommendedRecipes.length }}</span>
            <span class="stat-label">Available Now</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="action-bar">
      <button class="action-btn primary" @click="openAddModal">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        <span>Add Recipe</span>
      </button>
      <button class="action-btn" @click="showRecommendations = !showRecommendations">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0z"/>
          <path d="M12 8v4l2 2"/>
        </svg>
        <span>AI Recommendations</span>
      </button>
    </div>

    <!-- AI Recommendations Section -->
    <div v-if="showRecommendations" class="recommendations-section">
      <div class="section-header">
        <div class="header-left">
          <span class="ai-icon">🧠</span>
          <h3>What You Can Cook Today</h3>
          <span class="ai-badge">AI-Powered</span>
        </div>
        <p class="recommendation-desc">Based on {{ kitchenStore.items.length }} ingredients in your kitchen</p>
      </div>
      
      <div class="recommendations-grid">
        <div v-for="recipe in recommendedRecipes" :key="recipe.id" class="recommendation-card" @click="viewRecipe(recipe)">
          <div class="card-badge" v-if="recipe.matchPercentage >= 80">🔥 Best Match</div>
          <div class="card-badge partial" v-else-if="recipe.matchPercentage >= 50">📋 Partial</div>
          <div class="card-image">
            <img :src="recipe.image_url || '/default-recipe.jpg'" :alt="recipe.title">
          </div>
          <div class="card-content">
            <h4>{{ recipe.title }}</h4>
            <div class="match-indicator">
              <div class="match-bar">
                <div class="match-fill" :style="{ width: recipe.matchPercentage + '%' }"></div>
              </div>
              <span class="match-text">{{ recipe.matchPercentage }}% ingredients available</span>
            </div>
            <div class="missing-ingredients" v-if="recipe.missingIngredients?.length">
              <span class="missing-label">Need: {{ recipe.missingIngredients.slice(0, 3).join(', ') }}</span>
            </div>
          </div>
        </div>
        <div v-if="recommendedRecipes.length === 0" class="empty-recommendations">
          <span>🍽️</span>
          <p>Add more ingredients to get recipe recommendations</p>
        </div>
      </div>
    </div>

    <!-- Search & Filter Section -->
    <div class="search-filter-section">
      <div class="search-container">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search recipes by name or ingredient..." 
          class="search-input"
        >
        <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">×</button>
      </div>
      
      <div class="filter-scroll">
        <button 
          v-for="filter in filters" 
          :key="filter.value"
          :class="['filter-chip', { active: currentFilter === filter.value }]"
          @click="currentFilter = filter.value"
        >
          <span class="filter-icon">{{ filter.icon }}</span>
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Recipes Grid -->
    <div class="recipes-grid">
      <div 
        v-for="recipe in filteredRecipes" 
        :key="recipe.id"
        class="recipe-card"
        @click="viewRecipe(recipe)"
      >
        <div class="card-glow"></div>
        <div class="recipe-image">
          <img :src="recipe.image_url || '/default-recipe.jpg'" :alt="recipe.title">
          <div class="recipe-overlay">
            <button class="quick-view">View Recipe</button>
          </div>
        </div>
        <div class="recipe-content">
          <h3 class="recipe-title">{{ recipe.title }}</h3>
          <div class="recipe-meta">
            <div class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0z"/>
                <path d="M12 8v4l2 2"/>
              </svg>
              <span>{{ recipe.cooking_time || '30' }} min</span>
            </div>
            <div class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span>{{ recipe.ingredients?.length || 0 }} ingredients</span>
            </div>
          </div>
          <div class="recipe-actions">
            <button class="action-icon-btn" @click.stop="toggleFavorite(recipe)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
            <button class="action-icon-btn" @click.stop="quickCook(recipe)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 12h20M12 2v20"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredRecipes.length === 0" class="empty-state-card">
        <div class="empty-icon">📖</div>
        <h3>No recipes found</h3>
        <p>Add your first recipe to get started</p>
        <button class="btn-primary" @click="openAddModal">Create Your First Recipe</button>
      </div>
    </div>

    <!-- Recipe Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
      <div class="modal-container detail-modal">
        <div class="modal-header">
          <h3>{{ selectedRecipe?.title }}</h3>
          <button class="close-btn" @click="closeDetailModal">×</button>
        </div>
        <div class="recipe-detail-content" v-if="selectedRecipe">
          <div class="detail-image">
            <img :src="selectedRecipe.image_url || '/default-recipe.jpg'" :alt="selectedRecipe.title">
          </div>
          
          <div class="detail-section">
            <h4>🛒 Ingredients</h4>
            <ul class="ingredients-list">
              <li v-for="(ingredient, idx) in selectedRecipe.ingredients" :key="idx" 
                  :class="{ 'available': isIngredientAvailable(ingredient) }">
                <span class="check-mark" v-if="isIngredientAvailable(ingredient)">✓</span>
                <span class="check-mark missing" v-else>✗</span>
                {{ ingredient }}
              </li>
            </ul>
          </div>
          
          <div class="detail-section">
            <h4>👨‍🍳 Instructions</h4>
            <ol class="instructions-list">
              <li v-for="(step, idx) in selectedRecipe.instructions" :key="idx">{{ step }}</li>
            </ol>
          </div>
          
          <div class="detail-section" v-if="selectedRecipe.notes">
            <h4>📝 Notes</h4>
            <p>{{ selectedRecipe.notes }}</p>
          </div>
          
          <div class="modal-actions">
            <button class="btn-cancel" @click="closeDetailModal">Close</button>
            <button class="btn-submit" @click="cookThisRecipe">Start Cooking</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Recipe Modal -->
    <div v-if="showAddEditModal" class="modal-overlay" @click.self="closeAddEditModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Edit Recipe' : 'Add New Recipe' }}</h3>
          <button class="close-btn" @click="closeAddEditModal">×</button>
        </div>
        <form @submit.prevent="saveRecipe" class="modal-form">
          <div class="form-group">
            <label>Recipe Title *</label>
            <input type="text" v-model="formData.title" required placeholder="e.g., Spaghetti Carbonara" class="form-input">
          </div>
          
          <div class="form-group">
            <label>Image URL</label>
            <input type="url" v-model="formData.image_url" placeholder="https://example.com/image.jpg" class="form-input">
          </div>
          
          <div class="form-group">
            <label>Ingredients * (one per line)</label>
            <textarea v-model="ingredientsText" rows="5" placeholder="2 cups flour&#10;1 cup sugar&#10;3 eggs" required class="form-input"></textarea>
          </div>
          
          <div class="form-group">
            <label>Instructions * (one per line)</label>
            <textarea v-model="instructionsText" rows="6" placeholder="Preheat oven to 350°F&#10;Mix dry ingredients&#10;Bake for 30 minutes" required class="form-input"></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Cooking Time (minutes)</label>
              <input type="number" v-model="formData.cooking_time" class="form-input">
            </div>
            <div class="form-group">
              <label>Servings</label>
              <input type="number" v-model="formData.servings" class="form-input">
            </div>
          </div>
          
          <div class="form-group">
            <label>Notes (optional)</label>
            <textarea v-model="formData.notes" rows="2" placeholder="Tips or additional notes..." class="form-input"></textarea>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeAddEditModal">Cancel</button>
            <button type="submit" class="btn-submit">{{ isEditing ? 'Update Recipe' : 'Add Recipe' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../stores/auth'
import { useKitchenStore } from '../stores/kitchen'

const router = useRouter()
const authStore = useAuthStore()
const kitchenStore = useKitchenStore()

// State
const recipes = ref([])
const searchQuery = ref('')
const currentFilter = ref('all')
const showDetailModal = ref(false)
const showAddEditModal = ref(false)
const showRecommendations = ref(false)
const selectedRecipe = ref(null)
const isEditing = ref(false)

const formData = ref({
  id: null,
  title: '',
  image_url: '',
  ingredients: [],
  instructions: [],
  cooking_time: 30,
  servings: 4,
  notes: '',
  user_id: null
})

const ingredientsText = ref('')
const instructionsText = ref('')

// Filters
const filters = [
  { value: 'all', label: 'All Recipes', icon: '🍽️' },
  { value: 'breakfast', label: 'Breakfast', icon: '🥞' },
  { value: 'lunch', label: 'Lunch', icon: '🥗' },
  { value: 'dinner', label: 'Dinner', icon: '🍝' },
  { value: 'dessert', label: 'Dessert', icon: '🍰' }
]

// Computed
const filteredRecipes = computed(() => {
  let items = [...recipes.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(recipe => 
      recipe.title.toLowerCase().includes(query) ||
      recipe.ingredients?.some(i => i.toLowerCase().includes(query))
    )
  }
  
  return items
})

const recommendedRecipes = computed(() => {
  const kitchenItems = kitchenStore.items.map(i => i.name.toLowerCase())
  
  return recipes.value.map(recipe => {
    const recipeIngredients = recipe.ingredients?.map(i => i.toLowerCase()) || []
    const availableIngredients = recipeIngredients.filter(ing => 
      kitchenItems.some(kitchenItem => kitchenItem.includes(ing) || ing.includes(kitchenItem))
    )
    const matchPercentage = Math.round((availableIngredients.length / recipeIngredients.length) * 100)
    
    const missingIngredients = recipeIngredients
      .filter(ing => !kitchenItems.some(kitchenItem => kitchenItem.includes(ing) || ing.includes(kitchenItem)))
      .slice(0, 5)
    
    return {
      ...recipe,
      matchPercentage,
      missingIngredients,
      availableCount: availableIngredients.length,
      totalCount: recipeIngredients.length
    }
  })
  .filter(recipe => recipe.matchPercentage > 0)
  .sort((a, b) => b.matchPercentage - a.matchPercentage)
  .slice(0, 6)
})

// Load recipes from database
const loadRecipes = async () => {
  const { data, error } = await supabase
    .from('saved_recipes')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (!error && data) {
    recipes.value = data.map(recipe => ({
      id: recipe.id,
      title: recipe.recipe_title,
      image_url: recipe.recipe_image,
      ingredients: recipe.recipe_data?.ingredients || [],
      instructions: recipe.recipe_data?.instructions || [],
      cooking_time: recipe.recipe_data?.cooking_time,
      servings: recipe.recipe_data?.servings,
      notes: recipe.recipe_data?.notes,
      user_id: recipe.user_id
    }))
  }
}

// Add recipe to database
const addRecipe = async (recipeData) => {
  const { data, error } = await supabase
    .from('saved_recipes')
    .insert([{
      user_id: authStore.user?.id,
      recipe_id: Date.now().toString(),
      recipe_title: recipeData.title,
      recipe_image: recipeData.image_url,
      recipe_data: {
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        cooking_time: recipeData.cooking_time,
        servings: recipeData.servings,
        notes: recipeData.notes
      }
    }])
    .select()
  
  if (!error && data) {
    return data[0]
  }
  throw error
}

// Update recipe
const updateRecipe = async (id, recipeData) => {
  const { error } = await supabase
    .from('saved_recipes')
    .update({
      recipe_title: recipeData.title,
      recipe_image: recipeData.image_url,
      recipe_data: {
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        cooking_time: recipeData.cooking_time,
        servings: recipeData.servings,
        notes: recipeData.notes
      }
    })
    .eq('id', id)
  
  if (error) throw error
}

// Delete recipe
const deleteRecipe = async (id) => {
  if (confirm('Delete this recipe?')) {
    const { error } = await supabase
      .from('saved_recipes')
      .delete()
      .eq('id', id)
    
    if (!error) {
      await loadRecipes()
    }
  }
}

// Save recipe (create or update)
const saveRecipe = async () => {
  const recipeData = {
    title: formData.value.title,
    image_url: formData.value.image_url,
    ingredients: ingredientsText.value.split('\n').filter(i => i.trim()),
    instructions: instructionsText.value.split('\n').filter(i => i.trim()),
    cooking_time: formData.value.cooking_time,
    servings: formData.value.servings,
    notes: formData.value.notes
  }
  
  try {
    if (isEditing.value) {
      await updateRecipe(formData.value.id, recipeData)
    } else {
      await addRecipe(recipeData)
    }
    await loadRecipes()
    closeAddEditModal()
  } catch (error) {
    console.error('Error saving recipe:', error)
    alert('Failed to save recipe')
  }
}

// View recipe details
const viewRecipe = (recipe) => {
  selectedRecipe.value = recipe
  showDetailModal.value = true
}

// Check if ingredient is available in kitchen
const isIngredientAvailable = (ingredient) => {
  const kitchenItems = kitchenStore.items.map(i => i.name.toLowerCase())
  const ingLower = ingredient.toLowerCase()
  return kitchenItems.some(item => item.includes(ingLower) || ingLower.includes(item))
}

// Cook this recipe (mark ingredients as used)
const cookThisRecipe = async () => {
  if (selectedRecipe.value) {
    // Deduct used ingredients from kitchen inventory
    for (const ingredient of selectedRecipe.value.ingredients) {
      const kitchenItem = kitchenStore.items.find(i => 
        i.name.toLowerCase().includes(ingredient.toLowerCase()) ||
        ingredient.toLowerCase().includes(i.name.toLowerCase())
      )
      if (kitchenItem) {
        await kitchenStore.consumeItem(kitchenItem.id, 1)
      }
    }
    closeDetailModal()
    alert(`🎉 Enjoy your ${selectedRecipe.value.title}!`)
  }
}

// Toggle favorite
const toggleFavorite = (recipe) => {
  // Implement favorite functionality
  alert('Favorite feature coming soon!')
}

// Quick cook from card
const quickCook = (recipe) => {
  viewRecipe(recipe)
}

// Open add modal
const openAddModal = () => {
  formData.value = {
    id: null,
    title: '',
    image_url: '',
    ingredients: [],
    instructions: [],
    cooking_time: 30,
    servings: 4,
    notes: '',
    user_id: null
  }
  ingredientsText.value = ''
  instructionsText.value = ''
  isEditing.value = false
  showAddEditModal.value = true
}

// Close modals
const closeDetailModal = () => {
  showDetailModal.value = false
  selectedRecipe.value = null
}

const closeAddEditModal = () => {
  showAddEditModal.value = false
}

// Expose functions
if (typeof window !== 'undefined') {
  window.openAddRecipeModal = openAddModal
}

onMounted(async () => {
  await kitchenStore.loadItems()
  await loadRecipes()
})
</script>

<style scoped>
.recipes-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #fef8f0 0%, #fff9f5 100%);
}

/* Chef Banner */
.chef-banner {
  background: linear-gradient(135deg, #fc6731, #F7A440);
  border-radius: 28px;
  padding: 24px;
  margin-bottom: 24px;
  color: white;
  position: relative;
  overflow: hidden;
}

.chef-banner::before {
  content: "🍳";
  position: absolute;
  right: -20px;
  bottom: -20px;
  font-size: 120px;
  opacity: 0.1;
  pointer-events: none;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.chef-avatar {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.chef-greeting {
  flex: 1;
}

.chef-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.chef-subtitle {
  font-size: 15px;
  opacity: 0.95;
  margin: 0;
}

.chef-title-prefix {
  font-weight: 700;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 20px;
  display: inline-block;
  margin-right: 4px;
}

.banner-stats {
  display: flex;
  gap: 24px;
}

.banner-stat {
  text-align: center;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  display: block;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
}

/* Action Bar */
.action-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: var(--primary);
  color: white;
  border: none;
}

.action-btn.primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* Recommendations Section */
.recommendations-section {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.05), rgba(78, 205, 196, 0.05));
  border-radius: 24px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 107, 53, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-icon {
  font-size: 24px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.ai-badge {
  font-size: 10px;
  padding: 2px 8px;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 20px;
  color: var(--primary);
}

.recommendation-desc {
  font-size: 12px;
  color: var(--gray-500);
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.recommendation-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.recommendation-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.card-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #4CAF50;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  z-index: 1;
}

.card-badge.partial {
  background: #FF9800;
}

.card-image {
  height: 160px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.recommendation-card:hover .card-image img {
  transform: scale(1.05);
}

.card-content {
  padding: 14px;
}

.card-content h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 10px 0;
}

.match-indicator {
  margin-bottom: 8px;
}

.match-bar {
  height: 6px;
  background: var(--gray-200);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.match-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 3px;
  transition: width 0.3s;
}

.match-text {
  font-size: 11px;
  color: var(--gray-600);
}

.missing-ingredients {
  font-size: 11px;
  color: var(--gray-500);
  margin-top: 8px;
}

/* Search & Filter */
.search-filter-section {
  margin-bottom: 24px;
}

.search-container {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 20px;
  padding: 12px 16px;
  gap: 12px;
  margin-bottom: 16px;
  border: 1px solid var(--gray-200);
  transition: all 0.2s;
}

.search-container:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  background: transparent;
}

.clear-search {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--gray-400);
}

.filter-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 40px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.filter-chip.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

/* Recipes Grid */
.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.recipe-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  border: 1px solid rgba(0,0,0,0.05);
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0,0,0,0.1);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  opacity: 0;
  transition: opacity 0.3s;
}

.recipe-card:hover .card-glow {
  opacity: 1;
}

.recipe-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.recipe-card:hover .recipe-image img {
  transform: scale(1.05);
}

.recipe-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.recipe-card:hover .recipe-overlay {
  opacity: 1;
}

.quick-view {
  padding: 10px 20px;
  background: white;
  border: none;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-view:hover {
  background: var(--primary);
  color: white;
  transform: scale(1.05);
}

.recipe-content {
  padding: 16px;
}

.recipe-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 10px 0;
  color: var(--dark);
}

.recipe-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--gray-500);
}

.recipe-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid var(--gray-100);
  padding-top: 12px;
}

.action-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon-btn:hover {
  background: var(--gray-100);
}

/* Detail Modal */
.detail-modal .recipe-detail-content {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.detail-image {
  width: 100%;
  height: 250px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 20px;
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--primary);
}

.ingredients-list {
  list-style: none;
  padding: 0;
}

.ingredients-list li {
  padding: 8px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--gray-100);
}

.ingredients-list li.available {
  color: var(--success);
}

.check-mark {
  color: var(--success);
  font-weight: bold;
}

.check-mark.missing {
  color: var(--danger);
}

.instructions-list {
  padding-left: 20px;
}

.instructions-list li {
  padding: 8px 0;
  line-height: 1.5;
}

/* Empty State */
.empty-state-card {
  background: white;
  border-radius: 24px;
  padding: 60px 20px;
  text-align: center;
  grid-column: 1 / -1;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state-card h3 {
  font-size: 22px;
  margin-bottom: 8px;
}

.empty-recommendations {
  text-align: center;
  padding: 40px;
  color: var(--gray-500);
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
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--gray-200);
  position: sticky;
  top: 0;
  background: white;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
}

.modal-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--gray-300);
  border-radius: 12px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  background: var(--gray-100);
  border: none;
  border-radius: 12px;
  cursor: pointer;
}

.btn-submit, .btn-primary {
  flex: 1;
  padding: 12px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 768px) {
  .recipes-page {
    padding: 16px;
  }
  
  .chef-title {
    font-size: 22px;
  }
  
  .chef-avatar {
    width: 55px;
    height: 55px;
    font-size: 26px;
  }
  
  .recipes-grid {
    grid-template-columns: 1fr;
  }
  
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

@media (max-width: 480px) {
  .banner-content {
    flex-direction: column;
    text-align: center;
  }
  
  .banner-stats {
    justify-content: center;
  }
  
  .action-btn span {
    display: none;
  }
  
  .action-btn {
    padding: 12px;
  }
}
</style>