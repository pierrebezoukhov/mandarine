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
const NAV_ITEMS = ['Colors', 'Typography', 'Rules', 'Spacing', 'Components'] as const;


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
                usage={`Sub-headings, card headings · LH.heading: ${LH.heading}px · LS.tight: ${LS.tight * FSDisplay.heading}px`}
                style={{ letterSpacing: LS.tight * FSDisplay.heading }}
              />
            </Section>

            {/* Body scale — readable content, UI controls */}
            <Section label="BODY SCALE — LS.normal (no tracking)">
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

            {/* Line heights */}
            <Section label="LINE HEIGHTS — LH">
              <Text style={s.lhNote}>
                Companion constants exported as{' '}
                <Text style={s.codeInline}>LH</Text> from{' '}
                <Text style={s.codeInline}>theme/tokens.ts</Text>.
                Ratio tapers as size grows — all values on a 4 px grid.
                Small text (~1.5) → body/UI (~1.4–1.5) → headings/display (1.33→1.12).
              </Text>
              {(
                [
                  { name: 'label',   fs: FS.label,   lh: LH.label,   mult: '×1.50' },
                  { name: 'body',    fs: FS.body,    lh: LH.body,    mult: '×1.43' },
                  { name: 'ui',      fs: FS.ui,      lh: LH.ui,      mult: '×1.50' },
                  { name: 'heading', fs: FS.heading, lh: LH.heading, mult: '×1.33' },
                  { name: 'title',   fs: FS.title,   lh: LH.title,   mult: '×1.29' },
                  { name: 'score',   fs: FS.score,   lh: LH.score,   mult: '×1.19' },
                  { name: 'seal',    fs: FS.seal,    lh: LH.seal,    mult: '×1.12' },
                ] as const
              ).map(({ name, fs, lh, mult }) => (
                <View key={name} style={s.lhRow}>
                  <Text style={s.lhToken}>LH.{name}</Text>
                  <Text style={s.lhValue}>{lh}px</Text>
                  <Text style={s.lhFormula}>FS.{name} {fs}px {mult}</Text>
                </View>
              ))}
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
                  { token: 'LS.tight',   em: LS.tight,    example: `${LS.tight   * FSDisplay.title}px @ FS.title (${FSDisplay.title}px)`,   appliesTo: 'title · heading' },
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
                  <Text style={s.monoCaption}>FS.heading · MONO · T.accent</Text>
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
                  role: 'Sub-heading',
                  sample: 'New Session',
                  size: FS.heading, fw: FW.semibold,  color: T.textPrimary,
                  fsKey: 'FS.heading', fwKey: 'FW.semibold', colorKey: 'textPrimary',
                  lsKey: 'LS.tight',
                  where: 'cs.name · headerTitle',
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

        <View style={s.footer}>
          <Text style={s.footerText}>Mandarine Design System · 2026</Text>
        </View>
      </ScrollView>
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
              fontWeight: bold   ? '600'     : 'normal',
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
    fontWeight: '600',
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
  navText:      { fontSize: FS.body, color: T.textMuted, fontWeight: '500' },
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
    fontSize: FS.heading,
    color: T.accent,
    letterSpacing: 3,
  },
  monoCaption:{ fontSize: FS.label, color: T.textMuted, fontFamily: MONO },
  monoDesc:   { flex: 1.4 },
  propName:   { fontSize: FS.label, color: T.textMuted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  propValue:  { fontSize: FS.body, color: T.textSecondary, lineHeight: 20 },

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
    fontWeight: '600',
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
  name:   { fontSize: FS.heading, color: T.textPrimary, fontWeight: '600' },
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
