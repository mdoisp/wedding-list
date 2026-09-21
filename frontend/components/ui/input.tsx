import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      rightElement,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[#222B23]"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-xs">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#637362]">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[#1A231B] transition-colors placeholder:text-[#8E9B8D] focus:outline-none focus:ring-2 ${
              icon ? "pl-10" : ""
            } ${rightElement ? "pr-10" : ""} ${
              error
                ? "border-rose-400 focus:border-rose-600 focus:ring-rose-100"
                : "border-[#D8D0C3] focus:border-[#384C37] focus:ring-[#EAF0E9]"
            } ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rose-700 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-[#637362]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
