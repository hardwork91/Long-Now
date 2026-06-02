import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type { GameStateData, PendingSlot, Selection, SlotKind } from "./types";
import { initialState } from "./gameData";

function samePending(a: PendingSlot, b: PendingSlot): boolean {
  if (!a || !b || a.kind !== b.kind) return false;
  if (a.kind === "room" && b.kind === "room")
    return a.roomId === b.roomId && a.slotKind === b.slotKind && a.index === b.index;
  if (a.kind === "event" && b.kind === "event")
    return a.eventId === b.eventId && a.postIndex === b.postIndex;
  return false;
}

type Action =
  | { type: "SELECT"; selection: Selection }
  | { type: "ASSIGN"; crewId: string; roomId: string; kind: SlotKind; index: number }
  | { type: "UNASSIGN"; crewId: string }
  | { type: "RESOLVE_EVENT"; eventId: string }
  | { type: "ASSIGN_POST"; eventId: string; postIndex: number; crewId: string }
  | { type: "UPGRADE_ROOM"; roomId: string; delta: number }
  | { type: "CHOOSE_SPEC"; roomId: string; specKey: string }
  | { type: "PICK_SLOT"; slot: NonNullable<PendingSlot> }
  | { type: "ASSIGN_PENDING"; crewId: string }
  | { type: "TICK" };

const SPEC_MAX_LEVEL = 2;

function removeCrewFromAllSlots(state: GameStateData, crewId: string): GameStateData {
  const rooms = state.rooms.map((r) => ({
    ...r,
    workSlots: r.workSlots.map((c) => (c === crewId ? null : c)),
    upgradeSlots: r.upgradeSlots.map((c) => (c === crewId ? null : c)),
  }));
  const events = state.events.map((e) =>
    e.posts
      ? { ...e, posts: e.posts.map((p) => (p.crewId === crewId ? { ...p, crewId: null } : p)) }
      : e
  );
  return { ...state, rooms, events };
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
      const next =
        p.kind === "room"
          ? reducer(state, {
              type: "ASSIGN",
              crewId: action.crewId,
              roomId: p.roomId,
              kind: p.slotKind,
              index: p.index,
            })
          : reducer(state, {
              type: "ASSIGN_POST",
              eventId: p.eventId,
              postIndex: p.postIndex,
              crewId: action.crewId,
            });
      return { ...next, pendingSlot: null };
    }

    case "ASSIGN": {
      const crew = state.crew.find((c) => c.id === action.crewId);
      if (!crew || crew.exploringReturnsIn) return state; // exploring crew can't be assigned
      let next = removeCrewFromAllSlots(state, action.crewId);
      next = {
        ...next,
        rooms: next.rooms.map((r) => {
          if (r.id !== action.roomId) return r;
          const key = action.kind === "work" ? "workSlots" : "upgradeSlots";
          // build-then-develop: work slots locked until developed
          if (action.kind === "work" && !r.developed) return r;
          const slots = [...r[key]];
          if (action.index < 0 || action.index >= slots.length) return r;
          slots[action.index] = action.crewId;
          return { ...r, [key]: slots };
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
          // already specialized → move along the specialization track
          if (r.specialization) {
            const next = (r.specLevel ?? 1) + d;
            if (next < 1) {
              // drop back below spec level 1 → un-specialize, return to gate level
              return { ...r, specialization: undefined, specLevel: undefined };
            }
            return { ...r, specLevel: Math.min(SPEC_MAX_LEVEL, next) };
          }
          // base track; if the room can specialize, the base caps at the gate level
          const baseMax = r.specChoices ? r.specGateLevel ?? 2 : 9;
          return {
            ...r,
            level: Math.min(baseMax, Math.max(1, r.level + d)),
            developed: true,
          };
        }),
      };
    }

    case "CHOOSE_SPEC": {
      return {
        ...state,
        rooms: state.rooms.map((r) =>
          r.id === action.roomId
            ? { ...r, specialization: action.specKey, specLevel: 1 }
            : r
        ),
      };
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
      // light "alive" pass: advance production cycles, tick countdowns
      const rooms = state.rooms.map((r) => {
        const working = r.workSlots.some(Boolean);
        if (!working || !r.developed) return r;
        return { ...r, cycle: (r.cycle + 1) % 101 };
      });
      const crew = state.crew.map((c) =>
        c.exploringReturnsIn
          ? { ...c, exploringReturnsIn: Math.max(0, c.exploringReturnsIn - 1) }
          : c
      );
      const events = state.events.map((e) => ({
        ...e,
        responseWindow: Math.max(0, e.responseWindow - 1),
      }));
      return { ...state, rooms, crew, events };
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
  }
  for (const e of state.events) {
    const p = e.posts?.find((p) => p.crewId === crewId);
    if (p) return { label: e.title, detail: p.label };
  }
  return null;
}
