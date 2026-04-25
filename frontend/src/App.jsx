import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import WhatsAppFAB from './components/ui/WhatsAppFAB'
import ProtectedRoute from './components/ui/ProtectedRoute'
import PortalWidget from './components/ui/PortalWidget'
import CrossLoginBanner from './components/ui/CrossLoginBanner'
import TraeNosWidget from './components/ui/TraeNosWidget'

import HomePage from './pages/HomePage'
import ListingsPage from './pages/ListingsPage'
import ListingDetailPage from './pages/ListingDetailPage'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import { ForgotPasswordPage, ResetPasswordPage } from './pages/PasswordPages'
import PublishPage from './pages/PublishPage'
import EditListingPage from './pages/EditListingPage'
import DashboardPage from './pages/DashboardPage'
import PricingPage from './pages/PricingPage'
import { TerminosPage, PrivacidadPage, PQRPage } from './pages/LegalPages'
import NotFoundPage from './pages/NotFoundPage'

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CrossLoginBanner />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFAB />
      <PortalWidget />
      <TraeNosWidget />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/terminos" element={<TerminosPage />} />
          <Route path="/privacidad" element={<PrivacidadPage />} />
          <Route path="/pqr" element={<PQRPage />} />
          <Route path="/publish" element={
            <ProtectedRoute><PublishPage /></ProtectedRoute>
          } />
          <Route path="/publish/edit/:id" element={
            <ProtectedRoute><EditListingPage /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
