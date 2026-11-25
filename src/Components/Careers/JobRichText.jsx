import formatHtml from "@/lib/formatHtml";

// Job fields (description / qualification / benefits) arrive as arrays of
// strings. They may contain rich-text HTML from the admin editor, or — as the
// API currently returns them — plain text with the tags stripped, so that
// "Key Responsibilities:Receive calls.Make calls." collapses into one run.
// HTML is sanitized and rendered as-is; plain text is split back into a
// subheading + bullet points at the glued boundaries.

const Bullet = ({ children, className }) => (
  <li className={`flex gap-2 leading-relaxed ${className}`}>
    <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-secondary flex-shrink-0" />
    <span>{children}</span>
  </li>
);

function parsePlain(text) {
  const blocks = [];
  let current = { heading: null, items: [] };
  // "Label:Next" (no space after colon) marks a subheading boundary;
  // "word.Next" (lowercase/closing char, period, capital, no space) a sentence boundary.
  const parts = text
    .split(/(?<=[a-z0-9)\]]:)(?=[A-Z])|(?<=[a-z0-9)\]]\.)(?=[A-Z\[])/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const part of parts) {
    if (/:$/.test(part)) {
      if (current.heading || current.items.length) blocks.push(current);
      current = { heading: part.slice(0, -1), items: [] };
    } else {
      current.items.push(part);
    }
  }
  if (current.heading || current.items.length) blocks.push(current);
  return blocks;
}

export default function JobRichText({ items, className = "", gap = "space-y-3" }) {
  const list = (Array.isArray(items) ? items : items ? [items] : []).filter(
    (s) => typeof s === "string" && s.trim()
  );
  if (!list.length) return null;

  return (
    <div className="space-y-4">
      {list.map((text, i) =>
        /<[a-z][\s\S]*>/i.test(text) ? (
          <div
            key={i}
            className={`text-slate-600 leading-relaxed space-y-3 [&_h2]:font-bold [&_h3]:font-bold [&_h4]:font-bold [&_h2]:text-slate-700 [&_h3]:text-slate-700 [&_h4]:text-slate-700 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:mb-1.5 [&_li]:marker:text-secondary ${className}`}
            dangerouslySetInnerHTML={{ __html: formatHtml(text) }}
          />
        ) : (
          parsePlain(text).map((block, j) => (
            <div key={`${i}-${j}`}>
              {block.heading && (
                <h4 className="font-semibold text-slate-700 mb-2">{block.heading}</h4>
              )}
              {block.items.length > 0 && (
                <ul className={gap}>
                  {block.items.map((item, k) => (
                    <Bullet key={k} className={`text-slate-600 ${className}`}>
                      {item}
                    </Bullet>
                  ))}
                </ul>
              )}
            </div>
          ))
        )
      )}
    </div>
  );
}
