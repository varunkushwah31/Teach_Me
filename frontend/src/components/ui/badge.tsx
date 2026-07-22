import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-[#3F3F46] bg-[#27272A] text-[#A1A1AA] hover:bg-[#3F3F46]",
        secondary:
          "border-transparent bg-[#27272A] text-white hover:bg-[#3F3F46]",
        destructive:
          "border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444]",
        danger:
          "border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444]",
        outline: "text-white border-[#27272A]",
        success: "border-[#06B6D4]/30 bg-[#06B6D4]/10 text-[#06B6D4]",
        cyan: "border-[#06B6D4]/30 bg-[#06B6D4]/10 text-[#06B6D4]",
        warning: "border-[#F97316]/30 bg-[#F97316]/10 text-[#F97316]",
        orange: "border-[#F97316]/30 bg-[#F97316]/10 text-[#F97316]",
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
