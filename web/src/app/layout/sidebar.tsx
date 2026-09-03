import {
  BriefcaseBusiness,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { SidebarNavItem } from "./sidebar-nav-item";

type NavigationItem = {
  icon: LucideIcon;
  label: string;
  to: string;
};

type SidebarBaseProps = {
  id: string;
  onNavigate?: () => void;
};

type DesktopSidebarProps = SidebarBaseProps & {
  isCollapsed: boolean;
  onClose?: never;
  onToggle: () => void;
  variant: "desktop";
};

type DrawerSidebarProps = SidebarBaseProps & {
  isCollapsed?: never;
  onClose: () => void;
  onToggle?: never;
  variant: "drawer";
};

type SidebarProps = DesktopSidebarProps | DrawerSidebarProps;

const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  {
    icon: BriefcaseBusiness,
    label: "Postulaciones",
    to: "/applications",
  },
  {
    icon: FileText,
    label: "CV maestro",
    to: "/resume",
  },
];

export function Sidebar(props: SidebarProps) {
  const isDesktop = props.variant === "desktop";
  const isCollapsed = isDesktop && props.isCollapsed;

  const controlLabel = isDesktop
    ? isCollapsed
      ? "Expandir navegación"
      : "Replegar navegación"
    : "Cerrar navegación";

  const handleControl = isDesktop ? props.onToggle : props.onClose;

  return (
    <aside
      className={[
        "flex",
        "h-dvh",
        "min-h-0",
        "w-full",
        "flex-col",
        "bg-sidebar",
        "text-foreground",
        isDesktop
          ? "border-r border-line"
          : [
              "max-w-[calc(100vw-2rem)]",
              "border-r",
              "border-line",
              "shadow-[0_12px_32px_rgba(0,0,0,0.28)]",
            ].join(" "),
      ].join(" ")}
      id={props.id}
    >
      <header
        className={[
          "flex",
          "h-14",
          "shrink-0",
          "items-center",
          "border-b",
          "border-line",
          isCollapsed ? "justify-center px-2" : "gap-2 px-3",
        ].join(" ")}
      >
        {isCollapsed ? null : (
          <NavLink
            aria-label="DevCareer — Postulaciones"
            className={[
              "min-w-0",
              "flex-1",
              "truncate",
              "text-sm",
              "font-semibold",
              "tracking-[-0.01em]",
              "text-foreground",
              "no-underline",
              "focus-visible:rounded-sm",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-accent",
              "focus-visible:ring-offset-2",
              "focus-visible:ring-offset-sidebar",
            ].join(" ")}
            onClick={props.onNavigate}
            to="/applications"
          >
            DevCareer
          </NavLink>
        )}

        <button
          aria-controls={props.id}
          aria-expanded={isDesktop ? !isCollapsed : undefined}
          aria-label={controlLabel}
          className={[
            "grid",
            "size-8",
            "shrink-0",
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
          onClick={handleControl}
          type="button"
        >
          {isDesktop ? (
            isCollapsed ? (
              <PanelLeftOpen
                aria-hidden="true"
                className="size-4.5"
                strokeWidth={1.8}
              />
            ) : (
              <PanelLeftClose
                aria-hidden="true"
                className="size-4.5"
                strokeWidth={1.8}
              />
            )
          ) : (
            <X aria-hidden="true" className="size-4.5" strokeWidth={1.8} />
          )}
        </button>
      </header>

      <nav
        aria-label="Navegación principal"
        className={[
          "mt-2",
          "grid",
          "gap-1",
          isCollapsed ? "px-2" : "px-3",
        ].join(" ")}
      >
        {NAVIGATION_ITEMS.map((item) => (
          <SidebarNavItem
            icon={item.icon}
            isCollapsed={isCollapsed}
            key={item.to}
            label={item.label}
            onNavigate={props.onNavigate}
            to={item.to}
          />
        ))}
      </nav>
    </aside>
  );
}
