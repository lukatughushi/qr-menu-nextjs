"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import type { Permissions, PermissionKey } from "./permissions";

interface PermissionsContextValue {
  permissions: Permissions;
  isSuperAdmin: boolean;
  loading: boolean;
  can: (key: PermissionKey) => boolean;
}

const PermissionsContext = createContext<PermissionsContextValue>({
  permissions: {},
  isSuperAdmin: false,
  loading: true,
  can: () => false,
});

export function usePermissions() {
  return useContext(PermissionsContext);
}

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const [permissions, setPermissions] = useState<Permissions>({});
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      const res = await fetch("/api/admin/me", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setPermissions(json.permissions ?? {});
        setIsSuperAdmin(json.isSuperAdmin ?? false);
      }
      setLoading(false);
    }
    load();
  }, []);

  function can(key: PermissionKey): boolean {
    return isSuperAdmin || permissions[key] === true;
  }

  return (
    <PermissionsContext.Provider value={{ permissions, isSuperAdmin, loading, can }}>
      {children}
    </PermissionsContext.Provider>
  );
}
