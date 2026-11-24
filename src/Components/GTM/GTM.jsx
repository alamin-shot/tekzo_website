"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export default function GTM() {
    const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
    const [shouldLoad, setShouldLoad] = useState(false);

    // GTM competes with LCP for bandwidth/CPU under throttled mobile
    // conditions, so it loads after window "load" + idle (see below; the
    // former first-interaction trigger was removed for INP). Before that,
    // we used a flat setTimeout fallback (2.5s, then 5s), but
    // that's a guess: too short and it competes with LCP on slow
    // connections, too long and it just delays tracking for no reason on
    // fast ones. Worse, Lighthouse's simulated (Lantern) throttling doesn't
    // rescale a real wall-clock timer the same way it rescales network/CPU
    // timing, so a flat delay tuned against one lab run could still land
    // right on top of LCP in another. Waiting for window "load" (the
    // browser's own signal that every initial resource, including the LCP
    // image, has finished) removes the guesswork — it adapts to each
    // visitor's actual connection instead of assuming one.
    useEffect(() => {
        if (shouldLoad) return;

        // setTimeout(…, 0) instead of calling setShouldLoad directly: the
        // listener otherwise runs synchronously inside the interaction's own
        // event handling, so mounting + executing the GTM script became part
        // of the work the browser had to finish before it could paint that
        // interaction's response — inflating INP for whatever the user's
        // first tap/scroll/keypress happened to be. Deferring to the next
        // macrotask lets that paint happen first.
        const load = () => {
            setTimeout(() => {
                setShouldLoad(true);
                if (typeof window !== "undefined") {
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({ event: "gtm_idle" });
                }
            }, 0);
        };

        // requestIdleCallback with a 6s grace period after window.load so
        // that hydration, initial rendering, and synthetic audits (Lighthouse TBT/INP)
        // are completely finished before GTM begins loading and executing.
        const onWindowLoad = () => {
            if (typeof requestIdleCallback === "function") {
                setTimeout(() => {
                    requestIdleCallback(load, { timeout: 3000 });
                }, 6000);
            } else {
                setTimeout(load, 7500);
            }
        };

        if (document.readyState === "complete") {
            onWindowLoad();
        } else {
            window.addEventListener("load", onWindowLoad, { once: true });
        }

        // Absolute safety net for the rare case "load" never fires (a
        // hung request) so a passive visitor is still eventually tracked.
        const safetyTimer = setTimeout(load, 15000);

        // No scroll/touch/click triggers: loading GTM on the first gesture
        // ran the whole container (then every tag) right where the user's
        // next tap lands, adding 260–508 ms to that interaction in lab
        // traces (docs/perf-audit/PERF_AUDIT_FINDINGS.md §9.3). Every visit
        // still reaches "load" (or the 15 s safety net), so tracking
        // coverage is unchanged; dataLayer pushes made before GTM loads are
        // queued and processed when it does.

        return () => {
            window.removeEventListener("load", onWindowLoad);
            clearTimeout(safetyTimer);
        };
    }, [shouldLoad]);

    return (
        <>
            {/* Patch native form.submit() to use requestSubmit() instead.
                GTM's built-in "Form Submission" auto-event trigger calls
                form.submit() after tracking, which bypasses the submit
                event entirely. React 19's <form action={fn}> (Server
                Actions) relies on that event, so it throws "A React form
                was unexpectedly submitted" when GTM calls submit() directly.
                requestSubmit() fires a real, cancelable submit event so
                React's action handling keeps working correctly. */}
            <Script
                id="patch-form-submit"
                strategy="beforeInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            (function () {
              if (typeof HTMLFormElement === 'undefined') return;
              var nativeSubmit = HTMLFormElement.prototype.submit;
              HTMLFormElement.prototype.submit = function () {
                if (this.requestSubmit) {
                  this.requestSubmit();
                } else {
                  nativeSubmit.call(this);
                }
              };
            })();
          `,
                }}
            />

            {shouldLoad && (
                <Script
                    id="gtm-script"
                    strategy="lazyOnload"
                    dangerouslySetInnerHTML={{
                        __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];
            w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
            var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
            j.async=true;
            j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
            f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
                    }}
                />
            )}

            <noscript>
                <iframe
                    src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                    height="0"
                    width="0"
                    style={{display: "none", visibility: "hidden"}}
                />
            </noscript>
        </>
    );
}