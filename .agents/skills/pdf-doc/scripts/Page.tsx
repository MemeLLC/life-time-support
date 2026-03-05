import type { ReactNode } from 'react'

type PageProps = {
  children: ReactNode
  className?: string
}

export function Page({ children, className = '' }: PageProps) {
  const isPdf = new URLSearchParams(window.location.search).has('pdf')
  return (
    <div
      className={`w-[794px] h-[1123px] bg-white overflow-hidden relative ${isPdf ? '' : 'shadow-2xl'} ${className}`}
    >
      {children}
    </div>
  )
}
