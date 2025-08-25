"use client";
import { Fragment, type ReactNode } from "react";
import clsx from "clsx";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Transition,
} from "@headlessui/react";

export default function SideNav({
  open,
  onClose,
  children,
  className,
}: {
  open: boolean;
  onClose: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Dialog
      as="div"
      className="fixed inset-0 z-50 overflow-hidden"
      open={open}
      onClose={onClose}
    >
      {/* overlay */}
      <Transition as={Fragment} appear show={open}>
        <DialogBackdrop
          className="fixed inset-0 bg-black/30 transition
                     data-closed:opacity-0
                     data-enter:duration-300
                     data-leave:duration-200"
        />
      </Transition>

      {/* right column wrapper */}
      <div className="absolute inset-y-0 right-0 flex max-w-full pointer-events-none">
        {/* sliding panel */}
        <Transition as={Fragment} appear show={open}>
          <DialogPanel
            className={clsx(
              "pointer-events-auto w-screen max-w-xs sm:max-w-sm bg-white shadow-xl flex h-full flex-col rounded-l-2xl rounded-r-none",
              "transform-gpu transition-transform ease-in-out will-change-transform",
              "data-closed:translate-x-full",
              "data-enter:duration-300",
              "data-leave:duration-300 data-leave:data-closed:translate-x-full",
              className
            )}
          >
            {children}
          </DialogPanel>
        </Transition>
      </div>
    </Dialog>
  );
}
