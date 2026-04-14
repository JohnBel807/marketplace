import { useState, useEffect } from 'react'
import api from '../utils/api'
import { useAuthStore } from '../context/store'

export function useCrossDiscount() {
  const { isAuthenticated } = useAuthStore()
  const [discount, setDiscount] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) return
    setLoading(true)
    api.get('/cross-auth/discount')
      .then(r => setDiscount(r.data))
      .catch(() => setDiscount(null))
      .finally(() => setLoading(false))
  }, [isAuthenticated()])

  const applyDiscount = (price) => {
    if (!discount?.eligible) return price
    return Math.round(price * (1 - discount.discount_percent / 100))
  }

  return { discount, loading, applyDiscount }
}
