import { useEffect } from "react";
import "./App.css";
import { GameProvider, useDispatch, useGame } from "./store";
import Header from "./components/Header";
import CrewStrip from "./components/CrewStrip";
import LeftPanel from "./components/LeftPanel";
import CentralView from "./components/CentralView";
import RoomsSidebar from "./components/RoomsSidebar";
import ResourceBar from "./components/ResourceBar";

function Ticker() {
  const dispatch = useDispatch();
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(id);
  }, [dispatch]);
  return null;
}

function HUD() {
  useGame();
  // alarm behaviour — wiring kept; OFF for now until trigger/clear conditions are defined.
  // (Re-enable e.g. with: events.some((e) => e.severity === "high"))
  const alarm = false;
  return (
    <div className="hud">
      <Header />
      <CrewStrip />
      <LeftPanel />
      <CentralView />
      <RoomsSidebar />
      <ResourceBar />
      <Ticker />
      {/* full-screen flat red overlay — kept but disabled; only the vignette is used */}
      {false && <div className="screen-alert-overlay" />}
      {alarm && <div className="screen-alert-vignette" />}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <HUD />
    </GameProvider>
  );
}
