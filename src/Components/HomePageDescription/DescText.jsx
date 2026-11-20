import { formatHtml } from "@/lib/formatHtml";

export default function DescText({ companySetting }) {
  const desc = companySetting?.seoData?.long_description || "";

  if (!desc) return null;

  return (
    <div className="my-5">
      <div className="p-5 md:p-10 bg-dark border border-gray-100 my-rounded text-gray-800 font-medium leading-relaxed rendered-html" dangerouslySetInnerHTML={{ __html: formatHtml(desc) }}></div>
    </div>
  );
}
