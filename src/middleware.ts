import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const maintenancePassword = process.env.MAINTENANCE_PASSWORD
  if (!maintenancePassword) return NextResponse.next()

  const cookie = request.cookies.get('maintenance_access')
  if (cookie?.value === 'true') return NextResponse.next()

  const url = request.nextUrl.pathname
  if (url === '/maintenance') return NextResponse.next()

  return NextResponse.redirect(new URL('/maintenance', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}