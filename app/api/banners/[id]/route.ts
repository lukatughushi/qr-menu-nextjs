import { NextRequest, NextResponse } from "next/server";
import { getCaller, resolvePermissions } from "../../../../lib/rbac";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    return NextResponse.json({ error: "Invalid banner id" }, { status: 400 });
  }

  const { user, isSuperAdmin, problem } = await getCaller(req);
  if (!user) return NextResponse.json({ error: problem }, { status: 401 });

  const permissions = await resolvePermissions(user.id, isSuperAdmin);
  if (!permissions.can_manage_banners) {
    return NextResponse.json({ error: "can_manage_banners permission required" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("hero_banners")
    .delete()
    .eq("id", numId)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "No rows deleted — check RLS policy." }, { status: 403 });
  }
  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    return NextResponse.json({ error: "Invalid banner id" }, { status: 400 });
  }

  const { user, isSuperAdmin, problem } = await getCaller(req);
  if (!user) return NextResponse.json({ error: problem }, { status: 401 });

  const permissions = await resolvePermissions(user.id, isSuperAdmin);
  if (!permissions.can_manage_banners) {
    return NextResponse.json({ error: "can_manage_banners permission required" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("hero_banners")
    .update(body)
    .eq("id", numId)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "No rows updated — check RLS policy." }, { status: 403 });
  }
  return NextResponse.json({ success: true, data: data[0] });
}
