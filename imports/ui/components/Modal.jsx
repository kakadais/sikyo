import React, { Fragment } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function Modal({ open, onClose, title, children, showClose = true }) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="duration-200 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="duration-150 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[1px]" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="min-h-full flex items-end sm:items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="duration-200 ease-out"
              enterFrom="opacity-0 translate-y-2 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="duration-150 ease-in"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-2 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className="w-full max-w-md rounded-2xl bg-white shadow-xs inset-ring inset-ring-gray-200 dark:bg-gray-900 dark:inset-ring-white/10">
                <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-white/10">
                  <div className="flex items-center justify-between gap-x-3">
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-gray-900 dark:text-white truncate">
                        {title}
                      </div>
                    </div>
                    {showClose ? (
                      <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5"
                        aria-label="Close"
                      >
                        <XMarkIcon className="size-5" />
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="px-4 py-4">{children}</div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
