"use client";

import { forwardRef } from "react";

const variantStyles = {
  primary:
    "bg-accent-gradient text-white shadow-zivika hover:opacity-90 active:scale-[0.98]",
  secondary:
    "bg-white border border-zivika-500 text-zivika-500 hover:bg-zivika-50 active:scale-[0.98]",
  ghost:
    "bg-transparent text-zivika-500 hover:bg-zivika-50 active:scale-[0.98]",
  danger:
    "bg-danger text-white hover:opacity-90 active:scale-[0.98]",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm rounded-[8px]",
  md: "px-5 py-2.5 text-sm rounded-[10px]",
  lg: "px-6 py-3.5 text-base rounded-[12px]",
  icon: "p-2.5 rounded-full",
};

const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    className = "",
    children,
    disabled,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-2 font-body font-semibold",
        "transition-all duration-150 cursor-pointer select-none",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(" ")}
      style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
