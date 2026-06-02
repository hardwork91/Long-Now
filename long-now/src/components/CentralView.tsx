import type { CSSProperties } from "react";
import { useGame } from "../store";
import RoomView from "./central/RoomView";
import CrewProfile from "./central/CrewProfile";
import EventView from "./central/EventView";
import StationLogView from "./central/StationLogView";

export default function CentralView() {
  const state = useGame();
  const sel = state.selection;

  let body = (
    <div className="empty-central">Select a room, a crew member, or an alert</div>
  );
  let scene: string | undefined;

  if (sel?.kind === "room") {
    const room = state.rooms.find((r) => r.id === sel.id);
    if (room) {
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
  }

  const scrollStyle: CSSProperties | undefined = scene
    ? {
        backgroundImage: `url("${scene}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  return (
    <div className="zone-central metal central">
      <div className="central-scroll" style={scrollStyle}>
        {body}
      </div>
    </div>
  );
}
