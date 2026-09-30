import { supabase } from "../../../../../lib/supabaseClient";
import MenuItemForm from "../../components/MenuItemForm";

export default async function EditMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "#6b7280" }}>
        Menu item not found.
      </div>
    );
  }

  return <MenuItemForm mode="edit" initialData={data} />;
}
