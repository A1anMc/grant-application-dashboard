import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Login from './components/Login';
import Overview from './components/Overview';
import GrantList from './components/GrantList';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Insights from './components/Insights';

// Views
import CollabWorkspace from './views/CollabWorkspace';
import GrantDetailView from './views/GrantDetailView';
import DocumentVault from './views/DocumentVault';
import AnalyticsDashboard from './views/AnalyticsDashboard';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Main App Layout
const AppLayout = () => {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <div className="container">
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/grants" element={<GrantList />} />
            <Route path="/grants/:id" element={<GrantDetailView />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/workspace" element={<CollabWorkspace />} />
            <Route path="/documents" element={<DocumentVault />} />
            <Route path="/dashboard" element={<AnalyticsDashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
