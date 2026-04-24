"use client"

import type { CSSProperties } from "react"
import { useFormStatus } from "react-dom"

type FormSubmitButtonProps = {
  idleLabel: string
  pendingLabel?: string
  className?: string
  style?: CSSProperties
  disabled?: boolean
}

export default function FormSubmitButton({
  idleLabel,
  pendingLabel = "Loading...",
  className,
  style,
  disabled,
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      className={className}
      style={{
        ...style,
        opacity: disabled || pending ? 0.7 : style?.opacity,
      }}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  )
}
