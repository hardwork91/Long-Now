import type { CrewMember } from "../../types";
import { useGame, findActivity } from "../../store";
import { StatBar, fmtCountdown } from "../common";

export default function CrewProfile({ crew }: { crew: CrewMember }) {
  const state = useGame();
  const activity = findActivity(state, crew.id);
  const exploring = !!crew.exploringReturnsIn;
  const history = crew.history ?? [];

  return (
    <div className="crew-detail">
      {/* full-panel background portrait */}
      {crew.portrait && (
        <div
          className={`crew-bg${exploring ? " bw" : ""}`}
          style={{ backgroundImage: `url(${crew.portrait})` }}
        />
      )}

      <div className="crew-overlay">
        {/* ROW 1 — info, two columns */}
        <div className="info-row">
          {/* col A: name + state */}
          <div className="info-col">
            <h2>{crew.name}</h2>
            <div className="block state-block">
              <span className="label">State{exploring ? " · unknown (away)" : ""}</span>
              <StatBar label="Energy" value={crew.state.energy} statKey="energy" unknown={exploring} />
              <StatBar label="Hunger" value={crew.state.hunger} statKey="hunger" unknown={exploring} />
              <StatBar label="Health" value={crew.state.health} statKey="health" unknown={exploring} />
              <StatBar label="Morale" value={crew.state.morale} statKey="morale" unknown={exploring} />
            </div>
          </div>

          {/* col B: traits + current activity */}
          <div className="info-col">
            <div className="block">
              <span className="label">Traits</span>
              <div className="traits">
                {crew.traits.map((t) => (
                  <span className="trait" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="block">
              <span className="label">Current Activity</span>
              {exploring ? (
                <div className="bg-text">
                  Exploring — away from the station.
                  <br />
                  <span style={{ color: "var(--morale)" }}>
                    ↩ Returns in {fmtCountdown(crew.exploringReturnsIn!)}
                  </span>
                </div>
              ) : activity ? (
                <>
                  <div className="bg-text">
                    {activity.detail} · {activity.label}
                  </div>
                  {activity.progress !== undefined && (
                    <div className="activity-bar">
                      <div className="fill" style={{ width: `${activity.progress}%` }} />
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-text">Idle — unassigned.</div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2 — history (the only scrolling region) */}
        <div className="history-panel">
          <div className="panel-head">
            <span className="label">History</span>
          </div>
          <div className="history-body">
            <p className="history-bg">{crew.background}</p>
            {history.map((h, i) => (
              <div className="history-entry" key={i}>
                <div className="history-with" style={{ color: crew.accent }}>
                  shared with {h.with}
                </div>
                <div className="history-text">“{h.text}”</div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="history-empty">No shared memories recorded yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
