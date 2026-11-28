import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CareerCardProps, JobCircularProps } from "@/types/props/content";
import { fieldsOf, lengthStrict, lowerOpt, mapList, mapOpt, rec } from "@/lib/json";
import { idKey, nodeOf, str } from "@/lib/render";


// ─── Career Card ──────────────────────────────────────────────────────────────
const CareerCard = ({ job }: CareerCardProps) => {
  const j = rec(job);
  return (

  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group">
    {/* Image */}
    <div className="aspect-5/3">
      <Image
        src={str(j?.image)?.includes("https://d2c2zgda4zwbg9.cloudfront.net/") ? str(j?.image) ?? "" : "/placeholder.jpg"}
        alt={`${String(j?.heading)} vacancy`}
        width={3000}
        height={2000}
        className="w-full object-cover"
      />
    </div>

    {/* Content */}
    <div className="p-4 lg:p-8 flex flex-col grow">
      <h3 className="text-xl font-extrabold text-gray-700 mb-6 min-h-[3.5rem] leading-snug">
        {nodeOf(j?.heading)}
      </h3>

      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <span className="text-primary font-bold uppercase tracking-widest text-[10px]">
            Job Type
          </span>
          <span className="text-slate-500 font-semibold text-sm">{nodeOf(j?.type)}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-primary font-bold uppercase tracking-widest text-[10px]">
            Vacancy
          </span>
          <span className="text-slate-500 font-semibold text-sm">{nodeOf(j?.vacancies)}</span>
        </div>
      </div>

      <ul className="space-y-4 mb-10 flex-grow">
        {mapOpt(fieldsOf(job).benefits, (benefit, index) => (
          <li
            key={index}
            className="flex items-start gap-3 text-[13px] text-slate-600 leading-relaxed"
          >
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-300 flex-shrink-0" />
            {nodeOf(benefit)}
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
        <div className="flex flex-col">
          <span className="text-primary font-bold uppercase tracking-widest text-[10px]">
            Deadline
          </span>
          <span className="text-slate-400 text-xs font-medium">{nodeOf(j?.deadline)}</span>
        </div>

        <Link
          href={`/careers/apply/${String(lowerOpt(j?.slug)?.replace(/\s+/g, "-"))}`}
          className="bg-secondary text-white px-7 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 active:scale-95"
        >
          Details
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  </div>
  );
};

// ─── Job Circular Grid ────────────────────────────────────────────────────────
export default function JobCircular({ jobs = [] }: JobCircularProps) {
  if (!lengthStrict(jobs)) {
    return (
      <p className="text-center text-slate-400 py-16">
        No job openings available right now.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {mapList(jobs, (job) => (
        <CareerCard key={idKey(job)} job={job} />
      ))}
    </div>
  );
}
