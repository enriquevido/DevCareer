import { NavLink, Outlet } from "react-router-dom";

type NavigationItem = {
  index: string;
  label: string;
  to: string;
};

const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  {
    index: "01",
    label: "Postulaciones",
    to: "/applications",
  },
  {
    index: "02",
    label: "CV maestro",
    to: "/resume",
  },
];

function getNavigationLinkClassName(isActive: boolean): string {
  const stateClasses = isActive
    ? "border-signal text-paper md:border-rail-line"
    : "border-transparent text-rail-text md:border-rail-line";

  return [
    "group",
    "mr-6",
    "grid",
    "min-w-max",
    "grid-cols-[auto_auto]",
    "items-center",
    "gap-2",
    "border-b-2",
    "py-3.5",
    "text-sm",
    "no-underline",
    "transition-[color,transform]",
    "duration-150",
    "hover:text-paper",
    "focus-visible:outline-signal-light",
    "motion-reduce:transition-none",
    "md:mr-0",
    "md:grid-cols-[2.25rem_minmax(0,1fr)_auto]",
    "md:border-b",
    "md:pr-6",
    "md:hover:translate-x-1",
    stateClasses,
  ].join(" ");
}

export function AppShell() {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[17rem_minmax(0,1fr)]">
      <a
        className={[
          "fixed",
          "top-3",
          "left-3",
          "z-50",
          "-translate-y-[160%]",
          "bg-ink",
          "px-3.5",
          "py-2.5",
          "font-mono",
          "text-xs",
          "tracking-wide",
          "text-paper",
          "no-underline",
          "transition-transform",
          "focus:translate-y-0",
          "motion-reduce:transition-none",
        ].join(" ")}
        href="#main-content"
      >
        Saltar al contenido
      </a>

      <aside
        className={[
          "relative",
          "flex",
          "min-h-0",
          "flex-col",
          "overflow-hidden",
          "bg-ink",
          "px-5",
          "pt-5",
          "text-paper",
          "after:absolute",
          "after:bottom-0",
          "after:left-0",
          "after:h-0.5",
          "after:w-full",
          "after:bg-signal",
          "after:content-['']",
          "md:sticky",
          "md:top-0",
          "md:h-svh",
          "md:min-h-152",
          "md:px-6",
          "md:py-8",
          "md:after:top-0",
          "md:after:right-4",
          "md:after:bottom-auto",
          "md:after:left-auto",
          "md:after:h-full",
          "md:after:w-0.5",
        ].join(" ")}
      >
        <NavLink
          aria-label="Job Search Tracker — Postulaciones"
          className={[
            "flex",
            "w-fit",
            "items-center",
            "gap-3",
            "text-paper",
            "no-underline",
            "focus-visible:outline-signal-light",
          ].join(" ")}
          to="/applications"
        >
          <span
            aria-hidden="true"
            className={[
              "grid",
              "size-10",
              "shrink-0",
              "place-items-center",
              "border",
              "border-rail-index",
              "font-mono",
              "text-xs",
              "tracking-widest",
              "text-signal-light",
            ].join(" ")}
          >
            JT
          </span>

          <span className="min-w-0">
            <strong className="block font-display text-lg font-semibold tracking-tight">
              Job Search
            </strong>

            <small className="mt-0.5 block font-mono text-[0.6rem] tracking-[0.08em] text-rail-muted uppercase">
              Archivo de carrera
            </small>
          </span>
        </NavLink>

        <nav
          aria-label="Navegación principal"
          className={[
            "mt-5",
            "flex",
            "overflow-x-auto",
            "border-t",
            "border-rail-line",
            "scrollbar-thin",
            "md:mt-16",
            "md:grid",
            "md:overflow-visible",
          ].join(" ")}
        >
          {NAVIGATION_ITEMS.map((item) => (
            <NavLink
              className={({ isActive }) => getNavigationLinkClassName(isActive)}
              key={item.to}
              to={item.to}
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={[
                      "font-mono",
                      "text-[0.62rem]",
                      isActive ? "text-signal-light" : "text-rail-index",
                    ].join(" ")}
                  >
                    {item.index}
                  </span>

                  <span>{item.label}</span>

                  <span
                    aria-hidden="true"
                    className={[
                      "hidden",
                      "size-1.5",
                      "bg-signal",
                      "md:block",
                      isActive ? "opacity-100" : "opacity-0",
                    ].join(" ")}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto hidden max-w-48 border-t border-rail-line pt-5 md:block">
          <span className="font-mono text-[0.58rem] tracking-widest text-rail-index uppercase">
            Espacio de trabajo
          </span>

          <p className="mt-2.5 font-display text-sm leading-6 text-rail-muted">
            Vacantes, versiones y decisiones conservadas en un solo expediente.
          </p>
        </div>
      </aside>

      <div
        className={[
          "relative",
          "min-w-0",
          "bg-paper",
          "before:pointer-events-none",
          "before:absolute",
          "before:inset-y-0",
          "before:left-6",
          "before:w-px",
          "before:bg-signal/15",
          "before:content-['']",
          "md:before:left-15",
        ].join(" ")}
      >
        <header
          className={[
            "relative",
            "flex",
            "min-h-15",
            "items-center",
            "justify-between",
            "gap-8",
            "border-b",
            "border-line",
            "pr-5",
            "pl-10",
            "md:min-h-18",
            "md:pr-12",
            "md:pl-21",
          ].join(" ")}
        >
          <p className="hidden font-mono text-[0.64rem] tracking-widest text-ink-soft uppercase md:block">
            Archivo local de postulaciones
          </p>

          <span className="ml-auto font-mono text-[0.62rem] tracking-[0.08em] text-ink-soft uppercase">
            Entorno local
          </span>
        </header>

        <main
          className={[
            "relative",
            "min-h-[calc(100vh-3.75rem)]",
            "w-full",
            "max-w-368",
            "pt-14",
            "pr-4",
            "pb-12",
            "pl-10",
            "md:min-h-[calc(100vh-4.5rem)]",
            "md:pt-[clamp(3rem,7vw,7rem)]",
            "md:pr-[clamp(2rem,6vw,7rem)]",
            "md:pb-16",
            "md:pl-21",
          ].join(" ")}
          id="main-content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
