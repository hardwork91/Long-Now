import { useState } from "react";
import { useGame, useDispatch } from "../../store";
import { ITEM_CATALOG } from "../../gameData";

export default function InventoryView() {
  const { inventory, consumed } = useGame();
  const dispatch = useDispatch();

  const cells = [
    ...inventory.map((id) => ({ id, used: false, where: "" })),
    ...consumed.map((c) => ({ id: c.id, used: true, where: c.where })),
  ];
  const [selIdx, setSelIdx] = useState(0);
  const sel = cells[selIdx];
  const item = sel ? ITEM_CATALOG[sel.id] : undefined;

  const notFound = Object.keys(ITEM_CATALOG).filter(
    (id) => !inventory.includes(id) && !consumed.some((c) => c.id === id)
  );

  return (
    <div className="inventory-view">
      <h2 className="logview-title">Vault</h2>

      <div className="vault-layout">
        {/* LEFT — 4-column item grid (used items are greyscale) */}
        <div className="vault-grid">
          {cells.map((c, i) => (
            <button
              key={i}
              className={`vault-cell${c.used ? " used" : ""}${selIdx === i ? " sel" : ""}`}
              onClick={() => setSelIdx(i)}
              title={ITEM_CATALOG[c.id]?.name}
            >
              {ITEM_CATALOG[c.id]?.icon ?? "❔"}
            </button>
          ))}
          {cells.length === 0 && <div className="inv-empty">Vault is empty.</div>}
        </div>

        {/* RIGHT — top: big icon · bottom: name + description (+ where used) */}
        <div className="vault-detail">
          {item && sel ? (
            <>
              <div className="vault-detail-top">
                <div className={`vault-big-icon${sel.used ? " used" : ""}`}>{item.icon}</div>
              </div>
              <div className="vault-detail-bottom">
                <h3>{item.name}</h3>
                <p className="bg-text">{item.desc}</p>
                {sel.used && (
                  <div className="inv-used-tag">Used in: {sel.where || "—"}</div>
                )}
              </div>
            </>
          ) : (
            <div className="history-empty">Select an item to inspect it.</div>
          )}
        </div>
      </div>

      {notFound.length > 0 && (
        <div className="inv-debug">
          <span className="label">(debug) find item:</span>
          {notFound.map((id) => (
            <button key={id} onClick={() => dispatch({ type: "GRANT_ITEM", itemId: id })}>
              {ITEM_CATALOG[id]?.icon} {ITEM_CATALOG[id]?.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
