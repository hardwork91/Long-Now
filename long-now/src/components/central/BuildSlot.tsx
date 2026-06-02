import { useGame, useDispatch, crewById } from "../../store";
import { Avatar } from "../common";

export default function BuildSlot({
  roomId,
  optionKey,
  index,
  crewId,
}: {
  roomId: string;
  optionKey: string;
  index: number;
  crewId: string | null;
}) {
  const state = useGame();
  const dispatch = useDispatch();
  const crew = crewId ? crewById(state, crewId) : undefined;
  const bust = crew?.portrait?.replace("/crew/", "/crew/portraits/");
  const pending =
    state.pendingSlot?.kind === "build" &&
    state.pendingSlot.roomId === roomId &&
    state.pendingSlot.optionKey === optionKey &&
    state.pendingSlot.index === index;

  return (
    <div
      className={`bslot ${crew ? "filled" : ""} ${pending ? "pending" : ""}`}
      style={crew ? { borderColor: crew.accent } : undefined}
      title="Click, then pick a crew member from the strip"
      onClick={() =>
        dispatch({ type: "PICK_SLOT", slot: { kind: "build", roomId, optionKey, index } })
      }
    >
      {crew && bust ? (
        <img className="slot-portrait" src={bust} alt={crew.name} draggable={false} />
      ) : crew ? (
        <Avatar name={crew.name} accent={crew.accent} size={32} />
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
