import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { BusinessFormData, BusinessFormProps, FlagMap, StringMap } from "@/types/props/content";
import { rec } from "@/lib/json";

const initialFormData: BusinessFormData = {
  businessOwner: "",
  businessName: "",
  primaryPhone: "",
  secondaryPhone: "",
  email: "",
  district: "",
  upazila: "",
  thana: "",
  postcode: "",
  streetAddress: "",
  tradeLicenseNumber: "",
  platformUrl: "",
  businessTradeLicense: null,
  businessLogo: null,
  businessOwnerNid: null,
  businessOwnerPhoto: null,
  agreedToPolicy: false,
};

const initialFileNames: StringMap = {
  businessTradeLicense: "",
  businessLogo: "",
  businessOwnerNid: "",
  businessOwnerPhoto: "",
};

const FIELD_LABELS: StringMap = {
  businessOwner: "Business Owner",
  businessName: "Business Name",
  primaryPhone: "Primary Phone",
  secondaryPhone: "Secondary Phone",
  email: "Email",
  district: "District",
  upazila: "Upazila / Area",
  thana: "Thana",
  postcode: "Postcode",
  streetAddress: "Street Address",
  tradeLicenseNumber: "Trade License Number",
  platformUrl: "Platform URL",
  businessTradeLicense: "Business Trade License",
  businessLogo: "Business Logo",
  businessOwnerNid: "Business Owner NID",
  businessOwnerPhoto: "Business Owner Photo",
};

function validateForm(formData: BusinessFormData): StringMap {
  const errors: StringMap = {};
  Object.keys(FIELD_LABELS).forEach((key) => {
    const val = rec(formData)?.[key];
    if (val === null || val === "" || val === undefined) {
      errors[key] = `${FIELD_LABELS[key]} is required.`;
    } else if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val))) {
      errors[key] = "Please enter a valid email address.";
    } else if (key === "platformUrl" && !/^https?:\/\/.+/.test(String(val))) {
      errors[key] = "URL must start with http:// or https://";
    }
  });
  return errors;
}

// `document.getElementById(id).click()` — throws when the element is missing, as before.
const clickById = (id: string): void => {
  const el = document.getElementById(id);
  if (!el) throw new TypeError("Cannot read properties of null (reading 'click')");
  el.click();
};

export default function BusinessForm({ title, setData }: BusinessFormProps) {
  const [formData, setFormData] = useState<BusinessFormData>(initialFormData);
  const [fileNames, setFileNames] = useState<StringMap>(initialFileNames);
  const [errors, setErrors] = useState<StringMap>({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [shakeFields, setShakeFields] = useState<FlagMap>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newVal = type === "checkbox" ? checked : value;
    const updatedData = { ...formData, [name]: newVal };
    setFormData(updatedData);
    // Only re-validate after first submit attempt
    if (submitAttempted) {
      setErrors(validateForm(updatedData));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    // `files[0]` threw for a null FileList (never null on a file input); kept
    if (!files) throw new TypeError("Cannot read properties of null (reading '0')");
    const file = files[0] || null;
    const updatedData = { ...formData, [name]: file };
    setFormData(updatedData);
    setFileNames((prev) => ({ ...prev, [name]: file ? file.name : "" }));
    if (submitAttempted) {
      setErrors(validateForm(updatedData));
    }
  };

  const triggerShake = (fieldNames: string[]) => {
    const shakeMap: FlagMap = {};
    fieldNames.forEach((n) => (shakeMap[n] = true));
    setShakeFields(shakeMap);
    setTimeout(() => setShakeFields({}), 600);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitAttempted(true);
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      triggerShake(Object.keys(validationErrors));
      const firstKey = Object.keys(validationErrors)[0];
      const el = document.getElementById(firstKey);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setData(formData);
    setShowSuccessPopup(true);
  };

  const handleClosePopup = () => {
    setShowSuccessPopup(false);
    setFormData(initialFormData);
    setFileNames(initialFileNames);
    setErrors({});
    setSubmitAttempted(false);
  };

  // Only show errors after submit was attempted
  const hasError = (name: string) => submitAttempted && errors[name];

  const inputClass = (name: string) => ["text-input", hasError(name) && "input-error", shakeFields[name] && "shake"].filter(Boolean).join(" ");

  const uploadCardClass = (name: string) => ["upload-card", hasError(name) && "upload-card-error", shakeFields[name] && "shake"].filter(Boolean).join(" ");

  const errorCount = Object.keys(errors).length;
  const isSubmitDisabled = !formData.agreedToPolicy;

  return (
    <div className="form-page-wrapper">
      <style>{`
        .form-page-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Card */
        .form-card {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 4px 40px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
          width: 100%;
          max-width: 1150px;
          padding: 48px 52px;
          position: relative;
          overflow: hidden;
        }
       

        /* Error banner */
        .error-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #fff1f2;
          border: 1.5px solid red;
          border-radius: 12px;
          padding: 14px 18px;
          margin-bottom: 28px;
          animation: bannerSlide 0.35s ease;
        }
        @keyframes bannerSlide {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .error-banner-icon {
          width: 22px; height: 22px;
          background: red;
          border-radius: 50%;
          color: #fff;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 1px;
        }
        .error-banner-text {
          font-size: 0.83rem;
          color: red;
          font-weight: 500;
          line-height: 1.5;
        }
        .error-banner-text strong {
          display: block;
          font-size: 0.87rem;
          margin-bottom: 2px;
        }

        /* Layout */
        .form-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 0 48px; }
        .form-main-section { display: flex; flex-direction: column; }
        .form-upload-section { display: flex; flex-direction: column; gap: 20px; }

        /* Section titles */
        .form-section-title {
          font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #94a3b8; margin-bottom: 16px; margin-top: 28px;
        }
        .form-section-title:first-child { margin-top: 0; }

        /* Field groups */
        .field-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 16px; }
        .field-row { display: grid; gap: 14px; margin-bottom: 16px; }
        .field-row-2 { grid-template-columns: 1fr 1fr; }
        .field-row-3 { grid-template-columns: 1fr 1fr 1fr; }
        .field-row .field-group,
        .field-row-2 .field-group,
        .field-row-3 .field-group { margin-bottom: 0; }

        /* Labels */
        label.field-label {
          font-size: 0.78rem; font-weight: 600;
          color: #374151; letter-spacing: 0.01em;
        }
        label.field-label.label-error { color: red; }
        .required-star { color: red; margin-left: 2px; }

        /* Inputs */
        .text-input {
          height: 42px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 0 14px;
          font-size: 0.85rem;
          color: #0f172a;
          background: #fafbff;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
          width: 100%;
          outline: none;
          -webkit-appearance: none;
          appearance: none;
        }
        .text-input::placeholder { color: #cbd5e1; font-weight: 400; }
        .text-input:focus {
          border-color: #f97316;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.12);
        }

        /* Error input state */
        .text-input.input-error {
          border-color: red !important;
          background: #fff5f7 !important;
        }
        .text-input.input-error::placeholder { color: #fca5a5; }
        .text-input.input-error:focus {
          border-color: red !important;
          box-shadow: 0 0 0 3px rgba(255,0,0,0.12) !important;
          background: #fff !important;
        }

        /* Inline error message */
        .field-error-msg {
          font-size: 0.72rem;
          color: red;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
          line-height: 1.4;
          animation: errorFadeIn 0.2s ease;
        }
        .field-error-msg::before { content: '⚠'; font-size: 0.68rem; flex-shrink: 0; }
        @keyframes errorFadeIn {
          from { opacity: 0; transform: translateY(-3px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Upload cards */
        .upload-card {
          background: #fafbff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px 18px;
          transition: border-color 0.18s, background 0.18s;
        }
        .upload-card:hover { border-color: #f97316; }
        .upload-card.upload-card-error {
          border-color: red !important;
          background: #fff5f7 !important;
        }
        .upload-card-header {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 10px;
        }
        .upload-label { font-size: 0.78rem; font-weight: 600; color: #374151; }
        .upload-label.upload-label-error { color: red; }
        .upload-limit {
          font-size: 0.7rem; color: #94a3b8;
          background: #f1f5f9; padding: 2px 7px; border-radius: 5px;
        }
        .upload-controls { display: flex; align-items: center; gap: 12px; }
        .choose-file-btn {
          padding: 7px 16px;
          background: #f97316;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          display: inline-block;
          transition: background 0.18s, transform 0.12s;
        }
        .choose-file-btn:hover { background: #ea6c0a; transform: translateY(-1px); }
        .choose-file-btn.btn-error { background: red; }
        .choose-file-btn.btn-error:hover { background: #cc0000; transform: translateY(-1px); }
        .file-name-display {
          font-size: 0.78rem; color: #94a3b8;
          white-space: nowrap; overflow: hidden;
          text-overflow: ellipsis; max-width: 160px;
        }
        .file-name-display.has-file { color: #16a34a; font-weight: 500; }
        .file-name-display.name-error { color: red; font-style: italic; font-size: 0.72rem; }
        .hidden-file-input { display: none; }

        /* Shake animation */
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          15%      { transform: translateX(-6px); }
          30%      { transform: translateX(6px); }
          45%      { transform: translateX(-5px); }
          60%      { transform: translateX(4px); }
          75%      { transform: translateX(-3px); }
          90%      { transform: translateX(2px); }
        }
        .shake { animation: shake 0.55s cubic-bezier(.36,.07,.19,.97) both; }

        /* Divider */
        .form-divider { border: none; border-top: 1.5px solid #f1f5f9; margin: 8px 0 20px; }
        .full-width-input { width: 100%; }

        /* Policy section */
        .policy-section {
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1.5px solid #f1f5f9;
        }
        .policy-checkbox-row { display: flex; align-items: center; gap: 10px; }
        .policy-checkbox {
          width: 18px; height: 18px;
          accent-color: #f97316;
          cursor: pointer;
          flex-shrink: 0;
        }
        .policy-text { font-size: 0.82rem; color: #64748b; }
        .policy-link {
          color: #f97316; font-weight: 600;
          text-decoration: none; transition: color 0.15s;
        }
        .policy-link:hover { color: #ea6c0a; text-decoration: underline; }
        .policy-error-msg { margin-top: 6px; }

        /* Submit footer */
        .form-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 16px;
          margin-top: 28px;
        }
        .submit-error-count {
          font-size: 0.8rem;
          color: red;
          font-weight: 600;
          background: #fff1f2;
          border: 1px solid red;
          border-radius: 20px;
          padding: 5px 14px;
          display: flex;
          align-items: center;
          gap: 5px;
          animation: bannerSlide 0.3s ease;
        }
        .submit-btn {
          padding: 13px 44px;
          background: linear-gradient(135deg, #f97316, #fbbf24);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 0.92rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          box-shadow: 0 4px 16px rgba(249,115,22,0.35);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s, cursor 0.15s;
        }
        .submit-btn:not(:disabled) { cursor: pointer; }
        .submit-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(249,115,22,0.4);
        }
        .submit-btn:not(:disabled):active { transform: translateY(0); }
        .submit-btn:disabled {
          opacity: 0.45;
          cursor: none;
          pointer-events: none;
        }

        /* Popup overlay */
        .popup-overlay {
          position: fixed; inset: 0;
          background: rgba(15,23,42,0.55);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          z-index: 2000;
          animation: overlayFadeIn 0.25s ease;
        }
        @keyframes overlayFadeIn { from { opacity:0; } to { opacity:1; } }

        .popup-modal {
          background: #fff;
          border-radius: 24px;
          padding: 52px 48px 44px;
          width: 100%; max-width: 460px;
          text-align: center;
          position: relative;
          box-shadow: 0 32px 80px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08);
          animation: popupSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1);
          margin: 16px;
        }
        @keyframes popupSlideUp {
          from { opacity:0; transform: translateY(40px) scale(0.95); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        .popup-close-btn {
          position: absolute; top: 18px; right: 18px;
          width: 32px; height: 32px;
          border: none; background: #f1f5f9;
          border-radius: 8px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #94a3b8; font-size: 1rem;
          transition: background 0.15s, color 0.15s;
        }
        .popup-close-btn:hover { background: #e2e8f0; color: #475569; }

        .popup-success-ring {
          width: 88px; height: 88px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border: 3px solid #bbf7d0;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 28px;
          animation: ringPulse 0.6s ease 0.3s both;
        }
        @keyframes ringPulse {
          0%  { transform: scale(0.6); opacity: 0; }
          70% { transform: scale(1.08); opacity: 1; }
          100%{ transform: scale(1); }
        }
        .popup-checkmark { width: 44px; height: 44px; }
        .popup-checkmark-circle {
          stroke: #16a34a; stroke-width: 2; fill: none;
          stroke-dasharray: 166; stroke-dashoffset: 166;
          animation: strokeDraw 0.5s ease 0.4s forwards;
        }
        .popup-checkmark-tick {
          stroke: #16a34a; stroke-width: 2.5; fill: none;
          stroke-linecap: round; stroke-linejoin: round;
          stroke-dasharray: 48; stroke-dashoffset: 48;
          animation: strokeDraw 0.35s ease 0.75s forwards;
        }
        @keyframes strokeDraw { to { stroke-dashoffset: 0; } }

        .popup-title {
          font-size: 1.5rem; font-weight: 700;
          color: #0f172a; letter-spacing: -0.02em; margin-bottom: 10px;
        }
        .popup-subtitle {
          font-size: 0.88rem; color: #64748b;
          line-height: 1.6; margin-bottom: 8px;
        }
        .popup-divider { border: none; border-top: 1.5px solid #f1f5f9; margin-bottom: 20px; }
        .popup-info-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px; margin-bottom: 28px; text-align: left;
        }
        .popup-info-item { background: #f8fafc; border-radius: 10px; padding: 11px 13px; }
        .popup-info-label {
          font-size: 0.67rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: #94a3b8; margin-bottom: 3px;
        }
        .popup-info-value {
          font-size: 0.82rem; font-weight: 600; color: #0f172a;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .popup-action-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #f97316, #fbbf24);
          color: #fff; border: none; border-radius: 12px;
          font-size: 0.92rem; font-weight: 700;
          cursor: pointer; letter-spacing: 0.02em;
          box-shadow: 0 4px 16px rgba(249,115,22,0.35);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .popup-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(249,115,22,0.4);
        }
        .popup-secondary-btn {
          width: 100%; padding: 12px;
          background: transparent; color: #64748b;
          border: 1.5px solid #e2e8f0; border-radius: 12px;
          font-size: 0.88rem; font-weight: 500;
          cursor: pointer; margin-top: 10px;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .popup-secondary-btn:hover {
          border-color: #cbd5e1; background: #f8fafc; color: #374151;
        }

        @media (max-width: 800px) {
          .form-card { padding: 32px 20px; }
          .form-layout { grid-template-columns: 1fr; }
          .field-row-2, .field-row-3 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="form-card">
        {/* Error summary banner — only after submit attempt */}
        {submitAttempted && errorCount > 0 && (
          <div className="error-banner">
            <div className="error-banner-icon">!</div>
            <div className="error-banner-text">
              <strong>
                {errorCount} field{errorCount > 1 ? "s" : ""} need{errorCount === 1 ? "s" : ""} your attention
              </strong>
              Please fill in all highlighted fields correctly before submitting.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-layout">
            {/* LEFT: Main fields */}
            <div className="form-main-section">
              <p className="form-section-title">Business Information</p>

              <div className="field-row field-row-2">
                <div className="field-group">
                  <label className={`field-label${hasError("businessOwner") ? " label-error" : ""}`} htmlFor="businessOwner">
                    Business Owner <span className="required-star">*</span>
                  </label>
                  <input
                    id="businessOwner"
                    name="businessOwner"
                    type="text"
                    className={inputClass("businessOwner")}
                    placeholder="Business Owner Name"
                    value={formData.businessOwner}
                    onChange={handleTextChange}
                  />
                  {hasError("businessOwner") && <span className="field-error-msg">{errors.businessOwner}</span>}
                </div>
                <div className="field-group">
                  <label className={`field-label${hasError("businessName") ? " label-error" : ""}`} htmlFor="businessName">
                    Business Name <span className="required-star">*</span>
                  </label>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    className={inputClass("businessName")}
                    placeholder="Business Name"
                    value={formData.businessName}
                    onChange={handleTextChange}
                  />
                  {hasError("businessName") && <span className="field-error-msg">{errors.businessName}</span>}
                </div>
              </div>

              <div className="field-row field-row-3">
                <div className="field-group">
                  <label className={`field-label${hasError("primaryPhone") ? " label-error" : ""}`} htmlFor="primaryPhone">
                    Primary Phone <span className="required-star">*</span>
                  </label>
                  <input
                    id="primaryPhone"
                    name="primaryPhone"
                    type="tel"
                    className={inputClass("primaryPhone")}
                    placeholder="Primary Phone"
                    value={formData.primaryPhone}
                    onChange={handleTextChange}
                  />
                  {hasError("primaryPhone") && <span className="field-error-msg">{errors.primaryPhone}</span>}
                </div>
                <div className="field-group">
                  <label className={`field-label${hasError("secondaryPhone") ? " label-error" : ""}`} htmlFor="secondaryPhone">
                    Secondary Phone <span className="required-star">*</span>
                  </label>
                  <input
                    id="secondaryPhone"
                    name="secondaryPhone"
                    type="tel"
                    className={inputClass("secondaryPhone")}
                    placeholder="Secondary Phone"
                    value={formData.secondaryPhone}
                    onChange={handleTextChange}
                  />
                  {hasError("secondaryPhone") && <span className="field-error-msg">{errors.secondaryPhone}</span>}
                </div>
                <div className="field-group">
                  <label className={`field-label${hasError("email") ? " label-error" : ""}`} htmlFor="email">
                    Email <span className="required-star">*</span>
                  </label>
                  <input id="email" name="email" type="email" className={inputClass("email")} placeholder="Email" value={formData.email} onChange={handleTextChange} />
                  {hasError("email") && <span className="field-error-msg">{errors.email}</span>}
                </div>
              </div>

              <hr className="form-divider" />
              <p className="form-section-title">Business / Shop Address</p>

              <div className="field-row field-row-2">
                <div className="field-group">
                  <label className={`field-label${hasError("district") ? " label-error" : ""}`} htmlFor="district">
                    District <span className="required-star">*</span>
                  </label>
                  <input id="district" name="district" type="text" className={inputClass("district")} placeholder="Select a district..." value={formData.district} onChange={handleTextChange} />
                  {hasError("district") && <span className="field-error-msg">{errors.district}</span>}
                </div>
                <div className="field-group">
                  <label className={`field-label${hasError("upazila") ? " label-error" : ""}`} htmlFor="upazila">
                    Upazila / Area <span className="required-star">*</span>
                  </label>
                  <input id="upazila" name="upazila" type="text" className={inputClass("upazila")} placeholder="Select an area..." value={formData.upazila} onChange={handleTextChange} />
                  {hasError("upazila") && <span className="field-error-msg">{errors.upazila}</span>}
                </div>
              </div>

              <div className="field-row field-row-2">
                <div className="field-group">
                  <label className={`field-label${hasError("thana") ? " label-error" : ""}`} htmlFor="thana">
                    Thana <span className="required-star">*</span>
                  </label>
                  <input id="thana" name="thana" type="text" className={inputClass("thana")} placeholder="Thana" value={formData.thana} onChange={handleTextChange} />
                  {hasError("thana") && <span className="field-error-msg">{errors.thana}</span>}
                </div>
                <div className="field-group">
                  <label className={`field-label${hasError("postcode") ? " label-error" : ""}`} htmlFor="postcode">
                    Postcode <span className="required-star">*</span>
                  </label>
                  <input id="postcode" name="postcode" type="text" className={inputClass("postcode")} placeholder="Postcode" value={formData.postcode} onChange={handleTextChange} />
                  {hasError("postcode") && <span className="field-error-msg">{errors.postcode}</span>}
                </div>
              </div>

              <div className="field-group full-width-input">
                <label className={`field-label${hasError("streetAddress") ? " label-error" : ""}`} htmlFor="streetAddress">
                  Street Address <span className="required-star">*</span>
                </label>
                <input
                  id="streetAddress"
                  name="streetAddress"
                  type="text"
                  className={inputClass("streetAddress")}
                  placeholder="Street Address"
                  value={formData.streetAddress}
                  onChange={handleTextChange}
                />
                {hasError("streetAddress") && <span className="field-error-msg">{errors.streetAddress}</span>}
              </div>

              <hr className="form-divider" />
              <p className="form-section-title">License & Platform</p>

              <div className="field-row field-row-2">
                <div className="field-group">
                  <label className={`field-label${hasError("tradeLicenseNumber") ? " label-error" : ""}`} htmlFor="tradeLicenseNumber">
                    Trade License Number <span className="required-star">*</span>
                  </label>
                  <input
                    id="tradeLicenseNumber"
                    name="tradeLicenseNumber"
                    type="text"
                    className={inputClass("tradeLicenseNumber")}
                    placeholder="Trade License Number"
                    value={formData.tradeLicenseNumber}
                    onChange={handleTextChange}
                  />
                  {hasError("tradeLicenseNumber") && <span className="field-error-msg">{errors.tradeLicenseNumber}</span>}
                </div>
                <div className="field-group">
                  <label className={`field-label${hasError("platformUrl") ? " label-error" : ""}`} htmlFor="platformUrl">
                    Platform URL <span className="required-star">*</span>
                  </label>
                  <input
                    id="platformUrl"
                    name="platformUrl"
                    type="url"
                    className={inputClass("platformUrl")}
                    placeholder="https://business.com"
                    value={formData.platformUrl}
                    onChange={handleTextChange}
                  />
                  {hasError("platformUrl") && <span className="field-error-msg">{errors.platformUrl}</span>}
                </div>
              </div>
            </div>

            {/* RIGHT: File uploads */}
            <div className="form-upload-section">
              <p className="form-section-title" style={{ marginTop: 0 }}>
                Document Uploads
              </p>

              {[
                { name: "businessTradeLicense", label: "Business Trade License" },
                { name: "businessLogo", label: "Business Logo" },
                { name: "businessOwnerNid", label: "Business Owner NID" },
                { name: "businessOwnerPhoto", label: "Business Owner Photo" },
              ].map(({ name, label }) => (
                <div key={name}>
                  <div className={uploadCardClass(name)}>
                    <div className="upload-card-header">
                      <span className={`upload-label${hasError(name) ? " upload-label-error" : ""}`}>
                        {label} <span className="required-star">*</span>
                      </span>
                      <span className="upload-limit">Max 2MB</span>
                    </div>
                    <div className="upload-controls">
                      <label htmlFor={name}>
                        <span
                          className={`choose-file-btn${hasError(name) ? " btn-error" : ""}`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === "Enter" && clickById(name)}
                        >
                          Choose file
                        </span>
                      </label>
                      <input id={name} name={name} type="file" accept="image/*,.pdf" className="hidden-file-input" onChange={handleFileChange} />
                      <span className={`file-name-display${fileNames[name] ? " has-file" : hasError(name) ? " name-error" : ""}`}>{fileNames[name] || "No file chosen"}</span>
                    </div>
                  </div>
                  {hasError(name) && (
                    <span className="field-error-msg" style={{ marginTop: 5, display: "flex" }}>
                      {errors[name]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Policy checkbox */}
          <div className="policy-section">
            <div className="policy-checkbox-row">
              <input id="agreedToPolicy" name="agreedToPolicy" type="checkbox" className="policy-checkbox" checked={formData.agreedToPolicy} onChange={handleTextChange} />
              <label htmlFor="agreedToPolicy" className="policy-text">
                I have read and agree to the{" "}
                <a href="#" className="policy-link capitalize">
                  {title} Policy.
                </a>{" "}
                <span className="required-star">*</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="form-footer">
            {submitAttempted && errorCount > 0 && (
              <div className="submit-error-count">
                ⚠ {errorCount} error{errorCount > 1 ? "s" : ""} remaining
              </div>
            )}
            <button type="submit" className="submit-btn" disabled={isSubmitDisabled}>
              Apply Now
            </button>
          </div>
        </form>
      </div>

      {/* Success popup */}
      {showSuccessPopup && (
        <div className="popup-overlay" onClick={(e) => e.target === e.currentTarget && handleClosePopup()}>
          <div className="popup-modal" role="dialog" aria-modal="true" aria-labelledby="popup-title">
            <button className="popup-close-btn" onClick={handleClosePopup} aria-label="Close">
              ✕
            </button>
            <div className="popup-success-ring">
              <svg className="popup-checkmark" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
                <circle className="popup-checkmark-circle" cx="26" cy="26" r="25" />
                <path className="popup-checkmark-tick" d="M14 27l9 9 16-18" />
              </svg>
            </div>
            <h2 className="popup-title" id="popup-title">
              Application Submitted!
            </h2>
            <p className="popup-subtitle">
              Your {title} application has been received.
              <br />
              Our team will review it and get back to you shortly.
            </p>

            <button className="popup-action-btn" onClick={handleClosePopup}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
