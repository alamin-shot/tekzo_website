// Loads Next.js's ambient types (CSS/image module declarations, `server-only`,
// `client-only`) for standalone `tsc --noEmit`. `next-env.d.ts` does the same
// but is git-ignored and only exists after `next dev`/`next build`.
/// <reference types="next" />
/// <reference types="next/image-types/global" />
