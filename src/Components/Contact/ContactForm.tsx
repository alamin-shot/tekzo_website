"use client";

import { useActionState, useState, useEffect } from "react";
import { Send, MessageSquare, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import type { ChangeEvent } from "react";
import { submitContactForm } from "./actions";
import type { ContactFields, ContactFormState } from "@/types/props/content";
import { itemAt, rec } from "@/lib/json";
import { nodeOf } from "@/lib/render";

const initialState: ContactFormState = { success: null, message: "", errors: null };

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitContactForm,
    initialState
  );

  const [fields, setFields] = useState<ContactFields>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Clear fields only on success
  const formKey = state.success ? "reset" : "active";

  useEffect(() => {
    if (state.success) {
      setTimeout(() => {
        setFields({ name: "", email: "", subject: "", message: "" });
      }, 0);
    }
  }, [state.success]);

  return (
    <div className="lg:col-span-2 bg-dark p-6 sm:p-8 lg:p-10 my-rounded border border-gray-100 shadow-sm">
      {/* Badge & Heading */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-secondary text-xs font-bold uppercase tracking-wider mb-2.5 border border-gray-200/70 shadow-2xs">
          <MessageSquare size={13} className="text-secondary" />
          Send a Message
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Leave Us a Message
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
          Have a question or request? Fill out the form below and our team will get back to you promptly.
        </p>
      </div>

      {/* Success / Error Notification */}
      {nodeOf(state.message && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-start gap-3 transition-all ${
            state.success
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {state.success ? (
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
          )}
          <span>{nodeOf(state.message)}</span>
        </div>
      ))}

      <form key={formKey} action={formAction} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Your Name <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={fields.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="bg-white border border-gray-200/90 p-3.5 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
            />
            {nodeOf(rec(state.errors)?.name && (
              <p className="text-xs font-semibold text-red-500 mt-0.5">
                {nodeOf(itemAt(rec(state.errors)?.name, 0))}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Email Address <span className="text-primary">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={fields.email}
              onChange={handleChange}
              placeholder="e.g. john@example.com"
              className="bg-white border border-gray-200/90 p-3.5 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
            />
            {nodeOf(rec(state.errors)?.email && (
              <p className="text-xs font-semibold text-red-500 mt-0.5">
                {nodeOf(itemAt(rec(state.errors)?.email, 0))}
              </p>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Subject <span className="text-primary">*</span>
          </label>
          <input
            type="text"
            name="subject"
            required
            value={fields.subject}
            onChange={handleChange}
            placeholder="How can we help you?"
            className="bg-white border border-gray-200/90 p-3.5 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Your Message <span className="text-primary">*</span>
          </label>
          <textarea
            name="message"
            required
            rows={6}
            value={fields.message}
            onChange={handleChange}
            placeholder="Write your detailed query or message here..."
            className="bg-white border border-gray-200/90 p-3.5 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs resize-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-sm sm:text-base py-3.5 px-8 rounded-xl shadow-md hover:shadow-lg active:scale-98 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sending Message...
              </>
            ) : (
              <>
                <Send size={18} />
                Send Message
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}