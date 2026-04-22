"use client";

const variantStyles = {
  default: "bg-zivika-50 text-zivika-600 border border-zivika-100",
  success:  "bg-green-50 text-success border border-green-200",
  warning:  "bg-yellow-50 text-warning border border-yellow-200",
  danger:   "bg-red-50 text-danger border border-red-200",
  info:     "bg-blue-50 text-info border border-blue-200",
  accent:   "bg-accent/10 text-zivika-600 border border-accent/30",
  outline:  "bg-transparent text-zivika-500 border border-zivika-300",
  coming:
    "bg-gradient-to-r from-zivika-500/8 to-accent/4 text-zivika-500 border border-dashed border-accent/50",
};

export default function Badge({
  variant = "default",
  className = "",
  children,
  ...props
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold",
        variantStyles[variant],
        className,
      ].join(" ")}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      {...props}
    >
      {children}
    </span>
  );
}
