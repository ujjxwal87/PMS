# HiLabs Design System

The brand and presentation system used by **HiLabs** in its client-facing work with **Molina Healthcare**. Everything here was reverse-engineered from a folder of real HiLabs decks — theme colours, slide masters, type ladder, logo files, brand glyphs and photography were extracted from the PowerPoint packages themselves, not from a written brand book.

---

## 1. Company and product context

HiLabs is a healthcare AI company. Its work with Molina Healthcare, as described in the source material, runs across three programmes:

- **Provider Data Accuracy (R3 / PDA)** — auditing and cleaning Molina's provider directory. Providers are scored 0-100; the decks talk in buckets: *auto-terms (0-5)*, *6-15s*, *inconclusives (26-75)*, *accurates (>75)*. Work is measured per state market (WA, NY, CA, KY, IL, …) and validated by Molina "Secret Shopper" calling.
- **Roster Automation** — a tool that normalises delegated and non-delegated provider rosters to QNXT configuration requirements, validates them, and feeds the autoloader. Rolled out to markets in numbered *Waves*.
- **MCheck / Supplemental Data Ingestion** — an AI file-mapping pipeline for supplemental clinical data, measured on the share of files processed without manual intervention.

There is **no shipped product UI in the provided sources** — no codebase, no Figma file, no screenshots of the applications. The artifacts HiLabs produces for this client are decks: a weekly sync deck and a quarterly business review (QBR). This design system is therefore built around **presentation and document surfaces**, not app screens. No UI kit has been authored, because inventing one would mean inventing a product that the sources do not show.

### Sources given

Local mounted folder `PPTS/` — roughly 60 PowerPoint files, weekly and quarterly, spanning April 2025 to May 2026:

| Path | What it is |
|---|---|
| `PPTS/Molina_HiLabs_QBR - Q32025_FinalDraft.pptx` | 30-slide quarterly business review; **primary source** for the visual system |
| `PPTS/Molina_HiLabs_QBR - Q2.pptx`, `… Q2 PDA.pptx` | Previous QBRs |
| `PPTS/<Month> <Year> Weekly PPTs/*.pptx` | Weekly sync decks (mostly Calibri working drafts, not brand-styled) |
| `PPTS/Mar 26 weekly PPTs/HiLabs Claims Model Overview.pptx` | Model explainer deck |
| `PPTS/HiLabs Phone re-validation model explanation.pptx` | Model explainer deck |
| `PPTS/KP_HiLabs_Tech 06 02 - Copy.pptx` | **Not read** — exceeds the 30 MB import limit |

Working copies of the four decks that were parsed live in `_src/`, together with every image extracted from the QBR (`_src/media/`).

---

## 2. Content fundamentals

**Voice.** Consultant-to-client. Analytical, quantified, unhurried. The decks are written for a joint working session between two organisations, so the copy is neutral about ownership: it names who does what ("HiLabs to conduct POC on AZ, NY, WA markets", "Molina to conduct testing and give go-ahead") rather than saying "we" and "you". First person is almost absent; the one exception is a plural collective in forward-looking headlines — *"To track short and long-term value we will track and report key KPIs."*

**Headlines are findings, not labels.** Every content slide's title states the conclusion in a full clause:

> *Directory cleanup shows accuracy improvement — more action on inaccurates needed*
> *Higher accuracy improvements in states that are deleting auto-terms*
> *Recency based scoring claims model reduces false positives in testing*
> *Room for ~14-22% additional improvement from action on auto-terms and 6-15s*

A title like "Market performance" would be out of register. The title carries the argument; the body carries the evidence.

**Numbers are hedged and specific at the same time.** Ranges and approximations are used deliberately and kept in the copy verbatim: `~11%`, `~14-22%`, `>40%`, `10–12%`, `5-10%`, `n = 800 test sample`. Never round these away when reusing them. Percentages of a total are almost always given with the raw count beside them — *"453 (≈70%)"*, *"11,765 unique rendering NPIs"*.

**Casing.** Sentence case for headlines and body. Title Case appears on slide titles inconsistently across authors; sentence case is the house preference going forward. ALL CAPS is reserved for three things: label bands over a table (`Q4 2025 IMPROVEMENT INITIATIVES`), structural labels inside a block (`ISSUE`, `NEW SOLUTION`, `KEY TAKEAWAYS`, `DISCUSSION QUESTIONS`, `PROPOSED`, `COMPLETED`), and eyebrows.

**Recurring copy patterns.** Analysis slides are built from a fixed rhetorical skeleton, and it is worth keeping:

- **Issue:** … → **New Solution:** … → **Overall Directory Impact:** …
- **Key Takeaways:** … → **Markets to review:** … → **Markets that need to push for heavier deletion:** …
- **Achievements** / **Lessons Learned and Plan Forward** / **Risks & Watch Items** / **Upcoming Asks** / **What's Next**
- **Baseline:** … → **Post-implementation:** …
- **DISCUSSION QUESTIONS** closes a slide that needs a decision from the client.

**Terminology is fixed vocabulary, not synonyms.** *Accurates*, *inaccurates*, *inconclusives*, *auto-terms*, *6-15s*, *rejected leads*, *false positives / false negatives*, *Secret Shopper*, *market* (never "state" in a business sentence), *wave*, *touchless*, *TAT* (turnaround time), *NPI*, *QNXT*, *TPDM*, *PDM*, *HEDIS*, *DQ*, *non-PAR*. Reuse them exactly.

**Footers and disclaimers.** Every slide except the title carries *"Confidential & Proprietary | HiLabs 2025"* bottom-right and a page number. Data slides carry a *"Note:"* line under the table stating scope and exclusions — *"Note: Statistics at NPI address level and does not include the following markets: VA, OH, TX, NE"*. Do not drop it.

**Emoji: never.** Not one appears in any source deck. Unicode is used only for arithmetic and comparison marks: `~`, `>`, `<`, `→`, `≈`, an en dash in numeric ranges, and `•` for bullets.

---

## 3. Visual foundations

**Palette.** The PowerPoint theme is literally named *HiLabs Theme* and defines the whole system: **HiLabs Blue `#2A69F1`** (accent1) is the brand colour and the only saturated hue used for emphasis; **Ink `#002859`** and **Navy `#002B7E`** are the dark grounds; **Sky `#95CCEF`** and **Azure `#70ADEA`** are the supporting tints; body copy is true black `#000000` on white. Grey `#BFBFBF` is the default rule colour. Status colour is borrowed from Excel conditional formatting and used consistently: green `#00B050` on `#D6FEE9`, amber on `#FDEDDD`, red on `#FFC7CE`, blue on `#D4E1FC`. Two background colours per deck, no more: white and Ink.

**Type.** **Satoshi** throughout — set on every title and body style in the slide masters. Satoshi Black for hero and section headlines (40pt), Bold for content-slide titles (25-32pt), Regular for body. Line height is a tight 90% on titles and body alike; the decks are dense and the leading reflects it. The body ladder steps 20 / 18 / 16 / 14pt, with 14pt doing most of the work and 11pt for table interiors. Arial, Aptos and Calibri appear in the files as PowerPoint fallbacks and in unstyled working decks — they are not brand choices. Tracking is normal everywhere except all-caps labels, which open to ~0.08em.

**Geometry and corner radii.** The brand's shape language is the **half-capsule**: a rectangle with one end fully rounded and the other square. It shows up as the 21×47px blue tab flush against the left edge of every content slide, in the phase bars on rollout timelines, and in the abstract brand glyphs. Consequently radii are bimodal — either `0` (label bands, tables, photographs) or fully pill `999px` (tabs, bars, buttons, badges). An 8px radius is used only for the white logo plate on the title slide. Mid-range radii are foreign to this brand.

**Backgrounds.** Three treatments and nothing else. (1) Plain white — the default for content. (2) Flat Ink navy — section dividers. (3) One photograph, used repeatedly: a dark navy render of a glowing network mesh over a globe (`assets/bg-network-dark.png`), always full-bleed, always behind a navy scrim, always with white type. There are no illustrations, no patterns, no textures, no gradients as decoration — the only gradient in the system is the protection scrim over that photograph.

**Imagery colour vibe.** Cool, dark, high-contrast, near-monochrome blue. No warm imagery, no photography of people, no stock office scenes. Brand glyphs are flat single-colour silhouettes with no outline, gradient or shadow.

**Cards and separation.** Blocks are separated by fill and hairline rule, not by shadow. A card is a white or lightly tinted rectangle with an 8px radius and a 1px `#E7E6E6` outline; `--shadow-card` (a 1px navy-tinted whisper) is the heaviest elevation that belongs on a slide. Deeper shadows exist as tokens for on-screen artifacts only. Tables use 0.75px `#BFBFBF` horizontal rules, a solid navy header row, and zebra striping in `--grey-50`.

**Emphasis devices.** In descending order of loudness: a solid blue chip behind a number; a black or navy full-width label band above a block; the blue half-capsule tab; a 3px blue rule above a stat; a coloured 4px leading bar on a callout; a RAG-tinted table cell. Only one of the top two per slide.

**Layout rules.** The stage is 1280×720 (16:9; the source files are 12 192 000 EMU wide). Fixed positions taken from the masters: left and right margin 36px; title at y=30, 1207px wide, 60px tall, vertically centred; content region y=120 through y=653; footer baseline y=676 with the HiLabs mark at x=36, the confidentiality line ending at x≈1207, and the page number flush right at x=1180. The blue accent tab sits at x=0, y=37. Keep these — a deck built on this system should stack seamlessly with pages exported from the real template.

**Transparency and blur.** Effectively unused. Transparency appears only inside the hero scrim and as low-opacity brand glyphs used as section ornament (7-12%). No frosted glass, no backdrop blur.

**Motion.** The source is static PowerPoint with no custom transitions, so there is no inherited motion language. For on-screen artifacts the system defines a conservative one: 120-280ms, `cubic-bezier(0.2,0,0.2,1)`, fades and width/position interpolation only. No bounce, no spring, no parallax.

**Interaction states.** Also not present in the source; defined here so artifacts are consistent. Hover darkens a filled surface one step on the blue ramp (500 → 600) or lays an 8% blue tint over a transparent one. Press scales to 0.98 and holds the hover colour. Focus is a 3px `rgba(42,105,241,0.35)` ring, never an outline colour change alone. Disabled is 40% opacity with `not-allowed`.

---

## 4. Iconography

**There is almost no icon system in the source, and this system does not invent one.** Across the entire QBR package the only functional glyphs are three: a black outlined ringing-phone icon, a blue map pin, and a red medical map-pin. All three are copied into `assets/` (`icon-phone.svg`, `icon-pin.png`, `icon-pin-location.png`). Wingdings appears 13 times in the QBR — checkmarks and arrows typed as a symbol font, which is a PowerPoint habit, not a brand decision, and should not be reproduced.

What the brand *does* have is a set of six **abstract brand glyphs** built from the same half-capsule geometry as the logo: `glyph-flow`, `glyph-burst`, `glyph-layers`, `glyph-columns`, `glyph-stream`, `glyph-bars`. Each is copied in twice — as the original white-fill SVG and as a `-mono` variant whose paths are set to `currentColor` so it can be tinted or used as a CSS mask. These are **ornament, not iconography**: use them large and low-opacity behind a section headline, or small in blue as a bullet substitute. Never press one into service as a functional icon.

**Substitution, flagged.** When a real UI icon is needed — a chevron, a download, a checkmark — use **Lucide** (`https://unpkg.com/lucide-static`) at 1.5-2px stroke, square cap, sized 16/20/24. Lucide's flat single-weight outline reads closest to the brand's flat geometry. This is a substitution made by this design system, not something HiLabs has chosen; if HiLabs has a real icon library, it should replace Lucide here.

**Emoji are never used.** Unicode marks (`~ > < → ≈ •`) are.

---

## 5. Logo

`assets/logo-hilabs.svg` — the two-tone wordmark, blue "Hi" and near-black "Labs" with a superscript ™. Also supplied as `logo-hilabs-white.svg` (knockout), `logo-hilabs-mono.svg` (single-colour, `currentColor`) and `logo-hilabs.png`. There is no standalone symbol or favicon mark in the sources — only the wordmark. Molina's logo (`assets/logo-molina.png`) is included because joint decks carry it; it is a partner asset and must not be restyled.

Clear space: at least the height of the "H" on all sides. Minimum height 20px. On the network photograph the colour logo goes inside a white 8px-radius plate; never place the colour logo directly on the photograph.

---

## 6. Index

Root:

- `styles.css` — the single entry point consumers link. `@import` lines only.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `elevation.css`, `motion.css`
- `assets/` — logos, the network hero photograph, brand glyphs (plain + `-mono`), the three real icons, Molina's mark, `fonts/` (Satoshi 400/500/700/900)
- `guidelines/` — 20 specimen cards for the Design System tab (Colors, Type, Spacing, Brand)
- `components/` — the React primitives, below
- `slides/` — a seven-slide clickable HiLabs QBR deck plus one card per slide type
- `templates/qbr-deck/` — a starting deck consuming projects can copy
- `thumbnail.html`, `readme.md`, `SKILL.md`
- `_src/` — parsed source decks and every image extracted from them

### Components

| Group | Components |
|---|---|
| `components/brand/` | **Logo**, **BrandGlyph** |
| `components/core/` | **Button**, **Badge**, **Card**, **Callout** |
| `components/data/` | **StatCallout**, **DataTable**, **ProgressMeter**, **Legend** |
| `components/layout/` | **SectionBand**, **NumberedList**, **AccentTab**, **PhaseTimeline** |

Each has a sibling `.d.ts` (props contract) and `.prompt.md` (one-line what-and-when, a usage example, and the variants that matter).

### Intentional additions

The sources are decks, so they define no interactive controls. Three components have no direct counterpart in the source and were added so that on-screen artifacts have a sanctioned treatment rather than an improvised one:

- **Button** — built from the brand's pill geometry and blue ramp.
- **ProgressMeter** — a flat bar standing in for the rollout percentage columns that appear in the decks as table cells.
- **BrandGlyph** — a wrapper around glyph assets that do exist; the wrapper is the addition, not the artwork.

### Known gaps

- **No product UI kit.** No application screens exist in the sources. Ask for a codebase, a Figma file or screenshots if app surfaces are needed.
- **Satoshi is the Fontshare web build.** The source decks shipped no font binaries, so the Fontshare `.woff2` files (400/500/700/900) are vendored into `assets/fonts/` and declared in `tokens/fonts.css`. If HiLabs holds a licensed cut, replace the files in place.
- **`KP_HiLabs_Tech 06 02 - Copy.pptx` was not read** (over the import size limit).
- **Charts.** The QBR contains five native PowerPoint charts. Their colour order is captured in `--chart-1`…`--chart-8`, but no chart component is authored here.
