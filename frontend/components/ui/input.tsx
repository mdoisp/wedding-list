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
            className="block text-sm font-medium text-stone-700"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-xs">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-stone-900 transition-colors placeholder:text-stone-400 focus:outline-none focus:ring-2 ${
              icon ? "pl-10" : ""
            } ${rightElement ? "pr-10" : ""} ${
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                : "border-stone-300 focus:border-rose-500 focus:ring-rose-200"
            } ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-stone-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
