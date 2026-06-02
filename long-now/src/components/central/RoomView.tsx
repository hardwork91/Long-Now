import type { Room } from "../../types";
import { useDispatch } from "../../store";
import DropSlot from "./DropSlot";

export default function RoomView({ room }: { room: Room }) {
  const dispatch = useDispatch();
  const hasWork = room.workSlots.length + room.lockedWork > 0;

  const spec = room.specChoices?.find((s) => s.key === room.specialization);
  const atGate =
    !!room.specChoices && !room.specialization && room.level >= (room.specGateLevel ?? 99);
  const shownLevel = spec ? room.specLevel ?? 1 : room.level;

  return (
    <div className="roomview">
      <h2 className="roomview-title">{room.name}</h2>

      <div className="roomstat">
        <div className="s">
          <span className="label">Level</span>
          <div className="v">{shownLevel}</div>
        </div>
        {room.variant && (
          <div className="s">
            <span className="label">Variant</span>
            <div className="v">{room.variant}</div>
          </div>
        )}
        {(spec || room.specChoices) && (
          <div className="s">
            <span className="label">Specialization</span>
            <div className="v">
              {spec ? spec.label : `— (choose at Lv ${room.specGateLevel})`}
            </div>
          </div>
        )}
        <div className="s">
          <span className="label">Produces</span>
          <div className="v">{room.produces ?? "—"}</div>
        </div>
        <div className="s">
          <span className="label">Consumes</span>
          <div className="v">{room.consumes ?? "—"}</div>
        </div>
      </div>

      {/* WORK SLOTS — hidden for self-running rooms */}
      {hasWork ? (
        <div className="slot-group">
          <span className="label">Work Slots</span>
          <div className="slot-row">
            {room.workSlots.map((cid, i) => (
              <DropSlot
                key={i}
                roomId={room.id}
                kind="work"
                index={i}
                crewId={cid}
                disabled={!room.developed}
              />
            ))}
            {Array.from({ length: room.lockedWork }).map((_, i) => (
              <div key={`lw${i}`} className="slot locked">
                🔒
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="slot-group">
          <div className="auto-note">⚙ Runs automatically — no operators needed.</div>
        </div>
      )}

      {/* At the gate level → specialization choice cards; otherwise → upgrade slots */}
      {atGate ? (
        <div className="slot-group">
          <span className="label">Choose Specialization</span>
          <div className="cards">
            {room.specChoices!.map((c) => (
              <div className="choice-card metal riveted" key={c.key}>
                <h4>{c.label}</h4>
                <div className="cdesc">{c.desc}</div>
                <div className="ccost">{c.cost}</div>
                <button
                  className="primary"
                  onClick={() =>
                    dispatch({ type: "CHOOSE_SPEC", roomId: room.id, specKey: c.key })
                  }
                >
                  Develop
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="slot-group">
          <span className="label">Upgrade / Development Slots</span>
          <div className="slot-row">
            {room.upgradeSlots.map((cid, i) => (
              <DropSlot key={i} roomId={room.id} kind="upgrade" index={i} crewId={cid} />
            ))}
            {Array.from({ length: room.lockedUpgrade }).map((_, i) => (
              <div key={`lu${i}`} className="slot locked">
                🔒
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="room-actions">
        <button
          className="primary"
          onClick={() => dispatch({ type: "UPGRADE_ROOM", roomId: room.id, delta: 1 })}
        >
          Upgrade
        </button>
        {/* TEMP: downgrade button for testing levels/specialization (remove later) */}
        <button onClick={() => dispatch({ type: "UPGRADE_ROOM", roomId: room.id, delta: -1 })}>
          Downgrade
        </button>
        {room.developed && <button>Harvest</button>}
      </div>
    </div>
  );
}
