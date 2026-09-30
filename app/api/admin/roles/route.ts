import { NextRequest, NextResponse } from 'next/server'
import { getCaller, resolvePermissions } from '../../../../lib/rbac'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

// GET — any authenticated user (needed for role dropdowns)
export async function GET(req: NextRequest) {
  const { user, problem } = await getCaller(req)
  if (!user) return NextResponse.json({ error: problem }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('roles')
    .select('id, name, permissions, created_at')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ roles: data })
}

// POST — requires can_manage_roles
export async function POST(req: NextRequest) {
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
    .insert({ name: name.trim(), permissions: permissions ?? {} })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ role: data }, { status: 201 })
}
