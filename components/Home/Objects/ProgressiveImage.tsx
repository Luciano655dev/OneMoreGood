"use client"

import { useState } from "react"
import Image, { type ImageProps } from "next/image"

type ProgressiveImageProps = ImageProps

export default function ProgressiveImage({
  className,
  onLoad,
  priority,
  loading,
  ...props
}: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <Image
      {...props}
      priority={priority}
      loading={priority ? undefined : loading ?? "lazy"}
      onLoad={(e) => {
        setLoaded(true)
        onLoad?.(e)
      }}
      className={[
        className ?? "",
        "transition-[filter,opacity] duration-500 ease-out",
        loaded ? "blur-0 opacity-100" : "blur-md opacity-70",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  )
}
