<template>
  <div class="dashboard">
    <!-- Hero Chef Banner -->
    <div class="chef-banner">
      <div class="banner-content">
        <div class="chef-avatar">
          {{ getUserInitials() }}
        </div>
        <div class="chef-greeting">
          <h1 class="chef-title">Welcome Back, {{ getUserFirstName() }}</h1>
          <p class="chef-subtitle">
            Here's your kitchen at a glance
          </p>
        </div>
        <div class="banner-stats">
          <div class="banner-stat">
            <span class="stat-number">{{ kitchenStore.items.length }}</span>
            <span class="stat-label">Ingredients</span>
          </div>
          <div class="banner-stat">
            <span class="stat-number">{{ lowStockCount }}</span>
            <span class="stat-label">Low Stock</span>
          </div>
          <div class="banner-stat">
            <span class="stat-number">{{ expiringCount }}</span>
            <span class="stat-label">Expiring</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Action Cards -->
    <div class="quick-actions-grid">
      <div class="quick-action-card" @click="openAddModal">
        <div class="card-icon orange">➕</div>
        <div class="card-info">
          <h4>Add Item</h4>
          <p>Add new ingredient to your pantry</p>
        </div>
      </div>
      <div class="quick-action-card" @click="goToKitchen">
        <div class="card-icon green">🍊</div>
        <div class="card-info">
          <h4>View Inventory</h4>
          <p>See all your kitchen items</p>
        </div>
      </div>
      <div class="quick-action-card" @click="goToShopping">
        <div class="card-icon purple">🛒</div>
        <div class="card-info">
          <h4>Shopping List</h4>
          <p>{{ pendingShopping.length }} items to buy</p>
        </div>
      </div>
      <div class="quick-action-card" @click="goToRecipes">
        <div class="card-icon pink">🍳</div>
        <div class="card-info">
          <h4>Recipes</h4>
          <p>Find recipes from your ingredients</p>
        </div>
      </div>
    </div>

  


      <div class="analytics-card">
        <div class="card-header">
          <div class="header-title">
            <span class="title-icon"></span>
            <h3>Shopping Status</h3>
          </div>
        </div>
        <div class="shopping-stats">
          <div class="shopping-stat">
            <div class="stat-circle">
              <span class="circle-value">{{ Math.round(getShoppingPercentage()) }}%</span>
            </div>
            <div class="stat-details">
              <span class="detail-label">Pending Items</span>
              <span class="detail-value">{{ pendingShopping.length }}</span>
            </div>
          </div>
          <div class="shopping-stat">
            <div class="stat-circle success">
              <span class="circle-value">{{ Math.round(getPurchasedPercentage()) }}%</span>
            </div>
            <div class="stat-details">
              <span class="detail-label">Purchased</span>
              <span class="detail-value">{{ purchasedItems.length }}</span>
            </div>
          </div>
        </div>
        <div class="auto-added-info"></div>
          <span>{{ autoAddedCount }} items auto-added from low stock</span>
        </div>
      </div>
    

 <!-- Analytics Grid -->
    <div class="analytics-grid">
      <div class="analytics-card">
        <div class="card-header">
          <div class="header-title">
            <span class="title-icon"></span>
            <h3>Items in Inventory by Category</h3>
          </div>
        </div>
        <div class="category-list">
          <div v-for="(count, category) in categoryDistribution" :key="category" class="category-row">
            <span class="category-name">{{ category }}</span>
            <div class="category-bar-container">
              <div class="category-bar" :style="{ width: getCategoryPercentage(count) + '%' }"></div>
            </div>
            <span class="category-count">{{ count }}</span>
          </div>
        </div>
      </div> 
</div>
    <!-- Recent Activity Row -->
    <div class="activity-row">
      <div class="activity-card">
        <div class="activity-header">
          <div class="header-left">
            <h3>Low Stock Alerts</h3>
          </div>
          <span class="alert-badge" v-if="lowStockItems.length > 0">{{ lowStockItems.length }}</span>
        </div>
        <div class="activity-list">
          <div v-for="item in lowStockItems.slice(0, 4)" :key="item.id" class="alert-row">
            <div class="alert-info">
              <div class="alert-name">{{ item.name }}</div>
              <div class="alert-category">{{ item.category }}</div>
            </div>
            <div class="alert-quantity">
              <span class="qty-warning">{{ item.quantity }}</span>
              <span class="qty-unit">{{ item.unit }}</span>
            </div>
          </div>
          <div v-if="lowStockItems.length === 0" class="empty-alert">
            All stocks are healthy
          </div>
        </div>
      </div>

      <div class="activity-card">
        <div class="activity-header">
          <div class="header-left">
            <h3>Shopping List Preview</h3>
          </div>
          <router-link to="/shopping" class="view-link">View All →</router-link>
        </div>
        <div class="activity-list">
          <div v-for="item in pendingShopping.slice(0, 4)" :key="item.id" class="shopping-row">
            <div class="shopping-info">
              <div class="shopping-name">{{ item.item_name }}</div>
              <span v-if="item.auto_added" class="auto-tag">Auto</span>
            </div>
            <div class="shopping-quantity">
              <span class="qty">{{ item.quantity }}</span>
              <span class="unit">{{ item.unit }}</span>
            </div>
          </div>
          <div v-if="pendingShopping.length === 0" class="empty-shopping">
            <span></span> Shopping list is empty
          </div>
        </div>
      </div>
    </div>
   <!-- AI Intelligence Card -->
    <div class="intelligence-card">
      <div class="intelligence-header">
        <div class="header-left">
          <span class="ai-icon"></span>
          <h3>AI Kitchen Assistant</h3>
        </div>
      </div>
      <div class="intelligence-body">
        <div class="insight-message">
          <div class="insight-quote">“</div>
          <div class="insight-text">{{ getInventoryInsight() }}</div>
          <div class="insight-quote close">”</div>
        </div>
        <div class="action-suggestions" v-if="lowStockItems.length > 0">
          <div class="suggestion-badge">
            <span>Suggestion</span>
            <span>Add {{ lowStockItems.slice(0, 3).map(i => i.name).join(', ') }} to shopping list</span>
          </div>
        </div>
      </div>
    </div>
    <!-- Pro Tip -->
    <div class="pro-tip-card">
      <div class="tip-icon"></div>
      <div class="tip-content">
        <div class="tip-title">Pro Tip</div>
        <div class="tip-text">{{ getRandomTip() }}</div>
      </div>
    </div>

    <!-- Add Item Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Add New Ingredient</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <form @submit.prevent="addNewItem" class="modal-form">
          <div class="form-group">
            <label>Ingredient Name *</label>
            <input type="text" v-model="newItem.name" required placeholder="e.g., Tomatoes, Rice, Milk" class="form-input" autofocus>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Quantity *</label>
              <input type="number" step="0.1" v-model="newItem.quantity" required placeholder="0" class="form-input">
            </div>
            <div class="form-group">
              <label>Unit</label>
              <select v-model="newItem.unit" class="form-input">
                <option value="pcs">Pieces (pcs)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="L">Liters (L)</option>
                <option value="ml">Milliliters (ml)</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Category</label>
              <select v-model="newItem.category" class="form-input">
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Meat"> Meat</option>
                <option value="Dairy"> Dairy</option>
                <option value="Grains">Grains</option>
                <option value="Spices">Spices</option>
                <option value="Other">Others</option>
              </select>
            </div>
            <div class="form-group">
              <label>Expiry Date (optional)</label>
              <input type="date" v-model="newItem.expiry_date" class="form-input">
            </div>
          </div>
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="newItem.auto_shopping">
              <span>Auto-add to shopping list when low</span>
            </label>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-submit" :disabled="adding">{{ adding ? 'Adding...' : 'Add Ingredient' }}</button>
          </div>
        </form>
      </div>
    </div>

</template>

<script setup>
import { computed, onMounted, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useKitchenStore } from '../stores/kitchen'
import { useShoppingStore } from '../stores/shopping'

const router = useRouter()
const authStore = useAuthStore()
const kitchenStore = useKitchenStore()
const shoppingStore = useShoppingStore()

const currentDate = ref('')
const showAddModal = ref(false)
const adding = ref(false)

const newItem = ref({
  name: '',
  quantity: 1,
  unit: 'pcs',
  category: 'Vegetables',
  expiry_date: '',
  auto_shopping: true
})

const lowStockItems = computed(() => kitchenStore.items.filter(i => i.status === 'low'))
const lowStockCount = computed(() => lowStockItems.value.length)
const pendingShopping = computed(() => shoppingStore.items.filter(i => i.status === 'pending'))
const purchasedItems = computed(() => shoppingStore.items.filter(i => i.status === 'purchased'))
const autoAddedCount = computed(() => shoppingStore.items.filter(i => i.auto_added === true).length)
const expiringCount = computed(() => kitchenStore.items.filter(i => isExpiringSoon(i.expiry_date)).length)

const categoryDistribution = computed(() => {
  const distribution = {}
  kitchenStore.items.forEach(item => {
    const cat = item.category || 'Other'
    distribution[cat] = (distribution[cat] || 0) + 1
  })
  return distribution
})

const getUserInitials = () => {
  const name = authStore.profile?.display_name || authStore.profile?.full_name
  if (!name) return 'user'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

const getUserFirstName = () => {
  const name = authStore.profile?.display_name || authStore.profile?.full_name
  if (!name) return 'Friend'
  return name.split(' ')[0]
}

const isExpiringSoon = (expiryDate) => {
  if (!expiryDate) return false
  const daysLeft = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
  return daysLeft <= 3 && daysLeft >= 0
}

const getCategoryPercentage = (count) => {
  const total = kitchenStore.items.length
  if (total === 0) return 0
  return (count / total) * 100
}

const getShoppingPercentage = () => {
  const total = pendingShopping.value.length + purchasedItems.value.length
  if (total === 0) return 0
  return (pendingShopping.value.length / total) * 100
}

const getPurchasedPercentage = () => {
  const total = pendingShopping.value.length + purchasedItems.value.length
  if (total === 0) return 0
  return (purchasedItems.value.length / total) * 100
}

const getInventoryInsight = () => {
  const total = kitchenStore.items.length
  if (total === 0) return "Your kitchen is empty. Start adding ingredients to get personalized insights!"
  if (lowStockCount.value > 5) return `${lowStockCount.value} items are running low. Time to restock your pantry!`
  if (lowStockCount.value > 0) return `${lowStockCount.value} ingredient${lowStockCount.value > 1 ? 's need' : ' needs'} attention. Consider adding to your shopping list.`
  if (expiringCount.value > 0) return `${expiringCount.value} item${expiringCount.value > 1 ? 's are' : ' is'} expiring soon. Plan to use them this week!`
  return "Excellent! Your kitchen is well-stocked and organized. Great job maintaining your inventory!"
}

const openAddModal = () => {
  newItem.value = {
    name: '',
    quantity: 1,
    unit: 'pcs',
    category: 'Vegetables',
    expiry_date: '',
    auto_shopping: true
  }
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  adding.value = false
}

const addNewItem = async () => {
  if (!newItem.value.name.trim()) {
    alert('Please enter an item name')
    return
  }
  if (!newItem.value.quantity || newItem.value.quantity <= 0) {
    alert('Please enter a valid quantity')
    return
  }
  
  adding.value = true
  const itemData = {
    name: newItem.value.name.trim(),
    quantity: parseFloat(newItem.value.quantity),
    unit: newItem.value.unit,
    category: newItem.value.category,
    expiry_date: newItem.value.expiry_date || null,
    auto_shopping: newItem.value.auto_shopping
  }
  
  try {
    const result = await kitchenStore.addItem(itemData)
    if (result) {
      await kitchenStore.loadItems()
      await shoppingStore.loadList()
      closeModal()
      alert(`${newItem.value.name} has been added to your kitchen!`)
    }
  } catch (error) {
    console.error('Error:', error)
    alert('Failed to add item')
  }
  adding.value = false
}

const goToKitchen = () => router.push('/kitchen')
const goToShopping = () => router.push('/shopping')
const goToRecipes = () => router.push('/recipes')

const getRandomTip = () => {
 const tips = [
  "Store fresh herbs like cilantro and parsley in a glass of water, cover with a plastic bag, and refrigerate - they'll stay fresh for up to 2 weeks",
  "Keep onions and potatoes in separate cool, dark places because onions release gases that cause potatoes to sprout faster",
  "Label all containers with the date you opened or stored them to easily track freshness and reduce food waste",
  "Use the FIFO (First In, First Out) method: place newer items behind older ones so you always use older products first",
  "Set a weekly reminder to check your pantry for expiring items and plan meals around them to avoid waste",
  "Freeze leftovers immediately in portion-sized containers or bags for quick grab-and-go meals on busy days",
  "Use clear glass or plastic storage bins in your pantry so you can see exactly what you have without rummaging",
  "Store spices away from heat, light, and moisture - a cool, dark cabinet is best to preserve their flavor and potency",
  "Keep a digital running shopping list on your phone and add items immediately when you run out or think of them",
  "Use white vinegar mixed with water to wipe down refrigerator shelves - it cleans naturally and removes odors",
  "Before grocery shopping, take 5 minutes to see what you already have and plan meals around those ingredients",
  "Install a lazy Susan in corner cabinets or deep pantry shelves to easily access items in the back without digging",
  "Store mushrooms in a paper bag instead of plastic - they need airflow to stay dry and prevent sogginess",
  "Place an open box of baking soda in your refrigerator and replace every 3 months to absorb unwanted odors",
  "Use an over-the-door shoe organizer on your pantry door for storing small items like spice packets and snacks",
  "Keep bananas separate from apples, tomatoes, and avocados - they release ethylene gas that speeds ripening",
  "Freeze bread slices separated by wax paper so you can take out individual slices without thawing the whole loaf",
  "Store dry goods like rice, pasta, and flour in airtight mason jars to keep out moisture and pantry pests",
  "Attach magnetic spice tins to your refrigerator or a metal sheet on the wall to save cabinet space",
  "Wrap celery, broccoli, and lettuce in aluminum foil before refrigerating - they stay crisp 2-3 times longer",
  "Clean your microwave by heating a bowl of water with lemon slices for 3 minutes, then easily wipe away grime",
  "Store cheese in wax paper or cheese paper instead of plastic wrap to let it breathe and prevent moisture buildup",
  "Keep a small container in your freezer for vegetable scraps to make homemade broth when it's full",
  "Sharpen your knife before each use - a sharp knife is safer and makes food prep faster and more precise",
  "Organize your refrigerator by zones: dairy on upper shelves, meats on lower shelves, vegetables in crisper drawers",
  "Measure oil and sticky ingredients like honey in the same measuring cup by spraying with non-stick spray first",
  "Keep a bowl of water near your cutting board when chopping onions to reduce eye irritation from fumes",
  "Store nuts and seeds in the refrigerator or freezer to prevent them from going rancid due to their natural oils",
  "Use a vegetable peeler to create long, thin strips of vegetables for quick salads or stir-fries",
  "Keep avocados in the refrigerator once ripe - they'll last 3-5 more days instead of becoming overripe",
  "Soak wooden cutting boards in food-grade mineral oil overnight to prevent cracking and bacterial absorption",
  "Use rubber bands to keep cookbooks open to the recipe page you're following while cooking",
  "Store ginger in the freezer and grate it frozen - it's easier to grate and lasts for months",
  "Keep a damp paper towel in your lettuce container to maintain humidity and keep leaves crisp longer",
  "Use a mesh strainer to dust powdered sugar or flour evenly over desserts and baking surfaces",
  "Store tomatoes stem-side down at room temperature - they'll ripen more evenly and stay fresh longer",
  "Keep a small bowl of salt near the stove to quickly absorb and clean up any oil splatters",
  "Use an ice cream scoop to portion out cookie dough for uniformly sized cookies that bake evenly",
  "Store fresh berries in glass jars in the refrigerator - they stay fresher longer than in plastic containers",
  "Place a wooden spoon across a boiling pot to prevent water from boiling over onto your stove",
  "Keep a kitchen thermometer in your refrigerator and freezer to ensure food stays at safe temperatures",
  "Use the back of a knife to scrape small chopped items like garlic and ginger into a paste",
  "Store coffee beans in an airtight container away from light, heat, and moisture to preserve freshness",
  "Keep a spray bottle with water and a few drops of dish soap on your counter for quick spill cleanup",
  "Use an egg slicer to quickly and uniformly slice mushrooms, strawberries, or soft cheeses",
  "Store leafy greens with a paper towel in the container to absorb excess moisture and prevent wilting",
  "Keep a small notebook in your kitchen to write down recipe modifications and what worked well",
  "Use a bench scraper to easily transfer chopped ingredients from cutting board to pot or pan",
  "Store flour in the freezer for 48 hours when you first buy it to kill any potential pantry moth eggs",
  "Keep citrus fruits at room temperature if using within a week, otherwise refrigerate for longer storage",
  "Use kitchen shears to cut pizza, snip herbs, and open food packaging - more versatile than a knife",
  "Store garlic and onions in a cool, dark, well-ventilated place - never in plastic bags which trap moisture",
  "Keep an aloe vera plant on your kitchen windowsill for instant relief from minor burns while cooking",
  "Use a microplane grater for zesting citrus, grating hard cheese, and mincing fresh ginger",
  "Store leftover tomato paste in tablespoon-sized portions in the freezer for easy use in recipes",
  "Keep a small trash bowl on your counter while prepping to collect scraps and reduce trips to the bin",
  "Use the water from canned beans (aquafaba) as an egg substitute in vegan baking recipes",
  "Store celery, carrots, and onions chopped in airtight containers in the fridge for quick soup starters",
  "Keep a jar of baking soda near the sink to scrub pots and pans - it's a gentle abrasive cleaner",
  "Use a muffin tin to serve condiments like ketchup, mustard, and relish at BBQs or parties",
  "Store potatoes with an apple to prevent them from sprouting - the apple releases ethylene gas",
  "Keep a measuring conversion chart magnet on your refrigerator for quick reference while cooking",
  "Use a pastry brush to apply oil or egg wash evenly over breads, pastries, and roasting vegetables",
  "Store Parmesan rinds in the freezer and add them to soups and sauces for extra umami flavor",
  "Keep a small fan in your kitchen to quickly cool down hot dishes before refrigerating",
  "Use a citrus juicer reamer to extract every drop of juice without getting seeds into your food",
  "Store fresh ginger wrapped in a paper towel inside a zip-top bag in the vegetable drawer",
  "Keep a set of nesting measuring cups and spoons that hook together so you never lose pieces",
  "Use a salad spinner not just for lettuce but for drying fresh herbs and even spin-drying canned beans",
  "Store wine corks in a jar on your counter and use them to re-seal opened bottles or as trivets",
  "Keep a garlic peeler (a silicone tube) in your drawer to peel multiple cloves in seconds",
  "Use a digital kitchen scale for baking - it's more accurate than measuring cups for consistent results",
  "Store homemade stocks and broths in ice cube trays for easy portion control in recipes",
  "Keep a kettle of hot water ready while cooking to deglaze pans and speed up boiling processes",
  "Use a cherry pitter or olive pitter to remove pits from stone fruits quickly without smashing them",
  "Store fresh basil on your counter in a glass of water like flowers, covered loosely with a plastic bag",
  "Keep a small whisk in your coffee mug to easily froth milk or mix powdered creamer",
  "Use a melon baller to remove seeds from cucumbers, zucchinis, and other seeded vegetables",
  "Store peeled garlic cloves in a jar covered with olive oil in the refrigerator for up to 2 weeks",
  "Keep a bottle of lemon juice in your refrigerator to prevent cut fruits like apples and pears from browning",
  "Use a tortilla warmer (fabric pouch) to keep pancakes, tortillas, and naan warm at the table",
  "Store fresh thyme, rosemary, and oregano in the refrigerator wrapped in slightly damp paper towels",
  "Keep a rubber spatula set with different sizes - small for jars, large for bowls, angled for scrapers",
  "Use a butter bell to keep butter spreadable on your counter without spoiling for up to 30 days",
  "Store fresh corn on the cob in the husk in the refrigerator until ready to use for maximum sweetness",
  "Keep a splatter screen over your frying pan to contain oil splatters while allowing steam to escape",
  "Use a vacuum sealer for meats you freeze to prevent freezer burn and extend storage life 3-5 times longer",
  "Store active dry yeast in the freezer to keep it fresh for years instead of months at room temperature",
  "Keep a jar of clean water on your counter to wet your fingers when handling sticky doughs",
  "Use a bean scoop (flat with holes) to remove fried foods from oil while draining excess grease",
  "Store fresh lemons in a sealed bag of water in the refrigerator - they'll stay juicy for months",
  "Keep a micro-perforated produce bag to store vegetables - they allow breathing while maintaining humidity",
  "Use a butter curler to make decorative butter pats for dinner parties and special occasions",
  "Store fresh pasta in the freezer in serving-sized nests separated by wax paper for easy portioning",
  "Keep a oil mister spray bottle to apply oil evenly to pans and foods with less fat than pouring",
  "Use a flour duster (fine mesh shaker) to evenly distribute flour on work surfaces without clumps",
  "Store fresh bread cut-side down on a cutting board to keep the crust crispy and interior fresh",
  "Keep a set of magnetic measuring spoons that stick together so they stay organized in your drawer",
  "Use a poultry shears (heavy duty kitchen scissors) to easily cut through chicken bones and joints",
  "Store fresh horseradish root wrapped in damp paper towels in the refrigerator for up to 3 months"
];
  return tips[Math.floor(Math.random() * tips.length)]
}

const setCurrentDate = () => {
  const now = new Date()
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  currentDate.value = now.toLocaleDateString('en-US', options)
}

if (typeof window !== 'undefined') {
  window.openAddItemModal = openAddModal
}

onMounted(async () => {
  setCurrentDate()
  await kitchenStore.loadItems()
  await shoppingStore.loadList()
})

onUnmounted(() => {})
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #fef8f0 0%, #fff9f5 100%);
}

/* Chef Banner */
.chef-banner {
  background: linear-gradient(135deg, #fc6731, #F7A440);
  border-radius: 20px;
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
  font-size: 28px;
  font-weight: 600;
  color: white;
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
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.chef-title-prefix {
  font-weight: 700;
  background: rgba(255, 255, 255, 0);
  padding: 2px 0px;
  border-radius: 20px;
  display: inline-block;
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

/* Quick Actions Grid */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.quick-action-card {
  background: white;
  border-radius: 20px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(0,0,0,0.05);
}

.quick-action-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.card-icon.orange { background: linear-gradient(135deg, #FF6B35, #FF8C42); }
.card-icon.green { background: linear-gradient(135deg, #4CAF50, #8BC34A); }
.card-icon.purple { background: linear-gradient(135deg, #9C27B0, #CE93D8); }
.card-icon.pink { background: linear-gradient(135deg, #E91E63, #F48FB1); }

.card-info h4 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--dark);
}

.card-info p {
  font-size: 12px;
  color: var(--gray-500);
  margin: 0;
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--dark);
  margin: 0;
}

.live-badge {
  background: #4CAF50;
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 20px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-left: 4px solid var(--primary);
}

.stat-card.warning { border-left-color: var(--warning); }
.stat-card.success { border-left-color: var(--success); }

.stat-icon {
  font-size: 40px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--dark);
}

.stat-label {
  font-size: 13px;
  color: var(--gray-600);
  margin-top: 4px;
}

.stat-progress {
  margin-top: 10px;
  height: 4px;
  background: var(--gray-200);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--primary);
  border-radius: 2px;
  transition: width 0.3s;
}

.progress-bar.warning { background: var(--warning); }
.progress-bar.success { background: var(--success); }

/* Analytics Grid */
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

.analytics-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  border: 1px solid rgba(0,0,0,0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--gray-100);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 20px;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-name {
  width: 90px;
  font-size: 13px;
  font-weight: 500;
}

.category-bar-container {
  flex: 1;
  height: 8px;
  background: var(--gray-200);
  border-radius: 4px;
  overflow: hidden;
}

.category-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  border-radius: 4px;
  transition: width 0.3s;
}

.category-count {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
  min-width: 30px;
  text-align: right;
}

.shopping-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.shopping-stat {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-circle {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-circle.success {
  background: linear-gradient(135deg, var(--success), #8BC34A);
}

.circle-value {
  color: white;
  font-size: 18px;
  font-weight: 700;
}

.stat-details {
  flex: 1;
}

.detail-label {
  display: block;
  font-size: 12px;
  color: var(--gray-500);
}

.detail-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: var(--dark);
}

.auto-added-info {
  background: var(--gray-50);
  padding: 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--gray-600);
}

.auto-icon {
  font-size: 16px;
}

/* Intelligence Card */
.intelligence-card {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.05), rgba(78, 205, 196, 0.05));
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 28px;
  border: 1px solid rgba(255, 107, 53, 0.1);
}

.intelligence-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.intelligence-header h3 {
  font-size: 16px;
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

.insight-date {
  font-size: 12px;
  color: var(--gray-500);
}

.insight-message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 16px;
}

.insight-quote {
  font-size: 28px;
  color: var(--primary);
  opacity: 0.5;
  line-height: 1;
}

.insight-quote.close {
  align-self: flex-end;
}

.insight-text {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  color: var(--gray-700);
  text-align: center;
}

.suggestion-badge {
  background: rgba(255, 107, 53, 0.1);
  padding: 10px 14px;
  border-radius: 12px;
  display: flex;
  gap: 12px;
  font-size: 13px;
}

/* Activity Row */
.activity-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

.activity-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  border: 1px solid rgba(0,0,0,0.05);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--gray-100);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.activity-icon {
  font-size: 20px;
}

.activity-header h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

.alert-badge {
  background: var(--warning);
  color: white;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 12px;
}

.view-link {
  color: var(--primary);
  text-decoration: none;
  font-size: 12px;
}

.alert-row, .shopping-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--gray-100);
}

.alert-name {
  font-weight: 500;
  font-size: 14px;
}

.alert-category {
  font-size: 11px;
  color: var(--gray-500);
  margin-top: 2px;
}

.qty-warning {
  color: var(--warning);
  font-weight: 600;
  font-size: 15px;
}

.shopping-name {
  font-weight: 500;
  font-size: 14px;
}

.auto-tag {
  font-size: 9px;
  padding: 2px 6px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 10px;
  margin-left: 8px;
}

.empty-alert, .empty-shopping {
  text-align: center;
  padding: 24px;
  color: var(--gray-500);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Pro Tip Card */
.pro-tip-card {
  background: linear-gradient(135deg, #2C3E50, #3498db);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: white;
}

.tip-icon {
  font-size: 28px;
}

.tip-title {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.8;
}

.tip-text {
  font-size: 13px;
  margin-top: 2px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 2000;
}

.modal-container {
  background: white;
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
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
  font-size: 14px;
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

.checkbox-group {
  margin: 20px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
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

.btn-submit {
  flex: 1;
  padding: 12px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 1024px) {
  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }
  
  .chef-title {
    font-size: 22px;
  }
  
  .chef-avatar {
    width: 55px;
    height: 55px;
    font-size: 22px;
  }
  
  .banner-stats {
    gap: 16px;
  }
  
  .stat-number {
    font-size: 22px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .analytics-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-row {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

@media (max-width: 480px) {
    .chef-banner{
    padding: 6px;
    margin-bottom: 16px;
    top: 0;
    width: 100%;
    }
  .chef-title-prefix {
    display: none;
  }
  .banner-content {
    width: 100%;
    flex-direction: column;
    text-align: center;
  }
  
  .banner-stats {
    justify-content: center;
  }
  
  .quick-action-card {
    padding: 8px;
    border: #F7A440 1px solid;
    background: transparent;
    
  }
  
  .card-icon {
    display: none;
  }
  
  .card-info h4 {
    text-align: center;
    display:flex;
    flex-direction: column;
    font-size: 15px;
  }
  
  .card-info p {
     text-align: center;
    display:flex;
    flex-direction: column;
    font-size: 11px;
  }
  
  .shopping-stat {
    flex-direction: column;
    text-align: center;
  }
 .intelligence-card{
    padding: 12px;
  }
  
  .insight-message {
    flex-direction: column;
    gap: 12px;
  }
  
  .insight-quote {
    font-size: 36px;
  }
  
  .insight-text {
    font-size: 14px;
  }
  
   .suggestion-badge {
   
    display: none;
    
 }
 .pro-tip-card {
  background: linear-gradient(135deg, #504c2c57, #db93343f);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: rgb(0, 0, 0);
}
}
</style>