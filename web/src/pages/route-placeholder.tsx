import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export type RoutePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  path: string;
};

export function RoutePlaceholder({
  eyebrow,
  title,
  description,
  path,
}: RoutePlaceholderProps) {
  const isNotFound = path === "*";

  const titleId = isNotFound
    ? "not-found-title"
    : `route-title-${path.replaceAll("/", "-")}`;

  return (
    <section aria-labelledby={titleId} className="w-full">
      <header
        className={[
          "flex",
          "flex-col",
          "gap-5",
          "border-b",
          "border-line",
          "pb-5",
          "desktop:flex-row",
          "desktop:items-end",
          "desktop:justify-between",
        ].join(" ")}
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-accent-soft">{eyebrow}</p>

          <h1
            className={[
              "mt-1.5",
              "text-2xl",
              "leading-8",
              "font-semibold",
              "tracking-[-0.02em]",
              "text-foreground",
            ].join(" ")}
            id={titleId}
          >
            {title}
          </h1>

          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-foreground-muted">
            {description}
          </p>
        </div>

        {isNotFound ? null : (
          <code
            className={[
              "max-w-full",
              "shrink-0",
              "self-start",
              "font-mono",
              "text-xs",
              "text-foreground-subtle",
              "wrap-anywhere",
              "desktop:self-auto",
            ].join(" ")}
          >
            {path}
          </code>
        )}
      </header>

      <div className="py-7">
        <p className="text-sm font-medium text-foreground">
          {isNotFound
            ? "Esta dirección no está disponible"
            : "Pendiente de implementación"}
        </p>

        <p className="mt-1.5 max-w-3xl text-sm leading-6 text-foreground-muted">
          {isNotFound
            ? "La ruta solicitada no corresponde con una pantalla disponible en DevCareer."
            : "Esta pantalla se conectará a sus datos y acciones en el commit funcional correspondiente."}
        </p>

        {isNotFound ? (
          <Link
            className={[
              "mt-5",
              "inline-flex",
              "items-center",
              "gap-2",
              "text-sm",
              "font-medium",
              "text-accent-soft",
              "underline-offset-4",
              "hover:underline",
              "focus-visible:rounded-sm",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-accent",
              "motion-reduce:transition-none",
            ].join(" ")}
            to="/applications"
          >
            <ArrowLeft
              aria-hidden="true"
              className="size-4"
              strokeWidth={1.8}
            />
            Volver a Postulaciones
          </Link>
        ) : null}
      </div>
    </section>
  );
}
