import { useRef, useEffect, useState } from 'react'
import { pages } from './pages'

const PAGE_W = 794
const PAGE_H = 1123

function PdfView() {
  return (
    <div>
      {pages.map((PageComponent, i) => (
        <div key={i} style={{ pageBreakAfter: 'always' }}>
          <PageComponent />
        </div>
      ))}
    </div>
  )
}

function PreviewView() {
  const [scale, setScale] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const update = () => {
      const padding = 80
      const availableW = window.innerWidth - padding
      const s = Math.min(1, availableW / PAGE_W)
      setScale(s)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gray-100 py-10 flex flex-col items-center gap-8"
    >
      <div className="text-gray-500 text-sm">
        {pages.length} ページ — A4 ({PAGE_W}x{PAGE_H}px)
      </div>
      {pages.map((PageComponent, i) => (
        <div
          key={i}
          style={{
            width: PAGE_W * scale,
            height: PAGE_H * scale,
          }}
        >
          <div
            style={{
              width: PAGE_W,
              height: PAGE_H,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            <PageComponent />
          </div>
        </div>
      ))}
    </div>
  )
}

function App() {
  const params = new URLSearchParams(window.location.search)
  const isPdf = params.has('pdf')

  if (isPdf) {
    return <PdfView />
  }

  return <PreviewView />
}

export default App
