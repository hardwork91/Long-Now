import { useState } from "react";
import {
  useGame,
  useDispatch,
  EXP_FOOD_PER_DAY,
  EXP_WATER_PER_DAY,
  EXP_MED_PER_DAY,
} from "../../store";
import { getExpeditionTips, tipIcon } from "../../expeditionTips";
import ExpeditionSlot from "./ExpeditionSlot";

function fmtCountdown(ticks: number): string {
  const m = Math.floor(ticks / 60);
  const s = ticks % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function ExpeditionView() {
  const { crew, expedition } = useGame();
  const dispatch = useDispatch();

  /* ============ EXPEDITION IN PROGRESS ============ */
  if (expedition) {
    const party = expedition.crewIds
      .map((id) => crew.find((c) => c.id === id))
      .filter(Boolean);
    return (
      <div className="roomview expedition">
        <h2 className="roomview-title">Expedition Underway</h2>
        <div className="exp-status">
          <span className="label">Returns in</span>
          <div className="exp-countdown">{fmtCountdown(expedition.returnsIn)}</div>
          <div className="exp-sub">
            {expedition.days}-day sortie · {party.length} crew away
          </div>
        </div>
        <div className="exp-party">
          {party.map((c) => {
            const bust = c!.portrait?.replace("/crew/", "/crew/portraits/");
            return (
              <button
                className="exp-member"
                key={c!.id}
                title={`Open ${c!.name}'s profile`}
                style={{ borderColor: c!.accent }}
                onClick={() =>
                  dispatch({ type: "SELECT", selection: { kind: "crew", id: c!.id } })
                }
              >
                <div
                  className="exp-portrait"
                  style={{ backgroundImage: `url("${bust ?? c!.portrait}")` }}
                />
                <div className="exp-name">{c!.name}</div>
              </button>
            );
          })}
        </div>
        <div className="develop-note">
          The party is beyond contact. Salvage and any finds will reach the Vault on their
          return.
        </div>
      </div>
    );
  }

  /* ============ PLAN A NEW EXPEDITION ============ */
  return <ExpeditionPlanner />;
}

function ExpeditionPlanner() {
  const { resources, expeditionParty } = useGame();
  const dispatch = useDispatch();
  const [days, setDays] = useState(1);

  const n = expeditionParty.filter(Boolean).length;

  // longest sortie the chosen party can be provisioned for
  const maxDays =
    n > 0
      ? Math.max(
          1,
          Math.floor(
            Math.min(
              resources.food / (n * EXP_FOOD_PER_DAY),
              resources.water / (n * EXP_WATER_PER_DAY),
              resources.med / (n * EXP_MED_PER_DAY)
            )
          )
        )
      : 1;
  const d = Math.min(days, maxDays);

  const foodCost = n * EXP_FOOD_PER_DAY * d;
  const waterCost = n * EXP_WATER_PER_DAY * d;
  const medCost = n * EXP_MED_PER_DAY * d;
  const affordable =
    resources.food >= foodCost &&
    resources.water >= waterCost &&
    resources.med >= medCost;
  const canLaunch = n > 0 && d >= 1 && affordable;

  const tips = getExpeditionTips({ days: d, partySize: n, maxDays });

  return (
    <div className="roomview expedition">
      <h2 className="roomview-title">Plan Expedition</h2>
      <div className="develop-note">
        Send up to two crew into the dark water. Each explorer consumes {EXP_FOOD_PER_DAY}{" "}
        Food, {EXP_WATER_PER_DAY} Water and {EXP_MED_PER_DAY} Med per day.
      </div>

      <div className="slot-group">
        <span className="label">Expedition Party</span>
        <div className="slot-row">
          {expeditionParty.map((cid, i) => (
            <ExpeditionSlot key={i} index={i} crewId={cid} />
          ))}
        </div>
        <div className="develop-note">
          Click a slot, then pick a crew member from the strip above.
        </div>
      </div>

      <div className="slot-group">
        <span className="label">Duration — {d} day(s)</span>
        <input
          className="exp-slider"
          type="range"
          min={1}
          max={Math.max(1, maxDays)}
          value={d}
          disabled={n === 0}
          onChange={(e) => setDays(Number(e.target.value))}
        />
        <div className="exp-sub">Max {maxDays} day(s) with current supplies.</div>
      </div>

      {tips.length > 0 && (
        <div className="exp-tips">
          {tips.map((t) => (
            <div className={`exp-tip ${t.tone}`} key={t.id}>
              <span className="exp-tip-icon">{tipIcon(t.tone)}</span>
              <span className="exp-tip-text">{t.text}</span>
            </div>
          ))}
        </div>
      )}

      <div className="exp-cost">
        <div className={`exp-cost-item${resources.food < foodCost ? " short" : ""}`}>
          <span className="label">Food</span>
          <div className="v">{foodCost}</div>
        </div>
        <div className={`exp-cost-item${resources.water < waterCost ? " short" : ""}`}>
          <span className="label">Water</span>
          <div className="v">{waterCost}</div>
        </div>
        <div className={`exp-cost-item${resources.med < medCost ? " short" : ""}`}>
          <span className="label">Med</span>
          <div className="v">{medCost}</div>
        </div>
      </div>

      <div className="room-actions">
        <button
          className="primary"
          disabled={!canLaunch}
          title={
            n === 0
              ? "Assign at least one explorer"
              : !affordable
                ? "Not enough supplies"
                : "Launch the expedition"
          }
          onClick={() =>
            dispatch({
              type: "LAUNCH_EXPEDITION",
              crewIds: expeditionParty.filter((c): c is string => !!c),
              days: d,
            })
          }
        >
          Launch Expedition
        </button>
      </div>
    </div>
  );
}
