import type { Request, Response, NextFunction } from 'express'
import type { User } from '@supabase/supabase-js'
import { supabaseAdmin } from './supabaseAdmin.js'
import { ALL_PERMISSIONS, FULL_PERMISSIONS } from './permissions.js'
import type { PermissionKey, Permissions } from './permissions.js'

export interface Caller {
  user: User
  isSuperAdmin: boolean
}

declare module 'express-serve-static-core' {
  interface Request {
    caller?: Caller
  }
}

// Merges permissions from all roles the user has been assigned in user_roles.
// Superadmins bypass the table and get every permission.
export async function resolvePermissions(userId: string, isSuperAdmin: boolean): Promise<Permissions> {
  if (isSuperAdmin) return FULL_PERMISSIONS
  const { data } = await supabaseAdmin
    .from('user_roles')
    .select('roles(permissions)')
    .eq('user_id', userId)
  const merged: Permissions = {}
  for (const row of (data ?? []) as { roles: { permissions?: Record<string, boolean> } | null }[]) {
    const perms = row.roles?.permissions ?? {}
    for (const key of ALL_PERMISSIONS) {
      if (perms[key] === true) merged[key] = true
    }
  }
  return merged
}

// Verifies the Supabase access token from the Authorization header and sets req.caller.
export async function requireUser(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing Authorization header.' })
    return
  }
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(auth.slice(7))
  if (error) { res.status(401).json({ error: `Token error: ${error.message}` }); return }
  if (!user)  { res.status(401).json({ error: 'No user found for this token.' }); return }
  req.caller = { user, isSuperAdmin: user.app_metadata?.role === 'admin' }
  next()
}

// Must run after requireUser.
export function requirePermission(key: PermissionKey) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { user, isSuperAdmin } = req.caller!
    const permissions = await resolvePermissions(user.id, isSuperAdmin)
    if (!permissions[key]) {
      res.status(403).json({ error: `Forbidden: ${key} required.` })
      return
    }
    next()
  }
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.caller?.isSuperAdmin) {
    res.status(403).json({ error: 'Forbidden: superadmin required.' })
    return
  }
  next()
}
