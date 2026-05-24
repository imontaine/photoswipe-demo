/**
 * AutoSizeGallery — PhotoSwipe without image dimensions
 * ──────────────────────────────────────────────────────
 * Drop-in replacements for <Gallery> and <Item> from react-photoswipe-gallery
 * that automatically detect image dimensions at runtime.
 *
 * HOW IT WORKS:
 * 1. Each <AutoSizeItem> renders with a 1×1 placeholder (sentinel value)
 * 2. An `itemData` filter injects cached dimensions before slides are created
 * 3. For uncached images, `contentLoad` fires a background preload
 * 4. Once resolved, `refreshSlideContent` recreates the slide at full size
 *
 * Requires: photoswipe-spinner.css (or react-photoswipe-autosize/styles.css)
 */

import { useCallback } from 'react'
import { Gallery, Item } from 'react-photoswipe-gallery'
import type { GalleryProps, ItemProps } from 'react-photoswipe-gallery'

// ─── Spinner SVG markup (injected into slide containers) ────────────
const SPINNER_SVG = `<svg class="pswp-spinner" viewBox="0 0 50 50">
  <circle class="pswp-spinner__path" cx="25" cy="25" r="20"
          fill="none" stroke-width="5"></circle>
</svg>`

// ─── Dimension preloader ────────────────────────────────────────────
const dimensionCache = new Map<string, { w: number; h: number }>()

function preloadImage(src: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const cached = dimensionCache.get(src)
    if (cached) {
      resolve(cached)
      return
    }

    const img = new Image()
    img.onload = () => {
      const dims = { w: img.naturalWidth, h: img.naturalHeight }
      dimensionCache.set(src, dims)
      resolve(dims)
    }
    img.onerror = () => {
      const dims = { w: 800, h: 600 }
      resolve(dims)
    }
    img.src = src
  })
}

// ─── Hover pre-cache hook ───────────────────────────────────────────
const inFlightPreloads = new Map<string, Promise<{ w: number; h: number }>>()

function startPreload(src: string): Promise<{ w: number; h: number }> {
  const cached = dimensionCache.get(src)
  if (cached) return Promise.resolve(cached)

  const existing = inFlightPreloads.get(src)
  if (existing) return existing

  const promise = preloadImage(src).then((dims) => {
    inFlightPreloads.delete(src)
    return dims
  })
  inFlightPreloads.set(src, promise)
  return promise
}

export function usePreloadOnHover() {
  return useCallback((src: string) => {
    startPreload(src)
  }, [])
}

// ─── AutoSizeGallery ────────────────────────────────────────────────
export type AutoSizeGalleryProps = Omit<GalleryProps, 'onBeforeOpen'> & {
  onBeforeOpen?: GalleryProps['onBeforeOpen']
}

export function AutoSizeGallery({
  children,
  options,
  onBeforeOpen: userOnBeforeOpen,
  ...rest
}: AutoSizeGalleryProps) {
  const handleBeforeOpen: GalleryProps['onBeforeOpen'] = (pswp) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pswp.addFilter('itemData', (itemData: any) => {
      const src: string | undefined = itemData?.src
      if (!src) return itemData

      const cached = dimensionCache.get(src)
      if (cached) {
        itemData.width = cached.w
        itemData.height = cached.h
        itemData.w = cached.w
        itemData.h = cached.h
      }
      return itemData
    })

    pswp.addFilter('useContentPlaceholder', () => false)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pswp.on('contentLoad', (e: any) => {
      const { content } = e
      const src: string | undefined = content?.data?.src
      if (!src) return

      if (dimensionCache.has(src)) return

      startPreload(src).then(() => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const idx = (pswp as any).getNumItems?.()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? Array.from({ length: (pswp as any).getNumItems() }, (_, i) => i)
                .find((i: number) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const data = (pswp as any).getItemData?.(i)
                  return data?.src === src
                })
            : content.slide?.index

          if (idx !== undefined && idx !== -1 && pswp.currSlide) {
            pswp.refreshSlideContent(idx)
          }
        } catch {
          // PhotoSwipe may have closed before preload finished
        }
      })
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pswp.on('contentRemove', (e: any) => {
      const holder = e.content?.slide?.holderElement
      const spinner = holder?.querySelector('.pswp-spinner')
      if (spinner) spinner.remove()
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pswp.on('contentAppend', (e: any) => {
      const { content } = e
      const src: string | undefined = content?.data?.src
      if (!src) return

      const imgEl: HTMLImageElement | undefined = content.element

      if (imgEl?.complete && imgEl.naturalWidth > 1) return

      const holder: HTMLElement | undefined = content.slide?.holderElement
      if (!holder) return

      const stale = holder.querySelector('.pswp-spinner')
      if (stale) stale.remove()

      if (imgEl) {
        imgEl.style.visibility = 'hidden'

        const reveal = () => {
          imgEl.style.visibility = ''
          const spinner = holder.querySelector('.pswp-spinner')
          if (spinner) spinner.remove()
        }
        imgEl.addEventListener('load', reveal, { once: true })
        imgEl.addEventListener('error', reveal, { once: true })
      }

      holder.insertAdjacentHTML('beforeend', SPINNER_SVG)
    })

    userOnBeforeOpen?.(pswp)
  }

  return (
    <Gallery
      {...rest}
      options={{
        showHideAnimationType: 'none',
        showAnimationDuration: 0,
        hideAnimationDuration: 0,
        bgOpacity: 1,
        ...options,
      }}
      onBeforeOpen={handleBeforeOpen}
    >
      {children}
    </Gallery>
  )
}

// ─── AutoSizeItem ───────────────────────────────────────────────────
export type AutoSizeItemProps = Omit<ItemProps<HTMLElement>, 'width' | 'height'> & {
  width?: number | string
  height?: number | string
}

export function AutoSizeItem({
  width,
  height,
  children,
  ...rest
}: AutoSizeItemProps) {
  const w = width ?? '1'
  const h = height ?? '1'

  return (
    <Item {...rest} width={w} height={h}>
      {children}
    </Item>
  )
}
