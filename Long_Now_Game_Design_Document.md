# Long Now — Game Design Document

**Long Now** — *the game's title (see §1.3).*
**M.A.R.A.** — *Mobile Aquatic Research Array:* the name of the initial station, shown in the in-game UI control panel.

Version 0.5 (in progress) — Living design document
Genre: Real-time survival management with active pause
Platform target: PC (desktop-first)

> **v0.5 changelog (in progress):** (1) **O2 consumption now counts only crew ABOARD, making exploration an O2 relief valve (§5.5, §10.5, Decisions #55):** sending crew out removes consumers and slows the O2 fall — a deliberate survival lever, especially against the broken-plant cold open. (2) **Documented the implemented prototype O2 model** (production-vs-consumption per tick, level-scaled plant cap; §14.1). (3) **Pre-existing broken plants:** the O2 plant's variant is pre-decided at world-gen (not player-chosen; Algae for now) and shows a `*-old.png` broken scene while unbuilt; the Desalinator does the same (§7.9, §13.2). (4) **Synced §13.2/§13.3 to the actual Vite + React + TypeScript build** — six-zone HUD, build-flow v2, Vault, simulation heartbeat, and the full exploration loop (slot-based party picker, duration slider, condition tips, loot-to-Vault).
>
> **v0.4 changelog (in progress):** (1) **Reworked Room Specialization / "Bifurcations" (§6.7)** into the room-type model the design actually uses — a small set of **room types**, some with **variants** (chosen at build, "show 2 pick 1") and optional **specializations** (chosen at a level-gate, then levelled), others single-type (Reactor, Habitáculo, etc.); catalogue being detailed (§6.7.1). (2) **Simplified the O2 model:** removed the per-character "Mask O2 %" stat **and** the auxiliary O2 reserve entirely — O2 is now a pure station balance and **0% = whole-crew death**, with the slow fall + a sub-10% critical highlight as the only margin (§5.5, §14.1, Decisions #52). *This supersedes the "O2 / mask system" description in the v0.3 note below.*
>
> **v0.3 changelog:** closes the v0.2 interview pass — **every open question in §15 is now resolved.** This pass reworked the **O2 / mask system** (soft-cap breathing balance, personal mask reserves, staggered self-stabilizing death, single whole-crew loss condition, surplus-only mask recharge), the **continuous-physical / buffered-morale performance model** ("body degrades smoothly, mind has slack"), the **reactor as a normal event whose lethality flows only through the O2 cascade** (Power loss freezes *all* production), **exploration parameters** (≤2 crew, continuous-slider duration, linear payoff/risk, live provisioning capped by base supplies), the new **Room Specialization / "Bifurcations"** replayability pillar (later reworked in v0.4 into **room types → variants → specializations**; irreversible per run; not inherited), **narrative/lore as an expandable supervised-AI-authored DB** delivered through the **Bitácora**, and a **purely diegetic onboarding** (no tutorial layer). See **§16 (Decisions Log #29–#48)** for the full record.
>
> **v0.2 changelog:** consolidated an earlier interview pass that resolved player role, run structure, narrative delivery (conversations + a central Bitácora), the reactor as a managed room, the morale/death-spiral safety valve, onboarding, audio direction, and late-game escalation.

---

## 1. High Concept

### 1.1 Pitch
Sixty-plus years after the collapse of civilization, the atmosphere is poisoned and the world is drowned. Humanity survives in sealed, self-sustaining installations. The player commands one such installation and its small crew, keeping them alive by assigning them to work, rest, and crisis response while managing the station's vital systems and scarce resources. The drama is not *what* to do — it is *who* to spend, who to protect, and who to burn out for the crisis that hasn't arrived yet.

### 1.2 Core Fantasy
You keep a handful of the last people alive. Every person is a scarce, fragile, irreplaceable resource with a body, a personality, and a breaking point. You don't fight the world; you *endure* it, and you decide who pays the cost of enduring. The fantasy is **empathy through management** — caring about people by deciding how to spend them — not embodying a character.

### 1.4 The Player's Role *(resolved v0.2)*
The player is an **invisible hand / god-player**, with **no in-fiction identity** — the classic management-genre stance. There is no avatar, no AI, no named commander. The UI is still **diegetically dressed** as the station's control panel (see §9), but *you* are not anyone inside the story. (Earlier "you are the mind" phrasing was softened so it doesn't promise a diegesis the game won't deliver.) One consequence: the player begins as ignorant of the world as a newcomer — which the narrative exploits (see §11.3).

### 1.3 Naming
- **The game's title is "Long Now"** *(resolved v0.2 — working title).* Location-agnostic (covers submarine, bunker, oil platform, floating city, orbital station); not ocean-themed, not confinement-themed. The name (from the *Long Now* idea of long-term thinking) captures the core theme: **the place endures across generations while people pass** — the player is the continuity spanning a ~100-year reactor against ~30-year lifespans. *Caveats noted: doesn't translate cleanly to Spanish ("El Largo Ahora" reads opaque), shares its name with the Long Now Foundation, and is abstract rather than descriptive — revisit before final.* Prior candidates considered and dropped: Holdout, Lifeline, Tether, Mainstay, Homestead, Keystone, Steady State, Closed Loop, Make Do.
- **The initial station is named M.A.R.A.** (*Mobile Aquatic Research Array*) — a mobile submersible research station; **this is the name shown in the UI control panel** (§9.3). (The "HADES — Deep Station A-07" seen on an early mockup was a placeholder; the station is MARA.) The game's title "Long Now" is **not** shown as a station name in-fiction.
- Each future location has its **own name** and its **own UI skin** (see §9.2).

---

## 2. Design Pillars

1. **The decision is "who," not "if."** Inverted from *Reigns*: the player doesn't choose whether to face a situation — that's forced — but *who* to assign to it, trading off skills, state, and the looming next crisis.
2. **People are the scarce resource.** Crew are few, fragile, and have competing needs (work vs. sleep vs. food). Tension comes from too few bodies for too many needs.
3. **Consequences chain and persist.** State carries between events. The firefighter exhausted now is the wrong choice for the repair next. Nothing resets between turns except by deliberate recovery.
4. **Fail forward, never hard-block.** Failure redirects into worse-but-interesting states rather than dead-ends or instant game-overs. No event ever bricks the player.
5. **Cozy decay / hogar improvisado.** Warmth and humanity inside the rust. The station is a *home*, not just a shelter.
6. **The world lives in the data.** Content scales by writing events and rooms, not by engineering. Each crew member and event is a record; the engine reads availability, applies modifiers, resolves, and mutates state.

---

## 3. Setting & Tone

### 3.1 World
- **Time:** 60+ years after the collapse of civilization. Long enough that **no one alive remembers the old world.** The current generation was *born into* this world — for them, the drowned ocean, the O2 masks, and the rusted station are *normal*, not a remembered tragedy. They are **competent and adapted, not broken survivors.**
- **The atmosphere is contaminated** — unbreathable without supplemental oxygen. This globally justifies O2 as a managed resource across all locations.
- **All installations are sealed and hermetic.** Inside, crew breathe freely without masks; **masks/suits are only needed when going outside.** Going outside is therefore the natural moment of risk (radiation, danger).
- **Low life expectancy — emergent, not a hard cap (resolved v0.2).** There is **no coded age limit; nobody dies "because they turned 30."** Few live to old age simply because **surviving is so costly that the odds of reaching it are low** — in a brutal *save-yourself-who-can* world, the old can't keep up, so most don't get there. Reaching older age is a *statistical outcome* of having beaten the constant lethal risk, not a clock counting down. This still makes every death weigh, and the "grow a crew member you might lose at any moment" tension holds — but the threat is *risk*, not a fixed lifespan.

### 3.2 Tone
- **Hogar improvisado** ("improvised home"): warmth within decay. Plants, lamps, mugs, pinned photos, human texture amid the rust. The dirt is *cozy*, not threatening.
- Humans only. **No alien races, no robots, no monsters.**

### 3.3 Visual Identity ("style bible")
- **Medium:** hand-drawn illustrated / graphic-novel look. Visible ink linework, flat/cel coloring, painterly-but-clean shading. **NOT photorealistic, NOT 3D render, NOT anime/manga.** Reference tradition: European graphic novel / bande dessinée (Moebius, *Métal Hurlant*), gritty sci-fi comic / game concept art. Realistic human proportions.
- **Sketch consistency:** the whole image rendered at the same hand-drawn level — mechanical/metal parts must be *drawn and sketchy too*, never realistically rendered, shiny, or 3D.
- **Aesthetic:** "dirty atompunk" — retrofuturism *after the collapse*. The optimistic atomic-age future, now rusted, patched, surviving. Not cyberpunk (too clean/corporate), not full dieselpunk (too industrial/military). Everything has been **repaired at least once** (the golden rule of consistency).
- **Cybernetics as inherited craft:** prosthetics are made by mechanics, not surgeons — bolted plates, exposed pistons, brass gears, oil-stained, analog. No glowing tech, no neon, no circuitry.
- **Palette:** warm ochre/amber/rust (lived-in, safe zones) + cool teal-grey metal and rust-red danger (structural, exterior, peril). **Color temperature communicates mechanics:** warm = safe/habitable, cool teal + red = structural/dangerous.
- **Light:** low, warm, incandescent. Bare bulbs, vacuum-tube glow, grain, vignette.
- **Per-crew accent color:** each crew member has one saturated accent color (burnt-orange, crimson, teal-cyan, mustard, plum, etc.) for instant recognition in the UI. Keep all distinct.

### 3.4 Audio Identity *(added v0.2)*
**Adaptive hybrid** — sober immersion as the norm, emotion reserved for the peaks.
- **Ambient bed (the default):** the **station is the sound protagonist** — reactor hum, hull creaks, dripping water, the ocean's pressure outside, the muffled murmur of crew talking in the galley. This carries most of the game.
- **Sparse melodic accents:** music **rises only at key beats** (a death, a major discovery, bringing the Reactor to 100%, a crisis) and **recedes during routine.** Reference register: lonely/warm — analog synth, piano, strings — matching the "hogar improvisado" warmth and the "The Road" melancholy.
- Music should **never run continuously**; silence and room tone are deliberate tools.

---

## 4. Core Resources

### 4.1 Vital Systems (station-wide, shown as analog gauges in the header)
These rise/fall on their own and are *regulated* by the station. They are "vital signs," not countable stock.

| Resource | Role | At zero |
|---|---|---|
| **Oxygen (O2)** | The station-wide breathing balance: **100% = production meets consumption.** Falls only when consumption exceeds production (over-population or under-production). | **Whole-crew death at 0%** — if the indicator reaches 0%, the *entire crew dies at once* (this is the loss, §5.5). The **gradual fall** (rate scales with the deficit) is the player's warning window; the indicator shows a **critical highlight below 10%.** No per-character mask, no reserve tank. See §5.5. |
| **Power (Energy)** | The **root resource.** Feeds everything — the O2 plant and every production room (food, water, workshop, research). Its ceiling is set by the **Reactor** (see §6.6). | Not instant death, but **shuts down the O2 plant → O2 begins to fall → indirect death.** |
| **Hull / Structure** | **Threat regulator.** The more degraded, the higher the probability of disaster events (fires, collapses, leaks, O2 breaches). | Degrades → escalating spiral of disasters that feed each other. |

**Single loss condition (resolved v0.2; refined v0.4):** the game ends **only when the entire crew is dead.** The most direct path to that is **O2 reaching 0% — which kills the whole crew at once** (§5.5). Other crises (Power loss, a damaged O2 plant) are not themselves a game over; they are what *drives* O2 toward 0. When the last crew member dies the run is over and **everything resets to zero** — crew, expansions, upgrades — with no meta-progression (see §11.4). Because crew are a renewable resource (§5.5), a wipe should read as the end state of a **mismanaged O2 collapse** (or another catastrophe) the player had time to prevent — *"I caused this,"* never bad luck. The gradual O2 fall and the sub-10% critical highlight are what give the player that time.

**Causal cascade (key design):** Power is the root → if Power hits zero, **every production room halts** (O2 plant, Comida/food room, Water plant, Taller-Esclusa, Enfermería-Laboratorio research — *all goods production stops*, §6.6) → O2 begins to fall → at 0% the whole crew dies (§5.5). So an outage both **drains O2 and freezes the economy at once.** Hull governs the *rate of crises*. The **Reactor** sets the Power ceiling. This creates deferred-consequence decisions: neglecting Power/Reactor doesn't kill you today but dooms your O2 tomorrow.

### 4.2 Consumable Resources (countable stock, shown in the bottom bar)
Accumulated in units and spent. Not "vital signs." **Canon set confirmed (v0.2): Food, Water, Salvage, Med Supplies — exactly these four.** (No fuel consumable: the Reactor is upgraded by repairing modules, not refueled, §6.6. **There is no O2 reserve/buffer stock** — O2 is a live production-vs-consumption balance, never a counted tank, §5.5 / §14.1.)

| Resource | Use | Source |
|---|---|---|
| **Food** | Consumed by crew to reduce Hunger. | The **Comida room** (§6.7.1) — variant-dependent inputs: the *Huerto* (hydroponics/organopónico) needs **Water**; *Piscifactoría*, *Granja de insectos* and *Micocultivo* have other input profiles. |
| **Water** | Drunk by crew (part of Hunger/thirst) **and** input for growing food. | **Hybrid (resolved v0.2):** a **Water Plant room** produces it from Power (guaranteed baseline survival, never a cheap game-over), but is **inefficient/capped at low Reactor level** — *abundance* (more crops, more crew) must be earned by **upgrading the plant (→ more Power → Reactor upgrades, §6.6)** and/or **supplementing via exploration.** The room is **reskinned per location** (§9.2): desalinator (submarine), atmospheric condenser (bunker), ice processor (orbital) — same mechanic, different fiction. |
| **Salvage** | Raw materials for upgrades and repairs. | Exploration. |
| **Med Supplies** | Healing crew health. | Exploration. |

> **Note:** Food was moved *out* of the header gauges and *into* the consumables bar, since it is countable stock, not a regulated vital sign. The header shows only the 3 true vital systems (O2, Power, Hull).

### 4.3a Economic Balance Philosophy *(added v0.2)*
**Start comfortable, tighten with growth.** At the opening the economy is **net-positive** (production slightly exceeds consumption) so the player has room to learn during the bootstrap (§13.1b). But the equilibrium **re-tightens toward break-even as the station grows** — every recruited head adds O2/Food/Water consumption (§5.5) and every capacity upgrade raises Power demand (forcing Reactor upgrades, §6.6). So **the player's own ambition is what removes the slack**: a small station is safe and comfortable; a large one lives near the knife's edge. Tension is *self-generated by growth*, not imposed by a harsh start. (Concrete values are tuned in playtest via the real-minutes→Day multiplier, §12; the *relationships* below are the design intent.)

**Level-1 production ratio (resolved v0.2):** **one dedicated worker sustains ~3–4 crew** (the food and water chains). So a single gardener roughly covers the starting crew of 4 (§13.1), freeing the other 3 for repairs/upgrades/events — the concrete expression of the comfortable on-ramp. This matches the O2-plant level-1 cap of ~3–4 (§5.5). Adding crew beyond that **re-tightens** the ratio (more mouths than one worker covers → a second worker or an upgrade needed), which is exactly how growth removes the slack.

**Power is the exception (resolved v0.2):** while food/water/labor start comfortable, **Power starts at zero headroom** (Reactor 20% just covers essentials, §6.6). This is deliberate — not a survival threat, but the **first taught mechanic**: to expand anything you must upgrade the Reactor first. "Comfortable on-ramp" means *you won't die early*; it does **not** mean Power is slack — the Reactor loop engages from Day 1.

### 4.3 Radiation
**Not a permanent bar** — it is the *cost of going outside* (resolving O2 needs, exploration). Surfacing/exterior trips expose crew to radiation, damaging Health. This makes "I need O2/supplies but going out hurts my crew" a recurring dilemma.

---

## 5. The Crew

### 5.1 Three-Layer Character Model
Each crew member is a small living causal system: what they **feel** (State), what they **know how to do** (Skills), and what they **are** (Traits).

**A. State (mutable, changes every tick; interconnected in cascade)**
- **Hunger** — climbs on its own over time. Reduced by eating (consumes Food). *Prolonged* hunger → lowers Health. (Hunger + thirst combined.)
- **Energy / Sleep** — drains on its own over time. Restored by sleeping. Low Health caps maximum Energy.
- **Health** — drops *gradually* (illness, prolonged hunger) or *suddenly* (dangerous work like fighting fire; being a victim of an event like a collapse). Low Health → reduces Energy + lowers Morale.
- **Morale** — the "result" variable. **Rises** through normal healthy play: good Health day-to-day, rest, leisure time with others (galley/barracks), **completing tasks** (e.g. finishing an upgrade), and **returning from exploration with a big haul.** **Falls** from hunger, lack of sleep, low health, and tragic events. **Crucially, low morale only penalizes performance below ~30%** — above that threshold morale can dip and be *felt* narratively without yet hurting effectiveness, giving the player a recovery buffer. *(resolved v0.2)*
*(O2 is **not** a per-character stat — there is no personal mask reserve. O2 is a single station-wide balance; if it reaches 0% the whole crew dies at once, §5.5. Removed in v0.4 to avoid a redundant per-character stat that always read the same for everyone.)*

**Death → morale (resolved v0.2):** **every** crew death lowers the morale of **all** surviving crew. The magnitude is **modulated by each survivor's personality/Traits** (an Optimist absorbs it; a fragile temperament plunges). There is **no individual-relationship/bond system** — grief is a global, trait-weighted hit, in keeping with the matter-of-fact "The Road" tone (a death is a fact, not a melodrama).

> **Cascade:** time/work → hunger↑ & energy↓ → (if prolonged) health↓ → morale↓ → (below ~30%) refuses or performs badly. **Traits modify how heavily each arrow in this chain weighs.**

**Baseline metabolic tempo (resolved v0.2):** **moderate — a need takes ~2–3 in-game Days (§12) to go from full to critical** at a normal work pace, no intervention. This lets a crew member push through a short crisis, making recovery a *real decision* rather than constant micro. **Relative speed: Energy/Sleep fastest → Hunger middle → Health slowest** (Health only falls from prolonged hunger, illness, or danger). **Morale is the downstream result** of the other three plus events. (Tempo is in *fiction-Days*, independent of the real-time multiplier; exact rates tuned in playtest.)

**Performance-penalty model — body continuous, mind buffered (resolved v0.2):**
- **Physical states (Energy, Hunger, Health) penalize performance *continuously and proportionally*** — the lower the stat, the worse the task effectiveness, with **no grace zone.** A crew member who is somewhat tired or hungry is already a bit less effective; this is what makes Energy/Hunger the **actively-managed** stats (the player is nudged to feed/rest before things get bad).
- **Morale is the exception:** it only bites **below ~30%** (§5.2). Above that, morale can dip and be *felt* narratively without mechanical penalty — a deliberate recovery buffer, fitting its role as the slow "result" variable rather than a moment-to-moment dial.
- Conceptually: **the body degrades smoothly, the mind has slack.** All degradation stays *gradual and legible* in the bars (§5.3) so trouble is always visible coming.

**B. Skills (improve over time; the stats used for task assignment)**
- Repair, Strength, Intelligence, etc. Improve with use/training.
- *Tension with low life expectancy:* you invest in a crew member's growth, racing against the constant lethal risk that may take them at any time (not a fixed lifespan — see §3.1).
- **⚠ Prototype scope (resolved): the Skills layer is DEFERRED — *not* in the first playable prototype ("por ahora no").** The prototype crew model is **State (4 bars) + Traits only**; the character profile shows **no "Core Statistics" block**, and slot assignment is **skill-agnostic** (effectiveness comes from State + Traits). This is a temporary MVP cut, not a removal — Skills (and any skill-gated slots in §7.6) come back in a later pass. See §9.3, §13.3.

**C. Traits (fixed; define personality; modify how they interact with the system)**
- Traits are shown to the player as **simple visible bonuses** (e.g. "+10 Morale") on the recruitment/selection screen — for legibility and decision-making — **while also** modulating internal relationship curves underneath (e.g. an "Optimist" flattens the hunger→morale curve). **The sellable number is on the outside; the depth is on the inside.**
- Traits change *to whom you want to assign which task*, which is the central decision of the game. Examples of mechanical traits:
  - *Coward / fearful:* −performance on dangerous posts (fire, combat), but fatigues less on safe tasks.
  - *Leader:* raises morale of crew sharing a task.
  - *Lone wolf:* better at single-slot tasks, worse when sharing.
  - *Insomniac:* recovers little energy from sleep, but lasts longer awake.
  - *Steady:* fatigues slowly.
  - *Optimist:* morale holds under hunger.
  - *Resilient:* health decays slower.

### 5.2 Death Spiral Safeguard *(resolved v0.2)*
With four cascading state variables — and the new rule that *every* death dents everyone's morale — an unrecoverable spiral was a real risk. The safety valve is **two-fold and passive**, so a single death never snowballs into a guaranteed wipe:
1. **Abundant morale recovery vectors** (healthy day-to-day, rest, leisure company, task completion, exploration loot — see §5.1). Morale is *cheap to rebuild* through ordinary good play.
2. **A performance threshold at ~30%:** morale must fall *below* ~30% before it penalizes effectiveness. The zone above is a buffer that lets the player recover before any mechanical bite.

Rest/leisure rooms and good day-to-day Health are the player's explicit "bilge pumps." **The ~30% buffer is exclusive to Morale (resolved v0.2):** the physical states (Energy, Hunger, Health) instead penalize **continuously and proportionally**, with no grace zone — see the performance-penalty rule in §5.1. This keeps Morale forgiving (a slow, recoverable "mood") while making the body stats the ones the player must actively manage.

### 5.3 Refusal & Performance Rules
- Performance degrades **gradually and predictably** — *continuously* with fatigue/hunger/health and, for morale, once it drops below the ~30% buffer (§5.1 penalty model). Either way the player can *see* trouble coming in the visible state bars.
- **Refusal** to work only triggers at a **visible critical threshold**, never by surprise. The player must understand *they* led the crew member there, not bad luck. (Refusal is fail-forward: now that person *needs* rest, costing you a body when you can least afford it.)

### 5.4 Roster (initial designed crew)
Each ties to a mechanic. Distinct accent colors for UI recognition.

| Role | Name (example) | Mechanical hook | Accent |
|---|---|---|---|
| **Mechanic** | Jax Rourke | Repair; handmade mechanical prosthetic arm | Burnt-orange |
| **Guard / Officer** | Mira Koval | Strength/defense; ex-bounty hunter, scavenged riot-police gear | Crimson-red |
| **Researcher / Scientist** | Dr. L. Mercer | O2 & hydroponics systems; Intelligence; taped glasses, vials, notebook | Teal-cyan |
| **Grower / Farmer** | Nia Greene | Food + surface experience (heavier filtration mask; justifies exploration trips) | Mustard-yellow |
| **Cook** | Samir Ali | Food specialist working the Habitáculo's **Comer** action — serves more crew per Food unit and/or speeds meal throughput (**no cooking-morale system**; morale comes from the act of eating, §9.5) | Plum-purple |
| **Blacksmith** *(optional/later)* | — | Hull / heavy repair (overlaps Mechanic — give a distinct accent if used) | Ember-orange |

### 5.5 Population Cap, O2 Balance & Recruitment

**The model — soft cap as a breathing balance (resolved v0.2).** The O2 plant produces enough air for a **recommended headcount** set by its level (e.g. **L1 ≈ 4, L2 ≈ 6, L3 ≈ 8…**, tuned). This is a **soft cap, not a hard block**: the indicator sits at **100% when production ≥ consumption** (you breathe exactly what's produced). The player **can recruit above the recommended cap**, but does so against a **clear warning** that they're entering deficit.

**Hard maximum — 10 crew, always (resolved v0.4).** Regardless of plant level, upgrades, or anything else, the station can **never hold more than 10 crew at once.** This is the **theoretical ceiling of the O2 generator** itself — even a fully maxed plant tops out at 10 breathable headcount. The recommended headcounts above are the *soft* cap (where O2 stays at 100%); **10 is the absolute *hard* cap** the recruitment UI will never let you exceed. The crew strip in the HUD is sized to exactly 10 slots (§9.3).

**Deficit & the drop.** Whenever **consumption > production** — either by **over-population** (too many heads) or **under-production** (plant damaged by an event, or Power = 0 shutting the plant down, §4.1) — the station-wide O2 indicator **begins to fall** from 100% toward 0%.
- **Drop rate scales with the deficit (resolved v0.2):** a tiny overage (1 head over) drains very slowly; a destroyed plant or Power-out (production → 0) drains fast. Time-to-zero **T is a function of the deficit size**, not a constant.
- **Single global indicator** — one O2 reading for the whole station, not per-room.

**Recovery.** If the cause is removed before serious harm (plant repaired, Power restored, or population reduced so consumption ≤ production again), the indicator **climbs back to 100% gradually** (not instant). The crisis is survivable if addressed in time.

**At 0% — whole-crew death (resolved v0.4).** When the global O2 indicator hits 0%, **the entire crew dies at once** — this is the single loss condition (§4.1). There is **no per-character mask, no auxiliary O2 reserve, and no staggered die-off**: the model is deliberately simple.
- **The margin is the fall itself.** The player's entire window to act is the **gradual descent** toward 0 (rate scales with the deficit, above) — fix the deficit and O2 climbs back. There is no second buffer beyond that.
- **Critical highlight below 10%.** To keep the margin legible, the O2 indicator switches to a **critical visual state under 10%**, signalling "you are about to lose everyone."
- *Why this replaces the old mask model:* a per-character "Mask O2 %" stat always read the same for everyone (redundant), and an auxiliary reserve was just the same delay dressed up as a second tank — so both were removed. A clean "0% = wipe, but you saw it coming" is simpler and reads as the player's own mismanagement.

**No manual "sacrifice" button (resolved v0.2).** The player **cannot directly eject or kill** a crew member to rebalance. To deliberately reduce population the options are slow/diegetic: **let someone starve** (takes Days), **let them collapse from exhaustion** (fewer Days), some combination, or **drop them off at a port** during a docking encounter (a clean, humane exit — ties to recruitment/docking events, §9.3/§10). This keeps over-recruiting a real, hard-to-undo commitment.

**Why this design.** It kills the recruitment snowball, makes each new head a genuine "worth the air and the slot?" decision, gives the base-expansion layer its first concrete use case (upgrade O2 vs. other priorities), and turns an O2 failure into a tense, *recoverable* decision window instead of an instant loss. **Each crew member consumes Food and O2 every Day** — the per-head cost is the balance lever that stops "more people" from always being correct.

**Consumption counts only the crew ABOARD — exploration is an O2 relief valve (resolved v0.5).** O2 consumption is computed over the crew **physically inside the hull**: anyone **away on an expedition is off the books** (they carry their own provisions, §10.1) and **does not draw station air.** This makes **sending people out a deliberate survival lever during an O2 deficit** — most importantly when the **O2 plant is broken/offline at the cold open** (§7.9): launching a 2-person expedition removes **two consumers**, slowing the fall toward 0% and **buying time to rebuild the plant.** The drop rate (§5.5 "drop rate scales with the deficit") is therefore a direct function of *how many heads are breathing right now* versus production — so the player can flatten the curve either by **raising production** (repair/upgrade the plant) **or by lowering consumption** (send crew exploring, or reduce population). This couples the exploration loop (§10) to the O2 economy as both a *cost* (fewer hands at home, §10.4) and a *benefit* (fewer mouths on the air). *(Prototype model: each aboard crew consumes a fixed O2/tick; a running plant tops the air back up to a level-scaled cap; with the plant down, O2 only falls, at a rate proportional to the aboard headcount — §14.1.)*
**Recruitment via encounters:** docking with modules / other stations during play. From candidates that appear, the player may add **up to 2 of 3** — forcing evaluation and leaving someone behind. Players can also **stand down / drop off at a port / replace** crew, including replacing the dead. The crew is a renewable resource.

**Plant damage as a deficit trigger:** if the O2 plant is damaged in an event, production drops *below* current consumption → the deficit/drop described above begins. This is strong, recoverable dramatic material — a **race to repair before O2 hits 0% and the whole crew dies** — rather than a forced "pick who dies" prompt.

---

## 6. Locations / Rooms

### 6.1 Structure
- The station is a set of **rooms/locations**, listed in the right sidebar, **numbered**, with **locks** on undiscovered/unbuilt rooms. More rooms are discovered/built over time.
- The player does **not navigate between separate scenes**; everything happens on one control panel. The central view *renders* the selected context (see §9).

### 6.2 Two Slot Groups Per Room
Each room has **two separate slot groups**:
- **Work Slots** — operate the room's function (e.g. tend the garden). Expand with room level.
- **Upgrade Slots** — dedicate crew to raising the room's level (1 slot, or 2 at advanced levels). Separate from work slots, so operating and upgrading can run in parallel.
- Consequence: upgrading *while* operating consumes more bodies at once — upgrades are a costly investment in *people*, not just resources.

### 6.3 Work Progress
- Rooms with working crew show a **continuously filling progress bar** (e.g. growing one Food unit takes N time; repairs likewise).
- **Interrupting/removing a crew member PAUSES progress — it is never lost.** The bar freezes and resumes when someone returns to the post. (Single, universal rule.)

### 6.4 Upgrade Cost
- Upgrades require **time with someone working** (upgrade-slot progress bar) **AND consume materials** (Salvage; possibly Med/Water for specific upgrades).

**Cost curve & dominant resource (resolved v0.2):**
- **Escalating curve:** each level costs **more than the last** (e.g. ~×1.5 per level). Early upgrades are attainable; high tiers are serious investments — this curbs late-game runaway and reinforces the tightening economy (§4.3a).
- **Salvage-dominant:** the **dominant cost is materials (Salvage), not time.** Because Salvage comes from **exploration** (§10.1), upgrading **pushes the player to send crew outside** from fairly early — binding the progression/Reactor loop (§6.6) directly to exploration and its double-edged risk (§10.4). Time/bodies in the upgrade slot are still required, but materials are the binding constraint.
- **Bootstrap Salvage (resolved v0.2):** since even the first Reactor upgrade is Salvage-dominant yet "upgrade the Reactor" is taught on Day 1 (§13.1b), the **starting derelict carries a small initial Salvage stash** — diegetically sound (there's scrap aboard any wreck) and sized to cover **exactly the first Reactor upgrade.** This keeps the opening frictionless and lets the tutorial teach *only* "upgrade the Reactor" without forcing exploration yet; exploration is introduced afterward, as the natural source of Salvage for the *second* upgrade onward (§10, §13.1b).

### 6.5 Example Rooms
The canonical set is **7 room types** (full detail in §6.7.1): **Generación de comida** (variants: Huerto / Granja de insectos / Piscifactoría / Micocultivo), **Generación de O₂** (variants: Algas / Electrólisis), **Generación de H₂O** (single = Desalinizadora at this location), **Habitáculo** (merges sleep + eat: assign a crew member and pick Dormir or Comer — eating consumes 1 Food, restores Hunger, and the act itself raises Morale, **no cooking mini-system**), **Enfermería-Laboratorio** (heal + research; variants Ingeniería / Biológico), **Taller-Esclusa** (repair + exploration; specialization Expedicionaria / Industrial), and **Energía / Reactor** (Power ceiling — see §6.6). The **O2 Plant** *is* the O₂ room type; the **Water plant** *is* the H₂O room type.

### 6.6 The Reactor *(added v0.2)*
The Reactor is a **room/zone like any other** — you assign crew to it, it can break (a high-stakes Power crisis, cascading to O2 per §4.1), and it is **upgraded** through work + materials.
- **It sets the Power ceiling** for the whole station. Distinct from the **O2 Plant**, which sets the population cap and produces O2 (§5.5). Two separate upgradeable systems.
- **It is NOT a death clock.** The "reactor lasts ~100 years" idea is **ambient flavor**, not a countdown. ("100%" now means *capacity*, not *life remaining*.)
- **Starting state = 20% capacity, near-zero resources.** The crew **find the derelict submarine adrift, board it, and discover it alongside the player** — this diegetically frames the "everything resets to zero" rule (§4.1 / §11.4) and the bootstrap tutorial (§13.1). The one exception is a **small Salvage stash aboard the wreck, sized to fund exactly the first Reactor upgrade** (§6.4) — just enough to teach the upgrade loop before exploration is introduced.
- **The economy loop it drives:** raising any production capacity (e.g. upgrading the water desalinator) **increases Power demand**, which **forces a Reactor upgrade** (repair a module → higher level). The Reactor is therefore the pressure that paces the whole upgrade tree, and the engine of self-imposed late-game risk (§11.5-B).
- **Starting Power budget = zero headroom (resolved v0.2).** At Reactor 20% the available Power **just covers the essentials** (O2 plant, Water plant, basic lighting/cooking) with **no spare**. Any new room or upgrade therefore requires **upgrading the Reactor first** — which makes *"upgrade the Reactor"* **the first mechanic the bootstrap tutorial teaches** (§13.1b). Note this is *not* a survival threat (food/water/labor start comfortable, §4.3a); it's a guided first objective that introduces the core upgrade loop on Day 1.

**Reactor failure — a normal event, lethal only through the cascade (resolved v0.2, §15 #12).** A Reactor breakdown is an **ordinary event** (§7) with slots and consequences — it can be as small as a **single-crew repair task** ("the reactor tripped; send someone to restart it"). Its danger is **systemic, not a direct kill:** the instant it goes down, **Power stops → the O2 plant stops → the O2 deficit cascade begins** (§5.5 / §4.1), and that clock **keeps ticking even while a crew member is repairing it.** The threat is therefore the *race* — restore the Reactor before station O2 **drains to 0%, at which point the whole crew dies at once** (§5.5 / §14.1). All lethality flows through the O2 balance — the reactor never kills directly — which keeps it consistent and fair while still being the **most dangerous crisis in the game** because it attacks the root resource (Power). A whole-crew loss from a reactor failure is possible, but only as the *end state of an O2 collapse the player had time to prevent* (the slow fall + sub-10% highlight, §5.5), not a special instant multi-kill at the moment the reactor trips.
- **A Power outage freezes ALL production (resolved v0.2).** It isn't only the O2 plant that stops — **every production room halts** while Power is down: the Comida room (no Food grown), the Desalinizadora (no Water), the Taller-Esclusa (no repair/craft progress), Enfermería-Laboratorio research, and any other goods-producing room. Nothing is produced until Power is restored, so an outage **compounds**: O2 starts draining *and* the whole economy stalls at once. This is the clearest expression of "Power is the root" (§4.1) — restoring the Reactor is always the top-priority response.
- **Emergency lighting (flavor, explicitly out of scope).** During an outage the main lights cut and only **dim emergency lighting** remains — justified in-fiction by **low-intensity nuclear cells that never deplete or fail** (in the golden age, "humanity's best invention"). This is **purely atmospheric/presentational** (the screen isn't pitch-black; audio shifts to the tense bed, §3.4) and is **not modeled as a resource or mechanic** — there is no emergency-power budget to manage.

### 6.7 Room Types, Variants & Specializations — "Bifurcations" *(reworked v0.4)*
The **replayability & emergent-balance pillar** (inspired by **Kingdom Rush** tower branches). The station is built from a **small fixed set of room types** (§6.7.1). On top of its base function, a room type can offer up to **two layers of choice**:

- **Variant** *(build-time identity).* For room types that have them, you choose **which kind of room to build at unlock** — the space is **laid out completely differently**, leans on a **different root resource**, and unlocks a **different event set**. Mutually exclusive; a total commitment. *Available variants can be **location-gated*** — e.g. the submarine **MARA**'s only Water option is the **Desalinator**, whereas a mountain-bunker location would instead offer **ice-melt / vapour-capture** (§11 multi-location).
- **Specialization** *(level-gated sub-path).* **Optional per variant.** When a variant has them, reaching a **gate level** lets you **choose ONE specialization**, which then **levels up on its own track.** **Most variants have no specialization at all — just ordinary progressive level-ups.** Only a few fork (e.g. *Piscifactoría* chooses *selectiva vs. arrastre*; *Huerto* chooses *hidroponía vs. organopónico*). The rest — *Granja de insectos*, *Micocultivo*, *Algas*, *Electrólisis*, and both Enfermería-Laboratorio variants — only level up.
- **Levels** apply to *every* room regardless of variant/specialization (faster / more capacity, §6.2–§6.4).

**Single-type rooms** have none of the above — only levels (the **Reactor**, the **Habitáculo**, and — at this location — the **Water plant**).

**The model:**
- **Variant offer — "show 2, pick 1":** when a type has **≥3 variants**, the build menu presents **2 biased-random candidates** and you pick 1 (the rest are **withheld that run** — the variety lever, reusing §5.5); with exactly **2 variants** both are shown (a free pick).
- **Specialization choice — pick 1, then level it (resolved v0.4):** at the gate level you **freely choose 1** of the variant's specialization options (usually 2) and it then **progresses on its own levels.** No withholding here — the run-to-run variety already comes from the variant layer.
- **Irreversible for the run:** variant *and* specialization lock once chosen; the **full reset each run (§11.4)** is the second chance at a different build.
- **Lock per function:** one method per good (one Food room, one O2 room…), not "build both" — the source of the painful decision and the distinctive dependency web.
- **Events are branch-gated (data-driven):** the §7.6 `conditions` tree reads which variant/specialization you hold, so each brings **its own event set** — content scales by authoring records (pillar §6).
- **Not inherited across runs (§15 #16):** years pass between crews → specialized rooms **decay/break down** → the derelict found at ~20% presents its rooms as **ruined/generic again** → you **re-choose afresh** (§6.6/§11.6).

### 6.7.1 Room Catalog *(reworked v0.4)*
The **7 room types**. *Variant* = build-time identity (show 2 / pick 1); *Specialization* = level-gated sub-path (pick 1 → levels); **"—"** = none (single type, levels only). Resources: Food / Water / Salvage / Med + roots Power / O2 / Hull (§4.2).

**1 · Energía (Reactor)** — *single type.* No variant, no specialization. Levels raise the **Power ceiling** (§6.6). Excluded from bifurcation by design (§15 #15).

**2 · Generación de comida** — *4 variants.*
| Variant | Consumes | Specialization (pick 1 → levels) | Event flavour |
|---|---|---|---|
| **Huerto** (vegetal) | Water + light | **Hidroponía** (water-based, no soil; +yield, +Water) · **Organopónico** (soil/compost in pots; −Water, uses biomass) | drought, crop blight |
| **Granja de insectos** | Water (light) + waste | — *(levels only)* | infestation, contamination |
| **Piscifactoría** | Power + Salvage (no Water) | **Pesca selectiva** (sustainable, steady, fewer events) · **Pesca de arrastre** (big hauls, +exterior-risk, depletes the ground) | nets/sea hazards, exterior contact |
| **Micocultivo** (hongos) | low light + biomass | — *(levels only)* | spore contamination |

**3 · Generación de O₂** — *2 variants, levels only (no specialization — resolved v0.4).*
| Variant | Consumes | Specialization | Event flavour |
|---|---|---|---|
| **Algas** | Water + light | — *(levels only)* | toxic bloom, culture crash |
| **Electrólisis** | Power (heavy) + Water | — *(levels only)* | electrical fault, H₂ explosion |

**4 · Generación de H₂O** — *single type at this location.* The submarine MARA has only the **Desalinizadora** (Power; high throughput, maintenance-prone; events: fouling/scaling, pump failure). **Specialization deferred** (levels only for now). *Location-gated:* other locations replace it entirely (mountain bunker → **ice-melt**; **vapour capture**; etc.) — those become selectable variants only when that location is in play (§11 multi-location).

**5 · Habitáculo** (Barraca + Comedor) — *single type.* No variant/specialization. **Multi-action:** when you assign a crew member you pick the action — **Dormir** (recovers Energy) or **Comer** (consumes 1 Food → recovers Hunger + raises Morale, §9.5). Levels raise capacity/recovery rate. *(Door left open to add a third "leisure/rest" morale action later.)*

**6 · Enfermería-Laboratorio** — *2 variants, levels only (no specialization — resolved v0.4).* Base function **always**: heal crew **+** research upgrades. The variant sets the **research bias**; the two variants already give enough divergence, so neither forks — they just level up.
| Variant | Bias / healing | Specialization | Event flavour |
|---|---|---|---|
| **Ingeniería** | O₂/Water/Reactor efficiency; heals *adequately* | — *(levels only)* | equipment failure |
| **Biológico** | medicine/crops/disease; heals *better* | — *(levels only)* | outbreak, contamination |

**7 · Taller-Esclusa** (repair + exploration) — *no variants; one specialization fork.* Base function **always**: launch expeditions **and** repair / fabricate / upgrade (technical upgrades originate here). **Specialization (pick 1 → levels):**
| Specialization | Effect |
|---|---|
| **Expedicionaria** | better suits, bigger packs → **+loot**; safer / longer expeditions |
| **Industrial** | **+room resilience** → ↓ probability of catastrophic events; faster incident repair; cheaper/faster upgrades |

*(You keep doing **both** activities either way; the specialization only tilts the bonuses.)*

> **Emergent interlock (why variants matter).** Because each Food/O₂ variant leans on a different root resource, the *combination* defines the run. Water-heavy picks (Huerto-Hidroponía + Algas) on the fixed Desalinator create a **Reactor/Water bottleneck**; the Salvage-leaning Food pick (Piscifactoría) **frees Water** but makes the run **exploration-hungry**, and an Electrólisis O₂ plant is **Power-thirsty**. Same goods, different failure modes and event sets.

---

## 7. Events

### 7.1 Philosophy
- **All slots are optional with differentiated impact.** No event hard-blocks the player. You can ignore an event entirely, half-cover it, or commit fully. What changes is *how much damage you take* based on how many slots you left empty.
- Each event is a **triage** question: "how much of my scarce crew is this worth, knowing another crisis may come?"

### 7.2 Resolving a Crisis Without Free Hands
- When a crisis hits and no one is free, the player **interrupts (pauses) ongoing tasks** to reassign crew. Pulling someone off an O2-plant upgrade or out of sleep costs you (paused progress; the sleeper enters the crisis exhausted and likely performs badly).
- The question shifts from "do I have free hands?" to "**what am I willing to interrupt?**" Every body is already doing something valuable.
- If no one is assigned at all, the event simply **deals its damage** — the player did this to themselves. Fair, not cheating.

### 7.3 Example: Fire
- Posts: **(1)** machine room — operate water pumps; **(2)** at the fire — extinguish; **(3, optional)** tend the wounded.
- If no one tends the wounded: injured crew lose **double** Health, or potentially **die** (resolved by the hidden roll). Fighting the fire is dangerous work that costs the firefighter Health.

### 7.4 Simultaneity
Two crises can occur at once, creating more posts than crew — forcing the player to leave something unattended. (Combined with fatigue and limited time, this is the core scarcity engine.) Multiple events can sit **latent in the left panel at the same time** (§7.6) — that *is* the simultaneity mechanic in practice.

### 7.5 Event Taxonomy *(added v0.2)*
Four families, all sharing the same slot/resolution machinery but differing in trigger and stakes:
- **A. Internal crises** — disasters inside the hull (fire, leak, structural collapse, O2-plant failure, reactor malfunction, electrical failure, illness/contamination). Triggered by **Hull degradation** (§4.1) + time escalation (§11.5) + as **chained consequences** of other events. Triage with slots; **ignoring them costs** (damage / escalation / chaining).
- **B. External encounters** — surfaced by the **radar** (§9.3): exploration opportunities (loot), docking-for-recruitment (§5.5), docking-for-expansion (§11.1), and incoming threats (early warning that becomes an internal crisis if ignored). Mostly **opportunities — ignoring a non-threat just lets it expire harmlessly.**
- **C. Canon / narrative events** — story milestones (§10.2, §11.2); feed the Bitácora (§11.3). Triggered by room-level thresholds / every N days.
- **D. Personal / crew events** *(new this version)* — centered on a single crew member (a morale breakdown, illness, a request, a skill-mastery milestone). Add human texture to "people are the resource." Triggered by crew state (e.g. morale below the ~30% threshold) or chance.

### 7.6 Event Data Schema (technical) *(added v0.2)*
An event is a **data record** (pillar 6 — "the world lives in the data"). Authoring content = writing records, not code. Fields, grouped:

**1. Identity & presentation:** `id` · `family` (A/B/C/D) · `title` · `description` · `image`/`background` (a room background or its own, §9.3) · `severity` (alert styling).

**2. Trigger (spawn conditions):**
- `sourceType` (how it surfaces / categorizes): `hullProbability` | `timer` | `radarContact` | `crewState` | `canonMilestone` | `chained`.
- `conditions` — **a boolean expression tree of state predicates** that *gates eligibility* (the event can only fire when this evaluates `true`). Predicates can read **any game state**: room/reactor levels (`room.garden.level >= 2`), crew count (`crew.count <= 3`), stat thresholds (`crew.any.morale < 30`, `crew.avg.health < 50`), resources (`hull < 40`, `power < 20`), `day >= N`, flags (`flag.metMiners == true`), etc. Predicates combine with **`AND` / `OR` (and `NOT`), nestable** — so authoring expresses arbitrarily specific situations as pure data.
- `probability` — once eligible, the **chance the event fires per evaluation cycle** (keeps eligible events from all firing at once; tunable per event).
- `weight` — optional relative priority when several eligible events compete in the same pool.
- `cooldown` (days before it can recur) · `oncePerRun` (bool).

**3. Timing:** `warningTime` (lead from alert to impact; 0 = instant) · `responseWindow` = **time X to attend before it culminates** · `tickInterval` + `tickEffect` (**damage applied per tick while unresolved** — the urgency engine) · `escalateAfter` → `escalateTo` (mutates to a worse event if neglected).

**4. Slots (assignable posts — a temporary room):** array; each slot has `relevantSkill` (Repair/Strength/Int/…) · `capacity` (default 1) · `optional` (always true, §7.1) · `assignedCrewEffect` (**the cost of manning it** — e.g. the firefighter takes Health damage) · `contribution` (how much it feeds the objective).

**5. Objective / target:** `goalType` = `progressBar` (reach N work units) | `holdTime` (survive the duration) | `thresholdSlots` (fill ≥ N) · `targetValue` · `partialImpactModel` (**damage scales with empty slots** — differentiated impact, §7.1).

**6. Resolution (hybrid, §8):** `effectiveness = Σ slots (Skill − state penalties ± trait mods)` → `hiddenRoll` (narrow band) → `outcomeTier` = `success` | `partial` | `failure`.

**7. Outcomes (one set per tier):** `resourceDeltas` (O2/Power/Hull + consumables) · `crewEffects` (Health/Energy/Morale/skill XP) · `stationEffects` (room level up/down, unlocks) · `lootTable` / `loreEntry` (feeds the Bitácora) / `recruits` (family B) · `spawns` (follow-up event ids → chaining) · `flagsSet`.

> **Worked example — Fire (§7.3):** family A · trigger `hullProbability` (prereq day ≥ X) · timing: warning 0, tick = Hull− and Health− to the firefighter, `escalateAfter` → "Hull Breach" · slots: (1) machine room — `Repair`, feeds extinguish rate; (2) at the fire — `Strength`, feeds rate **+ `assignedCrewEffect` Health−**; (3, optional) tend wounded — `Int/medical`; if empty → injured lose **double** Health or **die** (hiddenRoll) · objective `progressBar` (extinguish), `partialImpact`: empty slots → more Hull/Health loss · outcomes: success = fire out, some Hull−, firefighter Health−; ignored = Hull−− + injuries/deaths, may `spawn` a leak.

### 7.7 Event Lifecycle & the Left Panel *(added v0.2)*
1. **Trigger → notification.** The radar blinks/beeps (external) or an internal alert fires; the event is created and **listed in the left panel (ALERTS, §9.3) as *latent*.**
2. **Open it.** Clicking the event **renders it in the central view** (like switching to a temporary room), where the player **assigns crew to its slots** — or, for some events, makes a simple **yes/no choice with no assignment**.
3. **Latency & de-prioritizing.** The player may choose **not** to act; the event **stays visible and latent in the left panel** and its `responseWindow` (time X) counts down. Multiple events can be latent at once (§7.4).
4. **Resolution or culmination.** If worked, it resolves per §8 (success/partial/failure). If **time X expires unattended, the event *culminates* — and the cost of ignoring depends on family:**
   - **Internal crises (A):** culmination **fires the bad outcome and may `spawn`/`escalate` further events** (an ignored fire breaches the hull, etc.). **Ignoring costs.**
   - **External opportunities (B, non-threat):** culmination just **expires harmlessly — the event disappears.** A missed opportunity, no penalty (e.g. "mining station detected, 3h to go, else you move on").

### 7.8 The Event Engine *(added v0.2)*
A single **event engine** drives all spawning — the concrete embodiment of pillar 6 (§2) and the data-driven engine in §14. On a regular **evaluation cycle** (every tick / N seconds of game time) it:
1. Iterates **every event definition** in the data.
2. Skips any on `cooldown` or already used (`oncePerRun`).
3. **Evaluates each event's `conditions` tree** against current game state; keeps only those that pass (eligible pool).
4. For each eligible event, **rolls its `probability`**; on success it spawns (or, when several compete, picks by `weight`).
5. Spawns the event into the **latent left-panel queue** (§7.7) and, for external ones, pings the **radar** (§9.3).

Engine-level controls to keep pacing sane: a **max-concurrent-events cap** (avoid flooding the left panel), optional **per-family pacing** (don't stack too many internal crises at once), and a **global escalation multiplier** that raises probabilities over time (the §11.5-A late-game pressure). Because conditions + probability are pure data, the engine never changes — **all content and difficulty live in the records.**

### 7.9 Prototype Event Set — Vertical Slice *(resolved, prototype)*
The schema/engine (§7.6–§7.8) is complete; the first playable authors **three concrete events** that exercise the whole loop and **both event bodies** (slots + cards, §9.3).

**Cold-open O₂ state (resolved).** The **O₂ plant pre-exists in the derelict but starts damaged/offline** — the station O₂ indicator **opens critical (below 10%, highlighted in the header, §9.3) and falls slowly** (§5.5). The opening objective is to **reactivate/develop it**, not build from nothing. This avoids both an instant 0% wipe and any reintroduction of the removed mask/reserve concept (#52). Crew flavour references the **station air going stale**, never personal mask O₂.

**Event 1 — Fire (family A · crisis · slots body).** Authored directly from the §7.6 worked example: `hullProbability` trigger, tick = Hull− and firefighter Health−, `escalateTo` Hull Breach; posts (machine room / at the fire / tend wounded); `progressBar` objective; **qualitative stakes + hybrid resolution** as specified in §9.3.

**Event 2 — Build / reactivate a room (choice · cards body).**
- **Triggers (mixed):**
  - **`crewComment`** — a crew remark raises a need. The **bootstrap O₂ event** is this kind: a crew member says *the air is going stale and the O₂ plant must be brought online*, steering the diegetic onboarding so the **first build is O₂**.
  - **`itemFound`** — some rooms need a **specific item found only in exploration**; when an expedition returns there is a **probability** it carries that item, which **fires this event** (the notification shows the item's image).
- **Format:** a **notification rendered in the central view** — **image + title + text + a single button** ("Construir / Reactivar").
- **Behaviour on the button (new mechanic — *build then develop*):** it **unlocks the room and moves the player to it, but with NO assignable Work Slots yet — only the development (Upgrade) Slots are active.** The room must be **developed/built up through those slots** (crew + time + Salvage/the item) before its **Work Slots come online** and it can produce. If the room **has variants**, the **"show 2, pick 1" variant cards** appear in that development area *first* (reusing the specialization-card pattern, §9.3) — pick one, then develop.

**Event 3 — Exploration opportunity (family B · external).** A **`radarContact`** surfaces on the sonar (§9.3). **Both launch paths open the *same* expedition interface (§10.2):** (a) **manual** — clicking the **Taller-Esclusa**; (b) **this radar event**. The launch interface lets the player **select the crew and the time they'll be out**, showing the **resource consumption scaled to that duration** in real time; **maximum duration is capped by current base supplies — Food, Water and Med** (§10.3). **Crew per expedition starts at 1 and is expandable via Taller-Esclusa upgrades** (§10.3 / Expedicionaria, §6.7.1). Crew leave (their cards flip to the "EXPLORING" state, §9.3) and return with the mixed-bag loot (§10.1) — possibly the `itemFound` component that fires Event 2. **Ignoring it is harmless** — a family-B opportunity simply **expires** when its window passes (§7.7).

---

## 8. Task Resolution

### 8.1 Hybrid (formula + hidden roll)
- A **deterministic formula** computes effectiveness: `relevant Skill − state penalties (fatigue, hunger, low health) ± trait modifiers`.
- A **hidden probability** then mutates the result. The player's decisions clearly matter (rested expert = better odds), but nothing is guaranteed. "Justo pero aleatorio" (fair but random).

### 8.2 Roll Philosophy
- **Narrow randomness ("skill is king"):** the roll only nudges the result slightly. A rested expert *almost always* succeeds (fails only on a rare bad day); an exhausted novice *almost always* fails. The player feels in control; randomness is flavor.
- **No visible dice.** The roll happens behind the scenes — no probability numbers shown. The player intuits odds by *reading the crew's visible state bars*.
- **Frequency of upset:** "**sometimes**" — the result contradicts the player's decision occasionally, creating memorable moments of luck, never frequently.

### 8.3 Critical Consequence of Hiding the Roll
Because odds are hidden, the **state bars and traits must be highly legible** — they are the player's only window into their chances. Visible, clear state is the price of hiding the dice.

---

## 9. UI / UX

### 9.1 Overall Approach
- **Overlaid HUD** (not fully diegetic). A control panel layered over the world.
- **Functions like a control panel but is dressed as the world:** bars become needle gauges/manometers; buttons become toggle switches and riveted plates; HUD background is painted metal under bulb-light, not flat black. Same information, diegetic clothing. *(Reference: FTL console, Fallout Pip-Boy.)*
- **No navigation between separate scenes.** A single background (the station). The background changes **only during an event tied to a location** (e.g. fire in the garden → background becomes the burning garden). One background per location/event, swappable behind the same HUD.

### 9.2 Per-Location Skinning (StarCraft-style)
The UI **reskins** per location: same layout, same positions, same execution — only the *frames, icon style, and aesthetic* change between locations (submarine vs. bunker vs. orbital station). The "look and feel" changes; the mechanics and layout do not.

### 9.3 Screen Layout (PC / desktop) — base direction confirmed
**Header (top):** *(confirmed for prototype)*
- Station name + subtitle — **"M.A.R.A. / Mobile Aquatic Research Array"** (the HADES name in the mockup is a placeholder, §1.3).
- **3 vital-system analog needle gauges:** Oxygen, Power, Hull Integrity. (Food removed from here.) **The O₂ gauge shows a critical highlight when it drops below 10%** (the v0.4 O₂ model's warning margin — §4.1/§14.1; whole-crew death at 0%).
- Day/Time readout.
- A **sonar/radar dial — the diegetic alert hub for everything outside the hull (resolved v0.2).** It is a **notification system, not a navigable map.** When an external event arrives, the dial **blinks red and emits beeps** (part of the audio alert layer, §3.4) and the corresponding **event surfaces** (rendered in the central view / event system, §7, §9.3 "Event received"). Event types it signals: **exploration opportunities, docking-for-recruitment contacts (§5.5), incoming threats (early warning feeding §11.5 escalation), and base-expansion docking (§11.1).** Contacts arrive both **ambiently** (random "something's out there" pulls) and at **canon milestones** (§10.2). The player doesn't pick coordinates — they *respond to the alert.* (Complements the interior ALERTS box; the radar is specifically the *outside* world's attention-getter.)

**Crew Strip (below header):**
- Horizontal row of crew cards. Each card: **hand-drawn portrait on the LEFT, four status bars on the RIGHT** (Energy, Hunger, Health, Morale). Each crew has a distinct accent color.
- **Card content (prototype, resolved):** portrait + name + the 4 bars + accent color, **plus a small current-activity indicator** (which room/action they're assigned to, or *idle*) so the player sees at a glance where everyone is.
- **No special critical-state highlighting (prototype, resolved):** the card does **not** add borders/blinks/icons for low stats — **the bar colours alone communicate state**, and serious situations surface through **ALERTS** and **personal events** (§7.5-D). Consistent with the minimal room-row treatment.
- **The strip is divided into exactly 10 slots — the hard crew cap (§5.5).** Cards fill from the left; unused capacity is simply **empty space** (no "+" placeholder). Beyond 10 is impossible by design.
- **Single expedition party:** all crew out exploring **leave and return together**, so they share **one identical return countdown** (there is only one expedition at a time).
- **Exploring (away) state:** card shows **portrait + name + "EXPLORING" + a countdown timer** to return; **status bars are hidden** (they aren't in the base, not breathing O2 or eating from base stores); the **portrait renders in black & white (grayscale)** to mark that they're away. **Opening an away crew member's profile shows their State bars **greyed-out / unknown** — you can't see their condition while they're off-station — plus the return countdown.** *(If the crew member dies on the expedition, this resolves on return — see §10.)*

**Right Sidebar — Station Rooms:**
- Vertical list of rooms that **grows over the run: only built/discovered rooms appear** (a new row is added when a room is built or discovered — the list is *not* a fixed catalogue of all 7 types with locked placeholders).
- **Build/unlock-a-new-room flow (prototype, resolved): mixed, event-driven.** **Some rooms exist from run start** (the reactivated core of the ~20% derelict — Reactor, O₂, Habitáculo, etc.). **New rooms arrive as events** (§7): an event fires with a message and **presents the room type(s)/variant(s) to choose** — the variant **"show 2, pick 1"** decision (§6.7) happens **inside that event prompt.** Once accepted, the room is added to the sidebar list. There is **no free build-anytime button**; expansion is delivered through events (ties to §7 / §11.1).
- **Row anatomy (prototype, resolved):** each room row shows, top to bottom: **room NAME → the WORK SLOTS list (each slot shown occupied or empty) → a visual DIVIDER → the UPGRADE SLOTS.** No level/production readout on the row itself — that detail appears in the central view when the room is selected. (The leading correlative number from the HADES mockup is dropped unless reintroduced later.)
- Filled slots show a tiny crew portrait; empty slots are open frames; locked slots show a padlock.
- **Two distinct slot groups (prototype, resolved):**
  - **Work Slots** = crew operating the room's **base function** (production: grow Food, make O₂, etc.).
  - **Upgrade Slots** = a **separate** set where the player assigns **one or more crew to *work on upgrading / levelling up* the room** — this **takes time** (and **Salvage**, §6.4) while occupied. Not the same crew-capacity as Work Slots; a room can be both producing *and* being upgraded at once if both groups are staffed.
  - **Both groups grow as the room levels up** — a fresh room starts with few slots; each upgrade unlocks more Work and Upgrade Slots. The **padlocks** in the mockup represent slots **not yet unlocked** at the current level.
- **Row visual states (prototype, resolved): minimal.** A row communicates only **slot fill** (portrait vs. empty frame) and a **selected-row highlight.** It does **not** carry per-room status styling for idle/producing/upgrading/damaged — those conditions surface through the **ALERTS panel** and the **sonar** (§9.3) instead; full state detail is read by opening the room in the central view.
- **Interaction (prototype, resolved): the sidebar is selection-only — not a drop zone.** Its slots are **read-only status indicators.** **Clicking a room row opens that room in the central view**, and **assignment happens there** (drag crew onto the room's slots, §9.4). This keeps a **single drop target** (the central view) rather than allowing drops onto the sidebar.

**Central Main View (largest area) — contextual, renders what is selected:**
- **Room selected (anatomy confirmed for prototype):** illustrated scene of that room with crew working inside; **interactive Work/Upgrade Slots (this view is the drop target for crew assignment, §9.4)**; room stats (**level + production rate + what it consumes/produces**); work-progress bar(s); action buttons (Upgrade, Harvest, etc.); ability to select active workers there and **drag them to another room**.
  - **Specialization choice — in-room, reusing the Upgrade-Slots area (prototype, resolved).** When a room reaches a level-gate where a **specialization decision is warranted** (§6.7 — only the forking variants: Huerto, Piscifactoría, plus the Taller-Esclusa fork), the **space where the Upgrade Slots normally sit transforms into the choice UI**: it shows **two cards, one per specialization**, each with **a description, the resources it consumes, and its effects**, and a **"Desarrollar" button**. Clicking *Desarrollar* on a card **locks that branch** and the area **reverts to normal Upgrade Slots** — now the slot(s) for *developing the chosen specialization* (levelling it on its own track). *(Variant choice, by contrast, happens earlier in the build event prompt — §9.3 sidebar / §6.7 — not here. No always-on variant/spec panel.)*
- **Crew member selected** (clicking a crew card): that character shown against the background of where they currently work, with access to their stats. *(Target design: clicking opens the profile, **dragging the card assigns** — the primary gesture per §9.4. In the current prototype, live drag happens inside the room view; drag-from-card is the chosen direction, still to implement.)*
  - **Lean profile (prototype, resolved):** the profile shows **portrait + name/role + the 4 State bars** (Energy/Hunger/Health/Morale) **+ Traits + Current Activity** (room + progress bar + time remaining) **+ action buttons.** **No "Core Statistics" block** (Skills deferred, §5.1-B) and **no separate "Condition" panel** — the 4 State bars are the **single source of truth** (drop the mockup's Stress/Fatigue re-naming and the EKG/silhouette as non-essential flavour). **Background/History** is optional/collapsible, not core.
  - **Action buttons (prototype, resolved): a single "Reasignar" button that opens a target picker** (choose room + action, e.g. Habitáculo→Dormir/Comer, Taller-Esclusa, etc.). This is the **accessible, no-drag secondary assignment path** (§9.4), keeps the profile clean, and **scales** to any room set without UI rework (data-driven pillar). The mockup's fixed "Send to Workshop / Send to Barracks" shortcut buttons are **not** used for now; quick-send shortcuts may be added later if playtest shows the picker is too slow for routine sends.
- **Event received — one container, two bodies (prototype, resolved):** the event renders here as a **common shell** — its own **background + title + description + response-window countdown** — whose **central body swaps by event kind:**
  - **Crisis events** (§7.3, e.g. fire): the body shows **posts/slots** where the player **drags crew** to mitigate — the **same slot/drag mechanic as a room** ("a special temporary room"). **Stakes are shown as qualitative hints (prototype, resolved):** each post carries an **icon/label of what it mitigates** ("prevents Hull damage", "protects the wounded") plus a **general severity** — **no exact numbers** (fits the hidden roll, §7.3). The player triages informed but with real uncertainty.
  - **Choice events** (build a new room, pick a variant — §9.3 sidebar build flow): the body shows **cards to choose from** (description + resource cost + effects + a button), **reusing the specialization-card pattern** from the room view.
  - One event system, two renders; both still feed the **ALERTS** panel as latent items (§7.7) and open here when clicked.
  - **Resolution — hybrid (prototype, resolved):** crew can be **assigned/changed to posts anytime while the `responseWindow` runs.** When the window **expires the event culminates automatically** (hidden roll over the covered posts → outcome applied → event closes, §7.3/§7.7). Additionally a **"Resolver ahora" button** lets the player **close it early** once they've assigned, for pacing control — without removing the pressure of the clock.

**Left side — a two-part stacked panel (resolved v0.2; confirmed for prototype):**
- **ALERTS (top) — events happening now.** The home of latent/pending events (§7.7): active events sit here, visible and counting down their `responseWindow`, until resolved or culminated. A **VIEW ALL** button; clicking an alert opens it in the central view. Several can be listed at once (simultaneity, §7.4). *(Mockup examples: "LOW FOOD SUPPLY", "HULL BREACH — Sector C-3", "POWER SURGE — Engine Room".)*
- **STATION LOG (bottom) — the Bitácora's on-board home (resolved v0.2, §11.3).** A compact, **timestamped live ticker** of recent happenings — both mundane and narrative — e.g. *"18:32 Hypoxia resolved in the Habitáculo / 18:11 Crew returned from expedition (Taller-Esclusa) / 16:59 Taller-Esclusa upgrade research complete."* This box **is** where the Bitácora lives in the HUD: the running feed sits here, and a **VIEW LOG** button **expands it into the full assembled history** (global + per-character views, §11.3). Flavor sticky-notes may share the space.

**Bottom bar:** *(confirmed for prototype)* the 4 consumable resources side by side with **icon + current value only** — **Food, Water, Salvage, Med Supplies.** (No "RESOURCES" label — wastes space.) **No trend arrows and no in-bar low warnings** — serious shortages surface through the **ALERTS** panel (e.g. "LOW FOOD SUPPLY"), keeping the bar minimal and consistent with the room-row / crew-card treatment.

### 9.4 Two Paths to Assignment (must stay synced)
Assigning a crew member can happen via the room view (drag into a slot) or via the crew profile (choose an action = sending them to the corresponding room). Both must manipulate **the same state** and reflect each other instantly.

**Primary gesture (resolved v0.2): drag crew → slot.** The day-to-day gesture is **dragging a crew portrait — ideally straight from the always-visible crew strip — into a room's work/upgrade slot** (and dragging crew room-to-room). **The drop target is the *central view's* slots for the currently-selected room (resolved, prototype) — the right-sidebar slots are selection/status only, not drop zones (§9.3).** This is **task-centric**, makes capacity **spatial and visible**, and works **identically for events** (which are "temporary rooms" with slots, §9.3) — one gesture to learn and to build. This promotes the previously-deferred "drag-from-crew-card" (§13.3) to the core interaction. **Assign-from-profile is the secondary, accessible path** (no drag dexterity required) and stays synced to the same state.

### 9.5 Visual Direction
**Base direction = the darker, more atmospheric, sepia "submarine-real" treatment** (numbered rooms + locks, round needle gauges, heavier grime). Watch item: it runs dark — when implemented, **lift the brightness of interactive elements** (state bars, stat text) while keeping the background dark and dirty, to preserve atmosphere without sacrificing legibility.

---

## 10. Exploration

### 10.1 Concept
Crew leave the station to gather resources. While away they **disappear temporarily from the station** — they do **not** breathe the base's O2 or eat its Food; they carry their own provisions (loaded at launch — see §10.3) and return after a set time, **with loot, or dead.**

**Loot is a mixed bag (resolved v0.2).** An expedition can bring back **any of the four consumables — Salvage, Med Supplies, Water, Food** — plus, occasionally, a **rare item** required to unlock or level up a specific room. The player **cannot target** the search (no "look for medicine" vs. "look for materials"); the haul is an undirected mix. *Salvage is still the headline reason to explore (it gates upgrades, §6.4), but a trip can also top up survival stores or surface the rare component you've been waiting for.*

### 10.2 Access — Two Ways, Same Interface
- **Manual:** the player launches an expedition from the **Taller-Esclusa** (its esclusa/airlock function) whenever they want materials.
- **Canon event:** on reaching certain room levels, the radar "detects something" → an event offers an expedition → **same interface**, but with **rare loot** and **narrative continuity** (story milestones). The only difference is *how you arrived* at the exploration screen.

### 10.3 Expedition Parameters
- **Team size: starts at 1, expandable via Taller-Esclusa upgrades (refined v0.4).** The base capacity is a **single explorer**; sending more requires **upgrading the Taller-Esclusa** (and the **Expedicionaria** specialization — bigger packs, safer/longer trips, +loot — §6.7.1). This replaces the earlier flat "hard cap of 2" with a **progression the player earns.** A solo trip is viable but riskier (no backup).
- The player sets **how long the team stays out** via a **continuous slider** (e.g. 1–8 Days). There is no preset "destination" menu — duration is a free dial.
- **Linear payoff & risk (resolved v0.2).** Both expected loot **and** danger scale **proportionally** with time out: twice as long ≈ twice the loot *and* twice the accumulated risk. There is deliberately **no diminishing-returns "sweet spot"** to solve — the only question the player answers is *"how much risk do I tolerate?"* This keeps the gamble transparent and easy to balance.
- **Live provisioning, supply-capped (resolved v0.2).** As the player drags the slider, the **required provisions update in real time**: each Day, per explorer, consumes a set amount of **Water + Food**, plus a **fixed Med Supplies cost (≈1 Med per explorer for the trip)** carried as a first-aid kit. These provisions are **deducted from base stores at launch.** The **maximum reachable duration is therefore dictated by current base supplies** — you can only send the team as far as your pantry, water, and meds allow. This couples exploration tightly to the home economy: a well-stocked base can afford long, high-yield gambles; a strained one can only make short hops.
- Death risk also depends on the **Health/Morale of the team sent** (a low-Health team multiplies the per-Day danger). If too low, there's a probability one or both **die.** If one survives, their **Morale and Health drop massively** (trauma of losing a partner).

### 10.4 Double-Edged Tradeoff (key)
Sending crew out doesn't only expose those who go — it **leaves the base understaffed.** The longer/more crew you send, the more vulnerable home becomes. If a catastrophic event hits while your people are away and you have no one to respond, you simply eat the damage. More time out = more loot but more risk both *outside* (the team) and *inside* (the undefended base). This ties exploration directly to the base-event system.

### 10.5 Exploration as an O2 Relief Valve *(resolved v0.5)*
There is a deliberate **upside** to balance the §10.4 risk: crew on an expedition **don't breathe station air** (§10.1), so **every explorer you send out is one fewer consumer on the O2 balance** (§5.5). When the **O2 plant is damaged or offline** — most acutely the **broken-plant cold open** (§7.9) — launching an expedition is a valid **emergency response**: it **lowers consumption, slows the fall toward 0%, and buys time** to repair/rebuild the plant, *while also* potentially returning the **Salvage / rare component** needed to do so. This turns the same action into a tense double bet: you relieve the air **and** chase the parts to fix it, but at the cost of leaving home short-handed (§10.4) for whatever else hits while they're gone. It makes "who do I send, and for how long?" a question about **the air back home**, not just about loot.

---

## 11. Progression & Goal

### 11.1 Base Expansion (second progression layer)
Beyond turn-to-turn crew/resource management, the player **grows the installation**: unlocking blocked sections, clearing collapsed/obstructed areas, reconditioning burned sections, docking new modules. Each location type expresses this differently (a "floating city" of joined ships; an oil platform with tool-gated areas; a bunker with collapsed passages; a modular research station that docks mid-game; an orbital station of joined craft). *(Phase 2 — kept in mind, first concrete case is the O2-plant upgrade.)*

A **third progression axis** layers on top: **room specialization / "Bifurcations" (§6.7)** — rooms don't just level up, they **fork into mutually-exclusive specialized types** (per run, irreversible), so each playthrough is a different web of resource dependencies and events.

### 11.2 Goal / Win Condition
**Open survival, no victory screen (resolved v0.2).** Survive as long as possible while special **canon events** (often exploration-driven, every N turns) tell a background story. **Full self-sufficiency is an aspiration and a theme, not a win state** — the closer you get to it, the less you depend on the Reactor and the fewer Power crises you face, but the game never declares "you won." You play until you lose (§4.1). Best of both worlds (replayable survival + narrative arc) without the content explosion of a fully branching plot.

### 11.3 Narrative & Lore Delivery *(added v0.2)*
**Tone — "The Road":** the world simply *is*. The game **does not explain the cataclysm head-on.** 60+ years on, the crew were born/raised into this and treat the drowned, poisoned world as normal. **The only ignorant party is the player.** The crew slowly reveal what happened — never via exposition dumps, always as scattered, ambient fragments.

**Channel 1 — Conversations (the past).** When **2+ crew share the Habitáculo** (resting via Dormir, or eating via Comer), they **talk.** Lore is delivered as **fragments unlocked gradually — gated by game progression/level**, not merely by accumulated leisure time, so there's a steady drip rather than a front-loaded dump.

**Exhaustion handling — an expandable corpus, never truly dry (resolved v0.2).** Rather than a fixed finite pool that runs out, the lore is treated as a **growable content database** fed by a **supervised, offline generative-AI authoring pipeline:**
- **Authored lore fragments** (a short story + an accompanying image) are **generated with generative AI under human supervision, *outside* the game, then curated into the content DB.** Because new fragments are cheap to produce and unlock against rising game levels, the player keeps meeting fresh material as they progress — the corpus effectively grows faster than a player exhausts it. *(This is an offline content-authoring tool, NOT runtime generation — quality stays curated, and the data-driven pillar §6 holds: the world still lives in the data.)*
- **Ambient/mundane lines:** a separate pool of short, non-lore everyday chatter — also AI-generated under supervision and stored in the DB — fills the gaps between lore beats so leisure rooms feel inhabited.
- **Default = silence.** When neither a new lore fragment nor an ambient line is queued, the crew simply rest/eat with room tone and background murmur — **no cheap looping filler.** Silence is the honest fallback, in keeping with the "The Road" restraint (§3.4 audio: silence is a deliberate tool).
- **Conversations are pure narrative — zero stat effect.** They are a delivery channel, nothing more. (They do **not** create relationship bonds; see §5.2 for why grief is handled globally instead.)

**Channel 2 — Expeditions (the present).** Returning crew bring stories of the **world as it is now** (other stations, wrecks, signals, living dangers) **and second-hand tales** ("met someone who told me…"), which attach to that crew member's memories. Together the two channels are complementary halves: **inside you learn the *yesterday*, outside you discover the *today*** — though in practice both simply feed one store (below).

**The Bitácora (central logbook).** All unlocked story from every source assembles into **one combined logbook** — the player reads the whole assembled history in one place, without entering each character. **Each crew member also has a personal "story": the same Bitácora content filtered/summarized through that character's perspective.** One canonical store, two views (global + per-character).

**UI home (resolved v0.2):** the Bitácora lives in the **bottom half of the left panel** (§9.3). The left panel is split in two — **ALERTS on top** (events happening now) and the **STATION LOG below**, which is the Bitácora's **always-visible live ticker** (timestamped recent happenings, mundane + narrative). A **VIEW LOG** button on that box **expands the ticker into the full assembled Bitácora** (the global view and the per-character filtered views). So it's *not* a separate screen nor a cramped inline box: a compact live feed docked left, expandable on demand into the full read.

**Re-runs:** since there is no meta-progression (§11.4), lore is **re-discovered each new run.** Consider letting players **skip already-seen** conversations/entries on re-runs.

### 11.4 Run Structure & Reset *(added v0.2)*
**A single persistent timeline** with save/continue. The run ends only on the single loss condition in §4.1 (the whole crew dead — O2 collapse is a recoverable crisis, not a direct loss). **On loss, everything resets to zero** — crew, expansions, room/Reactor levels — and the player chooses to restart with the **same or a different** starting crew. **No meta-progression / no carried-over unlocks.** The full wipe is harsh by design; the bootstrap fiction (§6.6 / §13.1) makes it feel like *rediscovering a derelict*, not an arbitrary restart.

### 11.5 Late-Game Tension *(resolved v0.2 — A + B)*
To stop a stabilized station from becoming boring autopilot, two pressures combine:
- **(A) Escalating threat over time.** Danger rises the longer you survive — crises grow more frequent/severe (via Hull and/or a background "pressure"). Stability is always temporary; you can never fully relax. *(Frostpunk.)*
- **(B) Self-imposed risk through ambition.** The game doesn't only push — **you** create risk by **expanding**: each new module/capacity adds Power demand (forcing Reactor upgrades, §6.6) and new points of failure. Staying small is safer but stagnant; growth is optional and dangerous.

### 11.6 End-of-Run Collapse & the Cycle *(added v0.2)*
Losing is **not an instant game-over screen** — it is a **playable, diegetic collapse sequence**, true to the "fail forward, never hard-block" pillar (§2, pillar 4):
- Once the station enters an unrecoverable critical state (crew dead/too few to maintain it — a visible countdown), systems begin to **fail in cascade**: the **Reactor overloads**, **rooms degrade and drop levels** from lack of maintenance, and failures feed each other (§4.1 cascade).
- When the **last crew member dies**, the **submarine surfaces / floats up.** The run ends.
- **The cycle closes the lore:** the surfaced, dead station *is* the **derelict adrift at ~20%** that a new crew will board next run (§6.6 / §13.1b). **The end of one run is the setup of the next.** This is exactly why **the title is "Long Now"** (§1.3): the place persists across generations of crews; people come and go, the station endures.
- On restart, everything resets to zero (§11.4) and the player chooses a same/new crew to board the derelict — now diegetically *the very station they just lost*, or another like it.
- **Years pass in the gap between crews**, so the station's **specialized rooms decay back to ruined/generic** (§6.7): the new crew can't inherit the old build and must **re-choose every Bifurcation afresh** — the diegetic reason each run is a different combination.

---

## 12. Time & Pacing

- **Real-time with active pause.** The clock runs; tasks take real time; crises overlap and interrupt. Pause freezes everything so the player can read crew state calmly and reassign, then resume. *(Reference: Frostpunk, RimWorld.)* This preserves the reflection the hidden-roll/legible-state design needs, while keeping real-time tension.
- **Pace:** slow and contemplative at first (in this prototype phase with only metabolism, no events). The pace tightens and becomes nervous once events are added.
- **Time unit / display (resolved v0.2):** the canonical unit is the **Day.** Days are shown as an **artificial station cycle** (no sun underwater) communicated through **lighting** — warm lights "dusk" toward night — supporting the metabolism/sleep rhythm and the warm-light aesthetic. A running **"Day N" counter** doubles as the open-survival score (§11.2). Hours exist as a sub-division for the header clock readout. Stock rates are expressed **per-Day** (e.g. Food/Day).
- **Real-time mapping:** an **internal real-minutes-to-Day multiplier** (a single tunable config value) maps wall-clock time to in-game days, so pacing can be tuned freely across prototype iterations.

---

## 13. Scope & Roadmap

### 13.1 Minimum Playable Core (current prototype target)
- The real-time-with-pause loop.
- A **fixed crew of 4** (selectable from a list of 4), with **visible state bars.**
- **Metabolism only, no events:** just the tasks **Sleep, Eat, Produce food (Garden).**
- Goal: verify the basic loop *feels* good — is it tense and satisfying to decide who goes where while the clock runs? If the basic loop is hollow, no fire event will save it. Build the heartbeat first; crises later.

### 13.1b Onboarding — Diegetic Bootstrap *(resolved v0.2)*
The tutorial **is the fiction of reviving the derelict.** The crew board a dead submarine at 20% Reactor capacity with no resources (§6.6), and the opening phase teaches mechanics **through the act of bringing it back to life** — bring the Reactor online, start the O2 plant, plant the first food crop — with **no tutorial pop-ups**, learning by doing. **The first mechanic taught is upgrading the Reactor:** with zero Power headroom at 20% (§6.6), the natural first goal is to raise the Reactor so the station can grow — introducing the core upgrade loop on Day 1. The Salvage for this first upgrade comes from the **small stash already aboard the derelict** (§6.4 / §6.6), so the player can complete it immediately without leaving — **exploration is introduced afterward** as the ongoing source of Salvage for further upgrades, sequencing the lesson cleanly (first "upgrade," then "where materials come from"). **There is no separate scripted/guided tutorial layer to skip.** Teaching is *purely diegetic and emergent from the game's own constraints* — e.g. zero Power headroom at 20% Reactor (§6.6) makes "upgrade the Reactor first" the only sensible move, so the lesson is forced by the situation, not by pop-ups or hand-holding. This is **identical for new and returning players**: because losing wipes everything and restarts (§11.4), the bootstrap *actions* (revive the Reactor, start O2, plant the first food, re-choose room Bifurcations §6.7) always happen as part of the normal loop — a veteran simply performs them faster, not differently. The fiction never breaks to "explain" itself, and there is nothing to fast-forward through because the bootstrap *is* the game.

### 13.2 Built So Far *(updated v0.5 — Vite + React + TypeScript prototype)*
The prototype is a **Vite + React + TypeScript** app (`long-now/`), published to GitHub Pages. All in-game UI text is **English** (project rule); assets live under `public/assets/{crew,rooms,events,ui}`. Implemented:

- **Six-zone HUD (§9.3):** header (brand · 3 needle gauges Oxygen/Power/Hull · 4 consumable readouts · **Vault** button · Day/clock · **sonar**), crew strip (10 slots), left panel (ALERTS + STATION LOG), central contextual view, right rooms sidebar. Image-based gauges/needles, sonar with rotating wave, 9-slice metal frames (`frame9.png`) overlaid via `::after` so they don't push content. Per-level room scenes; **B&W while a room is unbuilt or under construction, colour once built**.
- **Crew (§5.1):** 8 designed crew with portraits, **4 State bars + Traits** (Skills deferred). Lean profile (full-height portrait background, 4 bars, traits, current activity, history). Away/**EXPLORING** crew show name + countdown, grayscale, bars hidden; their profile shows state as *UNKNOWN (AWAY)*.
- **Assignment model:** click-a-slot → the crew strip highlights candidates → click a crewmate to assign (toggle); each filled slot has an **× remove** (→ idle); drag-from-portrait also works. The central view is the single drop target (sidebar is selection/status only).
- **Rooms & build flow v2 (§7.9 / §9.3):** rooms start **hidden / undeveloped**; a guided **unlock chain** of card-events reveals them in order **O₂ → Water → Food → Habitat → Workshop → Infirmary** (Reactor online from the start). Building uses the **"build then develop"** flow — construction panels per option with **builder slots, Salvage cost, required items, a timed progress bar, and cancel-returns-items** (only time + Salvage are lost). Variants render as **multiple build cards** (Food = Hydroponics / Insect Farm; Infirmary = Engineering / Biological). Developed rooms show work slots / spec cards / upgrade slots + Upgrade/Downgrade/Harvest. Reactor & O₂ run automatically (no operators).
- **Pre-existing broken plants (§7.9):** the **O₂ plant pre-exists but is broken** at cold open — its variant (Algae / Electrolysis) is **pre-decided at world-gen, not player-chosen** (always Algae for now); while unbuilt it shows a broken-plant scene (`algae-old.png`) instead of the generic empty room. The **Desalinator** does the same (`desalination-old.png`).
- **Vault / inventory:** a chest button in the header opens the Vault — 4-column grid of owned + consumed items (consumed shown greyed with "used in"), plus a detail pane (big icon, name, description).
- **Simulation heartbeat (the "latido"):** a 1s `TICK` runs crew metabolism (hunger/energy → health/morale, habitat rest recovery), room production vs. consumption (food/water), and the **O2 production-vs-consumption balance** (§14.1) — consumption counts only crew **aboard**, so exploration relieves the air (§5.5/§10.5). Tick speed is a single tunable constant (`TICK_MS`).
- **Exploration loop (§10):** opened from the **sonar**. Planner uses up to **2 party slots** (same slot mechanic as rooms) + a **duration slider** capped by current supplies, a live **Food/Water/Med** cost readout, and **condition-driven tips** (warn/info/good — extensible rule set). Launch deducts provisions and sends the party; an in-progress view shows the countdown and grayscale busts (click → profile); on return it grants **Salvage + a chance of a rare item to the Vault** and logs it.

### 13.3 Deferred (designed, not yet in prototype)
Multiple locations & UI skins; recruitment / docking encounters; base expansion; the **events engine** (crises like fire, Hull-driven probability, chaining/escalation — only the unlock-card events exist so far); **death & loss conditions** (the O2 fall is modelled, but 0% = whole-crew death and the end-of-run collapse aren't wired yet); Skills layer & skill-gated slots; traits shown as visible "+10" bonuses on a recruitment screen; the Bitácora full expanded view & in-Habitáculo conversations; radar/exploration **canon events**; per-variant differentiated art (Infirmary variants currently share art; Habitat/Infirmary are single-level).

---

## 14. Engineering Notes

- Structurally a **state machine over data.** Each **crew member** = a record (mutable state: hunger, energy, health, morale; fixed traits; improvable skills). Each **event/room** = a record with a list of slots; each slot requires a skill and produces effects on resources and on the assigned crew member.
- The "engine" reads availability → applies trait + state modifiers → resolves effectiveness (formula + hidden narrow roll) → mutates global + per-crew state. Small engine; the game lives in the data. Content scales by authoring rooms/events, not by programming.

### 14.1 Oxygen Failure *(model simplified v0.4)*
O2 is a **single station-wide balance** (§5.5): 100% = production meets consumption. A sustained **deficit** — over-population or under-production (plant damaged, or Power = 0 shutting it down, §4.1) — makes the indicator **fall gradually toward 0%**, at a rate that **scales with the deficit size** (a 1-head overage drains slowly; a dead plant drains fast). If the cause is removed before 0%, the indicator **climbs back up gradually.**

**At 0% the entire crew dies at once** — the single loss condition (§4.1). There is **no per-character mask, no auxiliary O2 reserve/tank, and no staggered death.** The player's whole margin is the **gradual fall** plus a **critical visual highlight below 10%** that warns the collapse is imminent.

*Design rationale (why the buffer was removed):* a per-character "Mask O2 %" stat always read the same for every crew member (a redundant column), and a global auxiliary reserve was just the same countdown re-skinned as a second tank — neither added a real decision. Collapsing it to **"0% = wipe, but the slow fall and the sub-10% warning give you time to fix it"** is simpler, keeps O2 a pure production/consumption balance, and still reads as the player's own mismanagement rather than bad luck. *(Supersedes the v0.2 mask/recharge design and voids §15 #7 and Decisions #17, #37, #48 — see §16 #52.)*

**Prototype model (implemented, v0.5).** Per simulation tick: `consumption = (crew aboard) × O2_PER_CREW` (crew away exploring are excluded, §5.5/§10.5); `production = plant developed && O2 < plantCap ? O2_PROD_PER_LEVEL × plantLevel : 0`, where `plantCap = (plantLevel / maxLevel) × 100` is the plant's rated ceiling (scales with level); then `O2 = clamp(O2 + production − consumption, 0, 100)`. Consequences that fall straight out of this: **no plant → O2 only falls**, at a rate set purely by the aboard headcount (sending 2 of 8 out cuts the drain by ~¼); **an under-levelled plant for too many heads** can't reach its cap and the air still erodes (upgrade or thin the crew); a **healthy plant** holds O2 near its level cap. Current tuning: `O2_PER_CREW = 0.05`, `O2_PROD_PER_LEVEL = 0.5` (so a full crew of 8 drains ~0.4/tick with no plant; a level-1 plant outproduces that up to its 33% cap). Values live in `store.tsx` for playtest tuning.

---

## 15. Open Questions (to resolve)

**Status (v0.3): all questions below are RESOLVED — the v0.2 interview pass is fully closed.** Entries are kept (struck through) as a decision trail; see §16 for the canonical record.

**Still open:** *(none remaining)*
1. ~~**Game title**~~ — **RESOLVED v0.2: "Long Now"** (working title; the in-UI station is named MARA; see §1.3 for caveats — revisit before final).
2. ~~**Water source**~~ — **RESOLVED v0.2: hybrid** (Power-fed Water Plant for baseline + upgrades/exploration for abundance; reskinned per location). See §4.2.
3. ~~**Materials economy**~~ — **CONFIRMED v0.2:** the canon consumables are **Food, Water, Salvage, Med Supplies** (exactly these four). See §4.2.
4. ~~**Canonical time unit**~~ — **RESOLVED v0.2: Day** (artificial station cycle via lighting; "Day N" doubles as survival score; hours as sub-division; tunable real-minutes→Day multiplier). See §12.
5. ~~**Primary assignment gesture**~~ — **RESOLVED v0.2: drag crew → slot** (ideally drag-from-crew-strip; works identically for events; profile assignment is the accessible secondary path). See §9.4.
6. ~~**Sonar/radar function**~~ — **RESOLVED v0.2:** it is the **diegetic alert hub for all external events** (blinks red + beeps; surfaces exploration / docking-recruitment / threat events; ambient + canon contacts). Not a navigable map. See §9.3.
7. ~~**O2-mask recharge cost**~~ — **VOID (v0.4):** the entire mask/reserve mechanic was removed. O2 is now a pure station balance and **0% = whole-crew death** (no buffer to recharge). See §14.1, §16 #52.
8. ~~**Life-expectancy cause**~~ — **RESOLVED v0.2:** no hard age cap; low life expectancy is **emergent** — survival is so costly that few beat the odds to reach old age (the threat is constant *risk*, not a clock). See §3.1.

**New open questions (raised in v0.2):**
9. ~~**Threshold scope**~~ — **RESOLVED v0.2:** the ~30% buffer is **Morale-only**; physical states (Energy, Hunger, Health) penalize **continuously and proportionally** with no grace zone. "Body degrades smoothly, mind has slack." See §5.1, §5.2.
10. ~~**Exhausted-lore conversations**~~ — **RESOLVED v0.2:** the lore is an **expandable DB** (supervised offline generative-AI authoring of story+image, unlocked gradually by game level) so it rarely runs dry; a separate AI-generated ambient-chatter pool fills gaps; the fallback is **silence**, never looping filler. See §11.3.
11. ~~**Bitácora UI home**~~ — **RESOLVED v0.2:** lives in the **bottom half of the left panel**. The left panel splits into **ALERTS (top, current events)** + **STATION LOG (bottom)**, which is the Bitácora's live ticker; a **VIEW LOG** button expands it into the full assembled history (global + per-character). See §9.3, §11.3.
12. ~~**Reactor failure severity**~~ — **RESOLVED v0.2 (refined v0.4):** a normal event (slots/consequences, possibly a 1-crew repair). No direct kills — it cuts Power → stops the O2 plant → triggers the O2 deficit cascade (§5.5), whose clock runs even during repair. Lethality flows entirely through the **O2 balance** — the race is to restore Power **before O2 hits 0% and the whole crew dies at once** (no masks/reserve, v0.4); it's the most dangerous crisis (attacks the root) but not a special instant multi-kill. Emergency lighting is flavor only (never-failing nuclear cells), not a mechanic. See §6.6, §14.1, §16 #44/#52.
13. ~~**Bootstrap skip mechanism**~~ — **RESOLVED v0.2:** there is **no tutorial layer to skip** — teaching is purely diegetic/emergent from constraints; new and returning players follow the identical bootstrap loop, veterans just play faster. See §13.1b, §16 #47.
14. ~~**Bootstrap Salvage source**~~ — **RESOLVED v0.2:** the **derelict carries a small Salvage stash** sized to fund exactly the first Reactor upgrade; exploration is introduced afterward for subsequent upgrades. See §6.4, §6.6, §13.1b.
15. ~~**Branch scope**~~ — **RESOLVED v0.2:** **every branchable system can specialize *except* the Reactor** (e.g. O2: algae vs. electrolysis). See §6.7.
16. ~~**Pre-branched derelict**~~ — **RESOLVED v0.2:** branches are **not inherited**; **years pass between crews**, so specialized rooms **decay/break down** and the derelict presents generic/ruined rooms — you **re-choose branches afresh** each run. See §6.7, §11.6.

**Resolved in v0.2 (moved out of this list):** player role (§1.4), run structure & reset (§11.4), narrative tone & delivery (§11.3), reactor as room/goal (§6.6), death-spiral safety valve (§5.2), onboarding (§13.1b), audio direction (§3.4), late-game tension (§11.5).

---

## 16. Decisions Log — v0.2 Interview Pass

Each entry: the question, the decision, and the key consequence.

1. **Player role →** *Invisible hand, no in-fiction identity* (god-player). UI stays diegetically dressed; "you are the mind" language softened. → §1.2, §1.4.
2. **Run structure →** *Single persistent timeline; loss **only** on whole-crew death (O2 collapse is recoverable — see #39); full reset to zero on loss; no meta-progression; choose same/different crew to restart.* → §4.1, §11.4.
3. **Narrative tone →** *"The Road": the world simply is; the cataclysm is never explained head-on; the player is the only ignorant party.* → §11.3.
4. **Reactor & goal →** *Reactor is a managed, upgradeable room (not a death clock); starts at 20% after the crew board a derelict sub; sets the Power ceiling; capacity upgrades elsewhere raise Power demand and force Reactor upgrades. Full self-sufficiency is aspiration/theme, not a win screen.* → §6.6, §11.2.
5. **Conversation system →** *Authored lore corpus delivered as fragments, **gated by game progression/level**; pure narrative, zero stat effect.* (Exhaustion resolved in #42.) → §11.3.
6. **Narrative architecture →** *Conversations = the past; expeditions = the present + second-hand tales. All feed one central **Bitácora**; each character also has a personal, filtered summary view.* → §11.3.
7. **Death & morale →** *Every death lowers all survivors' morale, modulated by each one's Traits. No individual-bond system.* → §5.1, §5.2.
8. **Death-spiral safety valve →** *Abundant morale-recovery vectors + performance only penalized below ~30% (a recovery buffer).* → §5.1, §5.2.
9. **Onboarding →** *Diegetic bootstrap = the tutorial (revive the derelict step by step, no pop-ups). **No separate scripted/guided tutorial layer** — teaching is purely emergent from constraints; identical for new and returning players; veterans just play faster (see #47).* → §13.1b.
10. **Audio →** *Adaptive hybrid: ambient station-as-protagonist bed + sparse melodic accents at key beats.* → §3.4.
11. **Late-game tension →** *A + B: escalating threat over time AND self-imposed risk via expansion ambition.* → §11.5.
12. **Game title →** *"Long Now" (working title)* — evokes long-term continuity ("the place endures; people pass"). Caveats logged (translation, name collision, abstractness). The **in-UI station name is MARA** (Mobile Aquatic Research Array) — a separate world-fiction label, not the title. → §1.3.
13. **Water source →** *Hybrid* — a Power-fed Water Plant guarantees baseline survival but is capped at low Reactor; abundance earned via upgrades and/or exploration. Reskinned per location. → §4.2.
14. **Time unit →** *Day* (artificial station cycle shown via lighting; "Day N" doubles as the open-survival score; hours as sub-division; pacing set by a tunable real-minutes→Day multiplier). → §12.
15. **End-of-run collapse & cycle →** *Losing is a playable diegetic collapse (reactor overload, rooms drop levels, cascade); last crew death → the sub surfaces. The dead station becomes the ~20% derelict the next run boards — the end of one run sets up the next, reinforcing the "Long Now" theme.* → §11.6.
16. **Sonar/radar →** *Diegetic alert hub for everything outside the hull (notification system, not a navigable map): blinks red + beeps, surfaces exploration / docking-recruitment / threat / docking-expansion events; ambient + canon contacts.* → §9.3.
17. ~~**O2-mask recharge**~~ — **VOID (v0.4):** the mask/reserve concept was removed entirely; O2 is now a pure balance and 0% = whole-crew death. See #52, §14.1.
18. **Primary assignment gesture →** *Drag crew → slot* (task-centric; ideally drag straight from the always-visible crew strip; works identically for events; assign-from-profile is the accessible secondary path). → §9.4.
19. **Materials economy →** *Confirmed: four consumables — Food, Water, Salvage, Med Supplies.* No fuel consumable (reactor is repaired, not refueled). → §4.2.
20. **Event taxonomy →** *Four families confirmed: A internal crises, B external encounters, C canon/narrative, D personal/crew (new).* → §7.5.
21. **Event = data record →** *Defined a full technical schema (identity, trigger, timing, slots, objective, hybrid resolution, tiered outcomes) so content scales by authoring data.* → §7.6.
22. **Event lifecycle →** *Real-time "temporary room" (model A). Latent events live in the left-panel ALERTS box with a `responseWindow` (time X); open one to assign crew (or make a yes/no decision). On expiry it culminates — internal crises (A) fire consequences/chain; external opportunities (B) expire harmlessly.* → §7.7, §9.3.
23. **Event triggering & engine →** *Each event has a `conditions` boolean tree (AND/OR/NOT over any game state — room/reactor levels, crew count, stat thresholds, resources, flags) gating eligibility, plus a per-cycle `probability`. A single data-driven **event engine** evaluates all events each cycle, rolls probability for eligible ones, and spawns them — with concurrency cap, per-family pacing, and a global escalation multiplier. All content/difficulty live in the data.* → §7.6 (block 2), §7.8.
24. **Life expectancy →** *No hard age cap; low life expectancy is emergent — surviving is so costly that few beat the odds to reach old age. The tension is constant lethal risk, not a countdown.* → §3.1.
25. **Economic balance philosophy →** *Start net-positive (comfortable on-ramp), tightening toward break-even as the station grows — tension is self-generated by ambition (more heads, more Power demand), not imposed by a harsh start.* → §4.3a.
26. **Metabolic tempo →** *Moderate: a need takes ~2–3 in-game Days to reach critical. Relative speed Energy → Hunger → Health; Morale is the downstream result.* → §5.1.
27. **Level-1 production ratio →** *One dedicated worker sustains ~3–4 crew (food/water chains); one gardener ≈ covers the starting crew of 4, matching the O2-plant cap. Growth re-tightens it.* → §4.3a.
28. **Starting Power budget →** *Zero headroom at Reactor 20% — covers only essentials. Expanding anything requires upgrading the Reactor first, making "upgrade the Reactor" the first mechanic the bootstrap teaches (Day 1). Not a survival threat; food/water/labor start comfortable.* → §6.6, §13.1b, §4.3a.
29. **Upgrade cost model →** *Escalating curve (each level costs more than the last, ~×1.5) + **Salvage-dominant** (materials, not time, are the gating cost). Because Salvage comes from exploration, upgrading pushes the crew outside early. Bootstrap tension (Day-1 Reactor upgrade is Salvage-gated) tracked as an open question.* → §6.4, §15 (#14).
30. **Expedition rhythm →** *Continuous duration slider (no preset destinations); **linear** payoff and risk (2× time ≈ 2× loot ≈ 2× danger), no diminishing-returns sweet spot — the only choice is risk tolerance. Team Health/Morale multiplies per-Day danger.* → §10.3.
31. **Team size →** *~~Up to 2 crew (hard cap)~~ **refined v0.4:** starts at **1 explorer**, **expandable via Taller-Esclusa upgrades** (and the Expedicionaria specialization). A progression the player earns, not a flat cap; solo trips allowed but riskier.* → §10.3, §6.7.1.
32. **Loot composition →** *Mixed, undirected bag — any of the four consumables (Salvage, Meds, Water, Food) plus occasional rare items for upgrades. Player cannot target the search. Salvage remains the headline driver.* → §10.1.
33. **Provisioning & supply cap →** *Slider provisions in real time — per Day per explorer costs Water + Food, plus a fixed ≈1 Med per explorer; all deducted from base stores at launch. Max duration is capped by current base supplies, coupling exploration to the home economy.* → §10.3.
34. **Eating (Habitáculo · Comer) →** *No cooking mini-system. Assigning a crew member to the Habitáculo's **Comer** action consumes 1 Food, restores Hunger, and the simple act of eating raises Morale. The Habitáculo doubles as a leisure/conversation room (§11.3). Cook archetype reframed as a food/meal-efficiency specialist (§5.4). (Galley merged into the Habitáculo, v0.4.)* → §9.5, §5.4.
35. **O2 / population model →** *Soft cap as a breathing balance. Plant level sets a **recommended** headcount (L1≈4, L2≈6, L3≈8… tunable); O2 sits at 100% while production ≥ consumption. Player **can** over-recruit (against a warning), entering deficit. O2 also drops from under-production (plant damaged, Power=0). Single global indicator. Each crew costs Food + O2 daily.* → §5.5, §4.1.
36. **O2 drop & recovery →** *On deficit, the global O2 indicator falls toward 0%; **drop rate scales with deficit size** (1 over = slow; production→0 = fast), so time-to-zero T is variable, not constant. If the cause is removed in time, O2 **recovers gradually** (not instant) to 100%.* → §5.5.
37. ~~**At 0% — masks, staggered death, self-stabilization**~~ — **SUPERSEDED (v0.4):** masks, the per-character reserve, staggered death and self-stabilization are all removed. At 0% the **whole crew dies at once** (§5.5). See #52.
38. **No manual sacrifice →** *No direct eject/kill button. Reduce population only via slow/diegetic means: starve (Days), exhaust (fewer Days), or **drop off at a port** during a docking encounter. Over-recruiting is a hard-to-undo commitment.* → §5.5.
39. **Loss condition simplified →** *The **only** game-over is whole-crew death. **O2 reaching 0% is the direct trigger of it (instant whole-crew death, refined v0.4)**; Power loss and plant damage are *not* direct losses — they are what drives O2 toward 0. The slow O2 fall + sub-10% highlight give the player time to prevent it. (Supersedes the earlier two-condition framing; refined by #52.)* → §4.1, §5.5.
40. **Bootstrap Salvage source →** *The derelict carries a **small starting Salvage stash**, sized to fund exactly the first Reactor upgrade. Tutorial teaches "upgrade the Reactor" first using that stash; exploration is introduced afterward as the source of Salvage for further upgrades. (Resolves §15 #14.)* → §6.4, §6.6, §13.1b.
41. **Performance-penalty threshold scope →** *The ~30% buffer is **Morale-only.** Physical states (Energy, Hunger, Health) penalize performance **continuously and proportionally** (no grace zone), making them the actively-managed stats; Morale stays the forgiving slow "result." Mantra: body degrades smoothly, mind has slack. (Resolves §15 #9.)* → §5.1, §5.2, §5.3.
42. **Lore exhaustion & content pipeline →** *Lore is an **expandable content DB**, not a fixed finite pool: story+image fragments **generated with generative AI under human supervision, offline, then curated into the DB**, unlocked gradually by game level — so the player keeps meeting fresh material. A separate supervised AI-generated **ambient/mundane chatter** pool fills between-lore moments. When nothing is queued the fallback is **silence** (no looping filler). Offline authoring only — NOT runtime generation; data-driven pillar holds. (Resolves §15 #10.)* → §11.3.
43. **Bitácora UI home →** *Bottom half of the left panel. The left panel is a two-part stack: **ALERTS (top)** = events happening now (with VIEW ALL); **STATION LOG (bottom)** = the Bitácora's always-visible timestamped live ticker, with a **VIEW LOG** button that expands it into the full assembled history (global + per-character views). Not a separate screen, not a cramped inline box — a docked live feed, expandable on demand. (Resolves §15 #11.)* → §9.3, §11.3.
44. **Reactor failure →** *A normal event (slots/consequences; can be a single-crew repair). No direct kills — it cuts Power → stops the O2 plant → starts the O2 deficit cascade (§5.5), whose clock keeps running during repair, so the threat is the race to restore it **before station O2 hits 0% and the whole crew dies at once** (refined v0.4 — no masks/reserve). Lethality flows entirely through the O2 balance; most dangerous crisis (attacks the root) but not a special instant multi-kill at the moment it trips. Emergency lighting = flavor only (never-failing low-intensity nuclear cells), not a managed resource. (Resolves §15 #12.)* → §6.6, §5.5, §14.1.
45. **Power outage freezes all production →** *A Power loss halts **every** goods-producing room at once — Comida room, Desalinizadora, Taller-Esclusa, Enfermería-Laboratorio research, O2 plant — not just O2. An outage therefore both drains O2 and stalls the whole economy, making "restore the Reactor" the top-priority response and the clearest expression of "Power is the root."* → §4.1, §6.6.
46. ~~**Room specialization ("Bifurcations") — Type 1 / Type 2 / 2-of-3 framing**~~ — **REWORKED (v0.4):** superseded by the room-type model in #49–#51. The old "Type 1 identity / Type 2 sub-spec / hybrid 2-of-3" terminology is replaced by **room types → Variants (build-time identity, *show-2-pick-1*, location-gated) → optional Specializations (level-gated, free pick-1-then-levels; many variants only level up)**. The durable conclusions still hold: irreversible per run, lock per function, events branch-gated via §7.6, Reactor excluded, not inherited across runs. See §6.7 / §6.7.1 and #49–#52.* → §6.7.
47. **No tutorial layer — purely diegetic guidance →** *There is **no separate scripted/guided tutorial** to skip, accelerate, or toggle. Teaching is **emergent from the game's own constraints** (e.g. zero Power headroom at 20% Reactor makes "upgrade the Reactor first" the only sensible move). The experience is **identical for new and returning players**: the bootstrap actions (revive Reactor, start O2, plant food, re-choose Bifurcations) always happen as part of the normal loop — veterans simply move faster, not through a different path. Supersedes the earlier "skippable/accelerated on re-runs" framing in #9. (Resolves §15 #13.)* → §13.1b.
48. ~~**O2-mask recharge cost**~~ — **VOID (v0.4):** the entire mask/reserve mechanic was removed (#52), so there is nothing to recharge. O2 is now a pure balance; 0% = whole-crew death. → §14.1.

---
**v0.4 pass — Room types, variants & specializations (reworked model):**
49. **Room-type model →** *The station is a **small fixed set of room types** (7), each with a base function. On top, a type may offer a **Variant** (build-time identity) and/or a **Specialization** (level-gated sub-path). The 7 types: Comida (4 variants), O₂ (2 variants), H₂O (single = Desalinizadora here), Habitáculo (single, merges sleep+eat), Enfermería-Laboratorio (heal+research; 2 variants), Taller-Esclusa (repair+exploration; 1 specialization fork), Energía/Reactor (single). Dropped the "economy trio / secondary rooms" framing and the standalone Galley, Infirmary, Lab, Quarters, Workshop, Exploration Bay (merged as above).* → §6.7, §6.7.1, §6.5.
50. **Variant offer + specialization choice →** *Types have a **variable variant count (1–4)**. **Variant offer = "show 2, pick 1"** (biased-random; with ≥3 the rest are withheld that run = the variety lever; with 2 both show; with 1 no choice). **Specialization = free pick of 1** of the variant's options (usually 2) at a gate level, which then **levels up on its own track** — no withholding, since variety already comes from the variant layer. Many variants have **no specialization, only levels.*** → §6.7.
51. **Location-gated variants →** *Which variants are **offered depends on the current location/biome.** The submarine MARA's only H₂O option is the **Desalinizadora**; a mountain-bunker location would instead offer **ice-melt / vapour-capture**. Ties variant menus to the multi-location roadmap (§11).* → §6.7, §6.7.1.

---
**v0.4 pass — O2 model simplification:**
52. **O2 = pure station balance; 0% = whole-crew death →** *Removed the per-character **"Mask O2 %"** stat **and** the auxiliary O2 reserve/tank concept entirely. O2 is now a single station-wide production-vs-consumption balance: on deficit it **falls gradually** (rate scales with deficit, #36) and **recovers gradually** if fixed; at **0% the entire crew dies at once** (the loss, §4.1). The player's whole margin is the slow fall + a **critical visual highlight below 10%.** Rationale: a per-character mask stat always read identically for everyone (redundant), and a global reserve was the same delay re-skinned as a second tank — neither created a decision. Voids/supersedes #17, #37, #48 and §15 #7.* → §4.1, §5.1, §5.5, §14.1.
53. **O₂ & Enfermería-Laboratorio specializations confirmed (trimmed) →** *Keeping content lean. **O₂ has 2 variants — Algas and Electrólisis — both levels only, no specialization** (the **Depuradores químicos** variant was dropped entirely). **Enfermería-Laboratorio**'s two variants (Ingeniería / Biológico) also have **no specialization — levels only**, since the variant split already provides enough divergence. Confirms the "most variants only level up" principle (#50): the only forking variants in the game are **Huerto** and **Piscifactoría** (plus the **Taller-Esclusa** specialization fork, #49).* → §6.7, §6.7.1.

---
**v0.4 pass — Prototype UI definition (funnel over the mockup, 6 zones):**
54. **Document renamed →** *The GDD title and file are now **"Long Now"** (`Long_Now_Game_Design_Document.md`); **M.A.R.A.** is the in-fiction station name shown in the UI. Cleaned the legacy **"Type 1 / Type 2 / trío troncal"** terminology in favour of **room types / variants / specializations** throughout.* → header, §6.7.

---
**v0.5 pass — O2 consumption model & exploration relief:**
55. **O2 consumption counts only crew aboard; exploration is an O2 relief valve →** *O2 consumption is summed over the crew **physically inside the hull** — anyone away on an expedition is **off the books** and draws no station air (they carry their own provisions, §10.1). Therefore **sending crew out lowers consumption and slows the O2 fall**, a deliberate survival lever — especially against the **broken-plant cold open** (§7.9), where launching a 2-person expedition removes two consumers and buys time to rebuild the plant (and may return the very Salvage/parts needed). The same action keeps its §10.4 cost (home left short-handed). Implemented model (§14.1): per tick `O2 += production − (aboard × O2_PER_CREW)`, clamped 0–100, with a running plant topping up only to its level-scaled cap. Couples the exploration loop directly to the O2 economy as both cost and benefit.* → §5.5, §10.5, §14.1.
55. **Prototype UI = 6-zone skeleton →** *Locked the screen into 6 zones (Header · Crew Strip · Left panel ALERTS+LOG · Central view · Right sidebar Rooms · Bottom resources), refined in gameplay-priority order. Full per-zone spec lives in §9.3.* → §9.3.
56. **Right sidebar (Rooms) →** *Row = **NAME → Work Slots → divider → Upgrade Slots** (no number/level/production on the row). **Work Slots** = base function; **Upgrade Slots** = separate crew who *level up the room* (time + Salvage); **both grow with level** (padlocks = locked slots). List **only shows built/discovered rooms** (grows). **Minimal** row states (slot-fill + selected). **Selection-only — not a drop zone**; clicking a row opens the room in the central view, where assignment happens.* → §9.3.
57. **Crew strip →** *Card = portrait + name + 4 State bars + accent + **current-activity indicator**. **No special critical-state highlighting** (bars + ALERTS/personal events carry it). Exploring + empty-slot states kept as §9.3.* → §9.3.
58. **Central view = contextual, 3 modes →* **(a) Crew profile — lean:** portrait + name/role + 4 State bars + Traits + Current Activity + a single **"Reasignar"** target-picker button; **no Core Statistics** (Skills deferred, #59) and **no duplicate Condition panel** (4 bars are the source of truth). **(b) Room — per §9.3** + **specialization choice reuses the Upgrade-Slots area** (two "Desarrollar" cards → pick locks the branch → slots reappear on that track). **(c) Event — one container, two bodies:** crisis (drag-crew posts, **qualitative stakes**, **hybrid resolution**: auto-culminate at window end + "Resolver ahora") vs choice (cards, e.g. build/variant). **Build a new room is event-driven** (some rooms pre-exist; new ones arrive via events that present the type/variant cards) — no free build button.* → §9.3, §6.7.
59. **Skills layer deferred for prototype →** *The §5.1-B Skills layer is **cut from the first playable** ("por ahora no"): crew model = **State (4 bars) + Traits only**, slots **skill-agnostic**. Temporary MVP cut, not a removal.* → §5.1, §9.3, §13.3.
60. **Header / bottom bar →** *Header confirmed (name **M.A.R.A.**, 3 analog needle gauges O₂/Power/Hull, Day/Time, Sonar) **+ O₂ gauge critical highlight below 10%** (v0.4 O₂ model). Bottom bar = **icon + value only** for the 4 consumables; no trend arrows / in-bar low warnings (shortages go to ALERTS). Left panel (ALERTS + STATION LOG) confirmed as §9.3.* → §9.3, §4.1.

---
**v0.4 pass — Event system content (prototype vertical slice):**
61. **Prototype event set = 3 events →** *Schema/engine (§7.6–7.8) already done; the first playable authors **(1) Fire** (crisis/slots, from the §7.6 worked example), **(2) Build/reactivate a room** (choice/cards), **(3) Exploration opportunity** (family B · `radarContact`, opens the §10 expedition interface; ignoring expires harmlessly). Exercises both event bodies + the build & exploration flows.* → §7.9, §10.2.
62. **Cold-open O₂ →** *The **O₂ plant pre-exists but starts damaged/offline**: the station O₂ indicator opens **critical (<10%) and falls slowly**; first objective is to reactivate it. No instant wipe, no mask/reserve reintroduction (upholds #52); crew flavour = "the air is going stale," never personal mask O₂.* → §7.9, §5.5, §9.3.
63b. **Hard crew cap = 10 (always) →** *Independent of the soft O2 headcount cap (#35), the station can **never** exceed **10 crew** — the **theoretical limit of the O2 generator** even fully upgraded. The recruitment UI hard-blocks past 10; the HUD crew strip is divided into exactly 10 slots, and a single expedition party (all explorers leave/return together, sharing one return timer).* → §5.5, §9.3.
63. **Build event = notification + "build then develop" (new mechanic) →** *Building/reactivating a room is **event-driven** (triggers: **`crewComment`**, e.g. the bootstrap O₂ remark; or **`itemFound`** when exploration brings a room-gating item). The event is a **notification (image + title + text + one button)**. Pressing it **unlocks the room and moves the player there with ONLY the development/Upgrade Slots active — Work Slots stay locked until the room is developed** (crew + time + Salvage/item). For rooms with variants, the **"show 2, pick 1" cards** appear in that area first. Generalises to all newly unlocked rooms.* → §7.9, §9.3, §6.7.
