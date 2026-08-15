import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-[4px] border border-[#272a2e] bg-[#1c1e21] px-3 py-1 text-[13.5px] text-[#e5e7eb] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#878c99] focus-visible:outline-none focus-visible:border-[#a8ff53] focus-visible:ring-1 focus-visible:ring-[#a8ff53]/30 disabled:cursor-not-allowed disabled:opacity-50 font-['Geist']",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
