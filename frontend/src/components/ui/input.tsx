import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10.5 w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-2 text-[14px] text-zinc-100 shadow-inner transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 hover:border-zinc-700 focus-visible:outline-none focus-visible:border-lime-400 focus-visible:ring-2 focus-visible:ring-lime-400/20 disabled:cursor-not-allowed disabled:opacity-50 font-sans",
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
