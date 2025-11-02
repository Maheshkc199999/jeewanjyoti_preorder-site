import { Routes, Route } from 'react-router-dom'
import JeewanJyotiLanding from './JeewanJyotiLanding'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PaymentSuccess from './pages/PaymentSuccess'

function App() {
  return (
    <Routes>
      <Route path="/" element={<JeewanJyotiLanding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
    </Routes>
  )
}

export default App
