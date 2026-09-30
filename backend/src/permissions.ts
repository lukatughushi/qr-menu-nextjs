export const ALL_PERMISSIONS = [
  'can_edit_menu',
  'can_delete_menu',
  'can_add_users',
  'can_manage_roles',
  'can_view_orders',
  'can_manage_reservations',
  'can_manage_banners',
] as const

export type PermissionKey = typeof ALL_PERMISSIONS[number]
export type Permissions = Partial<Record<PermissionKey, boolean>>

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  can_edit_menu:           'მენიუს რედაქტირება',
  can_delete_menu:         'მენიუს წაშლა',
  can_add_users:           'მომხმარებლის დამატება',
  can_manage_roles:        'როლების მართვა',
  can_view_orders:         'შეკვეთების ნახვა',
  can_manage_reservations: 'ჯავშნების მართვა',
  can_manage_banners:      'ბანერების მართვა',
}

// Superadmins get every permission set to true.
export const FULL_PERMISSIONS: Permissions = Object.fromEntries(
  ALL_PERMISSIONS.map(k => [k, true])
) as Permissions
