"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, FileText, Check, X, Loader2 } from "lucide-react";
import Banner from "../Banner";
import type { ChangeEvent, FormEvent } from "react";
import type { JobApplicationData, JobApplicationFormProps } from "@/types/props/content";
import { firstErrorOf, rec } from "@/lib/json";
import { nodeOf } from "@/lib/render";

export default function ApplicationForm({ slug }: JobApplicationFormProps) {
  const [showModal, setShowModal] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  // holds the raw API message
  const [error, setError] = useState<unknown>("");

  const [formData, setFormData] = useState<JobApplicationData>({
    name: "",
    email: "",
    phone: "",
    gender: "",
    age: "",
    skills: "",
    reason_of_join: "",
    choos_reason: "",
    photo: null,
    cv: null,
  });

  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => setAnimate(true), 10);
      return () => clearTimeout(timer);
    }
  }, [showModal]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // only inputs have `files` (null for non-file inputs, undefined elsewhere)
    const files = e.target instanceof HTMLInputElement ? e.target.files : undefined;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = new FormData();
      data.append("_endpoint", `/job-apply/${String(slug)}`);
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("gender", formData.gender);
      data.append("age", formData.age);
      if (formData.skills) data.append("skills", formData.skills);
      if (formData.reason_of_join)
        data.append("reason_of_join", formData.reason_of_join);
      if (formData.choos_reason)
        data.append("choos_reason", formData.choos_reason);
      if (formData.cv) data.append("cv", formData.cv);
      if (formData.photo) data.append("photo", formData.photo);

      const res = await fetch("/api/client-fetch", {
        method: "POST",
        body: data,
      });

      const json: unknown = await res.json();

      if (!res.ok) {
        const msg =
          rec(json)?.message ||
          firstErrorOf(rec(json)?.errors) ||
          "Submission failed.";
        setError(msg);
        return;
      }

      setFormData({
        name: "",
        email: "",
        phone: "",
        gender: "",
        age: "",
        skills: "",
        reason_of_join: "",
        choos_reason: "",
        photo: null,
        cv: null,
      });
      setShowModal(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setAnimate(false);
    setTimeout(() => setShowModal(false), 300);
  };

  return (
    <div className="">
      <Banner
        image={"/loginPage/contact-about-bg.webp"}
        title={"Application Form"}
      />

      <div className="min-h-screen lg:py-12 lg:px-4 relative font-sans">
        {/* SUCCESS MODAL */}
        {showModal && (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-6 transition-opacity duration-300 ease-out
            ${animate ? "opacity-100" : "opacity-0"}`}
          >
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
              onClick={closeModal}
            />
            <div
              className={`relative bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl border border-slate-100 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
              ${animate ? "translate-y-0 scale-100" : "translate-y-8 scale-[0.95]"}`}
            >
              <button
                onClick={closeModal}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex justify-center mb-6">
                <div
                  className={`h-16 w-16 rounded-full bg-teal-50 flex items-center justify-center transition-all duration-700 delay-200
                ${animate ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
                >
                  <Check size={32} className="text-secondary" strokeWidth={3} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2 text-center">
                Application Received
              </h2>
              <p className="text-slate-500 text-sm text-center leading-relaxed mb-8">
                Thank you for applying. Our team will review your profile and
                contact you if your skills match our requirements.
              </p>
              <button
                onClick={closeModal}
                className="w-full bg-[#00a88e] hover:bg-[#008d77] text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* FORM CONTAINER */}
        <div className="max-w-4xl mx-auto bg-white lg:rounded-[2.5rem] lg:shadow-sm lg:border border-slate-100 overflow-hidden">
          <div className="border-b border-slate-100 py-8 text-center mb-4 lg:mb-0">
            <h1 className="text-primary text-xl lg:text-2xl font-bold tracking-tight capitalize">
              Job Application
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p- lg:p-12 space-y-8">
            {/* Name */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-700 text-sm">
                Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Your name"
                className="w-full px-6 py-4 rounded-full border border-slate-200 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all"
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 text-sm">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Your Email"
                  className="w-full px-6 py-4 rounded-full border border-slate-200 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 text-sm">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter Your Phone Number"
                  className="w-full px-6 py-4 rounded-full border border-slate-200 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all"
                />
              </div>
            </div>

            {/* Photo, Gender, Age */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 text-sm">
                  Photo (Max 2mb)
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    name="photo"
                    accept="image/jpg,image/jpeg,image/png"
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex items-center px-4 py-3 rounded-full border border-slate-200 text-slate-400 text-sm group-hover:border-orange-300 transition-all">
                    <ImageIcon
                      size={18}
                      className="text-orange-400 mr-2 shrink-0"
                    />
                    <span className="truncate">
                      {formData.photo ? formData.photo.name : "Choose Image"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700 text-sm">
                  Gender *
                </label>
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-6 py-3 rounded-full border border-slate-200 outline-none text-slate-500 text-sm appearance-none bg-no-repeat bg-[right_1.5rem_center] bg-[url('https://cdn-icons-png.flaticon.com/512/271/271210.png')] bg-[length:12px]"
                >
                  <option value="">Choose Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700 text-sm">
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  required
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Enter Your Age"
                  className="w-full px-6 py-3 rounded-full border border-slate-200 outline-none text-sm transition-all focus:border-orange-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-slate-700 text-sm">
                Skills
              </label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                rows={3}
                className="w-full px-6 py-4 rounded-3xl border border-slate-200 outline-none focus:border-orange-400 resize-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-slate-700 text-sm">
                Why Join Us?
              </label>
              <textarea
                name="reason_of_join"
                value={formData.reason_of_join}
                onChange={handleChange}
                rows={3}
                className="w-full px-6 py-4 rounded-3xl border border-slate-200 outline-none focus:border-orange-400 resize-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-slate-700 text-sm">
                What sets you apart from others?
              </label>
              <textarea
                name="choos_reason"
                value={formData.choos_reason}
                onChange={handleChange}
                rows={3}
                className="w-full px-6 py-4 rounded-3xl border border-slate-200 outline-none focus:border-orange-400 resize-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-slate-700 text-sm">
                Resume / CV (PDF, DOC, DOCX — max 2mb) *
              </label>
              <div className="relative group">
                <input
                  type="file"
                  name="cv"
                  required
                  accept=".pdf,.doc,.docx"
                  onChange={handleChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex items-center px-6 py-4 rounded-full border border-slate-200 text-slate-400 group-hover:border-orange-300 transition-all">
                  <FileText
                    size={20}
                    className="text-slate-800 mr-3 shrink-0"
                  />
                  <span className="text-sm truncate">
                    {formData.cv ? formData.cv.name : "Upload PDF / DOC"}
                  </span>
                </div>
              </div>
            </div>

            {nodeOf(error && (
              <p className="text-red-500 text-sm text-center">{nodeOf(error)}</p>
            ))}

            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-orange-700 disabled:opacity-60 text-white px-16 py-4 rounded-full font-bold text-lg transition-all active:scale-95 hover:-translate-y-1 flex items-center gap-2"
              >
                {loading && <Loader2 size={20} className="animate-spin" />}
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
