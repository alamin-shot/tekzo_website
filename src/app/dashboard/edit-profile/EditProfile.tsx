"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCamera,
  FiMail,
  FiPhone,
  FiLock,
  FiCalendar,
  FiUser,
  FiCheckCircle,
  FiChevronLeft,
  FiSave,
} from "react-icons/fi";
import { PiGenderIntersexLight } from "react-icons/pi";
import { Sparkles } from "lucide-react";
import clientFetchAPI from "@/utils/clientFetchAPI";
import { useRouter } from "next/navigation";
import type { ChangeEvent, KeyboardEvent } from "react";
import type { EditProfileForm, EditProfileProps, FieldErrorProps, PasswordWorkflowProps, SecurityFieldProps, VerificationWorkflowProps } from "@/types/props/dashboard";
import { errMessage, isList, rec } from "@/lib/json";
import { inputValue, nodeOf, str } from "@/lib/render";

const FieldError = ({ errors, field }: FieldErrorProps) => {
  const value = rec(errors)?.[field];
  if (!value) return null;
  const msg = isList(value) ? value[0] : value;
  return <p className="text-xs text-rose-500 font-medium mt-1 ml-1">{nodeOf(msg)}</p>;
};

export default function EditProfile({ user }: EditProfileProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [previewImage, setPreviewImage] = useState<unknown>(
    rec(user)?.profile_picture || "/profile-image.jpg",
  );
  const [dropdownPosition, setDropdownPosition] = useState("bottom");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<unknown>({});
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [userData, setUserData] = useState<unknown>(user);
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<EditProfileForm>({
    name: rec(user)?.name || "",
    birthday: rec(user)?.date_of_birth || "",
    gender: rec(user)?.gender || "male",
  });

  useEffect(() => {
    if (activeTab === "gender" && genderRef.current) {
      const rect = genderRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropdownPosition(spaceBelow < 200 ? "top" : "bottom");
    }
  }, [activeTab]);

  const handleTabToggle = (tabName: string) => {
    setActiveTab(activeTab === tabName ? null : tabName);
    setStep(1);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    // `e.target.files[0]` threw for a null FileList
    const files = e.target.files;
    if (files === null) throw new TypeError("Cannot read properties of null (reading '0')");
    const file = files[0];
    if (file && file.type.startsWith("image/")) {
      setPreviewImage(URL.createObjectURL(file));
      setProfileImage(file);
      setImgError(false);
      setFieldErrors({ ...Object.assign({}, fieldErrors), profile_picture: null });
    }
  };

  const handleSaveChanges = async () => {
    setSaveLoading(true);
    setSaveSuccess(false);
    setFieldErrors({});

    try {
      if (profileImage) {
        const form = new FormData();
        form.append("name", String(formData.name));
        form.append("date_of_birth", String(formData.birthday));
        form.append("gender", String(formData.gender));
        form.append("profile_picture", profileImage);
        const response = await clientFetchAPI(
          "/customer/profile",
          "POST",
          form,
        );
        const updatedData = rec(response)?.data || response || {};
        const updatedProfilePicture =
          rec(updatedData)?.profile_picture || previewImage;
        window.dispatchEvent(
          new CustomEvent("userProfileUpdated", {
            detail: {
              name: rec(updatedData)?.name || formData.name,
              profile_picture: updatedProfilePicture,
            },
          }),
        );
        router.push("/dashboard/profile");
      } else {
        const response = await clientFetchAPI("/customer/profile", "POST", {
          name: formData.name,
          date_of_birth: formData.birthday,
          gender: formData.gender,
        });
        const updatedData = rec(response)?.data || response || {};
        window.dispatchEvent(
          new CustomEvent("userProfileUpdated", {
            detail: {
              name: rec(updatedData)?.name || formData.name,
            },
          }),
        );
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const errs = rec(err)?.errors;
        if (errs && Object.keys(errs).length > 0) {
          setFieldErrors(errs);
      } else {
        setFieldErrors({ general: errMessage(err) || "Failed to save changes" });
      }
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/profile"
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-500 dark:text-slate-400 cursor-pointer"
          >
            <FiChevronLeft size={22} />
          </Link>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Edit Profile
            </h1>
            <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Update personal identity, avatar image, and credentials
            </p>
          </div>
        </div>

        {/* Save button */}
        <div className="flex flex-col sm:items-end gap-1">
          {saveSuccess && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1">
              <FiCheckCircle className="w-3.5 h-3.5" /> Saved successfully!
            </span>
          )}
          <button
            onClick={handleSaveChanges}
            disabled={saveLoading}
            className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-60 cursor-pointer w-fit"
          >
            {saveLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white dark:border-slate-900 border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : saveSuccess ? (
              <>
                <FiCheckCircle size={15} /> Saved!
              </>
            ) : (
              <>
                <FiSave size={15} /> Save Changes
              </>
            )}
          </button>
          <FieldError errors={fieldErrors} field="general" />
        </div>
      </div>

      <div className="space-y-6">
        {/* Avatar Section */}
        <section className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs p-6 lg:p-8 flex flex-col sm:flex-row items-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <div
              className="relative group shrink-0 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              title="Click to change photo"
            >
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-md bg-slate-100 dark:bg-white/5 flex items-center justify-center ring-4 ring-slate-100 dark:ring-white/[0.06]">
                {!imgError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={str(previewImage)}
                    alt="Preview avatar"
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="bg-slate-200 dark:bg-white/10 w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                    <FiUser size={40} />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <FiCamera size={24} className="text-white mb-1" />
                <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                  Change
                </span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            <FieldError errors={fieldErrors} field="profile_picture" />
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.06] text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-2">
              <Sparkles className="w-3 h-3 text-sky-500" />
              <span>Avatar Media</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Profile Photo
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
              Upload a crisp JPEG or PNG image. It displays across your purchases, verified reviews, and customer care communications.
            </p>
          </div>
        </section>

        {/* General Info Section */}
        <section className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs p-6 lg:p-8">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-7 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            General Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-7 gap-x-10">
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
                Full Name
              </label>
              <div
                className={`flex items-center gap-3.5 px-4 py-3 bg-slate-50/70 dark:bg-white/[0.02] rounded-2xl border transition-all ${
                  rec(fieldErrors)?.name
                    ? "border-rose-400 bg-rose-50/20"
                    : "border-slate-200/80 dark:border-white/[0.06] focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20"
                }`}
              >
                <FiUser size={18} className="text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={inputValue(formData.name)}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setFieldErrors({ ...Object.assign({}, fieldErrors), name: null });
                  }}
                  className="bg-transparent w-full text-sm font-semibold text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <FieldError errors={fieldErrors} field="name" />
            </div>

            {/* Email */}
            <SecurityField
              label="Email Address"
              value={rec(user)?.email || ""}
              icon={<FiMail size={18} />}
              isExpanded={activeTab === "email"}
              onToggle={() => handleTabToggle("email")}
            >
              <VerificationWorkflow
                placeholder="mail@example.com"
                type="email"
                step={step}
                setStep={setStep}
              />
            </SecurityField>

            {/* Mobile */}
            <SecurityField
              label="Mobile Number"
              value={rec(userData)?.phone || ""}
              icon={<FiPhone size={18} />}
              isExpanded={activeTab === "mobile"}
              onToggle={() => handleTabToggle("mobile")}
            >
              <VerificationWorkflow
                placeholder="+880 1XXX XXXXXX"
                type="tel"
                step={step}
                setStep={setStep}
                onPhoneUpdate={(newPhone: string) => {
                  setUserData({ ...Object.assign({}, userData), phone: newPhone });
                  setActiveTab(null);
                  setStep(1);
                }}
              />
            </SecurityField>

            {/* Password */}
            <SecurityField
              label="Password"
              value="••••••••••••"
              icon={<FiLock size={18} />}
              isExpanded={activeTab === "password"}
              onToggle={() => handleTabToggle("password")}
            >
              <PasswordWorkflow step={step} setStep={setStep} />
            </SecurityField>

            {/* Birthday */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
                Birthday
              </label>
              <div
                className={`flex items-center gap-3.5 px-4 py-3 bg-slate-50/70 dark:bg-white/[0.02] rounded-2xl border transition-all ${
                  rec(fieldErrors)?.date_of_birth
                    ? "border-rose-400 bg-rose-50/20"
                    : "border-slate-200/80 dark:border-white/[0.06] focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20"
                }`}
              >
                <FiCalendar size={18} className="text-slate-400 dark:text-slate-500" />
                <input
                  type="date"
                  value={inputValue(formData.birthday)}
                  onChange={(e) => {
                    setFormData({ ...formData, birthday: e.target.value });
                    setFieldErrors({ ...Object.assign({}, fieldErrors), date_of_birth: null });
                  }}
                  className="bg-transparent w-full text-sm font-semibold text-slate-900 dark:text-white outline-none"
                />
              </div>
              <FieldError errors={fieldErrors} field="date_of_birth" />
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-2 relative" ref={genderRef}>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
                Gender
              </label>
              <button
                type="button"
                onClick={() => handleTabToggle("gender")}
                className={`flex items-center justify-between px-4 py-3 bg-slate-50/70 dark:bg-white/[0.02] rounded-2xl border transition-all group cursor-pointer ${
                  rec(fieldErrors)?.gender
                    ? "border-rose-400 bg-rose-50/20"
                    : "border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <PiGenderIntersexLight
                    size={20}
                    className="text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors"
                  />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
                    {nodeOf(formData.gender)}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: activeTab === "gender" ? 180 : 0 }}
                  className="text-slate-400"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 4.5L6 8L9.5 4.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              </button>
              <FieldError errors={fieldErrors} field="gender" />

              <AnimatePresence>
                {activeTab === "gender" && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setActiveTab(null)}
                    />
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: dropdownPosition === "bottom" ? -10 : 10,
                        scale: 0.95,
                      }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{
                        opacity: 0,
                        y: dropdownPosition === "bottom" ? -10 : 10,
                        scale: 0.95,
                      }}
                      className={`absolute left-0 w-full bg-white dark:bg-[#0f182c] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-2 z-30 ${
                        dropdownPosition === "bottom" ? "top-full mt-2" : "bottom-full mb-2"
                      }`}
                    >
                      {["male", "female", "other"].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, gender: option });
                            setFieldErrors({ ...Object.assign({}, fieldErrors), gender: null });
                            setActiveTab(null);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                            formData.gender === option
                              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                          }`}
                        >
                          <span className="capitalize">{option}</span>
                          {formData.gender === option && (
                            <FiCheckCircle size={14} className="text-sky-400 dark:text-sky-600" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ✅ SecurityField
function SecurityField({ label, value, icon, isExpanded, onToggle, children }: SecurityFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </label>
        <button
          type="button"
          onClick={onToggle}
          className={`text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            isExpanded
              ? "text-rose-500 hover:text-rose-600"
              : "text-sky-600 dark:text-sky-400 hover:underline"
          }`}
        >
          {isExpanded ? "Close" : "Change"}
        </button>
      </div>
      <div
        onClick={onToggle}
        className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border transition-all cursor-pointer group/field ${
          isExpanded
            ? "bg-white dark:bg-slate-900/60 border-slate-300 dark:border-white/20 shadow-sm"
            : "border-slate-200/80 dark:border-white/[0.06] bg-slate-50/70 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20"
        }`}
      >
        <span
          className={`transition-colors ${
            isExpanded
              ? "text-slate-900 dark:text-white"
              : "text-slate-400 dark:text-slate-500 group-hover/field:text-slate-700 dark:group-hover/field:text-slate-300"
          }`}
        >
          {icon}
        </span>
        <p
          className={`text-sm font-semibold transition-colors flex-1 truncate ${
            isExpanded
              ? "text-slate-900 dark:text-white"
              : "text-slate-800 dark:text-slate-100"
          }`}
        >
          {nodeOf(value)}
        </p>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-5 bg-slate-50/80 dark:bg-white/[0.02] rounded-2xl border border-slate-200/70 dark:border-white/[0.08] shadow-inner">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ✅ VerificationWorkflow
function VerificationWorkflow({
  placeholder,
  type,
  step,
  setStep,
  onPhoneUpdate,
}: VerificationWorkflowProps) {
  const [value, setValue] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSendCode = async () => {
    if (!value) {
      setError("This field is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await clientFetchAPI(
        type === "email"
          ? "/customer/email-verify-request"
          : "/customer/phone-verify-request",
        "POST",
        type === "email" ? { email: value } : { phone_number: value },
      );
      setStep(2);
    } catch (err) {
      setError(errMessage(err) || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await clientFetchAPI(
        type === "email" ? "/customer/email-verify" : "/customer/phone-verify",
        "POST",
        type === "email"
          ? { email: value, code }
          : { phone_number: value, code },
      );
      setStep(3);
      if (type === "tel" && onPhoneUpdate) {
        onPhoneUpdate(value);
      }
    } catch (err) {
      setError(errMessage(err) || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
      {nodeOf(error && (
        <p className="text-xs text-rose-500 font-medium bg-rose-50 dark:bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-500/20">
          {nodeOf(error)}
        </p>
      ))}
      {step === 1 ? (
        <div className="space-y-4">
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/15 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <button
            onClick={handleSendCode}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-60 transition-all cursor-pointer shadow-sm"
          >
            {loading ? "Sending..." : "Send Verification Code"}
          </button>
        </div>
      ) : step === 2 ? (
        <div className="space-y-4 text-center">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Code sent to <span className="text-slate-900 dark:text-white">{value}</span>
          </p>
          <div className="flex justify-center gap-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  otpRefs.current[i] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className="w-10 h-12 text-center bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/15 rounded-xl font-bold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-sm text-slate-900 dark:text-white transition-all"
              />
            ))}
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => {
                setStep(1);
                setOtp(["", "", "", "", "", ""]);
                setError("");
              }}
              className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline transition-colors cursor-pointer"
            >
              Resend Code
            </button>
          </div>
          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-60 shadow-sm transition-all cursor-pointer"
          >
            {loading ? "Verifying..." : "Verify & Update"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center py-4 text-center animate-in zoom-in">
          <FiCheckCircle size={36} className="text-emerald-500 mb-2" />
          <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Updated Successfully!
          </p>
        </div>
      )}
    </div>
  );
}

// ✅ PasswordWorkflow
function PasswordWorkflow({ step, setStep }: PasswordWorkflowProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>("");

  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      setError("Current password is required");
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await clientFetchAPI("/customer/change-password", "POST", {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setStep(2);
    } catch (err) {
      setError(errMessage(err) || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
      {nodeOf(error && (
        <p className="text-xs text-rose-500 font-medium bg-rose-50 dark:bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-500/20">
          {nodeOf(error)}
        </p>
      ))}
      {step === 1 ? (
        <div className="space-y-3">
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/15 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/15 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/15 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <button
            onClick={handleUpdatePassword}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-60 shadow-sm transition-all cursor-pointer"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center py-4 text-center animate-in zoom-in">
          <FiCheckCircle size={36} className="text-emerald-500 mb-2" />
          <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Password Secured!
          </p>
        </div>
      )}
    </div>
  );
}
