import type { Room } from "../../types";
import { useDispatch, useGame } from "../../store";
import { ITEM_CATALOG } from "../../gameData";
import DropSlot from "./DropSlot";
import BuildSlot from "./BuildSlot";
import ItemIcon from "../ItemIcon";

export default function RoomView({ room }: { room: Room }) {
  const dispatch = useDispatch();
  const { resources, inventory } = useGame();

  /* ============ CONSTRUCTION IN PROGRESS ============ */
  if (room.building) {
    const opt = room.buildOptions?.find((o) => o.key === room.building!.optionKey);
    const slots = room.buildAssign?.[room.building.optionKey] ?? [];
    const ready = opt ? slots.filter(Boolean).length >= opt.crewNeeded : false;
    const pct = opt ? Math.min(100, Math.round((room.building.progress / opt.buildTime) * 100)) : 0;
    return (
      <div className="roomview">
        <h2 className="roomview-title">{room.name}</h2>
        <div className="build-now-label label">
          Building: {opt?.label} {ready ? "" : "· PAUSED (needs crew)"}
        </div>

        <div className="build-progress">
          <div className="build-progress-fill" style={{ width: `${pct}%` }} />
          <span className="build-progress-pct">{pct}%</span>
        </div>

        <div className="slot-group">
          <span className="label">Builders</span>
          <div className="slot-row">
            {slots.map((cid, i) => (
              <BuildSlot
                key={i}
                roomId={room.id}
                optionKey={room.building!.optionKey}
                index={i}
                crewId={cid}
              />
            ))}
          </div>
          <div className="develop-note">
            Remove a builder to pause; progress is kept. Cancel to abort (resources & time are
            lost).
          </div>
        </div>

        <div className="room-actions">
          <button onClick={() => dispatch({ type: "CANCEL_BUILD", roomId: room.id })}>
            Cancel Construction
          </button>
        </div>
      </div>
    );
  }

  /* ============ UNBUILT — choose a construction option ============ */
  if (!room.developed) {
    return (
      <div className="roomview">
        <h2 className="roomview-title">{room.name}</h2>
        <div className="roomstat">
          <div className="s">
            <span className="label">Level</span>
            <div className="v">—</div>
          </div>
          <div className="s">
            <span className="label">Status</span>
            <div className="v">Not built</div>
          </div>
        </div>

        <span className="label">Choose what to build</span>
        <div className="cards">
          {(room.buildOptions ?? []).map((opt) => {
            const slots = room.buildAssign?.[opt.key] ?? Array(opt.crewNeeded).fill(null);
            const crewOk = slots.filter(Boolean).length >= opt.crewNeeded;
            const items = opt.requiredItems ?? [];
            const itemsOk = items.every((it) => inventory.includes(it));
            const moneyOk = resources.salvage >= opt.materialCost;
            const canBuild = crewOk && itemsOk && moneyOk;
            return (
              <div className="build-card metal" key={opt.key}>
                <h4>{opt.label}</h4>
                <div className="cdesc">{opt.desc}</div>
                <div className="build-meta">
                  <div>Consumes: {opt.consumes}</div>
                  <div>Output: {opt.production}</div>
                  <div className="ccost">Cost: Salvage {opt.materialCost}</div>
                </div>

                {items.length > 0 && (
                  <div className="build-items">
                    {items.map((it) => {
                      const item = ITEM_CATALOG[it];
                      const owned = inventory.includes(it);
                      return (
                        <span
                          key={it}
                          className={`build-item${owned ? "" : " missing"}`}
                          title={`${item?.name ?? it}${owned ? "" : " (not found yet)"}`}
                        >
                          <ItemIcon id={it} className="build-item-img" />
                        </span>
                      );
                    })}
                  </div>
                )}

                <div className="build-slots">
                  {slots.map((cid, i) => (
                    <BuildSlot
                      key={i}
                      roomId={room.id}
                      optionKey={opt.key}
                      index={i}
                      crewId={cid}
                    />
                  ))}
                </div>

                <button
                  className="primary"
                  disabled={!canBuild}
                  title={
                    !crewOk
                      ? `Assign ${opt.crewNeeded} builder(s)`
                      : !itemsOk
                        ? "Missing required item(s)"
                        : !moneyOk
                          ? `Need Salvage ${opt.materialCost}`
                          : "Start construction"
                  }
                  onClick={() => dispatch({ type: "START_BUILD", roomId: room.id, optionKey: opt.key })}
                >
                  Build
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ============ DEVELOPED — normal room ============ */
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
            <div className="v">{spec ? spec.label : `— (choose at Lv ${room.specGateLevel})`}</div>
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

      {hasWork ? (
        <div className="slot-group">
          <span className="label">Work Slots</span>
          <div className="slot-row">
            {room.workSlots.map((cid, i) => (
              <DropSlot key={i} roomId={room.id} kind="work" index={i} crewId={cid} disabled={false} />
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

      {atGate ? (
        <div className="slot-group">
          <span className="label">Choose Specialization</span>
          <div className="cards">
            {room.specChoices!.map((c) => (
              <div className="choice-card metal" key={c.key}>
                <h4>{c.label}</h4>
                <div className="cdesc">{c.desc}</div>
                <div className="ccost">{c.cost}</div>
                <button
                  className="primary"
                  onClick={() => dispatch({ type: "CHOOSE_SPEC", roomId: room.id, specKey: c.key })}
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
        {/* TEMP: downgrade for testing levels/specialization */}
        <button onClick={() => dispatch({ type: "UPGRADE_ROOM", roomId: room.id, delta: -1 })}>
          Downgrade
        </button>
        <button>Harvest</button>
      </div>
    </div>
  );
}
