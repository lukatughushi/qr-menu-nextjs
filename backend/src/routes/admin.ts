import { Router } from 'express'
import { supabaseAdmin } from '../supabaseAdmin.js'
import { requireUser, requirePermission, requireSuperAdmin, resolvePermissions } from '../rbac.js'

export const adminRouter = Router()

adminRouter.use(requireUser)

/* ── Current user ─────────────────────────────────────────── */

adminRouter.get('/me', async (req, res) => {
  const { user, isSuperAdmin } = req.caller!
  const permissions = await resolvePermissions(user.id, isSuperAdmin)
  res.json({ userId: user.id, email: user.email, isSuperAdmin, permissions })
})

/* ── Menu ─────────────────────────────────────────────────── */

adminRouter.delete('/menu/:id', requirePermission('can_delete_menu'), async (req, res) => {
  const { error } = await supabaseAdmin.from('menu_items').delete().eq('id', req.params.id)
  if (error) { res.status(400).json({ error: error.message }); return }
  res.json({ success: true })
})

adminRouter.patch('/menu/:id', requirePermission('can_edit_menu'), async (req, res) => {
  const allowed = ['is_visible', 'discount_percent']
  const update = Object.fromEntries(
    Object.entries(req.body ?? {}).filter(([k]) => allowed.includes(k))
  )
  if (Object.keys(update).length === 0) {
    res.status(400).json({ error: 'No updatable fields' })
    return
  }

  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .update(update)
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) { res.status(400).json({ error: error.message }); return }
  res.json({ success: true, data })
})

/* ── Roles ────────────────────────────────────────────────── */

// Any authenticated user (needed for role dropdowns)
adminRouter.get('/roles', async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('roles')
    .select('id, name, permissions, created_at')
    .order('created_at', { ascending: true })

  if (error) { res.status(500).json({ error: error.message }); return }
  res.json({ roles: data })
})

adminRouter.post('/roles', requirePermission('can_manage_roles'), async (req, res) => {
  const { name, permissions } = (req.body ?? {}) as { name?: string; permissions?: Record<string, boolean> }
  if (!name?.trim()) { res.status(400).json({ error: 'Role name is required.' }); return }

  const { data, error } = await supabaseAdmin
    .from('roles')
    .insert({ name: name.trim(), permissions: permissions ?? {} })
    .select()
    .single()

  if (error) { res.status(400).json({ error: error.message }); return }
  res.status(201).json({ role: data })
})

adminRouter.put('/roles/:id', requirePermission('can_manage_roles'), async (req, res) => {
  const { name, permissions } = (req.body ?? {}) as { name?: string; permissions?: Record<string, boolean> }
  if (!name?.trim()) { res.status(400).json({ error: 'Role name is required.' }); return }

  const { data, error } = await supabaseAdmin
    .from('roles')
    .update({ name: name.trim(), permissions: permissions ?? {} })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) { res.status(400).json({ error: error.message }); return }
  if (!data)  { res.status(404).json({ error: 'Role not found.' }); return }
  res.json({ role: data })
})

// Blocked if any users are currently assigned to this role.
adminRouter.delete('/roles/:id', requirePermission('can_manage_roles'), async (req, res) => {
  const { count, error: cntErr } = await supabaseAdmin
    .from('user_roles')
    .select('*', { count: 'exact', head: true })
    .eq('role_id', req.params.id)

  if (cntErr) { res.status(500).json({ error: cntErr.message }); return }
  if (count && count > 0) {
    res.status(400).json({ error: `ეს როლი ${count} მომხმარებელს აქვს მინიჭებული — ჯერ გაუუქმეთ მინიჭება.` })
    return
  }

  const { error } = await supabaseAdmin.from('roles').delete().eq('id', req.params.id)
  if (error) { res.status(400).json({ error: error.message }); return }
  res.json({ success: true })
})

/* ── Users ────────────────────────────────────────────────── */

// List all auth users enriched with their DB role from user_roles
adminRouter.get('/users', async (_req, res) => {
  const [{ data: authData, error: authErr }, { data: urData }] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers(),
    supabaseAdmin.from('user_roles').select('user_id, roles(id, name, permissions)'),
  ])

  if (authErr) { res.status(500).json({ error: authErr.message }); return }

  // userId → first assigned role
  const roleMap: Record<string, unknown> = {}
  for (const ur of (urData ?? []) as { user_id: string; roles: unknown }[]) {
    if (!roleMap[ur.user_id]) roleMap[ur.user_id] = ur.roles
  }

  res.json({ users: authData.users.map(u => ({ ...u, dbRole: roleMap[u.id] ?? null })) })
})

adminRouter.post('/users', requirePermission('can_add_users'), async (req, res) => {
  const { email, password, roleId } = (req.body ?? {}) as { email?: string; password?: string; roleId?: string }

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' })
    return
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters.' })
    return
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true })
  if (error) { res.status(400).json({ error: error.message }); return }

  // Assign role in user_roles table if a roleId was provided
  if (roleId && data.user) {
    const { error: roleErr } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: data.user.id, role_id: roleId })
    if (roleErr) {
      res.status(207).json({ error: `User created but role assignment failed: ${roleErr.message}` })
      return
    }
  }

  res.status(201).json({ user: data.user })
})

adminRouter.delete('/users', requireSuperAdmin, async (req, res) => {
  const id = typeof req.query.id === 'string' ? req.query.id : ''
  if (!id) { res.status(400).json({ error: 'User id is required.' }); return }
  if (id === req.caller!.user.id) {
    res.status(400).json({ error: 'You cannot delete your own account.' })
    return
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
  if (error) { res.status(400).json({ error: error.message }); return }
  res.json({ success: true })
})
