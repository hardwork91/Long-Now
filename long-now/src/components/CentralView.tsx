import type { CSSProperties } from "react";
import { useGame } from "../store";
import RoomView from "./central/RoomView";
import CrewProfile from "./central/CrewProfile";
import EventView from "./central/EventView";
import StationLogView from "./central/StationLogView";
import InventoryView from "./central/InventoryView";
import ExpeditionView from "./central/ExpeditionView";

export default function CentralView() {
  const state = useGame();
  const sel = state.selection;

  let body = (
    <div className="empty-central">Select a room, a crew member, or an alert</div>
  );
  let scene: string | undefined;
  let sceneBW = false;

  if (sel?.kind === "room") {
    const room = state.rooms.find((r) => r.id === sel.id);
    if (room) {
      if (room.id === "exploration" && room.developed) {
        // the repaired Exploration Bay shows the expedition planner, not work slots
        body = <ExpeditionView />;
        scene = "/Long-Now/assets/rooms/explore.png";
        sceneBW = false;
      } else if (!room.developed) {
        body = <RoomView room={room} />;
        // unbuilt room art: a pre-existing broken plant (`*-old.png`) if the room
        // defines one, else the generic empty scene. B&W while unbuilt AND while
        // being built — only finished (developed) rooms show in colour.
        scene = room.unbuiltScene ?? "/Long-Now/assets/rooms/empty.png";
        sceneBW = true;
      } else {
        body = <RoomView room={room} />;
        const chosen = room.specChoices?.find((s) => s.key === room.specialization);
        if (chosen) {
          const lvl = Math.min(Math.max(room.specLevel ?? 1, 1), chosen.sceneLevels);
          scene = `${chosen.sceneBase}-${lvl}.png`;
        } else if (room.sceneBase) {
          const maxLvl = room.sceneLevels ?? 1;
          const lvl = Math.min(Math.max(room.level, 1), maxLvl);
          scene = `${room.sceneBase}-${lvl}.png`;
        }
        // built rooms are always in colour (production state no longer greyscales)
        sceneBW = false;
      }
    }
  } else if (sel?.kind === "crew") {
    const crew = state.crew.find((c) => c.id === sel.id);
    if (crew) body = <CrewProfile crew={crew} />;
  } else if (sel?.kind === "event") {
    const event = state.events.find((e) => e.id === sel.id);
    if (event) body = <EventView event={event} />;
  } else if (sel?.kind === "log") {
    body = <StationLogView />;
    scene = "/Long-Now/assets/rooms/log.png";
  } else if (sel?.kind === "inventory") {
    body = <InventoryView />;
    scene = "/Long-Now/assets/rooms/vault.png";
  }

  const sceneStyle: CSSProperties | undefined = scene
    ? { backgroundImage: `url("${scene}")` }
    : undefined;

  return (
    <div className="zone-central metal central">
      <div className="central-scroll">
        {scene && <div className={`room-scene${sceneBW ? " bw" : ""}`} style={sceneStyle} />}
        {body}
      </div>
    </div>
  );
}
