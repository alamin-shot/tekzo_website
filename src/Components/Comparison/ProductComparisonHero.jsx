"use client";

import React, { useEffect, useRef, useState } from "react";
import { lockScroll, unlockScroll } from "@/utils/scrollLock";
import Image from "next/image";
import { Search } from "lucide-react";
import { IoCloseOutline } from "react-icons/io5";
import { AnimatePresence, motion } from "framer-motion";
import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import Title2 from "@/Components/ReuseableComponent/Title2";
import CompareResult from "@/Components/Compare/CompareResult";

const ProductComparisonHero = ({ seoData }) => {
  const [selectedProducts, setSelectedProducts] = useState([null, null]);
  const [activeSlot, setActiveSlot] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState([false, false]);
  const [detailsError, setDetailsError] = useState([null, null]);

  const modalRef = useRef(null);
  const inputRef = useRef(null);
  const clearBtnRef = useRef(null);

  // Load products from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("compareProducts");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === 2) {
          setSelectedProducts(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to load compare products from localStorage:", err);
    }
  }, []);

  const openSearch = (slot) => {
    setActiveSlot(slot);
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setSearchError(null);
    setIsModalOpen(true);
  };

  const closeSearch = () => {
    setIsModalOpen(false);
    setSearchQuery("");
    setSearchError(null);
    setActiveSlot(0);
  };

  const fetchProductDetails = async (slug, slotIndex) => {
    if (!slug) return null;
    setDetailsError((prev) => {
      const n = [...prev];
      n[slotIndex] = null;
      return n;
    });
    setDetailsLoading((prev) => {
      const n = [...prev];
      n[slotIndex] = true;
      return n;
    });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/${slug}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Could not load product details. Please try again.`);
      const json = await response.json();
      return json?.data || json;
    } catch (error) {
      setDetailsError((prev) => {
        const n = [...prev];
        n[slotIndex] = error.message;
        return n;
      });
      return null;
    } finally {
      setDetailsLoading((prev) => {
        const n = [...prev];
        n[slotIndex] = false;
        return n;
      });
    }
  };

  const handleSelectProduct = async (product) => {
    const slotIndex = activeSlot - 1;
    const slug = product?.slug;
    if (!slug) return;

    const productDetails = await fetchProductDetails(slug, slotIndex);
    if (productDetails) {
      setSelectedProducts((prev) => {
        const next = [...prev];
        next[slotIndex] = productDetails;
        // Save to localStorage
        try {
          localStorage.setItem("compareProducts", JSON.stringify(next));
        } catch (err) {
          console.error("Failed to save compare products to localStorage:", err);
        }
        return next;
      });
      closeSearch();
    }
  };

  // Search with error handling — mirrors Banner.jsx pattern
  useEffect(() => {
    if (!isModalOpen) return;
    const trimmed = searchQuery.trim();

    if (!trimmed) {
      setSearchResults([]);
      setSearchError(null);
      setIsLoading(false);
      return;
    }

    setHasSearched(true);
    setSearchError(null);

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search-products?query=${encodeURIComponent(trimmed)}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Network error. Please check your connection and try again.");
        const data = await res.json();
        setSearchResults(data?.data || data?.products || (Array.isArray(data) ? data : []));
        setSearchError(null);
      } catch (err) {
        console.error("Compare page search error:", err);
        setSearchResults([]);
        setSearchError(err.message || "Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, isModalOpen]);

  // Outside click — mirrors Banner.jsx pattern with clearBtnRef exclusion
  useEffect(() => {
    if (!isModalOpen) return;

    const handleOutside = (e) => {
      if (clearBtnRef.current?.contains(e.target)) return;
      if (modalRef.current && !modalRef.current.contains(e.target) && !inputRef.current?.contains(e.target)) {
        closeSearch();
      }
    };

    lockScroll();
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      unlockScroll();
    };
  }, [isModalOpen]);

  return (
    <div className="">
      <Banner h1="Compare Products" image={seoData?.banner || "/all-product-banner.webp"} title={"compare"} />
      <div className="">
        <Breadcrumbs />
        <section className="flex flex-col items-center w-full mt-6 lg:mt-10">
          <div className="max-w-3xl text-center mb-10">
            <Title2>Compare and Choose the Best Products</Title2>
            <p className="text-xs md:text-sm text-gray-500 leading-relaxed px-6">Search products by name and compare them head-to-head with full specs, pricing, and availability.</p>
          </div>

          <div className="w-full bg-dark py-12 px-6 border border-gray-100 my-rounded shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            {/* Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {[1, 2].map((slot) => {
                const product = selectedProducts[slot - 1];
                const loading = detailsLoading[slot - 1];
                const error = detailsError[slot - 1];

                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => openSearch(slot)}
                    className="group relative w-full text-left bg-[#fcfcfc] hover:bg-white border border-transparent hover:border-orange-500/30 rounded-3xl p-6 transition-all duration-300 shadow-none hover:shadow-xl hover:shadow-orange-500/5 focus:outline-none"
                  >
                    {/* Main Layout Grid (No Flex) */}
                    <div className="grid grid-cols-[auto_1fr] gap-5 items-center">
                      {/* Image Box */}
                      <div className="h-16 w-16 bg-white rounded-2xl border border-gray-100 overflow-hidden relative shadow-sm">
                        <Image
                          src={product?.product_image || "/placeholder.jpg"}
                          alt="product"
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Info Section */}
                      <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary mb-1">Product Slot {slot}</p>
                        <h4 className="text-base font-bold text-slate-800 truncate">{product?.product_name || product?.name || `Search and Add Product`}</h4>

                        {/* Conditional Status Messages */}
                        {loading && <span className="block mt-1 text-[11px] font-medium text-slate-400">Syncing data...</span>}
                        {error && <span className="block mt-1 text-[11px] font-medium text-red-500">{error}</span>}
                      </div>
                    </div>

                    {/* Minimal Search Indicator */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Search className="w-4 h-4 text-primary" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
              <button
                type="button"
                onClick={() => document.getElementById("compare-result")?.scrollIntoView({ behavior: "smooth" })}
                disabled={selectedProducts.filter(Boolean).length < 2}
                className="bg-slate-900 hover:bg-orange-700 disabled:bg-gray-100 disabled:text-gray-400 text-white text-sm font-bold py-4 rounded-2xl transition-all active:scale-[0.97]"
              >
                Compare Now
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedProducts([null, null]);
                  setDetailsError([null, null]);
                  try {
                    localStorage.setItem("compareProducts", JSON.stringify([null, null]));
                  } catch (err) {
                    console.error("Failed to clear compare products from localStorage:", err);
                  }
                }}
                className="bg-white border border-gray-200 text-slate-600 text-sm font-bold py-4 rounded-2xl transition-all hover:bg-gray-50 active:scale-[0.97]"
              >
                Reset
              </button>
            </div>
          </div>
        </section>

        <CompareResult
          products={selectedProducts}
          onRemove={(index) => {
            setSelectedProducts((prev) => {
              const next = [...prev];
              next[index] = null;
              // Save to localStorage
              try {
                localStorage.setItem("compareProducts", JSON.stringify(next));
              } catch (err) {
                console.error("Failed to save compare products to localStorage:", err);
              }
              return next;
            });
            setDetailsError((prev) => {
              const next = [...prev];
              next[index] = null;
              return next;
            });
          }}
        />
      </div>

      {/* ── Search Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => closeSearch()}>
            <div className="relative mx-auto mt-16 max-w-4xl px-4 sm:px-6" onClick={(e) => e.stopPropagation()}>
              <div ref={modalRef} className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
                <div className="p-4 md:p-6">
                  {/* header */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-0.5">Search Products</p>
                      <h2 className="text-lg font-semibold text-gray-900">Choose product {activeSlot}</h2>
                    </div>
                    <button onClick={closeSearch} className="rounded-full p-2 text-gray-400 hover:text-gray-900 transition">
                      <IoCloseOutline size={22} />
                    </button>
                  </div>

                  {/* search input */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      ref={inputRef}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products by name..."
                      autoFocus
                      className="w-full rounded-full bg-dark border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-10 text-sm text-gray-900 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                    />
                    {searchQuery && (
                      <button
                        ref={clearBtnRef}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchQuery("");
                          setSearchError(null);
                          inputRef.current?.focus();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <IoCloseOutline size={18} />
                      </button>
                    )}
                  </div>

                  {/* details loading banner */}
                  {detailsLoading.some(Boolean) && <div className="mt-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">Loading selected product details...</div>}

                  {/* search error banner */}
                  {searchError && (
                    <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                      <IoCloseOutline size={16} className="shrink-0" />
                      {searchError}
                    </div>
                  )}

                  {/* results area */}
                  <div className="mt-5 min-h-52">
                    {isLoading ? (
                      <div className="grid gap-3 md:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="h-36 rounded-2xl bg-gray-100 animate-pulse" />
                        ))}
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 max-h-[55vh] overflow-y-auto no-scrollbar pr-1">
                        {searchResults.map((product) => (
                          <button
                            key={product?.id || product?.slug || product?.product_name}
                            type="button"
                            onClick={() => handleSelectProduct(product)}
                            disabled={detailsLoading.some(Boolean)}
                            className="group text-left rounded-2xl border border-gray-200 p-3 bg-white hover:border-secondary hover:shadow-md transition disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <div className="relative aspect-square mb-3 overflow-hidden rounded-xl bg-gray-50">
                              <Image
                                src={typeof product?.product_image === "string" && product.product_image ? product.product_image : "/placeholder.jpg"}
                                alt={product?.product_name || "product"}
                                fill
                                sizes="(max-width: 768px) 50vw, 25vw"
                                className="object-contain p-2"
                              />
                            </div>
                            <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 mb-1">{product?.product_name || product?.name}</h3>
                            <p className="text-xs text-gray-400 mb-1">{product?.category_name || product?.category?.name || ""}</p>
                          </button>
                        ))}
                      </div>
                    ) : hasSearched && !searchError ? (
                      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-gray-500 text-sm">
                        No products found for <span className="font-semibold text-gray-800">&ldquo;{searchQuery}&rdquo;</span>.
                      </div>
                    ) : !searchError ? (
                      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-gray-400 text-sm">Start typing to search products for comparison.</div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductComparisonHero;
