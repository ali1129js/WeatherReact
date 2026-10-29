import type { IconKind } from "../lib/weatherCodes";

interface Props {
  kind: IconKind;
  night?: boolean;
  size?: number;
}

/** Simple line icons drawn in currentColor, so every theme keeps them readable. Decorative: the condition is always also written out. */
export function WeatherIcon({ kind, night = false, size = 48 }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
  };
  const cloud = "M14 36a8 8 0 0 1-.6-16A10 10 0 0 1 33 21a7.500 7.500 0 0 1 1 15z";
  const sun = (
    <>
      <circle cx="24" cy="24" r="7" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line key={a} x1="24" y1="9" x2="24" y2="12.500" transform={`rotate(${a} 24 24)`} />
      ))}
    </>
  );
  const moon = <path d="M31 30A12 12 0 0 1 18 11a12 12 0 1 0 13 19z" />;
  switch (kind) {
    case "clear":
      return <svg {...common}>{night ? moon : sun}</svg>;
    case "partly":
      return (
        <svg {...common}>
          <g transform="translate(-6 -8) scale(.7)">{night ? moon : sun}</g>
          <path d={cloud} transform="translate(2 -1)" />
        </svg>
      );
    case "cloud":
      return (
        <svg {...common}>
          <path d={cloud} />
        </svg>
      );
    case "fog":
      return (
        <svg {...common}>
          <path d="M10 18h28M6 26h36M12 34h24" />
        </svg>
      );
    case "drizzle":
    case "rain":
      return (
        <svg {...common}>
          <path d="M14 28a8 8 0 0 1-.6-16A10 10 0 0 1 33 13a7.500 7.500 0 0 1 1 15z" />
          <path
            d={kind === "rain" ? "M16 34l-3 7M25 34l-3 7M34 34l-3 7" : "M16 36v3M25 36v3M34 36v3"}
          />
        </svg>
      );
    case "snow":
      return (
        <svg {...common}>
          <path d="M14 28a8 8 0 0 1-.6-16A10 10 0 0 1 33 13a7.500 7.500 0 0 1 1 15z" />
          <path d="M16 35v.5M25 38v.5M34 35v.5M20 41v.5M30 41v.5" strokeWidth={4} />
        </svg>
      );
    case "storm":
      return (
        <svg {...common}>
          <path d="M14 28a8 8 0 0 1-.6-16A10 10 0 0 1 33 13a7.500 7.500 0 0 1 1 15z" />
          <path d="M26 28l-6 8h6l-4 8" />
        </svg>
      );
  }
}
