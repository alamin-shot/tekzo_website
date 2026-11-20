export default function GradeBadge({ category, variant = "default" }) {
  if (!category) return null;

  const isLight = variant === "light";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors ${
        isLight
          ? "bg-white/20 text-white backdrop-blur-md border border-white/30"
          : "bg-secondary/10 text-secondary border border-secondary/20"
      }`}
    >
      <span
        aria-hidden="true"
        className={`w-1.5 h-1.5 rounded-full ${
          isLight ? "bg-white" : "bg-secondary"
        } animate-pulse`}
      />
      <span>{category}</span>
    </span>
  );
}
