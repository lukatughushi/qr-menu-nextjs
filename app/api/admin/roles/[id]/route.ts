import { NextRequest, NextResponse } from 'next/server'
import { getCaller, resolvePermissions } from '../../../../../lib/rbac'
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin'

// PUT — update a role (can_manage_roles required)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { user, isSuperAdmin, problem } = await getCaller(req)
  if (!user) return NextResponse.json({ error: problem }, { status: 401 })

  const perms = await resolvePermissions(user.id, isSuperAdmin)
  if (!perms.can_manage_roles) {
    return NextResponse.json({ error: 'Forbidden: can_manage_roles required.' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const { name, permissions } = body as { name?: string; permissions?: Record<string, boolean> }
  if (!name?.trim()) return NextResponse.json({ error: 'Role name is required.' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('roles')
    .update({ name: name.trim(), permissions: permissions ?? {} })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!data)  return NextResponse.json({ error: 'Role not found.' }, { status: 404 })
  return NextResponse.json({ role: data })
}

// DELETE — remove a role (can_manage_roles required)
// Blocked if any users are currently assigned to this role.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { user, isSuperAdmin, problem } = await getCaller(req)
  if (!user) return NextResponse.json({ error: problem }, { status: 401 })

  const perms = await resolvePermissions(user.id, isSuperAdmin)
  if (!perms.can_manage_roles) {
    return NextResponse.json({ error: 'Forbidden: can_manage_roles required.' }, { status: 403 })
  }

  const { count, error: cntErr } = await supabaseAdmin
    .from('user_roles')
    .select('*', { count: 'exact', head: true })
    .eq('role_id', id)

  if (cntErr) return NextResponse.json({ error: cntErr.message }, { status: 500 })
  if (count && count > 0) {
    return NextResponse.json(
      { error: `ეს როლი ${count} მომხმარებელს აქვს მინიჭებული — ჯერ გაუუქმეთ მინიჭება.` },
      { status: 400 }
    )
  }

  const { error } = await supabaseAdmin.from('roles').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
