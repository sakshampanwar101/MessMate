import { Routes, Route } from 'react-router-dom'
import './App.css'
import { Header } from './components/Header'
import { LandingPage } from './pages/LandingPage'
import { MenuPage } from './pages/MenuPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrderTrackerPage } from './pages/OrderTrackerPage'
import { QueueDashboardPage } from './pages/QueueDashboardPage'
import { LoginPage } from './pages/LoginPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminDashboardPage } from './pages/AdminDashboardPage'

function App() {
  return (
    <div className="mm-app">
      <Header />
      <main className="mm-main">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/checkout" element={
            <ProtectedRoute allowedRoles={['student']}>
              <CheckoutPage />
            </ProtectedRoute>
          } />
          <Route path="/track" element={<OrderTrackerPage />} />
          <Route path="/queue" element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <QueueDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>
      <footer className="mm-footer">
        <p>MessMate · Digital Queue Management for TIET Canteen</p>
        <p>Made for UCS-503 Software Engineering project.</p>
      </footer>
    </div>
  )
}

export default App
