// Server-only — never import from client components.
import { NextRequest } from 'next/server'
import { supabaseAdmin } from './supabaseAdmin'
import { ALL_PERMISSIONS, FULL_PERMISSIONS } from './permissions'
import type { Permissions } from './permissions'

type User = NonNullable<Awaited<ReturnType<typeof supabaseAdmin.auth.getUser>>['data']['user']>

export type CallerResult =
  | { user: User; isSuperAdmin: boolean; problem: null }
  | { user: null;  isSuperAdmin: false;  problem: string }

export async function getCaller(req: NextRequest): Promise<CallerResult> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || key === 'your_service_role_key_here') {
    return { user: null, isSuperAdmin: false, problem: 'SUPABASE_SERVICE_ROLE_KEY is not configured in .env.local.' }
  }
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    return { user: null, isSuperAdmin: false, problem: 'Missing Authorization header.' }
  }
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(auth.slice(7))
  if (error) return { user: null, isSuperAdmin: false, problem: `Token error: ${error.message}` }
  if (!user)  return { user: null, isSuperAdmin: false, problem: 'No user found for this token.' }
  return { user, isSuperAdmin: user.app_metadata?.role === 'admin', problem: null }
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
  for (const row of (data ?? []) as any[]) {
    const perms: Record<string, boolean> = row.roles?.permissions ?? {}
    for (const key of ALL_PERMISSIONS) {
      if (perms[key] === true) merged[key] = true
    }
  }
  return merged
}
