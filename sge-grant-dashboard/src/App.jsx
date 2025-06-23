import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Overview from './components/Overview'
import GrantList from './components/GrantList'
import GrantDetails from './components/GrantDetails'
import Analytics from './components/Analytics'
import Settings from './components/Settings'

export default function App() {
  return (
    <Router>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/grants" element={<GrantList />} />
          <Route path="/grants/:id" element={<GrantDetails />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </Router>
  )
}
