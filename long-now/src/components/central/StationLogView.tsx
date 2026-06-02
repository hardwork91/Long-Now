import { useGame } from "../../store";

export default function StationLogView() {
  const { log } = useGame();
  return (
    <div className="logview">
      <h2 className="logview-title">Station Log</h2>
      <div className="logview-panel">
        <div className="logview-scroll">
          {log.map((l, i) => (
            <div key={i} className="logview-line">
              <span className="lt">{l.time}</span>
              <span>{l.text}</span>
            </div>
          ))}
          {log.length === 0 && <div className="history-empty">No entries yet.</div>}
        </div>
      </div>
    </div>
  );
}
