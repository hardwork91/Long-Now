// Long Now — prototype data model (mirrors the GDD §5, §6, §7, §9)

export type StatKey = "energy" | "hunger" | "health" | "morale";

export interface CrewState {
  energy: number;
  hunger: number;
  health: number;
  morale: number;
}

export interface HistoryEntry {
  /** which crewmate this memory was shared with */
  with: string;
  text: string;
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  accent: string;
  traits: string[];
  background: string;
  history?: HistoryEntry[];
  /** portrait image (full-body art); avatars crop to the top (face) */
  portrait?: string;
  state: CrewState;
  /** seconds until return; when set the crew is away exploring */
  exploringReturnsIn?: number;
}

export type SlotKind = "work" | "upgrade";

export interface SpecChoice {
  key: string;
  label: string;
  desc: string;
  cost: string;
  sceneBase: string;
  sceneLevels: number;
}

/** A construction option panel (variant / spec / single build). */
export interface BuildOption {
  key: string;
  /** resulting room/variant name (shown; becomes room name if renamesRoom) */
  label: string;
  desc: string;
  consumes: string;
  /** production index, placeholder string for now */
  production: string;
  /** Salvage cost, charged when construction starts */
  materialCost: number;
  /** crew required in the panel's slots (1 or 2) — not a speed-up, a requirement */
  crewNeeded: number;
  /** ticks to complete construction (placeholder until tuned) */
  buildTime: number;
  /** item ids required (must be owned) to enable Build */
  requiredItems?: string[];
  /** art of the resulting built room */
  sceneBase: string;
  sceneLevels: number;
  /** if true, the built room takes this option's label as its name */
  renamesRoom?: boolean;
}

export interface Item {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

/** an item that has been consumed, with where it was used (for the vault history) */
export interface ConsumedItem {
  id: string;
  /** room id it was consumed by (for refund-on-cancel); "" for pre-game flavour */
  roomId: string;
  /** human label of where it was used */
  where: string;
}

export interface Room {
  id: string;
  /** canonical room-type display name */
  name: string;
  short: string;
  accent: string;
  level: number;
  /** hard cap on level for this room (defaults to 9 when absent) */
  maxLevel?: number;
  variant?: string;
  /** chosen specialization key (matches a SpecChoice.key) */
  specialization?: string;
  /** level reached at which the specialization choice unlocks */
  specGateLevel?: number;
  /** available specialization branches (shown as cards at the gate) */
  specChoices?: SpecChoice[];
  /** level within the chosen specialization track */
  specLevel?: number;
  produces?: string;
  consumes?: string;
  /** optional background-image base for the room scene; the actual file is
   *  `${sceneBase}-${level}.png` so the art changes with the room's level. */
  sceneBase?: string;
  /** scene shown while the room is still unbuilt, instead of the generic
   *  `empty.png` (e.g. a pre-existing but broken plant: `*-old.png`). */
  unbuiltScene?: string;
  /** how many per-level scene images exist (caps which `-N.png` is used) */
  sceneLevels?: number;
  /** crewId or null per open slot */
  workSlots: (string | null)[];
  upgradeSlots: (string | null)[];
  /** padlocked (not-yet-unlocked) slots, shown but not usable */
  lockedWork: number;
  lockedUpgrade: number;
  /** build-then-develop: while false, Work Slots are locked */
  developed: boolean;
  /** not yet revealed in the station (unlocked later via events) */
  hidden?: boolean;
  /** construction option panels shown while unbuilt (variants, or a single build) */
  buildOptions?: BuildOption[];
  /** crew assigned per build option while choosing (optionKey -> slots) */
  buildAssign?: Record<string, (string | null)[]>;
  /** active construction in progress on this room */
  building?: { optionKey: string; progress: number };
  /** 0..100 production cycle (flavour) */
  cycle: number;
}

export type EventFamily = "A" | "B" | "C" | "D";
export type EventBody = "posts" | "cards";

export interface EventPost {
  label: string;
  mitigates: string;
  crewId: string | null;
}

export interface EventCard {
  title: string;
  desc: string;
  cost: string;
}

export interface GameEvent {
  id: string;
  family: EventFamily;
  title: string;
  description: string;
  severity: "low" | "med" | "high";
  body: EventBody;
  /** seconds left in the responseWindow */
  responseWindow: number;
  posts?: EventPost[];
  cards?: EventCard[];
  /** if set, resolving this event reveals (unlocks) the given room id */
  unlocksRoom?: string;
}

export interface LogEntry {
  time: string;
  text: string;
}

export interface Vitals {
  oxygen: number;
  power: number;
  hull: number;
}

export interface Resources {
  food: number;
  water: number;
  salvage: number;
  med: number;
}

export type Selection =
  | { kind: "room"; id: string }
  | { kind: "crew"; id: string }
  | { kind: "event"; id: string }
  | { kind: "log" }
  | { kind: "inventory" }
  | { kind: "expedition" }
  | null;

/** the single active expedition party (one at a time). */
export interface Expedition {
  crewIds: string[];
  /** ticks until the party returns */
  returnsIn: number;
  days: number;
}

/** the slot currently awaiting a crew pick (click-slot → highlight strip → click crew) */
export type PendingSlot =
  | { kind: "room"; roomId: string; slotKind: SlotKind; index: number }
  | { kind: "event"; eventId: string; postIndex: number }
  | { kind: "build"; roomId: string; optionKey: string; index: number }
  | { kind: "expedition"; index: number }
  | null;

export interface GameStateData {
  day: number;
  clock: string;
  vitals: Vitals;
  resources: Resources;
  crew: CrewMember[];
  emptyCrewSlots: number;
  rooms: Room[];
  events: GameEvent[];
  log: LogEntry[];
  selection: Selection;
  pendingSlot: PendingSlot;
  /** owned item ids (found in exploration) */
  inventory: string[];
  /** consumed items (used up by builds), with where they were used */
  consumed: ConsumedItem[];
  /** the single active expedition (null when none is out) */
  expedition: Expedition | null;
  /** draft party being assembled in the exploration planner (up to 2 slots) */
  expeditionParty: (string | null)[];
}
