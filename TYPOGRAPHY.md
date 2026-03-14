# Typography — Mandarine UI Design System

> Every decision below includes its reasoning, its effect on visual hierarchy, the alternatives that were considered and rejected, and the rules that govern usage. This is a *why-first* document — if you only read the token values you're reading it wrong.

---

## Table of contents

1. [Dual-scale architecture](#1-dual-scale-architecture)
2. [Body / supporting text scale — Major Third (1.250)](#2-body--supporting-text-scale--major-third-1250)
3. [Display / title scale — Perfect Fourth (1.333)](#3-display--title-scale--perfect-fourth-1333)
4. [Character sizing — manual override](#4-character-sizing--manual-override)
5. [Full size stack](#5-full-size-stack)
6. [Line-height recommendations](#6-line-height-recommendations)
7. [Font weight usage](#7-font-weight-usage)
8. [Letter-spacing](#8-letter-spacing)
9. [Font families](#9-font-families)
10. [Implementation status](#10-implementation-status)

---

## 1. Dual-scale architecture

### Decision

The type system uses **two independent mathematical scales** rather than one unified scale:

| Scale | Ratio | Name | Domain |
|---|---|---|---|
| Body / supporting | 1.250 | Major Third | Flashcard text roles, UI copy, captions |
| Display / title | 1.333 | Perfect Fourth | Screen headings, deck names, navigation context |

Plus one **manual override** that sits outside both scales: the hero Chinese character.

### Reasoning

A single scale cannot serve both the flashcard's pedagogical hierarchy and the app's navigational hierarchy without one domain distorting the other. The flashcard needs tightly controlled steps between pinyin, translation, and example sentence — these are learning roles, not heading levels. Screen titles need editorial weight to signal "you are here" without competing with the character the learner is trying to memorise.

Separating the scales lets each system breathe. The body scale governs the flashcard's internal hierarchy; the display scale governs the app's structural hierarchy. They coexist on the same screen without mathematical conflicts because they were never forced to share a ratio.

### Effect on hierarchy

The learner encounters two distinct "registers" of typography:

- **Display register** — large, confident, sparse. Signals navigation and context ("HSK 1", "Lesson 3", "Review").
- **Body register** — compact, graduated, information-dense. Signals learning content ("character → pinyin → translation → example").

This separation prevents the common failure mode where a deck title at 32px visually competes with pinyin at 20px because both were derived from the same scale and landed too close together.

### Trade-offs considered

| Alternative | Why rejected |
|---|---|
| Single scale (e.g., 1.250 for everything) | Display headings would either be too small to signal navigation or require skipping steps, breaking the mathematical consistency that justifies using a scale at all |
| Single scale (e.g., 1.333 for everything) | Body text steps would be too large — pinyin at ~21px, translation at 16px, caption at 12px produces a stack where the caption falls below Chinese legibility minimums |
| Modular scale with custom step-skipping | Adds complexity without adding clarity; if you're skipping steps, you don't actually have a scale — you have a lookup table pretending to be mathematical |

### Usage rules

- **Do** use the body scale (`FSBody`) for any text that appears inside or alongside a flashcard.
- **Do** use the display scale (`FSDisplay`) for screen-level headings and navigation landmarks.
- **Don't** mix scales within the same visual group (e.g., don't use a display-scale size for pinyin because "it looked too small").
- **Don't** invent intermediate sizes. If neither scale produces the size you need, the design needs to change — not the scale.

---

## 2. Body / supporting text scale — Major Third (1.250)

### Decision

**Ratio:** 1.250 (Major Third)
**Base:** 16px
**Tokens:** `FSBody.ui` (16px), `FSBody.body` (16px), pinyin (20px), caption (13px)

Generated steps from 16px base:

| Step | Calculation | Rounded | Role |
|---|---|---|---|
| +1 | 16 × 1.250 | 20px | Pinyin |
| 0 (base) | 16 | 16px | Body / Translation |
| −1 | 16 ÷ 1.250 | 13px | Example sentence / Caption |

### Reasoning

**Why 1.250 and not something else?**

Chinese characters occupy a visual square — they are wider and denser than Latin letters at the same nominal font size. A ratio that feels "medium" for English body text (say, 1.200) feels nearly flat for Chinese because the characters already fill more optical space. The Major Third at 1.250 provides just enough step contrast that pinyin (20px) is visibly larger than a translation (16px) on a phone screen, while a caption (13px) remains legible for Chinese text.

This ratio was chosen specifically for a **4-level flashcard hierarchy** on mobile:

1. Character — manual override, outside this scale
2. Pinyin — 20px, one step above base
3. Translation — 16px, the base
4. Example sentence — 13px, one step below base

The bottom of the stack (13px) is the critical constraint. Chinese characters with complex stroke counts (e.g., 龍, 鬱) become illegible below ~12px on most mobile screens. At 13px we maintain a safety margin above that floor while keeping the example sentence visually subordinate.

### Effect on hierarchy

The 1.250 ratio produces steps that are **perceptible but not dramatic**. This is intentional. On a flashcard, the learner's eye should be magnetically pulled to the hero character (which is outside this scale entirely), then scan downward through supporting information in a smooth gradient of diminishing emphasis. If the steps were too large (say, 1.5), pinyin at 24px would start to compete with the character for attention. If too small (say, 1.125), pinyin at 18px and translation at 16px would feel like the same level, and the learner would have to consciously parse which is which.

### Trade-offs considered

| Alternative | Ratio | Pinyin / Body / Caption | Why rejected |
|---|---|---|---|
| Minor Second | 1.125 | 18 / 16 / 14 | Pinyin and body are only 2px apart — hierarchy between learning roles collapses. The learner can't instantly distinguish "pronunciation guide" from "meaning." |
| Major Second | 1.200 | 19 / 16 / 13 | Viable but pinyin at 19px is optically too close to 16px for Chinese text. The density of Chinese glyphs needs a slightly wider gap to register as a distinct level. |
| **Major Third** | **1.250** | **20 / 16 / 13** | **Selected.** 4px gap between pinyin and body is perceptible; caption stays above the 12px Chinese legibility floor. |
| Perfect Fourth | 1.333 | 21 / 16 / 12 | Caption hits the legibility floor exactly — no safety margin. Complex characters like 龍 at 12px are a readability risk on lower-density screens. |
| Perfect Fifth | 1.500 | 24 / 16 / 11 | Caption falls below legibility. Pinyin at 24px starts to feel like a heading, not a supporting annotation. |
| Golden Ratio | 1.618 | 26 / 16 / 10 | Completely unusable at the bottom of a 4-level stack on mobile. |

### Usage rules

- **Do** use 20px for pinyin in all flashcard contexts.
- **Do** use 16px as the base for translation text, UI controls, and button labels.
- **Do** use 13px for example sentences, captions, and tertiary metadata.
- **Don't** use the body scale for screen titles or deck names — those belong to the display scale.
- **Don't** drop below 13px for any Chinese text. If you need smaller text, it must be Latin-only (e.g., a timestamp, a version number).
- **Don't** add intermediate steps (e.g., 17px or 18px). The scale has three levels for the flashcard's three supporting roles. If you need a fourth, re-examine whether the information hierarchy is correct.

---

## 3. Display / title scale — Perfect Fourth (1.333)

### Decision

**Ratio:** 1.333 (Perfect Fourth)
**Base:** 16px (shared with body scale)
**Tokens:** `FSDisplay.title` (28px → spec target ~42px), `FSDisplay.heading` (21px → spec target ~32px)

Generated steps from 16px base:

| Step | Calculation | Rounded | Role |
|---|---|---|---|
| +3 | 16 × 1.333³ | 42px | Screen title / H1 |
| +2 | 16 × 1.333² | 32px | H2 / Deck name |
| +1 | 16 × 1.333¹ | 21px | Sub-heading / card heading |
| 0 | 16 | 16px | (shared base, governed by body scale at this level) |

### Reasoning

The display scale serves the **app's navigational skeleton** — the parts of the interface that tell the learner where they are (screen titles), what collection they're in (deck names), and what section they're looking at (sub-headings).

The Perfect Fourth was chosen because it produces **editorial-weight headings** that feel authoritative without being bombastic. At +3 steps, a screen title lands at ~42px — large enough to anchor a screen but small enough to coexist with a 64–72px hero character on a flashcard view. At +2 steps, a deck name at ~32px provides clear structural hierarchy without encroaching on the title's territory.

The 1.333 ratio is more aggressive than the body scale's 1.250 because headings need to **jump** out of the body text. If both scales used 1.250, a sub-heading at 20px would be the same size as pinyin — the navigational hierarchy would collide with the learning hierarchy.

### Effect on hierarchy

Display-scale text says "this is structure." Body-scale text says "this is content." The learner never confuses a deck name for a pinyin annotation because they live in different typographic registers with different step sizes.

The three display steps create a clear **nesting signal**: screen title (42px) → section/deck name (32px) → sub-heading (21px). Each step down means "one level deeper in the navigation tree."

### Trade-offs considered

| Alternative | Ratio | H1 / H2 / H3 | Why rejected |
|---|---|---|---|
| Major Third (same as body) | 1.250 | 31 / 25 / 20 | H1 at 31px feels weak for a screen title; H3 at 20px collides with pinyin. The two scales lose their independence. |
| **Perfect Fourth** | **1.333** | **42 / 32 / 21** | **Selected.** Clear separation between all three heading levels; H3 at 21px is distinct from pinyin at 20px (different weight and tracking clinch the distinction). |
| Perfect Fifth | 1.500 | 54 / 36 / 24 | H1 at 54px crowds the hero character (64–72px). The display scale should never compete with the flashcard's focal point. |
| Golden Ratio | 1.618 | 68 / 42 / 26 | H1 at 68px literally overlaps the character size range. Unusable. |

### Usage rules

- **Do** use ~42px for top-level screen titles (one per screen, maximum).
- **Do** use ~32px for deck names, category headers, and secondary structural headings.
- **Do** use ~21px for sub-headings within a screen (section titles, card group headers).
- **Don't** use display-scale sizes inside a flashcard's content area. The flashcard is body-scale territory (plus the manual character override).
- **Don't** stack more than one H1 on a single screen. If you need two 42px headings, the information architecture is wrong.
- **Don't** use display scale for interactive controls (buttons, tabs, inputs). Controls use the body scale's base (16px).

---

## 4. Character sizing — manual override

### Decision

**Token:** `FSDisplay.hanzi`
**Value:** 64–72px on mobile (current implementation: 96px — see [§10](#10-implementation-status))
**Scale membership:** None. This value is deliberately outside both the body and display scales.

### Reasoning

The Chinese character on a flashcard is not a heading, not a title, not a UI element. It is **the product** — the thing the learner is paying attention to learn. It deserves to break the mathematical type system because its size is a **pedagogical decision**, not a typographic one.

The character must feel like the primary stimulus so the brain instantly identifies what is being studied. This is grounded in spaced-repetition learning science: the stimulus should be unambiguous, instantly recognisable, and visually dominant. Cognitive load theory suggests that when the stimulus is visually similar in weight to surrounding context (pinyin, translation), the learner wastes processing cycles disambiguating roles instead of encoding the character.

**Why 64–72px specifically?**

- **Lower bound (64px):** At this size, even stroke-dense characters (龍, 鬱, 鑫) remain fully legible with clear stroke separation on a 375px-wide mobile viewport. The character occupies roughly 17% of screen width — large enough to be the undeniable focal point.
- **Upper bound (72px):** Beyond 72px, the character begins to crowd the supporting text stack below it (pinyin + translation + example sentence), particularly on shorter phones (iPhone SE, compact Androids). At 72px the character still leaves ~60% of the viewport for context.
- **Why not larger (96px, current implementation):** 96px occupies 25% of a 375px viewport. On compact screens, this forces the example sentence below the fold or compresses vertical spacing between text roles. The character is already the hero at 64px — making it larger doesn't make it *more* primary, it just steals space from context that aids retention.

### Effect on hierarchy

The manual override creates a **deliberate rupture** in the type system. Both mathematical scales produce smooth, predictable progressions. The character breaks that smoothness — it jumps from the display scale's ceiling (~42px) to 64–72px, a gap of 22–30px with no intermediate step. This rupture is the signal. It says: "This is not a heading. This is not navigation. This is the thing."

The gap between the character (64–72px) and the next largest text (screen title at ~42px) is large enough that no learner will confuse the two roles, even peripherally.

### Trade-offs considered

| Alternative | Size | Why rejected |
|---|---|---|
| Derive from display scale (+4 steps at 1.333) | 56px | Technically "correct" mathematically but undersized — the character doesn't feel like a rupture, it feels like a slightly bigger heading. Undermines the pedagogical intent. |
| Derive from display scale (+5 steps at 1.333) | 75px | Close to the recommended range but ties the character to a scale it shouldn't belong to. When the display ratio changes, the character size changes — but character sizing should be stable because it's a learning-science decision, not a design-system decision. |
| Current implementation | 96px | Too large for compact viewports. See reasoning above. |
| Viewport-relative (e.g., 18vw) | ~67px on 375px | Appealing in theory, but Chinese characters need absolute pixel control for stroke clarity. A 1px difference in stroke rendering at complex characters matters more than fluid scaling. |
| **Manual 64–72px** | **64–72px** | **Selected.** Large enough to be unambiguous hero. Small enough to preserve context. Decoupled from both scales so it's stable under scale changes. |

### Usage rules

- **Do** use 64–72px for the primary character on a flashcard.
- **Do** keep this value as a manual constant, not derived from any ratio.
- **Don't** use this size for anything other than the flashcard's hero character. If another element needs to be this large, question whether it belongs on the same screen as a flashcard.
- **Don't** animate the character size (e.g., scale-up on reveal). The character should arrive at full size instantly — animation adds latency between stimulus and recognition, which harms recall encoding.
- **Don't** go below 64px even on compact screens. If the viewport is too small, reduce context (hide example sentence) rather than shrinking the stimulus.

---

## 5. Full size stack

### Decision

The complete type size inventory, combining both scales and the manual override:

| Token | Size | Scale | Role | Weight | Tracking |
|---|---|---|---|---|---|
| `hanzi` | 64–72px | Manual | Flashcard hero character | Regular (400) | Tight (−0.05em) |
| `title` | ~42px | Display +3 | Screen title / H1 | Semibold (600) | Tight (−0.025em) |
| `heading` | ~32px | Display +2 | Deck name / H2 | Semibold (600) | Tight (−0.025em) |
| `subheading` | ~21px | Display +1 | Sub-heading / card heading | Semibold (600) | Tight (−0.025em) |
| `pinyin` | 20px | Body +1 | Pinyin romanization | Regular (400) | Loose (+0.025em) |
| `ui` | 16px | Body base | Buttons, inputs, nav controls | Medium (500) | Normal (0) |
| `body` | 16px | Body base | Translation, body copy | Regular (400) | Normal (0) |
| `caption` | 13px | Body −1 | Example sentence, metadata | Regular (400) | Normal (0) |

### Reasoning

This stack encodes three simultaneous hierarchies:

1. **Size** signals priority — what to look at first.
2. **Weight** signals interactivity — what can be tapped vs. what is read.
3. **Tracking** signals register — display text is tightened (dense, editorial), body text is neutral, phonetic text is loosened (airy, readable as individual syllables).

These three axes work together so that no two text roles share the same combination. Even where sizes are close (pinyin at 20px vs. sub-heading at 21px), the weight and tracking differences make them instantly distinguishable.

### Effect on hierarchy

Reading the stack top-to-bottom mirrors the learner's intended scan path:

1. **Character** — "What am I learning?" (massive, isolated)
2. **Title/Heading** — "Where am I?" (large, bold, tight)
3. **Pinyin** — "How is it pronounced?" (medium, light, loose)
4. **Body** — "What does it mean?" (base size, neutral)
5. **Caption** — "Show me an example." (small, quiet)

No two adjacent levels can be confused because each step changes at least two of the three axes (size, weight, tracking).

### Usage rules

- **Do** treat this table as the exhaustive inventory. Every text element in the app should map to one of these eight roles.
- **Don't** create ad-hoc sizes (e.g., 18px or 24px) that fall between defined steps. If a design requires a size not in this table, the design is wrong or the table needs a formal revision — not a one-off exception.
- **Do** use the token names (`hanzi`, `title`, `heading`, etc.) in code and design discussions, not raw pixel values. Saying "make it 21px" is fragile; saying "make it `heading` scale" is intentional.

---

## 6. Line-height recommendations

### Decision

Line heights follow a **tapering ratio** — generous for small text, tight for large text — rather than a flat multiplier. All values snap to a 4px grid for vertical rhythm.

| Role | Font size | Line height | Ratio | Grid-snapped |
|---|---|---|---|---|
| `caption` | 13px | 20px | 1.54 | ✓ (4px grid) |
| `body` / `ui` | 16px | 24px | 1.50 | ✓ |
| `pinyin` | 20px | 28px | 1.40 | ✓ |
| `subheading` | 21px | 28px | 1.33 | ✓ |
| `heading` | 32px | 40px | 1.25 | ✓ |
| `title` | 42px | 48px | 1.14 | ✓ |
| `hanzi` | 64–72px | 72–80px | ~1.12 | ✓ |

### Reasoning

**Why taper instead of using a flat 1.5× everywhere?**

Large text at 1.5× line height wastes enormous amounts of vertical space. A screen title at 42px with 1.5× leading would need 63px of line height — this pushes content below the fold on mobile for no readability benefit, since large text is read as single lines or short phrases, not paragraphs.

Small text needs generous leading because it's read in multi-line blocks (example sentences, descriptions) where the eye must track back to the start of the next line. At 13px, a 1.54 ratio provides enough air between lines to prevent the density of Chinese characters from creating a visual wall.

**Why a 4px grid?**

Snapping line heights to a 4px grid creates a consistent vertical rhythm. When a 16px/24px body paragraph sits above a 13px/20px caption, the baselines maintain a predictable cadence. This matters less on mobile than in editorial design, but it prevents the subtle "something feels off" that comes from arbitrary leading values.

**Mixed Chinese/Latin text considerations:**

Chinese characters are optically taller than Latin lowercase (they fill the full em square). When Chinese and Latin text appear on the same line (common in example sentences: "我喜欢 coffee"), the line height must accommodate the taller Chinese glyphs. The ratios above are calibrated for Chinese-primary text. If a line is Latin-only (e.g., a settings label), these line heights will feel slightly generous — that's acceptable; slightly loose Latin text is invisible, but cramped Chinese text is painful.

### Trade-offs considered

| Alternative | Why rejected |
|---|---|
| Flat 1.5× for all sizes | Wastes vertical space at display sizes; title at 42px would need 63px line height |
| Flat 1.2× for all sizes | Too tight for body and caption text; multi-line Chinese text becomes a dense block |
| No grid, exact ratios | Produces fractional line heights (e.g., 19.5px) that cause sub-pixel rendering artifacts and break vertical rhythm |

### Usage rules

- **Do** use the line-height tokens (`LH.*`) from `theme/tokens.ts` rather than calculating line height manually.
- **Do** test multi-line Chinese text at every body/caption size to verify stroke clarity between lines.
- **Don't** override line height to "make things fit." If content overflows, reduce content or rethink layout — don't compress leading.
- **Don't** use unitless line-height multipliers in React Native (they behave inconsistently). Always use absolute pixel values from the `LH` scale.

---

## 7. Font weight usage

### Decision

Three weights only. No bold. No thin. No light.

| Token | Weight | Role | Why this weight |
|---|---|---|---|
| `FW.regular` (400) | Regular | Prose, translations, pinyin, captions, example sentences | The default. Most text in a learning app is *read*, not *acted upon*. Regular weight keeps reading text quiet so the character stays dominant. |
| `FW.medium` (500) | Medium | Interactive controls: buttons, chips, tabs, list primary labels | Medium weight signals "this can be tapped." It's heavier than prose (distinguishing it from passive text) but lighter than headings (it's not a landmark, it's an affordance). |
| `FW.semibold` (600) | Semibold | Screen headings, deck names, section titles, nav bar labels | Semibold signals "this is a structural landmark." Combined with display-scale sizing, it creates confident, editorial headings without the heaviness of bold (700), which would compete with the character's stroke density. |

### Reasoning

**Why not bold (700)?**

Chinese characters at bold weight thicken their strokes, which reduces the white space between strokes — the very white space that makes characters legible and distinguishable. At display sizes (32px+), bold Chinese text can feel muddy. Semibold (600) adds enough emphasis for headings without degrading stroke clarity.

For the hero character specifically, regular weight (400) is mandatory. The learner needs to see the character as it would appear in normal reading — adding weight would teach a visual form that doesn't match real-world text.

**Why only three weights?**

Each weight encodes a semantic role:
- Size → priority (what to look at first)
- **Weight → interactivity** (what to tap vs. what to read)
- Color → role (accent for CTA, muted for metadata)

With three clearly separated weights, the learner's peripheral vision can distinguish "structural landmark" (semibold) from "tappable control" (medium) from "readable content" (regular) without consciously parsing it. Adding a fourth weight (e.g., light at 300 for captions) would blur the system — is light "less important" or "not interactive"?

### Effect on hierarchy

Weight operates as the **second axis** of the hierarchy, orthogonal to size. This matters most where sizes are close:

- **Sub-heading (21px, semibold)** vs. **Pinyin (20px, regular):** Only 1px apart in size, but the weight difference (600 vs. 400) makes their roles unambiguous. The sub-heading is a landmark; the pinyin is a pronunciation guide.
- **UI text (16px, medium)** vs. **Body text (16px, regular):** Identical sizes, but the weight difference signals that UI text is interactive and body text is passive.

### Trade-offs considered

| Alternative | Why rejected |
|---|---|
| Two weights (regular + bold) | Bold is too heavy for Chinese headings (see above). And with only two weights, interactive controls (medium) can't be distinguished from headings. |
| Four weights (+ light 300) | Light weight at small sizes (13px captions) reduces legibility, especially for Chinese text. And the semantic mapping becomes ambiguous — what does "light" mean? |
| Variable weight for character based on stroke count | Intriguing (heavier weight for simple characters, lighter for complex ones) but adds implementation complexity and teaches inconsistent visual forms. |

### Usage rules

- **Do** omit `fontWeight` from styles when regular (400) is intended — rely on the system default.
- **Do** use `FW.medium` for all interactive text (buttons, chips, tabs, links).
- **Do** use `FW.semibold` for all structural headings.
- **Don't** use `FW.semibold` on the hero character. The character must be regular weight to match its natural reading form.
- **Don't** use bold (700) or black (800+) anywhere in the app.
- **Don't** use weight to create emphasis within body text (e.g., bolding a word in a translation). Use color (`T.textPrimary` vs. `T.textSecondary`) instead — weight changes in Chinese text disrupt stroke rhythm.

---

## 8. Letter-spacing

### Decision

Four tracking values, each tied to a typographic register:

| Token | Value | Applied to | Why |
|---|---|---|---|
| `LS.tighter` | −0.05em | Hero character, score, seal | Large display text has natural optical looseness — negative tracking restores visual density and cohesion |
| `LS.tight` | −0.025em | Screen titles, headings | Heading text benefits from slightly tighter tracking to feel editorial and intentional, not default |
| `LS.normal` | 0 | Body text, UI controls | Neutral tracking for maximum readability at body sizes |
| `LS.loose` | +0.025em | Pinyin, phonetic badges, part-of-speech tags | Positive tracking aids phonetic readability — pinyin syllables need air between them so the learner parses each syllable individually |

### Reasoning

**Why loosen pinyin specifically?**

Pinyin is read differently from prose. The learner doesn't scan it as a sentence — they parse it syllable by syllable ("zhōng" + "guó" + "rén"). Positive letter-spacing inserts visual gaps that align with this parsing behaviour. Tight or neutral tracking would cause syllable boundaries to blur, especially in multi-syllable words without spaces.

**Why tighten display text?**

At large sizes (28px+), the default inter-character spacing looks loose and unintentional — like the letters are drifting apart. Negative tracking at −0.025em to −0.05em pulls them back into a cohesive word shape. This is standard practice in editorial typography and especially important for Chinese characters, where each glyph is a uniform square — without tightening, a row of large characters looks like a grid, not a word.

### Usage rules

- **Do** calculate tracking as `letterSpacing: LS.tight * fontSize` (the tokens are em-relative multipliers).
- **Do** apply `LS.loose` to all pinyin text regardless of context (flashcard, list, search result).
- **Don't** apply positive tracking to Chinese body text — it fragments the reading flow.
- **Don't** apply negative tracking to text below 20px — it causes characters to collide on lower-density screens.

---

## 9. Font families

### Decision

| Usage | Font | Platform |
|---|---|---|
| All prose and UI text | System default | San Francisco (iOS), Roboto (Android) |
| Counters, pinyin, part-of-speech tags, fixed-width numerics | `MONO` | Menlo (iOS), monospace (Android) |

**Token:** `MONO` from `theme/tokens.ts`

### Reasoning

System fonts are chosen deliberately, not by default. San Francisco and Roboto are optimised for their respective platforms' rendering engines, hinting tables, and CJK fallback chains. A custom Latin font would require bundling a separate CJK-compatible font (adding 5–15MB to the app bundle) and would likely have inferior Chinese character rendering compared to the system's native CJK fonts (PingFang SC on iOS, Noto Sans CJK on Android).

Monospace is used for pinyin and counters because these elements benefit from fixed-width alignment — pinyin syllables in a grid should align vertically, and progress counters ("3 / 20") should not shift width as digits change.

### Trade-offs considered

| Alternative | Why rejected |
|---|---|
| Custom display font (e.g., a calligraphic Chinese font for the hero character) | Adds bundle size; more critically, the learner should see characters in the same font they'll encounter in daily reading — a calligraphic style teaches a visual form that doesn't transfer to screen text, signage, or messaging apps |
| Custom Latin body font (e.g., Inter, Source Sans) | Minimal benefit over system fonts; adds bundle weight; complicates CJK fallback chains; Inter in particular has become a generic "AI app" signifier |
| Variable font for weight interpolation | React Native's font weight support is inconsistent with variable fonts across platforms; the three-weight system (400/500/600) maps cleanly to static weights |

### Usage rules

- **Do** use `MONO` for all fixed-width display: counters, timers, pinyin, numeric scores.
- **Don't** use `MONO` for body text, headings, or translations — it's harder to read in continuous text.
- **Don't** bundle custom fonts without a clear pedagogical or brand justification that outweighs the bundle-size cost.

---

## 10. Implementation status

The current codebase (`theme/tokens.ts`) diverges from this spec in several places. These are noted here for reconciliation:

| Token | Current value | Spec target | Action needed |
|---|---|---|---|
| `FSDisplay.hanzi` | 96px | 64–72px | Reduce — current size crowds context on compact viewports |
| `FSDisplay.title` | 28px | ~42px | Increase — current value is closer to a sub-heading than a screen title |
| `FSDisplay.heading` | 21px | ~32px | Increase — current value matches spec's sub-heading level |
| `FSBody.body` | 14px | 16px | Increase to match spec base size |
| `FSBody.label` | 12px | 13px | Increase — 12px is at the Chinese legibility floor |
| Missing token | — | `subheading` ~21px | Add — the current `heading` at 21px should be relabeled as sub-heading |

> **Note:** These changes should be made as a coordinated migration, not piecemeal. Changing `body` from 14px to 16px without adjusting surrounding spacing and layout will break existing screens. Plan a dedicated typography migration pass.
