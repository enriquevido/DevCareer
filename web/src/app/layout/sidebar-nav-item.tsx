import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

type SidebarNavItemProps = {
  icon: LucideIcon;
  isCollapsed: boolean;
  label: string;
  onNavigate?: () => void;
  to: string;
};

function getLinkClassName(isActive: boolean, isCollapsed: boolean): string {
  const alignmentClasses = isCollapsed ? "justify-center px-0" : "gap-3 px-3";

  const stateClasses = isActive
    ? "text-foreground before:bg-accent"
    : [
        "text-foreground-muted",
        "before:bg-transparent",
        "hover:bg-surface-hover",
        "hover:text-foreground",
      ].join(" ");

  return [
    "group/nav",
    "relative",
    "flex",
    "h-10",
    "w-full",
    "items-center",
    "rounded-sm",
    "text-sm",
    "font-medium",
    "no-underline",
    "before:pointer-events-none",
    "before:absolute",
    "before:top-2",
    "before:bottom-2",
    "before:left-0",
    "before:w-px",
    "before:content-['']",
    "transition-colors",
    "duration-150",
    "ease-interface",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-accent",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-sidebar",
    "motion-reduce:transition-none",
    alignmentClasses,
    stateClasses,
  ].join(" ");
}

export function SidebarNavItem({
  icon: Icon,
  isCollapsed,
  label,
  onNavigate,
  to,
}: SidebarNavItemProps) {
  return (
    <NavLink
      aria-label={isCollapsed ? label : undefined}
      className={({ isActive }) => getLinkClassName(isActive, isCollapsed)}
      onClick={onNavigate}
      to={to}
    >
      <Icon
        aria-hidden="true"
        className="size-4.5 shrink-0"
        strokeWidth={1.8}
      />

      <span className={isCollapsed ? "sr-only" : "min-w-0 truncate"}>
        {label}
      </span>

      {isCollapsed ? (
        <span
          aria-hidden="true"
          className={[
            "pointer-events-none",
            "invisible",
            "absolute",
            "top-1/2",
            "left-full",
            "z-50",
            "ml-3",
            "-translate-y-1/2",
            "whitespace-nowrap",
            "rounded-sm",
            "border",
            "border-line",
            "bg-surface-raised",
            "px-2.5",
            "py-1.5",
            "text-xs",
            "font-medium",
            "text-foreground",
            "opacity-0",
            "transition-opacity",
            "duration-150",
            "group-hover/nav:visible",
            "group-hover/nav:opacity-100",
            "group-focus-visible/nav:visible",
            "group-focus-visible/nav:opacity-100",
            "motion-reduce:transition-none",
          ].join(" ")}
        >
          {label}
        </span>
      ) : null}
    </NavLink>
  );
}
