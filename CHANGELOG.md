# [1.5.0](https://github.com/pierrebezoukhov/mandarine/compare/v1.4.1...v1.5.0) (2026-03-25)


### Bug Fixes

* greeting name flash, flashcard interaction bugs, hardcoded values ([05ad25e](https://github.com/pierrebezoukhov/mandarine/commit/05ad25ee6fa2cb398e71495fccb27288abdcfeff))
* textFaint contrast for WCAG AA compliance ([f047619](https://github.com/pierrebezoukhov/mandarine/commit/f047619443f113030db763aebc4993f3a0ac93d1)), closes [#b0a898](https://github.com/pierrebezoukhov/mandarine/issues/b0a898) [#887a68](https://github.com/pierrebezoukhov/mandarine/issues/887a68) [#4a4438](https://github.com/pierrebezoukhov/mandarine/issues/4a4438) [#6b6055](https://github.com/pierrebezoukhov/mandarine/issues/6b6055)


### Features

* DialKit integration, typewriter example reveal, flashcard layout fixes ([a4d27ef](https://github.com/pierrebezoukhov/mandarine/commit/a4d27ef7cfd864df69f3a65628d9ffe6546def6f))
* dual-theme design system — light/dark mode with "Red Ink on Aged Parchment" aesthetic ([cba0038](https://github.com/pierrebezoukhov/mandarine/commit/cba0038fb631ec1820772e58c4359e3ec8a8d1aa))
* typography alignment, square corners, button states, icon components ([bcac211](https://github.com/pierrebezoukhov/mandarine/commit/bcac211bf73bce37d1ef2329ca0f777e97920a2f))

## [1.4.1](https://github.com/pierrebezoukhov/mandarine/compare/v1.4.0...v1.4.1) (2026-03-17)


### Bug Fixes

* group example pinyin + translation — tighter gap, demote English size ([a4dc877](https://github.com/pierrebezoukhov/mandarine/commit/a4dc8772f68aebce6af6ff4ae2c933eb6bd2a7c4))
* responsive flashcard — dynamic maxHeight, scaled Hanzi on short viewports ([72caca9](https://github.com/pierrebezoukhov/mandarine/commit/72caca9384d3ab92c7e8c61f1ffc0f5fe647c15f))
* tighten padding around flashcard for larger card surface ([d26aeb3](https://github.com/pierrebezoukhov/mandarine/commit/d26aeb34979246b7e695fb214126d109577cc414))

# [1.4.0](https://github.com/pierrebezoukhov/mandarine/compare/v1.3.0...v1.4.0) (2026-03-17)


### Bug Fixes

* match flashcard text styles to prototype — larger Hanzi, mono meaning, lighter POS ([c0711f0](https://github.com/pierrebezoukhov/mandarine/commit/c0711f044383b8674cbe086a825110a023793cdc))
* session polish — icon-only rating buttons, close icon match, dim progress counter ([10eacf9](https://github.com/pierrebezoukhov/mandarine/commit/10eacf9c9595f364fc6efcb64fd137316099e081))
* stable flashcard size — use opacity instead of conditional rendering ([be02e71](https://github.com/pierrebezoukhov/mandarine/commit/be02e71b4c3a400cf32a7053ec75a51cfd30ecfe))


### Features

* 2-tap reveal flow — show example with meaning, no layout shift ([d6c6fda](https://github.com/pierrebezoukhov/mandarine/commit/d6c6fda7abc5f6bb286ae4917aba5171cf3d7bc5))
* flashcard session polish — design tokens, hover states, animations ([db13399](https://github.com/pierrebezoukhov/mandarine/commit/db13399d1cac517e3a8d4d7552023b53e358a346)), closes [#9a3030](https://github.com/pierrebezoukhov/mandarine/issues/9a3030)
* redesign flashcard session — serif Hanzi, card container, 4-stage reveal ([1b8d6d2](https://github.com/pierrebezoukhov/mandarine/commit/1b8d6d247d477c53a0d1528672592a40e5d5378b)), closes [#3a7a44](https://github.com/pierrebezoukhov/mandarine/issues/3a7a44) [#f0e8d8](https://github.com/pierrebezoukhov/mandarine/issues/f0e8d8)

# [1.3.0](https://github.com/pierrebezoukhov/mandarine/compare/v1.2.0...v1.3.0) (2026-03-14)


### Features

* add responsive layout with max-width containment for desktop ([1e397e6](https://github.com/pierrebezoukhov/mandarine/commit/1e397e62ed29bf1acae0c456bcc749d0fae88562))

# [1.2.0](https://github.com/pierrebezoukhov/mandarine/compare/v1.1.1...v1.2.0) (2026-03-14)


### Features

* add Examples tab with annotated screen mockups to design system ([5606ebb](https://github.com/pierrebezoukhov/mandarine/commit/5606ebbe98049d90d437fff5ac6b834a2ec3b3f0))
* add font weight reasoning to all Example screens + fix missing semibold ([6ec5afc](https://github.com/pierrebezoukhov/mandarine/commit/6ec5afcd003d1784bdd6847d0ec51aa6cd08f63a))
* add font weight reasoning with visual demos to Rules tab ([e005f7f](https://github.com/pierrebezoukhov/mandarine/commit/e005f7f74792d3d9d7db4c6f50ee1befbde4892c))
* add line-height reasoning with live visual demos to design system ([d21746e](https://github.com/pierrebezoukhov/mandarine/commit/d21746ed4874fed20ad03f83428bf2cca5505dd8))
* categorized annotations with design rationale on Examples tab ([4026a21](https://github.com/pierrebezoukhov/mandarine/commit/4026a21f0fa2e6295dec6e0e66a86c9b2d54d430))
* implement reasoned typography system with dual-scale architecture ([61a8c2f](https://github.com/pierrebezoukhov/mandarine/commit/61a8c2f6b349651a4ee4b666bf16780857e32407))
* rebrand HANZIFLASH → MANDARINE across all screens ([f18ff52](https://github.com/pierrebezoukhov/mandarine/commit/f18ff526ac5723ecb4c5ba96422006c05ce22c07))
* redesign auth screen — prioritize sign-in + richer logo ([3c203fe](https://github.com/pierrebezoukhov/mandarine/commit/3c203feaa19163a6b5c744e307643afffa8f5905))

## [1.1.1](https://github.com/pierrebezoukhov/mandarine/compare/v1.1.0...v1.1.1) (2026-03-12)


### Bug Fixes

* **a11y:** raise contrast ratios to pass WCAG AA across all components ([f32866f](https://github.com/pierrebezoukhov/mandarine/commit/f32866faf0e3c8ec0940e2f4cbf3b6c73df5f88a)), closes [#5C5646](https://github.com/pierrebezoukhov/mandarine/issues/5C5646) [#928A78](https://github.com/pierrebezoukhov/mandarine/issues/928A78)
* update hardcoded textMuted hex in design-system screen ([8105b69](https://github.com/pierrebezoukhov/mandarine/commit/8105b697e784a02b266cb0ae99a3057c12435a0f)), closes [#928A78](https://github.com/pierrebezoukhov/mandarine/issues/928A78)

# [1.1.0](https://github.com/pierrebezoukhov/mandarine/compare/v1.0.0...v1.1.0) (2026-03-11)


### Features

* add design system documentation page at /design-system ([588b4e2](https://github.com/pierrebezoukhov/mandarine/commit/588b4e21cd61873ebf2038b4db6d63bb16ec1825))

# 1.0.0 (2026-03-08)


### Features

* design system + persistent progress tracking ([d084285](https://github.com/pierrebezoukhov/mandarine/commit/d08428511c8cffb230902a3da275a1c6cb0f8176))
* implement real Google OAuth for web and native ([339b316](https://github.com/pierrebezoukhov/mandarine/commit/339b316129083a029b65ee65a7e515d59de51a9d))
