import { useEffect, useState } from 'react'

function Success({ onBackHome }) {
  const [sessionId, setSessionId] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setSessionId(params.get('session_id'))
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#653a17',
      color: '#f3e7d0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <img src="/Asset_2.svg" alt="ESPRESSGO" style={{ width: '200px', marginBottom: '1.5rem' }} />
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Order Confirmed</h1>
     <p style={{ fontSize: '1.1rem', maxWidth: '480px', marginBottom: '0.5rem' }}>
  Thank you for your order. A confirmation email is on its way with your order details.
</p>
      {sessionId && (
        <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>
          Reference: {sessionId.slice(0, 24)}...
        </p>
      )}
      <button onClick={onBackHome} style={{
        marginTop: '1.5rem',
        background: 'none',
        border: 'none',
        color: '#f3e7d0',
        textDecoration: 'underline',
        fontSize: '0.95rem',
        cursor: 'pointer'
      }}>
        Back to home
      </button>
    </div>
  )
}

export default Success