import React, { useState, ReactNode } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { T, MONO, FS, FSDisplay, FSBody, LH, LS, FW } from '@/theme/tokens';
import { space, radius } from '@/theme/spacing';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Field } from '@/components/Field';
import { ProgressBar } from '@/components/ProgressBar';
import { Section } from '@/components/Section';
import { SegmentedControl } from '@/components/SegmentedControl';
import { StatCard } from '@/components/StatCard';
import { TabSwitcher } from '@/components/TabSwitcher';
import { Avatar } from '@/components/Avatar';
import { BottomSheetModal } from '@/components/BottomSheetModal';

// ── Nav anchors ───────────────────────────────────────────────────────────────
const NAV_ITEMS = ['Colors', 'Typography', 'Rules', 'Spacing', 'Components', 'Examples'] as const;


export default function DesignSystemScreen() {
  // TabSwitcher demo state
  const [activeTab, setActiveTab] = useState('overview');
  // Chip demo state
  const [chipNew, setChipNew]         = useState(true);
  const [chipReview, setChipReview]   = useState(false);
  const [chipHard, setChipHard]       = useState(true);
  // SegmentedControl demo state
  const [segValue, setSegValue]       = useState<number | string>(20);
  const [segCustom, setSegCustom]     = useState(30);
  // Field demo state
  const [fieldDefault, setFieldDefault] = useState('');
  const [fieldError, setFieldError]     = useState('wrong@email');
  const [fieldPass, setFieldPass]       = useState('secret');
  // BottomSheetModal demo state
  const [sheetOpen, setSheetOpen]     = useState(false);
  // Nav
  const [activeNav, setActiveNav]     = useState<typeof NAV_ITEMS[number]>('Colors');

  return (
    <View style={s.root}>
      {/* ── Fixed header ─────────────────────────────────────────────────── */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <View>
            <Text style={s.logoHanzi}>漢字</Text>
            <Text style={s.logoLabel}>MANDARINE</Text>
          </View>
          <View style={s.headerMeta}>
            <Text style={s.versionBadge}>v1.0</Text>
            <Text style={s.headerDate}>Design System</Text>
          </View>
        </View>

        {/* Nav tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.navScroll}>
          <View style={s.nav}>
            {NAV_ITEMS.map(item => (
              <TouchableOpacity
                key={item}
                style={[s.navItem, activeNav === item && s.navItemActive]}
                onPress={() => setActiveNav(item)}
                activeOpacity={0.7}
              >
                <Text style={[s.navText, activeNav === item && s.navTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* ── Scrollable body ──────────────────────────────────────────────── */}
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>

        {/* ════════════════════════════════════════════════════════════════
            COLORS
        ════════════════════════════════════════════════════════════════ */}
        {activeNav === 'Colors' && (
          <View>
            <DocHeading>Color Palette</DocHeading>
            <DocSubheading>
              All colors live in{' '}
              <Text style={s.codeInline}>theme/tokens.ts</Text> and are
              exported as the{' '}
              <Text style={s.codeInline}>T</Text> object. Never hardcode hex
              values — always reference a token.
            </DocSubheading>

            <ColorGroup label="BACKGROUNDS">
              <Swatch token="T.bg"       hex="#131109"              label="bg"       usage="Screen backgrounds" />
              <Swatch token="T.surface"  hex="#1E1B12"              label="surface"  usage="Cards, inputs, sheets" />
              <Swatch token="T.surface2" hex="#252118"              label="surface2" usage="Progress tracks, nested surfaces" />
            </ColorGroup>

            <ColorGroup label="BORDERS">
              <Swatch token="T.border"      hex="rgba(255,248,220,0.08)" label="border"      usage="Default border on all elements" />
              <Swatch token="T.borderFocus" hex="rgba(255,248,220,0.22)" label="borderFocus" usage="Input focus ring" />
            </ColorGroup>

            <ColorGroup label="TEXT">
              <Swatch token="T.textPrimary"   hex="#F0EBE0" label="textPrimary"   usage="Headings, active labels, card titles" />
              <Swatch token="T.textSecondary" hex="#A09880" label="textSecondary" usage="Body text, secondary labels, back buttons" />
              <Swatch token="T.textMuted"     hex="#928A78" label="textMuted"     usage="Section labels, placeholders, inactive states" />
              <Swatch token="T.textHanzi"     hex="#F5F0E8" label="textHanzi"     usage="Large hanzi character on flashcards" />
            </ColorGroup>

            <ColorGroup label="ACCENT">
              <Swatch token="T.accent"       hex="#C0392B"              label="accent"       usage="Primary CTAs, active underlines, pinyin" />
              <Swatch token="T.accentDim"    hex="rgba(192,57,43,0.12)" label="accentDim"    usage="Active chip / segment fill" />
              <Swatch token="T.accentBorder" hex="rgba(192,57,43,0.28)" label="accentBorder" usage="Active chip / segment border" />
            </ColorGroup>

            <ColorGroup label="SEMANTIC">
              <Swatch token="T.error"   hex="#E05252" label="error"   usage="Error states, 'forgot' FAB" />
              <Swatch token="T.success" hex="#4A9E6B" label="success" usage="Success states, 'got it' FAB" />
            </ColorGroup>
          </View>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TYPOGRAPHY
        ════════════════════════════════════════════════════════════════ */}
        {activeNav === 'Typography' && (
          <View>
            <DocHeading>Typography</DocHeading>
            <DocSubheading>
              Font sizes split into two named groups:{' '}
              <Text style={s.codeInline}>FSDisplay</Text> and{' '}
              <Text style={s.codeInline}>FSBody</Text>. The combined{' '}
              <Text style={s.codeInline}>FS</Text> export keeps all existing
              references working. Line-heights in{' '}
              <Text style={s.codeInline}>LH</Text>; letter-spacing rules in{' '}
              <Text style={s.codeInline}>LS</Text>. Use{' '}
              <Text style={s.codeInline}>MONO</Text> for pinyin, counters,
              and fixed-width numeric display.
            </DocSubheading>

            {/* Dual-scale reasoning */}
            <View style={s.noItalicNote}>
              <Text style={[s.lhNote, { marginBottom: space.sm }]}>
                <Text style={{ color: T.textPrimary, fontWeight: FW.semibold }}>Dual-Scale Architecture</Text>
                {'\n\n'}The system uses two separate mathematical scales: Body (Major Third 1.250) for
                flashcard text roles, and Display (Perfect Fourth 1.333) for screen headings.
                A single scale cannot serve both pedagogical and navigational hierarchies — the
                flashcard needs fine gradations between pinyin, translation, and example sentence,
                while screen headings need editorial weight to anchor navigation without competing
                with the hero character. The character itself is a manual override outside both
                scales: its size is dictated by the pedagogical requirement of being the unambiguous
                primary stimulus, not by any mathematical ratio.
              </Text>
            </View>

            {/* Display scale — large, heading hierarchy */}
            <Section label="DISPLAY SCALE — LS.tighter · LS.tight">
              <TypeSpecimen
                token="FS.hanzi"
                px={FSDisplay.hanzi}
                sample="漢"
                usage={`Flashcard character — outside prose scale · LS.tighter: ${LS.tighter * FSDisplay.hanzi}px`}
                color={T.textHanzi}
                style={{ letterSpacing: LS.tighter * FSDisplay.hanzi }}
              />
              <TypeSpecimen
                token="FS.seal"
                px={FSDisplay.seal}
                sample="印"
                usage={`Session completion seal · LH.seal: ${LH.seal}px · LS.tighter: ${LS.tighter * FSDisplay.seal}px`}
                color={T.accent}
                style={{ letterSpacing: LS.tighter * FSDisplay.seal }}
              />
              <TypeSpecimen
                token="FS.score"
                px={FSDisplay.score}
                sample="84"
                usage={`Large numeric display · LH.score: ${LH.score}px · LS.tighter: ${LS.tighter * FSDisplay.score}px`}
                family={MONO}
                style={{ letterSpacing: LS.tighter * FSDisplay.score }}
              />
              <TypeSpecimen
                token="FS.title"
                px={FSDisplay.title}
                sample="Session complete"
                usage={`Screen titles, stat values · LH.title: ${LH.title}px · LS.tight: ${LS.tight * FSDisplay.title}px`}
                style={{ letterSpacing: LS.tight * FSDisplay.title }}
              />
              <TypeSpecimen
                token="FS.heading"
                px={FSDisplay.heading}
                sample="New Session"
                usage={`Deck names, H2 · LH.heading: ${LH.heading}px · LS.tight: ${LS.tight * FSDisplay.heading}px`}
                style={{ letterSpacing: LS.tight * FSDisplay.heading }}
              />
              <TypeSpecimen
                token="FS.subheading"
                px={FSDisplay.subheading}
                sample="Card Heading"
                usage={`Sub-headings, card headings · LH.subheading: ${LH.subheading}px · LS.tight: ${LS.tight * FSDisplay.subheading}px`}
                style={{ letterSpacing: LS.tight * FSDisplay.subheading }}
              />
            </Section>

            {/* Body scale reasoning */}
            <View style={[s.noItalicNote, { marginTop: space.lg }]}>
              <Text style={[s.lhNote, { marginBottom: 0 }]}>
                <Text style={{ color: T.textPrimary, fontWeight: FW.semibold }}>Why Major Third (1.250)?</Text>
                {'\n\n'}Chinese characters read more dramatically than Latin text — what feels
                "medium" in English feels large in Chinese because each glyph fills its full em
                square. 1.250 was chosen because the bottom of the stack (13px) is the critical
                constraint: Chinese characters with complex strokes become illegible below ~12px
                on mobile screens. Lower ratios (1.125-1.2) flatten the hierarchy between pinyin
                and translation, making it harder for learners to distinguish phonetic annotation
                from meaning at a glance.
              </Text>
            </View>

            {/* Body scale — readable content, UI controls */}
            <Section label="BODY SCALE — LS.normal (no tracking)">
              <TypeSpecimen
                token="FS.pinyin"
                px={FSBody.pinyin}
                sample="zhōng guó"
                usage={`Pinyin romanization · LH.pinyin: ${LH.pinyin}px · LS.normal: 0`}
                family={MONO}
                color={T.accent}
              />
              <TypeSpecimen
                token="FS.ui"
                px={FSBody.ui}
                sample="Profile"
                usage={`Inputs, buttons, nav controls — base size · LH.ui: ${LH.ui}px · LS.normal: 0`}
                bold
              />
              <TypeSpecimen
                token="FS.body"
                px={FSBody.body}
                sample="What would you like to do today?"
                usage={`Body text, subtitles, secondary copy · LH.body: ${LH.body}px · LS.normal: 0`}
              />
              <TypeSpecimen
                token="FS.label"
                px={FSBody.label}
                sample="DIFFICULTY"
                usage={`Section labels, hints, captions, badges · LH.label: ${LH.label}px · LS.normal: 0`}
                style={{ textTransform: 'uppercase' }}
              />
            </Section>

            {/* Line heights — reasoning + visuals */}
            <Section label="LINE HEIGHTS — LH">
              <Text style={s.lhNote}>
                Line height isn't a flat multiplier — it{' '}
                <Text style={{ color: T.textPrimary }}>tapers</Text> as font
                size grows. Small text gets generous leading (multi-line blocks
                where the eye must track back). Large text gets tight leading
                (single lines read in one pass). All values snap to a{' '}
                <Text style={s.codeInline}>4px grid</Text> so baselines stay in
                rhythm when different sizes stack vertically.
              </Text>

              {/* ── Token table ──────────────────────────────────── */}
              <Text style={s.lhSectionTitle}>Token reference</Text>
              {(
                [
                  { name: 'label',      fs: FS.label,      lh: LH.label,      mult: '×1.54' },
                  { name: 'body',       fs: FS.body,       lh: LH.body,       mult: '×1.50' },
                  { name: 'ui',         fs: FS.ui,         lh: LH.ui,         mult: '×1.50' },
                  { name: 'pinyin',     fs: FS.pinyin,     lh: LH.pinyin,     mult: '×1.40' },
                  { name: 'subheading', fs: FS.subheading, lh: LH.subheading, mult: '×1.33' },
                  { name: 'heading',    fs: FS.heading,    lh: LH.heading,    mult: '×1.25' },
                  { name: 'title',      fs: FS.title,      lh: LH.title,      mult: '×1.14' },
                  { name: 'score',      fs: FS.score,      lh: LH.score,      mult: '×1.14' },
                  { name: 'seal',       fs: FS.seal,       lh: LH.seal,       mult: '×1.12' },
                  { name: 'hanzi',      fs: FS.hanzi,      lh: LH.hanzi,      mult: '×1.11' },
                ] as const
              ).map(({ name, fs, lh, mult }) => (
                <View key={name} style={s.lhRow}>
                  <Text style={s.lhToken}>LH.{name}</Text>
                  <Text style={s.lhValue}>{lh}px</Text>
                  <Text style={s.lhFormula}>FS.{name} {fs}px {mult}</Text>
                </View>
              ))}

              {/* ── LH.hanzi — hero character ────────────────────── */}
              <Text style={s.lhSectionTitle}>LH.hanzi — 80px (ratio 1.11)</Text>
              <Text style={s.lhNote}>
                The hero character sits in a tight bounding box with just 8px of air.
                Excess leading would push pinyin and supporting text further down,
                wasting vertical space on compact screens. The character should feel
                like it's floating in the card centre, not inside a text container.
              </Text>
              <View style={s.lhDemoCard}>
                <Text style={s.lhDemoLabel}>session.tsx — flashcard hero</Text>
                <View style={s.lhDemoCentered}>
                  <Text style={{
                    fontSize: FS.hanzi, lineHeight: LH.hanzi,
                    color: T.textHanzi, letterSpacing: LS.tighter * FS.hanzi,
                    textAlign: 'center',
                  }}>学</Text>
                  <Text style={{
                    fontFamily: MONO, fontSize: FS.pinyin, letterSpacing: 3,
                    color: T.accent, opacity: 0.85, marginTop: 18, textAlign: 'center',
                  }}>xué</Text>
                </View>
                <View style={s.lhDemoAnnotation}>
                  <Text style={s.lhDemoAnnotationText}>
                    72px character in 80px line box — 8px air keeps pinyin close
                  </Text>
                </View>
              </View>

              {/* ── LH.score — session complete ──────────────────── */}
              <Text style={s.lhSectionTitle}>LH.score — 48px (ratio 1.14)</Text>
              <Text style={s.lhNote}>
                Large score numerics on the session completion screen. Single-line text
                that should feel punchy and immediate. The tight 1.14 ratio keeps numbers
                dense — they're not prose, they're results.
              </Text>
              <View style={s.lhDemoCard}>
                <Text style={s.lhDemoLabel}>session.tsx — completion scores</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: space.xxl, paddingVertical: space.lg }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{
                      fontSize: FS.score, lineHeight: LH.score, fontFamily: MONO,
                      color: T.success, letterSpacing: LS.tighter * FS.score,
                    }}>12</Text>
                    <Text style={{ fontFamily: MONO, fontSize: FS.label, color: T.textMuted, letterSpacing: 1.5 }}>GOT IT</Text>
                  </View>
                  <Text style={{ color: T.textMuted, fontSize: FS.subheading }}>·</Text>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{
                      fontSize: FS.score, lineHeight: LH.score, fontFamily: MONO,
                      color: T.error, letterSpacing: LS.tighter * FS.score,
                    }}>8</Text>
                    <Text style={{ fontFamily: MONO, fontSize: FS.label, color: T.textMuted, letterSpacing: 1.5 }}>FORGOT</Text>
                  </View>
                </View>
                <View style={s.lhDemoAnnotation}>
                  <Text style={s.lhDemoAnnotationText}>
                    42px numerics in 48px line box — tight, confident, no excess air
                  </Text>
                </View>
              </View>

              {/* ── LH.subheading — flashcard meaning ────────────── */}
              <Text style={s.lhSectionTitle}>LH.subheading — 28px (ratio 1.33)</Text>
              <Text style={s.lhNote}>
                Used for the flashcard's revealed meaning and example sentence in
                Chinese. These are short phrases, not paragraphs — tight leading keeps
                the characters connected as a sentence rather than isolated glyphs.
              </Text>
              <View style={s.lhDemoCard}>
                <Text style={s.lhDemoLabel}>session.tsx — meaning + example</Text>
                <View style={s.lhDemoCentered}>
                  <Text style={{
                    fontSize: FS.subheading, lineHeight: LH.subheading,
                    color: T.textPrimary, textAlign: 'center',
                    letterSpacing: LS.tight * FS.subheading,
                  }}>to study, to learn</Text>
                  <View style={{ width: 24, height: 1, backgroundColor: T.border, marginVertical: space.md, alignSelf: 'center' }} />
                  <Text style={{
                    fontSize: FS.subheading, lineHeight: LH.subheading,
                    color: '#C8BFA8', textAlign: 'center',
                  }}>我喜欢学习中文</Text>
                  <Text style={{
                    fontFamily: MONO, fontSize: FS.label,
                    color: '#7A7060', textAlign: 'center', letterSpacing: 1, marginTop: 4,
                  }}>wǒ xǐhuān xuéxí zhōngwén</Text>
                </View>
                <View style={s.lhDemoAnnotation}>
                  <Text style={s.lhDemoAnnotationText}>
                    21px text in 28px line box — characters read as a connected sentence
                  </Text>
                </View>
              </View>

              {/* ── LH.body — auth + prose ────────────────────────── */}
              <Text style={s.lhSectionTitle}>LH.body — 24px (ratio 1.50)</Text>
              <Text style={s.lhNote}>
                Standard comfortable reading. Body and UI share the same 16px/24px
                cadence, creating vertical rhythm — a body paragraph above a caption
                keeps baselines on a predictable 4px grid. This is where most
                multi-line text lives: auth subtitles, descriptions, success messages.
              </Text>
              <View style={s.lhDemoCard}>
                <Text style={s.lhDemoLabel}>auth.tsx — login subtitle</Text>
                <View style={{ paddingVertical: space.md, paddingHorizontal: space.lg }}>
                  <Text style={{
                    fontSize: FS.title, color: T.textPrimary,
                    letterSpacing: LS.tight * FS.title, marginBottom: space.xs,
                  }}>Welcome back</Text>
                  <Text style={{
                    fontSize: FS.body, lineHeight: LH.body,
                    color: T.textMuted,
                  }}>Sign in to continue your practice.{'\n'}Your progress syncs across devices.</Text>
                </View>
                <View style={s.lhDemoAnnotation}>
                  <Text style={s.lhDemoAnnotationText}>
                    16px text in 24px line box — 8px of air between lines for comfortable reading
                  </Text>
                </View>
              </View>

              {/* ── LH.label — captions + small text ─────────────── */}
              <Text style={s.lhSectionTitle}>LH.label — 20px (ratio 1.54)</Text>
              <Text style={s.lhNote}>
                The most generous ratio. Captions and example sentences are the densest
                text in the app — often multi-line Chinese with complex stroke characters.
                At 13px, characters like 龍 or 鬱 are near the legibility floor. The 1.54
                ratio adds 7px of air between lines, preventing strokes from adjacent lines
                from visually bleeding into each other.
              </Text>
              <View style={s.lhDemoCard}>
                <Text style={s.lhDemoLabel}>Card.tsx — subtitle · session.tsx — tap hints</Text>
                <View style={{ paddingVertical: space.md, paddingHorizontal: space.lg, gap: space.lg }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                    <View style={{
                      width: 36, height: 36, borderRadius: 8,
                      backgroundColor: T.accentDim, borderWidth: 1, borderColor: T.accentBorder,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: FS.ui, color: T.textPrimary }}>开</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: FS.ui, color: T.textPrimary, fontWeight: FW.medium }}>New session</Text>
                      <Text style={{
                        fontSize: FS.label, lineHeight: LH.label,
                        color: T.textMuted,
                      }}>Start a fresh round of flashcards{'\n'}with your selected deck and filters</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{
                      fontFamily: MONO, fontSize: FS.label, lineHeight: LH.label,
                      color: T.textMuted, opacity: 0.6, letterSpacing: 1.5, textAlign: 'center',
                    }}>tap · pinyin  ··  double tap · reveal all</Text>
                  </View>
                </View>
                <View style={s.lhDemoAnnotation}>
                  <Text style={s.lhDemoAnnotationText}>
                    13px text in 20px line box — generous air prevents dense Chinese strokes from bleeding
                  </Text>
                </View>
              </View>

              {/* ── LH.pinyin — phonetic annotations ─────────────── */}
              <Text style={s.lhSectionTitle}>LH.pinyin — 28px (ratio 1.40)</Text>
              <Text style={s.lhNote}>
                Tighter than body text because pinyin is typically a single line of
                romanized syllables, not a paragraph. But if it wraps (long compounds),
                28px leading prevents tone diacritics (ā, é, ǐ, ù) from colliding
                with descenders on the line above.
              </Text>
              <View style={s.lhDemoCard}>
                <Text style={s.lhDemoLabel}>session.tsx — pinyin annotation</Text>
                <View style={s.lhDemoCentered}>
                  <Text style={{
                    fontFamily: MONO, fontSize: FS.pinyin, lineHeight: LH.pinyin,
                    color: T.accent, opacity: 0.85, letterSpacing: 3, textAlign: 'center',
                  }}>zhōng guó rén</Text>
                </View>
                <View style={s.lhDemoAnnotation}>
                  <Text style={s.lhDemoAnnotationText}>
                    20px text in 28px line box — air for tone marks without paragraph-level looseness
                  </Text>
                </View>
              </View>

              {/* ── 4px grid explanation ──────────────────────────── */}
              <Text style={s.lhSectionTitle}>Why a 4px grid?</Text>
              <Text style={s.lhNote}>
                Every line height is a multiple of 4: 20, 24, 28, 40, 48, 56, 80.
                When different text sizes stack vertically — which happens constantly
                on the flashcard and profile screens — their baselines fall on a
                predictable rhythm. Without the grid, fractional pixel positions cause
                sub-pixel rendering artefacts and a subtle "something feels off" in
                the layout.
              </Text>
              <View style={s.lhDemoCard}>
                <Text style={s.lhDemoLabel}>vertical rhythm — stacked text roles</Text>
                <View style={{ paddingVertical: space.md, paddingHorizontal: space.lg, gap: 0 }}>
                  <Text style={{
                    fontSize: FS.subheading, lineHeight: LH.subheading,
                    color: T.textPrimary, fontWeight: FW.semibold,
                  }}>HSK 1 — Basic Characters</Text>
                  <Text style={{
                    fontSize: FS.body, lineHeight: LH.body,
                    color: T.textSecondary,
                  }}>150 cards across 6 categories</Text>
                  <Text style={{
                    fontSize: FS.label, lineHeight: LH.label,
                    color: T.textMuted,
                  }}>Last studied 2 days ago · 71% retention</Text>
                </View>
                <View style={s.lhDemoAnnotation}>
                  <Text style={s.lhDemoAnnotationText}>
                    28px → 24px → 20px — all multiples of 4, baselines stay in rhythm
                  </Text>
                </View>
              </View>
            </Section>

            {/* Letter spacing */}
            <Section label="LETTER SPACING — LS">
              <Text style={s.lhNote}>
                Unitless em multipliers applied as{' '}
                <Text style={s.codeInline}>letterSpacing: LS.tight * FS.title</Text>.
                Display sizes tighten progressively; body/UI text uses no tracking.
                MONO phonetic text (pinyin, badges) is exempt — positive tracking aids readability.
              </Text>
              {(
                [
                  { token: 'LS.tighter', em: LS.tighter,  example: `${LS.tighter * FSDisplay.score}px @ FS.score (${FSDisplay.score}px)`,  appliesTo: 'score · seal · hanzi' },
                  { token: 'LS.tight',   em: LS.tight,    example: `${LS.tight   * FSDisplay.title}px @ FS.title (${FSDisplay.title}px)`,   appliesTo: 'title · heading · subheading' },
                  { token: 'LS.normal',  em: LS.normal,   example: '0px',                                                                   appliesTo: 'ui · body · label (all body text)' },
                  { token: 'LS.loose',   em: LS.loose,    example: `+${LS.loose  * FSBody.label}px @ FS.label (${FSBody.label}px)`,         appliesTo: 'available — not currently applied' },
                ] as const
              ).map(({ token, em, example, appliesTo }) => (
                <View key={token} style={s.lhRow}>
                  <Text style={s.lhToken}>{token}</Text>
                  <Text style={s.lhValue}>{em > 0 ? `+${em}` : em}em</Text>
                  <Text style={s.lhFormula}>{example} · {appliesTo}</Text>
                </View>
              ))}
            </Section>

            {/* Monospace callout */}
            <Section label="MONOSPACE — MONO">
              <View style={s.monoRow}>
                <View style={s.monoDemo}>
                  <Text style={s.monoSample}>pīn yīn</Text>
                  <Text style={s.monoCaption}>FS.pinyin · MONO · T.accent</Text>
                </View>
                <View style={s.monoDesc}>
                  <Text style={s.propName}>Used for</Text>
                  <Text style={s.propValue}>Pinyin pronunciation, score counters, HSK badges, part-of-speech tags, session metadata</Text>
                </View>
              </View>
            </Section>

            {/* Italic usage */}
            <Section label="ITALIC USAGE">
              <View style={s.noItalicNote}>
                <Text style={s.noItalicText}>
                  Italic is not used in this design system. Emphasis is expressed
                  through <Text style={s.codeInline}>color</Text>,{' '}
                  <Text style={s.codeInline}>fontWeight</Text>, and{' '}
                  <Text style={s.codeInline}>FS</Text> size hierarchy only.
                </Text>
              </View>
            </Section>
          </View>
        )}

        {/* ════════════════════════════════════════════════════════════════
            RULES
        ════════════════════════════════════════════════════════════════ */}
        {activeNav === 'Rules' && (
          <View>
            <DocHeading>Type Rules</DocHeading>
            <DocSubheading>
              How{' '}<Text style={s.codeInline}>FS</Text>,{' '}
              <Text style={s.codeInline}>FW</Text>,{' '}
              color, and{' '}
              <Text style={s.codeInline}>LS</Text>{' '}
              combine to build hierarchy.{' '}
              Size signals priority · weight signals interactivity · color signals role.
            </DocSubheading>

            {/* ── Font weight ───────────────────────────────────────── */}
            <Section label="FONT WEIGHT — FW">
              <Text style={s.lhNote}>
                Three values only.{' '}
                <Text style={s.codeInline}>FW.regular</Text> is the system default
                — it is never written explicitly in stylesheets. Only{' '}
                <Text style={s.codeInline}>FW.medium</Text> and{' '}
                <Text style={s.codeInline}>FW.semibold</Text> appear in code.
              </Text>
              <WeightRow
                token="FW.semibold"
                value="'600'"
                sample="Session complete"
                rule="Screen headings · component names · nav bar labels"
                where="profile title, session-setup headerTitle, BottomSheetModal title, cs.name"
              />
              <WeightRow
                token="FW.medium"
                value="'500'"
                sample="Start Session"
                rule="Interactive controls · list / card primary labels"
                where="Button, Chip, TabSwitcher, SegmentedControl, Card.title, deckName"
              />
              <WeightRow
                token="FW.regular"
                value="'400' — default"
                sample="Continue where you left off"
                rule="Prose · subtitles · captions · metadata — omit fontWeight in style"
                where="greetSub, descriptions, Section.label, tapHint, all body copy"
              />
            </Section>

            {/* ── Text color hierarchy ──────────────────────────────── */}
            <Section label="TEXT COLOR HIERARCHY">
              <Text style={s.lhNote}>
                Color tracks role, not size. The same{' '}
                <Text style={s.codeInline}>FS.label</Text> caption can be{' '}
                <Text style={s.codeInline}>T.textMuted</Text> (hint) or{' '}
                <Text style={s.codeInline}>T.textPrimary</Text> (MONO badge token) —
                choose based on how much attention the text should draw.
              </Text>
              <ColorRoleRow
                token="T.textPrimary"
                hex="#F0EBE0"
                rule="Active labels, headings, primary content — maximum contrast"
                where="all heading text, active tab/chip labels, input values"
              />
              <ColorRoleRow
                token="T.textSecondary"
                hex="#A09880"
                rule="Supporting text — present but not competing for focus"
                where="body copy, subtitles, back buttons, descriptions"
              />
              <ColorRoleRow
                token="T.textMuted"
                hex="#928A78"
                rule="Passive / background text — recedes, WCAG AA compliant (4.5:1)"
                where="section labels, placeholders, inactive states, captions"
              />
            </Section>

            {/* ── Role guide ────────────────────────────────────────── */}
            <Section label="ROLE GUIDE — full token combination per text role">
              <Text style={s.lhNote}>
                Every text element in the app maps to one of these roles.
                LS applies only to display-scale tokens; body scale always uses{' '}
                <Text style={s.codeInline}>LS.normal</Text>.
              </Text>
              {([
                {
                  role: 'Page heading',
                  sample: 'Session complete',
                  size: FS.title,   fw: FW.semibold,  color: T.textPrimary,
                  fsKey: 'FS.title',   fwKey: 'FW.semibold', colorKey: 'textPrimary',
                  lsKey: 'LS.tight',
                  where: 'sc.title · greetTitle',
                },
                {
                  role: 'Deck name / H2',
                  sample: 'HSK Level 1',
                  size: FS.heading, fw: FW.semibold,  color: T.textPrimary,
                  fsKey: 'FS.heading', fwKey: 'FW.semibold', colorKey: 'textPrimary',
                  lsKey: 'LS.tight',
                  where: 'deck headings · section H2',
                },
                {
                  role: 'Sub-heading',
                  sample: 'New Session',
                  size: FS.subheading, fw: FW.semibold,  color: T.textPrimary,
                  fsKey: 'FS.subheading', fwKey: 'FW.semibold', colorKey: 'textPrimary',
                  lsKey: 'LS.tight',
                  where: 'cs.name · headerTitle · card headings',
                },
                {
                  role: 'Header bar label',
                  sample: 'New Session',
                  size: FS.ui,      fw: FW.semibold,  color: T.textPrimary,
                  fsKey: 'FS.ui',      fwKey: 'FW.semibold', colorKey: 'textPrimary',
                  lsKey: '—',
                  where: 'session-setup headerTitle · BottomSheetModal title · settings title',
                },
                {
                  role: 'Body text',
                  sample: 'Continue where you left off',
                  size: FS.body,    fw: undefined,    color: T.textSecondary,
                  fsKey: 'FS.body',    fwKey: '—',           colorKey: 'textSecondary',
                  lsKey: '—',
                  where: 'greetSub · Card.subtitle · descriptions',
                },
                {
                  role: 'Interactive label',
                  sample: 'Start Session',
                  size: FS.ui,      fw: FW.medium,    color: T.textPrimary,
                  fsKey: 'FS.ui',      fwKey: 'FW.medium',   colorKey: 'textPrimary',
                  lsKey: '—',
                  where: 'Button · Card.title · deckName · rowName',
                },
                {
                  role: 'Toggle / tab label',
                  sample: 'New',
                  size: FS.body,    fw: FW.medium,    color: T.textSecondary,
                  fsKey: 'FS.body',    fwKey: 'FW.medium',   colorKey: 'textSecondary',
                  lsKey: '—',
                  where: 'Chip · TabSwitcher · SegmentedControl (inactive state)',
                },
                {
                  role: 'Section label',
                  sample: 'DECK',
                  size: FS.label,   fw: undefined,    color: T.textMuted,
                  fsKey: 'FS.label',   fwKey: '—',           colorKey: 'textMuted',
                  lsKey: '— uppercase',
                  where: 'Section component · cs.tableHeading · demoLabel',
                },
                {
                  role: 'Caption / hint',
                  sample: 'tap · pinyin  ··  double tap',
                  size: FS.label,   fw: undefined,    color: T.textMuted,
                  fsKey: 'FS.label',   fwKey: '—',           colorKey: 'textMuted',
                  lsKey: 'MONO',
                  where: 'tapHint · avatarHint · session metadata',
                },
              ] as const).map(({ role, sample, size, fw, color, fsKey, fwKey, colorKey, lsKey, where }) => (
                <RoleRow
                  key={role}
                  role={role}
                  sample={sample}
                  size={size}
                  fw={fw}
                  color={color}
                  fsKey={fsKey}
                  fwKey={fwKey}
                  colorKey={colorKey}
                  lsKey={lsKey}
                  where={where}
                />
              ))}
            </Section>
          </View>
        )}

        {/* ════════════════════════════════════════════════════════════════
            SPACING
        ════════════════════════════════════════════════════════════════ */}
        {activeNav === 'Spacing' && (
          <View>
            <DocHeading>Spacing & Radius</DocHeading>
            <DocSubheading>
              Spacing tokens are exported as{' '}
              <Text style={s.codeInline}>space</Text> and border-radius tokens
              as <Text style={s.codeInline}>radius</Text> from{' '}
              <Text style={s.codeInline}>theme/spacing.ts</Text>.
            </DocSubheading>

            <Section label="SPACING SCALE">
              {(Object.keys(space) as (keyof typeof space)[]).map(name => { const val = space[name]; return (
                <View key={name} style={s.spacingRow}>
                  <View style={s.spacingMeta}>
                    <Text style={s.tokenName}>space.{name}</Text>
                    <Text style={s.tokenValue}>{val}px</Text>
                  </View>
                  <View style={s.spacingBarWrap}>
                    <View style={[s.spacingBar, { width: val * 3 }]} />
                  </View>
                </View>
              ); })}
            </Section>

            <Section label="BORDER RADIUS SCALE">
              <View style={s.radiusGrid}>
                {(Object.keys(radius) as (keyof typeof radius)[]).map(name => { const val = radius[name]; return (
                  <View key={name} style={s.radiusItem}>
                    <View style={[s.radiusBox, { borderRadius: val }]} />
                    <Text style={s.tokenName}>radius.{name}</Text>
                    <Text style={s.tokenValue}>{val}px</Text>
                  </View>
                ); })}
              </View>
            </Section>
          </View>
        )}

        {/* ════════════════════════════════════════════════════════════════
            COMPONENTS
        ════════════════════════════════════════════════════════════════ */}
        {activeNav === 'Components' && (
          <View>
            <DocHeading>Components</DocHeading>
            <DocSubheading>
              All components live in <Text style={s.codeInline}>components/</Text> and
              are imported via the <Text style={s.codeInline}>@/</Text> alias.
              They consume only tokens — no hardcoded values.
            </DocSubheading>

            {/* ── Button ──────────────────────────────────────────────── */}
            <ComponentSection
              name="Button"
              file="components/Button.tsx"
              description="Primary call-to-action. Supports three variants, two shapes, disabled, and loading states."
              props={[
                { name: 'label',    type: 'string',                               desc: 'Button text' },
                { name: 'onPress',  type: '() => void',                           desc: 'Press handler' },
                { name: 'variant',  type: "'primary' | 'secondary' | 'ghost'",    desc: "Default: 'primary'" },
                { name: 'shape',    type: "'pill' | 'rounded'",                   desc: "Default: 'pill'" },
                { name: 'disabled', type: 'boolean',                              desc: 'Dims to 40% opacity' },
                { name: 'loading',  type: 'boolean',                              desc: 'Shows ActivityIndicator' },
              ]}
              usedIn={[
                { screen: 'auth.tsx',          context: 'Sign in / Create account / Send reset link CTAs' },
                { screen: 'session-setup.tsx', context: '"Start Session" footer CTA' },
                { screen: 'session.tsx',       context: '"Study again" and "Back to home" on completion screen' },
                { screen: 'settings.tsx',      context: '"Save" (primary) and "Sign out" (ghost)' },
              ]}
            >
              <Text style={s.demoLabel}>Variants</Text>
              <View style={s.buttonRow}>
                <Button label="Primary"   onPress={() => {}} variant="primary"   style={s.buttonFlex} />
                <Button label="Secondary" onPress={() => {}} variant="secondary" style={s.buttonFlex} />
                <Button label="Ghost"     onPress={() => {}} variant="ghost"     style={s.buttonFlex} />
              </View>

              <Text style={[s.demoLabel, { marginTop: space.lg }]}>Shapes</Text>
              <View style={s.buttonRow}>
                <Button label="Pill"    onPress={() => {}} shape="pill"    style={s.buttonFlex} />
                <Button label="Rounded" onPress={() => {}} shape="rounded" style={s.buttonFlex} />
              </View>

              <Text style={[s.demoLabel, { marginTop: space.lg }]}>States</Text>
              <View style={s.buttonRow}>
                <Button label="Disabled" onPress={() => {}} disabled style={s.buttonFlex} />
                <Button label="Loading"  onPress={() => {}} loading  style={s.buttonFlex} />
              </View>
            </ComponentSection>

            {/* ── Card ────────────────────────────────────────────────── */}
            <ComponentSection
              name="Card"
              file="components/Card.tsx"
              description="Action row with a Chinese-character icon, title, subtitle, and directional arrow."
              props={[
                { name: 'icon',     type: 'string',                    desc: 'Single character shown in icon box' },
                { name: 'title',    type: 'string',                    desc: 'Primary label' },
                { name: 'subtitle', type: 'string',                    desc: 'Secondary description' },
                { name: 'onPress',  type: '() => void',                desc: 'Press handler' },
                { name: 'variant',  type: "'primary' | 'secondary'",   desc: "Default: 'secondary'" },
                { name: 'disabled', type: 'boolean',                   desc: 'Hides arrow, dims to 45% opacity' },
              ]}
              usedIn={[
                { screen: 'home.tsx', context: '"New session" (primary) and "Resume session" (secondary, disableable)' },
              ]}
            >
              <View style={s.gap12}>
                <Card icon="学" title="New Session"    subtitle="Start a fresh flashcard session"   onPress={() => {}} variant="primary" />
                <Card icon="习" title="Resume Session" subtitle="Continue from where you left off"  onPress={() => {}} variant="secondary" />
                <Card icon="复" title="Disabled Card"  subtitle="No active session to resume"       onPress={() => {}} variant="secondary" disabled />
              </View>
            </ComponentSection>

            {/* ── Chip ────────────────────────────────────────────────── */}
            <ComponentSection
              name="Chip"
              file="components/Chip.tsx"
              description="Selectable toggle row with a dot indicator, label, and optional sublabel."
              props={[
                { name: 'label',    type: 'string',       desc: 'Primary label' },
                { name: 'sublabel', type: 'string',       desc: 'Secondary descriptor (optional)' },
                { name: 'active',   type: 'boolean',      desc: 'Selected state' },
                { name: 'onPress',  type: '() => void',   desc: 'Toggle handler' },
              ]}
              usedIn={[
                { screen: 'session-setup.tsx', context: '"New", "Review", "Hard" difficulty filter toggles' },
              ]}
            >
              <View style={s.gap12}>
                <Chip label="New"    sublabel="Cards you haven't seen yet" active={chipNew}    onPress={() => setChipNew((v: boolean) => !v)} />
                <Chip label="Review" sublabel="Cards you got last time"    active={chipReview} onPress={() => setChipReview((v: boolean) => !v)} />
                <Chip label="Hard"   sublabel="Cards you forgot"           active={chipHard}   onPress={() => setChipHard((v: boolean) => !v)} />
              </View>
            </ComponentSection>

            {/* ── Field ───────────────────────────────────────────────── */}
            <ComponentSection
              name="Field"
              file="components/Field.tsx"
              description="Labelled text input with focus state, error border, and inline error message."
              props={[
                { name: 'label',           type: 'string',              desc: 'Uppercase label above input' },
                { name: 'value',           type: 'string',              desc: 'Controlled value' },
                { name: 'onChange',        type: '(v: string) => void', desc: 'Change handler' },
                { name: 'placeholder',     type: 'string',              desc: 'Placeholder text' },
                { name: 'secureTextEntry', type: 'boolean',             desc: 'Password masking' },
                { name: 'hasError',        type: 'boolean',             desc: 'Shows error border' },
                { name: 'errorText',       type: 'string',              desc: 'Shows error border + message' },
              ]}
              usedIn={[
                { screen: 'auth.tsx',      context: 'Email and password inputs on login, signup, forgot forms' },
                { screen: 'settings.tsx',  context: 'Display name input in Personal Info section' },
              ]}
            >
              <Field label="DEFAULT"  value={fieldDefault}  onChange={setFieldDefault} placeholder="your@email.com" />
              <Field label="ERROR"    value={fieldError}    onChange={setFieldError}   hasError errorText="Please enter a valid email address." />
              <Field label="PASSWORD" value={fieldPass}     onChange={setFieldPass}    secureTextEntry />
            </ComponentSection>

            {/* ── ProgressBar ─────────────────────────────────────────── */}
            <ComponentSection
              name="ProgressBar"
              file="components/ProgressBar.tsx"
              description="Thin fill track with a current / total counter. Fill opacity is 70%."
              props={[
                { name: 'current', type: 'number', desc: 'Current position (1-based for display)' },
                { name: 'total',   type: 'number', desc: 'Total count' },
              ]}
              usedIn={[
                { screen: 'session.tsx', context: 'Top bar — shows current / total card count during a session' },
                { screen: 'profile.tsx', context: 'By HSK Level section — got / seen breakdown per level' },
              ]}
            >
              <View style={s.gap12}>
                <ProgressBar current={0}  total={20} />
                <ProgressBar current={8}  total={20} />
                <ProgressBar current={20} total={20} />
              </View>
            </ComponentSection>

            {/* ── Section ─────────────────────────────────────────────── */}
            <ComponentSection
              name="Section"
              file="components/Section.tsx"
              description="Labelled section wrapper. Renders an uppercase spaced label and wraps children with 28px bottom margin. Used throughout the doc page itself."
              props={[
                { name: 'label',    type: 'string',    desc: 'Section heading (uppercase, letter-spaced)' },
                { name: 'children', type: 'ReactNode', desc: 'Section content' },
              ]}
              usedIn={[
                { screen: 'session-setup.tsx', context: 'Deck, Cards per Session, Difficulty, Global Progress groups' },
                { screen: 'profile.tsx',       context: 'Global Progress, By HSK Level, Recent Sessions groups' },
                { screen: 'settings.tsx',      context: 'Personal Info, Account groups' },
              ]}
            >
              <Section label="EXAMPLE SECTION">
                <View style={s.sectionPlaceholder}>
                  <Text style={s.sectionPlaceholderText}>Children go here</Text>
                </View>
              </Section>
            </ComponentSection>

            {/* ── SegmentedControl ────────────────────────────────────── */}
            <ComponentSection
              name="SegmentedControl"
              file="components/SegmentedControl.tsx"
              description="Horizontal row of preset option segments with optional custom numeric input revealed when 'Custom' is selected."
              props={[
                { name: 'options',        type: '{ label: string; value: number | string }[]', desc: 'Preset segments' },
                { name: 'value',          type: 'number | string',                             desc: 'Currently selected value' },
                { name: 'onChange',       type: '(v: number | string) => void',                desc: 'Called on segment press' },
                { name: 'allowCustom',    type: 'boolean',                                     desc: 'Appends "Custom" segment with input' },
                { name: 'customValue',    type: 'number',                                      desc: 'Controlled custom number' },
                { name: 'onCustomChange', type: '(v: number) => void',                         desc: 'Called when custom input changes' },
              ]}
              usedIn={[
                { screen: 'session-setup.tsx', context: 'Card count presets (10 / 20 / 50) + custom input' },
                { screen: 'settings.tsx',      context: 'Native language selector and HSK goal selector' },
              ]}
            >
              <SegmentedControl
                options={[
                  { label: '10', value: 10 },
                  { label: '20', value: 20 },
                  { label: '50', value: 50 },
                ]}
                value={segValue}
                onChange={setSegValue}
                allowCustom
                customValue={segCustom}
                onCustomChange={setSegCustom}
              />
            </ComponentSection>

            {/* ── StatCard ────────────────────────────────────────────── */}
            <ComponentSection
              name="StatCard"
              file="components/StatCard.tsx"
              description="Metric tile displaying a large monospace value and an uppercase label. Use flex: 1 for equal-width grid cells."
              props={[
                { name: 'label', type: 'string',          desc: 'Short uppercase label' },
                { name: 'value', type: 'string | number', desc: 'Metric displayed prominently' },
              ]}
              usedIn={[
                { screen: 'profile.tsx', context: 'Global Progress section — Sessions, Cards seen, Guessed, Mastered, Avg/session' },
              ]}
            >
              <View style={s.statGrid}>
                <StatCard label="Sessions"   value={42}    style={s.statFlex} />
                <StatCard label="Cards seen" value="1 240" style={s.statFlex} />
              </View>
              <View style={[s.statGrid, { marginTop: space.sm }]}>
                <StatCard label="Guessed"    value={980}   style={s.statFlex} />
                <StatCard label="Avg / session" value={29} style={s.statFlex} />
              </View>
            </ComponentSection>

            {/* ── TabSwitcher ─────────────────────────────────────────── */}
            <ComponentSection
              name="TabSwitcher"
              file="components/TabSwitcher.tsx"
              description="Horizontal tab row with an active underline indicator. Fully interactive — tap a tab to switch."
              props={[
                { name: 'tabs',     type: '{ label: string; value: string }[]', desc: 'Tab definitions' },
                { name: 'value',    type: 'string',                             desc: 'Currently active tab value' },
                { name: 'onChange', type: '(v: string) => void',                desc: 'Tab press handler' },
              ]}
              usedIn={[
                { screen: 'auth.tsx', context: 'Toggles between "Sign in" and "Create account" forms' },
              ]}
            >
              <TabSwitcher
                tabs={[
                  { label: 'Overview', value: 'overview' },
                  { label: 'Details',  value: 'details' },
                  { label: 'History',  value: 'history' },
                ]}
                value={activeTab}
                onChange={setActiveTab}
              />
            </ComponentSection>

            {/* ── Avatar ──────────────────────────────────────────────── */}
            <ComponentSection
              name="Avatar"
              file="components/Avatar.tsx"
              description="Circular profile photo with an initials fallback. Scales the font size relative to the diameter."
              props={[
                { name: 'uri',      type: 'string | null', desc: 'Photo URL — falls back to initials when absent' },
                { name: 'initials', type: 'string',        desc: "1–2 chars shown when no photo. Default: '?'" },
                { name: 'size',     type: 'number',        desc: 'Diameter in pixels. Default: 80' },
                { name: 'onPress',  type: '() => void',    desc: 'When provided, wraps in TouchableOpacity' },
              ]}
              usedIn={[
                { screen: 'home.tsx',    context: 'Header — top-right profile icon (size 36)' },
                { screen: 'profile.tsx', context: 'Avatar section — large editable profile photo (size 96)' },
              ]}
            >
              <View style={s.avatarRow}>
                <View style={s.avatarItem}>
                  <Avatar initials="PB" size={80} />
                  <Text style={s.avatarLabel}>initials · 80px</Text>
                </View>
                <View style={s.avatarItem}>
                  <Avatar initials="YL" size={48} />
                  <Text style={s.avatarLabel}>initials · 48px</Text>
                </View>
                <View style={s.avatarItem}>
                  <Avatar initials="AB" size={36} onPress={() => {}} />
                  <Text style={s.avatarLabel}>tappable · 36px</Text>
                </View>
              </View>
            </ComponentSection>

            {/* ── BottomSheetModal ────────────────────────────────────── */}
            <ComponentSection
              name="BottomSheetModal"
              file="components/BottomSheetModal.tsx"
              description="Slide-up sheet built on React Native Modal. Backdrop tap or 'Done' closes it. Supports keyboard avoidance."
              props={[
                { name: 'visible',   type: 'boolean',    desc: 'Controls modal visibility' },
                { name: 'onClose',   type: '() => void', desc: 'Called by backdrop tap or "Done" button' },
                { name: 'title',     type: 'string',     desc: 'Sheet header title' },
                { name: 'children',  type: 'ReactNode',  desc: 'Content rendered below the header' },
              ]}
              usedIn={[
                { screen: 'session-setup.tsx', context: 'Deck picker — search input + scrollable deck list' },
              ]}
            >
              <Button label="Open Bottom Sheet" onPress={() => setSheetOpen(true)} />
              <BottomSheetModal
                visible={sheetOpen}
                onClose={() => setSheetOpen(false)}
                title="Select Deck"
              >
                <View style={s.sheetContent}>
                  <Text style={s.sheetContentText}>HSK 1 — 150 cards</Text>
                  <Text style={s.sheetContentText}>HSK 2 — 150 cards</Text>
                  <Text style={s.sheetContentText}>HSK 3 — 300 cards</Text>
                </View>
              </BottomSheetModal>
            </ComponentSection>
          </View>
        )}

        {/* ════════════════════════════════════════════════════════════════
            EXAMPLES — annotated screen mockups
        ════════════════════════════════════════════════════════════════ */}
        {activeNav === 'Examples' && (
          <View>
            <DocHeading>Screen Examples</DocHeading>
            <DocSubheading>
              Placeholder mockups of every screen, annotated with the exact
              design system tokens and components used. The left side shows
              the screen; the right side shows what's driving each element.
            </DocSubheading>

            {/* ── HOME ─────────────────────────────────────────────── */}
            <ScreenExample title="Home" file="app/(tabs)/home.tsx">
              {/* Phone frame content */}
              <PhoneFrame>
                {/* Header */}
                <View style={ex.homeHeader}>
                  <View>
                    <Text style={{ fontSize: FS.subheading, color: T.textPrimary, letterSpacing: LS.tight * FS.subheading }}>漢字</Text>
                    <Text style={{ fontSize: FS.label, color: T.textMuted, marginTop: 2 }}>HANZIFLASH</Text>
                  </View>
                  <Avatar initials="PB" size={28} />
                </View>
                {/* Greeting */}
                <View style={ex.homeGreet}>
                  <Text style={{ fontSize: FS.title, color: T.textPrimary, letterSpacing: LS.tight * FS.title, marginBottom: 4 }}>Hello, Pierre.</Text>
                  <Text style={{ fontSize: FS.body, color: T.textMuted }}>What would you like to do?</Text>
                </View>
                {/* Cards */}
                <View style={ex.homeCards}>
                  <Card icon="开" title="New session" subtitle="Start a fresh round of flashcards" variant="primary" onPress={() => {}} />
                  <Card icon="续" title="Resume session" subtitle="No session in progress" variant="secondary" onPress={() => {}} disabled />
                </View>
              </PhoneFrame>
              {/* Annotations */}
              <AnnotationList items={[
                { category: 'role', token: 'Brand anchor', value: '—', note: 'Logo at top-left, always visible',
                  why: 'Persistent brand identity that grounds the user — the hanzi characters signal "you are in a Chinese learning app" before reading any Latin text.' },
                { category: 'role', token: 'Personal greeting', value: '—', note: 'First focal point after launch',
                  why: 'Establishes personal connection before presenting actions. Name + question pattern invites the user to choose, not just consume.' },
                { category: 'role', token: 'Primary action', value: '—', note: 'New session card, accent-tinted',
                  why: 'Accent fill on the icon box draws the eye to the most common action. Hanzi icon reinforces that tapping starts a learning experience.' },
                { category: 'token', token: 'FS.title', value: '42px', note: 'Greeting text — display scale +3',
                  why: 'Needs to dominate the screen without competing with the smaller logo hanzi above. The 20px gap between 42px and 21px makes hierarchy unambiguous.' },
                { category: 'token', token: 'FS.subheading', value: '21px', note: 'Logo hanzi — display scale +1',
                  why: 'Small enough to be a brand mark, not a heading. Tight letter-spacing (LS.tight) makes the two characters feel like a logo, not text.' },
                { category: 'token', token: 'FS.body', value: '16px', note: 'Subtitle — body scale base',
                  why: 'Neutral size that recedes behind the greeting. Muted color (T.textMuted) ensures it\'s read second.' },
                { category: 'token', token: 'T.bg', value: '#131109', note: 'Screen background',
                  why: 'Near-black warm base prevents the amber text palette from feeling washed out. Dark theme is a deliberate choice for a study app — reduces eye strain in extended sessions.' },
                { category: 'component', token: 'Avatar', value: '28px', note: 'Initials fallback, tappable',
                  why: 'Small size signals "navigation shortcut", not "profile display". Initials fallback means the header works even before the user uploads a photo.' },
                { category: 'component', token: 'Card', value: 'primary + secondary', note: 'Action rows with hanzi icons',
                  why: 'Two variants create visual priority — primary (accent-tinted) for the main CTA, secondary (surface) for the conditional resume action. Disabled state at 45% opacity communicates "not available" without hiding the option.' },
              ]} />
            </ScreenExample>

            {/* ── SESSION (FLASHCARD) ──────────────────────────────── */}
            <ScreenExample title="Session — Flashcard" file="app/session.tsx">
              <PhoneFrame>
                {/* Top bar */}
                <View style={ex.sessionTopbar}>
                  <Text style={{ fontSize: FS.subheading, color: T.textMuted }}>✕</Text>
                  <ProgressBar current={5} total={20} style={{ flex: 1 }} />
                  <Text style={{ fontSize: FS.subheading, color: T.textMuted }}>‹</Text>
                </View>
                {/* Score strip */}
                <View style={ex.sessionScoreStrip}>
                  <Text style={{ fontFamily: MONO, fontSize: FS.body, fontWeight: FW.medium, color: T.error }}>✕  2</Text>
                  <Text style={{ color: T.textMuted, fontSize: FS.ui }}>·</Text>
                  <Text style={{ fontFamily: MONO, fontSize: FS.body, fontWeight: FW.medium, color: T.success }}>3  ✓</Text>
                </View>
                {/* Card area */}
                <View style={ex.sessionCardArea}>
                  <View style={ex.sessionHskBadge}>
                    <Text style={{ fontFamily: MONO, fontSize: FS.label, color: T.textMuted, letterSpacing: 1.5 }}>HSK 1</Text>
                  </View>
                  <Text style={{
                    fontSize: FS.hanzi, lineHeight: LH.hanzi, color: T.textHanzi,
                    letterSpacing: LS.tighter * FS.hanzi, textAlign: 'center',
                  }}>学</Text>
                  <Text style={{
                    fontFamily: MONO, fontSize: FS.pinyin, letterSpacing: 3,
                    color: T.accent, opacity: 0.85, marginTop: 14, textAlign: 'center',
                  }}>xué</Text>
                  <View style={{ width: 24, height: 1, backgroundColor: T.border, marginTop: 16, alignSelf: 'center' }} />
                  <Text style={{
                    fontSize: FS.subheading, lineHeight: LH.subheading,
                    color: '#C8BFA8', textAlign: 'center', marginTop: 12,
                  }}>我喜欢学习</Text>
                  <Text style={{
                    fontFamily: MONO, fontSize: FS.label, color: '#7A7060',
                    textAlign: 'center', letterSpacing: 1, marginTop: 4,
                  }}>wǒ xǐhuān xuéxí</Text>
                </View>
                {/* FABs */}
                <View style={ex.sessionFabs}>
                  <View style={[ex.fab, { backgroundColor: 'rgba(224,82,82,0.12)', borderColor: 'rgba(224,82,82,0.25)' }]}>
                    <Text style={{ fontSize: FS.subheading, color: T.error }}>✕</Text>
                  </View>
                  <View style={[ex.fab, { backgroundColor: 'rgba(74,158,107,0.12)', borderColor: 'rgba(74,158,107,0.25)' }]}>
                    <Text style={{ fontSize: FS.subheading, color: T.success }}>✓</Text>
                  </View>
                </View>
              </PhoneFrame>
              <AnnotationList items={[
                { category: 'role', token: 'Hero stimulus', value: '—', note: 'The character is the product being learned',
                  why: 'Sized at 72px to create a deliberate rupture in the type scale — the 30px gap from the next-largest element (42px title) signals "this is not a heading, this is the thing you\'re memorising."' },
                { category: 'role', token: 'Progressive reveal', value: '5 taps', note: 'Character → pinyin → example → translation → meaning',
                  why: 'Forces active recall. The learner must try to remember before seeing the answer. Each tap adds one layer of context, matching spaced-repetition pedagogy.' },
                { category: 'role', token: 'Binary judgement', value: '✕ / ✓', note: 'Forgot and Got It floating actions',
                  why: 'Two large FABs at thumb reach. Red/green semantic colors make the choice visceral — no reading required. Position at screen bottom matches mobile thumb zones.' },
                { category: 'token', token: 'FS.hanzi', value: '72px', note: 'Manual override — outside both scales',
                  why: 'A pedagogical decision, not aesthetic. The brain must instantly identify what is being learned. Derived scale sizes would tie character sizing to heading changes — but this should be stable.' },
                { category: 'token', token: 'LH.hanzi', value: '80px', note: 'Ratio 1.11 — 8px air',
                  why: 'Tight bounding box keeps pinyin close to the character it describes. Excess leading would waste vertical space on compact screens.' },
                { category: 'token', token: 'T.textHanzi', value: '#F5F0E8', note: 'Dedicated character color',
                  why: 'Slightly warmer and brighter than T.textPrimary — makes the hero character glow against the dark background while remaining distinct from heading text.' },
                { category: 'token', token: 'FS.pinyin', value: '20px', note: 'Body scale +1 — MONO font',
                  why: 'One step above base so it\'s visibly subordinate to the character but clearly larger than body text. MONO font + loose tracking aids syllable-by-syllable parsing.' },
                { category: 'token', token: 'FS.subheading', value: '21px', note: 'Example sentence in Chinese',
                  why: 'Same scale step as pinyin but in the display register (no MONO, tight tracking). Shows the character in context — a sentence, not an isolated glyph.' },
                { category: 'token', token: 'T.error / T.success', value: '#E05252 / #4A9E6B', note: 'Semantic FAB colors',
                  why: 'Red and green are universally understood as wrong/right. The dim fill (12% opacity) + border pattern matches the Chip active state for visual consistency.' },
                { category: 'component', token: 'ProgressBar', value: 'component', note: 'Fill track + MONO counter',
                  why: 'Thin and unobtrusive — positioned at the top so it\'s visible but doesn\'t compete with the flashcard. The MONO counter gives an exact position for learners who want precision.' },
              ]} />
            </ScreenExample>

            {/* ── SESSION COMPLETE ─────────────────────────────────── */}
            <ScreenExample title="Session — Complete" file="app/session.tsx">
              <PhoneFrame>
                <View style={ex.completeCentered}>
                  <Text style={{ fontSize: FS.seal, color: T.accent, opacity: 0.3 }}>印</Text>
                  <Text style={{
                    fontSize: FS.title, color: T.textPrimary, textAlign: 'center',
                    letterSpacing: LS.tight * FS.title, marginTop: space.xxl,
                  }}>Session complete</Text>
                  <Text style={{
                    fontFamily: MONO, fontSize: FS.label, color: T.textMuted,
                    letterSpacing: 1, marginTop: space.sm,
                  }}>20 cards reviewed</Text>
                  <View style={{ flexDirection: 'row', gap: space.xxl, marginTop: space.xxl, alignItems: 'center' }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: FS.score, lineHeight: LH.score, color: T.success, letterSpacing: LS.tighter * FS.score }}>14</Text>
                      <Text style={{ fontFamily: MONO, fontSize: FS.label, color: T.textMuted, letterSpacing: 1.5 }}>GOT IT</Text>
                    </View>
                    <Text style={{ color: T.textMuted, fontSize: FS.subheading }}>·</Text>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: FS.score, lineHeight: LH.score, color: T.error, letterSpacing: LS.tighter * FS.score }}>6</Text>
                      <Text style={{ fontFamily: MONO, fontSize: FS.label, color: T.textMuted, letterSpacing: 1.5 }}>FORGOT</Text>
                    </View>
                  </View>
                  <View style={{
                    borderWidth: 1, borderColor: T.border, borderRadius: 100,
                    paddingHorizontal: space.xl, paddingVertical: space.sm, marginTop: space.xxl,
                  }}>
                    <Text style={{ fontFamily: MONO, fontSize: FS.body, color: T.textMuted, letterSpacing: 1 }}>70% retention</Text>
                  </View>
                  <View style={{ width: '100%', gap: 10, marginTop: space.giant, paddingHorizontal: space.lg }}>
                    <Button label="Study again" onPress={() => {}} />
                    <Button label="Back to home" variant="secondary" onPress={() => {}} />
                  </View>
                </View>
              </PhoneFrame>
              <AnnotationList items={[
                { category: 'role', token: 'Reward moment', value: '—', note: 'Celebration after completing a session',
                  why: 'The seal character "印" at 30% opacity creates a watermark-like presence — decorative, not informational. It rewards completion without being loud.' },
                { category: 'role', token: 'Performance summary', value: '—', note: 'Got/forgot split + retention percentage',
                  why: 'Learners need immediate feedback to calibrate their confidence. The binary got/forgot split is more actionable than a single percentage — it shows where to focus.' },
                { category: 'role', token: 'Next action', value: '—', note: 'Study again vs. go home',
                  why: 'Primary button encourages continued practice (the habit loop). Secondary button offers an exit without guilt. No tertiary options — decision fatigue after a study session is real.' },
                { category: 'token', token: 'FS.seal', value: '50px', note: 'Decorative — outside both scales',
                  why: 'Deliberately between the character size (72px) and title size (42px). It\'s not content — it\'s atmosphere. The 30% opacity keeps it from competing with the actual results.' },
                { category: 'token', token: 'FS.score', value: '42px', note: 'Large numerics in MONO font',
                  why: 'Same size as FS.title for visual parity, but MONO font and tighter tracking (LS.tighter −0.05em) distinguish numbers from headings. The tight 48px line height makes them feel punchy.' },
                { category: 'token', token: 'LS.tighter', value: '−0.05em', note: 'Dense tracking for display numerics',
                  why: 'Large MONO digits at default tracking look loose and unintentional. Negative tracking pulls them into a cohesive number, not a sequence of isolated characters.' },
                { category: 'component', token: 'Button', value: 'primary + secondary', note: 'Stacked action pair',
                  why: 'Primary pill shape with accent fill draws the eye to "Study again" — the desired behavior. Secondary outlined button is visible but recessive, matching the app\'s "continue or exit" pattern.' },
              ]} />
            </ScreenExample>

            {/* ── SESSION SETUP ────────────────────────────────────── */}
            <ScreenExample title="Session Setup" file="app/session-setup.tsx">
              <PhoneFrame>
                {/* Header */}
                <View style={ex.setupHeader}>
                  <Text style={{ fontSize: FS.body, color: T.textMuted }}>← Back</Text>
                  <Text style={{ fontSize: FS.ui, color: T.textPrimary, fontWeight: FW.semibold }}>New Session</Text>
                  <View style={{ width: 44 }} />
                </View>
                {/* Deck */}
                <Section label="DECK">
                  <View style={ex.deckSelector}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: FS.ui, color: T.textPrimary, fontWeight: FW.medium }}>HSK 1 — Basics</Text>
                      <Text style={{ fontSize: FS.label, color: T.textMuted, marginTop: 2 }}>150 common characters</Text>
                    </View>
                    <Text style={{ fontSize: FS.body, color: T.textMuted }}>↓</Text>
                  </View>
                </Section>
                {/* Cards per session */}
                <Section label="CARDS PER SESSION">
                  <SegmentedControl
                    options={[{ label: '10', value: 10 }, { label: '20', value: 20 }, { label: '50', value: 50 }]}
                    value={20}
                    onChange={() => {}}
                    allowCustom
                  />
                </Section>
                {/* Difficulty */}
                <Section label="DIFFICULTY">
                  <View style={{ gap: space.sm }}>
                    <Chip label="New" sublabel="Haven't seen yet" active={true} onPress={() => {}} />
                    <Chip label="Review" sublabel="Due for review" active={false} onPress={() => {}} />
                  </View>
                </Section>
              </PhoneFrame>
              <AnnotationList items={[
                { category: 'role', token: 'Configuration flow', value: '—', note: 'Three decisions: deck, count, difficulty',
                  why: 'Structured top-to-bottom to match decision order. The learner picks what to study, how much, and at what level — each in its own Section with a clear label.' },
                { category: 'role', token: 'Constrained choice', value: '—', note: 'Presets with optional custom override',
                  why: 'Presets (10/20/50) cover 90% of use cases and reduce decision fatigue. The custom input is hidden behind an extra tap — available but not distracting.' },
                { category: 'role', token: 'Filter toggles', value: '—', note: 'Multi-select difficulty chips',
                  why: 'Chips are multi-select (not radio buttons) because learners often want mixed difficulty. The dot indicator + sublabel pattern explains each option without a tooltip.' },
                { category: 'token', token: 'FW.semibold', value: '600', note: 'Header bar title',
                  why: 'Signals "structural landmark" — tells the user where they are in the nav hierarchy. Same weight pattern as profile and settings headers for consistency.' },
                { category: 'token', token: 'FW.medium', value: '500', note: 'Deck name in selector row',
                  why: 'Medium weight signals "this is tappable" — distinguishing it from regular body text. The learner knows they can change the deck before consciously reading the affordance.' },
                { category: 'token', token: 'T.accentDim + T.accentBorder', value: '0.12 / 0.28', note: 'Active state accent pattern',
                  why: 'Translucent accent fill + slightly stronger accent border creates a consistent "selected" treatment used across Chip, SegmentedControl, and Card primary. The opacity values (12%/28%) are low enough to keep the dark theme from feeling heavy.' },
                { category: 'component', token: 'Section', value: 'component', note: 'Uppercase label + 28px bottom margin',
                  why: 'Provides consistent visual grouping across setup, profile, and settings screens. Uppercase + loose tracking makes labels scannable without being loud.' },
                { category: 'component', token: 'SegmentedControl', value: 'component', note: 'Preset row + custom input',
                  why: 'Single-select between presets with an optional custom numeric input. Chosen over a slider because discrete counts (10/20/50) are more meaningful than a continuous range for flashcard sessions.' },
                { category: 'component', token: 'Chip', value: 'component', note: 'Toggle row with dot + sublabel',
                  why: 'Multi-select filter pattern. The dot indicator is more subtle than a checkbox — it fits the minimal aesthetic while still providing clear state feedback through color change.' },
              ]} />
            </ScreenExample>

            {/* ── AUTH ─────────────────────────────────────────────── */}
            <ScreenExample title="Auth — Sign In" file="app/auth.tsx">
              <PhoneFrame>
                <View style={{ paddingHorizontal: space.xl }}>
                  {/* Logo */}
                  <View style={{ paddingTop: space.giant }}>
                    <Text style={{ fontSize: FS.score, color: T.textPrimary, letterSpacing: LS.tighter * FS.score, marginBottom: space.xs }}>漢字</Text>
                    <Text style={{ fontSize: FS.label, color: T.textMuted }}>HANZIFLASH</Text>
                  </View>
                  {/* Tabs */}
                  <TabSwitcher
                    tabs={[{ label: 'Sign in', value: 'login' }, { label: 'Create account', value: 'signup' }]}
                    value="login"
                    onChange={() => {}}
                    style={{ marginVertical: space.xxl }}
                  />
                  {/* Form */}
                  <Text style={{ fontSize: FS.title, color: T.textPrimary, marginBottom: space.xs }}>Welcome back</Text>
                  <Text style={{ fontSize: FS.body, color: T.textMuted, lineHeight: LH.body, marginBottom: space.xxl }}>Sign in to continue your practice.</Text>
                  <Field label="EMAIL" value="" onChange={() => {}} placeholder="you@example.com" />
                  <Field label="PASSWORD" value="" onChange={() => {}} placeholder="••••••••" secureTextEntry />
                  <Button label="Sign in" onPress={() => {}} disabled style={{ marginTop: space.sm }} />
                  {/* Divider */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, marginVertical: space.xl }}>
                    <View style={{ flex: 1, height: 1, backgroundColor: T.border }} />
                    <Text style={{ fontSize: FS.label, color: T.textMuted }}>or</Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: T.border }} />
                  </View>
                  <Button label="Continue with Google" onPress={() => {}} variant="secondary" />
                </View>
              </PhoneFrame>
              <AnnotationList items={[
                { category: 'role', token: 'Brand entry point', value: '—', note: 'Large logo character at top',
                  why: 'First screen new users see. The oversized hanzi immediately communicates "this is a Chinese learning app" before any Latin text is read — works even for non-Chinese-speakers.' },
                { category: 'role', token: 'Mode switcher', value: '—', note: 'Sign in / Create account tabs',
                  why: 'Tabs rather than separate screens because the forms are nearly identical. Switching is instant — no navigation, no lost state. The underline indicator shows current mode at a glance.' },
                { category: 'role', token: 'Error recovery', value: '—', note: 'Inline field errors + forgot password',
                  why: 'Errors appear directly below the offending field, not as a toast or alert. This keeps context — the user sees what\'s wrong and where to fix it simultaneously.' },
                { category: 'token', token: 'FS.title', value: '42px', note: 'Form heading — "Welcome back"',
                  why: 'Matches the home screen greeting size for familiarity. Users who sign out and back in see the same typographic weight — the app feels continuous, not restarted.' },
                { category: 'token', token: 'LH.body', value: '24px', note: 'Subtitle prose — 1.50 ratio',
                  why: 'The subtitle ("Sign in to continue your practice") may wrap to two lines on narrow phones. 1.50 ratio ensures comfortable reading without the subtitle feeling like a separate paragraph.' },
                { category: 'token', token: 'T.border / T.borderFocus', value: '0.08 / 0.22', note: 'Input border states',
                  why: 'Default border at 8% is barely visible — the input exists but doesn\'t demand attention. Focus ring at 22% brightens enough to confirm "you\'re typing here" without being harsh on the dark background.' },
                { category: 'component', token: 'TabSwitcher', value: 'component', note: 'Underline indicator tabs',
                  why: 'Minimal tab pattern — no background fills, just an underline. FW.medium weight on labels signals interactivity while the underline provides state feedback.' },
                { category: 'component', token: 'Field', value: 'component', note: 'Labelled input with error states',
                  why: 'Uppercase label above the input (not a floating label) because Chinese text entry may need more visual room. Three border states (default, focus, error) provide clear feedback without icons.' },
                { category: 'component', token: 'Button', value: 'primary + secondary', note: 'Email CTA + OAuth option',
                  why: 'Primary for the email flow (most users). Secondary for Google OAuth — present but visually subordinate. The "or" divider makes the hierarchy explicit.' },
              ]} />
            </ScreenExample>

            {/* ── PROFILE ─────────────────────────────────────────── */}
            <ScreenExample title="Profile" file="app/profile.tsx">
              <PhoneFrame>
                {/* Header */}
                <View style={ex.setupHeader}>
                  <Text style={{ fontSize: FS.body, color: T.textSecondary }}>← Back</Text>
                  <Text style={{ fontSize: FS.ui, color: T.textPrimary, fontWeight: FW.semibold }}>Profile</Text>
                  <Text style={{ fontSize: FS.subheading, textAlign: 'right', width: 44 }}>⚙️</Text>
                </View>
                {/* Avatar */}
                <View style={{ alignItems: 'center', paddingVertical: space.xxl }}>
                  <Avatar initials="PB" size={72} />
                </View>
                {/* Stats */}
                <Section label="GLOBAL PROGRESS">
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <StatCard label="Sessions" value={42} style={{ flex: 1 }} />
                    <StatCard label="Cards seen" value={380} style={{ flex: 1 }} />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <StatCard label="Guessed" value={280} style={{ flex: 1 }} />
                    <StatCard label="Mastered" value={95} style={{ flex: 1 }} />
                  </View>
                </Section>
                {/* HSK breakdown */}
                <Section label="BY HSK LEVEL">
                  <View style={{ gap: space.md }}>
                    {[{ l: 1, c: 120, t: 150 }, { l: 2, c: 80, t: 150 }, { l: 3, c: 30, t: 300 }].map(({ l, c, t }) => (
                      <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                        <Text style={{ fontSize: FS.label, color: T.textMuted, fontFamily: MONO, width: 40 }}>HSK {l}</Text>
                        <ProgressBar current={c} total={t} style={{ flex: 1 }} />
                      </View>
                    ))}
                  </View>
                </Section>
              </PhoneFrame>
              <AnnotationList items={[
                { category: 'role', token: 'Identity anchor', value: '—', note: 'Large avatar at screen centre',
                  why: 'The profile screen is the only place the user sees themselves. The 72px avatar dominates the top half, making the screen feel personal before any data appears below.' },
                { category: 'role', token: 'Progress dashboard', value: '—', note: 'Stats grid + HSK breakdown',
                  why: 'Two complementary views: aggregate numbers (how much) and per-level bars (where). The grid-then-breakdown layout lets the user scan totals first, then drill into specifics.' },
                { category: 'role', token: 'Motivation signal', value: '—', note: 'Recent sessions list',
                  why: 'Showing recent sessions with dates and scores creates a visible streak. Learners see their own consistency — or gaps — which is a stronger motivator than abstract numbers.' },
                { category: 'token', token: 'FW.semibold', value: '600', note: 'Header title — "Profile"',
                  why: 'Same weight as session-setup and settings headers. Consistent header treatment across all non-tab screens lets the user trust the navigation pattern without relearning.' },
                { category: 'token', token: 'FS.title', value: '42px', note: 'StatCard value in MONO',
                  why: 'Large MONO numerics make stats feel like a scoreboard. The tight tracking (LS.tight) keeps multi-digit numbers compact and cohesive.' },
                { category: 'token', token: 'T.surface', value: '#1e1b12', note: 'StatCard and row backgrounds',
                  why: 'One step up from T.bg — creates card elevation on the dark background without shadows. The subtle lift separates data groups from the screen canvas.' },
                { category: 'component', token: 'Avatar', value: '72px', note: 'Tappable with edit badge',
                  why: 'Larger than the home screen (28px) because this is the identity context. The edit badge overlay signals tappability without adding a separate "change photo" button.' },
                { category: 'component', token: 'StatCard', value: 'component', note: '2-column grid with flex: 1',
                  why: 'Equal-width cards prevent any metric from feeling more important than another. The MONO font for values and uppercase labels for descriptions create a consistent data-display pattern.' },
                { category: 'component', token: 'ProgressBar', value: 'component', note: 'HSK level breakdown rows',
                  why: 'Reused from the session screen but in a different context — here it shows mastery per level rather than session progress. The MONO counter (got/seen) gives precision alongside the visual bar.' },
              ]} />
            </ScreenExample>

            {/* ── SETTINGS ────────────────────────────────────────── */}
            <ScreenExample title="Settings" file="app/settings.tsx">
              <PhoneFrame>
                {/* Header */}
                <View style={ex.setupHeader}>
                  <Text style={{ fontSize: FS.body, color: T.textSecondary }}>← Back</Text>
                  <Text style={{ fontSize: FS.ui, color: T.textPrimary, fontWeight: FW.semibold }}>Settings</Text>
                  <View style={{ width: 44 }} />
                </View>
                <View style={{ paddingHorizontal: space.sm }}>
                  <Section label="PERSONAL INFO">
                    <Field label="DISPLAY NAME" value="Pierre" onChange={() => {}} placeholder="Your first name" />
                    <Text style={{ fontSize: FS.label, color: T.textMuted, textTransform: 'uppercase', marginBottom: space.sm }}>NATIVE LANGUAGE</Text>
                    <SegmentedControl
                      options={[{ label: 'Français', value: 'fr' }, { label: 'English', value: 'en' }, { label: '日本語', value: 'ja' }]}
                      value="fr"
                      onChange={() => {}}
                      style={{ marginBottom: space.lg }}
                    />
                    <Text style={{ fontSize: FS.label, color: T.textMuted, textTransform: 'uppercase', marginBottom: space.sm }}>HSK GOAL</Text>
                    <SegmentedControl
                      options={[1, 2, 3, 4, 5, 6].map(n => ({ label: String(n), value: n }))}
                      value={6}
                      onChange={() => {}}
                    />
                  </Section>
                  <Section label="ACCOUNT">
                    <Text style={{ fontSize: FS.body, color: T.textMuted }}>pierre@example.com</Text>
                  </Section>
                  <Button label="Save" onPress={() => {}} style={{ marginBottom: 12 }} />
                  <Button label="Sign out" variant="ghost" onPress={() => {}} />
                </View>
              </PhoneFrame>
              <AnnotationList items={[
                { category: 'role', token: 'Preference form', value: '—', note: 'Name, language, HSK goal',
                  why: 'Three settings that directly affect the learning experience. Grouped under "Personal Info" because they describe who the learner is, not how the app behaves.' },
                { category: 'role', token: 'Destructive action', value: '—', note: 'Sign out at the bottom, ghost style',
                  why: 'Ghost variant (no background, no border) makes sign-out visually recessive — present but not inviting. Positioning below Save ensures the learner sees the constructive action first.' },
                { category: 'token', token: 'FS.label', value: '13px', note: 'Form labels — uppercase, spaced',
                  why: 'Body scale −1 at uppercase with loose tracking matches the Section component pattern. Small labels above controls create a form rhythm that\'s consistent with session-setup.' },
                { category: 'token', token: 'T.textMuted', value: '#928A78', note: 'Account email + passive text',
                  why: 'Passes WCAG AA (4.5:1 contrast on T.bg). The email is displayed but not editable — muted color signals "this is information, not an input" without needing a disabled state.' },
                { category: 'token', token: 'space.xl', value: '20px', note: 'Horizontal padding throughout',
                  why: 'Consistent with session-setup and profile screens. The 20px inset keeps content away from screen edges on all device widths while maximizing form field width.' },
                { category: 'component', token: 'Field', value: 'component', note: 'Display name text input',
                  why: 'Same component as the auth screen — reuse means the learner recognises the input pattern (uppercase label, bordered box, focus ring) without relearning.' },
                { category: 'component', token: 'SegmentedControl', value: 'component', note: 'Language + HSK selectors',
                  why: 'Presets are ideal for small, known option sets (3 languages, 6 HSK levels). No custom input needed here — unlike card count, these are fixed enumerations.' },
                { category: 'component', token: 'Button', value: 'primary + ghost', note: 'Save and sign out',
                  why: 'Save uses the primary accent fill — it\'s the intended action. Sign out uses ghost (text only) — available but deliberately de-emphasised to prevent accidental logouts.' },
              ]} />
            </ScreenExample>
          </View>
        )}

        <View style={s.footer}>
          <Text style={s.footerText}>Mandarine Design System · 2026</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Examples tab sub-components ───────────────────────────────────────────────

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <View style={ex.phone}>
      <View style={ex.phoneNotch} />
      <View style={ex.phoneContent}>{children}</View>
      <View style={ex.phoneHomeBar} />
    </View>
  );
}

function ScreenExample({ title, file, children }: {
  title: string; file: string; children: ReactNode;
}) {
  return (
    <View style={ex.exampleWrap}>
      <View style={ex.exampleHeader}>
        <Text style={ex.exampleTitle}>{title}</Text>
        <Text style={ex.exampleFile}>{file}</Text>
      </View>
      <View style={ex.exampleBody}>
        {children}
      </View>
    </View>
  );
}

type AnnotationCategory = 'token' | 'role' | 'component';

interface AnnotationItem {
  category: AnnotationCategory;
  token: string;
  value: string;
  note: string;
  why: string;
}

const ANNOTATION_GROUPS: { key: AnnotationCategory; label: string; dotColor: string }[] = [
  { key: 'role',      label: 'SEMANTIC ROLES',  dotColor: T.success },
  { key: 'token',     label: 'TOKENS',          dotColor: T.accent },
  { key: 'component', label: 'COMPONENTS',      dotColor: T.textSecondary },
];

function AnnotationList({ items }: { items: AnnotationItem[] }) {
  return (
    <View style={ex.annotationList}>
      {ANNOTATION_GROUPS
        .filter(g => items.some(i => i.category === g.key))
        .map((group, gi) => (
        <View key={group.key} style={gi > 0 ? ex.annotationSectionGap : undefined}>
          <Text style={ex.annotationHeading}>{group.label}</Text>
          {items.filter(i => i.category === group.key).map((item, i) => (
            <View key={i} style={ex.annotationRow}>
              <View style={[ex.annotationDot, { backgroundColor: group.dotColor }]} />
              <View style={ex.annotationMeta}>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={ex.annotationToken}>{item.token}</Text>
                  <Text style={ex.annotationValue}>{item.value}</Text>
                </View>
                <Text style={ex.annotationNote}>{item.note}</Text>
                {item.why ? <Text style={ex.annotationWhy}>{item.why}</Text> : null}
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DocHeading({ children }: { children: string }) {
  return <Text style={ds.docHeading}>{children}</Text>;
}

function DocSubheading({ children }: { children: ReactNode }) {
  return <Text style={ds.docSubheading}>{children}</Text>;
}

function ColorGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={ds.colorGroup}>
      <Text style={ds.colorGroupLabel}>{label}</Text>
      <View style={ds.colorGroupGrid}>{children}</View>
    </View>
  );
}

function Swatch({
  token, hex, label, usage,
}: { token: string; hex: string; label: string; usage: string }) {
  // derive a display color for the swatch — use the hex directly when possible
  const swatchBg = hex;
  return (
    <View style={ds.swatch}>
      <View style={[ds.swatchBox, { backgroundColor: swatchBg }]} />
      <View style={ds.swatchMeta}>
        <Text style={ds.swatchToken}>{token}</Text>
        <Text style={ds.swatchHex}>{hex}</Text>
        <Text style={ds.swatchUsage}>{usage}</Text>
      </View>
    </View>
  );
}

interface TypeSpecimenProps {
  token: string;
  px: number;
  sample: string;
  usage: string;
  family?: string;
  color?: string;
  italic?: boolean;
  bold?: boolean;
  style?: object;
}

function TypeSpecimen({ token, px, sample, usage, family, color, italic, bold, style }: TypeSpecimenProps) {
  return (
    <View style={ds.specimen}>
      <View style={ds.specimenSample}>
        <Text
          style={[
            {
              fontSize:   px,
              color:      color ?? T.textPrimary,
              fontFamily: family,
              fontStyle:  italic ? 'italic'  : 'normal',
              fontWeight: bold   ? FW.semibold : 'normal',
            },
            style,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {sample}
        </Text>
      </View>
      <View style={ds.specimenMeta}>
        <Text style={ds.specimenToken}>{token}</Text>
        <Text style={ds.specimenPx}>{px}px</Text>
        <Text style={ds.specimenUsage}>{usage}</Text>
      </View>
    </View>
  );
}

interface PropDef { name: string; type: string; desc: string; }
interface UsedIn  { screen: string; context: string; }

function ComponentSection({
  name, file, description, props: propDefs, usedIn, children,
}: {
  name: string;
  file: string;
  description: string;
  props: PropDef[];
  usedIn: UsedIn[];
  children: ReactNode;
}) {
  return (
    <View style={cs.wrap}>
      {/* Header */}
      <View style={cs.header}>
        <Text style={cs.name}>{name}</Text>
        <Text style={cs.file}>{file}</Text>
      </View>
      <Text style={cs.desc}>{description}</Text>

      {/* Live demo */}
      <View style={cs.demo}>{children}</View>

      {/* Props table */}
      <Text style={cs.tableHeading}>Props</Text>
      <View style={cs.table}>
        <View style={[cs.row, cs.tableHeader]}>
          <Text style={[cs.cell, cs.cellProp, cs.th]}>Prop</Text>
          <Text style={[cs.cell, cs.cellType, cs.th]}>Type</Text>
          <Text style={[cs.cell, cs.cellDesc, cs.th]}>Description</Text>
        </View>
        {propDefs.map(p => (
          <View key={p.name} style={cs.row}>
            <Text style={[cs.cell, cs.cellProp, cs.propName]}>{p.name}</Text>
            <Text style={[cs.cell, cs.cellType, cs.propType]}>{p.type}</Text>
            <Text style={[cs.cell, cs.cellDesc, cs.propDesc]}>{p.desc}</Text>
          </View>
        ))}
      </View>

      {/* Used in */}
      <Text style={cs.tableHeading}>Used in</Text>
      {usedIn.map(u => (
        <View key={u.screen} style={cs.usedRow}>
          <Text style={cs.usedScreen}>{u.screen}</Text>
          <Text style={cs.usedContext}>{u.context}</Text>
        </View>
      ))}
    </View>
  );
}

// ── Rules tab components ──────────────────────────────────────────────────────

function WeightRow({ token, value, sample, rule, where }: {
  token: string; value: string; sample: string; rule: string; where: string;
}) {
  const fw = value.startsWith("'600'") ? FW.semibold : value.startsWith("'500'") ? FW.medium : undefined;
  return (
    <View style={rules.weightRow}>
      <View style={rules.weightSample}>
        <Text style={{ fontSize: FS.ui, color: T.textPrimary, fontWeight: fw }} numberOfLines={1} adjustsFontSizeToFit>
          {sample}
        </Text>
      </View>
      <View style={rules.weightMeta}>
        <View style={rules.tokenRow}>
          <Text style={rules.tokenBadge}>{token}</Text>
          <Text style={rules.valueBadge}>{value}</Text>
        </View>
        <Text style={rules.ruleText}>{rule}</Text>
        <Text style={rules.whereText}>{where}</Text>
      </View>
    </View>
  );
}

function ColorRoleRow({ token, hex, rule, where }: {
  token: string; hex: string; rule: string; where: string;
}) {
  const color = (T as Record<string, string>)[token.replace('T.', '')];
  return (
    <View style={rules.weightRow}>
      <View style={rules.colorSample}>
        <Text style={{ fontSize: FS.body, color, fontWeight: FW.medium }} numberOfLines={2}>
          The quick{'\n'}brown fox
        </Text>
      </View>
      <View style={rules.weightMeta}>
        <View style={rules.tokenRow}>
          <Text style={rules.tokenBadge}>{token}</Text>
          <Text style={rules.valueBadge}>{hex}</Text>
        </View>
        <Text style={rules.ruleText}>{rule}</Text>
        <Text style={rules.whereText}>{where}</Text>
      </View>
    </View>
  );
}

function RoleRow({ role, sample, size, fw, color, fsKey, fwKey, colorKey, lsKey, where }: {
  role: string; sample: string; size: number;
  fw: typeof FW.semibold | typeof FW.medium | undefined;
  color: string; fsKey: string; fwKey: string; colorKey: string; lsKey: string; where: string;
}) {
  return (
    <View style={rules.roleRow}>
      <View style={rules.roleSample}>
        <Text style={{ fontSize: Math.min(size, FS.heading), color, fontWeight: fw }} numberOfLines={2} adjustsFontSizeToFit>
          {sample}
        </Text>
      </View>
      <View style={rules.weightMeta}>
        <Text style={rules.roleName}>{role}</Text>
        <View style={rules.tokenRow}>
          <Text style={rules.tokenBadge}>{fsKey}</Text>
          <Text style={rules.tokenBadge}>{fwKey}</Text>
          <Text style={[rules.tokenBadge, { color: T.textSecondary, backgroundColor: 'transparent' }]}>{colorKey}</Text>
          {lsKey !== '—' && <Text style={rules.tokenBadge}>{lsKey}</Text>}
        </View>
        <Text style={rules.whereText}>{where}</Text>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  // Header
  header: {
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    backgroundColor: T.bg,
    paddingTop: space.xxl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: space.xxl,
    paddingBottom: space.lg,
  },
  logoHanzi: {
    fontSize: FS.heading,
    color: T.accent,
    fontWeight: FW.semibold,
  },
  logoLabel: {
    fontSize: FS.label,
    color: T.textMuted,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  headerMeta: { alignItems: 'flex-end', gap: 4 },
  versionBadge: {
    fontSize: FS.label,
    color: T.accent,
    backgroundColor: T.accentDim,
    borderWidth: 1,
    borderColor: T.accentBorder,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: MONO,
  },
  headerDate: {
    fontSize: FS.label,
    color: T.textMuted,
    fontFamily: MONO,
    letterSpacing: 0.5,
  },

  // Nav
  navScroll:    { },
  nav:          { flexDirection: 'row', paddingHorizontal: space.xl },
  navItem:      { paddingHorizontal: space.lg, paddingVertical: space.md, position: 'relative' },
  navItemActive: { borderBottomWidth: 2, borderBottomColor: T.accent },
  navText:      { fontSize: FS.body, color: T.textMuted, fontWeight: FW.medium },
  navTextActive:{ color: T.textPrimary },

  // Scroll body
  scroll:   { flex: 1 },
  content:  { padding: space.xxl, paddingBottom: space.giant },

  // Inline code
  codeInline: {
    fontFamily: MONO,
    fontSize: FS.label,
    color: T.accent,
    backgroundColor: T.accentDim,
    paddingHorizontal: 4,
    borderRadius: 4,
  },

  // Spacing section
  spacingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: space.sm,
    gap: space.lg,
  },
  spacingMeta: { width: 130 },
  spacingBarWrap: { flex: 1 },
  spacingBar: {
    height: 6,
    backgroundColor: T.accent,
    borderRadius: 3,
    opacity: 0.7,
  },

  // Radius section
  radiusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.lg,
  },
  radiusItem: { alignItems: 'center', gap: space.xs },
  radiusBox: {
    width: 56,
    height: 56,
    backgroundColor: T.surface2,
    borderWidth: 1,
    borderColor: T.border,
  },

  // Token labels (shared)
  tokenName:  { fontSize: FS.label, color: T.textSecondary, fontFamily: MONO },
  tokenValue: { fontSize: FS.label,   color: T.textMuted },

  // Button demo
  buttonRow: { flexDirection: 'row', gap: space.sm },
  buttonFlex: { flex: 1 },
  demoLabel: {
    fontSize: FS.label,
    color: T.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: space.sm,
  },

  // Card / Chip / ProgressBar helpers
  gap12: { gap: space.md },

  // Section demo placeholder
  sectionPlaceholder: {
    backgroundColor: T.surface2,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: radius.lg,
    padding: space.lg,
    alignItems: 'center',
  },
  sectionPlaceholderText: { fontSize: FS.body, color: T.textMuted },

  // StatCard grid
  statGrid: { flexDirection: 'row', gap: space.sm },
  statFlex: { flex: 1 },

  // Avatar row
  avatarRow:  { flexDirection: 'row', gap: space.xxl, alignItems: 'flex-start' },
  avatarItem: { alignItems: 'center', gap: space.sm },
  avatarLabel:{ fontSize: FS.label, color: T.textMuted, fontFamily: MONO },

  // Sheet content demo
  sheetContent: { paddingVertical: space.sm, gap: space.md },
  sheetContentText: { fontSize: FS.body, color: T.textSecondary },

  // Monospace row
  monoRow:    { flexDirection: 'row', gap: space.lg, alignItems: 'flex-start' },
  monoDemo:   {
    flex: 1,
    backgroundColor: T.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    alignItems: 'center',
    gap: space.xs,
  },
  monoSample: {
    fontFamily: MONO,
    fontSize: FS.pinyin,
    color: T.accent,
    letterSpacing: 3,
  },
  monoCaption:{ fontSize: FS.label, color: T.textMuted, fontFamily: MONO },
  monoDesc:   { flex: 1.4 },
  propName:   { fontSize: FS.label, color: T.textMuted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  propValue:  { fontSize: FS.body, color: T.textSecondary, lineHeight: LH.body },

  // Line heights section
  lhNote: {
    fontSize: FS.body,
    color: T.textSecondary,
    lineHeight: LH.body,
    marginBottom: space.lg,
  },
  lhRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    gap: space.lg,
  },
  lhToken:   { fontSize: FS.label, color: T.textPrimary, fontFamily: MONO, width: 80 },
  lhValue:   { fontSize: FS.label, color: T.accent,      fontFamily: MONO, width: 44 },
  lhFormula: { fontSize: FS.label, color: T.textMuted,   fontFamily: MONO },
  lhSectionTitle: {
    fontSize: FS.body,
    color: T.textPrimary,
    fontWeight: FW.semibold,
    marginTop: space.xxl,
    marginBottom: space.sm,
  },
  lhDemoCard: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginTop: space.sm,
    marginBottom: space.sm,
  },
  lhDemoLabel: {
    fontSize: FS.label,
    color: T.textMuted,
    fontFamily: MONO,
    letterSpacing: 1,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.xs,
  },
  lhDemoCentered: {
    alignItems: 'center',
    paddingVertical: space.xl,
    paddingHorizontal: space.lg,
  },
  lhDemoAnnotation: {
    backgroundColor: T.surface2,
    borderTopWidth: 1,
    borderTopColor: T.border,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  lhDemoAnnotationText: {
    fontSize: FS.label,
    color: T.accent,
    fontFamily: MONO,
    letterSpacing: 0.5,
  },

  // Footer
  footer: { marginTop: space.huge, alignItems: 'center' },
  footerText: { fontSize: FS.label, color: T.textMuted, fontFamily: MONO, letterSpacing: 1 },

  // No-italic callout
  noItalicNote: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 12,
    padding: space.lg,
  },
  noItalicText: {
    fontSize: FS.body,
    color: T.textSecondary,
    lineHeight: LH.body,
  },
});

// doc-level typography styles
const ds = StyleSheet.create({
  docHeading: {
    fontSize: FS.title,
    color: T.textPrimary,
    fontWeight: FW.semibold,
    marginBottom: space.sm,
  },
  docSubheading: {
    fontSize: FS.body,
    color: T.textSecondary,
    lineHeight: 22,
    marginBottom: space.xxl,
  },

  // Color swatches
  colorGroup: { marginBottom: space.xxl },
  colorGroupLabel: {
    fontSize: FS.label,
    color: T.textMuted,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: space.md,
  },
  colorGroupGrid: { gap: space.sm },
  swatch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    backgroundColor: T.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: T.border,
    padding: space.md,
  },
  swatchBox: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  swatchMeta:  { flex: 1, gap: 2 },
  swatchToken: { fontSize: FS.body, color: T.textPrimary, fontFamily: MONO },
  swatchHex:   { fontSize: FS.label, color: T.textMuted, fontFamily: MONO },
  swatchUsage: { fontSize: FS.label, color: T.textSecondary, marginTop: 2 },

  // Type specimens
  specimen: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    paddingVertical: space.md,
    gap: space.lg,
    minHeight: 64,
  },
  specimenSample: { width: 160, overflow: 'hidden' },
  specimenMeta:   { flex: 1, gap: 2 },
  specimenToken:  { fontSize: FS.label, color: T.textPrimary, fontFamily: MONO },
  specimenPx:     { fontSize: FS.label, color: T.accent,      fontFamily: MONO },
  specimenUsage:  { fontSize: FS.label, color: T.textMuted },
});

// component-section styles
const cs = StyleSheet.create({
  wrap: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: radius.card,
    padding: space.xxl,
    marginBottom: space.xxl,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: space.sm },
  name:   { fontSize: FS.subheading, color: T.textPrimary, fontWeight: FW.semibold },
  file:   { fontSize: FS.label, color: T.textMuted, fontFamily: MONO },
  desc:   { fontSize: FS.body, color: T.textSecondary, lineHeight: 20, marginBottom: space.xxl },

  demo: {
    backgroundColor: T.surface2,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.xxl,
    borderWidth: 1,
    borderColor: T.border,
  },

  tableHeading: {
    fontSize: FS.label,
    color: T.textMuted,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: space.sm,
  },
  table:       { borderWidth: 1, borderColor: T.border, borderRadius: radius.lg, overflow: 'hidden', marginBottom: space.lg },
  row:         { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: T.border },
  tableHeader: { backgroundColor: T.surface2 },
  cell:        { paddingHorizontal: space.md, paddingVertical: space.sm },
  cellProp:    { flex: 1.2 },
  cellType:    { flex: 2 },
  cellDesc:    { flex: 2 },
  th:          { fontSize: FS.label, color: T.textMuted, letterSpacing: 1.5, textTransform: 'uppercase' },
  propName:    { fontSize: FS.label, color: T.textPrimary, fontFamily: MONO },
  propType:    { fontSize: FS.label, color: T.accent, fontFamily: MONO },
  propDesc:    { fontSize: FS.label, color: T.textSecondary },

  usedRow: {
    flexDirection: 'row',
    gap: space.md,
    paddingVertical: space.xs,
    alignItems: 'flex-start',
  },
  usedScreen:  { fontSize: FS.label, color: T.textPrimary, fontFamily: MONO, width: 130 },
  usedContext: { flex: 1, fontSize: FS.label, color: T.textSecondary },
});

// rules-tab styles
const rules = StyleSheet.create({
  weightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    paddingVertical: space.md,
    gap: space.lg,
    minHeight: 64,
  },
  weightSample: {
    width: 140,
    justifyContent: 'center',
  },
  colorSample: {
    width: 140,
    justifyContent: 'center',
  },
  weightMeta: { flex: 1, gap: 4 },

  tokenRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tokenBadge: {
    fontFamily: MONO,
    fontSize: FS.label,
    color: T.accent,
    backgroundColor: T.accentDim,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  valueBadge: {
    fontFamily: MONO,
    fontSize: FS.label,
    color: T.textMuted,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  ruleText: { fontSize: FS.body, color: T.textSecondary, lineHeight: LH.body },
  whereText: { fontSize: FS.label, color: T.textMuted, fontFamily: MONO },

  roleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    paddingVertical: space.md,
    gap: space.lg,
    minHeight: 64,
  },
  roleSample: {
    width: 140,
    justifyContent: 'center',
  },
  roleName: { fontSize: FS.body, color: T.textPrimary, fontWeight: FW.medium, marginBottom: 2 },
});

// examples-tab styles
const ex = StyleSheet.create({
  // Screen example wrapper
  exampleWrap: {
    marginBottom: space.huge,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  exampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: T.surface,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  exampleTitle: {
    fontSize: FS.ui,
    color: T.textPrimary,
    fontWeight: FW.semibold,
  },
  exampleFile: {
    fontSize: FS.label,
    color: T.textMuted,
    fontFamily: MONO,
  },
  exampleBody: {
    flexDirection: 'row',
  },

  // Phone frame
  phone: {
    width: 260,
    minHeight: 480,
    backgroundColor: T.bg,
    borderRightWidth: 1,
    borderRightColor: T.border,
    overflow: 'hidden',
  },
  phoneNotch: {
    width: 80,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.surface2,
    alignSelf: 'center',
    marginTop: space.sm,
    marginBottom: space.sm,
  },
  phoneContent: {
    flex: 1,
    overflow: 'hidden',
  },
  phoneHomeBar: {
    width: 56,
    height: 3,
    borderRadius: 2,
    backgroundColor: T.surface2,
    alignSelf: 'center',
    marginTop: space.sm,
    marginBottom: space.sm,
  },

  // Annotation sidebar
  annotationList: {
    flex: 1,
    backgroundColor: T.surface,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
  },
  annotationHeading: {
    fontSize: FS.label,
    color: T.textMuted,
    letterSpacing: 2,
    marginBottom: space.md,
    fontFamily: MONO,
  },
  annotationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    marginBottom: space.md,
  },
  annotationDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: T.accent,
    marginTop: 5,
  },
  annotationMeta: {
    flex: 1,
  },
  annotationToken: {
    fontSize: FS.label,
    color: T.accent,
    fontFamily: MONO,
    backgroundColor: T.accentDim,
    paddingHorizontal: 4,
    borderRadius: 3,
    overflow: 'hidden',
  },
  annotationValue: {
    fontSize: FS.label,
    color: T.textMuted,
    fontFamily: MONO,
  },
  annotationNote: {
    fontSize: FS.label,
    color: T.textSecondary,
    marginTop: 2,
    lineHeight: LH.label,
  },
  annotationWhy: {
    fontSize: FS.label,
    color: T.textMuted,
    marginTop: 3,
    lineHeight: LH.label,
    fontStyle: 'italic',
  },
  annotationSectionGap: {
    marginTop: space.lg,
  },

  // ── Screen-specific placeholder styles ──────────────────────────────────

  // Home
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: space.lg,
    paddingTop: space.md,
  },
  homeGreet: {
    paddingHorizontal: space.lg,
    paddingTop: space.xxl,
    paddingBottom: space.xl,
  },
  homeCards: {
    paddingHorizontal: space.md,
    gap: space.md,
  },

  // Session
  sessionTopbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.xs,
  },
  sessionScoreStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    paddingBottom: space.sm,
  },
  sessionCardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
    paddingBottom: 60,
  },
  sessionHskBadge: {
    position: 'absolute',
    top: 8,
    right: space.lg,
    borderWidth: 1,
    borderColor: T.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 100,
  },
  sessionFabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: space.xxl,
    paddingBottom: space.lg,
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  // Session complete
  completeCentered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },

  // Setup / Profile / Settings header
  setupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.sm,
  },

  // Deck selector
  deckSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 14,
    paddingHorizontal: space.lg,
    paddingVertical: 12,
  },
});
