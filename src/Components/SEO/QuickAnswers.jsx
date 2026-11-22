import { SITE_URL, serializeJsonLd } from "@/lib/seo/jsonLd";

/**
 * "Quick answers" block: question-style <h3> headings, each followed by a
 * direct one-paragraph answer (answer-first), optional outbound source
 * citations and an attributed quote — plus matching FAQPage JSON-LD built
 * from the exact same text, so the schema never says anything the page
 * doesn't show.
 *
 * Answers must be generated from real page data — never invented.
 *
 * @param title    section <h2>
 * @param items    [{ q: string, a: string }]
 * @param sources  [{ label: string, url: string }] outbound citations
 * @param quote    { text, author, context } — a real, attributable quote
 * @param path     page path, for the schema @id
 */
export default function QuickAnswers({ title, items = [], sources = [], quote, path, collapseSources = false }) {
  const qa = items.filter((i) => i?.q && i?.a);
  if (!qa.length) return null;

  const pageUrl = `${SITE_URL}${path || ""}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#quick-answers`,
    url: pageUrl,
    name: title,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntity: qa.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };

  return (
    <section aria-labelledby="quick-answers-title" className="my-6 lg:my-10 rounded-2xl lg:rounded-[32px] bg-[#F3F2F7] p-5 md:p-8 lg:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />

      <h2 id="quick-answers-title" className="text-lg md:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">
        {title}
      </h2>

      <dl className="grid gap-4 md:grid-cols-2 md:gap-6">
        {qa.map((i) => (
          <div key={i.q} className="rounded-xl lg:rounded-2xl bg-white p-4 lg:p-5">
            <dt>
              <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1.5">{i.q}</h3>
            </dt>
            <dd className="text-xs md:text-sm text-gray-700 leading-relaxed">{i.a}</dd>
          </div>
        ))}
      </dl>

      {collapseSources ? (
        // Collapsed by default: a one-line "Sources" toggle. The quote and
        // citations stay in the page and open on click (like an FAQ answer).
        (quote?.text || sources.length > 0) && (
          <details className="mt-4 lg:mt-6 group/src">
            <summary className="cursor-pointer list-none text-xs md:text-sm text-gray-500 hover:text-gray-700 select-none">
              Sources <span className="inline-block transition-transform group-open/src:rotate-90">›</span>
            </summary>
            <div className="mt-2 space-y-1 text-xs md:text-sm text-gray-600">
              {quote?.text && quote?.author && (
                <p>
                  <q className="italic">{quote.text}</q> — <cite className="not-italic font-semibold text-gray-800">{quote.author}</cite>
                  {quote.context ? `, ${quote.context}` : ""}
                </p>
              )}
              {sources.length > 0 && (
                <p>
                  {sources.map((s, idx) => (
                    <span key={s.url}>
                      {idx > 0 && " · "}
                      <a href={s.url} target="_blank" rel="noopener" className="text-primary font-medium hover:underline">
                        {s.label}
                      </a>
                    </span>
                  ))}
                </p>
              )}
            </div>
          </details>
        )
      ) : (
        <>
      {quote?.text && quote?.author && (
        <figure className="mt-5 lg:mt-7 rounded-xl lg:rounded-2xl bg-white p-4 lg:p-5 border-l-4 border-secondary">
          <blockquote className="text-sm md:text-base text-gray-800 italic leading-relaxed">
            <p>&ldquo;{quote.text}&rdquo;</p>
          </blockquote>
          <figcaption className="mt-2 text-xs md:text-sm text-gray-600">
            — <cite className="not-italic font-semibold text-gray-800">{quote.author}</cite>
            {quote.context ? `, ${quote.context}` : ""}
          </figcaption>
        </figure>
      )}

      {sources.length > 0 && (
        <p className="mt-4 lg:mt-6 text-xs md:text-sm text-gray-600">
          Sources:{" "}
          {sources.map((s, idx) => (
            <span key={s.url}>
              {idx > 0 && " · "}
              <a href={s.url} target="_blank" rel="noopener" className="text-primary font-medium hover:underline">
                {s.label}
              </a>
            </span>
          ))}
        </p>
      )}
        </>
      )}
    </section>
  );
}
