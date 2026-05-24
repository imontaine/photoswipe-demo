import { useState, useCallback, useMemo } from 'react'
import { AutoSizeGallery, AutoSizeItem, usePreloadOnHover } from './components/AutoSizeGallery'
import './components/photoswipe-spinner.css'
import 'photoswipe/style.css'
import './index.css'

// ─── Local demo images ──────────────────────────────────────────────
import demoImage1 from './assets/demo_image_1.jpg'
import demoImage2 from './assets/demo_image_2.jpg'
import demoImage3 from './assets/demo_image_3.jpg'
import demoImage4 from './assets/demo_image_4.jpg'
import demoImage5 from './assets/demo_image_5.jpg'
import demoImage6 from './assets/demo_image_6.jpg'
import demoImage7 from './assets/demo_image_7.jpg'

import demoThumb1 from './assets/demo_thumb_1.jpg'
import demoThumb2 from './assets/demo_thumb_2.jpg'
import demoThumb3 from './assets/demo_thumb_3.jpg'
import demoThumb4 from './assets/demo_thumb_4.jpg'
import demoThumb5 from './assets/demo_thumb_5.jpg'
import demoThumb6 from './assets/demo_thumb_6.jpg'
import demoThumb7 from './assets/demo_thumb_7.jpg'

const images = [
  { full: demoImage1, thumb: demoThumb1, alt: 'Portrait photo 1' },
  { full: demoImage2, thumb: demoThumb2, alt: 'Portrait photo 2' },
  { full: demoImage3, thumb: demoThumb3, alt: 'Landscape photo 3' },
  { full: demoImage4, thumb: demoThumb4, alt: 'Landscape photo 4' },
  { full: demoImage5, thumb: demoThumb5, alt: 'Landscape photo 5' },
  { full: demoImage6, thumb: demoThumb6, alt: 'Landscape photo 6' },
  { full: demoImage7, thumb: demoThumb7, alt: 'Portrait photo 7' },
]

// ─── Click/tap action options ───────────────────────────────────────
const clickActionOptions = ['zoom', 'zoom-or-close', 'close', 'toggle-controls', 'next', 'false'] as const
const showHideAnimOptions = ['zoom', 'fade', 'none'] as const
const zoomLevelOptions = ['fit', 'fill', '1', '2', '3'] as const

// ─── Default options state ──────────────────────────────────────────
interface PswpOptions {
  bgOpacity: number
  spacing: number
  allowPanToNext: boolean
  loop: boolean
  wheelToZoom: boolean
  pinchToClose: boolean
  closeOnVerticalDrag: boolean
  paddingTop: number
  paddingBottom: number
  paddingLeft: number
  paddingRight: number
  hideAnimationDuration: number
  showAnimationDuration: number
  zoomAnimationDuration: number
  easing: string
  escKey: boolean
  arrowKeys: boolean
  trapFocus: boolean
  returnFocus: boolean
  clickToCloseNonZoomable: boolean
  imageClickAction: string
  bgClickAction: string
  tapAction: string
  doubleTapAction: string
  preloaderDelay: number
  preloadBefore: number
  preloadAfter: number
  showHideAnimationType: string
  counter: boolean
  arrowPrev: boolean
  arrowNext: boolean
  zoom: boolean
  close: boolean
  initialZoomLevel: string
  secondaryZoomLevel: number
  maxZoomLevel: number
  index: number
  mainClass: string
}

const DEFAULTS: PswpOptions = {
  bgOpacity: 0.8,
  spacing: 0.1,
  allowPanToNext: true,
  loop: true,
  wheelToZoom: false,
  pinchToClose: true,
  closeOnVerticalDrag: true,
  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  paddingRight: 0,
  hideAnimationDuration: 333,
  showAnimationDuration: 333,
  zoomAnimationDuration: 333,
  easing: 'cubic-bezier(.4,0,.22,1)',
  escKey: true,
  arrowKeys: true,
  trapFocus: true,
  returnFocus: true,
  clickToCloseNonZoomable: true,
  imageClickAction: 'zoom-or-close',
  bgClickAction: 'close',
  tapAction: 'toggle-controls',
  doubleTapAction: 'zoom',
  preloaderDelay: 2000,
  preloadBefore: 1,
  preloadAfter: 1,
  showHideAnimationType: 'zoom',
  counter: true,
  arrowPrev: true,
  arrowNext: true,
  zoom: true,
  close: true,
  initialZoomLevel: 'fit',
  secondaryZoomLevel: 2.5,
  maxZoomLevel: 4,
  index: 0,
  mainClass: '',
}

function App() {
  const [opts, setOpts] = useState<PswpOptions>({ ...DEFAULTS })
  const [galleryKey, setGalleryKey] = useState(0)
  const preloadOnHover = usePreloadOnHover()

  const set = useCallback(<K extends keyof PswpOptions>(key: K, value: PswpOptions[K]) => {
    setOpts(prev => ({ ...prev, [key]: value }))
    setGalleryKey(k => k + 1)
  }, [])

  const resetAll = useCallback(() => {
    setOpts({ ...DEFAULTS })
    setGalleryKey(k => k + 1)
  }, [])

  // Count how many options differ from defaults
  const changedCount = useMemo(() => {
    let count = 0
    for (const key of Object.keys(DEFAULTS) as (keyof PswpOptions)[]) {
      if (opts[key] !== DEFAULTS[key]) count++
    }
    return count
  }, [opts])

  // Build the photoswipe options object to pass
  const pswpOptions = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const o: Record<string, any> = {
      bgOpacity: opts.bgOpacity,
      spacing: opts.spacing,
      allowPanToNext: opts.allowPanToNext,
      loop: opts.loop,
      wheelToZoom: opts.wheelToZoom || undefined,
      pinchToClose: opts.pinchToClose,
      closeOnVerticalDrag: opts.closeOnVerticalDrag,
      padding: {
        top: opts.paddingTop,
        bottom: opts.paddingBottom,
        left: opts.paddingLeft,
        right: opts.paddingRight,
      },
      hideAnimationDuration: opts.hideAnimationDuration,
      showAnimationDuration: opts.showAnimationDuration,
      zoomAnimationDuration: opts.zoomAnimationDuration,
      easing: opts.easing,
      escKey: opts.escKey,
      arrowKeys: opts.arrowKeys,
      trapFocus: opts.trapFocus,
      returnFocus: opts.returnFocus,
      clickToCloseNonZoomable: opts.clickToCloseNonZoomable,
      imageClickAction: opts.imageClickAction === 'false' ? false : opts.imageClickAction,
      bgClickAction: opts.bgClickAction === 'false' ? false : opts.bgClickAction,
      tapAction: opts.tapAction === 'false' ? false : opts.tapAction,
      doubleTapAction: opts.doubleTapAction === 'false' ? false : opts.doubleTapAction,
      preloaderDelay: opts.preloaderDelay,
      preload: [opts.preloadBefore, opts.preloadAfter],
      showHideAnimationType: opts.showHideAnimationType,
      counter: opts.counter,
      arrowPrev: opts.arrowPrev,
      arrowNext: opts.arrowNext,
      zoom: opts.zoom,
      close: opts.close,
      initialZoomLevel: isNaN(Number(opts.initialZoomLevel))
        ? opts.initialZoomLevel
        : Number(opts.initialZoomLevel),
      secondaryZoomLevel: opts.secondaryZoomLevel,
      maxZoomLevel: opts.maxZoomLevel,
      index: opts.index,
      mainClass: opts.mainClass || undefined,
    }
    return o
  }, [opts])

  // JSON preview with syntax highlighting
  const jsonPreview = useMemo(() => {
    const json = JSON.stringify(pswpOptions, null, 2)
    return json
      .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
      .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
      .replace(/: (\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
      .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
  }, [pswpOptions])

  return (
    <div className="app-layout">
      {/* ─── Options Panel ─── */}
      <aside className="options-panel">
        <div className="panel-header">
          <h1>PhotoSwipe Options</h1>
          <p>Interactive demo — tweak every option and see the result live</p>
          <span className="brand-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            AutoSizeGallery • No Dimensions Needed
          </span>
        </div>

        <div className="options-scroll">
          {/* ── Background & Layout ── */}
          <div className="option-section">
            <div className="option-section-title">Background & Layout</div>

            <SliderRow
              name="bgOpacity"
              desc="Backdrop opacity"
              value={opts.bgOpacity}
              min={0} max={1} step={0.05}
              onChange={v => set('bgOpacity', v)}
            />
            <SliderRow
              name="spacing"
              desc="Between slides (ratio)"
              value={opts.spacing}
              min={0} max={0.5} step={0.05}
              onChange={v => set('spacing', v)}
            />
            <div className="option-row">
              <div className="option-label">
                <span className="name">padding</span>
                <span className="desc">Slide area padding (px)</span>
              </div>
            </div>
            <div className="padding-group">
              {(['Top', 'Bottom', 'Left', 'Right'] as const).map(side => (
                <div className="padding-input-wrapper" key={side}>
                  <label>{side[0]}</label>
                  <input
                    className="option-number"
                    type="number"
                    min={0}
                    max={200}
                    value={opts[`padding${side}` as keyof PswpOptions] as number}
                    onChange={e => set(`padding${side}` as keyof PswpOptions, Number(e.target.value) as never)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Navigation ── */}
          <div className="option-section">
            <div className="option-section-title">Navigation</div>

            <ToggleRow name="allowPanToNext" desc="Swipe to next when zoomed" value={opts.allowPanToNext} onChange={v => set('allowPanToNext', v)} />
            <ToggleRow name="loop" desc="Loop from last to first" value={opts.loop} onChange={v => set('loop', v)} />
            <ToggleRow name="arrowKeys" desc="Arrow key navigation" value={opts.arrowKeys} onChange={v => set('arrowKeys', v)} />
            <ToggleRow name="escKey" desc="Esc to close" value={opts.escKey} onChange={v => set('escKey', v)} />
          </div>

          {/* ── Gestures ── */}
          <div className="option-section">
            <div className="option-section-title">Gestures</div>

            <ToggleRow name="wheelToZoom" desc="Zoom with scroll wheel" value={opts.wheelToZoom} onChange={v => set('wheelToZoom', v)} />
            <ToggleRow name="pinchToClose" desc="Pinch gesture to close" value={opts.pinchToClose} onChange={v => set('pinchToClose', v)} />
            <ToggleRow name="closeOnVerticalDrag" desc="Vertical drag to close" value={opts.closeOnVerticalDrag} onChange={v => set('closeOnVerticalDrag', v)} />
          </div>

          {/* ── Click & Tap Actions ── */}
          <div className="option-section">
            <div className="option-section-title">Click & Tap Actions</div>

            <SelectRow name="imageClickAction" desc="Click on image" value={opts.imageClickAction} options={clickActionOptions} onChange={v => set('imageClickAction', v)} />
            <SelectRow name="bgClickAction" desc="Click on background" value={opts.bgClickAction} options={clickActionOptions} onChange={v => set('bgClickAction', v)} />
            <SelectRow name="tapAction" desc="Single tap" value={opts.tapAction} options={clickActionOptions} onChange={v => set('tapAction', v)} />
            <SelectRow name="doubleTapAction" desc="Double tap" value={opts.doubleTapAction} options={clickActionOptions} onChange={v => set('doubleTapAction', v)} />
            <ToggleRow name="clickToCloseNonZoomable" desc="Click closes non-zoomable" value={opts.clickToCloseNonZoomable} onChange={v => set('clickToCloseNonZoomable', v)} />
          </div>

          {/* ── Animation ── */}
          <div className="option-section">
            <div className="option-section-title">Animation</div>

            <SelectRow name="showHideAnimationType" desc="Open/close animation" value={opts.showHideAnimationType} options={showHideAnimOptions} onChange={v => set('showHideAnimationType', v)} />
            <SliderRow name="showAnimationDuration" desc="Open duration (ms)" value={opts.showAnimationDuration} min={0} max={1000} step={10} onChange={v => set('showAnimationDuration', v)} />
            <SliderRow name="hideAnimationDuration" desc="Close duration (ms)" value={opts.hideAnimationDuration} min={0} max={1000} step={10} onChange={v => set('hideAnimationDuration', v)} />
            <SliderRow name="zoomAnimationDuration" desc="Zoom duration (ms)" value={opts.zoomAnimationDuration} min={0} max={1000} step={10} onChange={v => set('zoomAnimationDuration', v)} />
            <div className="option-row">
              <div className="option-label">
                <span className="name">easing</span>
                <span className="desc">CSS easing function</span>
              </div>
              <input
                className="option-text"
                type="text"
                value={opts.easing}
                onChange={e => set('easing', e.target.value)}
              />
            </div>
          </div>

          {/* ── Zoom ── */}
          <div className="option-section">
            <div className="option-section-title">Zoom Levels</div>

            <SelectRow name="initialZoomLevel" desc="Initial zoom" value={opts.initialZoomLevel} options={zoomLevelOptions} onChange={v => set('initialZoomLevel', v)} />
            <SliderRow name="secondaryZoomLevel" desc="Secondary zoom" value={opts.secondaryZoomLevel} min={1} max={10} step={0.5} onChange={v => set('secondaryZoomLevel', v)} />
            <SliderRow name="maxZoomLevel" desc="Max zoom level" value={opts.maxZoomLevel} min={1} max={10} step={0.5} onChange={v => set('maxZoomLevel', v)} />
          </div>

          {/* ── UI Elements ── */}
          <div className="option-section">
            <div className="option-section-title">UI Elements</div>

            <ToggleRow name="counter" desc="Show slide counter" value={opts.counter} onChange={v => set('counter', v)} />
            <ToggleRow name="arrowPrev" desc="Show prev arrow" value={opts.arrowPrev} onChange={v => set('arrowPrev', v)} />
            <ToggleRow name="arrowNext" desc="Show next arrow" value={opts.arrowNext} onChange={v => set('arrowNext', v)} />
            <ToggleRow name="zoom" desc="Show zoom button" value={opts.zoom} onChange={v => set('zoom', v)} />
            <ToggleRow name="close" desc="Show close button" value={opts.close} onChange={v => set('close', v)} />
          </div>

          {/* ── Accessibility ── */}
          <div className="option-section">
            <div className="option-section-title">Accessibility</div>

            <ToggleRow name="trapFocus" desc="Trap focus in lightbox" value={opts.trapFocus} onChange={v => set('trapFocus', v)} />
            <ToggleRow name="returnFocus" desc="Return focus on close" value={opts.returnFocus} onChange={v => set('returnFocus', v)} />
          </div>

          {/* ── Performance ── */}
          <div className="option-section">
            <div className="option-section-title">Performance</div>

            <SliderRow name="preloaderDelay" desc="Preloader delay (ms)" value={opts.preloaderDelay} min={0} max={5000} step={100} onChange={v => set('preloaderDelay', v)} />
            <div className="option-row">
              <div className="option-label">
                <span className="name">preload</span>
                <span className="desc">Slides to preload [before, after]</span>
              </div>
              <div className="preload-group">
                <label>B:</label>
                <input className="option-number" type="number" min={0} max={5} value={opts.preloadBefore} onChange={e => set('preloadBefore', Number(e.target.value))} />
                <label>A:</label>
                <input className="option-number" type="number" min={0} max={5} value={opts.preloadAfter} onChange={e => set('preloadAfter', Number(e.target.value))} />
              </div>
            </div>
            <div className="option-row">
              <div className="option-label">
                <span className="name">index</span>
                <span className="desc">Starting slide index</span>
              </div>
              <input className="option-number" type="number" min={0} max={images.length - 1} value={opts.index} onChange={e => set('index', Number(e.target.value))} />
            </div>
          </div>

          {/* ── Misc ── */}
          <div className="option-section">
            <div className="option-section-title">Miscellaneous</div>
            <div className="option-row">
              <div className="option-label">
                <span className="name">mainClass</span>
                <span className="desc">Extra CSS class on root</span>
              </div>
              <input
                className="option-text"
                type="text"
                value={opts.mainClass}
                onChange={e => set('mainClass', e.target.value)}
                placeholder="e.g. my-custom-pswp"
              />
            </div>
          </div>

          {/* ── Reset ── */}
          <button className="reset-btn" onClick={resetAll}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            Reset to Defaults
          </button>

          {/* ── JSON Preview ── */}
          <div className="json-preview">
            <pre dangerouslySetInnerHTML={{ __html: jsonPreview }} />
          </div>
        </div>
      </aside>

      {/* ─── Gallery Area ─── */}
      <main className="gallery-area">
        <div className="gallery-header">
          <div>
            <h2>Gallery Preview</h2>
            <span className="subtitle">Click any thumbnail to open the lightbox</span>
          </div>
          {changedCount > 0 && (
            <span className="active-options-badge">
              <strong>{changedCount}</strong> option{changedCount !== 1 && 's'} changed
            </span>
          )}
        </div>

        <div className="gallery-grid-wrapper">
          <AutoSizeGallery key={galleryKey} options={pswpOptions}>
            <div className="gallery-grid">
              {images.map((img, i) => (
                <AutoSizeItem
                  key={i}
                  original={img.full}
                  thumbnail={img.thumb}
                  alt={img.alt}
                >
                  {({ ref, open }) => (
                    <div className="gallery-thumb">
                      <img
                        ref={ref as React.Ref<HTMLImageElement>}
                        onClick={open}
                        onMouseEnter={() => preloadOnHover(img.full)}
                        src={img.thumb}
                        alt={img.alt}
                        loading="lazy"
                      />
                    </div>
                  )}
                </AutoSizeItem>
              ))}
            </div>
          </AutoSizeGallery>
        </div>
      </main>
    </div>
  )
}

// ─── Reusable Control Components ────────────────────────────────────

function ToggleRow({ name, desc, value, onChange }: {
  name: string
  desc: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="option-row">
      <div className="option-label">
        <span className="name">{name}</span>
        <span className="desc">{desc}</span>
      </div>
      <label className="toggle">
        <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} />
        <span className="toggle-track" />
      </label>
    </div>
  )
}

function SliderRow({ name, desc, value, min, max, step, onChange }: {
  name: string
  desc: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <div className="option-row">
      <div className="option-label">
        <span className="name">{name}</span>
        <span className="desc">{desc}</span>
      </div>
      <div className="slider-control">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
        />
        <span className="slider-value">{value}</span>
      </div>
    </div>
  )
}

function SelectRow({ name, desc, value, options, onChange }: {
  name: string
  desc: string
  value: string
  options: readonly string[]
  onChange: (v: string) => void
}) {
  return (
    <div className="option-row">
      <div className="option-label">
        <span className="name">{name}</span>
        <span className="desc">{desc}</span>
      </div>
      <select className="option-select" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}

export default App
