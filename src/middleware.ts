import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getEdgeRatelimit } from './lib/rate-limit-edge'

function getEdgeClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname

  // 1. Rate-limit IA — uniquement /api/tracea/*
  // Le matcher restreint déjà à ces chemins, donc /api/cron, /api/auth,
  // etc. n'arrivent jamais ici. Si Upstash est indisponible
  // (env vars manquantes ou erreur), on fail-open pour ne jamais
  // bloquer l'app.
  if (url.startsWith('/api/tracea')) {
    const ratelimit = getEdgeRatelimit()
    if (ratelimit) {
      const ip = getEdgeClientIp(request)
      try {
        const { success } = await ratelimit.limit(`ip:${ip}`)
        if (!success) {
          return NextResponse.json(
            {
              error: 'Trop de requêtes, réessaie dans une minute.',
              code: 'rate_limited',
            },
            { status: 429 }
          )
        }
      } catch (err) {
        // Fail-open : ne pas bloquer en cas d'erreur Upstash runtime
        console.error('[middleware] rate-limit error', err)
      }
    }
    return NextResponse.next()
  }

  // 2. Maintenance redirect — logique existante, inchangée
  const maintenancePassword = process.env.MAINTENANCE_PASSWORD
  if (!maintenancePassword) return NextResponse.next()

  const cookie = request.cookies.get('maintenance_access')
  if (cookie?.value === 'true') return NextResponse.next()

  if (url === '/app/maintenance') return NextResponse.next()

  // Ne pas bloquer la landing page ni les pages légales
  if (
    url === '/' ||
    url === '/mentions-legales' ||
    url === '/politique-confidentialite' ||
    url === '/conditions-utilisation' ||
    url === '/comment-ca-marche' ||
    url === '/start'
  ) {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL('/app/maintenance', request.url))
}

export const config = {
  matcher: [
    // Pages : tout sauf assets statiques et /api/* (logique maintenance)
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
    // Rate limit IA : /api/tracea et tous ses sous-chemins
    '/api/tracea',
    '/api/tracea/:path*',
  ],
}
