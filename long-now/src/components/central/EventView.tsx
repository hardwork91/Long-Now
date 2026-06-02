import { useState } from "react";
import type { GameEvent } from "../../types";
import { useGame, useDispatch, crewById } from "../../store";
import { Avatar, fmtCountdown } from "../common";

function PostSlot({
  eventId,
  index,
  crewId,
}: {
  eventId: string;
  index: number;
  crewId: string | null;
}) {
  const state = useGame();
  const dispatch = useDispatch();
  const [over, setOver] = useState(false);
  const crew = crewId ? crewById(state, crewId) : undefined;
  const pending =
    state.pendingSlot?.kind === "event" &&
    state.pendingSlot.eventId === eventId &&
    state.pendingSlot.postIndex === index;
  return (
    <div
      className={`slot ${crew ? "filled" : ""} ${over ? "droppable" : ""} ${
        pending ? "pending" : ""
      }`}
      style={crew ? { borderColor: crew.accent } : undefined}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const cid = e.dataTransfer.getData("text/plain");
        if (cid) dispatch({ type: "ASSIGN_POST", eventId, postIndex: index, crewId: cid });
      }}
      onClick={() =>
        dispatch({ type: "PICK_SLOT", slot: { kind: "event", eventId, postIndex: index } })
      }
    >
      {crew ? (
        <Avatar name={crew.name} accent={crew.accent} size={36} portrait={crew.portrait} />
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

export default function EventView({ event }: { event: GameEvent }) {
  const dispatch = useDispatch();

  return (
    <div className="eventview">
      <div className={`ev-banner ${event.severity}`}>
        <h2>{event.title}</h2>
        <div className="ev-desc">{event.description}</div>
        <div className="ev-window" style={{ marginTop: 8 }}>
          ⏳ Response window: {fmtCountdown(event.responseWindow)}
        </div>
      </div>

      {event.body === "posts" && event.posts && (
        <>
          <span className="label">Posts — drag crew in</span>
          <div className="posts">
            {event.posts.map((p, i) => (
              <div className="post metal" key={i}>
                <div className="plabel">{p.label}</div>
                <PostSlot eventId={event.id} index={i} crewId={p.crewId} />
                <div className="pmit">{p.mitigates}</div>
              </div>
            ))}
          </div>
          <button className="primary" onClick={() => dispatch({ type: "RESOLVE_EVENT", eventId: event.id })}>
            Resolve now
          </button>
        </>
      )}

      {event.body === "cards" && event.cards && (
        <>
          <span className="label">Choose an option</span>
          <div className="cards">
            {event.cards.map((c, i) => (
              <div className="choice-card metal riveted" key={i}>
                <h4>{c.title}</h4>
                <div className="cdesc">{c.desc}</div>
                <div className="ccost">{c.cost}</div>
                <button
                  className="primary"
                  onClick={() => dispatch({ type: "RESOLVE_EVENT", eventId: event.id })}
                >
                  Develop
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
