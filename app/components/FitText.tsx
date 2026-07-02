"use client"

import { useEffect, useRef, useState } from "react"

type Props = {
  text: string
  className?: string
  style?: React.CSSProperties
}

export default function FitText({ text, className = "", style }: Props) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const innerRef = useRef<HTMLSpanElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const container = containerRef.current
    const inner = innerRef.current
    if (!container || !inner) return
    const ratio = container.clientWidth / inner.scrollWidth
    setScale(Math.min(1, ratio))
  }, [text])

  return (
    <span
      ref={containerRef}
      className={`w-full flex items-center justify-center overflow-hidden ${className}`}
      style={style}
    >
      <span
        ref={innerRef}
        style={{
          whiteSpace: "nowrap",
          display: "inline-block",
          transform: `scale(${scale})`,
          transformOrigin: "center",
        }}
      >
        {text}
      </span>
    </span>
  )
}
