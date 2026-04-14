import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        const form = new URLSearchParams({ username: email, password })
        const { data } = await api.post('/auth/login', form, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        localStorage.setItem('token', data.access_token)
        const { data: user } = await api.get('/auth/me')
        set({ token: data.access_token, user, isLoading: false })
        return user
      },

      register: async (userData) => {
        set({ isLoading: true })
        const { data: user } = await api.post('/auth/register', userData)
        set({ isLoading: false })
        return user
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null })
      },

      refreshUser: async () => {
        try {
          const { data } = await api.get('/auth/me')
          set({ user: data })
        } catch { get().logout() }
      },

      isAuthenticated: () => !!get().token,
    }),
    { name: 'vyr-auth', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
)

export const useListingsStore = create((set, get) => ({
  listings: [],
  featured: [],
  total: 0,
  page: 1,
  isLoading: false,
  filters: { category: '', search: '', city: '', min_price: '', max_price: '' },

  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () => set({ filters: { category: '', search: '', city: '', min_price: '', max_price: '' }, page: 1 }),

  fetchListings: async (reset = true) => {
    const { filters, page } = get()
    set({ isLoading: true })
    const params = new URLSearchParams()
    params.set('page', reset ? 1 : page)
    params.set('page_size', 12)
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    const { data } = await api.get(`/listings?${params}`)
    set(s => ({
      listings: reset ? data.results : [...s.listings, ...data.results],
      total: data.total,
      page: reset ? 2 : s.page + 1,
      isLoading: false
    }))
  },

  fetchFeatured: async () => {
    const { data } = await api.get('/listings?featured_only=true&page_size=6')
    set({ featured: data.results })
  },
}))
