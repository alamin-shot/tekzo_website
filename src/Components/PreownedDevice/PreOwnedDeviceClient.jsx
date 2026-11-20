"use client";

import { useMemo, useTransition, useState } from "react";
import { formatHtml } from "@/lib/formatHtml";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import DeviceCard from "@/Components/PreownedDevice/DeviceCard";
import PreOwnedFilter from "@/Components/PreownedDevice/PreOwnedFilter";
import Pagination from "@/Components/Shop/Pagination";
import { useEnsureScrolling } from "@/hooks/useBodyScrollLock";
import Banner from "../ReuseableComponent/Banner";
import Breadcrumbs from "../ReuseableComponent/Breadcrumbs";
import Image from "next/image";

// Import Common Modal and Content Components
import CommonModal from "@/Components/PreownedDevice/CommonModal";
import TechnicalSpecsContent from "@/Components/PreownedDevice/ModalContents/TechnicalSpecsContent";
import PerksContent from "@/Components/PreownedDevice/ModalContents/PerksContent";
import FAQContent from "@/Components/PreownedDevice/ModalContents/FAQContent";
import DeliveryContent from "@/Components/PreownedDevice/ModalContents/DeliveryContent";
import DeviceConditionContent from "@/Components/PreownedDevice/ModalContents/DeviceConditionContent";

export default function PreOwnedDeviceClient({
  listings,
  conditions,
  storages,
  brand,
  pagination,
  currentPage,
}) {
  useEnsureScrolling();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [showPerksModal, setShowPerksModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  void isPending;

  // Derive filter values directly from URL
  const selectedCondition = searchParams.get("condition") || null;
  const selectedStorage = searchParams.get("storage") || null;
  const minPrice = searchParams.get("min_price") || null;
  const maxPrice = searchParams.get("max_price") || null;
  const sortBy = searchParams.get("sort_by") || null;
  const batteryHealth = searchParams.get("battery_health") || null;

  const romOnlyStorages = useMemo(() => {
    return storages.filter((s) => !s.name.includes("/"));
  }, [storages]);
  void romOnlyStorages;

  // Client-side filtering
  const filteredListings = useMemo(() => {
    let filtered = [...listings];

    if (selectedCondition) {
      const conditionId = parseInt(selectedCondition);
      filtered = filtered.filter((listing) => {
        if (listing.condition_id === conditionId) return true;
        const conditionAttr = listing?.attributes?.find(
          (a) => a.name === "Condition",
        );
        if (conditionAttr) {
          const condition = conditions.find((c) => c.id === conditionId);
          return conditionAttr.value.includes(condition?.name);
        }
        return false;
      });
    }

    if (selectedStorage) {
      const storageGB = parseInt(selectedStorage);
      filtered = filtered.filter((listing) => {
        const storageAttr = listing?.attributes?.find(
          (a) => a.name === "Storage",
        );
        if (storageAttr) {
          const match = storageAttr.value.match(/(\d+)\s*(GB|TB)/i);
          if (match) {
            let deviceStorageGB = parseInt(match[1]);
            if (match[2].toUpperCase() === "TB") {
              deviceStorageGB *= 1024;
            }
            return deviceStorageGB === storageGB;
          }
        }
        if (listing.storage_id) {
          const storage = storages.find((s) => s.id === listing.storage_id);
          if (storage) {
            const match = storage.name.match(/(\d+)\s*(GB|TB)/i);
            if (match) {
              let deviceStorageGB = parseInt(match[1]);
              if (match[2].toUpperCase() === "TB") {
                deviceStorageGB *= 1024;
              }
              return deviceStorageGB === storageGB;
            }
          }
        }
        return false;
      });
    }

    if (minPrice || maxPrice) {
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;
      filtered = filtered.filter((listing) => {
        const price = Number(listing.final_price ?? listing.regular_price) || 0;
        return price >= min && price <= max;
      });
    }

    if (batteryHealth) {
      if (batteryHealth === "0-80") {
        filtered = filtered.filter((listing) => {
          const battery = listing.battery_health || 0;
          return battery < 80;
        });
      } else {
        const [minBattery, maxBattery] = batteryHealth.split("-").map(Number);
        filtered = filtered.filter((listing) => {
          const battery = listing.battery_health || 0;
          return battery >= minBattery && battery <= maxBattery;
        });
      }
    }

    if (sortBy === "price_asc") {
      filtered.sort(
        (a, b) =>
          (Number(a.final_price ?? a.regular_price) || 0) -
          (Number(b.final_price ?? b.regular_price) || 0),
      );
    } else if (sortBy === "price_desc") {
      filtered.sort(
        (a, b) =>
          (Number(b.final_price ?? b.regular_price) || 0) -
          (Number(a.final_price ?? a.regular_price) || 0),
      );
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => b.id - a.id);
    }

    return filtered;
  }, [
    listings,
    selectedCondition,
    selectedStorage,
    minPrice,
    maxPrice,
    sortBy,
    batteryHealth,
    conditions,
    storages,
  ]);

  const availableConditions = useMemo(() => {
    const inStockListings = listings.filter(
      (listing) => listing.is_stock === 1 || listing.is_stock === true,
    );
    const conditionIds = new Set();

    inStockListings.forEach((listing) => {
      if (listing.condition_id) {
        conditionIds.add(listing.condition_id);
      }
      const conditionAttr = listing?.attributes?.find(
        (a) => a.name === "Condition",
      );
      if (conditionAttr) {
        const matchingCondition = conditions.find((c) =>
          conditionAttr.value.includes(c.name),
        );
        if (matchingCondition) {
          conditionIds.add(matchingCondition.id);
        }
      }
    });

    return conditions.filter((c) => conditionIds.has(c.id));
  }, [listings, conditions]);

  const handleConditionFilter = (conditionId) => {
    const params = new URLSearchParams(window.location.search);

    if (conditionId && conditionId !== selectedCondition) {
      params.set("condition", conditionId);
    } else {
      params.delete("condition");
    }

    const newUrl = `${pathname}${params.toString() ? `?${params}` : ""}`;
    startTransition(() => {
      router.replace(newUrl, { scroll: false });
    });
  };

  const hasAnyFilter =
    selectedCondition ||
    selectedStorage ||
    minPrice ||
    maxPrice ||
    sortBy ||
    batteryHealth;

  const product = listings[0];

  const keyFeatures = [
    { icon: "📱", label: "Authentic Devices", desc: "100% genuine products" },
    { icon: "🛡️", label: "Quality Assured", desc: "Rigorous testing process" },
    { icon: "🔋", label: "Battery Health", desc: "Minimum 80% capacity" },
    { icon: "📦", label: "Secure Packaging", desc: "Protected delivery" },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      `}</style>

      <div className="min-h-screen overflow-y-auto">
        <Banner
          image={brand?.shop_banner || "/all-product-banner.webp"}
          title={brand?.name || "Pre-Owned Devices"}
        />
        {/* Top Product Information Section */}
        <div className="z-30">
          <Breadcrumbs />
          <div className="">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-stretch items-start">
              {/* Product Image & Info - Combined in Single Box */}
              <div className="lg:col-span-8 flex">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-4 border-2 border-gray-200 shadow-inner flex-1">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Product Image */}
                    <div className="lg:col-span-4">
                      <div className="relative bg-white rounded-xl aspect-3/4 lg:aspect-6/7 overflow-hidden group shadow-md border border-gray-200">
                        <Image
                          src={product?.product_image || "/placeholder.jpg"}
                          alt={product?.product_name || "Product"}
                          fill
                          sizes="(max-width: 1024px) 100vw, 30vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="lg:col-span-8">
                      <div className="flex flex-col h-full">
                        {/* Product Title & Description */}
                        <div className="mb-4">
                          <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 leading-tight mb-3">
                            {product?.product_name}
                          </h1>
                          <div className="max-h-30 overflow-auto">
                            <p
                              className="text-sm lg:text-base text-gray-600 leading-relaxed rendered-html"
                              dangerouslySetInnerHTML={{
                                __html: formatHtml(product?.short_description),
                              }}
                            ></p>
                          </div>
                        </div>

                        {/* Product Quality Badges */}
                        <div className="grid grid-cols-2 gap-2.5 ">
                          {keyFeatures.map((feature, idx) => (
                            <div
                              key={idx}
                              className="relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-3 hover:shadow-md hover:border-teal-400 transition-all duration-300 group"
                            >
                              {/* Subtle gradient overlay */}
                              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                              <div className="relative flex items-center gap-3">
                                <div className="text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                                  {feature.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs lg:text-sm font-bold text-gray-900 mb-0.5 leading-tight">
                                    {feature.label}
                                  </p>
                                  <p className="text-[10px] lg:text-xs text-gray-500 leading-snug">
                                    {feature.desc}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Learn More About Condition Button */}
                        <button
                          onClick={() => setShowConditionModal(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 mt-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group"
                        >
                          <svg
                            className="w-4 h-4 group-hover:scale-110 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Learn About Device Conditions
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action & Info Cards - Right Column */}
              <div className="lg:col-span-4 flex">
                <div className="flex flex-col gap-3 flex-1 w-full">
                  {/* Boxed Action Buttons Group */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-4 border-2 border-gray-200 shadow-inner flex-1 flex flex-col">
                    <div className="flex flex-col gap-2.5">
                      {/* Technical Specifications */}
                      <button
                        onClick={() => setShowSpecsModal(true)}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-blue-50 hover:shadow-md transition-all duration-300 group border border-gray-200 hover:border-blue-400"
                      >
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-sm font-bold text-gray-900">
                            Technical Specs
                          </p>
                          <p className="text-xs text-gray-500">View details</p>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>

                      {/* Perks & Benefits */}
                      <button
                        onClick={() => setShowPerksModal(true)}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-teal-50 hover:shadow-md transition-all duration-300 group border border-gray-200 hover:border-teal-400"
                      >
                        <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                            />
                          </svg>
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-sm font-bold text-gray-900">
                            Perks & Benefits
                          </p>
                          <p className="text-xs text-gray-500">What you get</p>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 group-hover:text-teal-500 transition-colors"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>

                      {/* FAQ */}
                      <button
                        onClick={() => setShowFAQModal(true)}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-purple-50 hover:shadow-md transition-all duration-300 group border border-gray-200 hover:border-purple-400"
                      >
                        <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-sm font-bold text-gray-900">FAQ</p>
                          <p className="text-xs text-gray-500">
                            Common questions
                          </p>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                      {/* Delivery Info - Action Button Style */}
                      <button
                        onClick={() => setShowDeliveryModal(true)}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-amber-50 hover:shadow-md transition-all duration-300 group border border-gray-200 hover:border-amber-400"
                      >
                        <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-orange-700 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-sm font-bold text-gray-900">
                            Fast Delivery
                          </p>
                          <p className="text-xs text-gray-500">View timeline</p>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                      {/* Live Viewers - Eye Icon Design */}
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl shadow-sm border border-red-200">
                        <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center shrink-0 shadow-md">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-sm font-bold text-gray-900">
                            <span className="text-red-600 font-extrabold">
                              21
                            </span>{" "}
                            people
                          </p>
                          <p className="text-xs text-gray-500">
                            viewing this now
                          </p>
                        </div>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="py-6 lg:py-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
              Available Units
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredListings.length} of {listings.length} listings{" "}
              {hasAnyFilter && "(filtered)"}
            </p>
          </div>

          {/* Condition Chips */}
          {availableConditions && availableConditions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6 pb-6 border-b border-gray-200">
              <button
                onClick={() => handleConditionFilter(null)}
                className={`
                  shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                  hover:scale-105 active:scale-95
                  ${
                    !selectedCondition
                      ? "bg-gradient-to-r from-teal-500 to-teal-500 text-white shadow-teal-500/30"
                      : "bg-white border-2 border-gray-200 text-gray-700 hover:border-teal-300 hover:bg-teal-50"
                  }
                `}
              >
                All Conditions
              </button>
              {availableConditions.map((condition) => {
                const isActive = selectedCondition === String(condition.id);
                return (
                  <button
                    key={condition.id}
                    onClick={() => handleConditionFilter(String(condition.id))}
                    className={`
                      shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                      hover:scale-105 active:scale-95
                      ${
                        isActive
                          ? "bg-gradient-to-r from-teal-500 to-teal-500 text-white shadow-lg shadow-teal-500/30"
                          : "bg-white border-2 border-gray-200 text-gray-700 hover:border-teal-300 hover:bg-teal-50"
                      }
                    `}
                  >
                    {condition.name}
                  </button>
                );
              })}
            </div>
          )}

          <PreOwnedFilter
            currentFilters={{
              min_price: minPrice || "",
              max_price: maxPrice || "",
              sort_by: sortBy || "",
              battery_health: batteryHealth || "",
              storage: selectedStorage || "",
            }}
          />

          {/* Products Grid */}
          {filteredListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-gray-200">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl mb-4 shadow-inner">
                📦
              </div>
              <p className="text-lg font-bold text-gray-700 mb-1">
                No units available
              </p>
              <p className="text-sm text-gray-500">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-3 2xl:gap-4"
              style={{ animation: "fadeUp 0.3s ease" }}
            >
              {filteredListings.map((listing) => (
                <DeviceCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          {/* Pagination reflects the server-side page of `listings` — hide
              it once client-side filters narrow that down, same as the
              main used-device listing page. */}
          {!hasAnyFilter && (
            <Pagination
              shopProducts={{ pagination }}
              currentPage={currentPage}
            />
          )}
        </main>

        {/* Technical Specifications Modal */}
        <CommonModal
          isOpen={showSpecsModal}
          onClose={() => setShowSpecsModal(false)}
          title="Technical Specifications"
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          gradientFrom="blue-500"
          gradientTo="blue-600"
          borderColor="blue-400"
        >
          <TechnicalSpecsContent product={product} />
        </CommonModal>

        {/* Perks & Benefits Modal */}
        <CommonModal
          isOpen={showPerksModal}
          onClose={() => setShowPerksModal(false)}
          title="Perks & Benefits"
          icon="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
          gradientFrom="teal-500"
          gradientTo="teal-600"
          borderColor="teal-400"
        >
          <PerksContent />
        </CommonModal>

        {/* FAQ Modal */}
        <CommonModal
          isOpen={showFAQModal}
          onClose={() => setShowFAQModal(false)}
          title="Frequently Asked Questions"
          icon="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          gradientFrom="purple-500"
          gradientTo="purple-600"
          borderColor="purple-400"
          maxWidth="lg:w-[700px]"
        >
          <FAQContent />
        </CommonModal>

        {/* Delivery Information Modal */}
        <CommonModal
          isOpen={showDeliveryModal}
          onClose={() => setShowDeliveryModal(false)}
          title="Delivery Information"
          icon="M13 10V3L4 14h7v7l9-11h-7z"
          gradientFrom="amber-500"
          gradientTo="orange-700"
          borderColor="amber-400"
          maxWidth="lg:w-[650px]"
        >
          <DeliveryContent />
        </CommonModal>

        {/* Device Condition Modal */}
        <CommonModal
          isOpen={showConditionModal}
          onClose={() => setShowConditionModal(false)}
          title="Device Condition Guide"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          gradientFrom="indigo-500"
          gradientTo="purple-600"
          borderColor="indigo-400"
          maxWidth="lg:w-[750px]"
        >
          <DeviceConditionContent />
        </CommonModal>
      </div>
    </>
  );
}
