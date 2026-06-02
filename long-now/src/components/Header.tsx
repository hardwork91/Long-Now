import { useGame, useDispatch } from "../store";
import type { Selection } from "../types";

function Gauge({
  label,
  value,
  critical,
}: {
  label: string;
  value: number;
  critical?: boolean;
}) {
  // needle points up at 50%; min/max swing is ±117deg
  const deg = ((value - 50) / 50) * 117;
  return (
    <div className={`gauge${critical ? " crit" : ""}`}>
      <div className="dial">
        <img className="dial-face" src="/Long-Now/assets/ui/Dial.png" alt="" draggable={false} />
        <img
          className="dial-needle"
          src="/Long-Now/assets/ui/Dial-needle.png"
          alt=""
          draggable={false}
          style={{ transform: `rotate(${deg}deg)` }}
        />
        <div className="dial-name">{label}</div>
      </div>
    </div>
  );
}

const RES = [
  { key: "food", label: "Food", go: { kind: "room", id: "food" } },
  { key: "water", label: "Water", go: { kind: "room", id: "water" } },
  { key: "salvage", label: "Salvage", go: { kind: "room", id: "exploration" } },
  { key: "med", label: "Med Supplies", go: { kind: "room", id: "infirmary" } },
] as const satisfies ReadonlyArray<{ key: string; label: string; go: Selection }>;

export default function Header() {
  const { vitals, day, clock, rooms, resources } = useGame();
  const dispatch = useDispatch();
  const reactor = rooms.find((r) => r.id === "reactor" && r.developed);
  const power = reactor
    ? Math.round((reactor.level / (reactor.maxLevel ?? 3)) * 100)
    : vitals.power;
  const oxygen = Math.round(vitals.oxygen);
  // the sonar/radar is wrecked until the Exploration Bay is revealed by the
  // low-Salvage notification (hidden → false). While broken it can't be clicked,
  // so exploration is unreachable until that alert enables it.
  const sonarOperational = !!rooms.find((r) => r.id === "exploration" && !r.hidden);
  return (
    <div className="zone-header metal riveted header">
      <div className="brand">
        <div className="title-stencil game-title">LONG NOW</div>
        <div className="station-sub">M.A.R.A. · MOBILE AQUATIC RESEARCH ARRAY</div>
      </div>

      <div className="gauges">
        <Gauge label="Oxygen" value={oxygen} critical={oxygen < 10} />
        <Gauge label="Power" value={power} />
        <Gauge label="Hull" value={vitals.hull} />
      </div>

      <div className="header-res">
        {RES.map((r) => {
          // a room shortcut only works once the room exists (revealed / ready to
          // build); still-hidden rooms aren't navigable. Non-room targets (the
          // Salvage → exploration shortcut) are always available.
          const go = r.go;
          const available =
            go.kind !== "room" || !!rooms.find((x) => x.id === go.id && !x.hidden);
          return (
            <button
              className={`hres metal${available ? "" : " nonav"}`}
              key={r.key}
              title={available ? r.label : `${r.label} — not available yet`}
              onClick={() => available && dispatch({ type: "SELECT", selection: r.go })}
            >
              <img
                className="hres-icon"
                src={`/Long-Now/assets/ui/${r.key}.png`}
                alt={r.label}
                draggable={false}
              />
              <span className="hres-val">{Math.round(resources[r.key])}</span>
            </button>
          );
        })}
      </div>

      <div className="header-spacer" />

      <button
        className="inv-btn metal"
        title="Inventory"
        onClick={() => dispatch({ type: "SELECT", selection: { kind: "inventory" } })}
      >
        <img
          className="inv-icon-img"
          src="/Long-Now/assets/ui/vault.png"
          alt="Vault"
          draggable={false}
        />
        <span className="inv-label">VAULT</span>
      </button>

      <div className="daytime metal">
        <div className="day">DAY {day}</div>
        <div className="clock">{clock}</div>
      </div>

      {sonarOperational ? (
        <button
          className="sonar"
          title="Sonar — plan an expedition"
          onClick={() => dispatch({ type: "SELECT", selection: { kind: "room", id: "exploration" } })}
        >
          <img className="sonar-face" src="/Long-Now/assets/ui/sonar.png" alt="" draggable={false} />
          <img className="sonar-wave" src="/Long-Now/assets/ui/sonar-wave.png" alt="" draggable={false} />
        </button>
      ) : (
        <div className="sonar broken" title="Sonar — offline (wrecked)">
          <img className="sonar-face" src="/Long-Now/assets/ui/sonar-old.png" alt="" draggable={false} />
        </div>
      )}
    </div>
  );
}
