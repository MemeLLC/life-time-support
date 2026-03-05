import { useState, useRef, useEffect } from 'react'
import { slides } from './slides'

const SLIDE_W = 1280
const SLIDE_H = 720

function ExportView({ index }: { index: number }) {
  const SlideComponent = slides[index]
  if (!SlideComponent) return <div>Slide not found</div>
  return <SlideComponent />
}

function PresenterView() {
  const [current, setCurrent] = useState(0)
  const [scale, setScale] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const CurrentSlide = slides[current]

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return
      const padding = 64
      const availableW = window.innerWidth - padding
      const availableH = window.innerHeight - 120 - padding
      const s = Math.min(1, availableW / SLIDE_W, availableH / SLIDE_H)
      setScale(s)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gray-100 flex flex-col items-center justify-center"
    >
      <div
        style={{
          width: SLIDE_W * scale,
          height: SLIDE_H * scale,
        }}
      >
        <div
          style={{
            width: SLIDE_W,
            height: SLIDE_H,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <CurrentSlide />
        </div>
      </div>

      <div className="mt-8 flex items-center gap-6">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="px-6 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-30 cursor-pointer disabled:cursor-default"
        >
          ← 前へ
        </button>
        <span className="text-gray-600 text-lg">
          {current + 1} / {slides.length}
        </span>
        <button
          onClick={() => setCurrent((c) => Math.min(slides.length - 1, c + 1))}
          disabled={current === slides.length - 1}
          className="px-6 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-30 cursor-pointer disabled:cursor-default"
        >
          次へ →
        </button>
      </div>
    </div>
  )
}

function App() {
  const params = new URLSearchParams(window.location.search)
  const exportIndex = params.get('export')

  if (exportIndex !== null) {
    return <ExportView index={Number(exportIndex)} />
  }

  return <PresenterView />
}

export default App
