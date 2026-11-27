"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Download, Eye, Home, ShoppingBag } from "lucide-react";
import PurchaseTracker from "@/Components/Tracker/PurchaseTracker";
import Link from "next/link";
import type { OrderSuccessClientProps } from "@/types/props/checkout";
import { rec } from "@/lib/json";
import { nodeOf } from "@/lib/render";

const OrderSuccessClient = ({ invoiceNumber }: OrderSuccessClientProps) => {
  const [order, setOrder] = useState<unknown>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!invoiceNumber) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `${apiBase}/customer/recent-order?invoice_number=${encodeURIComponent(String(invoiceNumber))}`,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        );
        const result: unknown = await res.json();
        setOrder(rec(result)?.data || null);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrder();
  }, [apiBase, invoiceNumber]);

  const handleInvoiceAction = async (isPreview = true) => {
    try {
      setLoadingPdf(true);
      const url = isPreview
        ? `${apiBase}/customer/invoice-download?invoice_number=${String(invoiceNumber)}&preview=true`
        : `${apiBase}/customer/invoice-download?invoice_number=${String(invoiceNumber)}`;

      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      if (isPreview) {
        window.open(blobUrl, "_blank");
      } else {
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `Invoice-${String(invoiceNumber)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("PDF Handling Error:", error);
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <>
      <PurchaseTracker order={order} />

      <div className="flex flex-col items-center py-10 md:py-16">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-20 flex flex-col items-center text-center">
          <div className="mb-10 relative">
            <div className="bg-green-500 rounded-full p-5 text-white shadow-xl shadow-green-100 relative z-10">
              <CheckCircle className="w-14 h-14" />
            </div>
            <div className="absolute inset-0 animate-ping opacity-10 bg-green-400 rounded-full"></div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Thank You for Your Purchase!
            </h2>

            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
              We appreciate your trust in{" "}
              <span className="font-bold text-primary">TEKZO</span>, one of the
              leading gadget importers in Bangladesh. Your order
              <span className="font-mono font-medium text-gray-800 bg-gray-100 px-2 py-0.5 rounded ml-1">
                #{nodeOf(invoiceNumber || "N/A")}
              </span>{" "}
              has been successfully processed.
            </p>

            {invoiceNumber ? (
              <div className="pt-6 border-t border-gray-50">
                <p className="text-gray-500 mb-6 font-medium">
                  Need a copy of your receipt?
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  {/* Preview Button */}
                  <button
                    onClick={() => handleInvoiceAction(true)}
                    disabled={loadingPdf}
                    className="flex items-center justify-center gap-2 bg-secondary hover:opacity-90 text-white font-semibold py-3.5 px-8 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    <Eye className="w-5 h-5" />
                    {loadingPdf ? "Loading..." : "Preview Invoice"}
                  </button>

                  {/* Download Button */}
                  <button
                    onClick={() => handleInvoiceAction(false)}
                    disabled={loadingPdf}
                    className="flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-white font-semibold py-3.5 px-8 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    <Download className="w-5 h-5" />
                    {loadingPdf ? "Processing..." : "Download PDF"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-amber-600">
                Order details are currently being updated.
              </p>
            )}

            <div className="flex flex-wrap justify-center gap-4 md:gap-8 pt-10 border-t border-gray-50 mt-10">
              <Link
                href="/"
                className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-300"
              >
                <Home className="w-4 h-4 " />
                <span>Back to Home</span>
              </Link>

              <Link
                href="/shop"
                className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-300"
              >
                <ShoppingBag className="w-4 h-4 " />
                <span>Continue Shopping</span>
              </Link>
            </div>

            <p className="text-gray-400 text-sm mt-12 italic border-t pt-8">
              We hope you enjoy your new gadgets! If you have any questions, our
              customer service team is here to help.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSuccessClient;
