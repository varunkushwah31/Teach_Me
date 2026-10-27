/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-mono font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-indigo-500/30 bg-indigo-950/70 text-indigo-300",
        secondary:
          "border-[#282c40] bg-[#141622] text-zinc-300",
        destructive:
          "border-rose-500/30 bg-rose-950/60 text-rose-300",
        outline: "text-zinc-400 border-[#1c1f2e]",
        lime: "border-emerald-500/30 bg-emerald-950/60 text-emerald-300",
        violet: "border-indigo-500/40 bg-indigo-900/40 text-indigo-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: Readonly<BadgeProps>) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
