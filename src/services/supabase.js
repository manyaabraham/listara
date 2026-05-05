import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth functions
export const signUp = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  })
  
  if (!error && data.user) {
    // Create profile
    await supabase.from('profiles').insert([{
      id: data.user.id,
      email: email,
      full_name: fullName
    }])
  }
  
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Kitchen functions
export const getKitchenItems = async (userId) => {
  const { data, error } = await supabase
    .from('kitchen_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const addKitchenItem = async (item) => {
  const { data, error } = await supabase
    .from('kitchen_items')
    .insert([item])
    .select()
  return { data: data?.[0], error }
}

export const updateKitchenItem = async (id, updates) => {
  const { data, error } = await supabase
    .from('kitchen_items')
    .update(updates)
    .eq('id', id)
    .select()
  return { data: data?.[0], error }
}

export const deleteKitchenItem = async (id) => {
  const { error } = await supabase
    .from('kitchen_items')
    .delete()
    .eq('id', id)
  return { error }
}

// Consumption functions
export const addConsumption = async (consumption) => {
  const { data, error } = await supabase
    .from('consumptions')
    .insert([consumption])
    .select()
  return { data: data?.[0], error }
}

// Shopping functions
export const getActiveShoppingList = async (userId) => {
  // Get or create active shopping list
  let { data: list, error: listError } = await supabase
    .from('shopping_lists')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .maybeSingle()
  
  if (!list && !listError) {
    const { data: newList, error: createError } = await supabase
      .from('shopping_lists')
      .insert([{ user_id: userId, name: 'Shopping List' }])
      .select()
      .single()
    
    if (!createError) {
      list = newList
    }
  }
  
  if (list) {
    const { data: items, error: itemsError } = await supabase
      .from('shopping_list_items')
      .select('*')
      .eq('shopping_list_id', list.id)
      .order('created_at', { ascending: false })
    
    return { data: { list, items }, error: itemsError }
  }
  
  return { data: null, error: listError }
}

export const addShoppingItem = async (item) => {
  const { data, error } = await supabase
    .from('shopping_list_items')
    .insert([item])
    .select()
  return { data: data?.[0], error }
}

export const updateShoppingItem = async (id, updates) => {
  const { data, error } = await supabase
    .from('shopping_list_items')
    .update(updates)
    .eq('id', id)
    .select()
  return { data: data?.[0], error }
}

export const deleteShoppingItem = async (id) => {
  const { error } = await supabase
    .from('shopping_list_items')
    .delete()
    .eq('id', id)
  return { error }
}

// Notification functions
export const getNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const markNotificationRead = async (id) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
  return { error }
}

export const markAllNotificationsRead = async (userId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
  return { error }
}

// Profile functions
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
  return { data: data?.[0], error }
}