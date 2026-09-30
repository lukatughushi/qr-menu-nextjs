import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { PermissionKey, Permissions } from './lib/permissions'

const ROUTE_PERMISSIONS: [RegExp, PermissionKey][] = [
  [/^\/admin\/settings\/roles/, 'can_manage_roles'],
  [/^\/admin\/menu/,            'can_edit_menu'],
  [/^\/admin\/banners/,         'can_manage_banners'],
  [/^\/admin\/orders/,          'can_view_orders'],
  [/^\/admin\/reservations/,    'can_manage_reservations'],
  [/^\/admin\/users/,           'can_add_users'],
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow login and 403 pages
  if (pathname === '/admin/login' || pathname.startsWith('/admin/403')) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  // If admin-perms cookie is set, enforce route-level permission checks
  const permsRaw = request.cookies.get('admin-perms')?.value
  if (permsRaw) {
    let permissions: Permissions = {}
    try { permissions = JSON.parse(decodeURIComponent(permsRaw)) } catch { /* ignore malformed cookie */ }

    for (const [pattern, key] of ROUTE_PERMISSIONS) {
      if (pattern.test(pathname)) {
        if (!permissions[key]) {
          const url = request.nextUrl.clone()
          url.pathname = '/admin/403'
          return NextResponse.redirect(url)
        }
        break
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
