# LANDING PAGE & PLATFORM GAP ANALYSIS
*Mandatory pre-build analysis. Authored 2026-05-31. Governs the next evolution of `pulse-experience.html` (PULSE Global) and its relationship to `pulse-os-v2.html` (Farmstead Live).*

> Doctrine: Enhance, never restart. Reposition global. Separate Vision from Proof. Add the Opportunity/JV commercial moat.

---

## CURRENT STATE
- **`pulse-experience.html`** — 16 sections: Hero · Truth · Journey · Invisible Economy · Network · Trust · Discovery · Ask PULSE · Meet PULSE · Farmstead Live · Hidden Opportunity · Destination Command · Scale · Why Now · Roadmap · Why It Matters · Finale.
- **`pulse-os-v2.html`** — the live operational environment (27 pages, sidebar nav COMMAND/OPERATIONS/GUESTS/INTELLIGENCE/KNOWLEDGE/ROADMAP/PLATFORM). This **already is** Farmstead Live as a separate connected environment.

## WHAT CURRENTLY WORKS
- Opportunity-led hero ("Every Destination Has Hidden Opportunity") — destination-neutral, correct.
- Emotional arc (Truth → Journey → Invisible Economy) builds belief before logic.
- Ask PULSE interface and the canvas Network are strong category signals.
- Farmstead Live exists as a real, separate, interactive environment (not a placeholder) — bridged via "Enter Farmstead Live".

## WHAT MUST BE PRESERVED
- The hero category line + cinematic treatment.
- The canvas Network and global finale.
- Ask PULSE, Trust formula, Invisible Economy, Destination Command.
- The two-product separation (Global brand site ≠ Farmstead Live app).
- All Farmstead proof layers in `pulse-os-v2.html`.

## WHAT IS VISUALLY BROKEN  ← PRIORITY FIX
- **Network section: canvas node labels overlap the centred headline and paragraph.** Root cause: outer nodes are placed on a ring at ~0.22–0.34× the viewport min-dimension from centre, and `.network-grade` darkens the *edges* (transparent centre) — so node labels render directly over the centred copy with no readability mask. Confirmed in code (label fillText at node positions; copy max-width 760px centred).
  - **Proper fix (not just smaller font):** (1) add a centre readability mask behind the copy; (2) push nodes into an elliptical distribution biased to the edges; (3) compute a central **text-safe ellipse** and skip any label whose anchor falls inside it (and dim the node); (4) mobile already hides labels — keep, show dots/lines only; (5) responsive text-safe zone tied to viewport.

## WHERE TEXT OVERLAPS / BECOMES UNREADABLE
- Network section (above). No other section overlaps, but the network must be fixed and visually re-tested.

## WHERE THE STORY FEELS TOO HOSPITALITY-SPECIFIC
- The arc resolves at property/guest scale and only grestures at destinations. **No explicit multi-buyer value section** (tourism board / property owner / local business / investor) — institutional buyers are not directly addressed with their own language and outcomes.
- No **Opportunity/JV marketplace** — so the platform reads as "operations + discovery", not "economic participation + commercial network".

## WHERE FARMSTEAD IS OVEREXPOSED
- Acceptable today: Farmstead appears as a labelled *proof* chapter, not the hero. Keep it as proof. **Do not** elevate it above the global story. Ensure the global pillars (Opportunity, Platform Network, Audiences) sit *before* the eye fixates on Farmstead so the platform reads bigger than one farm.

## WHERE TOURISM BOARDS ARE NOT ADDRESSED STRONGLY ENOUGH
- Destination Command exists (good) but there is no **"this is for you, tourism board"** value framing, and no link from a board's needs (SME activation, regional growth, opportunity mapping) to the Opportunity layer.

## WHERE PROPERTY OWNERS ARE NOT ADDRESSED STRONGLY ENOUGH
- Owner value is implied via Farmstead but never stated as a crisp value proposition (daily ops, revenue gaps, direct booking growth, local discovery) in the global narrative.

## WHERE INVESTORS ARE NOT SEEING THE PLATFORM SCALE
- The Roadmap shows phases, but there is no explicit **network-effects / moat / repeatable-deployment** framing for investors, and no **Opportunity marketplace** (the clearest commercial-moat story).

## WHERE THE OPPORTUNITY / JV MARKETPLACE IS MISSING  ← CRITICAL
- Entirely absent as a pillar. Missing: the Opportunity object model, opportunity types, the JV/partnership workflow (Submitted → Trust Scan → Readiness → Strategic Fit → Matching → Commercial Model → JV Proposal → Agreement Draft → Pilot → Outcome), opportunity scoring (High Potential / Validate First / Needs Partners / Too Early / Low Fit / Watchlist), and example opportunities. This is the commercial moat and must be added as a top-level pillar ("Opportunity Exchange").

## WHERE THE PLATFORM-NETWORK (FUTURE PARTNER) LAYER IS MISSING
- No section shows that PULSE becomes more valuable as participants join (property owners, tourism boards, vendors, guides, restaurants, investors, municipalities, event organisers, transport, community, campaign partners) — the network-effects story.

## WHAT MUST BE UPGRADED BEFORE FURTHER FEATURE BUILDING
1. **Fix the network overlap** (visual integrity — non-negotiable).
2. **Add Opportunity Exchange / JV Network** (critical pillar + moat).
3. **Add Platform Network / Future Partner Layer** (network effects).
4. **Add a multi-audience "Built for" section** (tourism boards, owners, local businesses, investors).
5. **Enrich Ask PULSE** to output suggested participants + JV model + next action (so it demonstrates the opportunity engine, not just insight).
6. **Restructure nav** to category IA: Network · Intelligence · Trust · Opportunities · Destinations · Platform · Farmstead Live.

## BUILD PLAN (evolution — integrated into existing scroll)
```
Hero → Truth → Journey → Invisible Economy → Network(FIXED)
→ Trust → Discovery → Ask PULSE(enriched)
→ NEW: Built For (audiences)
→ NEW: Opportunity Exchange / JV Network  ← critical
→ NEW: Platform Network (future partners)
→ Meet PULSE → Farmstead Live (proof) → Hidden Opportunity
→ Destination Command → Scale → Why Now → Roadmap → Why It Matters → Finale
```
Constraints: reuse design system + GSAP/Lenis/canvas + reveal/counter patterns; no new dependencies; AI invisible (PULSE Insight/Opportunity); Opportunity outputs draft-first; Farmstead bridges (never duplicated); reduced-motion + reliability preserved.

## FINAL QUALITY GATE
Sells to a tourism board? (Destination Command + Built-For + Opportunity Exchange) · property owner? (Built-For + Farmstead Live) · municipality? (Opportunity Exchange + Destination Command) · investor? (Platform Network + Opportunity Exchange + Roadmap moat) · Farmstead as proof without limiting PULSE? (yes — proof chapter, global pillars lead) · explains JV layer? (Opportunity Exchange) · Ask PULSE searchable intelligence? (enriched outputs) · bigger than hospitality? (Opportunity + Platform Network + Destination Command). If any "no" → keep refining.
