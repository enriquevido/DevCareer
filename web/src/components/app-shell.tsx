import { Menu } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { Outlet } from "react-router-dom";
import { useSidebarPreference } from "../hooks/use-sidebar-preference";
import { Sidebar } from "./sidebar";

const MOBILE_NAVIGATION_DIALOG_ID = "mobile-navigation-dialog";

const MOBILE_SIDEBAR_ID = "mobile-sidebar";
const DESKTOP_SIDEBAR_ID = "primary-sidebar";

export function AppShell() {
  const { isSidebarCollapsed, toggleSidebar } = useSidebarPreference();

  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);

  const mobileNavigationDialogRef = useRef<HTMLDialogElement>(null);
  const mobileNavigationTriggerRef = useRef<HTMLButtonElement>(null);
  const wasMobileNavigationOpenRef = useRef(false);

  const openMobileNavigation = useCallback(() => {
    setIsMobileNavigationOpen(true);
  }, []);

  const closeMobileNavigation = useCallback(() => {
    setIsMobileNavigationOpen(false);
  }, []);

  useEffect(() => {
    const dialog = mobileNavigationDialogRef.current;

    if (!dialog) {
      return;
    }

    if (isMobileNavigationOpen && !dialog.open) {
      dialog.showModal();
      wasMobileNavigationOpenRef.current = true;
      return;
    }

    if (!isMobileNavigationOpen && dialog.open) {
      dialog.close();
    }

    const shouldRestoreFocus =
      wasMobileNavigationOpenRef.current &&
      window.matchMedia("(max-width: 59.999rem)").matches;

    if (shouldRestoreFocus) {
      mobileNavigationTriggerRef.current?.focus();
    }

    wasMobileNavigationOpenRef.current = false;
  }, [isMobileNavigationOpen]);

  useEffect(() => {
    if (!isMobileNavigationOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isMobileNavigationOpen]);

  useEffect(() => {
    const desktopMediaQuery = window.matchMedia("(min-width: 60rem)");

    function handleBreakpointChange(event: MediaQueryListEvent): void {
      if (event.matches) {
        setIsMobileNavigationOpen(false);
      }
    }

    desktopMediaQuery.addEventListener("change", handleBreakpointChange);

    return () => {
      desktopMediaQuery.removeEventListener("change", handleBreakpointChange);
    };
  }, []);

  const handleDialogClick = useCallback(
    (event: MouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget) {
        closeMobileNavigation();
      }
    },
    [closeMobileNavigation],
  );

  return (
    <div
      className={[
        "min-h-dvh",
        "bg-canvas",
        "text-foreground",
        "desktop:grid",
        "desktop:transition-[grid-template-columns]",
        "desktop:duration-200",
        "desktop:ease-interface",
        "motion-reduce:transition-none",
        isSidebarCollapsed
          ? "desktop:grid-cols-[4rem_minmax(0,1fr)]"
          : "desktop:grid-cols-[14rem_minmax(0,1fr)]",
      ].join(" ")}
    >
      <a
        className={[
          "fixed",
          "top-3",
          "left-3",
          "z-100",
          "-translate-y-[160%]",
          "rounded-sm",
          "bg-accent",
          "px-3",
          "py-2",
          "text-sm",
          "font-medium",
          "text-white",
          "no-underline",
          "transition-transform",
          "duration-150",
          "focus:translate-y-0",
          "motion-reduce:transition-none",
        ].join(" ")}
        href="#main-content"
      >
        Saltar al contenido
      </a>

      <div className="hidden desktop:sticky desktop:top-0 desktop:block desktop:h-dvh">
        <Sidebar
          id={DESKTOP_SIDEBAR_ID}
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
          variant="desktop"
        />
      </div>

      <div className="min-w-0">
        <header
          className={[
            "sticky",
            "top-0",
            "z-30",
            "flex",
            "h-14",
            "items-center",
            "gap-3",
            "border-b",
            "border-line",
            "bg-canvas",
            "px-4",
            "desktop:hidden",
          ].join(" ")}
        >
          <button
            aria-controls={MOBILE_NAVIGATION_DIALOG_ID}
            aria-expanded={isMobileNavigationOpen}
            aria-label="Abrir navegación"
            className={[
              "grid",
              "size-8",
              "place-items-center",
              "rounded-sm",
              "border-0",
              "bg-transparent",
              "p-0",
              "text-foreground-muted",
              "transition-colors",
              "duration-150",
              "hover:bg-surface-hover",
              "hover:text-foreground",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-accent",
              "motion-reduce:transition-none",
            ].join(" ")}
            onClick={openMobileNavigation}
            ref={mobileNavigationTriggerRef}
            type="button"
          >
            <Menu aria-hidden="true" className="size-4.5" strokeWidth={1.8} />
          </button>

          <span
            className="text-sm font-semibold tracking-[-0.01em]"
            translate="no"
          >
            DevCareer
          </span>
        </header>

        <main
          className={[
            "min-h-[calc(100dvh-3.5rem)]",
            "min-w-0",
            "px-4",
            "py-5",
            "sm:px-5",
            "desktop:min-h-dvh",
            "desktop:px-6",
            "desktop:py-6",
            "xl:px-8",
          ].join(" ")}
          id="main-content"
          tabIndex={-1}
        >
          <div className="w-full min-w-0">
            <Outlet />
          </div>
        </main>
      </div>

      <dialog
        aria-label="Navegación principal"
        className={[
          "fixed",
          "inset-0",
          "z-50",
          "m-0",
          "h-dvh",
          "max-h-none",
          "w-full",
          "max-w-none",
          "overflow-hidden",
          "overscroll-contain",
          "bg-transparent",
          "p-0",
          "backdrop:bg-black/70",
          "open:flex",
          "desktop:hidden",
        ].join(" ")}
        id={MOBILE_NAVIGATION_DIALOG_ID}
        onCancel={(event) => {
          event.preventDefault();
          closeMobileNavigation();
        }}
        onClick={handleDialogClick}
        onClose={closeMobileNavigation}
        ref={mobileNavigationDialogRef}
      >
        <div className="h-dvh w-72 max-w-[calc(100vw-2rem)] overscroll-contain">
          <Sidebar
            id={MOBILE_SIDEBAR_ID}
            onClose={closeMobileNavigation}
            onNavigate={closeMobileNavigation}
            variant="drawer"
          />
        </div>
      </dialog>
    </div>
  );
}
