import { useState, useEffect } from 'react'
import { fetchHealth, fetchGrants } from '../utils/api'

export default function TestConnection() {
  const [healthStatus, setHealthStatus] = useState(null)
  const [grantsStatus, setGrantsStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const testConnections = async () => {
      try {
        // Test health endpoint
        const health = await fetchHealth()
        setHealthStatus(health)

        // Test grants endpoint
        const grants = await fetchGrants()
        setGrantsStatus({
          count: grants.length || grants.grants?.length || 0,
          sample: grants[0] || grants.grants?.[0]
        })
      } catch (error) {
        console.error('Connection test failed:', error)
        setHealthStatus({ error: error.message })
        setGrantsStatus({ error: error.message })
      } finally {
        setLoading(false)
      }
    }

    testConnections()
  }, [])

  if (loading) {
    return <div>Testing API connections...</div>
  }

  return (
    <div style={{ padding: '2rem', background: '#f8f9fa', borderRadius: '8px', margin: '1rem' }}>
      <h3>API Connection Test</h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <strong>Health Endpoint:</strong>
        {healthStatus?.error ? (
          <span style={{ color: 'red' }}> ❌ {healthStatus.error}</span>
        ) : (
          <span style={{ color: 'green' }}> ✅ Connected</span>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <strong>Grants Endpoint:</strong>
        {grantsStatus?.error ? (
          <span style={{ color: 'red' }}> ❌ {grantsStatus.error}</span>
        ) : (
          <span style={{ color: 'green' }}> ✅ {grantsStatus.count} grants loaded</span>
        )}
      </div>

      {grantsStatus?.sample && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '4px' }}>
          <strong>Sample Grant:</strong>
          <pre style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
            {JSON.stringify(grantsStatus.sample, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 