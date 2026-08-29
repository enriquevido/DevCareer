export type RoutePlaceholderProps = {
  sequence: string;
  eyebrow: string;
  title: string;
  description: string;
  path: string;
};

export function RoutePlaceholder({
  sequence,
  eyebrow,
  title,
  description,
  path,
}: RoutePlaceholderProps) {
  const titleId = `route-title-${sequence.replaceAll(".", "-")}`;

  return (
    <section
      aria-labelledby={titleId}
      className={[
        "grid",
        "min-h-112",
        "grid-cols-1",
        "items-start",
        "gap-12",
        "animate-reveal-content",
        "motion-reduce:animate-none",
        "lg:grid-cols-[minmax(0,42rem)_minmax(12rem,1fr)]",
        "lg:gap-[clamp(3rem,8vw,9rem)]",
      ].join(" ")}
    >
      <div className="max-w-176 pt-4">
        <p
          className={[
            "mb-5.5",
            "font-mono",
            "text-[0.66rem]",
            "font-semibold",
            "tracking-[0.13em]",
            "text-signal-dark",
            "uppercase",
          ].join(" ")}
        >
          {eyebrow}
        </p>

        <h1
          className={[
            "max-w-[13ch]",
            "font-display",
            "text-[clamp(2.5rem,13vw,3.6rem)]",
            "leading-[0.94]",
            "font-medium",
            "tracking-[-0.04em]",
            "text-balance",
            "text-ink",
            "sm:text-[clamp(2.8rem,8vw,4.4rem)]",
            "lg:text-[clamp(2.8rem,5vw,4.8rem)]",
          ].join(" ")}
          id={titleId}
        >
          {title}
        </h1>

        <p
          className={[
            "mt-8",
            "max-w-152",
            "text-base",
            "leading-7",
            "text-pretty",
            "text-ink-soft",
            "lg:text-lg",
            "lg:leading-8",
          ].join(" ")}
        >
          {description}
        </p>
      </div>

      <aside
        aria-label="Información de la ruta"
        className={[
          "grid",
          "max-w-md",
          "grid-cols-[auto_minmax(0,1fr)]",
          "gap-4",
          "border-y",
          "border-line",
          "py-4",
          "lg:max-w-none",
          "lg:border-t-line-strong",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className="font-display text-4xl leading-none text-signal"
        >
          {sequence}
        </span>

        <div className="min-w-0">
          <span
            className={[
              "mb-2",
              "block",
              "font-mono",
              "text-[0.58rem]",
              "tracking-widest",
              "text-ink-soft",
              "uppercase",
            ].join(" ")}
          >
            Ruta preparada
          </span>

          <code className="block overflow-wrap-anywhere font-mono text-xs text-ink">
            {path}
          </code>
        </div>
      </aside>
    </section>
  );
}
