import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "white";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs active:scale-[0.98]";

    const variants = {
      primary:
        "bg-[#384C37] hover:bg-[#2B3B2A] text-white focus:ring-[#384C37] shadow-sm",
      secondary:
        "bg-[#F2ECE3] hover:bg-[#E7DFD2] text-[#222B23] focus:ring-[#D8CEBE]",
      outline:
        "border border-[#D8D0C3] bg-transparent hover:bg-[#F2ECE3]/60 text-[#2D3E2C] focus:ring-[#384C37]",
      ghost:
        "text-[#384C37] hover:bg-[#EAF0E9] hover:text-[#222B23] focus:ring-[#EAF0E9] shadow-none",
      danger:
        "bg-rose-700 hover:bg-rose-800 text-white focus:ring-rose-600 shadow-rose-200",
      white:
        "bg-white hover:bg-[#FAF8F5] text-[#182319] border border-[#E8E2D8] hover:border-[#384C37] shadow-md hover:shadow-lg focus:ring-white",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base font-semibold",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
