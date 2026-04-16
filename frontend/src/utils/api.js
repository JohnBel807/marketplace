import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL 
  || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://api.velezyricaurte.info/api')

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
})

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api