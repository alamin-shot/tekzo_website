"use client";

import { useState, useEffect } from "react";
import clientFetchAPI from "@/utils/clientFetchAPI";
import { FiX } from "react-icons/fi";

const LABELS = [
  { key: "office", icon: "💼", display: "OFFICE" },
  { key: "home", icon: "🏠", display: "HOME" },
  { key: "others", icon: "📍", display: "OTHERS" },
];

const initialForm = {
  district_id: "",
  district_name: "",
  area_id: "",
  area_name: "",
  thana: "",
  postcode: "",
  street: "",
  label: "office",
};

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white " +
  "bg-slate-50 dark:bg-white/[0.04] outline-none transition-all duration-150 " +
  "focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 " +
  "placeholder:text-slate-400 dark:placeholder:text-slate-500";

export default function AddAddressPopup({
  onClose,
  onSave,
  initialData = null,
}) {
  const [form, setForm] = useState(initialForm);
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [districts, setDistricts] = useState([]);
  const [areas, setAreas] = useState([]);
  const [districtsLoading, setDistrictsLoading] = useState(true);
  const [areasLoading, setAreasLoading] = useState(false);

  // ✅ Districts fetch
  useEffect(() => {
    const fetchDistricts = async () => {
      setDistrictsLoading(true);
      try {
        const data = await clientFetchAPI("/districts", "GET");
        setDistricts(data?.data || []);
      } catch (err) {
        console.error("Districts fetch failed:", err);
      } finally {
        setDistrictsLoading(false);
      }
    };
    fetchDistricts();
  }, []);

  // ✅ Areas fetch — district_id change হলে
  useEffect(() => {
    if (!form.district_id) {
      setAreas([]);
      return;
    }
    const fetchAreas = async () => {
      setAreasLoading(true);
      try {
        const data = await clientFetchAPI(`/areas/${form.district_id}`, "GET");
        setAreas(data?.data || []);
      } catch (err) {
        console.error("Areas fetch failed:", err);
      } finally {
        setAreasLoading(false);
      }
    };
    fetchAreas();
  }, [form.district_id]);

  // ✅ areas load edit mode এ area_id + thana + postcode confirm
  useEffect(() => {
    if (!isEditMode || areas.length === 0 || !initialData?.area_id) return;
    setForm((p) => ({
      ...p,
      area_id: initialData.area_id || "",
      thana: initialData.area?.thana || "",
      postcode: initialData.area?.postcode || "",
    }));
  }, [areas, isEditMode, initialData]);

  // ✅ Animation
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // ✅ Edit mode এ form populate
  useEffect(() => {
    if (!initialData || !initialData.id) {
      setForm(initialForm);
      setIsEditMode(false);
      return;
    }
    setIsEditMode(true);
    setForm({
      ...initialForm,
      district_id: initialData.district_id || "",
      area_id: initialData.area_id || "",
      thana: initialData.area?.thana || "",
      postcode: initialData.area?.postcode || "",
      street: initialData.street || "",
      label: initialData.label || "office",
    });
  }, [initialData]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 260);
  };

  const set = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleDistrictChange = (e) => {
    const selected = districts.find((d) => d.id == e.target.value);
    setIsEditMode(false);
    setForm((p) => ({
      ...p,
      district_id: selected?.id || "",
      district_name: selected?.name || "",
      area_id: "",
      area_name: "",
      thana: "",
      postcode: "",
    }));
    setErrors((p) => ({ ...p, district_id: null }));
  };

  const handleAreaChange = (e) => {
    const selected = areas.find((a) => a.id == e.target.value);
    setForm((p) => ({
      ...p,
      area_id: selected?.id || "",
      area_name: selected?.name || "",
      thana: selected?.thana || "",
      postcode: selected?.postcode || "",
    }));
    setErrors((p) => ({ ...p, area_id: null }));
  };

  const validate = () => {
    const required = {
      district_id: "District",
      area_id: "Upazila / Area",
      street: "Street Address",
    };
    const next = {};
    Object.entries(required).forEach(([k, label]) => {
      if (!form[k]?.toString().trim()) next[k] = `${label} is required`;
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaveLoading(true);
    try {
      await onSave({
        new_district_id: form.district_id,
        area_id: form.area_id,
        thana: form.thana,
        postcode: form.postcode,
        street: form.street,
        label: form.label,
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const overlayBase =
    "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-250";
  const boxBase =
    "relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0f182c] border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-2xl transition-all duration-[260ms]";

  return (
    <div
      className={`${overlayBase} ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className={`${boxBase} ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95"}`}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 rounded-t-3xl" />

        <div className="p-6 md:p-8">
          {/* Header & Close button */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                {initialData?.id ? "Edit Address" : "Add New Address"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {initialData?.id
                  ? "Update your saved delivery address details."
                  : "Fill in the details below to save a new delivery address."}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* District + Area + Thana */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* District */}
            <Field label="District" required>
              <div className="relative">
                <select
                  className={`${inputCls} appearance-none pr-8 ${errors.district_id ? "border-rose-400 focus:ring-rose-100" : ""} ${districtsLoading ? "opacity-50" : ""}`}
                  value={form.district_id}
                  onChange={handleDistrictChange}
                  disabled={districtsLoading}
                >
                  <option value="" className="dark:bg-[#0f182c]">
                    {districtsLoading ? "Loading..." : "Select District"}
                  </option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id} className="dark:bg-[#0f182c]">
                      {d.name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  ▾
                </span>
              </div>
              {errors.district_id && (
                <p className="text-xs text-rose-500 mt-0.5">
                  {errors.district_id}
                </p>
              )}
            </Field>

            {/* Area */}
            <Field label="Upazila / Area" required>
              <div className="relative">
                <select
                  className={`${inputCls} appearance-none pr-8 disabled:opacity-50 ${errors.area_id ? "border-rose-400 focus:ring-rose-100" : ""}`}
                  value={form.area_id}
                  onChange={handleAreaChange}
                  disabled={!form.district_id || areasLoading}
                >
                  <option value="" className="dark:bg-[#0f182c]">
                    {areasLoading ? "Loading..." : "Select Area"}
                  </option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id} className="dark:bg-[#0f182c]">
                      {a.name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  ▾
                </span>
              </div>
              {errors.area_id && (
                <p className="text-xs text-rose-500 mt-0.5">{errors.area_id}</p>
              )}
            </Field>

            {/* Thana */}
            <Field label="Thana">
              <input
                className={inputCls}
                placeholder="Enter thana"
                value={form.thana}
                onChange={(e) => set("thana", e.target.value)}
              />
            </Field>
          </div>

          {/* Postal Code + Street */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Postcode */}
            <Field label="Postal Code">
              <input
                className={inputCls}
                placeholder="Enter postal code"
                value={form.postcode}
                onChange={(e) => set("postcode", e.target.value)}
              />
            </Field>

            {/* Street */}
            <div className="sm:col-span-2">
              <Field label="Street Address" required>
                <input
                  className={`${inputCls} ${errors.street ? "border-rose-400 focus:ring-rose-100" : ""}`}
                  placeholder="House, road, landmark details"
                  value={form.street}
                  onChange={(e) => {
                    set("street", e.target.value);
                    setErrors((p) => ({ ...p, street: null }));
                  }}
                />
                {errors.street && (
                  <p className="text-xs text-rose-500 mt-0.5">{errors.street}</p>
                )}
              </Field>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-white/5 mb-5" />

          {/* Label selector */}
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
            Address Type Label
          </p>
          <div className="flex gap-3 flex-wrap mb-8">
            {LABELS.map(({ key, icon, display }) => {
              const active = form.label === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => set("label", key)}
                  className={`flex items-center gap-2 border rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    active
                      ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 shadow-sm"
                      : "border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                  }`}
                >
                  <span className="text-base">{icon}</span>
                  {display}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleClose}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saveLoading}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-white font-bold text-xs uppercase tracking-widest px-7 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all disabled:opacity-60 cursor-pointer"
            >
              {saveLoading ? "Saving..." : "Save Address"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
