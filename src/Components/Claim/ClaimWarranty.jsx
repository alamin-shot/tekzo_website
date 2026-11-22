"use client";
import Banner from "@/Components/ReuseableComponent/Banner";
import { useState } from "react";
import Title from "../ReuseableComponent/Title";
import Link from "next/link";
import clientFetchAPI from "@/utils/clientFetchAPI";

export default function ClaimWarranty({ seoData }) {
  const [imeiOrSl, setImeiOrSl] = useState("");
  const [claimReason, setClaimReason] = useState("");
  const [verificationStatus, setVerificationStatus] = useState(null); // 'success' | 'unsuccess' | null
  const [resultMessage, setResultMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await clientFetchAPI(
        "/customer/warranty-claims",
        "POST",
        {
          serial_number: imeiOrSl.trim(),
          reason: claimReason,
        },
      );

      setResultMessage(
        response?.message ||
          "Your warranty claim has been submitted successfully.",
      );
      setVerificationStatus("success");
    } catch (err) {
      setResultMessage(
        err?.message || "Verification failed. Please try again.",
      );
      setVerificationStatus("unsuccess");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setImeiOrSl("");
    setClaimReason("");
    setVerificationStatus(null);
    setResultMessage("");
  };

  return (
    <div className="min-h-screen">
      <Banner h1="Claim Your Warranty"
        image={seoData?.banner || "/loginPage/contact-about-bg.webp"}
        title={seoData?.title || "Claim A Warranty"}
      />

      <div className="max-w-xl mx-auto py-12 md:py-16">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <Title>Claim Your Warranty</Title>
          <p className="mt-2 text-sm text-gray-500 text-center">
            Please provide your IMEI/SL number and reason for claim to verify
            your warranty.
          </p>
        </div>

        {/* Form / Result Container */}
        <div className="bg-white rounded-2xl p-4 md:p-8 border border-gray-100 shadow-sm">
          {verificationStatus === "success" ? (
            /* Success UI */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-semibold text-gray-900">
                Warranty Claim Submitted!
              </h3>
              <p className="text-sm text-gray-500">{resultMessage}</p>

              <div className="pt-4 flex justify-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-sm"
                >
                  Verify Another
                </button>
              </div>
            </div>
          ) : verificationStatus === "unsuccess" ? (
            /* Unsuccess UI */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-semibold text-gray-900">
                Verification Failed
              </h3>
              <p className="text-sm text-gray-500">{resultMessage}</p>

              <div className="pt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVerificationStatus(null)}
                  className="w-full sm:w-auto px-8 py-3 bg-secondary text-white font-medium rounded-xl active:scale-[0.99] transition-all text-sm shadow-sm"
                >
                  Go Back
                </button>
              </div>
            </div>
          ) : (
            /* Main Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* IMEI / SL Number Input */}
              <div>
                <label
                  htmlFor="imeiOrSl"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  IMEI / SL Number
                </label>
                <input
                  type="text"
                  id="imeiOrSl"
                  required
                  value={imeiOrSl}
                  onChange={(e) => setImeiOrSl(e.target.value)}
                  placeholder="Enter your product's IMEI/SL number"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-white focus:border-transparent transition-all"
                />
              </div>

              {/* Reason of Claim Textbox */}
              <div>
                <label
                  htmlFor="claimReason"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Reason of Claim
                </label>
                <textarea
                  id="claimReason"
                  required
                  rows={4}
                  value={claimReason}
                  onChange={(e) => setClaimReason(e.target.value)}
                  placeholder="Please describe the issue or reason for claiming warranty..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-white focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-row flex-col-reverse gap-3 pt-4 sm:justify-end">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-sm"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 bg-secondary text-white font-medium rounded-xl active:scale-[0.99] transition-all text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Verifying..." : "Verify"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Guidelines Anchor Link */}
        <Link href={"/how-to-claim"} className="flex justify-center mt-8">
          <button className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors py-2 px-4 rounded-lg hover:bg-gray-100">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Review Warranty Guidelines
          </button>
        </Link>
      </div>
    </div>
  );
}
