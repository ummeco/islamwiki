/**
 * FILE: lib/compat/next-shims.tsx
 * PURPOSE: Framework-agnostic drop-in replacements for the handful of `next/*`
 *   browser primitives the React islands still used (next/link, next/image,
 *   next/navigation hooks, next/dynamic). Lets the islands run inside Astro with
 *   zero JSX changes — only the import source changes — while removing the hard
 *   `next` dependency (which was pulling 166MB into the Vercel function).
 *
 * WHY a shim rather than rewriting every call site:
 *   - next's <Link>/<Image> forward to plain <a>/<img>; the prop surface used here
 *     (href, src, alt, width, height, className, sizes, priority) maps 1:1.
 *   - The navigation hooks here are read from `window.location` — these run only in
 *     client islands (`client:*`), never during Astro SSR, so window is defined.
 *   - `dynamic(..., { ssr:false })` islands are mounted via `client:only` in Astro,
 *     so React.lazy + Suspense reproduces the lazy-load + loading-fallback behavior.
 *
 * CONSTRAINTS: client-only. Do NOT import in `.astro` frontmatter or server code.
 */
'use client'

import * as React from 'react'

// ── next/link → <a> ─────────────────────────────────────────────────────────

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  // next-only props that are no-ops on a plain anchor — accepted and dropped.
  prefetch?: boolean
  replace?: boolean
  scroll?: boolean
  shallow?: boolean
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, prefetch: _p, replace: _r, scroll: _s, shallow: _sh, children, ...rest },
  ref,
) {
  return (
    <a ref={ref} href={href} {...rest}>
      {children}
    </a>
  )
})

export default Link

// ── next/image → <img> ──────────────────────────────────────────────────────

export type ImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'width' | 'height'> & {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  // next-only props — accepted then dropped so JSX stays unchanged.
  priority?: boolean
  fill?: boolean
  quality?: number
  placeholder?: string
  unoptimized?: boolean
}

export function Image({
  src,
  alt,
  width,
  height,
  priority: _priority,
  fill,
  quality: _q,
  placeholder: _ph,
  unoptimized: _u,
  style,
  ...rest
}: ImageProps) {
  // `fill` in next stretches to the positioned parent — emulate with absolute fill.
  const fillStyle: React.CSSProperties | undefined = fill
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }
    : style
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  return (
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={_priority ? 'eager' : 'lazy'}
      decoding="async"
      style={fillStyle}
      {...rest}
    />
  )
}

// ── next/navigation hooks → window.location ──────────────────────────────────

/** Current path. Client-only; islands never render during SSR. */
export function usePathname(): string {
  return typeof window !== 'undefined' ? window.location.pathname : '/'
}

/** Current query params as a URLSearchParams. Client-only. */
export function useSearchParams(): URLSearchParams {
  return new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
}

/** Minimal router matching the next/navigation surface the islands use. */
export function useRouter(): {
  push: (url: string) => void
  replace: (url: string) => void
  back: () => void
  forward: () => void
  refresh: () => void
} {
  return {
    push: (url: string) => {
      if (typeof window !== 'undefined') window.location.assign(url)
    },
    replace: (url: string) => {
      if (typeof window !== 'undefined') window.location.replace(url)
    },
    back: () => {
      if (typeof window !== 'undefined') window.history.back()
    },
    forward: () => {
      if (typeof window !== 'undefined') window.history.forward()
    },
    refresh: () => {
      if (typeof window !== 'undefined') window.location.reload()
    },
  }
}

// ── next/dynamic → React.lazy + Suspense ─────────────────────────────────────

type Importer<P> = () => Promise<{ default: React.ComponentType<P> } | React.ComponentType<P>>

interface DynamicOptions {
  /** next had `ssr:false`; Astro islands use `client:only`, so this is informational. */
  ssr?: boolean
  loading?: () => React.ReactNode
}

/**
 * Drop-in for `next/dynamic`. Accepts the same `(importer, { ssr, loading })`
 * call shape. The importer may resolve to a module-default OR a bare component
 * (next supports both via `.then(mod => mod.X)`); we normalize to `{ default }`.
 */
export function dynamic<P extends object>(
  importer: Importer<P>,
  options: DynamicOptions = {},
): React.ComponentType<P> {
  const Lazy = React.lazy(async () => {
    const mod = await importer()
    const comp = (mod as { default?: React.ComponentType<P> }).default ?? (mod as React.ComponentType<P>)
    return { default: comp }
  })
  const Loading = options.loading

  return function DynamicComponent(props: P) {
    return (
      <React.Suspense fallback={Loading ? <>{Loading()}</> : null}>
        <Lazy {...(props as React.JSX.IntrinsicAttributes & P)} />
      </React.Suspense>
    )
  }
}
