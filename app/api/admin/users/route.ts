import { NextRequest, NextResponse } from 'next/server'
import { getCaller, resolvePermissions } from '../../../../lib/rbac'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

// GET — list all auth users enriched with their DB role from user_roles
export async function GET(req: NextRequest) {
  const { user: caller, problem } = await getCaller(req)
  if (!caller) return NextResponse.json({ error: problem }, { status: 401 })

  const [{ data: authData, error: authErr }, { data: urData }] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers(),
    supabaseAdmin.from('user_roles').select('user_id, roles(id, name, permissions)'),
  ])

  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 500 })

  // userId → first assigned role
  const roleMap: Record<string, unknown> = {}
  for (const ur of (urData ?? []) as any[]) {
    if (!roleMap[ur.user_id]) roleMap[ur.user_id] = ur.roles
  }

  return NextResponse.json({
    users: authData.users.map(u => ({ ...u, dbRole: roleMap[u.id] ?? null })),
  })
}

// POST — create user + assign role (can_add_users required)
export async function POST(req: NextRequest) {
  const { user: caller, isSuperAdmin, problem } = await getCaller(req)
  if (!caller) return NextResponse.json({ error: problem }, { status: 401 })

  const perms = await resolvePermissions(caller.id, isSuperAdmin)
  if (!perms.can_add_users) {
    return NextResponse.json({ error: 'Forbidden: can_add_users required.' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const { email, password, roleId } = body as { email?: string; password?: string; roleId?: string }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Assign role in user_roles table if a roleId was provided
  if (roleId && data.user) {
    const { error: roleErr } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: data.user.id, role_id: roleId })
    if (roleErr) {
      return NextResponse.json(
        { error: `User created but role assignment failed: ${roleErr.message}` },
        { status: 207 }
      )
    }
  }

  return NextResponse.json({ user: data.user }, { status: 201 })
}

// DELETE — remove a user (superadmin only)
export async function DELETE(req: NextRequest) {
  const { user: caller, isSuperAdmin, problem } = await getCaller(req)
  if (!caller) return NextResponse.json({ error: problem }, { status: 401 })
  if (!isSuperAdmin) {
    return NextResponse.json({ error: 'Forbidden: superadmin required to delete users.' }, { status: 403 })
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'User id is required.' }, { status: 400 })
  if (id === caller.id) {
    return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
