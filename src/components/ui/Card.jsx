"use client";

const variantStyles = {
  default:
    "bg-white border border-surface-border shadow-zivika hover:shadow-zivika-md transition-shadow duration-200",
  glass: "glass",
  gradient: "bg-primary-gradient text-white",
  flat: "bg-surface-alt",
};

export default function Card({
  variant = "default",
  className = "",
  onClick,
  children,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={[
        "rounded-[16px] overflow-hidden p-5",
        variantStyles[variant],
        onClick ? "cursor-pointer" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
