import { getPreOwnedProducts, getConditions, getStorages } from "@/lib/api";
import PreOwnedDeviceClient from "@/Components/PreownedDevice/PreOwnedDeviceClient";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const res = await getPreOwnedProducts(slug);
  const seo = res?.data?.seoData;
  if (!seo) return {};
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.tags,
    alternates: { canonical: seo.canonical },
    openGraph: {
      title: seo.title,
      description: seo.description,
      siteName: seo.siteName,
      images: seo.ogImage ? [{ url: seo.ogImage }] : [],
    },
  };
}

export default async function PreOwnedDevicePage({ params, searchParams }) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  const [productsRes, conditions, storages] = await Promise.all([
    getPreOwnedProducts(slug, currentPage),
    getConditions(),
    getStorages(),
  ]);

  if (!productsRes) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center text-3xl mb-4 mx-auto">
            ⚠️
          </div>
          <p className="text-base font-semibold text-gray-700 mb-1">
            Error loading products
          </p>
          <p className="text-sm text-gray-400">Failed to load products</p>
        </div>
      </div>
    );
  }

  const listings = productsRes?.data?.preOwneds ?? [];
  const brand = productsRes?.data?.brand ?? null;
  const seo = productsRes?.data?.seoData ?? null;
  const pagination = productsRes?.data?.pagination ?? null;

  return (
    <div>
      <PreOwnedDeviceClient
        listings={listings}
        conditions={conditions}
        storages={storages}
        brand={brand}
        pagination={pagination}
        currentPage={currentPage}
      />
      <PageDescription
        title={
          brand?.name
            ? `Learn More About Used ${brand.name}`
            : "Learn More About Pre-Owned Devices"
        }
        description={seo?.long_description}
      />
    </div>
  );
}
