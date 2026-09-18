/**
 * Full-viewport overlay. Always mounts on document.body so parent
 * layout animations cannot pin the dialog off-screen.
 */
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

export default function ModalOverlay({ children }: { children: ReactNode }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-foreground-950/40">
      <div className="flex min-h-full items-center justify-center p-4">
        {children}
      </div>
    </div>,
    document.body,
  );
}
