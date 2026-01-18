import React from "react";
import { ChevronLeftIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function TopBar({
                                 title,
                                 onBack,
                                 right = null,
                                 className = "",
                               }) {
  return (
    <div className={`mb-6 flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-x-3 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center justify-center -ml-2 rounded-full p-2 text-neutral-950 hover:bg-neutral-100 transition"
            aria-label="Back"
          >
            <ChevronLeftIcon className="size-6" />
          </button>
        )}
        <h2 className="text-2xl font-display font-bold text-neutral-950 truncate tracking-tight">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-x-2">
        {right}
      </div>
    </div>
  );
}

export function IconButton({ label, onClick, icon: Icon, variant = "default" }) {
  const base =
    "inline-flex items-center justify-center rounded-full p-2 bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition";

  const danger =
    "inline-flex items-center justify-center rounded-full p-2 bg-red-50 text-red-600 hover:bg-red-100 transition";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={variant === "danger" ? danger : base}
    >
      <Icon className="size-5" />
    </button>
  );
}

export const Icons = { PlusIcon, XMarkIcon };
