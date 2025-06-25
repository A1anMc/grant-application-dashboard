import React, { useState, useEffect } from 'react';

const DebugInfo = () => {
    const [apiStatus, setApiStatus] = useState('Testing...');
    const [grantsCount, setGrantsCount] = useState(0);

    useEffect(() => {
        const testAPI = async () => {
            try {
                console.log('🔍 Debug: Testing API connection...');
                const response = await fetch('/api/grants');
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                console.log('🔍 Debug: API Response:', data);
                
                setApiStatus('✅ Connected');
                setGrantsCount(data.stats.total);
            } catch (error) {
                console.error('🔍 Debug: API Error:', error);
                setApiStatus(`❌ Error: ${error.message}`);
            }
        };

        testAPI();
    }, []);

    const testManualAPI = async () => {
        console.log('🔍 Debug: Testing manual grant API...');
        try {
            const testGrant = {
                name: 'Debug Test Grant',
                funder: 'Debug Foundation',
                description: 'This is a test grant to debug the manual entry system',
                amount: '$1,000',
                deadline: '2025-12-31',
                added_by: 'Debug Component'
            };

            console.log('🔍 Debug: Sending test grant:', testGrant);

            const response = await fetch('/api/grants/manual', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testGrant),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const newGrant = await response.json();
            console.log('🔍 Debug: Manual grant API success:', newGrant);
            alert(`✅ Manual grant API works! Added: ${newGrant.name}`);
            
            // Refresh page to see new grant
            window.location.reload();
        } catch (error) {
            console.error('🔍 Debug: Manual grant API error:', error);
            alert(`❌ Manual grant API error: ${error.message}`);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: '#ffffff',
            padding: '15px',
            borderRadius: '8px',
            border: '2px solid #333333',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 9999,
            fontFamily: 'monospace',
            fontSize: '12px',
            maxWidth: '300px',
            color: '#000000'
        }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#000000' }}>🔍 Debug Panel</h4>
            <div style={{ color: '#000000' }}><strong>API Status:</strong> {apiStatus}</div>
            <div style={{ color: '#000000' }}><strong>Grants Count:</strong> {grantsCount}</div>
            <button 
                onClick={testManualAPI}
                style={{
                    marginTop: '10px',
                    padding: '5px 10px',
                    background: '#007acc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Test Manual Grant API
            </button>
            <div style={{ marginTop: '10px', fontSize: '10px', color: '#666666' }}>
                Check browser console for detailed logs
            </div>
        </div>
    );
};

export default DebugInfo; 