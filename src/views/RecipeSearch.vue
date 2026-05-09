<template>
  <div class="recipe-search" :class="{ 'blur-active': showDropdown }">
    <!-- Google-style Header -->
<div class="google-header">
  <div class="header-left">
    <button class="back-to-dashboard" @click="goToDashboard">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    </button>
    <div class="logo-area" @click="goToHome">
       <img src="/icons/search.svg" alt="Search" class="menu-icon">
      <span class="logo-text">FlavorScout</span>
    </div>
  </div>
  <div class="header-actions">
    <div class="menu-container">
      <button class="menu-icon" @click="toggleMenu">⋮</button>
      <div v-if="showMenu" class="dropdown-menu">
        <div class="dropdown-item" @click="goToDownloads">My Downloads</div>
        <div class="dropdown-divider"></div>
        <div class="dropdown-item" @click="clearAllSearch">Clear Search</div>
      </div>
    </div>
  </div>
</div>

    <!-- Search Bar -->
    <div class="search-container">
      <div class="search-wrapper">
        <div class="search-box">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input 
            type="text" 
            v-model="searchQuery" 
            @keypress.enter="searchRecipes"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
            placeholder="Search for recipes..."
            class="search-input"
          >
          <button v-if="searchQuery" class="clear-search" @click="clearSearch">✕</button>
          <button @click="searchRecipes" class="search-btn" :disabled="loading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>
        </div>

        <!-- Search Dropdown -->
        <div v-if="showDropdown && (searchHistory.length > 0 || searchSuggestions.length > 0)" class="search-dropdown">
          <div v-if="searchHistory.length > 0" class="dropdown-section">
            <div class="dropdown-title">Recent searches</div>
            <div v-for="item in searchHistory" :key="item" class="dropdown-item" @click="selectSearch(item)">
              <span class="history-icon">🕐</span>
              <span>{{ item }}</span>
              <button class="remove-history" @click.stop="removeFromHistory(item)">✕</button>
            </div>
          </div>
          <div v-if="searchSuggestions.length > 0" class="dropdown-section">
            <div class="dropdown-title">Suggestions</div>
            <div v-for="item in searchSuggestions" :key="item" class="dropdown-item" @click="selectSearch(item)">
              <span class="suggestion-icon">🔍</span>
              <span>{{ item }}</span>
            </div>
          </div>
        </div>

        <div v-if="showDropdown" class="blur-overlay" @click="showDropdown = false"></div>

        <!-- Filters -->
        <div class="filter-options">
          <select v-model="cuisineFilter" class="filter-select" @change="searchRecipes">
            <option value="">All Cuisines</option>
            <option value="Italian">Italian</option>
            <option value="American">American</option>
            <option value="Chinese">Chinese</option>
            <option value="Indian">Indian</option>
            <option value="Mexican">Mexican</option>
            <option value="British">British</option>
            <option value="French">French</option>
            <option value="Japanese">Japanese</option>
            <option value="Greek">Greek</option>
          </select>
          
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Searching for recipes...</p>
    </div>

    <!-- Results Count -->
    <div v-else-if="searchResults.length > 0" class="results-count">
      About {{ searchResults.length }} results found
    </div>

    <!-- Search Results -->
    <div v-if="!loading && searchResults.length > 0" class="results-container">
      <div class="recipes-grid">
        <div v-for="recipe in searchResults" :key="recipe.id" class="recipe-card" @click="viewRecipeDetails(recipe)">
          <div class="recipe-image">
            <img :src="recipe.image" :alt="recipe.title">
            <span class="cuisine-tag">{{ recipe.cuisine }}</span>
            <span class="source-tag">{{ recipe.source }}</span>
            <button class="save-btn" @click.stop="saveRecipe(recipe)" :class="{ saved: isRecipeSaved(recipe.id) }">
              {{ isRecipeSaved(recipe.id) ? 'Saved' : 'Save' }}
            </button>
          </div>
          <div class="recipe-info">
            <h3 class="recipe-title">{{ recipe.title }}</h3>
            <div class="recipe-meta">
              <span>⏱️ {{ recipe.time || 'N/A' }} min</span>
              <span>🍽️ {{ recipe.servings || 'N/A' }} servings</span>
            </div>
            <div class="recipe-desc" v-if="recipe.description">
              {{ truncateText(recipe.description, 120) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-else-if="!loading && searched && searchResults.length === 0" class="no-results">
      <div class="no-results-icon">🔍</div>
      <h3>No results found</h3>
      <p>Try searching for "chicken", "pasta", "rice", or "cake"</p>
      <div class="suggestions">
        <button class="suggestion-btn" @click="searchQuery = 'chicken'; searchRecipes()">Chicken</button>
        <button class="suggestion-btn" @click="searchQuery = 'pasta'; searchRecipes()">Pasta</button>
        <button class="suggestion-btn" @click="searchQuery = 'rice'; searchRecipes()">Rice</button>
        <button class="suggestion-btn" @click="searchQuery = 'cake'; searchRecipes()">Cake</button>
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
          
          <div class="recipe-details">
            <div class="detail-stats">
              <div class="stat"><span>⏱️ Time</span><strong>{{ selectedRecipe.time || 'N/A' }} min</strong></div>
              <div class="stat"><span>🍽️ Servings</span><strong>{{ selectedRecipe.servings || 'N/A' }}</strong></div>
              <div class="stat"><span>🌍 Cuisine</span><strong>{{ selectedRecipe.cuisine }}</strong></div>
              <div class="stat"><span>📡 Source</span><strong>{{ selectedRecipe.source }}</strong></div>
            </div>

            <div class="detail-section">
              <h4>Ingredients</h4>
              <ul class="ingredients-list">
                <li v-for="(ing, idx) in selectedRecipe.ingredients" :key="idx">{{ ing }}</li>
              </ul>
            </div>

            <div class="detail-section">
              <h4>Instructions</h4>
              <div class="instructions-text">{{ selectedRecipe.instructions || 'Instructions not available.' }}</div>
            </div>

            <div class="modal-actions">
              <button class="save-recipe-btn" @click="saveRecipe(selectedRecipe)" :class="{ saved: isRecipeSaved(selectedRecipe.id) }">
                {{ isRecipeSaved(selectedRecipe.id) ? 'Saved to Library' : 'Save to Library' }}
              </button>
              <a v-if="selectedRecipe.sourceUrl" :href="selectedRecipe.sourceUrl" target="_blank" class="source-link">View Original Source →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// State
const searchQuery = ref('')
const cuisineFilter = ref('')
const sourceFilter = ref('all')
const loading = ref(false)
const searched = ref(false)
const searchResults = ref([])
const savedRecipes = ref([])
const showModal = ref(false)
const selectedRecipe = ref(null)
const showMenu = ref(false)
const showDropdown = ref(false)
const searchHistory = ref([])
const searchSuggestions = ref([])
const goToDashboard = () => {
  router.push('/dashboard')
}

// Spoonacular API Key from .env (optional)
const SPOONACULAR_API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY || ''

// Load search history
const loadSearchHistory = () => {
  const history = localStorage.getItem('flavorscout_history')
  if (history) searchHistory.value = JSON.parse(history)
}

const saveSearchHistory = () => {
  localStorage.setItem('flavorscout_history', JSON.stringify(searchHistory.value))
}

const addToHistory = (query) => {
  if (!query.trim()) return
  const index = searchHistory.value.indexOf(query)
  if (index !== -1) searchHistory.value.splice(index, 1)
  searchHistory.value.unshift(query)
  if (searchHistory.value.length > 10) searchHistory.value.pop()
  saveSearchHistory()
}

const removeFromHistory = (item) => {
  const index = searchHistory.value.indexOf(item)
  if (index !== -1) searchHistory.value.splice(index, 1)
  saveSearchHistory()
}

const selectSearch = (query) => {
  searchQuery.value = query
  showDropdown.value = false
  searchRecipes()
}

// Get suggestions
const getSuggestions = () => {
  if (!searchQuery.value.trim()) {
    searchSuggestions.value = []
    return
  }
  const allSuggestions = [
    'chicken', 'pasta', 'rice', 'cake', 'soup', 'salad', 'pizza',
    'burger', 'curry', 'tacos', 'bread', 'cookies', 'fish', 'vegetables',
    'beef', 'pork', 'lamb', 'seafood', 'noodles', 'stir fry'
  ]
  const query = searchQuery.value.toLowerCase()
  searchSuggestions.value = allSuggestions.filter(s => s.toLowerCase().includes(query) && !searchHistory.value.includes(s)).slice(0, 5)
}

watch(searchQuery, () => getSuggestions())

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const toggleMenu = () => { showMenu.value = !showMenu.value }
const goToDownloads = () => { router.push('/recipe-downloads'); showMenu.value = false }
const goToHome = () => { router.push('/dashboard') }

const clearAllSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  searchHistory.value = []
  searched.value = false
  localStorage.removeItem('flavorscout_history')
  showMenu.value = false
}

const handleInputFocus = () => { showDropdown.value = true }
const handleInputBlur = () => { setTimeout(() => { showDropdown.value = false }, 200) }

// Search from TheMealDB (Free, no API key needed)
const searchTheMealDB = async (query) => {
  try {
    const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
    const response = await axios.get(url)
    
    if (response.data && response.data.meals) {
      return response.data.meals.map(meal => {
        const ingredients = []
        for (let i = 1; i <= 20; i++) {
          const ingredient = meal[`strIngredient${i}`]
          const measure = meal[`strMeasure${i}`]
          if (ingredient && ingredient.trim()) {
            ingredients.push(`${measure} ${ingredient}`.trim())
          }
        }
        
        return {
          id: `themealdb_${meal.idMeal}`,
          title: meal.strMeal,
          cuisine: meal.strArea || 'International',
          time: 'N/A',
          servings: 'N/A',
          ingredients: ingredients,
          instructions: meal.strInstructions || 'Instructions not available.',
          image: meal.strMealThumb,
          sourceUrl: meal.strSource || `https://www.themealdb.com/meal/${meal.idMeal}`,
          description: `A delicious ${meal.strArea || ''} dish made with ${ingredients.slice(0, 3).join(', ')}.`,
          source: 'TheMealDB'
        }
      })
    }
  } catch (error) {
    console.error('TheMealDB error:', error)
  }
  return []
}

// Search from Spoonacular (requires API key)
const searchSpoonacular = async (query) => {
  if (!SPOONACULAR_API_KEY) return []
  
  try {
    let url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&number=20&addRecipeInformation=true`
    if (query) url += `&query=${encodeURIComponent(query)}`
    if (cuisineFilter.value && cuisineFilter.value !== 'African') url += `&cuisine=${encodeURIComponent(cuisineFilter.value)}`
    
    const response = await axios.get(url)
    
    if (response.data && response.data.results) {
      return response.data.results.map(recipe => ({
        id: `spoon_${recipe.id}`,
        title: recipe.title,
        cuisine: recipe.cuisines?.[0] || 'Various',
        time: recipe.readyInMinutes || 'N/A',
        servings: recipe.servings || 'N/A',
        ingredients: recipe.extendedIngredients?.map(i => i.original) || [],
        instructions: recipe.instructions || 'Instructions not available.',
        image: recipe.image,
        sourceUrl: recipe.sourceUrl,
        description: recipe.summary?.replace(/<[^>]*>/g, '').substring(0, 200) || 'A delicious recipe from Spoonacular.',
        source: 'Spoonacular'
      }))
    }
  } catch (error) {
    console.error('Spoonacular error:', error)
  }
  return []
}

// Main search function
const searchRecipes = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    searched.value = false
    return
  }

  loading.value = true
  addToHistory(searchQuery.value)
  
  let allResults = []
  const query = searchQuery.value.trim()
  
  try {
    // Search TheMealDB (always available, free)
    if (sourceFilter.value === 'all' || sourceFilter.value === 'themealdb') {
      const themealdbResults = await searchTheMealDB(query)
      allResults = [...allResults, ...themealdbResults]
    }
    
    // Search Spoonacular (if API key exists and selected)
    if ((sourceFilter.value === 'all' || sourceFilter.value === 'spoonacular') && SPOONACULAR_API_KEY) {
      const spoonacularResults = await searchSpoonacular(query)
      allResults = [...allResults, ...spoonacularResults]
    }
    
    // Filter by cuisine if selected
    if (cuisineFilter.value && cuisineFilter.value !== 'All Cuisines') {
      allResults = allResults.filter(recipe => 
        recipe.cuisine?.toLowerCase() === cuisineFilter.value.toLowerCase()
      )
    }
    
    // Remove duplicates by title
    const uniqueResults = []
    const titles = new Set()
    for (const recipe of allResults) {
      if (!titles.has(recipe.title.toLowerCase())) {
        titles.add(recipe.title.toLowerCase())
        uniqueResults.push(recipe)
      }
    }
    
    searchResults.value = uniqueResults
    searched.value = true
  } catch (error) {
    console.error('Search error:', error)
    searchResults.value = []
    searched.value = true
  } finally {
    loading.value = false
    showDropdown.value = false
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  searched.value = false
}

// Save recipe to Supabase
const loadSavedRecipes = async () => {
  const user = authStore.user
  if (!user) return
  const { data, error } = await supabase.from('saved_recipes').select('recipe_id').eq('user_id', user.id)
  if (!error && data) savedRecipes.value = data.map(item => item.recipe_id)
}

const saveRecipe = async (recipe) => {
  const user = authStore.user
  if (!user) { alert('Please login to save recipes'); return }
  if (isRecipeSaved(recipe.id)) { alert('Recipe already saved!'); return }
  
  const { error } = await supabase.from('saved_recipes').insert([{
    user_id: user.id,
    recipe_id: recipe.id.toString(),
    recipe_title: recipe.title,
    recipe_image: recipe.image,
    recipe_data: {
      time: recipe.time,
      servings: recipe.servings,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      cuisine: recipe.cuisine,
      sourceUrl: recipe.sourceUrl,
      description: recipe.description,
      source: recipe.source
    },
    saved_at: new Date()
  }])
  
  if (!error) { await loadSavedRecipes(); alert('Recipe saved!') }
  else alert('Error saving recipe: ' + error.message)
}

const isRecipeSaved = (recipeId) => savedRecipes.value.includes(recipeId.toString())

const viewRecipeDetails = (recipe) => {
  selectedRecipe.value = recipe
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedRecipe.value = null
}

onMounted(() => {
  loadSavedRecipes()
  loadSearchHistory()
  searchResults.value = []
  searched.value = false
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.recipe-search {
  min-height: 100vh;
  background: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Google-style Header */
.google-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 30px;
  border-bottom: 1px solid #eaecef;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 22px;
  font-weight: 500;
  color: #FF6B35;
}

.menu-icon {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

.menu-icon:hover {
  background: #f1f3f4;
}

.dropdown-menu {
  position: absolute;
  top: 50px;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  min-width: 160px;
  overflow: hidden;
  z-index: 100;
}

.dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f1f3f4;
}

.dropdown-divider {
  height: 1px;
  background: #eaecef;
  margin: 4px 0;
}

/* Search Container */
.search-container {
  padding: 20px 30px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.search-wrapper {
  position: relative;
}

.search-box {
  display: flex;
  align-items: center;
  border: 1px solid #dfe1e5;
  border-radius: 24px;
  padding: 8px 16px;
  background: white;
  transition: box-shadow 0.2s;
}

.search-box:focus-within {
  box-shadow: 0 1px 6px rgba(0,0,0,0.1);
  border-color: transparent;
}

.search-icon {
  margin-right: 12px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  padding: 8px 0;
  background: transparent;
}

.clear-search {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #70757a;
  padding: 0 8px;
}

.search-btn {
  background: #FF6B35;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Search Dropdown */
.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  margin-top: 8px;
  z-index: 1000;
  overflow: hidden;
}

.dropdown-section {
  padding: 8px 0;
}

.dropdown-title {
  padding: 8px 16px;
  font-size: 12px;
  color: #70757a;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f1f3f4;
}

.history-icon, .suggestion-icon {
  font-size: 14px;
  color: #70757a;
}

.remove-history {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #70757a;
  padding: 0 4px;
}

/* Filter Options */
.filter-options {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 8px 16px;
  border: 1px solid #dfe1e5;
  border-radius: 20px;
  background: white;
  font-size: 13px;
  cursor: pointer;
}

.filter-select:hover {
  background: #f1f3f4;
}

/* Results Count */
.results-count {
  padding: 0 30px;
  max-width: 800px;
  margin: 16px auto 0;
  font-size: 14px;
  color: #70757a;
}

/* Results Container */
.results-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 30px 40px;
}

.recipes-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.recipe-card {
  display: flex;
  gap: 20px;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.recipe-card:hover {
  background: #f1f3f4;
}

.recipe-image {
  position: relative;
  width: 180px;
  height: 120px;
  flex-shrink: 0;
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.cuisine-tag, .source-tag {
  position: absolute;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
}

.cuisine-tag {
  top: 6px;
  left: 6px;
}

.source-tag {
  bottom: 6px;
  left: 6px;
  background: #FF6B35;
}

.save-btn {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: white;
  border: none;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 11px;
  cursor: pointer;
  font-weight: 500;
}

.save-btn.saved {
  background: #e8f5e9;
  color: #2e7d32;
}

.recipe-info {
  flex: 1;
}

.recipe-title {
  font-size: 18px;
  font-weight: 500;
  color: #1a0dab;
  margin-bottom: 8px;
}

.recipe-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #70757a;
  margin-bottom: 8px;
}

.recipe-desc {
  font-size: 13px;
  color: #3c4043;
  line-height: 1.4;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f1f3f4;
  border-top-color: #FF6B35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* No Results */
.no-results {
  text-align: center;
  padding: 60px 30px;
  max-width: 600px;
  margin: 0 auto;
}

.no-results-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.no-results h3 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #202124;
}

.no-results p {
  color: #70757a;
  margin-bottom: 20px;
}

.suggestions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.suggestion-btn {
  padding: 8px 16px;
  background: #f1f3f4;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
}

.suggestion-btn:hover {
  background: #e0e0e0;
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
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-to-dashboard {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.back-to-dashboard:hover {
  background: #f1f3f4;
}

.back-to-dashboard svg {
  color: #5f6368;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eaecef;
  position: sticky;
  top: 0;
  background: white;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 500;
}

.close-modal {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #70757a;
}

.modal-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.recipe-details {
  padding: 20px;
}

.detail-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.stat {
  flex: 1;
  text-align: center;
  padding: 8px;
  background: #f1f3f4;
  border-radius: 8px;
  min-width: 100px;
}

.stat span {
  display: block;
  font-size: 11px;
  color: #70757a;
  margin-bottom: 4px;
}

.stat strong {
  font-size: 14px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h4 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #202124;
}

.ingredients-list {
  list-style: none;
  padding: 0;
}

.ingredients-list li {
  padding: 6px 0;
  border-bottom: 1px solid #eaecef;
  font-size: 13px;
}

.instructions-text {
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-line;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.save-recipe-btn, .source-link {
  flex: 1;
  padding: 10px;
  text-align: center;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.save-recipe-btn {
  background: #FF6B35;
  color: white;
  border: none;
}

.save-recipe-btn.saved {
  background: #4CAF50;
}

.source-link {
  background: #f1f3f4;
  color: #333;
  text-decoration: none;
  display: block;
}

.source-link:hover {
  background: #e0e0e0;
}

/* Responsive */
@media (max-width: 768px) {
  .google-header {
    padding: 12px 16px;
  }
  
  .logo-text {
    font-size: 18px;
  }
  
  .search-container {
    padding: 15px 16px;
  }
  
  .results-container {
    padding: 0 16px 30px;
  }
  
  .recipe-card {
    flex-direction: column;
  }
  
  .recipe-image {
    width: 100%;
    height: 200px;
  }
  
  .results-count {
    padding: 0 16px;
  }
  
  .detail-stats {
    flex-direction: column;
  }
  
  .stat {
    width: 100%;
  }
  
  .filter-options {
    flex-direction: column;
  }
  
  .filter-select {
    width: 100%;
  }
}
</style>