"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail,
  FiPhone,
  FiLock,
  FiCalendar,
  FiUser,
  FiX,
  FiCheckCircle,
  FiEdit3,
  FiShield,
  FiAward,
} from "react-icons/fi";
import { PiGenderIntersexLight } from "react-icons/pi";
import clientFetchAPI from "@/utils/clientFetchAPI";

function AvatarDisplay({
  sizeClass,
  iconSize,
  profilePicture,
  imgError,
  onError,
}) {
  return (
    <div
      className={`${sizeClass} rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center transition-all`}
    >
      {profilePicture && !imgError ? (
        <Image
          src={profilePicture}
          alt="User Avatar"
          width={200}
          height={200}
          className="w-full h-full object-cover"
          onError={onError}
          priority
          fetchPriority="high"
        />
      ) : (
        <div className="bg-slate-100 dark:bg-white/[0.06] w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
          <FiUser size={iconSize} />
        </div>
      )}
    </div>
  );
}

export default function ProfileView({ user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [step, setStep] = useState(1);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef(null);

  const handleTabToggle = (tabName) => {
    setActiveTab(activeTab === tabName ? null : tabName);
    setStep(1);
  };

  const sharedAvatarProps = {
    profilePicture: user?.profile_picture,
    imgError,
    onError: () => setImgError(true),
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
      {/* Profile Image Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0f182c] border border-slate-200/80 dark:border-white/10 rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <FiX size={20} />
              </button>
              <div className="mx-auto mb-5 flex justify-center">
                <AvatarDisplay
                  sizeClass="w-44 h-44 rounded-2xl ring-4 ring-sky-500/20"
                  iconSize={60}
                  {...sharedAvatarProps}
                />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {user?.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {user?.email}
              </p>
              <Link
                href="/dashboard/edit-profile"
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
              >
                <FiEdit3 size={14} />
                Edit Profile
              </Link>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Account Profile
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your personal profile, credentials, and verification status
          </p>
        </div>
        <Link
          href="/dashboard/edit-profile"
          className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95 cursor-pointer w-fit"
        >
          <FiEdit3 size={14} />
          <span>Edit Profile</span>
        </Link>
      </div>

      <div className="space-y-6">
        {/* Top Profile Summary Card */}
        <section className="relative overflow-hidden bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs p-6 lg:p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />

          <div
            className="shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95 relative group"
            onClick={() => setIsModalOpen(true)}
            title="Click to expand avatar"
          >
            <AvatarDisplay
              sizeClass="w-24 h-24 lg:w-28 lg:h-28 ring-4 ring-slate-100 dark:ring-white/[0.06]"
              iconSize={40}
              {...sharedAvatarProps}
            />
            <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
              View
            </div>
          </div>

          <div className="text-center sm:text-left flex-1 relative z-10">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {user?.name}
              </h2>
              {user?.elite?.is_elite ? (
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                  <FiAward className="w-3 h-3" />
                  {user?.elite?.current_tier || "Elite Member"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400">
                  <FiShield className="w-3 h-3" />
                  Member
                </span>
              )}
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
              {user?.email}
            </p>
            {user?.phone && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {user?.phone}
              </p>
            )}
          </div>
        </section>

        {/* Details Section */}
        <section className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs p-6 lg:p-8">
          <div className="flex items-center justify-between mb-7 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Personal Credentials
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified identification and security settings
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-7 gap-x-10">
            <ProfileField
              icon={<FiUser />}
              label="Full Name"
              value={user?.name || "—"}
            />

            <ProfileField
              icon={<FiMail />}
              label="Email Address"
              value={user?.email || "—"}
              isVerified={user?.email_verified}
              onAction={() => handleTabToggle("email")}
              isExpanded={activeTab === "email"}
            >
              <EmailVerificationWorkflow
                user={user}
                step={step}
                setStep={setStep}
              />
            </ProfileField>

            <ProfileField
              icon={<FiPhone />}
              label="Mobile Number"
              value={user?.phone || "—"}
              isVerified={user?.phone_verified}
              onAction={() => handleTabToggle("mobile")}
              isExpanded={activeTab === "mobile"}
            >
              <PhoneVerificationWorkflow
                user={user}
                step={step}
                setStep={setStep}
              />
            </ProfileField>

            <ProfileField
              icon={<FiLock />}
              label="Security Password"
              value="••••••••••••"
              onAction={() => handleTabToggle("password")}
              isExpanded={activeTab === "password"}
            >
              <PasswordWorkflow user={user} step={step} setStep={setStep} />
            </ProfileField>

            <ProfileField
              icon={<FiCalendar />}
              label="Date of Birth"
              value={user?.date_of_birth || "—"}
            />
            <ProfileField
              icon={<PiGenderIntersexLight size={20} />}
              label="Gender"
              value={
                user?.gender
                  ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
                  : "—"
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function ProfileField({
  icon,
  label,
  value,
  onAction,
  isExpanded,
  children,
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </label>
        {onAction && (
          <button
            onClick={onAction}
            className={`text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              isExpanded
                ? "text-rose-500 hover:text-rose-600"
                : "text-sky-600 dark:text-sky-400 hover:underline"
            }`}
          >
            {isExpanded ? "Close" : "Change"}
          </button>
        )}
      </div>
      <div className="flex items-center gap-3.5 px-4 py-3.5 bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] rounded-2xl transition-colors">
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex-1 truncate">
          {value}
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

function EmailVerificationWorkflow({ user, step, setStep }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async () => {
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      await clientFetchAPI("/customer/email-verify-request", "POST", {
        name: user?.name,
        email,
      });
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) return;
    setLoading(true);
    setError("");
    try {
      await clientFetchAPI("/customer/email-verify", "POST", {
        name: user?.name,
        email,
        code,
      });
      setStep(3);
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`email-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`email-otp-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="space-y-4">
      {step === 1 ? (
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Enter your new email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/15 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {error && (
            <p className="text-xs text-rose-500 font-medium">{error}</p>
          )}
          <button
            onClick={handleSendCode}
            disabled={loading || !email}
            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? "Sending…" : "Send Verification Code"}
          </button>
        </div>
      ) : step === 2 ? (
        <div className="space-y-4 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Enter the 6-digit code sent to{" "}
            <span className="font-bold text-slate-800 dark:text-slate-200">{email}</span>
          </p>
          <div className="flex justify-center gap-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`email-otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className="w-10 h-12 text-center bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/15 rounded-xl font-bold text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
              />
            ))}
          </div>
          {error && (
            <p className="text-xs text-rose-500 font-medium">{error}</p>
          )}
          <button
            onClick={handleVerify}
            disabled={loading || otp.join("").length < 6}
            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-50 shadow-md transition-all cursor-pointer"
          >
            {loading ? "Verifying…" : "Verify & Update"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center py-4 text-center animate-in zoom-in">
          <FiCheckCircle size={36} className="text-emerald-500 mb-2" />
          <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Email Updated Successfully!
          </p>
        </div>
      )}
    </div>
  );
}

function PhoneVerificationWorkflow({ user, step, setStep }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async () => {
    if (!phone) return;
    setLoading(true);
    setError("");
    try {
      await clientFetchAPI("/customer/phone-verify-request", "POST", {
        name: user?.name,
        phone_number: phone,
      });
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) return;
    setLoading(true);
    setError("");
    try {
      await clientFetchAPI("/customer/phone-verify", "POST", {
        name: user?.name,
        phone_number: phone,
        code,
      });
      setStep(3);
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`phone-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`phone-otp-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="space-y-4">
      {step === 1 ? (
        <div className="space-y-4">
          <input
            type="tel"
            placeholder="+880 1XXX-XXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/15 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {error && (
            <p className="text-xs text-rose-500 font-medium">{error}</p>
          )}
          <button
            onClick={handleSendCode}
            disabled={loading || !phone}
            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? "Sending…" : "Send Verification Code"}
          </button>
        </div>
      ) : step === 2 ? (
        <div className="space-y-4 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Enter the 6-digit code sent to{" "}
            <span className="font-bold text-slate-800 dark:text-slate-200">{phone}</span>
          </p>
          <div className="flex justify-center gap-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`phone-otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className="w-10 h-12 text-center bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/15 rounded-xl font-bold text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
              />
            ))}
          </div>
          {error && (
            <p className="text-xs text-rose-500 font-medium">{error}</p>
          )}
          <button
            onClick={handleVerify}
            disabled={loading || otp.join("").length < 6}
            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-50 shadow-md transition-all cursor-pointer"
          >
            {loading ? "Verifying…" : "Verify & Update"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center py-4 text-center animate-in zoom-in">
          <FiCheckCircle size={36} className="text-emerald-500 mb-2" />
          <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Mobile Updated Successfully!
          </p>
        </div>
      )}
    </div>
  );
}

function PasswordWorkflow({ user, step, setStep }) {
  const [form, setForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.current_password || !form.password || !form.password_confirmation)
      return;
    setLoading(true);
    setError("");
    try {
      await clientFetchAPI("/customer/change-password", "POST", {
        name: user?.name,
        ...form,
      });
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === 1 ? (
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Identity Verification
          </p>
          <input
            type="password"
            placeholder="Current Password"
            value={form.current_password}
            onChange={handleChange("current_password")}
            className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/15 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <input
            type="password"
            placeholder="New Password"
            value={form.password}
            onChange={handleChange("password")}
            className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/15 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={form.password_confirmation}
            onChange={handleChange("password_confirmation")}
            className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/15 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {error && (
            <p className="text-xs text-rose-500 font-medium">{error}</p>
          )}
          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              !form.current_password ||
              !form.password ||
              !form.password_confirmation
            }
            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-50 shadow-md transition-all cursor-pointer"
          >
            {loading ? "Updating…" : "Update Password"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center py-4 text-center animate-in zoom-in">
          <FiCheckCircle size={36} className="text-emerald-500 mb-2" />
          <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Security Credentials Updated!
          </p>
        </div>
      )}
    </div>
  );
}
