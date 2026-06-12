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
    redirect('/start')
  }
}

// force-dynamic : LAUNCH_MODE lu à chaque requête (comme la racine /).
export const dynamic = 'force-dynamic'

export default function MaintenancePage() {
  // Après 20 h (LAUNCH_MODE=live) : aucune page maintenance, aucun message
  // périmé — on renvoie vers le vrai parcours. Le message « ouvre à 20 h »
  // ne s'affiche donc qu'en prelaunch.
  if (process.env.LAUNCH_MODE !== 'prelaunch') {
    redirect('/start')
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f0f0f', color: '#fff', fontFamily: 'sans-serif', padding: '1.5rem', textAlign: 'center' }}>
      <p style={{ fontSize: '0.8rem', letterSpacing: '0.25em', textTransform: 'uppercase', opacity: 0.5, marginBottom: '1.25rem' }}>TRACÉA</p>
      <h1 style={{ fontSize: '1.9rem', fontWeight: 600, lineHeight: 1.25, margin: 0, maxWidth: '440px' }}>
        Ouverture ce soir à 20&nbsp;h.
      </h1>
      <p style={{ opacity: 0.6, marginTop: '0.75rem', marginBottom: '2.5rem', fontSize: '1rem' }}>
        On t&apos;attend.
      </p>
      <form action={checkPassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '280px' }}>
        <label htmlFor="password" style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textAlign: 'left' }}>
          Accès anticipé
        </label>
        <input id="password" type="password" name="password" placeholder="Mot de passe" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: '#fff', fontSize: '1rem' }} />
        <button type="submit" style={{ marginTop: '0.5rem', padding: '0.75rem', borderRadius: '8px', background: '#fff', color: '#000', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>Accéder</button>
      </form>
      <a
        href="/"
        style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}
      >
        Revenir au site
      </a>
    </main>
  )
}