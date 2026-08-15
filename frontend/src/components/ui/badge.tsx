import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-['Geist_Mono'] font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#a8ff53] text-[#121317]",
        secondary:
          "border-transparent bg-[#272a2e] text-[#e5e7eb]",
        destructive:
          "border-transparent bg-[#f43f5e]/20 text-[#f43f5e] border-[#f43f5e]/30",
        outline: "text-[#878c99] border-[#272a2e]",
        lime: "border-[#a8ff53]/30 bg-[#a8ff53]/10 text-[#a8ff53]",
        violet: "border-[#9c9af2]/30 bg-[#9c9af2]/10 text-[#9c9af2]",
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

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
