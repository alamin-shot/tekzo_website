"use client";

/**
 * Delivery Information Modal Content
 * Displays delivery timelines and shipping information
 */
export default function DeliveryContent() {
  return (
    <div className="space-y-4">
      {/* Inside Dhaka Card */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-amber-300 transition-colors shadow-sm">
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Inside Dhaka
              </p>
              <h4 className="text-2xl lg:text-3xl font-extrabold text-gray-900">
                24-48 Hours
              </h4>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold uppercase shadow-md">
                Fast
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              className="w-5 h-5 text-teal-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="font-medium">Express delivery available</span>
          </div>
        </div>
      </div>

      {/* Outside Dhaka Card */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-gray-300 transition-colors shadow-sm">
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Outside Dhaka
              </p>
              <h4 className="text-2xl lg:text-3xl font-extrabold text-gray-900">
                3-5 Business Days
              </h4>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 text-xs font-bold uppercase">
                Standard
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              className="w-5 h-5 text-blue-500"
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
            <span className="font-medium">Nationwide coverage</span>
          </div>
        </div>
      </div>

      {/* Important Note */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-0.5">
            <svg
              className="w-4 h-4 text-white"
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
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 mb-1">
              Important Notice
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Delivery charges vary based on location and parcel weight.
              Standard rates apply. Actual delivery time may vary depending on
              your exact location and order processing time.
            </p>
          </div>
        </div>
      </div>

      {/* Additional Features */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-100 to-teal-100 flex items-center justify-center mb-3">
            <svg
              className="w-5 h-5 text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <p className="text-xs font-bold text-gray-900 mb-1">
            Secure Packaging
          </p>
          <p className="text-xs text-gray-500">Protected delivery</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-3">
            <svg
              className="w-5 h-5 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-xs font-bold text-gray-900 mb-1">Order Tracking</p>
          <p className="text-xs text-gray-500">Real-time updates</p>
        </div>
      </div>
    </div>
  );
}
