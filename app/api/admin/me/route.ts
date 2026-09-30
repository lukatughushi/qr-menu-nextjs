import { NextRequest, NextResponse } from 'next/server'
import { getCaller, resolvePermissions } from '../../../../lib/rbac'

export async function GET(req: NextRequest) {
  const { user, isSuperAdmin, problem } = await getCaller(req)
  if (!user) return NextResponse.json({ error: problem }, { status: 401 })
  const permissions = await resolvePermissions(user.id, isSuperAdmin)

  const res = NextResponse.json({ userId: user.id, email: user.email, isSuperAdmin, permissions })

  res.cookies.set('admin-perms', JSON.stringify(permissions), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 8,
  })

  return res
}
