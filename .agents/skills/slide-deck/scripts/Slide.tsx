import type { ReactNode } from 'react'

type SlideProps = {
  children: ReactNode
  className?: string
  bg?: string
}

export function Slide({ children, className = '', bg = 'bg-white' }: SlideProps) {
  const isExport = new URLSearchParams(window.location.search).has('export')
  return (
    <div
      className={`w-[1280px] h-[720px] ${bg} overflow-hidden relative ${isExport ? '' : 'rounded-2xl shadow-2xl'} ${className}`}
    >
      {children}
    </div>
  )
}
