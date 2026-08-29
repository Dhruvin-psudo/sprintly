import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (type === "email" && e.target.value) {
        const lower = e.target.value.toLowerCase();
        if (e.target.value !== lower) {
          const start = e.target.selectionStart;
          const end = e.target.selectionEnd;
          e.target.value = lower;
          if (start !== null && end !== null) {
            try {
              e.target.setSelectionRange(start, end);
            } catch {
              // Ignore for browsers/input types where selection range is not supported
            }
          }
        }
      }
      onChange?.(e);
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
