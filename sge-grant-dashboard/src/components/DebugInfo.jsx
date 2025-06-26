import React, { useState, useEffect } from 'react';

const DebugInfo = () => {
  const [debugData, setDebugData] = useState({
    apiConnectivity: null,
    grantsData: null,
    notificationsData: null,
    errors: []
  });

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const errors = [];
    let apiConnectivity = false;
    let grantsData = null;
    let notificationsData = null;

    // Test API connectivity
    try {
      const response = await fetch('/api/grants');
      if (response.ok) {
        apiConnectivity = true;
        grantsData = await response.json();
      } else {
        errors.push(`Grants API error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      errors.push(`Grants API connection failed: ${error.message}`);
    }

    // Test notifications API
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        notificationsData = await response.json();
      } else {
        errors.push(`Notifications API error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      errors.push(`Notifications API connection failed: ${error.message}`);
    }

    // Test Chart.js availability
    try {
      const ChartJS = await import('chart.js');
      if (!ChartJS) {
        errors.push('Chart.js not properly imported');
      }
    } catch (error) {
      errors.push(`Chart.js import error: ${error.message}`);
    }

    setDebugData({
      apiConnectivity,
      grantsData,
      notificationsData,
      errors
    });
  };

  const testFunction = (functionName, testFn) => {
    try {
      testFn();
      return { status: 'success', error: null };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '20px',
      borderRadius: '8px',
      maxWidth: '400px',
      maxHeight: '80vh',
      overflow: 'auto',
      zIndex: 9999,
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#4ade80' }}>🔧 Debug Panel</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ color: '#60a5fa', margin: '0 0 5px 0' }}>API Connectivity</h4>
        <div>Grants API: {debugData.apiConnectivity ? '✅ Connected' : '❌ Failed'}</div>
        <div>Notifications API: {debugData.notificationsData ? '✅ Connected' : '❌ Failed'}</div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ color: '#60a5fa', margin: '0 0 5px 0' }}>Data Status</h4>
        <div>Grants Count: {debugData.grantsData?.grants?.length || 0}</div>
        <div>Notifications Count: {debugData.notificationsData?.notifications?.length || 0}</div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ color: '#60a5fa', margin: '0 0 5px 0' }}>Component Tests</h4>
        <div>React: {React ? '✅' : '❌'}</div>
        <div>React DOM: {testFunction('ReactDOM', () => import('react-dom')).status === 'success' ? '✅' : '❌'}</div>
      </div>

      {debugData.errors.length > 0 && (
        <div>
          <h4 style={{ color: '#ef4444', margin: '0 0 5px 0' }}>Errors</h4>
          {debugData.errors.map((error, index) => (
            <div key={index} style={{ color: '#fca5a5', marginBottom: '5px' }}>
              • {error}
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={runDiagnostics}
        style={{
          background: '#22c55e',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        🔄 Refresh Tests
      </button>
    </div>
  );
};

export default DebugInfo; 