import { useGame } from "../store";

const RES = [
  { key: "food", label: "Food" },
  { key: "water", label: "Water" },
  { key: "salvage", label: "Salvage" },
  { key: "med", label: "Med Supplies" },
] as const;

export default function ResourceBar() {
  const { resources } = useGame();
  return (
    <div className="zone-bottom resbar">
      {RES.map((r) => (
        <div className="res metal" key={r.key}>
          <img
            className="ricon"
            src={`/Long-Now/assets/ui/${r.key}.png`}
            alt=""
            draggable={false}
          />
          <span className="rlabel label">{r.label}</span>
          <span className="rval">{resources[r.key]}</span>
        </div>
      ))}
    </div>
  );
}
