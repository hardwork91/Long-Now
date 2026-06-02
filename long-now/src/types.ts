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

export interface Room {
  id: string;
  /** canonical room-type display name */
  name: string;
  short: string;
  accent: string;
  level: number;
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
  | null;

/** the slot currently awaiting a crew pick (click-slot → highlight strip → click crew) */
export type PendingSlot =
  | { kind: "room"; roomId: string; slotKind: SlotKind; index: number }
  | { kind: "event"; eventId: string; postIndex: number }
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
}
