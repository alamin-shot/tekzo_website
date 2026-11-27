import { Mail, Phone, MapPin, Clock, Headphones, ArrowUpRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import ContactForm from "@/Components/Contact/ContactForm";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import { getSeoPage, getSettings } from "@/lib/api";
import type { Metadata } from "next";
import { rec, requireString } from "@/lib/json";
import { nodeOf, str } from "@/lib/render";
import { tagsOr } from "@/lib/seo/metadata";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoPage("contact-us");
  if (!seo) return {};
  // `seoData.x` on a truthy payload (a primitive has no fields, as before)
  const seoData = rec(seo);

  return {
    title: str(seoData?.title) || "Contact Us | TEKZO",
    description: str(seoData?.description) || "Get in touch with TEKZO for customer support, product inquiries, and warranty services.",
    keywords: tagsOr(seoData?.tags, []),
    openGraph: {
      title: str(seoData?.title) || "Contact Us | TEKZO",
      description: str(seoData?.description) || "Get in touch with TEKZO.",
      url: `${String(seoData?.canonicalUrl)}/contact-us`,
      siteName: str(seoData?.siteName) || "TEKZO",
      images: [
        {
          url: str(seoData?.ogImage) || "/loginPage/contact-about-bg.webp",
          width: 1200,
          height: 630,
          alt: str(seoData?.title) || "Contact Us",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: str(seoData?.title) || "Contact Us | TEKZO",
      description: str(seoData?.description),
      images: [{ url: str(seoData?.ogImage) || "/all-product-banner.webp", width: 1200, height: 630, alt: str(seoData?.title) }],
    },
    alternates: {
      canonical: `${String(seoData?.canonicalUrl)}/contact-us`,
    },
  };
}

export default async function ContactPage() {
  const [settings, seo] = await Promise.all([getSettings(), getSeoPage("contact-us")]);
  const companySetting = rec(settings);
  const seoData = rec(seo);

  const phone = companySetting?.primary_phone_number || "+8801897-715222";
  const email = companySetting?.support_email || "support@tekzo.com.bd";
  const address = companySetting?.primary_address || "Dhaka, Bangladesh";
  const locationLink = companySetting?.location_link || "https://maps.google.com";

  return (
    <div>
      <Banner image={seoData?.banner || "/all-product-banner.webp"} title={seoData?.title || "Contact Us"} />

      <Breadcrumbs />
      <div className="container">
        <main className="py-4 lg:py-8 space-y-8 lg:space-y-12">
          {/* Header Introduction with Badge */}
          <div className="text-center max-w-3xl mx-auto pt-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">Get In Touch</h1>
            <p className="text-gray-500 text-xs sm:text-base mt-3 leading-relaxed font-medium">
              Have a question about a product, need warranty assistance, or want to share feedback? Our team is always here to provide quick, helpful support.
            </p>
          </div>

          {/* Form & Detailed Info Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Form Column (2 Cols) */}
            <ContactForm />

            {/* Info & Map Column (1 Col) */}
            <div className="lg:col-span-1 bg-dark p-6 sm:p-8 my-rounded border border-gray-100 shadow-sm space-y-6 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-primary text-xs font-bold uppercase tracking-wider mb-2.5 border border-gray-200/70 shadow-2xs">
                  <Headphones size={13} className="text-primary" />
                  Direct Channels
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-5">Office & Support</h3>

                <div className="space-y-4">
                  {/* Address Item */}
                  <div className="flex items-start gap-3.5 p-3.5 bg-white/70 rounded-xl border border-gray-200/60 shadow-2xs">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Head Office</h4>
                      <p className="text-sm font-semibold text-gray-800 leading-relaxed mt-0.5">{nodeOf(address)}</p>
                    </div>
                  </div>

                  {/* Phone Item */}
                  <a
                    href={`tel:${requireString(phone).replace(/\s+/g, "")}`}
                    className="flex items-start gap-3.5 p-3.5 bg-white/70 rounded-xl border border-gray-200/60 shadow-2xs hover:bg-white transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                      <Phone size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Direct Phone</h4>
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors mt-0.5">{nodeOf(phone)}</p>
                    </div>
                  </a>

                  {/* Email Item */}
                  <a href={`mailto:${String(email)}`} className="flex items-start gap-3.5 p-3.5 bg-white/70 rounded-xl border border-gray-200/60 shadow-2xs hover:bg-white transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0 group-hover:bg-secondary group-hover:text-white transition-colors">
                      <Mail size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Official Email</h4>
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-secondary transition-colors mt-0.5 truncate">{nodeOf(email)}</p>
                    </div>
                  </a>

                  {/* Working Hours */}
                  <div className="flex items-start gap-3.5 p-3.5 bg-white/70 rounded-xl border border-gray-200/60 shadow-2xs">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Clock size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Support Hours</h4>
                      <p className="text-sm font-semibold text-gray-800 leading-relaxed mt-0.5">10:00 AM – 08:00 PM (Everyday)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Live Map</span>
                  <a href={str(locationLink)} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
                    Open in Maps <ArrowUpRight size={13} />
                  </a>
                </div>
                <div className="w-full h-48 sm:h-52 rounded-2xl overflow-hidden relative border border-gray-200/90 shadow-2xs">
                  <iframe
                    src={str(locationLink)}
                    className="w-full h-full transition-all duration-500 ease-in-out"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="TEKZO Location Map"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* Page Description Section */}
      <PageDescription title="Learn More About TEKZO Customer Support" description={seoData?.description} />
    </div>
  );
}
