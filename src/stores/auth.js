import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null,
    loading: false
  }),

  actions: {
    async register(email, password, fullName) {
      this.loading = true
      
      try {
        // Sign out any existing session first
        await supabase.auth.signOut()
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        })
        
        if (error) {
          console.error('Signup error:', error)
          return { data, error }
        }
        
        if (data.user) {
          this.user = data.user
          
          // Wait a moment for the database trigger to run
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          await this.loadProfile()
        }
        
        return { data, error }
      } catch (err) {
        console.error('Registration error:', err)
        return { data: null, error: err }
      } finally {
        this.loading = false
      }
    },

    async login(email, password) {
      this.loading = true
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) {
          console.error('Login error:', error)
          return { data, error }
        }
        
        if (data.user) {
          this.user = data.user
          await this.loadProfile()
        }
        
        return { data, error }
      } catch (err) {
        console.error('Login error:', err)
        return { data: null, error: err }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      const { error } = await supabase.auth.signOut()
      if (!error) {
        this.user = null
        this.profile = null
        localStorage.removeItem('sb-auth-token')
      }
      return { error }
    },

    async loadProfile() {
      if (!this.user) return
      
      // First try to get from profiles table
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', this.user.id)
        .maybeSingle()
      
      // If profile doesn't exist, create it
      if (!data && !error) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: this.user.id,
            email: this.user.email,
            full_name: this.user.user_metadata?.full_name || this.user.email?.split('@')[0],
            display_name: this.user.user_metadata?.full_name || this.user.email?.split('@')[0]
          }])
          .select()
          .single()
        
        if (newProfile) {
          this.profile = newProfile
          return
        }
      }
      
      if (!error && data) {
        this.profile = data
      }
    },

    async loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        this.user = null
        this.profile = null
        return
      }
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        this.user = user
        await this.loadProfile()
      } else {
        this.user = null
        this.profile = null
      }
    }
  }
})