"use client"

import { useState } from "react"
import Image, { type ImageProps } from "next/image"

type ProgressiveImageProps = ImageProps

const DEFAULT_BLUR_DATA_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <filter id="b" color-interpolation-filters="sRGB">
      <feGaussianBlur stdDeviation="1.2" />
    </filter>
    <rect width="24" height="24" fill="#efe6d5" />
    <rect width="24" height="24" fill="url(#g)" filter="url(#b)" opacity=".8" />
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f5efe4" />
        <stop offset="50%" stop-color="#d8bf8f" />
        <stop offset="100%" stop-color="#efe6d5" />
      </linearGradient>
    </defs>
  </svg>
`)}`

export default function ProgressiveImage({
  className,
  onLoad,
  priority,
  loading,
  quality,
  placeholder,
  blurDataURL,
  ...props
}: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <Image
      {...props}
      priority={priority}
      quality={quality ?? 72}
      loading={priority ? undefined : loading ?? "lazy"}
      placeholder={placeholder ?? "blur"}
      blurDataURL={blurDataURL ?? DEFAULT_BLUR_DATA_URL}
      decoding="async"
      onLoad={(e) => {
        setLoaded(true)
        onLoad?.(e)
      }}
      className={[
        className ?? "",
        "transition-[filter,opacity,transform] duration-500 ease-out will-change-transform",
        loaded ? "blur-0 opacity-100 scale-100" : "blur-md opacity-70 scale-[1.015]",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  )
}
