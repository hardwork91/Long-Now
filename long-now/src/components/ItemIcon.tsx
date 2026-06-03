import { useState } from "react";
import { ITEM_CATALOG } from "../gameData";

/** real item art lives in /assets/ui/Items, named with hyphens (scrap_coil → scrap-coil.png) */
export function itemImg(id: string): string {
  return `/Long-Now/assets/ui/Items/${id.replace(/_/g, "-")}.png`;
}

/**
 * Renders an item's real image, falling back to its emoji placeholder if the
 * image is missing (so the catalogue still reads while art is being added).
 */
export default function ItemIcon({ id, className }: { id: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const item = ITEM_CATALOG[id];
  if (failed || !item) {
    return <span className={className}>{item?.icon ?? "❔"}</span>;
  }
  return (
    <img
      className={className}
      src={itemImg(id)}
      alt={item.name}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
