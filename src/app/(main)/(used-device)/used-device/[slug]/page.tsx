import { getPreOwnedProducts, getConditions, getStorages } from "@/lib/api";
import PreOwnedDeviceClient from "@/Components/PreownedDevice/PreOwnedDeviceClient";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import type { Metadata } from "next";
import type { ParamsOnlyProps, SlugPageProps } from "@/types/route";
import { fieldsOf, rec } from "@/lib/json";
import { str } from "@/lib/render";

export async function generateMetadata({ params }: ParamsOnlyProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getPreOwnedProducts(slug);
  const seo = rec(rec(rec(res)?.data)?.seoData);
  if (!seo) return {};
  return {
    title: str(seo.title),
    description: str(seo.description),
    keywords: str(seo.tags),
    alternates: { canonical: str(seo.canonical) },
    openGraph: {
      title: str(seo.title),
      description: str(seo.description),
      siteName: str(seo.siteName),
      images: seo.ogImage ? [{ url: str(seo.ogImage) ?? "" }] : [],
    },
  };
}

export default async function PreOwnedDevicePage({ params, searchParams }: SlugPageProps) {
  const { slug } = await params;
  const { page } = fieldsOf(await searchParams);
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

  const resData = rec(rec(productsRes)?.data);
  const listings = resData?.preOwneds ?? [];
  const brandRaw = resData?.brand ?? null;
  const brand = rec(brandRaw);
  const seo = rec(resData?.seoData ?? null);
  const pagination = resData?.pagination ?? null;

  return (
    <div>
      <PreOwnedDeviceClient
        listings={listings}
        conditions={conditions}
        storages={storages}
        brand={brandRaw}
        pagination={pagination}
        currentPage={currentPage}
      />
      <PageDescription
        title={
          brand?.name
            ? `Learn More About Used ${String(brand.name)}`
            : "Learn More About Pre-Owned Devices"
        }
        description={seo?.long_description}
      />
    </div>
  );
}
