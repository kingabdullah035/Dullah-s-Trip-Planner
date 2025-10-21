// web/src/main.jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Shell from './components/Shell'
import Home from './pages/Home'
import Login from './pages/Login'
import AppPage from './pages/AppPage'
import TripPage from './pages/TripPage'
import ProtectedRoute from './components/ProtectedRoute'

import './styles.css'

function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/:id"
            element={
              <ProtectedRoute>
                <TripPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Shell>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
