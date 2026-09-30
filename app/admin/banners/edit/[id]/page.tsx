import { supabase } from "../../../../../lib/supabaseClient";
import BannerForm from "../../components/BannerForm";

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = parseInt(id, 10);

  console.log("Target ID:", id, "| parsed:", numId);

  if (isNaN(numId) || numId <= 0) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "#6b7280" }}>
        Invalid banner ID.
      </div>
    );
  }

  const { data, error } = await supabase
    .from("hero_banners")
    .select("*")
    .eq("id", numId)
    .single();

  console.log("Supabase result — data:", data, "| error:", error);

  if (error || !data) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "#6b7280" }}>
        Banner not found (ID: {numId}).
      </div>
    );
  }

  return <BannerForm initialData={data} />;
}
