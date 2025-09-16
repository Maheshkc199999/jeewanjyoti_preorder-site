import { Routes, Route } from 'react-router-dom'
import JeewanJyotiLanding from './JeewanJyotiLanding'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <Routes>
      <Route path="/" element={<JeewanJyotiLanding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

export default App
