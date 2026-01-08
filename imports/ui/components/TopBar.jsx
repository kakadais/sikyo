import React from "react";
import { ChevronLeftIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function TopBar({
                                 title,
                                 onBack,
                                 right = null,
                                 className = "",
                               }) {
  return (
    <div className={`sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 dark:bg-gray-900/70 dark:border-white/10 ${className}`}>
      <div className="mx-auto max-w-xl lg:max-w-3xl xl:max-w-4xl px-4 lg:px-8">
        <div className="h-14 flex items-center justify-between gap-x-3">
          <div className="flex items-center gap-x-2 min-w-0">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5"
                aria-label="Back"
              >
                <ChevronLeftIcon className="size-6" />
              </button>
            ) : (
              <div className="size-10" />
            )}
            <div className="min-w-0">
              <div className="text-base font-semibold text-gray-900 truncate dark:text-white">
                {title}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-x-2">
            {right}
          </div>
        </div>
      </div>
    </div>
  );
}

export function IconButton({ label, onClick, icon: Icon, variant = "default" }) {
  const base =
    "inline-flex items-center justify-center rounded-full p-2 shadow-xs inset-ring inset-ring-gray-300 bg-white hover:bg-gray-50 " +
    "dark:bg-white/10 dark:inset-ring-white/5 dark:shadow-none dark:hover:bg-white/20";

  const danger =
    "inline-flex items-center justify-center rounded-full p-2 shadow-xs inset-ring inset-ring-red-300 bg-red-50 hover:bg-red-100 " +
    "dark:bg-red-900/30 dark:inset-ring-red-500/20 dark:shadow-none dark:hover:bg-red-900/40";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={variant === "danger" ? danger : base}
    >
      <Icon className="size-5 text-gray-900 dark:text-white" />
    </button>
  );
}

export const Icons = { PlusIcon, XMarkIcon };
