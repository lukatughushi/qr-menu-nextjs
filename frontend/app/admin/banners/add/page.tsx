import BannerForm from "../components/BannerForm";

export default function AddBannerPage() {
  return (
    <BannerForm
      initialData={{
        id: 0,
        title_ka: "",
        subtitle_ka: "",
        title_en: "",
        subtitle_en: "",
        image_url: null,
      }}
      isNew
    />
  );
}
