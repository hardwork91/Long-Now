import type { CSSProperties } from "react";

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export function Avatar({
  name,
  accent,
  size = 40,
  portrait,
}: {
  name: string;
  accent: string;
  size?: number;
  portrait?: string;
}) {
  if (portrait) {
    const style: CSSProperties = {
      width: size,
      height: size,
      overflow: "hidden",
      background: shade(accent, -90),
      boxShadow: `0 0 0 2px ${accent}, inset 0 0 6px rgba(0,0,0,0.4)`,
    };
    return (
      <div className="avatar" style={style}>
        <img
          src={portrait}
          alt={name}
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
          }}
        />
      </div>
    );
  }
  const style: CSSProperties = {
    width: size,
    height: size,
    fontSize: size * 0.4,
    background: `radial-gradient(circle at 35% 30%, ${accent}, ${shade(accent, -40)})`,
    boxShadow: `0 0 0 1px #000, inset 0 0 6px rgba(0,0,0,0.4)`,
  };
  return (
    <div className="avatar" style={style}>
      {initials(name).toUpperCase()}
    </div>
  );
}

const STAT_HUE: Record<string, string> = {
  energy: "var(--energy)",
  hunger: "var(--hunger)",
  health: "var(--health)",
  morale: "var(--morale)",
};

/** GDD §9.3: the bar colour itself communicates state. */
function statColor(key: string, value: number): string {
  if (value <= 20) return "var(--crit)";
  if (value <= 40) return "var(--warn)";
  return STAT_HUE[key] ?? "var(--brass)";
}

export function StatBar({
  label,
  value,
  statKey,
  icon,
  unknown,
}: {
  label: string;
  value: number;
  statKey: string;
  icon?: string;
  unknown?: boolean;
}) {
  const color = unknown ? "#6a6051" : statColor(statKey, value);
  const width = unknown ? 100 : value;
  return (
    <div className={`statbar${icon ? " statbar-icon" : ""}`}>
      {icon ? (
        <span className="sb-icon" title={label}>
          {icon}
        </span>
      ) : (
        <span className="label">{label}</span>
      )}
      <div className="track">
        <div
          className="fill"
          style={{
            width: `${width}%`,
            background: color,
            color,
            opacity: unknown ? 0.3 : 1,
            boxShadow: unknown ? "none" : undefined,
          }}
        />
      </div>
    </div>
  );
}

export function shade(hex: string, amt: number): string {
  const m = hex.replace("#", "");
  if (m.length !== 6) return hex;
  const num = parseInt(m, 16);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0xff) + amt;
  let b = (num & 0xff) + amt;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function fmtCountdown(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
