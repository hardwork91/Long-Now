import type { CSSProperties } from "react";
import { useGame, useDispatch, crewById } from "../store";
import type { Room } from "../types";

function MiniSlots({ slots, locked }: { slots: (string | null)[]; locked: number }) {
  const state = useGame();
  return (
    <div className="slot-mini-row">
      {slots.map((cid, i) => {
        const c = cid ? crewById(state, cid) : undefined;
        return (
          <div
            key={i}
            className={`slot-mini ${cid ? "filled" : "empty"}`}
            style={
              c
                ? {
                    backgroundImage: `url(${c.portrait?.replace("/crew/", "/crew/face/")})`,
                    borderColor: c.accent,
                  }
                : undefined
            }
          />
        );
      })}
      {Array.from({ length: locked }).map((_, i) => (
        <div key={`l${i}`} className="slot-mini locked">
          🔒
        </div>
      ))}
    </div>
  );
}

function RoomRow({ room }: { room: Room }) {
  const state = useGame();
  const dispatch = useDispatch();
  const selected = state.selection?.kind === "room" && state.selection.id === room.id;
  return (
    <div
      className={`room-row${selected ? " selected" : ""}`}
      style={{ "--roomaccent": room.accent } as CSSProperties}
      onClick={() => dispatch({ type: "SELECT", selection: { kind: "room", id: room.id } })}
    >
      <div className="rname">
        <span>{room.short}</span>
        <span className="lv">Lv {room.specialization ? room.specLevel ?? 1 : room.level}</span>
      </div>

      <div className="room-slots-row">
        <div className="slot-col">
          {room.workSlots.length + room.lockedWork === 0 ? (
            <div className="auto-tag">⚙ Auto</div>
          ) : (
            <MiniSlots
              slots={room.developed ? room.workSlots : []}
              locked={
                room.developed ? room.lockedWork : room.workSlots.length + room.lockedWork
              }
            />
          )}
        </div>

        <div className="vdivider" />

        <div className="slot-col">
          <MiniSlots slots={room.upgradeSlots} locked={room.lockedUpgrade} />
        </div>
      </div>
    </div>
  );
}

export default function RoomsSidebar() {
  const { rooms } = useGame();
  return (
    <div className="zone-rooms metal riveted rooms">
      <div className="panel-head">
        <span className="label">Station Rooms</span>
      </div>
      <div className="scroll" style={{ padding: 0 }}>
        {rooms
          .filter((r) => !r.hidden && r.id !== "exploration")
          .map((r) => (
            <RoomRow key={r.id} room={r} />
          ))}
      </div>
    </div>
  );
}
