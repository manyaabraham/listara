import { defineStore } from 'pinia'
import { supabase, signUp, signIn, signOut, getProfile } from '../services/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null,
    loading: false
  }),

  actions: {
    async register(email, password, fullName) {
      this.loading = true
      const { data, error } = await signUp(email, password, fullName)
      
      if (!error && data.user) {
        this.user = data.user
        await this.loadProfile()
      }
      
      this.loading = false
      return { data, error }
    },

    async login(email, password) {
      this.loading = true
      const { data, error } = await signIn(email, password)
      
      if (!error && data.user) {
        this.user = data.user
        await this.loadProfile()
      }
      
      this.loading = false
      return { data, error }
    },

    async logout() {
      this.loading = true
      const { error } = await signOut()
      
      if (!error) {
        this.user = null
        this.profile = null
      }
      
      this.loading = false
      return { error }
    },

    async loadProfile() {
      if (!this.user) return
      
      const { data, error } = await getProfile(this.user.id)
      if (!error && data) {
        this.profile = data
      }
    },

    async loadUser() {
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