import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Overview from './components/Overview';
import GrantList from './components/GrantList';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import InsightsWidget from './components/InsightsWidget';

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'grants':
        return <GrantList />;
      case 'analytics':
        return <Analytics />;
      case 'insights':
        return <InsightsWidget />;
      case 'settings':
        return <Settings />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="app">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        <div className="container">
          {renderActiveComponent()}
        </div>
      </main>
    </div>
  );
}

export default App;
