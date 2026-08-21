import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import styles from './Admin.module.css'

const SESSION_KEY = 'espressgo_admin_authed'

const BUNDLE_LABELS = {
  1: 'Single Sachet',
  5: 'Pack of 5',
  12: 'Box of 12',
}

function bundleLabelForQuantity(qty) {
  return BUNDLE_LABELS[qty] || `${qty} sachets`
}

function itemsSummaryForOrder(order) {
  if (Array.isArray(order.items) && order.items.length > 0) {
    return order.items.map(i => `${i.label} x${i.qty}`).join(', ')
  }
  return bundleLabelForQuantity(order.quantity || 1)
}

export default function Admin({ onBack }) {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [mode, setMode] = useState('instock')
  const [stock, setStock] = useState(0)
  const [orders, setOrders] = useState([])
  const [notifyList, setNotifyList] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [activeTab, setActiveTab] = useState('settings')
  const [trackingInputs, setTrackingInputs] = useState({})
  const [shippingId, setShippingId] = useState(null)
  const [shipError, setShipError] = useState(null)
  const [loggingIn, setLoggingIn] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      setAuthed(true)
      loadData()
    }
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setLoggingIn(true)
    setPwError(false)
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      })
      if (!res.ok) {
        setPwError(true)
        setPw('')
        return
      }
      sessionStorage.setItem(SESSION_KEY, '1')
      setAuthed(true)
      loadData()
    } catch (err) {
      console.error('Admin login failed:', err)
      setPwError(true)
      setPw('')
    } finally {
      setLoggingIn(false)
    }
  }

  async function loadData() {
    const { data: settings, error: settingsError } = await supabase.from('settings').select('*')
    if (settingsError) {
      console.error('Failed to load settings:', settingsError)
    }
    if (settings) {
      const modeRow = settings.find(s => s.key === 'store_mode')
      const stockRow = settings.find(s => s.key === 'stock_count')
      if (modeRow) setMode(modeRow.value)
      if (stockRow) setStock(parseInt(stockRow.value) || 0)
    }
    const { data: orderData } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50)
    if (orderData) setOrders(orderData)
    const { data: notifyData } = await supabase.from('notify_list').select('*').order('created_at', { ascending: false })
    if (notifyData) setNotifyList(notifyData)
  }

  async function saveSetting(key, value) {
    const { error } = await supabase.from('settings').upsert({ key, value: String(value) }, { onConflict: 'key' })
    if (error) throw error
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(false)
    try {
      await Promise.all([
        saveSetting('store_mode', mode),
        saveSetting('stock_count', stock),
      ])
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Save failed:', err)
      setSaveError(true)
      setTimeout(() => setSaveError(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  async function markFulfilled(id) {
    const { error } = await supabase.from('orders').update({ status: 'fulfilled' }).eq('id', id)
    if (error) {
      console.error('Mark fulfilled failed:', error)
      alert('Could not update order status: ' + error.message)
      return
    }
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'fulfilled' } : o))
  }

  async function markDelivered(id) {
    const { error } = await supabase.from('orders').update({ status: 'delivered' }).eq('id', id)
    if (error) {
      console.error('Mark delivered failed:', error)
      alert('Could not update order status: ' + error.message)
      return
    }
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'delivered' } : o))
  }

  function setTrackingField(id, field, value) {
    setTrackingInputs(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  async function markShipped(id) {
    const input = trackingInputs[id] || {}
    if (!input.trackingNumber || !input.trackingUrl) {
      setShipError({ id, message: 'Tracking number and link are both required.' })
      return
    }
    setShippingId(id)
    setShipError(null)
    try {
      const res = await fetch('/api/mark-shipped', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, trackingNumber: input.trackingNumber, trackingUrl: input.trackingUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to mark as shipped')
      setOrders(orders.map(o => o.id === id ? { ...o, status: 'shipped', tracking_number: input.trackingNumber, tracking_url: input.trackingUrl } : o))
    } catch (err) {
      console.error('Mark shipped failed:', err)
      setShipError({ id, message: err.message })
    } finally {
      setShippingId(null)
    }
  }

  if (!authed) return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <p className={styles.loginTitle}>ESPRESSGO Admin</p>
        <form onSubmit={handleLogin} className={styles.loginForm}>
          <input type="password" placeholder="Password" value={pw} onChange={e => { setPw(e.target.value); setPwError(false) }} className={`${styles.loginInput} ${pwError ? styles.loginInputError : ''}`} autoFocus />
          {pwError && <p className={styles.loginError}>Incorrect password</p>}
          <button type="submit" className={styles.loginBtn} disabled={loggingIn}>{loggingIn ? 'Checking...' : 'Enter'}</button>
        </form>
        <button className={styles.backLink} onClick={onBack}>Back to site</button>
      </div>
    </div>
  )

  return (
    <div className={styles.adminPage}>
      <div className={styles.adminHeader}>
        <p className={styles.adminTitle}>ESPRESSGO Admin</p>
        <button className={styles.backBtn} onClick={onBack}>Back to site</button>
      </div>
      <div className={styles.tabs}>
        {['settings', 'orders', 'notify'].map(t => (
          <button key={t} className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'settings' ? 'Store Settings' : t === 'orders' ? `Orders (${orders.length})` : `Notify List (${notifyList.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'settings' && (
        <div className={styles.panel}>
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Store Mode</label>
            <div className={styles.modeToggle}>
              {[['instock', 'In Stock'], ['outofstock', 'Out of Stock']].map(([val, label]) => (
                <button key={val} className={`${styles.modeBtn} ${mode === val ? styles.modeBtnActive : ''}`} onClick={() => setMode(val)}>{label}</button>
              ))}
            </div>
            <p className={styles.settingHint}>
              {mode === 'instock' && 'Site shows live stock count and the order buttons.'}
              {mode === 'outofstock' && 'Site shows an out-of-stock state instead of the order buttons.'}
            </p>
          </div>

          {mode === 'instock' && (
            <div className={styles.settingGroup}>
              <label className={styles.settingLabel}>Stock Count</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={e => setStock(parseInt(e.target.value) || 0)}
                className={styles.settingInput}
              />
              <p className={styles.settingHint}>Number of sachets available. Automatically decrements on each order.</p>
            </div>
          )}

          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saved ? 'Saved!' : saving ? 'Saving...' : saveError ? 'Save Failed — Try Again' : 'Save Changes'}
          </button>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className={styles.panel}>
          {orders.length === 0 ? <p className={styles.emptyState}>No orders yet.</p> : (
            <table className={styles.table}>
              <thead><tr><th>Date</th><th>Type</th><th>Name</th><th>Email</th><th>Phone</th><th>Bundle</th><th>Details</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {orders.map(o => {
                  const isDelivery = o.fulfillment_type === 'delivery'
                  const input = trackingInputs[o.id] || {}
                  return (
                    <tr key={o.id}>
                      <td>{new Date(o.created_at).toLocaleDateString('en-SG')}</td>
                      <td>{isDelivery ? 'Delivery' : 'Pickup'}</td>
                      <td>{o.name || '-'}</td>
                      <td>{o.email || '-'}</td>
                      <td>{o.phone || '-'}</td>
                      <td>{itemsSummaryForOrder(o)}</td>
                      <td>
                        {isDelivery ? (
                          <>
                            <div>{o.delivery_address}{o.delivery_postal_code ? `, ${o.delivery_postal_code}` : ''}</div>
                            {o.estimated_delivery_earliest && o.estimated_delivery_latest && (
                              <div className={styles.settingHint}>
                                ETA {new Date(o.estimated_delivery_earliest + 'T00:00:00').toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}
                                {' – '}
                                {new Date(o.estimated_delivery_latest + 'T00:00:00').toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}
                              </div>
                            )}
                            {o.tracking_url && <div><a href={o.tracking_url} target="_blank" rel="noopener noreferrer">{o.tracking_number}</a></div>}
                          </>
                        ) : (
                          o.pickup_date ? new Date(o.pickup_date + 'T00:00:00').toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short' }) : '-'
                        )}
                      </td>
                      <td>{o.amount_total ? `$${(o.amount_total / 100).toFixed(2)}` : '-'}</td>
                      <td><span className={`${styles.statusBadge} ${o.status === 'fulfilled' || o.status === 'delivered' ? styles.statusFulfilled : styles.statusPending}`}>{o.status || 'pending'}</span></td>
                      <td>
                        {!isDelivery && o.status !== 'fulfilled' && (
                          <button className={styles.fulfillBtn} onClick={() => markFulfilled(o.id)}>Mark Fulfilled</button>
                        )}
                        {isDelivery && o.status === 'paid' && (
                          <div className={styles.trackingForm}>
                            <input
                              type="text"
                              placeholder="Tracking number"
                              value={input.trackingNumber || ''}
                              onChange={e => setTrackingField(o.id, 'trackingNumber', e.target.value)}
                              className={styles.settingInput}
                            />
                            <input
                              type="text"
                              placeholder="Tracking link (https://...)"
                              value={input.trackingUrl || ''}
                              onChange={e => setTrackingField(o.id, 'trackingUrl', e.target.value)}
                              className={styles.settingInput}
                            />
                            <button className={styles.fulfillBtn} onClick={() => markShipped(o.id)} disabled={shippingId === o.id}>
                              {shippingId === o.id ? 'Sending...' : 'Mark Shipped'}
                            </button>
                            {shipError?.id === o.id && <p className={styles.trackingError}>{shipError.message}</p>}
                          </div>
                        )}
                        {isDelivery && o.status === 'shipped' && (
                          <button className={styles.fulfillBtn} onClick={() => markDelivered(o.id)}>Mark Delivered</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'notify' && (
        <div className={styles.panel}>
          {notifyList.length === 0 ? <p className={styles.emptyState}>No one on the notify list yet.</p> : (
            <table className={styles.table}>
              <thead><tr><th>Date Added</th><th>Email</th></tr></thead>
              <tbody>{notifyList.map(n => <tr key={n.id}><td>{new Date(n.created_at).toLocaleDateString('en-SG')}</td><td>{n.email}</td></tr>)}</tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}