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
              <DialogPanel className="w-full max-w-md rounded-[40px] bg-white shadow-xl inset-ring inset-ring-neutral-200">
                <div className="px-6 pt-6 pb-4 border-b border-neutral-100">
                  <div className="flex items-center justify-between gap-x-3">
                    <div className="min-w-0">
                      <div className="text-xl font-display font-bold text-neutral-950 truncate">
                        {title}
                      </div>
                    </div>
                    {showClose ? (
                      <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 transition"
                        aria-label="Close"
                      >
                        <XMarkIcon className="size-6" />
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="px-6 py-6 font-sans text-neutral-900">{children}</div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
