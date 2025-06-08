import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Register user
      register: async (userData) => {
        set({ loading: true, error: null })
        try {
          const response = await api.post('/auth/register', userData)
          const { token, ...user } = response.data
          
          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null
          })
          
          // Set token in axios defaults
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          return response.data
        } catch (error) {
          const errorMessage = error.response?.data?.msg || 'Registration failed'
          set({ loading: false, error: errorMessage })
          throw new Error(errorMessage)
        }
      },

      // Login user
      login: async (credentials) => {
        set({ loading: true, error: null })
        try {
          const response = await api.post('/auth/login', credentials)
          const { token, ...user } = response.data
          
          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null
          })
          
          // Set token in axios defaults
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          return response.data
        } catch (error) {
          const errorMessage = error.response?.data?.msg || 'Login failed'
          set({ loading: false, error: errorMessage })
          throw new Error(errorMessage)
        }
      },

      // Logout user
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null
        })
        
        // Remove token from axios defaults
        delete api.defaults.headers.common['Authorization']
      },

      // Initialize auth (check if token exists and is valid)
      initializeAuth: async () => {
        const { token } = get()
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          try {
            // You can add a /auth/me endpoint to verify token
            // const response = await api.get('/auth/me')
            // set({ user: response.data, isAuthenticated: true })
          } catch (error) {
            // Token is invalid, logout
            get().logout()
          }
        }
      },

      // Clear error
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

export { useAuthStore }