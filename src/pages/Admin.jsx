import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import styles from './Admin.module.css'

const ADMIN_PASSWORD = 'espressgo2026'

export default function Admin({ onBack }) {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [mode, setMode] = useState('preorder')
  const [stock, setStock] = useState(0)
  const [price, setPrice] = useState('')
  const [orders, setOrders] = useState([])
  const [notifyList, setNotifyList] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('settings')

  function handleLogin(e) {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) { setAuthed(true); loadData() }
    else { setPwError(true); setPw('') }
  }

  async function loadData() {
    const { data: settings } = await supabase.from('settings').select('*')
    if (settings) {
      const modeRow = settings.find(s => s.key === 'store_mode')
      const stockRow = settings.find(s => s.key === 'stock_count')
      const priceRow = settings.find(s => s.key === 'price')
      if (modeRow) setMode(modeRow.value)
      if (stockRow) setStock(parseInt(stockRow.value) || 0)
      if (priceRow) setPrice(priceRow.value)
    }
    const { data: orderData } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50)
    if (orderData) setOrders(orderData)
    const { data: notifyData } = await supabase.from('notify_list').select('*').order('created_at', { ascending: false })
    if (notifyData) setNotifyList(notifyData)
  }

  async function saveSetting(key, value) {
    await supabase.from('settings').upsert({ key, value: String(value) }, { onConflict: 'key' })
  }

  async function handleSave() {
    setSaving(true)
    await Promise.all([saveSetting('store_mode', mode), saveSetting('stock_count', stock), saveSetting('price', price)])
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function markFulfilled(id) {
    await supabase.from('orders').update({ status: 'fulfilled' }).eq('id', id)
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'fulfilled' } : o))
  }

  if (!authed) return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <p className={styles.loginTitle}>ESPRESSGO Admin</p>
        <form onSubmit={handleLogin} className={styles.loginForm}>
          <input type="password" placeholder="Password" value={pw} onChange={e => { setPw(e.target.value); setPwError(false) }} className={`${styles.loginInput} ${pwError ? styles.loginInputError : ''}`} autoFocus />
          {pwError && <p className={styles.loginError}>Incorrect password</p>}
          <button type="submit" className={styles.loginBtn}>Enter</button>
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
              {[['preorder','Pre-order'],['live','Live / In Stock'],['soldout','Sold Out']].map(([val, label]) => (
                <button key={val} className={`${styles.modeBtn} ${mode === val ? styles.modeBtnActive : ''}`} onClick={() => setMode(val)}>{label}</button>
              ))}
            </div>
            <p className={styles.settingHint}>
              {mode === 'preorder' && 'Site shows a pre-order CTA.'}
              {mode === 'live' && 'Site shows live stock count and order button.'}
              {mode === 'soldout' && 'Site shows sold out state with email notify form.'}
            </p>
          </div>
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Stock Count</label>
            <input type="number" min="0" value={stock} onChange={e => setStock(parseInt(e.target.value) || 0)} className={styles.settingInput} />
            <p className={styles.settingHint}>Shown to customers when mode is Live.</p>
          </div>
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Price (display only)</label>
            <input type="text" placeholder="e.g. S$3.50" value={price} onChange={e => setPrice(e.target.value)} className={styles.settingInput} />
          </div>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>{saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className={styles.panel}>
          {orders.length === 0 ? <p className={styles.emptyState}>No orders yet.</p> : (
            <table className={styles.table}>
              <thead><tr><th>Date</th><th>Name</th><th>Email</th><th>Qty</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td>{new Date(o.created_at).toLocaleDateString('en-SG')}</td>
                    <td>{o.name || '-'}</td><td>{o.email || '-'}</td><td>{o.quantity || 1}</td>
                    <td><span className={`${styles.statusBadge} ${o.status === 'fulfilled' ? styles.statusFulfilled : styles.statusPending}`}>{o.status || 'pending'}</span></td>
                    <td>{o.status !== 'fulfilled' && <button className={styles.fulfillBtn} onClick={() => markFulfilled(o.id)}>Mark Fulfilled</button>}</td>
                  </tr>
                ))}
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