import { useGame } from "../store";

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

export default function Header() {
  const { vitals, day, clock } = useGame();
  return (
    <div className="zone-header metal riveted header">
      <div className="brand">
        <div className="title-stencil game-title">LONG NOW</div>
        <div className="station-sub">M.A.R.A. · MOBILE AQUATIC RESEARCH ARRAY</div>
      </div>

      <div className="gauges">
        <Gauge label="Oxygen" value={vitals.oxygen} critical={vitals.oxygen < 10} />
        <Gauge label="Power" value={vitals.power} />
        <Gauge label="Hull" value={vitals.hull} />
      </div>

      <div className="daytime metal">
        <div className="day">DAY {day}</div>
        <div className="clock">{clock}</div>
      </div>

      <div className="sonar" title="Sonar — external alerts">
        <img className="sonar-face" src="/Long-Now/assets/ui/sonar.png" alt="" draggable={false} />
        <img className="sonar-wave" src="/Long-Now/assets/ui/sonar-wave.png" alt="" draggable={false} />
      </div>
    </div>
  );
}
