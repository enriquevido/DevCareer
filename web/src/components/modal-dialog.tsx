import { useEffect, useRef } from "react";
import type { MouseEvent, ReactNode } from "react";

type ModalDialogProps = {
  ariaDescribedBy?: string;
  ariaLabelledBy: string;
  children: ReactNode;
  isDismissDisabled?: boolean;
  onClose: () => void;
  panelClassName?: string;
};

export function ModalDialog({
  ariaDescribedBy,
  ariaLabelledBy,
  children,
  isDismissDisabled = false,
  onClose,
  panelClassName = "max-w-lg",
}: ModalDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousBodyOverflow = document.body.style.overflow;

    dialog.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;

      if (dialog.open) {
        dialog.close();
      }

      if (previouslyFocusedElement?.isConnected) {
        previouslyFocusedElement.focus();
      }
    };
  }, []);

  function requestClose(): void {
    if (isDismissDisabled) {
      return;
    }

    onClose();
  }

  function handleDialogClick(event: MouseEvent<HTMLDialogElement>): void {
    if (event.target === event.currentTarget) {
      requestClose();
    }
  }

  return (
    <dialog
      aria-describedby={ariaDescribedBy}
      aria-labelledby={ariaLabelledBy}
      aria-modal="true"
      className={[
        "fixed",
        "inset-0",
        "m-0",
        "h-dvh",
        "max-h-none",
        "w-full",
        "max-w-none",
        "items-center",
        "justify-center",
        "overflow-y-auto",
        "overscroll-contain",
        "bg-transparent",
        "p-4",
        "backdrop:bg-black/70",
        "open:flex",
      ].join(" ")}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={handleDialogClick}
      ref={dialogRef}
    >
      <div
        className={[
          "max-h-[calc(100dvh-2rem)]",
          "w-full",
          "overflow-y-auto",
          "overscroll-contain",
          "border",
          "border-line-strong",
          "bg-surface-raised",
          "shadow-[0_16px_48px_rgba(0,0,0,0.45)]",
          panelClassName,
        ].join(" ")}
      >
        {children}
      </div>
    </dialog>
  );
}
