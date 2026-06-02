import type { CSSProperties } from "react";
import { useGame, useDispatch, findActivity } from "../store";
import type { CrewMember } from "../types";
import { Avatar, StatBar, fmtCountdown } from "./common";

function CrewCard({ crew }: { crew: CrewMember }) {
  const state = useGame();
  const dispatch = useDispatch();
  const exploring = !!crew.exploringReturnsIn;
  const selected =
    state.selection?.kind === "crew" && state.selection.id === crew.id;
  const activity = findActivity(state, crew.id);
  const assignMode = !!state.pendingSlot;
  const candidate = assignMode && !exploring;

  return (
    <div
      className={`crew-card metal${selected ? " selected" : ""}${
        exploring ? " exploring" : ""
      }${candidate ? " candidate" : ""}`}
      style={{ "--cardaccent": crew.accent } as CSSProperties}
      onClick={() => {
        if (assignMode) {
          if (!exploring) dispatch({ type: "ASSIGN_PENDING", crewId: crew.id });
        } else {
          dispatch({ type: "SELECT", selection: { kind: "crew", id: crew.id } });
        }
      }}
    >
      {crew.portrait ? (
        <div
          className="card-portrait"
          style={{
            backgroundImage: `url(${crew.portrait.replace("/crew/", "/crew/portraits/")})`,
          }}
          draggable={!exploring}
          onDragStart={(e) => {
            e.dataTransfer.setData("text/plain", crew.id);
            e.dataTransfer.effectAllowed = "move";
          }}
        />
      ) : (
        <Avatar name={crew.name} accent={crew.accent} size={52} />
      )}
      <div className="who">
        <div className="cname">{crew.name.split(" ")[0]}</div>
        {exploring ? (
          <>
            <div className="exp-state">EXPLORING</div>
            <div className="exp-count">↩ {fmtCountdown(crew.exploringReturnsIn!)}</div>
          </>
        ) : (
          <>
            <div className="activity">{activity ? activity.label : "Idle"}</div>
            <StatBar label="Energy" value={crew.state.energy} statKey="energy" icon="⚡" />
            <StatBar label="Hunger" value={crew.state.hunger} statKey="hunger" icon="🍴" />
            <StatBar label="Health" value={crew.state.health} statKey="health" icon="✚" />
            <StatBar label="Morale" value={crew.state.morale} statKey="morale" icon="☺" />
          </>
        )}
      </div>
    </div>
  );
}

export default function CrewStrip() {
  const { crew } = useGame();
  return (
    <div className="zone-crew metal riveted crew-strip">
      {crew.map((c) => (
        <CrewCard key={c.id} crew={c} />
      ))}
    </div>
  );
}
