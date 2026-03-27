import { NextResponse } from 'next/server'nimport type { NextRequest } from 'next/server'n
export function middleware(request: NextRequest) {
  return NextResponse.rewrite(new URL('/maintenance', request.url))
}

export const config = {
  matcher: ['/((?!maintenance|_next|favicon.ico).*)'],
}
