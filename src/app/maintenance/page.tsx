import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function checkPassword(formData: FormData) {
  'use server'
  const password = formData.get('password')
  if (password === process.env.MAINTENANCE_PASSWORD) {
    cookies().set('maintenance_access', 'true', {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24
    })
    redirect('/')
  }
}

export default function MaintenancePage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f0f0f', color: '#fff', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>TRACÉA</h1>
      <p style={{ opacity: 0.6, marginBottom: '2rem' }}>Espace en cours de finalisation.</p>
      <form action={checkPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '280px' }}>
        <input type="password" name="password" placeholder="Mot de passe" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: '#fff', fontSize: '1rem' }} />
        <button type="submit" style={{ padding: '0.75rem', borderRadius: '8px', background: '#fff', color: '#000', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>Accéder</button>
      </form>
    </main>
  )
}