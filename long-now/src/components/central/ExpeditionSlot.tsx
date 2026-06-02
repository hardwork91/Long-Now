import { useState } from "react";
import { useGame, useDispatch, crewById } from "../../store";
import { Avatar } from "../common";

export default function ExpeditionSlot({
  index,
  crewId,
}: {
  index: number;
  crewId: string | null;
}) {
  const state = useGame();
  const dispatch = useDispatch();
  const [over, setOver] = useState(false);
  const crew = crewId ? crewById(state, crewId) : undefined;
  const bust = crew?.portrait?.replace("/crew/", "/crew/portraits/");

  const pending =
    state.pendingSlot?.kind === "expedition" && state.pendingSlot.index === index;

  return (
    <div
      className={`slot ${crew ? "filled" : ""} ${over ? "droppable" : ""} ${
        pending ? "pending" : ""
      }`}
      style={crew ? { borderColor: crew.accent } : undefined}
      title="Click, then pick a crew member from the strip"
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const cid = e.dataTransfer.getData("text/plain");
        if (cid) dispatch({ type: "ASSIGN_EXPEDITION", crewId: cid, index });
      }}
      onClick={() => dispatch({ type: "PICK_SLOT", slot: { kind: "expedition", index } })}
    >
      {crew ? (
        bust ? (
          <img className="slot-portrait" src={bust} alt={crew.name} draggable={false} />
        ) : (
          <Avatar name={crew.name} accent={crew.accent} size={36} portrait={crew.portrait} />
        )
      ) : (
        "+"
      )}
      {crew && (
        <button
          className="slot-remove"
          title="Remove (set Idle)"
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: "UNASSIGN", crewId: crew.id });
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
