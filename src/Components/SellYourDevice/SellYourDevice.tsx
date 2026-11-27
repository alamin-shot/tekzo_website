"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import clientFetchAPI from "@/utils/clientFetchAPI";
import type { ChangeEvent, SyntheticEvent } from "react";
import type { FlatCategory, SellDeviceFeature, SellDeviceField, SellDeviceForm, SellDeviceImage, SellDevicePayload, SellErrorProps, SellLabelProps, SellSectionCardProps, SellSpecSelect, SellYourDeviceProps } from "@/types/props/product";
import { errMessage, fieldsOf, filterList, isList, lengthOpt, lengthStrict, mapList, rec, requireString } from "@/lib/json";
import { idKey, inputValue, keyFrom, nodeOf, str } from "@/lib/render";

// ─── Constants ───────────────────────────────────────────────────────────────
const CONDITIONS = [
  { label: "Brand New", value: "brand_new" },
  { label: "Like New", value: "like_new" },
  { label: "Good", value: "good" },
  { label: "Fair", value: "fair" },
  { label: "Poor", value: "poor" },
];
const RAM_OPTIONS = [
  "1 GB",
  "2 GB",
  "3 GB",
  "4 GB",
  "6 GB",
  "8 GB",
  "12 GB",
  "16 GB",
  "Other",
];
const ROM_OPTIONS = [
  "8 GB",
  "16 GB",
  "32 GB",
  "64 GB",
  "128 GB",
  "256 GB",
  "512 GB",
  "1 TB",
  "Other",
];
const COLORS = [
  "Black",
  "White",
  "Silver",
  "Gold",
  "Blue",
  "Red",
  "Green",
  "Purple",
  "Pink",
  "Grey",
  "Other",
];

const CHUNK_SIZE = 1024 * 1024; // 1MB per chunk

const PRIMARY = "#fe762d";
const SECONDARY = "#18ac8f";

// ─── Helpers ───────────────────────────────────────────────────────────────

// Flattens the category tree into a single list for the <select>, indenting
// children so the hierarchy is still visible.
function flattenCategories(categories: unknown, depth = 0): FlatCategory[] {
  if (!isList(categories)) throw new TypeError("categories.flatMap is not a function");
  return categories.flatMap((cat): FlatCategory[] => [
    { id: fieldsOf(cat).id, label: `${"— ".repeat(depth)}${String(fieldsOf(cat).name)}` },
    ...(lengthOpt(fieldsOf(cat).children)
      ? flattenCategories(fieldsOf(cat).children, depth + 1)
      : []),
  ]);
}

function uploadImageInChunks(file: File, onProgress?: (progress: unknown) => void): Promise<unknown> {
  const identifier = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  return (async () => {
    let result: unknown = null;
    for (let i = 0; i < totalChunks; i++) {
      const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      const formData = new FormData();
      formData.append("file", chunk, file.name);
      formData.append("identifier", identifier);
      formData.append("filename", file.name);
      formData.append("chunk_index", String(i));
      formData.append("total_chunks", String(totalChunks));

      result = await clientFetchAPI(
        "/customer/sell-device-requests/upload-image",
        "POST",
        formData,
      );

      onProgress?.(
        rec(rec(result)?.data)?.done ?? Math.round(((i + 1) / totalChunks) * 100),
      );
    }
    return rec(rec(result)?.data)?.path;
  })();
}

// ─── Helper components (defined OUTSIDE to prevent remount on every render) ──

const Label = ({ children, required }: SellLabelProps) => (
  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
    {children}
    {required && (
      <span style={{ color: PRIMARY }} className="ml-0.5">
        *
      </span>
    )}
  </label>
);

// Shadows the global Error in this module (see handleImages).
const Error = ({ msg }: SellErrorProps) =>
  msg ? (
    <p className="text-xs mt-1" style={{ color: PRIMARY }}>
      {nodeOf(msg)}
    </p>
  ) : null;

const SectionCard = ({ title, icon, children }: SellSectionCardProps) => (
  <div className="bg-white dark:bg-[#0f182c] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
    <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-2.5 bg-slate-50/50 dark:bg-white/[0.01]">
      <span className="text-lg">{icon}</span>
      <h2 className="font-semibold text-gray-800 dark:text-white text-sm">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const inputCls = (errors: Record<string, unknown>, field: string) =>
  `w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-800 dark:text-white bg-white dark:bg-white/[0.04] outline-none transition focus:ring-2 ${
    errors[field]
      ? "border-red-400 focus:ring-red-200"
      : "border-gray-200 dark:border-white/10 focus:ring-orange-100 dark:focus:ring-orange-500/20"
  }`;

const selectCls = (errors: Record<string, unknown>, field: string) =>
  `w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-700 dark:text-slate-200 bg-white dark:bg-[#0f182c] outline-none appearance-none transition focus:ring-2 ${
    errors[field]
      ? "border-red-400 focus:ring-red-200"
      : "border-gray-200 dark:border-white/10 focus:ring-orange-100 dark:focus:ring-orange-500/20"
  }`;

const emptyForm: SellDeviceForm = {
  ad_title: "",
  category_id: "",
  new_district_id: "",
  brand_id: "",
  model: "",
  condition: "",
  ram: "",
  storage: "",
  color: "",
  is_exchange_possible: false,
  description: "",
  phone_number: "",
  video_url: "",
  asking_price: "",
  is_negotiable: false,
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function SellYourDevice({
  categories = [],
  brands = [],
  districts = [],
  requestId,
}: SellYourDeviceProps) {
  const isEditing = Boolean(requestId);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const flatCategories = flattenCategories(categories);

  const [form, setForm] = useState<SellDeviceForm>(emptyForm);
  const [features, setFeatures] = useState<SellDeviceFeature[]>([{ key: "", value: "" }]);
  const [images, setImages] = useState<SellDeviceImage[]>([]);
  // Existing images already on the server (edit mode only) — removal is
  // tracked separately since they're deleted via remove_image_ids, not by
  // just dropping them from local state.
  const [existingImages, setExistingImages] = useState<unknown>([]);
  const [removedImageIds, setRemovedImageIds] = useState<unknown[]>([]);
  const [imageError, setImageError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<unknown>("");
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const [loadingExisting, setLoadingExisting] = useState(isEditing);
  const [loadError, setLoadError] = useState<unknown>("");

  useEffect(() => {
    if (!isEditing) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await clientFetchAPI(
          `/customer/sell-device-requests/${String(requestId)}`,
          "GET",
        );
        const data = rec(res)?.data;
        if (!data || cancelled) return;
        const d = fieldsOf(data);

        setForm({
          ad_title: d.ad_title ?? "",
          category_id: rec(d.category)?.id ?? "",
          new_district_id: rec(d.district)?.id ?? "",
          brand_id: rec(d.brand)?.id ?? "",
          model: d.model ?? "",
          condition: d.condition ?? "",
          ram: d.ram ?? "",
          storage: d.storage ?? "",
          color: d.color ?? "",
          is_exchange_possible: Boolean(d.is_exchange_possible),
          description: d.description ?? "",
          phone_number: d.phone_number ?? "",
          video_url: d.video_url ?? "",
          asking_price: d.asking_price != null ? String(d.asking_price) : "",
          is_negotiable: Boolean(d.is_negotiable),
        });
        setExistingImages(d.images ?? []);
        setFeatures(
          lengthOpt(d.features)
            ? mapList(d.features, (f) => ({
                key: fieldsOf(f).feature_name,
                value: fieldsOf(f).feature_value,
              }))
            : [{ key: "", value: "" }],
        );
      } catch (err) {
        if (!cancelled) {
          setLoadError(errMessage(err) || "Failed to load this listing.");
        }
      } finally {
        if (!cancelled) setLoadingExisting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isEditing, requestId]);

  // ─── Feature handlers ─────────────────────────────────────────────────────
  const addFeature = () =>
    setFeatures((prev) => [...prev, { key: "", value: "" }]);

  const removeFeature = (i: number) =>
    setFeatures((prev) => prev.filter((_, idx) => idx !== i));

  const updateFeature = (i: number, field: "key" | "value", val: string) =>
    setFeatures((prev) => {
      const updated = [...prev];
      updated[i] = Object.assign({}, updated[i], { [field]: val });
      return updated;
    });

  const remainingExistingCount = filterList(existingImages,
    (img) => !removedImageIds.includes(fieldsOf(img).id),
  ).length;

  // ─── Image handlers ───────────────────────────────────────────────────────
  const handleImages = (e: ChangeEvent<HTMLInputElement>) => {
    // `Array.from(e.target.files)` threw for a null FileList
    const fileList = e.target.files;
    if (fileList === null) throw new TypeError("object null is not iterable (cannot read property Symbol(Symbol.iterator))");
    const files = Array.from(fileList);
    e.target.value = ""; // allow re-selecting the same file later
    const total = remainingExistingCount + images.length + files.length;
    if (total > 8) {
      setImageError("You can upload a maximum of 8 images.");
      return;
    }
    setImageError("");

    const newImages = files.map((f): SellDeviceImage => ({
      localId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file: f,
      url: URL.createObjectURL(f),
      path: null,
      progress: 0,
      uploading: true,
      error: null,
    }));
    setImages((prev) => [...prev, ...newImages]);

    newImages.forEach((img) => {
      uploadImageInChunks(img.file, (progress: unknown) => {
        setImages((prev) =>
          prev.map((p) =>
            p.localId === img.localId ? { ...p, progress } : p,
          ),
        );
      })
        .then((path: unknown) => {
          if (typeof path !== "string" || !path) {
            // Bug kept (N22): `Error` here is the component above, so `new Error(...)` threw
            // "Error is not a constructor" and that is the message the photo shows.
            throw new TypeError("Error is not a constructor");
          }
          setImages((prev) =>
            prev.map((p) =>
              p.localId === img.localId
                ? { ...p, path, uploading: false, progress: 100 }
                : p,
            ),
          );
        })
        .catch((err: unknown) => {
          setImages((prev) =>
            prev.map((p) =>
              p.localId === img.localId
                ? {
                    ...p,
                    uploading: false,
                    error: errMessage(err) || "Upload failed",
                  }
                : p,
            ),
          );
        });
    });
  };

  const removeImage = (localId: string) =>
    setImages((prev) => prev.filter((img) => img.localId !== localId));

  const removeExistingImage = (id: unknown) =>
    setRemovedImageIds((prev) => [...prev, id]);

  // ─── Form change ──────────────────────────────────────────────────────────
  const handleChange = (field: SellDeviceField, val: unknown) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ─── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!requireString(form.ad_title).trim()) e.ad_title = "Ad title is required.";
    if (!form.category_id) e.category_id = "Select a category.";
    if (!requireString(form.model).trim()) e.model = "Model is required.";
    if (!form.condition) e.condition = "Select a condition.";
    if (!requireString(form.phone_number).trim())
      e.phone_number = "Phone number is required.";
    else if (!/^[0-9+\-\s]{7,15}$/.test(requireString(form.phone_number).trim()))
      e.phone_number = "Enter a valid phone number.";
    if (!requireString(form.asking_price).trim()) e.asking_price = "Price is required.";
    else if (isNaN(Number(form.asking_price)) || Number(form.asking_price) < 0)
      e.asking_price = "Enter a valid price.";
    const uploadedCount =
      remainingExistingCount + images.filter((img) => img.path).length;
    if (uploadedCount < 3) e.images = "Upload at least 3 images.";
    if (!requireString(form.description).trim()) e.description = "Description is required.";
    return e;
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setSubmitError("");

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstErrKey = Object.keys(errs)[0];
      setTimeout(() => {
        document
          .getElementById(`field-${firstErrKey}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }

    if (images.some((img) => img.uploading)) {
      setSubmitError("Please wait for all photos to finish uploading.");
      return;
    }

    const uploadedImages = images.filter((img) => img.path);
    const validFeatures = features.filter(
      (f) => requireString(f.key).trim() && requireString(f.value).trim(),
    );

    setSubmitting(true);
    try {
      const payload: SellDevicePayload = {
        ad_title: requireString(form.ad_title).trim(),
        category_id: Number(form.category_id),
        brand_id: form.brand_id ? Number(form.brand_id) : null,
        new_district_id: form.new_district_id
          ? Number(form.new_district_id)
          : null,
        model: requireString(form.model).trim(),
        condition: form.condition,
        ram: form.ram || null,
        storage: form.storage || null,
        color: form.color || null,
        is_exchange_possible: form.is_exchange_possible,
        asking_price: Number(form.asking_price),
        is_negotiable: form.is_negotiable,
        description: requireString(form.description).trim(),
        phone_number: requireString(form.phone_number).trim(),
        video_url: requireString(form.video_url).trim() || null,
        images: uploadedImages.map((img, i) => ({
          path: img.path,
          is_primary: i === 0,
        })),
        features: validFeatures.map((f) => ({
          feature_name: requireString(f.key).trim(),
          feature_value: requireString(f.value).trim(),
        })),
      };

      if (isEditing) {
        payload.remove_image_ids = removedImageIds;
        await clientFetchAPI(
          `/customer/sell-device-requests/${String(requestId)}`,
          "PATCH",
          payload,
        );
      } else {
        await clientFetchAPI(
          "/customer/sell-device-requests",
          "POST",
          payload,
        );
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        errMessage(err) || "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Success screen ───────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
            }}
          >
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isEditing ? "Listing Updated!" : "Ad Posted Successfully!"}
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            Your listing for{" "}
            <span className="font-semibold text-gray-700">
              &quot;{nodeOf(form.ad_title)}&quot;
            </span>{" "}
            {isEditing
              ? "has been updated and is under review."
              : "is under review. We’ll notify you once it goes live."}
          </p>
          {isEditing ? (
            <Link
              href="/dashboard/my-sell-requests"
              className="block w-full py-3 rounded-xl text-white font-semibold text-sm transition"
              style={{
                background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
              }}
            >
              Back to My Listings
            </Link>
          ) : (
            <button
              onClick={() => {
                setSubmitted(false);
                setForm(emptyForm);
                setImages([]);
                setFeatures([{ key: "", value: "" }]);
              }}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition"
              style={{
                background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
              }}
            >
              Post Another Ad
            </button>
          )}
        </div>
      </div>
    );
  }

  if (loadingExisting) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-gray-400 text-sm">
        Loading your listing…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-sm" style={{ color: PRIMARY }}>
        {nodeOf(loadError)}
      </div>
    );
  }

  return (
    <div className="scroll-smooth">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="max-w-2xl mx-auto py-6 space-y-4"
      >
        {/* ── Basic Info ── */}
        <SectionCard title="Basic Information" icon="📋">
          <div className="space-y-4">
            <div id="field-ad_title">
              <Label required>Ad Title</Label>
              <input
                type="text"
                placeholder="e.g. Samsung Galaxy S23 Ultra – 256GB Black"
                className={inputCls(errors, "ad_title")}
                value={inputValue(form.ad_title)}
                onChange={(e) => handleChange("ad_title", e.target.value)}
                maxLength={120}
              />
              <div className="flex justify-between">
                <Error msg={errors.ad_title} />
                <span className="text-xs text-gray-300 mt-1 ml-auto">
                  {nodeOf(lengthStrict(form.ad_title))}/120
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div id="field-category_id">
                <Label required>Category</Label>
                <div className="relative">
                  <select
                    className={selectCls(errors, "category_id")}
                    value={inputValue(form.category_id)}
                    onChange={(e) =>
                      handleChange("category_id", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {flatCategories.map((c) => (
                      <option key={keyFrom(c.id)} value={inputValue(c.id)}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-3 text-gray-400 pointer-events-none text-xs">
                    ▼
                  </span>
                </div>
                <Error msg={errors.category_id} />
              </div>
              <div id="field-new_district_id">
                <Label>Location</Label>
                <div className="relative">
                  <select
                    className={selectCls(errors, "new_district_id")}
                    value={inputValue(form.new_district_id)}
                    onChange={(e) =>
                      handleChange("new_district_id", e.target.value)
                    }
                  >
                    <option value="">District</option>
                    {mapList(districts, (d) => (
                      <option key={idKey(d)} value={inputValue(fieldsOf(d).id)}>
                        {nodeOf(fieldsOf(d).name)}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-3 text-gray-400 pointer-events-none text-xs">
                    ▼
                  </span>
                </div>
                <Error msg={errors.new_district_id} />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Device Details ── */}
        <SectionCard title="Device Details" icon="📱">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div id="field-brand_id">
                <Label>Brand</Label>
                <div className="relative">
                  <select
                    className={selectCls(errors, "brand_id")}
                    value={inputValue(form.brand_id)}
                    onChange={(e) => handleChange("brand_id", e.target.value)}
                  >
                    <option value="">Select</option>
                    {mapList(brands, (b) => (
                      <option key={idKey(b)} value={inputValue(fieldsOf(b).id)}>
                        {nodeOf(fieldsOf(b).name)}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-3 text-gray-400 pointer-events-none text-xs">
                    ▼
                  </span>
                </div>
                <Error msg={errors.brand_id} />
              </div>
              <div id="field-model">
                <Label required>Model</Label>
                <input
                  type="text"
                  placeholder="e.g. Galaxy S23 Ultra"
                  className={inputCls(errors, "model")}
                  value={inputValue(form.model)}
                  onChange={(e) => handleChange("model", e.target.value)}
                />
                <Error msg={errors.model} />
              </div>
            </div>

            <div id="field-condition">
              <Label required>Condition</Label>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => handleChange("condition", c.value)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border transition"
                    style={
                      form.condition === c.value
                        ? {
                            background: PRIMARY,
                            color: "#fff",
                            borderColor: PRIMARY,
                          }
                        : {
                            background: "#fff",
                            color: "#6b7280",
                            borderColor: "#e5e7eb",
                          }
                    }
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <Error msg={errors.condition} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {([
                { label: "RAM", field: "ram", options: RAM_OPTIONS },
                { label: "Storage", field: "storage", options: ROM_OPTIONS },
                { label: "Color", field: "color", options: COLORS },
              ] satisfies SellSpecSelect[]).map(({ label, field, options }) => (
                <div key={field}>
                  <Label>{label}</Label>
                  <div className="relative">
                    <select
                      className={selectCls(errors, field)}
                      value={inputValue(form[field])}
                      onChange={(e) => handleChange(field, e.target.value)}
                    >
                      <option value="">Select</option>
                      {options.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                    <span className="absolute right-2 top-3 text-gray-400 pointer-events-none text-xs">
                      ▼
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Exchange toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
                style={{
                  background: form.is_exchange_possible
                    ? SECONDARY
                    : "#d1d5db",
                }}
                onClick={() =>
                  handleChange(
                    "is_exchange_possible",
                    !form.is_exchange_possible,
                  )
                }
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                  style={{
                    transform: form.is_exchange_possible
                      ? "translateX(20px)"
                      : "translateX(0)",
                  }}
                />
              </div>
              <span className="text-sm text-gray-700 font-medium">
                Exchange possible
              </span>
              {form.is_exchange_possible && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full text-white"
                  style={{ background: SECONDARY }}
                >
                  Yes
                </span>
              )}
            </label>
          </div>
        </SectionCard>

        {/* ── Key Features ── */}
        <SectionCard title="Key Features" icon="⚡">
          <p className="text-xs text-gray-400 mb-4">
            Add specific specs of your device (e.g. Camera: 48MP, Display:
            AMOLED)
          </p>
          <div className="space-y-2.5">
            {features.map((f, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Feature (e.g. Camera)"
                  className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-orange-100 transition"
                  value={inputValue(f.key)}
                  onChange={(e) => updateFeature(i, "key", e.target.value)}
                />
                <span className="text-gray-300 text-sm font-bold flex-shrink-0">
                  :
                </span>
                <input
                  type="text"
                  placeholder="Value (e.g. 48MP)"
                  className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-orange-100 transition"
                  value={inputValue(f.value)}
                  onChange={(e) => updateFeature(i, "value", e.target.value)}
                />
                {features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeature(i)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-50 transition flex-shrink-0"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addFeature}
            className="mt-3 flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border-2 border-dashed transition hover:opacity-80"
            style={{
              color: PRIMARY,
              borderColor: PRIMARY,
              background: "#fff8f5",
            }}
          >
            <span className="text-lg leading-none font-bold">+</span> Add
            Feature
          </button>
        </SectionCard>

        {/* ── Images ── */}
        <SectionCard title="Photos" icon="📷">
          <p className="text-xs text-gray-400 mb-4">
            Upload 3–8 clear photos of your device. First photo will be the
            cover.
          </p>
          <div id="field-images">
            {(() => {
              const visibleExisting = filterList(existingImages,
                (img) => !removedImageIds.includes(fieldsOf(img).id),
              );
              const totalCount = visibleExisting.length + images.length;
              return (
                <>
                  {totalCount < 8 && (
                    <div
                      className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:opacity-80 transition mb-4"
                      style={{ borderColor: PRIMARY, background: "#fff8f5" }}
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <div
                        className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${PRIMARY}22, ${SECONDARY}22)`,
                        }}
                      >
                        <svg
                          className="w-6 h-6"
                          style={{ color: PRIMARY }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: PRIMARY }}
                      >
                        Tap to add photos
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {totalCount}/8 uploaded · Min 3 required
                      </p>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImages}
                      />
                    </div>
                  )}

                  {imageError && (
                    <p className="text-xs mb-3" style={{ color: PRIMARY }}>
                      {imageError}
                    </p>
                  )}

                  {totalCount > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {visibleExisting.map((img, i) => (
                        <div
                          key={idKey(img)}
                          className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm group"
                        >
                          <img
                            src={str(fieldsOf(img).url)}
                            alt={`Photo ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {i === 0 && (
                            <span
                              className="absolute bottom-0 left-0 right-0 text-center text-white text-[8px] lg:text-xs py-0.5 lg:py-1 font-medium"
                              style={{ background: `${PRIMARY}cc` }}
                            >
                              Cover
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeExistingImage(fieldsOf(img).id)}
                            className="absolute top-1 right-1 w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-red-500 text-white text-[10px] lg:text-xs flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100 transition"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {images.map((img, i) => (
                        <div
                          key={img.localId}
                          className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm group"
                        >
                          <img
                            src={img.url}
                            alt={`Photo ${visibleExisting.length + i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {nodeOf((img.uploading || img.error) && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              {img.uploading ? (
                                <span className="text-white text-[10px] lg:text-xs font-semibold">
                                  {nodeOf(img.progress)}%
                                </span>
                              ) : (
                                <span className="text-white text-[9px] lg:text-xs font-semibold text-center px-1">
                                  Failed
                                </span>
                              )}
                            </div>
                          ))}
                          {visibleExisting.length === 0 &&
                            i === 0 &&
                            !img.uploading &&
                            !img.error && (
                              <span
                                className="absolute bottom-0 left-0 right-0 text-center text-white text-[8px] lg:text-xs py-0.5 lg:py-1 font-medium"
                                style={{ background: `${PRIMARY}cc` }}
                              >
                                Cover
                              </span>
                            )}
                          <button
                            type="button"
                            onClick={() => removeImage(img.localId)}
                            className="absolute top-1 right-1 w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-red-500 text-white text-[10px] lg:text-xs flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100 transition"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
            {images.some((img) => img.error) && (
              <div className="mt-3 space-y-1">
                {images
                  .filter((img) => img.error)
                  .map((img) => (
                    <p
                      key={img.localId}
                      className="text-xs"
                      style={{ color: PRIMARY }}
                    >
                      {img.file.name}: {nodeOf(img.error)}
                    </p>
                  ))}
              </div>
            )}
            <Error msg={errors.images} />
          </div>
        </SectionCard>

        {/* ── Video URL ── */}
        <SectionCard title="Video (Optional)" icon="🎥">
          <Label>YouTube / TikTok / Drive Link</Label>
          <div className="relative">
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-orange-100 transition"
              value={inputValue(form.video_url)}
              onChange={(e) => handleChange("video_url", e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-gray-400 text-sm">
              🔗
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            Share a video showcasing your device&apos;s condition
          </p>
        </SectionCard>

        {/* ── Pricing ── */}
        <SectionCard title="Price" icon="💰">
          <div className="space-y-4">
            <div id="field-asking_price">
              <Label required>Asking Price (BDT)</Label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-gray-500 text-sm font-semibold">
                  ৳
                </span>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-sm text-gray-800 bg-white outline-none transition focus:ring-2 ${
                    errors.asking_price
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-200 focus:ring-orange-100"
                  }`}
                  value={inputValue(form.asking_price)}
                  onChange={(e) =>
                    handleChange("asking_price", e.target.value)
                  }
                />
              </div>
              <Error msg={errors.asking_price} />
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
                style={{
                  background: form.is_negotiable ? SECONDARY : "#d1d5db",
                }}
                onClick={() =>
                  handleChange("is_negotiable", !form.is_negotiable)
                }
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                  style={{
                    transform: form.is_negotiable
                      ? "translateX(20px)"
                      : "translateX(0)",
                  }}
                />
              </div>
              <span className="text-sm text-gray-700 font-medium">
                Price is negotiable
              </span>
              {form.is_negotiable && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full text-white"
                  style={{ background: SECONDARY }}
                >
                  Negotiable
                </span>
              )}
            </label>
          </div>
        </SectionCard>

        {/* ── Description ── */}
        <SectionCard title="Description" icon="📝">
          <div id="field-description">
            <Label required>Tell buyers about your device</Label>
            <textarea
              rows={5}
              placeholder="Describe the condition, usage history, included accessories, reason for selling, and anything else buyers should know..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-800 bg-white outline-none transition focus:ring-2 resize-none ${
                errors.description
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-200 focus:ring-orange-100"
              }`}
              value={inputValue(form.description)}
              onChange={(e) => handleChange("description", e.target.value)}
              maxLength={1000}
            />
            <div className="flex justify-between">
              <Error msg={errors.description} />
              <span className="text-xs text-gray-300 mt-1 ml-auto">
                {nodeOf(lengthStrict(form.description))}/1000
              </span>
            </div>
          </div>
        </SectionCard>

        {/* ── Contact ── */}
        <SectionCard title="Contact Information" icon="📞">
          <div id="field-phone_number">
            <Label required>Phone Number</Label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm">
                🇧🇩
              </span>
              <input
                type="tel"
                placeholder="+880 1X XX XXXXXX"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-gray-800 bg-white outline-none transition focus:ring-2 ${
                  errors.phone_number
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-200 focus:ring-orange-100"
                }`}
                value={inputValue(form.phone_number)}
                onChange={(e) =>
                  handleChange("phone_number", e.target.value)
                }
              />
            </div>
            <Error msg={errors.phone_number} />
            <p className="text-xs text-gray-400 mt-1.5">
              Buyers will contact you on this number
            </p>
          </div>
        </SectionCard>

        <Error msg={submitError} />

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3.5 rounded-2xl text-white font-bold text-base shadow-md active:scale-95 transition-transform gradient disabled:opacity-60 disabled:active:scale-100"
        >
          {submitting
            ? isEditing
              ? "Updating..."
              : "Posting..."
            : isEditing
              ? "Update Ad"
              : "Post My Ad"}
        </button>
      </form>
    </div>
  );
}
