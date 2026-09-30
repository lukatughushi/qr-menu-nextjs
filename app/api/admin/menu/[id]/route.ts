import { NextRequest, NextResponse } from 'next/server'
import { getCaller, resolvePermissions } from '../../../../../lib/rbac'
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { user, isSuperAdmin, problem } = await getCaller(req)
  if (!user) return NextResponse.json({ error: problem }, { status: 401 })

  const permissions = await resolvePermissions(user.id, isSuperAdmin)
  if (!permissions.can_delete_menu) {
    return NextResponse.json({ error: 'can_delete_menu permission required' }, { status: 403 })
  }

  const { error } = await supabaseAdmin.from('menu_items').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { user, isSuperAdmin, problem } = await getCaller(req)
  if (!user) return NextResponse.json({ error: problem }, { status: 401 })

  const permissions = await resolvePermissions(user.id, isSuperAdmin)
  if (!permissions.can_edit_menu) {
    return NextResponse.json({ error: 'can_edit_menu permission required' }, { status: 403 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const allowed = ['is_visible', 'discount_percent']
  const update = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  )
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No updatable fields' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, data })
}
