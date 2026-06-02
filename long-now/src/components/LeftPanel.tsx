import { useGame, useDispatch } from "../store";
import { fmtCountdown } from "./common";

export default function LeftPanel() {
  const { events, log } = useGame();
  const dispatch = useDispatch();

  return (
    <div className="zone-left metal left-panel">
      {/* ALERTS section */}
      <div className="lp-section alerts-section">
        <div className="panel-head">
          <span className="label">Alerts</span>
          <span className="label" style={{ color: "var(--text-faint)" }}>
            view all
          </span>
        </div>
        <div className="scroll">
          {events.map((e) => (
            <div
              key={e.id}
              className={`alert-item ${e.severity}`}
              onClick={() =>
                dispatch({ type: "SELECT", selection: { kind: "event", id: e.id } })
              }
            >
              <span className="dot" />
              <span className="atext">{e.title}</span>
              <span className="acount">{fmtCountdown(e.responseWindow)}</span>
            </div>
          ))}
          {events.length === 0 && (
            <div className="log-line" style={{ textAlign: "center" }}>
              no active alerts
            </div>
          )}
        </div>
      </div>

      {/* internal divider */}
      <div className="lp-divider" />

      {/* STATION LOG section */}
      <div className="lp-section log-section">
        <div className="panel-head">
          <span className="label">Station Log</span>
          <span
            className="label panel-action"
            onClick={() => dispatch({ type: "SELECT", selection: { kind: "log" } })}
          >
            view log
          </span>
        </div>
        <div className="scroll">
          {log.map((l, i) => (
            <div key={i} className="log-line">
              <span className="lt">{l.time}</span>
              {l.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
