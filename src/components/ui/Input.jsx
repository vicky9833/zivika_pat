"use client";

import { forwardRef } from "react";

const Input = forwardRef(function Input(
  { label, icon: Icon, className = "", id, ...props },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "#0B1F18",
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {Icon && (
          <div
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#8EBAA3",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Icon size={16} />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full rounded-[10px] border border-surface-border bg-white",
            "text-sm text-zivika-900 placeholder:text-zivika-300",
            "transition-all duration-150 outline-none",
            "focus:border-zivika-500 focus:ring-2 focus:ring-zivika-500/15",
            Icon ? "pl-10 pr-4 py-3" : "px-4 py-3",
            className,
          ].join(" ")}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
          {...props}
        />
      </div>
    </div>
  );
});

export default Input;
