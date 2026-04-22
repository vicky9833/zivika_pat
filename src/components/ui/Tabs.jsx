"use client";

export default function Tabs({ tabs = [], activeTab, onChange }) {
  return (
    <div
      className="flex gap-2 overflow-x-auto scrollbar-hide px-1 py-1"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            onClick={() => onChange?.(tab.value)}
            className={[
              "flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200",
              isActive
                ? "bg-accent-gradient text-white shadow-zivika"
                : "bg-white border border-surface-border text-zivika-400 hover:border-zivika-300 hover:text-zivika-600",
            ].join(" ")}
            style={{ fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
