import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type {
  GameEvent,
  GameStateData,
  LogEntry,
  PendingSlot,
  Room,
  Selection,
  SlotKind,
} from "./types";
import { initialState, BUILD_SEQUENCE, UNLOCK_EVENTS, ITEM_CATALOG } from "./gameData";

/** game speed — ms between simulation ticks (lower = faster). */
export const TICK_MS = 1000;

const SPEC_MAX_LEVEL = 2;
// --- simulation tuning (placeholders, per 1s tick) ---
const O2_PER_CREW = 0.05; // O₂ consumed per tick by each crew member ABOARD
const O2_PROD_PER_LEVEL = 0.5; // O₂ produced per tick per O₂-plant level (up to its cap)
const HUNGER_RATE = 0.15; // hunger climb (on-station, not resting)
const ENERGY_RATE = 0.12; // energy drain
const HAB_RECOVER = 0.8; // hunger down / energy up while resting in the habitat
const FOOD_PROD = 0.25; // food per food-worker
const WATER_PROD = 0.3; // water per water-worker
const FOOD_PER_CREW = 0.03; // passive food draw per on-station crew
const WATER_PER_CREW = 0.04; // passive water draw per on-station crew
const HAB_FOOD_EXTRA = 0.1; // extra food eaten per crew resting in the habitat
const FOOD_WATER_COST = 0.1; // water drawn per food-worker (hydroponics)
// --- exploration tuning ---
const SECONDS_PER_DAY = 15; // expedition ticks per in-game day
export const EXP_FOOD_PER_DAY = 2; // provisions per explorer per day
export const EXP_WATER_PER_DAY = 2;
export const EXP_MED_PER_DAY = 1;
const LOOT_SALVAGE_MIN = 40;
const LOOT_SALVAGE_MAX = 120;
const SALVAGE_LOW = 300; // when Salvage drops below this, prompt repairing the Exploration Bay

function samePending(a: PendingSlot, b: PendingSlot): boolean {
  if (!a || !b || a.kind !== b.kind) return false;
  if (a.kind === "room" && b.kind === "room")
    return a.roomId === b.roomId && a.slotKind === b.slotKind && a.index === b.index;
  if (a.kind === "event" && b.kind === "event")
    return a.eventId === b.eventId && a.postIndex === b.postIndex;
  if (a.kind === "build" && b.kind === "build")
    return a.roomId === b.roomId && a.optionKey === b.optionKey && a.index === b.index;
  if (a.kind === "expedition" && b.kind === "expedition") return a.index === b.index;
  return false;
}

type Action =
  | { type: "SELECT"; selection: Selection }
  | { type: "ASSIGN"; crewId: string; roomId: string; kind: SlotKind; index: number }
  | { type: "ASSIGN_BUILD"; crewId: string; roomId: string; optionKey: string; index: number }
  | { type: "UNASSIGN"; crewId: string }
  | { type: "RESOLVE_EVENT"; eventId: string }
  | { type: "ASSIGN_POST"; eventId: string; postIndex: number; crewId: string }
  | { type: "UPGRADE_ROOM"; roomId: string; delta: number }
  | { type: "CHOOSE_SPEC"; roomId: string; specKey: string }
  | { type: "START_BUILD"; roomId: string; optionKey: string }
  | { type: "CANCEL_BUILD"; roomId: string }
  | { type: "UNLOCK_ROOM"; roomId: string }
  | { type: "ASSIGN_EXPEDITION"; crewId: string; index: number }
  | { type: "LAUNCH_EXPEDITION"; crewIds: string[]; days: number }
  | { type: "GRANT_ITEM"; itemId: string }
  | { type: "PICK_SLOT"; slot: NonNullable<PendingSlot> }
  | { type: "ASSIGN_PENDING"; crewId: string }
  | { type: "TICK" };

function removeCrewFromAllSlots(state: GameStateData, crewId: string): GameStateData {
  const rooms = state.rooms.map((r) => ({
    ...r,
    workSlots: r.workSlots.map((c) => (c === crewId ? null : c)),
    upgradeSlots: r.upgradeSlots.map((c) => (c === crewId ? null : c)),
    buildAssign: r.buildAssign
      ? Object.fromEntries(
          Object.entries(r.buildAssign).map(([k, arr]) => [
            k,
            arr.map((c) => (c === crewId ? null : c)),
          ])
        )
      : r.buildAssign,
  }));
  const events = state.events.map((e) =>
    e.posts
      ? { ...e, posts: e.posts.map((p) => (p.crewId === crewId ? { ...p, crewId: null } : p)) }
      : e
  );
  const expeditionParty = state.expeditionParty.map((c) => (c === crewId ? null : c));
  return { ...state, rooms, events, expeditionParty };
}

function reducer(state: GameStateData, action: Action): GameStateData {
  switch (action.type) {
    case "SELECT":
      return { ...state, selection: action.selection, pendingSlot: null };

    case "PICK_SLOT":
      return {
        ...state,
        pendingSlot: samePending(state.pendingSlot, action.slot) ? null : action.slot,
      };

    case "ASSIGN_PENDING": {
      const p = state.pendingSlot;
      if (!p) return state;
      let next: GameStateData;
      if (p.kind === "room") {
        next = reducer(state, {
          type: "ASSIGN",
          crewId: action.crewId,
          roomId: p.roomId,
          kind: p.slotKind,
          index: p.index,
        });
      } else if (p.kind === "event") {
        next = reducer(state, {
          type: "ASSIGN_POST",
          eventId: p.eventId,
          postIndex: p.postIndex,
          crewId: action.crewId,
        });
      } else if (p.kind === "expedition") {
        next = reducer(state, {
          type: "ASSIGN_EXPEDITION",
          crewId: action.crewId,
          index: p.index,
        });
      } else {
        next = reducer(state, {
          type: "ASSIGN_BUILD",
          crewId: action.crewId,
          roomId: p.roomId,
          optionKey: p.optionKey,
          index: p.index,
        });
      }
      return { ...next, pendingSlot: null };
    }

    case "ASSIGN_EXPEDITION": {
      const crew = state.crew.find((c) => c.id === action.crewId);
      if (!crew || crew.exploringReturnsIn) return state;
      if (action.index < 0 || action.index >= state.expeditionParty.length) return state;
      // pull the crew off any other slot first (also clears other party slots)
      const next = removeCrewFromAllSlots(state, action.crewId);
      const party = [...next.expeditionParty];
      party[action.index] = action.crewId;
      return { ...next, expeditionParty: party };
    }

    case "ASSIGN": {
      const crew = state.crew.find((c) => c.id === action.crewId);
      if (!crew || crew.exploringReturnsIn) return state;
      let next = removeCrewFromAllSlots(state, action.crewId);
      next = {
        ...next,
        rooms: next.rooms.map((r) => {
          if (r.id !== action.roomId) return r;
          const key = action.kind === "work" ? "workSlots" : "upgradeSlots";
          if (action.kind === "work" && !r.developed) return r;
          const slots = [...r[key]];
          if (action.index < 0 || action.index >= slots.length) return r;
          slots[action.index] = action.crewId;
          return { ...r, [key]: slots };
        }),
      };
      return next;
    }

    case "ASSIGN_BUILD": {
      const crew = state.crew.find((c) => c.id === action.crewId);
      if (!crew || crew.exploringReturnsIn) return state;
      const room = state.rooms.find((r) => r.id === action.roomId);
      const opt = room?.buildOptions?.find((o) => o.key === action.optionKey);
      if (!room || !opt) return state;
      let next = removeCrewFromAllSlots(state, action.crewId);
      next = {
        ...next,
        rooms: next.rooms.map((r) => {
          if (r.id !== action.roomId) return r;
          const ba = { ...(r.buildAssign ?? {}) };
          const arr = [...(ba[action.optionKey] ?? Array(opt.crewNeeded).fill(null))];
          if (action.index < 0 || action.index >= arr.length) return r;
          arr[action.index] = action.crewId;
          ba[action.optionKey] = arr;
          return { ...r, buildAssign: ba };
        }),
      };
      return next;
    }

    case "UNASSIGN":
      return removeCrewFromAllSlots(state, action.crewId);

    case "ASSIGN_POST": {
      const crew = state.crew.find((c) => c.id === action.crewId);
      if (!crew || crew.exploringReturnsIn) return state;
      let next = removeCrewFromAllSlots(state, action.crewId);
      next = {
        ...next,
        events: next.events.map((e) => {
          if (e.id !== action.eventId || !e.posts) return e;
          const posts = e.posts.map((p, i) =>
            i === action.postIndex ? { ...p, crewId: action.crewId } : p
          );
          return { ...e, posts };
        }),
      };
      return next;
    }

    case "UPGRADE_ROOM": {
      return {
        ...state,
        rooms: state.rooms.map((r) => {
          if (r.id !== action.roomId) return r;
          const d = action.delta;
          if (r.specialization) {
            const next = (r.specLevel ?? 1) + d;
            if (next < 1) return { ...r, specialization: undefined, specLevel: undefined };
            return { ...r, specLevel: Math.min(SPEC_MAX_LEVEL, next) };
          }
          const baseMax = r.specChoices ? r.specGateLevel ?? 2 : r.maxLevel ?? 9;
          return { ...r, level: Math.min(baseMax, Math.max(1, r.level + d)), developed: true };
        }),
      };
    }

    case "CHOOSE_SPEC": {
      return {
        ...state,
        rooms: state.rooms.map((r) =>
          r.id === action.roomId ? { ...r, specialization: action.specKey, specLevel: 1 } : r
        ),
      };
    }

    case "UNLOCK_ROOM": {
      const room = state.rooms.find((r) => r.id === action.roomId);
      if (!room) return state;
      return {
        ...state,
        rooms: state.rooms.map((r) => (r.id === action.roomId ? { ...r, hidden: false } : r)),
        events: state.events.filter((e) => e.unlocksRoom !== action.roomId),
        selection: { kind: "room", id: action.roomId },
        pendingSlot: null,
      };
    }

    case "START_BUILD": {
      const room = state.rooms.find((r) => r.id === action.roomId);
      if (!room || room.developed || room.building) return state;
      const opt = room.buildOptions?.find((o) => o.key === action.optionKey);
      if (!opt) return state;
      const assigned = room.buildAssign?.[opt.key] ?? [];
      if (assigned.filter(Boolean).length < opt.crewNeeded) return state;
      if (state.resources.salvage < opt.materialCost) return state;
      const items = opt.requiredItems ?? [];
      if (!items.every((it) => state.inventory.includes(it))) return state;
      return {
        ...state,
        resources: { ...state.resources, salvage: state.resources.salvage - opt.materialCost },
        inventory: state.inventory.filter((it) => !items.includes(it)),
        consumed: [
          ...state.consumed,
          ...items.map((it) => ({
            id: it,
            roomId: room.id,
            where: `${room.name} (${opt.label})`,
          })),
        ],
        rooms: state.rooms.map((r) =>
          r.id === action.roomId
            ? { ...r, building: { optionKey: opt.key, progress: 0 }, buildAssign: { [opt.key]: assigned } }
            : r
        ),
        log: [{ time: state.clock, text: `Construction started: ${room.name} (${opt.label}).` }, ...state.log],
      };
    }

    case "CANCEL_BUILD": {
      const room = state.rooms.find((r) => r.id === action.roomId);
      if (!room || !room.building) return state;
      // items used by this build return to the vault; salvage & time are lost
      const refundIds = state.consumed.filter((c) => c.roomId === room.id).map((c) => c.id);
      return {
        ...state,
        inventory: [...state.inventory, ...refundIds],
        consumed: state.consumed.filter((c) => c.roomId !== room.id),
        rooms: state.rooms.map((r) =>
          r.id === action.roomId ? { ...r, building: undefined, buildAssign: {} } : r
        ),
        log: [
          {
            time: state.clock,
            text: `Construction cancelled: ${room.name}.${refundIds.length ? " Items returned to vault." : ""}`,
          },
          ...state.log,
        ],
      };
    }

    case "LAUNCH_EXPEDITION": {
      if (state.expedition) return state; // one party at a time
      const ids = action.crewIds.filter((id) => {
        const c = state.crew.find((x) => x.id === id);
        return c && !c.exploringReturnsIn;
      });
      if (ids.length === 0) return state;
      const days = Math.max(1, action.days);
      const foodCost = ids.length * EXP_FOOD_PER_DAY * days;
      const waterCost = ids.length * EXP_WATER_PER_DAY * days;
      const medCost = ids.length * EXP_MED_PER_DAY * days;
      if (
        state.resources.food < foodCost ||
        state.resources.water < waterCost ||
        state.resources.med < medCost
      )
        return state;
      let next = state;
      ids.forEach((id) => {
        next = removeCrewFromAllSlots(next, id);
      });
      const returnsIn = days * SECONDS_PER_DAY;
      return {
        ...next,
        resources: {
          ...next.resources,
          food: next.resources.food - foodCost,
          water: next.resources.water - waterCost,
          med: next.resources.med - medCost,
        },
        expedition: { crewIds: ids, returnsIn, days },
        expeditionParty: next.expeditionParty.map(() => null),
        crew: next.crew.map((c) =>
          ids.includes(c.id) ? { ...c, exploringReturnsIn: returnsIn } : c
        ),
        selection: { kind: "room", id: "exploration" },
        pendingSlot: null,
        log: [
          { time: state.clock, text: `Expedition launched — ${ids.length} crew, ${days} day(s).` },
          ...next.log,
        ],
      };
    }

    case "GRANT_ITEM": {
      if (state.inventory.includes(action.itemId)) return state;
      return { ...state, inventory: [...state.inventory, action.itemId] };
    }

    case "RESOLVE_EVENT": {
      const events = state.events.filter((e) => e.id !== action.eventId);
      const selection =
        state.selection?.kind === "event" && state.selection.id === action.eventId
          ? null
          : state.selection;
      return { ...state, events, selection };
    }

    case "TICK": {
      // --- expedition countdown / return ---
      const exp = state.expedition;
      let expedition = exp;
      let returnedIds: string[] = [];
      let lootSalvage = 0;
      let lootItem: string | undefined;
      if (exp) {
        const rem = exp.returnsIn - 1;
        if (rem <= 0) {
          returnedIds = exp.crewIds;
          const explorers = Math.max(1, exp.crewIds.length);
          lootSalvage = Math.round(
            ((LOOT_SALVAGE_MIN + Math.random() * (LOOT_SALVAGE_MAX - LOOT_SALVAGE_MIN)) *
              exp.days *
              explorers) /
              3
          );
          if (Math.random() < 0.6) {
            const owned = new Set([...state.inventory, ...state.consumed.map((c) => c.id)]);
            const candidates = Object.keys(ITEM_CATALOG).filter((id) => !owned.has(id));
            if (candidates.length)
              lootItem = candidates[Math.floor(Math.random() * candidates.length)];
          }
          expedition = null;
        } else {
          expedition = { ...exp, returnsIn: rem };
        }
      }

      // crew resting in the habitat recover; everyone else gets hungrier/tireder
      const habitat = state.rooms.find((r) => r.id === "habitat" && r.developed);
      const resting = new Set<string>(
        (habitat?.workSlots.filter(Boolean) as string[] | undefined) ?? []
      );
      const crew = state.crew.map((c) => {
        if (returnedIds.includes(c.id)) return { ...c, exploringReturnsIn: undefined };
        if (c.exploringReturnsIn)
          return { ...c, exploringReturnsIn: expedition ? expedition.returnsIn : 0 };
        let { hunger, energy, health, morale } = c.state;
        if (resting.has(c.id)) {
          hunger = Math.max(0, hunger - HAB_RECOVER);
          energy = Math.min(100, energy + HAB_RECOVER);
        } else {
          hunger = Math.min(100, hunger + HUNGER_RATE);
          energy = Math.max(0, energy - ENERGY_RATE);
        }
        if (hunger >= 85 || energy <= 15) health = Math.max(0, health - 0.1);
        else if (hunger <= 50 && energy >= 50) health = Math.min(100, health + 0.05);
        if (health <= 35 || hunger >= 85) morale = Math.max(0, morale - 0.08);
        else morale = Math.min(100, morale + 0.04);
        return { ...c, state: { hunger, energy, health, morale } };
      });

      // resource production vs consumption
      const onStation = crew.filter((c) => !c.exploringReturnsIn).length;
      const sumWorkers = (pred: (r: Room) => boolean) =>
        state.rooms
          .filter((r) => r.developed && pred(r))
          .reduce((n, r) => n + r.workSlots.filter(Boolean).length, 0);
      const foodWorkers = sumWorkers((r) => r.id === "food" || r.id === "fishery");
      const waterWorkers = sumWorkers((r) => r.id === "water");
      const food = Math.max(
        0,
        state.resources.food + foodWorkers * FOOD_PROD - onStation * FOOD_PER_CREW - resting.size * HAB_FOOD_EXTRA
      );
      const water = Math.max(
        0,
        state.resources.water + waterWorkers * WATER_PROD - onStation * WATER_PER_CREW - foodWorkers * FOOD_WATER_COST
      );
      const resources = {
        ...state.resources,
        food,
        water,
        salvage: state.resources.salvage + lootSalvage,
      };
      const inventory = lootItem ? [...state.inventory, lootItem] : state.inventory;
      const expeditionLog: LogEntry[] =
        returnedIds.length > 0
          ? [
              {
                time: state.clock,
                text: `Expedition returned: +${lootSalvage} Salvage${lootItem ? `, found ${ITEM_CATALOG[lootItem].name}` : ""}.`,
              },
            ]
          : [];

      let events = state.events.map((e) => ({
        ...e,
        responseWindow: Math.max(0, e.responseWindow - 1),
      }));

      // O₂: balance of plant production vs. crew consumption.
      // Only crew physically ABOARD breathe station air — anyone away on an
      // expedition is off the books, so sending people out slows the drain.
      // This is a deliberate survival lever when the O₂ plant is down.
      const consumption = onStation * O2_PER_CREW;
      const o2room = state.rooms.find((r) => r.id === "o2" && r.developed);
      // a running plant tops the air up only to its rated cap (scales with level)
      const plantCap = o2room ? (o2room.level / (o2room.maxLevel ?? 3)) * 100 : 0;
      let oxygen = state.vitals.oxygen;
      const production = o2room && oxygen < plantCap ? O2_PROD_PER_LEVEL * o2room.level : 0;
      oxygen = Math.max(0, Math.min(100, oxygen + production - consumption));

      // production cycle flavour + construction progress
      const completedLogs: LogEntry[] = [];
      const newUnlockEvents: GameEvent[] = [];
      const rooms = state.rooms.map((r) => {
        let nr = r;
        if (r.developed && r.workSlots.some(Boolean)) nr = { ...nr, cycle: (nr.cycle + 1) % 101 };
        if (nr.building) {
          const opt = nr.buildOptions?.find((o) => o.key === nr.building!.optionKey);
          if (opt) {
            const assigned = nr.buildAssign?.[opt.key] ?? [];
            const ready = assigned.filter(Boolean).length >= opt.crewNeeded;
            if (ready) {
              const progress = nr.building.progress + 1;
              if (progress >= opt.buildTime) {
                completedLogs.push({
                  time: state.clock,
                  text: `${opt.renamesRoom ? opt.label : nr.name} built and online.`,
                });
                const idx = BUILD_SEQUENCE.indexOf(nr.id);
                const nextId = idx >= 0 ? BUILD_SEQUENCE[idx + 1] : undefined;
                if (
                  nextId &&
                  UNLOCK_EVENTS[nextId] &&
                  !state.events.some((e) => e.unlocksRoom === nextId) &&
                  !newUnlockEvents.some((e) => e.unlocksRoom === nextId)
                ) {
                  newUnlockEvents.push(UNLOCK_EVENTS[nextId]);
                }
                nr = {
                  ...nr,
                  developed: true,
                  level: 1,
                  variant: opt.label,
                  name: opt.renamesRoom ? opt.label : nr.name,
                  sceneBase: opt.sceneBase,
                  sceneLevels: opt.sceneLevels,
                  building: undefined,
                  buildAssign: {},
                };
              } else {
                nr = { ...nr, building: { optionKey: opt.key, progress } };
              }
            }
          }
        }
        return nr;
      });

      if (newUnlockEvents.length) events = [...events, ...newUnlockEvents];

      // low-salvage prompt: reveal the wrecked Exploration Bay so the player can
      // repair it and start bringing Salvage back. Fires once.
      const explorationRoom = rooms.find((r) => r.id === "exploration");
      const lowSalvageLog: LogEntry[] = [];
      if (
        explorationRoom?.hidden &&
        resources.salvage < SALVAGE_LOW &&
        !events.some((e) => e.id === "unlock-exploration")
      ) {
        events = [...events, UNLOCK_EVENTS.exploration];
        lowSalvageLog.push({
          time: state.clock,
          text: "Salvage running low — the wrecked Exploration Bay needs repair.",
        });
      }

      const log = [...lowSalvageLog, ...expeditionLog, ...completedLogs, ...state.log];
      return {
        ...state,
        crew,
        events,
        rooms,
        log,
        resources,
        inventory,
        expedition,
        vitals: { ...state.vitals, oxygen },
      };
    }

    default:
      return state;
  }
}

const StateCtx = createContext<GameStateData | null>(null);
const DispatchCtx = createContext<Dispatch<Action> | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export function useGame(): GameStateData {
  const s = useContext(StateCtx);
  if (!s) throw new Error("useGame must be used within GameProvider");
  return s;
}

export function useDispatch(): Dispatch<Action> {
  const d = useContext(DispatchCtx);
  if (!d) throw new Error("useDispatch must be used within GameProvider");
  return d;
}

export function crewById(state: GameStateData, id: string) {
  return state.crew.find((c) => c.id === id);
}

/** Where is this crew member currently assigned? (single source of truth = rooms/events) */
export function findActivity(
  state: GameStateData,
  crewId: string
): { label: string; detail: string; progress?: number } | null {
  for (const r of state.rooms) {
    if (r.workSlots.includes(crewId))
      return { label: r.name, detail: "Working", progress: r.cycle };
    if (r.upgradeSlots.includes(crewId))
      return { label: r.name, detail: "Upgrading", progress: r.cycle };
    if (r.buildAssign) {
      for (const arr of Object.values(r.buildAssign)) {
        if (arr.includes(crewId)) {
          const opt = r.buildOptions?.find((o) => o.key === r.building?.optionKey);
          const progress =
            r.building && opt ? Math.round((r.building.progress / opt.buildTime) * 100) : undefined;
          return { label: r.name, detail: "Building", progress };
        }
      }
    }
  }
  return null;
}
