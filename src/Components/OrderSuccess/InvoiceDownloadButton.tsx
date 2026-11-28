"use client";

import { useState } from "react";
import type { InvoiceButtonsProps } from "@/types/props/checkout";

// Download the PDF invoice for an order (order failed / canceled pages).
// Same request as the success page's "Download PDF".
export default function InvoiceDownloadButton({ invoiceNumber }: InvoiceButtonsProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/invoice-download?invoice_number=${encodeURIComponent(invoiceNumber)}`);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("PDF Handling Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-10 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-md disabled:opacity-60"
    >
      {loading ? "Processing..." : "Download Invoice"}
    </button>
  );
}
