import { getJobDetails } from "@/lib/api";
import Banner from "@/Components/ReuseableComponent/Banner";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// ─── Dynamic SEO Metadata ─────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const job = await getJobDetails(slug);
  const seoData = job?.seoData;

  if (!seoData) return {};

  const ogImage = seoData.ogImage || "/loginPage/contact-about-bg.webp";

  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.tags ? seoData.tags.split(",").map((t) => t.trim()) : [],
    openGraph: {
      title: seoData.title,
      description: seoData.description,
      url: seoData.canonicalUrl,
      siteName: seoData.siteName,
      images: [{ url: ogImage, width: 1200, height: 630, alt: seoData.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seoData.title,
      description: seoData.description,
      images: [ogImage],
    },
    alternates: {
      canonical: seoData.canonicalUrl,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function JobDetails({ params }) {
  const { slug } = await params;
  const job = await getJobDetails(slug);

  if (!job) return notFound();

  return (
    <div>
      <Banner
        image={"/loginPage/contact-about-bg.webp"}
        title={"apply to Tekzo"}
      />

      <main className="max-w-7xl mx-auto pt-4 lg:pt-16">
        <div className="lg:flex gap-8 lg:gap-16">
          {/* LEFT COLUMN: Description + Image */}
          <div className="lg:w-3/5 hidden lg:block">
            <div className="lg:mb-10">
              <h2 className="text-primary text-xl font-bold mb-6">
                Job Description
              </h2>
              <ul className="space-y-4">
                {job.description?.map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-slate-600 leading-relaxed"
                  >
                    <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-secondary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="aspect-5/3 overflow-hidden rounded-3xl hidden lg:block">
              {/* <Image
                src={imageSrc}
                alt={job.heading}
                height={3000}
                width={4000}
                className="w-full object-cover"
              /> */}
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar */}
          <div className="lg:w-2/5">
            <div className="bg-white border border-slate-100 rounded-3xl p-4 lg:p-8 shadow-xl shadow-slate-100/50 sticky top-8">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-secondary mb-8">
                {job.heading}
              </h1>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div>
                  <p className="text-primary font-bold text-xs uppercase tracking-widest mb-1">
                    Vacancy
                  </p>
                  <p className="text-slate-700 font-semibold">
                    {job.vacancies}
                  </p>
                </div>
                <div>
                  <p className="text-primary font-bold text-xs uppercase tracking-widest mb-1">
                    Salary
                  </p>
                  <p className="text-slate-700 font-semibold text-sm">
                    {job.salary}
                  </p>
                </div>
                <div>
                  <p className="text-primary font-bold text-xs uppercase tracking-widest mb-1">
                    Job Type
                  </p>
                  <p className="text-slate-700 font-semibold">{job.type}</p>
                </div>
                <div>
                  <p className="text-primary font-bold text-xs uppercase tracking-widest mb-1">
                    Deadline
                  </p>
                  <p className="text-slate-700 font-semibold text-sm">
                    {job.deadline}
                  </p>
                </div>
              </div>

              {/* Qualification */}
              {job.qualification?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-primary font-bold mb-4">Requirements</h3>
                  <ul className="space-y-3">
                    {job.qualification.map((req, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-sm text-slate-600 leading-relaxed"
                      >
                        <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-secondary flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {job.benefits?.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-primary font-bold mb-4">Benefits</h3>
                  <ul className="space-y-3">
                    {job.benefits.map((benefit, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-sm text-slate-600 leading-relaxed"
                      >
                        <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-secondary flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Job Description — mobile only */}
              <div className="mb-10 lg:hidden">
                <h3 className="text-primary font-bold mb-4">Job Description</h3>
                <ul className="space-y-3">
                  {job.description?.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-slate-600 leading-relaxed"
                    >
                      <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-secondary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Apply Button */}
              <Link
                href={`/careers/application-form?job=${slug}`}
                className="block w-full bg-secondary hover:bg-[#008d77] text-white text-center py-4 rounded-xl font-bold transition-all active:scale-[0.98]"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
