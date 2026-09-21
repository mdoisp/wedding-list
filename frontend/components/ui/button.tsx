import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
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
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm active:scale-[0.98]";

    const variants = {
      primary:
        "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-rose-200",
      secondary:
        "bg-stone-100 hover:bg-stone-200 text-stone-800 focus:ring-stone-400 shadow-stone-100",
      outline:
        "border border-stone-300 hover:bg-stone-50 text-stone-700 focus:ring-rose-500",
      ghost:
        "text-stone-600 hover:bg-stone-100 hover:text-stone-900 focus:ring-stone-300 shadow-none",
      danger:
        "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-red-200",
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
