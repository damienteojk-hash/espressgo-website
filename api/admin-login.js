export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { password } = req.body

  if (!process.env.ADMIN_PASSWORD) {
    console.error('ADMIN_PASSWORD env var is not set')
    return res.status(500).json({ error: 'Admin login is not configured' })
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect password' })
  }

  res.status(200).json({ ok: true })
}
