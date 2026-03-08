import React, { useState, ReactNode } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { T, MONO, FS } from '@/theme/tokens';
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
const NAV_ITEMS = ['Colors', 'Typography', 'Spacing', 'Components'] as const;

// ── Italic usage catalogue ────────────────────────────────────────────────────
const ITALIC_USAGES = [
  { token: 'FS.display', px: FS.display, sample: 'Hello, Pierre.', screen: 'home.tsx',          usage: 'Personalised greeting on the home screen' },
  { token: 'FS.title',   px: FS.title,   sample: 'Welcome back',   screen: 'auth.tsx',           usage: 'Primary heading on login / signup forms' },
  { token: 'FS.stat',    px: FS.stat,    sample: 'Session complete',screen: 'session.tsx',        usage: '"Session complete" congratulation title' },
  { token: 'FS.heading', px: FS.heading, sample: 'To study',        screen: 'session.tsx',        usage: 'Flashcard word meaning (translation)' },
  { token: 'FS.heading', px: FS.heading, sample: 'Email confirmed', screen: 'auth.tsx',           usage: 'Success confirmation heading' },
  { token: 'FS.body',    px: FS.body,    sample: 'tā qù xuéxiào',   screen: 'session.tsx',        usage: 'Example sentence pinyin on flashcard back' },
  { token: 'FS.body',    px: FS.body,    sample: 'user@email.com',  screen: 'settings.tsx',       usage: 'Read-only email in Personal Info section' },
  { token: 'FS.hint',    px: FS.hint,    sample: 'No filter — all cards included', screen: 'session-setup.tsx', usage: 'Difficulty selection hint below chips' },
] as const;

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
              <Swatch token="T.textMuted"     hex="#5C5646" label="textMuted"     usage="Hints, placeholders, disabled states" />
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
              Font sizes are exported as{' '}
              <Text style={s.codeInline}>FS</Text> from{' '}
              <Text style={s.codeInline}>theme/tokens.ts</Text>. Use the
              monospace constant{' '}
              <Text style={s.codeInline}>MONO</Text> for pinyin, counters,
              and fixed-width numeric display.
            </DocSubheading>

            {/* Scale specimens — largest to smallest */}
            <Section label="SCALE">
              <TypeSpecimen
                token="FS.hanzi"
                px={FS.hanzi}
                sample="漢"
                usage="Main flashcard character"
                family={undefined}
                color={T.textHanzi}
              />
              <TypeSpecimen
                token="FS.seal"
                px={FS.seal}
                sample="印"
                usage="Session completion seal"
                color={T.accent}
              />
              <TypeSpecimen
                token="FS.score"
                px={FS.score}
                sample="84"
                usage="Session end score number"
                family={MONO}
              />
              <TypeSpecimen
                token="FS.display"
                px={FS.display}
                sample="Hello, Pierre."
                usage="Home screen greeting"
                italic
              />
              <TypeSpecimen
                token="FS.stat"
                px={FS.stat}
                sample="1 240"
                usage="Stat card values"
                family={MONO}
              />
              <TypeSpecimen
                token="FS.logo"
                px={FS.logo}
                sample="漢字"
                usage="Auth & home logo hanzi"
              />
              <TypeSpecimen
                token="FS.title"
                px={FS.title}
                sample="Welcome back"
                usage="Auth screen headings"
                italic
              />
              <TypeSpecimen
                token="FS.heading"
                px={FS.heading}
                sample="Session complete"
                usage="Form headings, flashcard meaning"
              />
              <TypeSpecimen
                token="FS.sub"
                px={FS.sub}
                sample="New Session"
                usage="Sub-headings, score items"
              />
              <TypeSpecimen
                token="FS.ui"
                px={FS.ui}
                sample="Profile"
                usage="Screen headers, nav controls"
                bold
              />
              <TypeSpecimen
                token="FS.input"
                px={FS.input}
                sample="Choose a deck…"
                usage="Text inputs, buttons"
              />
              <TypeSpecimen
                token="FS.body"
                px={FS.body}
                sample="What would you like to do today?"
                usage="Standard body text, subtitles"
              />
              <TypeSpecimen
                token="FS.note"
                px={FS.note}
                sample="← Back"
                usage="Secondary scores, auth footer, back buttons"
              />
              <TypeSpecimen
                token="FS.caption"
                px={FS.caption}
                sample="HSK 3 · 20 cards · 85% retention"
                usage="Metadata, session info rows"
                family={MONO}
              />
              <TypeSpecimen
                token="FS.hint"
                px={FS.hint}
                sample="No filter — all cards included"
                usage="Inline hints, chip sublabels"
                italic
              />
              <TypeSpecimen
                token="FS.label"
                px={FS.label}
                sample="DIFFICULTY"
                usage="Section labels, stat labels"
                style={{ letterSpacing: 2.5, textTransform: 'uppercase' }}
              />
              <TypeSpecimen
                token="FS.micro"
                px={FS.micro}
                sample="HANZIFLASH"
                usage="Logo tagline, tiny badges"
                style={{ letterSpacing: 6, textTransform: 'uppercase' }}
              />
            </Section>

            {/* Monospace callout */}
            <Section label="MONOSPACE — MONO">
              <View style={s.monoRow}>
                <View style={s.monoDemo}>
                  <Text style={s.monoSample}>pīn yīn</Text>
                  <Text style={s.monoCaption}>FS.sub · MONO · T.accent</Text>
                </View>
                <View style={s.monoDesc}>
                  <Text style={s.propName}>Used for</Text>
                  <Text style={s.propValue}>Pinyin pronunciation, score counters, HSK badges, part-of-speech tags, session metadata</Text>
                </View>
              </View>
            </Section>

            {/* Italic usage */}
            <Section label="ITALIC USAGE">
              <Text style={s.italicRule}>
                Italic is applied to <Text style={s.italicRuleEm}>expressive headings</Text> and{' '}
                <Text style={s.italicRuleEm}>soft/secondary text</Text> only — never to body copy,
                buttons, or metadata.
              </Text>
              {ITALIC_USAGES.map(u => (
                <View key={u.token + u.screen} style={s.italicRow}>
                  <Text
                    style={[s.italicSample, { fontSize: Math.min(u.px, 22) }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {u.sample}
                  </Text>
                  <View style={s.italicMeta}>
                    <View style={s.italicMetaTop}>
                      <Text style={s.italicToken}>{u.token}</Text>
                      <Text style={s.italicScreen}>{u.screen}</Text>
                    </View>
                    <Text style={s.italicUsage}>{u.usage}</Text>
                  </View>
                </View>
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
    fontSize: FS.micro,
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
    fontSize: FS.caption,
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
    fontSize: FS.caption,
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
  tokenName:  { fontSize: FS.caption, color: T.textSecondary, fontFamily: MONO },
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
  avatarLabel:{ fontSize: FS.hint, color: T.textMuted, fontFamily: MONO },

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
    fontSize: FS.sub,
    color: T.accent,
    letterSpacing: 3,
  },
  monoCaption:{ fontSize: FS.hint, color: T.textMuted, fontFamily: MONO },
  monoDesc:   { flex: 1.4 },
  propName:   { fontSize: FS.label, color: T.textMuted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  propValue:  { fontSize: FS.body, color: T.textSecondary, lineHeight: 20 },

  // Footer
  footer: { marginTop: space.huge, alignItems: 'center' },
  footerText: { fontSize: FS.caption, color: T.textMuted, fontFamily: MONO, letterSpacing: 1 },

  // Italic section
  italicRule: {
    fontSize: FS.body,
    color: T.textSecondary,
    lineHeight: 21,
    marginBottom: space.lg,
  },
  italicRuleEm: {
    fontStyle: 'italic',
    color: T.textPrimary,
  },
  italicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    paddingVertical: space.md,
    gap: space.lg,
    minHeight: 52,
  },
  italicSample: {
    width: 160,
    fontStyle: 'italic',
    color: T.textPrimary,
  },
  italicMeta: { flex: 1, gap: 2 },
  italicMetaTop: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  italicToken:  { fontSize: FS.caption, color: T.textPrimary, fontFamily: MONO },
  italicScreen: { fontSize: FS.hint,    color: T.textMuted,   fontFamily: MONO },
  italicUsage:  { fontSize: FS.hint,    color: T.textSecondary },
});

// doc-level typography styles
const ds = StyleSheet.create({
  docHeading: {
    fontSize: FS.title,
    color: T.textPrimary,
    fontWeight: '600',
    marginBottom: space.sm,
    fontStyle: 'italic',
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
  swatchHex:   { fontSize: FS.caption, color: T.textMuted, fontFamily: MONO },
  swatchUsage: { fontSize: FS.hint, color: T.textSecondary, marginTop: 2 },

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
  specimenToken:  { fontSize: FS.caption, color: T.textPrimary, fontFamily: MONO },
  specimenPx:     { fontSize: FS.label,   color: T.accent,      fontFamily: MONO },
  specimenUsage:  { fontSize: FS.hint,    color: T.textMuted },
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
  file:   { fontSize: FS.hint, color: T.textMuted, fontFamily: MONO },
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
  propName:    { fontSize: FS.caption, color: T.textPrimary, fontFamily: MONO },
  propType:    { fontSize: FS.caption, color: T.accent, fontFamily: MONO },
  propDesc:    { fontSize: FS.caption, color: T.textSecondary },

  usedRow: {
    flexDirection: 'row',
    gap: space.md,
    paddingVertical: space.xs,
    alignItems: 'flex-start',
  },
  usedScreen:  { fontSize: FS.caption, color: T.textPrimary, fontFamily: MONO, width: 130 },
  usedContext: { flex: 1, fontSize: FS.caption, color: T.textSecondary },
});
