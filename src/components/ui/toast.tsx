import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const toastVariants = cva(
  "fixed bottom-4 right-4 z-50 flex w-full max-w-sm items-center space-x-4 rounded-lg border p-4 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "bg-white text-black border-gray-200",
        destructive: "bg-red-500 text-white border-red-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export type ToastProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof toastVariants> & {
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, ...props }, ref) => {
    // don’t pass onOpenChange to div
    const { onOpenChange, ...rest } = props as unknown as ToastProps & {
      onOpenChange?: (open: boolean) => void
    };

    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...rest} // safe props only
      />
    );
  }
);

Toast.displayName = "Toast"

export type ToastActionElement = React.ReactNode
