import React, { useState, useMemo, ReactNode } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';
import { MONO, SERIF, FS, FSDisplay, FSBody, FSContent, LH, LS, FW } from '@/theme/tokens';
import { Icon } from '@/theme/icons';
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
import { GoogleIcon } from '@/components/GoogleIcon';

// ── Nav anchors ───────────────────────────────────────────────────────────────
const NAV_ITEMS = ['Colors', 'Typography', 'Icons', 'Rules', 'Spacing', 'Components', 'Examples'] as const;


export default function DesignSystemScreen() {
  const { colors, isDark, setMode } = useTheme();
  const t = useMemo(() => makeStyles(colors), [colors]);
  const d = useMemo(() => makeDocStyles(colors), [colors]);
  const c = useMemo(() => makeComponentStyles(colors), [colors]);
  const r = useMemo(() => makeRuleStyles(colors), [colors]);
  const e = useMemo(() => makeExampleStyles(colors), [colors]);

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

  // ── Annotation groups (need colors) ────────────────────────────────────────
  const annotationGroups: { key: AnnotationCategory; label: string; dotColor: string }[] = useMemo(() => [
    { key: 'role',      label: 'SEMANTIC ROLES',  dotColor: colors.green },
    { key: 'token',     label: 'TOKENS',          dotColor: colors.inkRed },
    { key: 'component', label: 'COMPONENTS',      dotColor: colors.textSecondary },
  ], [colors]);

  return (
    <View style={t.root}>
      {/* ── Fixed header ─────────────────────────────────────────────────── */}
      <View style={t.header}>
        <View style={t.headerTop}>
          <View>
            <Text style={t.logoHanzi}>漢字</Text>
            <Text style={t.logoLabel}>MANDARINE</Text>
          </View>
          <View style={t.headerMeta}>
            <Text style={t.versionBadge}>v2.0</Text>
            <Text style={t.headerDate}>Design System</Text>
            <TouchableOpacity
              style={t.themeToggle}
              onPress={() => setMode(isDark ? 'light' : 'dark')}
              activeOpacity={0.7}
            >
              <Text style={t.themeToggleText}>{isDark ? '☀' : '☽'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nav tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={t.navScroll}>
          <View style={t.nav}>
            {NAV_ITEMS.map(item => (
              <TouchableOpacity
                key={item}
                style={[t.navItem, activeNav === item && t.navItemActive]}
                onPress={() => setActiveNav(item)}
                activeOpacity={0.7}
              >
                <Text style={[t.navText, activeNav === item && t.navTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* ── Scrollable body ──────────────────────────────────────────────── */}
      <ScrollView style={t.scroll} contentContainerStyle={t.content}>

        {/* ════════════════════════════════════════════════════════════════
            COLORS
        ════════════════════════════════════════════════════════════════ */}
        {activeNav === 'Colors' && (
          <View>
            <DocHeading colors={colors}>Color Palette</DocHeading>
            <DocSubheading colors={colors}>
              All colors are defined in{' '}
              <Text style={t.codeInline}>theme/colors.ts</Text> and accessed via{' '}
              <Text style={t.codeInline}>useTheme()</Text>. Never hardcode hex
              values — always reference a token from the{' '}
              <Text style={t.codeInline}>colors</Text> object.
            </DocSubheading>

            <ColorGroup label="PAPER SURFACE" colors={colors}>
              <Swatch token="colors.bg"       colorValue={colors.bg}       label="bg"       usage="Screen backgrounds" colors={colors} />
              <Swatch token="colors.bgCard"   colorValue={colors.bgCard}   label="bgCard"   usage="Cards, inputs, sheets" colors={colors} />
              <Swatch token="colors.bgCard2"  colorValue={colors.bgCard2}  label="bgCard2"  usage="Progress tracks, nested surfaces" colors={colors} />
              <Swatch token="colors.border"   colorValue={colors.border}   label="border"   usage="Default border on all elements" colors={colors} />
              <Swatch token="colors.borderDim" colorValue={colors.borderDim} label="borderDim" usage="Subtle dividers, dimmed borders" colors={colors} />
              <Swatch token="colors.scanline" colorValue={colors.scanline} label="scanline" usage="CRT scanline overlay" colors={colors} />
            </ColorGroup>

            <ColorGroup label="RED INK SYSTEM" colors={colors}>
              <Swatch token="colors.inkRed"     colorValue={colors.inkRed}     label="inkRed"     usage="Primary CTAs, active underlines, brand accent" colors={colors} />
              <Swatch token="colors.inkRedDim"   colorValue={colors.inkRedDim}   label="inkRedDim"   usage="Active chip/segment border, subdued accent" colors={colors} />
              <Swatch token="colors.inkRedGlow"  colorValue={colors.inkRedGlow}  label="inkRedGlow"  usage="Active chip/segment fill, translucent accent" colors={colors} />
              <Swatch token="colors.inkRedText"  colorValue={colors.inkRedText}  label="inkRedText"  usage="Pinyin text, hover/active accent text" colors={colors} />
            </ColorGroup>

            <ColorGroup label="TEXT HIERARCHY" colors={colors}>
              <Swatch token="colors.textPrimary"   colorValue={colors.textPrimary}   label="textPrimary"   usage="Headings, active labels, card titles" colors={colors} />
              <Swatch token="colors.textSecondary" colorValue={colors.textSecondary} label="textSecondary" usage="Body text, secondary labels, back buttons" colors={colors} />
              <Swatch token="colors.textFaint"     colorValue={colors.textFaint}     label="textFaint"     usage="Section labels, placeholders, inactive states" colors={colors} />
              <Swatch token="colors.textHanzi"     colorValue={colors.textHanzi}     label="textHanzi"     usage="Large hanzi character on flashcards" colors={colors} />
            </ColorGroup>

            <ColorGroup label="SEMANTIC" colors={colors}>
              <Swatch token="colors.green"        colorValue={colors.green}        label="green"        usage="Success states, 'got it' button" colors={colors} />
              <Swatch token="colors.greenBright"   colorValue={colors.greenBright}   label="greenBright"   usage="Hover/active success" colors={colors} />
              <Swatch token="colors.redBtn"        colorValue={colors.redBtn}        label="redBtn"        usage="Error states, 'forgot' button" colors={colors} />
              <Swatch token="colors.redBtnBright"  colorValue={colors.redBtnBright}  label="redBtnBright"  usage="Hover/active error" colors={colors} />
            </ColorGroup>

            <ColorGroup label="CARD SHADOWS" colors={colors}>
              <Swatch token="colors.cardShadow"      colorValue={colors.cardShadow}      label="cardShadow"      usage="Card drop shadow" colors={colors} />
              <Swatch token="colors.cardInsetShadow"  colorValue={colors.cardInsetShadow}  label="cardInsetShadow"  usage="Card inset shadow" colors={colors} />
            </ColorGroup>
          </View>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TYPOGRAPHY
        ════════════════════════════════════════════════════════════════ */}
        {activeNav === 'Typography' && (
          <View>
            <DocHeading colors={colors}>Typography</DocHeading>
            <DocSubheading colors={colors}>
              Two fonts only: IBM Plex Mono for all UI text, Noto Serif SC for
              Chinese characters. Sizes are role-based — each value is tuned to
              its specific text function.
            </DocSubheading>

            {/* Architecture note */}
            <View style={t.noItalicNote}>
              <Text style={[t.lhNote, { marginBottom: 0 }]}>
                <Text style={{ fontFamily: MONO, color: colors.textPrimary, fontWeight: FW.medium }}>Role-Based Sizes</Text>
                {'\n\n'}Font sizes are chosen pragmatically by role, not derived from a mathematical
                ratio. Each size is tuned to its text function — the 1px steps between 9–15px
                give fine control over the hierarchy between related elements.
              </Text>
            </View>

            {/* Display — large, structural */}
            <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, textTransform: 'uppercase', letterSpacing: LS.widest * FS.label, marginTop: space.xxl, marginBottom: space.md }}>Display — FSDisplay</Text>
            <TypeSpecimen
              token="FS.hanzi"
              px={FSDisplay.hanzi}
              sample="漢"
              usage={`${FSDisplay.hanzi}px · weight 300 · LS.tighter (${LS.tighter}em) · LH.single · SERIF · textHanzi — flashcard hero character`}
              color={colors.textHanzi}
              style={{ letterSpacing: LS.tighter * FSDisplay.hanzi }}
            />
            <TypeSpecimen
              token="FS.formTitle"
              px={FSDisplay.formTitle}
              sample="WELCOME BACK"
              usage={`${FSDisplay.formTitle}px · weight 500 uppercase · LS.wider (${LS.wider}em) · LH.tight · MONO — form/screen headings`}
              family={MONO}
              bold
              style={{ textTransform: 'uppercase', letterSpacing: LS.wider * FSDisplay.formTitle }}
            />

            {/* Content — readable text, UI controls */}
            <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, textTransform: 'uppercase', letterSpacing: LS.widest * FS.label, marginTop: space.xxl, marginBottom: space.md }}>Content — FSContent</Text>
              <TypeSpecimen
                token="FS.pinyin"
                px={FSContent.pinyin}
                sample="zhōng guó"
                usage={`${FSContent.pinyin}px · weight 400 italic · LS.wider (${LS.wider}em) · LH.single · MONO · inkRedText — main card pinyin`}
                family={MONO}
                color={colors.inkRedText}
                italic
              />
              <TypeSpecimen
                token="FS.definition"
                px={FSContent.definition}
                sample="to study, to learn"
                usage={`${FSContent.definition}px · weight 300 · LS.wide (${LS.wide}em) · LH.normal · MONO — card meaning, header titles`}
                family={MONO}
              />
              <TypeSpecimen
                token="FS.input"
                px={FSContent.input}
                sample="you@example.com"
                usage={`${FSContent.input}px · weight 300 · LS.normal (${LS.normal}em) · LH.normal · MONO — form input text`}
                family={MONO}
              />
              <TypeSpecimen
                token="FS.body"
                px={FSContent.body}
                sample="What would you like to do today?"
                usage={`${FSContent.body}px · weight 400 · LS.wide (${LS.wide}em) · LH.normal · MONO — subtitles, descriptions, secondary buttons`}
                family={MONO}
              />
              <TypeSpecimen
                token="FS.ctaLabel"
                px={FSContent.ctaLabel}
                sample="START SESSION"
                usage={`${FSContent.ctaLabel}px · weight 500 uppercase · LS.cta (${LS.cta}em) · LH.single · MONO — primary CTA button text`}
                family={MONO}
                bold
                style={{ textTransform: 'uppercase' }}
              />
              <TypeSpecimen
                token="FS.progress"
                px={FSContent.progress}
                sample="5 of 20"
                usage={`${FSContent.progress}px · weight 400 · LS.progress (${LS.progress}em) · LH.single · MONO — progress counter, example translation`}
                family={MONO}
              />
              <TypeSpecimen
                token="FS.exPinyin"
                px={FSContent.exPinyin}
                sample="wǒ xǐhuān xuéxí"
                usage={`${FSContent.exPinyin}px · weight 400 italic · LS.example (${LS.example}em) · LH.normal · MONO · inkRedText — example sentence pinyin`}
                family={MONO}
                color={colors.inkRedText}
                italic
              />
              <TypeSpecimen
                token="FS.label"
                px={FSContent.label}
                sample="DIFFICULTY"
                usage={`${FSContent.label}px · weight 400 uppercase · LS.widest (${LS.widest}em) · LH.single · MONO · textFaint — form labels, section headers`}
                family={MONO}
                style={{ textTransform: 'uppercase' }}
              />
              <TypeSpecimen
                token="FS.micro"
                px={FSContent.micro}
                sample="TAP TO REVEAL"
                usage={`${FSContent.micro}px · weight 400 uppercase · LS.extreme (${LS.extreme}em) · LH.single · MONO · textFaint — tap hints, rating buttons`}
                family={MONO}
                style={{ textTransform: 'uppercase' }}
              />

            {/* Line heights */}
            <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, textTransform: 'uppercase', letterSpacing: LS.widest * FS.label, marginTop: space.xxl, marginBottom: space.md }}>Line Heights — LH</Text>
              <Text style={t.lhNote}>
                Line heights are simple ratio multipliers applied as{' '}
                <Text style={t.codeInline}>fontSize * LH.normal</Text>.
                Three ratios cover all use cases: single-line text (1.0),
                headings (1.2), and multi-line body (1.5).
              </Text>

              {/* ── Token table ──────────────────────────────────── */}
              <Text style={t.lhSectionTitle}>Token reference</Text>
              {(
                [
                  { name: 'single',  ratio: LH.single,  usage: 'Buttons, counters, scores, pinyin, labels' },
                  { name: 'tight',   ratio: LH.tight,   usage: 'Form titles, headings' },
                  { name: 'normal',  ratio: LH.normal,  usage: 'Multi-line body, definitions, examples' },
                ] as const
              ).map(({ name, ratio, usage }) => (
                <View key={name} style={t.lhRow}>
                  <Text style={t.lhToken}>LH.{name}</Text>
                  <Text style={t.lhValue}>{ratio}</Text>
                  <Text style={t.lhFormula}>{usage}</Text>
                </View>
              ))}

              {/* ── LH.single — hero character ────────────────────── */}
              <Text style={t.lhSectionTitle}>LH.single (1.0) — hero character</Text>
              <Text style={t.lhNote}>
                The hero character uses LH.single (1.0) for a tight bounding box.
                No excess leading — the character should feel like it's floating
                in the card centre, not inside a text container. This also applies
                to buttons, counters, scores, pinyin, and labels.
              </Text>
              <View style={t.lhDemoCard}>
                <Text style={t.lhDemoLabel}>session.tsx — flashcard hero</Text>
                <View style={t.lhDemoCentered}>
                  <Text style={{
                    fontFamily: SERIF, fontSize: FS.hanzi, lineHeight: FS.hanzi * LH.single,
                    color: colors.textHanzi, letterSpacing: LS.tighter * FS.hanzi,
                    textAlign: 'center',
                  }}>学</Text>
                  <Text style={{
                    fontFamily: MONO, fontSize: FS.pinyin, letterSpacing: 3,
                    color: colors.inkRedText, fontStyle: 'italic',
                    marginTop: 18, textAlign: 'center',
                  }}>xué</Text>
                </View>
                <View style={t.lhDemoAnnotation}>
                  <Text style={t.lhDemoAnnotationText}>
                    108px character with LH.single — tight bounding box keeps pinyin close
                  </Text>
                </View>
              </View>

              {/* ── LH.single — session complete scores ──────────── */}
              <Text style={t.lhSectionTitle}>LH.single (1.0) — session scores</Text>
              <Text style={t.lhNote}>
                Large score numerics on the session completion screen. Single-line text
                that should feel punchy and immediate. LH.single keeps numbers
                dense — they're not prose, they're results.
              </Text>
              <View style={t.lhDemoCard}>
                <Text style={t.lhDemoLabel}>session.tsx — completion scores</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: space.xxl, paddingVertical: space.lg }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{
                      fontSize: FS.formTitle, lineHeight: FS.formTitle * LH.single, fontFamily: MONO,
                      color: colors.green, letterSpacing: LS.tighter * FS.formTitle,
                    }}>12</Text>
                    <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, letterSpacing: 1.5 }}>GOT IT</Text>
                  </View>
                  <Text style={{ fontFamily: MONO, color: colors.textFaint, fontSize: FS.pinyin }}>{Icon.separator}</Text>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{
                      fontSize: FS.formTitle, lineHeight: FS.formTitle * LH.single, fontFamily: MONO,
                      color: colors.redBtn, letterSpacing: LS.tighter * FS.formTitle,
                    }}>8</Text>
                    <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, letterSpacing: 1.5 }}>FORGOT</Text>
                  </View>
                </View>
                <View style={t.lhDemoAnnotation}>
                  <Text style={t.lhDemoAnnotationText}>
                    24px numerics with LH.single — tight, confident, no excess air
                  </Text>
                </View>
              </View>

              {/* ── LH.tight — headings ────────────────────────────── */}
              <Text style={t.lhSectionTitle}>LH.tight (1.2) — headings</Text>
              <Text style={t.lhNote}>
                Used for headings and form titles. Tight leading keeps
                heading text compact without collapsing — slightly more air than
                single-line but much tighter than body text.
              </Text>
              <View style={t.lhDemoCard}>
                <Text style={t.lhDemoLabel}>session.tsx — meaning + example</Text>
                <View style={t.lhDemoCentered}>
                  <Text style={{
                    fontFamily: MONO, fontSize: FS.pinyin, lineHeight: FS.pinyin * LH.tight,
                    color: colors.textPrimary, textAlign: 'center',
                    letterSpacing: LS.tighter * FS.pinyin,
                  }}>to study, to learn</Text>
                  <View style={{ width: 24, height: 1, backgroundColor: colors.border, marginVertical: space.md, alignSelf: 'center' }} />
                  <Text style={{
                    fontFamily: SERIF, fontSize: FS.pinyin, lineHeight: FS.pinyin * LH.tight,
                    color: colors.textSecondary, textAlign: 'center',
                  }}>我喜欢学习中文</Text>
                  <Text style={{
                    fontFamily: MONO, fontSize: FS.label,
                    color: colors.textFaint, textAlign: 'center', letterSpacing: 1,
                    fontStyle: 'italic', marginTop: 4,
                  }}>wǒ xǐhuān xuéxí zhōngwén</Text>
                </View>
                <View style={t.lhDemoAnnotation}>
                  <Text style={t.lhDemoAnnotationText}>
                    18px text with LH.tight (1.2) — characters read as a connected sentence
                  </Text>
                </View>
              </View>

              {/* ── LH.normal — body text ────────────────────────── */}
              <Text style={t.lhSectionTitle}>LH.normal (1.5) — body text</Text>
              <Text style={t.lhNote}>
                Standard comfortable reading for multi-line text. This is where most
                prose lives: auth subtitles, descriptions, definitions, success messages.
                The 1.5 multiplier provides generous leading for readability.
              </Text>
              <View style={t.lhDemoCard}>
                <Text style={t.lhDemoLabel}>auth.tsx — login subtitle</Text>
                <View style={{ paddingVertical: space.md, paddingHorizontal: space.lg }}>
                  <Text style={{
                    fontFamily: MONO, fontSize: FS.formTitle, color: colors.textPrimary,
                    letterSpacing: LS.tighter * FS.formTitle, marginBottom: space.xs,
                  }}>Welcome back</Text>
                  <Text style={{
                    fontFamily: MONO, fontSize: FS.body, lineHeight: FS.body * LH.normal,
                    color: colors.textFaint,
                  }}>Sign in to continue your practice.{'\n'}Your progress syncs across devices.</Text>
                </View>
                <View style={t.lhDemoAnnotation}>
                  <Text style={t.lhDemoAnnotationText}>
                    {FS.body}px text with LH.normal (1.5) — comfortable reading for multi-line text
                  </Text>
                </View>
              </View>

              {/* ── Pinyin — single-line phonetic annotations ──────── */}
              <Text style={t.lhSectionTitle}>Pinyin — LH.single (1.0)</Text>
              <Text style={t.lhNote}>
                Pinyin is typically a single line of romanized syllables. It uses
                LH.single for tight bounding — tone diacritics are handled by the
                font's own vertical metrics.
              </Text>
              <View style={t.lhDemoCard}>
                <Text style={t.lhDemoLabel}>session.tsx — pinyin annotation</Text>
                <View style={t.lhDemoCentered}>
                  <Text style={{
                    fontFamily: MONO, fontSize: FS.pinyin, lineHeight: FS.pinyin * LH.single,
                    color: colors.inkRedText, fontStyle: 'italic',
                    letterSpacing: 3, textAlign: 'center',
                  }}>zhōng guó rén</Text>
                </View>
                <View style={t.lhDemoAnnotation}>
                  <Text style={t.lhDemoAnnotationText}>
                    {FS.pinyin}px pinyin with LH.single — tight bounding for single-line phonetics
                  </Text>
                </View>
              </View>

              {/* ── Ratio approach explanation ─────────────────────── */}
              <Text style={t.lhSectionTitle}>Why ratio multipliers?</Text>
              <Text style={t.lhNote}>
                Using simple ratios (1.0, 1.2, 1.5) instead of absolute pixel
                values means line heights automatically scale when font sizes change.
                The three ratios cover all common scenarios: single-line elements like
                buttons and scores use 1.0, headings use 1.2, and multi-line body text
                uses 1.5.
              </Text>
              <View style={t.lhDemoCard}>
                <Text style={t.lhDemoLabel}>vertical rhythm — stacked text roles</Text>
                <View style={{ paddingVertical: space.md, paddingHorizontal: space.lg, gap: 0 }}>
                  <Text style={{
                    fontFamily: MONO, fontSize: FS.pinyin, lineHeight: FS.pinyin * LH.tight,
                    color: colors.textPrimary, fontWeight: FW.medium,
                  }}>HSK 1 — Basic Characters</Text>
                  <Text style={{
                    fontFamily: MONO, fontSize: FS.body, lineHeight: FS.body * LH.normal,
                    color: colors.textSecondary,
                  }}>150 cards across 6 categories</Text>
                  <Text style={{
                    fontFamily: MONO, fontSize: FS.label, lineHeight: FS.label * LH.normal,
                    color: colors.textFaint,
                  }}>Last studied 2 days ago {Icon.separator} 71% retention</Text>
                </View>
                <View style={t.lhDemoAnnotation}>
                  <Text style={t.lhDemoAnnotationText}>
                    LH.tight → LH.normal — ratios scale with font size
                  </Text>
                </View>
              </View>

            {/* Letter spacing */}
            <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, textTransform: 'uppercase', letterSpacing: LS.widest * FS.label, marginTop: space.xxl, marginBottom: space.md }}>Letter Spacing — LS</Text>
              <Text style={t.lhNote}>
                Unitless em multipliers applied as{' '}
                <Text style={t.codeInline}>letterSpacing: LS.tighter * FS.formTitle</Text>.
                Display sizes tighten progressively; body/UI text uses no tracking.
                MONO phonetic text (pinyin, badges) is exempt — positive tracking aids readability.
              </Text>
              {(
                [
                  { token: 'LS.tighter',   em: LS.tighter,   appliesTo: 'hanzi display' },
                  { token: 'LS.normal',    em: LS.normal,    appliesTo: 'default — body, UI text' },
                  { token: 'LS.subtle',    em: LS.subtle,    appliesTo: 'subtitles' },
                  { token: 'LS.wide',      em: LS.wide,      appliesTo: 'definition text, body, oauth buttons' },
                  { token: 'LS.progress',  em: LS.progress,  appliesTo: 'progress counters' },
                  { token: 'LS.example',   em: LS.example,   appliesTo: 'example hanzi, example pinyin' },
                  { token: 'LS.wider',     em: LS.wider,     appliesTo: 'pinyin, score labels' },
                  { token: 'LS.cta',       em: LS.cta,       appliesTo: 'CTA button labels' },
                  { token: 'LS.widest',    em: LS.widest,    appliesTo: 'button labels, form labels' },
                  { token: 'LS.divider',   em: LS.divider,   appliesTo: 'divider text, hint triggers' },
                  { token: 'LS.ultrawide', em: LS.ultrawide, appliesTo: 'uppercase card labels (POS · HSK)' },
                  { token: 'LS.extreme',   em: LS.extreme,   appliesTo: 'micro text ("Tap to reveal")' },
                ] as const
              ).map(({ token, em, appliesTo }) => (
                <View key={token} style={t.lhRow}>
                  <Text style={t.lhToken}>{token}</Text>
                  <Text style={t.lhValue}>{em > 0 ? `+${em}` : em}em</Text>
                  <Text style={t.lhFormula}>{appliesTo}</Text>
                </View>
              ))}
            {/* Monospace callout */}
            <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, textTransform: 'uppercase', letterSpacing: LS.widest * FS.label, marginTop: space.xxl, marginBottom: space.md }}>Monospace — MONO</Text>
              <View style={t.monoRow}>
                <View style={t.monoDemo}>
                  <Text style={[t.monoSample, { color: colors.inkRedText, fontStyle: 'italic' }]}>pīn yīn</Text>
                  <Text style={t.monoCaption}>FS.pinyin · MONO · inkRedText</Text>
                </View>
                <View style={t.monoDesc}>
                  <Text style={t.propName}>Used for</Text>
                  <Text style={t.propValue}>All UI text — pinyin pronunciation, score counters, HSK badges, part-of-speech tags, session metadata, button labels, form labels, progress indicators</Text>
                </View>
              </View>

            {/* Italic usage */}
            <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, textTransform: 'uppercase', letterSpacing: LS.widest * FS.label, marginTop: space.xxl, marginBottom: space.md }}>Italic Usage</Text>
              <View style={t.noItalicNote}>
                <Text style={t.noItalicText}>
                  Pinyin is always rendered in italic with{' '}
                  <Text style={t.codeInline}>inkRedText</Text> color. This applies to
                  both main card pinyin ({FSContent.pinyin}px) and example pinyin ({FSContent.exPinyin}px).
                  No other text role uses italic.
                </Text>
                <View style={{ marginTop: space.md, alignItems: 'center' }}>
                  <Text style={{
                    fontFamily: MONO, fontSize: FS.pinyin,
                    color: colors.inkRedText, fontStyle: 'italic',
                    letterSpacing: 3,
                  }}>zhōng guó</Text>
                </View>
              </View>
          </View>
        )}

        {/* ════════════════════════════════════════════════════════════════
            ICONS
        ════════════════════════════════════════════════════════════════ */}
        {activeNav === 'Icons' && (
          <View>
            <DocHeading colors={colors}>Iconography</DocHeading>
            <DocSubheading colors={colors}>
              All icons are pure ASCII/Unicode characters from{' '}
              <Text style={t.codeInline}>theme/icons.ts</Text>, rendered in MONO
              font. No SVG icon sets — icons inherit color from semantic context.
              Import via <Text style={t.codeInline}>Icon.name</Text>.
            </DocSubheading>

            <View style={{ gap: space.sm }}>
              {(
                [
                  { name: 'close',     char: Icon.close,     usage: 'Close/dismiss buttons, "wrong" indicator' },
                  { name: 'next',      char: Icon.next,      usage: 'Forward navigation, card arrows' },
                  { name: 'ornament',  char: Icon.ornament,  usage: 'Decorative separator, card corners' },
                  { name: 'dropdown',  char: Icon.dropdown,  usage: 'Dropdown/select indicators' },
                  { name: 'audio',     char: Icon.audio,     usage: 'Audio playback trigger' },
                  { name: 'separator', char: Icon.separator, usage: 'Inline text separator (score strips, metadata)' },
                  { name: 'correct',   char: Icon.correct,   usage: '"Got it" indicator, success states' },
                  { name: 'repeat',    char: Icon.repeat,    usage: '"Study again" action' },
                  { name: 'left',      char: Icon.left,      usage: 'Back navigation' },
                  { name: 'right',     char: Icon.right,     usage: 'Forward navigation' },
                ] as const
              ).map(({ name, char, usage }) => (
                <View key={name} style={{
                  flexDirection: 'row', alignItems: 'center', gap: space.lg,
                  backgroundColor: colors.bgCard, borderRadius: 0,
                  borderWidth: 1, borderColor: colors.border, padding: space.md,
                }}>
                  <View style={{
                    width: 48, height: 48, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: colors.bgCard2, borderRadius: 0,
                    borderWidth: 1, borderColor: colors.border,
                  }}>
                    <Text style={{ fontFamily: MONO, fontSize: FS.pinyin, color: colors.textPrimary }}>{char}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ fontFamily: MONO, fontSize: FS.body, color: colors.textPrimary }}>Icon.{name}</Text>
                    <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint }}>'{char}'</Text>
                    <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textSecondary, marginTop: 2 }}>{usage}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ════════════════════════════════════════════════════════════════
            RULES
        ════════════════════════════════════════════════════════════════ */}
        {activeNav === 'Rules' && (
          <View>
            <DocHeading colors={colors}>Type Rules</DocHeading>
            <DocSubheading colors={colors}>
              How{' '}<Text style={t.codeInline}>FS</Text>,{' '}
              <Text style={t.codeInline}>FW</Text>,{' '}
              color, and{' '}
              <Text style={t.codeInline}>LS</Text>{' '}
              combine to build hierarchy.{' '}
              Size signals priority · weight signals interactivity · color signals role.
            </DocSubheading>

            {/* ── Font weight ───────────────────────────────────────── */}
            <Section label="FONT WEIGHT — FW">
              {/* ── Why only three weights ─────────────────────── */}
              <Text style={t.lhSectionTitle}>Why three weights — and no bold?</Text>
              <Text style={t.lhNote}>
                Each weight encodes a{' '}
                <Text style={{ color: colors.textPrimary }}>semantic role</Text>, not a
                level of emphasis. The three axes work together: size signals
                priority, weight signals interactivity, color signals role. With
                three clearly separated weights, peripheral vision can distinguish
                "tappable control / heading" from "readable content" from
                "elegant display" without consciously parsing it.
              </Text>
              <View style={t.lhDemoCard}>
                <Text style={t.lhDemoLabel}>why not bold (700)?</Text>
                <View style={{ paddingVertical: space.md, paddingHorizontal: space.lg }}>
                  <Text style={t.lhNote}>
                    Bold thickens Chinese character strokes, reducing white space
                    between strokes — the very space that makes characters legible.
                    At display sizes (32px+), bold Chinese text feels muddy.
                    Medium (500) adds heading emphasis without degrading stroke
                    clarity. The hero character{' '}
                    <Text style={{ color: colors.textPrimary }}>must</Text> be regular
                    weight — learners should see strokes as they appear in real-world
                    text. Adding weight teaches a visual form that doesn't transfer.
                  </Text>
                  <View style={{ flexDirection: 'row', gap: space.xxl, marginTop: space.lg, justifyContent: 'center' }}>
                    <View style={{ alignItems: 'center', gap: space.xs }}>
                      <Text style={{ fontFamily: SERIF, fontSize: 40, color: colors.textHanzi }}>学</Text>
                      <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.green }}>400 regular {Icon.correct}</Text>
                      <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint }}>Clear strokes</Text>
                    </View>
                    <View style={{ alignItems: 'center', gap: space.xs }}>
                      <Text style={{ fontFamily: SERIF, fontSize: 40, color: colors.textHanzi, fontWeight: '700' }}>学</Text>
                      <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.redBtn }}>700 bold {Icon.close}</Text>
                      <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint }}>Muddy strokes</Text>
                    </View>
                  </View>
                </View>
                <View style={t.lhDemoAnnotation}>
                  <Text style={t.lhDemoAnnotationText}>
                    Compare stroke clarity — bold fills the counter-spaces that make 学 legible
                  </Text>
                </View>
              </View>

              {/* ── The four weights ──────────────────────────── */}
              <Text style={t.lhSectionTitle}>FW.light — 300 — elegant display + form inputs</Text>
              <Text style={t.lhNote}>
                Thin strokes for serif Hanzi display and elegant form inputs.
                FW.light is used for the hero character in serif, form input text,
                and definition/meaning text. The light weight keeps forms feeling
                refined and ensures the hero character's strokes are as close to
                natural handwriting as possible.
              </Text>

              <Text style={t.lhSectionTitle}>FW.medium — 500 — headings + interactive controls</Text>
              <Text style={t.lhNote}>
                Medium weight serves double duty: it signals both "this is a navigation
                waypoint" for headings and "this can be tapped" for interactive controls.
                Combined with display-scale sizing, it creates confident headings without
                the heaviness of bold.
              </Text>
              <View style={t.lhDemoCard}>
                <Text style={t.lhDemoLabel}>used in: profile, settings, session-setup headers · BottomSheetModal title</Text>
                <View style={{ paddingVertical: space.md, paddingHorizontal: space.lg, gap: space.md }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontFamily: MONO, fontSize: FS.body, color: colors.textSecondary }}>{Icon.left} Back</Text>
                    <Text style={{ fontFamily: MONO, fontSize: FS.definition, color: colors.textPrimary, fontWeight: FW.medium }}>New Session</Text>
                    <View style={{ width: 44 }} />
                  </View>
                  <View style={{ height: 1, backgroundColor: colors.border }} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontFamily: MONO, fontSize: FS.body, color: colors.textSecondary }}>{Icon.left} Back</Text>
                    <Text style={{ fontFamily: MONO, fontSize: FS.definition, color: colors.textPrimary, fontWeight: FW.medium }}>Profile</Text>
                    <View style={{ width: 44 }} />
                  </View>
                  <View style={{ height: 1, backgroundColor: colors.border }} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontFamily: MONO, fontSize: FS.definition, color: colors.textPrimary, fontWeight: FW.medium }}>Select Deck</Text>
                    <Text style={{ fontFamily: MONO, fontSize: FS.body, color: colors.inkRed, fontWeight: FW.medium }}>Done</Text>
                  </View>
                </View>
                <View style={t.lhDemoAnnotation}>
                  <Text style={t.lhDemoAnnotationText}>
                    FS.definition (15px) with medium weight makes it a landmark
                  </Text>
                </View>
              </View>

              <Text style={t.lhSectionTitle}>FW.medium — 500 — interactive controls</Text>
              <Text style={t.lhNote}>
                Signals "this can be tapped." Medium weight is heavier than prose
                (distinguishing it from passive text) but lighter than headings
                (it's an affordance, not a landmark). The learner's finger knows
                where to go before their eyes finish scanning.
              </Text>
              <View style={t.lhDemoCard}>
                <Text style={t.lhDemoLabel}>used in: Button, Chip, TabSwitcher, SegmentedControl, Card.title, deck name</Text>
                <View style={{ paddingVertical: space.md, paddingHorizontal: space.lg, gap: space.md }}>
                  <Button label="Start Session" onPress={() => {}} />
                  <View style={{ flexDirection: 'row', gap: space.sm }}>
                    <View style={{
                      flex: 1, paddingVertical: 11, borderRadius: 0,
                      backgroundColor: colors.inkRedGlow, borderWidth: 1, borderColor: colors.inkRedDim,
                      alignItems: 'center',
                    }}>
                      <Text style={{ fontFamily: MONO, fontSize: FS.body, color: colors.textPrimary, fontWeight: FW.medium }}>20</Text>
                    </View>
                    <View style={{
                      flex: 1, paddingVertical: 11, borderRadius: 0,
                      backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
                      alignItems: 'center',
                    }}>
                      <Text style={{ fontFamily: MONO, fontSize: FS.body, color: colors.textFaint, fontWeight: FW.medium }}>50</Text>
                    </View>
                  </View>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: space.md,
                    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
                    borderRadius: 0, paddingHorizontal: space.lg, paddingVertical: 12,
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: MONO, fontSize: FS.definition, color: colors.textPrimary, fontWeight: FW.medium }}>HSK 1 — Basics</Text>
                      <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, marginTop: 2 }}>150 common characters</Text>
                    </View>
                    <Text style={{ fontFamily: MONO, fontSize: FS.body, color: colors.textFaint }}>{Icon.dropdown}</Text>
                  </View>
                </View>
                <View style={t.lhDemoAnnotation}>
                  <Text style={t.lhDemoAnnotationText}>
                    Medium weight on all tappable labels — buttons, segments, deck selector
                  </Text>
                </View>
              </View>

              <Text style={t.lhSectionTitle}>FW.regular — 400 — readable content</Text>
              <Text style={t.lhNote}>
                The default. Never written explicitly in stylesheets — omitting{' '}
                <Text style={t.codeInline}>fontWeight</Text> produces regular.
                Most text in a learning app is{' '}
                <Text style={{ color: colors.textPrimary }}>read</Text>, not acted
                upon. Regular weight keeps reading text quiet so the hero character,
                headings, and interactive controls can do their jobs.
              </Text>
              <View style={t.lhDemoCard}>
                <Text style={t.lhDemoLabel}>used in: subtitles, descriptions, captions, example sentences, translations</Text>
                <View style={{ paddingVertical: space.md, paddingHorizontal: space.lg, gap: space.sm }}>
                  <Text style={{ fontFamily: MONO, fontSize: FS.body, color: colors.textFaint }}>What would you like to do?</Text>
                  <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, lineHeight: FS.label * LH.normal }}>Start a fresh round of flashcards{'\n'}with your selected deck and filters</Text>
                  <Text style={{ fontFamily: MONO, fontSize: FS.pinyin, color: colors.inkRedText, fontStyle: 'italic', letterSpacing: 3, marginTop: space.sm }}>zhōng guó rén</Text>
                  <Text style={{ fontFamily: SERIF, fontSize: FS.pinyin, color: colors.textSecondary, marginTop: space.xs }}>我喜欢学习中文</Text>
                  <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, letterSpacing: 1, fontStyle: 'italic' }}>wǒ xǐhuān xuéxí zhōngwén</Text>
                </View>
                <View style={t.lhDemoAnnotation}>
                  <Text style={t.lhDemoAnnotationText}>
                    No fontWeight in any of these styles — regular keeps content subordinate to controls and headings
                  </Text>
                </View>
              </View>

              {/* ── Where weights collide ─────────────────────── */}
              <Text style={t.lhSectionTitle}>Where weight resolves ambiguity</Text>
              <Text style={t.lhNote}>
                Weight matters most where sizes are close. Two text elements at
                nearly the same size can have completely different roles if their
                weights differ. Without weight as a second axis, these pairs
                would be indistinguishable.
              </Text>
              <View style={t.lhDemoCard}>
                <Text style={t.lhDemoLabel}>same size, different weight {Icon.right} different role</Text>
                <View style={{ paddingVertical: space.md, paddingHorizontal: space.lg, gap: space.lg }}>
                  <View style={{ gap: space.xs }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                      <Text style={{ fontFamily: MONO, fontSize: FS.pinyin, color: colors.textPrimary, fontWeight: FW.medium }}>Card Heading</Text>
                      <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint }}>18px · 500</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                      <Text style={{ fontFamily: MONO, fontSize: FS.pinyin, color: colors.inkRedText, fontStyle: 'italic', letterSpacing: 3 }}>zhōng guó</Text>
                      <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint }}>18px · 400</Text>
                    </View>
                    <Text style={t.lhNote}>
                      Only 1px apart, but weight (500 vs 400) + tracking + font family make
                      their roles unambiguous. The heading is a landmark; the pinyin is a
                      pronunciation guide.
                    </Text>
                  </View>
                  <View style={{ height: 1, backgroundColor: colors.border }} />
                  <View style={{ gap: space.xs }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                      <Text style={{ fontFamily: MONO, fontSize: FS.definition, color: colors.textPrimary, fontWeight: FW.medium }}>Start Session</Text>
                      <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint }}>15px · 500</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                      <Text style={{ fontFamily: MONO, fontSize: FS.body, color: colors.textFaint }}>What would you like to do?</Text>
                      <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint }}>13px · 400</Text>
                    </View>
                    <Text style={t.lhNote}>
                      Close font sizes, but medium weight signals "tap me" while regular
                      signals "read me." Color reinforces: primary for interactive, faint for
                      passive.
                    </Text>
                  </View>
                </View>
              </View>

              {/* ── Original reference rows ───────────────────── */}
              <Text style={t.lhSectionTitle}>Token reference</Text>
              <WeightRow
                token="FW.light"
                value="'300'"
                sample="学 · definition"
                rule="Serif Hanzi display · form inputs · definition text"
                where="hero character (serif), Field input text, meaning/definition labels"
                colors={colors}
              />
              <WeightRow
                token="FW.medium"
                value="'500'"
                sample="Start Session"
                rule="Headings, interactive controls, list / card primary labels"
                where="profile title, session-setup headerTitle, BottomSheetModal title, Button, Chip, TabSwitcher, SegmentedControl, Card.title"
                colors={colors}
              />
              <WeightRow
                token="FW.regular"
                value="'400' — default"
                sample="Continue where you left off"
                rule="Prose · subtitles · captions · metadata — omit fontWeight in style"
                where="greetSub, descriptions, Section.label, tapHint, all body copy"
                colors={colors}
              />
            </Section>

            {/* ── Text color hierarchy ──────────────────────────────── */}
            <Section label="TEXT COLOR HIERARCHY">
              <Text style={t.lhNote}>
                Color tracks role, not size. The same{' '}
                <Text style={t.codeInline}>FS.label</Text> caption can be{' '}
                <Text style={t.codeInline}>colors.textFaint</Text> (hint) or{' '}
                <Text style={t.codeInline}>colors.textPrimary</Text> (MONO badge token) —
                choose based on how much attention the text should draw.
              </Text>
              <ColorRoleRow
                token="colors.textPrimary"
                rule="Active labels, headings, primary content — maximum contrast"
                where="all heading text, active tab/chip labels, input values"
                colors={colors}
              />
              <ColorRoleRow
                token="colors.textSecondary"
                rule="Supporting text — present but not competing for focus"
                where="body copy, subtitles, back buttons, descriptions"
                colors={colors}
              />
              <ColorRoleRow
                token="colors.textFaint"
                rule="Passive / background text — recedes, minimal contrast"
                where="section labels, placeholders, inactive states, captions"
                colors={colors}
              />
            </Section>

            {/* ── Role guide ────────────────────────────────────────── */}
            <Section label="ROLE GUIDE — full token combination per text role">
              <Text style={t.lhNote}>
                Every text element in the app maps to one of these roles.
                LS applies only to display-scale tokens; body scale always uses{' '}
                <Text style={t.codeInline}>LS.normal</Text>.
              </Text>
              {([
                {
                  role: 'Screen heading',
                  sample: 'WELCOME BACK',
                  size: FS.formTitle,   fw: FW.medium,  color: colors.textPrimary,
                  fsKey: 'FS.formTitle',   fwKey: 'FW.medium', colorKey: 'textPrimary',
                  lsKey: 'LS.wider',
                  where: 'sc.title · greetTitle · auth heading',
                },
                {
                  role: 'Header bar label',
                  sample: 'New Session',
                  size: FS.definition,  fw: FW.medium,  color: colors.textPrimary,
                  fsKey: 'FS.definition', fwKey: 'FW.medium', colorKey: 'textPrimary',
                  lsKey: '—',
                  where: 'session-setup headerTitle · BottomSheetModal title · settings title',
                },
                {
                  role: 'Body text',
                  sample: 'Continue where you left off',
                  size: FS.body,    fw: undefined,    color: colors.textSecondary,
                  fsKey: 'FS.body',    fwKey: '—',           colorKey: 'textSecondary',
                  lsKey: '—',
                  where: 'greetSub · Card.subtitle · descriptions',
                },
                {
                  role: 'Interactive label',
                  sample: 'Start Session',
                  size: FS.definition,  fw: FW.medium,    color: colors.textPrimary,
                  fsKey: 'FS.definition', fwKey: 'FW.medium',   colorKey: 'textPrimary',
                  lsKey: '—',
                  where: 'Card.title · deckName · rowName',
                },
                {
                  role: 'Toggle / tab label',
                  sample: 'New',
                  size: FS.body,    fw: FW.medium,    color: colors.textSecondary,
                  fsKey: 'FS.body',    fwKey: 'FW.medium',   colorKey: 'textSecondary',
                  lsKey: '—',
                  where: 'Chip · TabSwitcher · SegmentedControl (inactive state)',
                },
                {
                  role: 'Section label',
                  sample: 'DECK',
                  size: FS.label,   fw: undefined,    color: colors.textFaint,
                  fsKey: 'FS.label',   fwKey: '—',           colorKey: 'textFaint',
                  lsKey: '— uppercase',
                  where: 'Section component · cs.tableHeading · demoLabel',
                },
                {
                  role: 'Caption / hint',
                  sample: 'tap · pinyin  ··  double tap',
                  size: FS.label,   fw: undefined,    color: colors.textFaint,
                  fsKey: 'FS.label',   fwKey: '—',           colorKey: 'textFaint',
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
                  colors={colors}
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
            <DocHeading colors={colors}>Spacing & Radius</DocHeading>
            <DocSubheading colors={colors}>
              Spacing tokens are exported as{' '}
              <Text style={t.codeInline}>space</Text> and border-radius tokens
              as <Text style={t.codeInline}>radius</Text> from{' '}
              <Text style={t.codeInline}>theme/spacing.ts</Text>.
            </DocSubheading>

            <Section label="SPACING SCALE">
              {(Object.keys(space) as (keyof typeof space)[]).map(name => { const val = space[name]; return (
                <View key={name} style={t.spacingRow}>
                  <View style={t.spacingMeta}>
                    <Text style={t.tokenName}>space.{name}</Text>
                    <Text style={t.tokenValue}>{val}px</Text>
                  </View>
                  <View style={t.spacingBarWrap}>
                    <View style={[t.spacingBar, { width: val * 3 }]} />
                  </View>
                </View>
              ); })}
            </Section>

            <Section label="BORDER RADIUS SCALE">
              <View style={t.radiusGrid}>
                {(Object.keys(radius) as (keyof typeof radius)[]).map(name => { const val = radius[name]; return (
                  <View key={name} style={t.radiusItem}>
                    <View style={[t.radiusBox, { borderRadius: val }]} />
                    <Text style={t.tokenName}>radius.{name}</Text>
                    <Text style={t.tokenValue}>{val}px</Text>
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
            <DocHeading colors={colors}>Components</DocHeading>
            <DocSubheading colors={colors}>
              All components live in <Text style={t.codeInline}>components/</Text> and
              are imported via the <Text style={t.codeInline}>@/</Text> alias.
              They consume only tokens — no hardcoded values.
            </DocSubheading>

            {/* ── Button ──────────────────────────────────────────────── */}
            <ComponentSection
              name="Button"
              file="components/Button.tsx"
              description="Primary call-to-action. Supports three variants, two shapes, disabled, and loading states. Disabled opacity is 0.18."
              props={[
                { name: 'label',    type: 'string',                               desc: 'Button text' },
                { name: 'onPress',  type: '() => void',                           desc: 'Press handler' },
                { name: 'variant',  type: "'primary' | 'secondary' | 'ghost'",    desc: "Default: 'primary'" },
                { name: 'shape',    type: "'pill' | 'rounded'",                   desc: "Default: 'pill'" },
                { name: 'disabled', type: 'boolean',                              desc: 'Dims to 18% opacity' },
                { name: 'loading',  type: 'boolean',                              desc: 'Shows ActivityIndicator' },
              ]}
              usedIn={[
                { screen: 'auth.tsx',          context: 'Sign in / Create account / Send reset link CTAs' },
                { screen: 'session-setup.tsx', context: '"Start Session" footer CTA' },
                { screen: 'session.tsx',       context: '"Study again" and "Back to home" on completion screen' },
                { screen: 'settings.tsx',      context: '"Save" (primary) and "Sign out" (ghost)' },
              ]}
              colors={colors}
            >
              <Text style={t.demoLabel}>Variants</Text>
              <View style={t.buttonRow}>
                <Button label="Start Session" onPress={() => {}} variant="primary"   style={t.buttonFlex} />
                <Button label="Continue with Google" onPress={() => {}} variant="secondary" style={t.buttonFlex} />
                <Button label="Cancel" onPress={() => {}} variant="ghost"     style={t.buttonFlex} />
              </View>

              <Text style={[t.demoLabel, { marginTop: space.lg }]}>Typography per variant</Text>
              <View style={{ backgroundColor: colors.bgCard2, padding: space.md, marginBottom: space.md }}>
                <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, textTransform: 'uppercase', letterSpacing: LS.widest * FS.label, marginBottom: space.sm }}>Primary (CTA)</Text>
                <Text style={{ fontFamily: MONO, fontSize: FS.body, color: colors.textSecondary, lineHeight: FS.body * LH.normal }}>
                  {`${FS.ctaLabel}px · weight ${FW.medium} · uppercase · LS ${LS.cta}em`}
                </Text>
                <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, textTransform: 'uppercase', letterSpacing: LS.widest * FS.label, marginBottom: space.sm, marginTop: space.md }}>Secondary / Ghost</Text>
                <Text style={{ fontFamily: MONO, fontSize: FS.body, color: colors.textSecondary, lineHeight: FS.body * LH.normal }}>
                  {`${FS.body}px · weight ${FW.regular} · normal case · LS ${LS.wide}em`}
                </Text>
              </View>

              <Text style={[t.demoLabel, { marginTop: space.lg }]}>Icon variant</Text>
              <Button label="Continue with Google" onPress={() => {}} variant="secondary" icon={<GoogleIcon />} />

              <Text style={[t.demoLabel, { marginTop: space.lg }]}>States</Text>
              <View style={t.buttonRow}>
                <Button label="Disabled" onPress={() => {}} disabled style={t.buttonFlex} />
                <Button label="Loading"  onPress={() => {}} loading  style={t.buttonFlex} />
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
              colors={colors}
            >
              <View style={t.gap12}>
                <Card icon="学" title="New Session"    subtitle="Start a fresh flashcard session"   onPress={() => {}} variant="primary" />
                <Card icon="习" title="Resume Session" subtitle="Continue from where you left off"  onPress={() => {}} variant="secondary" />
                <Card icon="复" title="Disabled Card"  subtitle="No active session to resume"       onPress={() => {}} variant="secondary" disabled />
              </View>
            </ComponentSection>

            {/* ── Chip ────────────────────────────────────────────────── */}
            <ComponentSection
              name="Chip"
              file="components/Chip.tsx"
              description="Selectable toggle row with a dot indicator, label, and optional sublabel. Square corners."
              props={[
                { name: 'label',    type: 'string',       desc: 'Primary label' },
                { name: 'sublabel', type: 'string',       desc: 'Secondary descriptor (optional)' },
                { name: 'active',   type: 'boolean',      desc: 'Selected state' },
                { name: 'onPress',  type: '() => void',   desc: 'Toggle handler' },
              ]}
              usedIn={[
                { screen: 'session-setup.tsx', context: '"New", "Review", "Hard" difficulty filter toggles' },
              ]}
              colors={colors}
            >
              <View style={t.gap12}>
                <Chip label="New"    sublabel="Cards you haven't seen yet" active={chipNew}    onPress={() => setChipNew((v: boolean) => !v)} />
                <Chip label="Review" sublabel="Cards you got last time"    active={chipReview} onPress={() => setChipReview((v: boolean) => !v)} />
                <Chip label="Hard"   sublabel="Cards you forgot"           active={chipHard}   onPress={() => setChipHard((v: boolean) => !v)} />
              </View>
            </ComponentSection>

            {/* ── Field ───────────────────────────────────────────────── */}
            <ComponentSection
              name="Field"
              file="components/Field.tsx"
              description="Labelled text input with focus state, error border, and inline error message. Square corners, MONO font, 15px weight 300."
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
              colors={colors}
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
              colors={colors}
            >
              <View style={t.gap12}>
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
              colors={colors}
            >
              <Section label="EXAMPLE SECTION">
                <View style={t.sectionPlaceholder}>
                  <Text style={t.sectionPlaceholderText}>Children go here</Text>
                </View>
              </Section>
            </ComponentSection>

            {/* ── SegmentedControl ────────────────────────────────────── */}
            <ComponentSection
              name="SegmentedControl"
              file="components/SegmentedControl.tsx"
              description="Horizontal row of preset option segments with optional custom numeric input. Square corners."
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
              colors={colors}
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
              colors={colors}
            >
              <View style={t.statGrid}>
                <StatCard label="Sessions"   value={42}    style={t.statFlex} />
                <StatCard label="Cards seen" value="1 240" style={t.statFlex} />
              </View>
              <View style={[t.statGrid, { marginTop: space.sm }]}>
                <StatCard label="Guessed"    value={980}   style={t.statFlex} />
                <StatCard label="Avg / session" value={29} style={t.statFlex} />
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
              colors={colors}
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
                { name: 'initials', type: 'string',        desc: "1-2 chars shown when no photo. Default: '?'" },
                { name: 'size',     type: 'number',        desc: 'Diameter in pixels. Default: 80' },
                { name: 'onPress',  type: '() => void',    desc: 'When provided, wraps in TouchableOpacity' },
              ]}
              usedIn={[
                { screen: 'home.tsx',    context: 'Header — top-right profile icon (size 36)' },
                { screen: 'profile.tsx', context: 'Avatar section — large editable profile photo (size 96)' },
              ]}
              colors={colors}
            >
              <View style={t.avatarRow}>
                <View style={t.avatarItem}>
                  <Avatar initials="PB" size={80} />
                  <Text style={t.avatarLabel}>initials · 80px</Text>
                </View>
                <View style={t.avatarItem}>
                  <Avatar initials="YL" size={48} />
                  <Text style={t.avatarLabel}>initials · 48px</Text>
                </View>
                <View style={t.avatarItem}>
                  <Avatar initials="AB" size={36} onPress={() => {}} />
                  <Text style={t.avatarLabel}>tappable · 36px</Text>
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
              colors={colors}
            >
              <Button label="Open Bottom Sheet" onPress={() => setSheetOpen(true)} />
              <BottomSheetModal
                visible={sheetOpen}
                onClose={() => setSheetOpen(false)}
                title="Select Deck"
              >
                <View style={t.sheetContent}>
                  <Text style={t.sheetContentText}>HSK 1 — 150 cards</Text>
                  <Text style={t.sheetContentText}>HSK 2 — 150 cards</Text>
                  <Text style={t.sheetContentText}>HSK 3 — 300 cards</Text>
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
            <DocHeading colors={colors}>Screen Examples</DocHeading>
            <DocSubheading colors={colors}>
              Placeholder mockups of every screen, annotated with the exact
              design system tokens and components used. The left side shows
              the screen; the right side shows what's driving each element.
            </DocSubheading>

            {/* ── HOME ─────────────────────────────────────────────── */}
            <ScreenExample title="Home" file="app/(tabs)/home.tsx" colors={colors}>
              {/* Phone frame content */}
              <PhoneFrame colors={colors}>
                {/* Header */}
                <View style={e.homeHeader}>
                  <View>
                    <Text style={{ fontFamily: SERIF, fontSize: FS.pinyin, color: colors.inkRed, fontWeight: FW.medium }}>漢字</Text>
                    <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, marginTop: 2, letterSpacing: 4, textTransform: 'uppercase' }}>MANDARINE</Text>
                  </View>
                  <Avatar initials="PB" size={28} />
                </View>
                {/* Greeting */}
                <View style={e.homeGreet}>
                  <Text style={{ fontFamily: MONO, fontSize: FS.formTitle, color: colors.textPrimary, fontWeight: FW.medium, letterSpacing: LS.tighter * FS.formTitle, marginBottom: 4 }}>Hello, Pierre.</Text>
                  <Text style={{ fontFamily: MONO, fontSize: FS.body, color: colors.textFaint }}>What would you like to do?</Text>
                </View>
                {/* Cards */}
                <View style={e.homeCards}>
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
                { category: 'role', token: 'Primary action', value: '—', note: 'New session card, ink-red-tinted',
                  why: 'Accent fill on the icon box draws the eye to the most common action. Hanzi icon reinforces that tapping starts a learning experience.' },
                { category: 'token', token: 'FS.formTitle', value: '24px', note: 'Greeting text — display scale heading',
                  why: 'The largest heading size in the spec. Combined with medium weight, it anchors the screen.' },
                { category: 'token', token: 'FW.medium', value: '500', note: 'Greeting weight — structural landmark',
                  why: 'The greeting is the screen\'s primary heading — medium weight signals "this is where you are."' },
                { category: 'token', token: 'colors.bg', value: 'dynamic', note: 'Screen background',
                  why: 'Themed background adapts to light/dark mode. Dark theme reduces eye strain in extended sessions; light theme suits daytime study.' },
                { category: 'component', token: 'Avatar', value: '28px', note: 'Initials fallback, tappable',
                  why: 'Small size signals "navigation shortcut", not "profile display". Initials fallback means the header works even before the user uploads a photo.' },
                { category: 'component', token: 'Card', value: 'primary + secondary', note: 'Action rows with hanzi icons',
                  why: 'Two variants create visual priority — primary (ink-red-tinted) for the main CTA, secondary (bgCard) for the conditional resume action.' },
              ]} annotationGroups={annotationGroups} colors={colors} />
            </ScreenExample>

            {/* ── SESSION (FLASHCARD) ──────────────────────────────── */}
            <ScreenExample title="Session — Flashcard" file="app/session.tsx" colors={colors}>
              <PhoneFrame colors={colors}>
                {/* Top bar */}
                <View style={e.sessionTopbar}>
                  <Text style={{ fontFamily: MONO, fontSize: FS.pinyin, color: colors.textFaint }}>{Icon.close}</Text>
                  <ProgressBar current={5} total={20} style={{ flex: 1 }} />
                  <Text style={{ fontFamily: MONO, fontSize: FS.pinyin, color: colors.textFaint }}>{Icon.left}</Text>
                </View>
                {/* Score strip */}
                <View style={e.sessionScoreStrip}>
                  <Text style={{ fontFamily: MONO, fontSize: FS.body, fontWeight: FW.medium, color: colors.redBtn }}>{Icon.close}  2</Text>
                  <Text style={{ fontFamily: MONO, color: colors.textFaint, fontSize: FS.body }}>{Icon.separator}</Text>
                  <Text style={{ fontFamily: MONO, fontSize: FS.body, fontWeight: FW.medium, color: colors.green }}>3  {Icon.correct}</Text>
                </View>
                {/* Card area */}
                <View style={e.sessionCardArea}>
                  <View style={[e.sessionHskBadge, { borderColor: colors.border }]}>
                    <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, letterSpacing: 1.5 }}>HSK 1</Text>
                  </View>
                  <Text style={{
                    fontFamily: SERIF, fontSize: FS.hanzi, lineHeight: FS.hanzi * LH.single, color: colors.textHanzi,
                    letterSpacing: LS.tighter * FS.hanzi, textAlign: 'center',
                  }}>学</Text>
                  <Text style={{
                    fontFamily: MONO, fontSize: FS.pinyin, letterSpacing: 3,
                    color: colors.inkRedText, fontStyle: 'italic',
                    marginTop: 14, textAlign: 'center',
                  }}>xué</Text>
                  <View style={{ width: 24, height: 1, backgroundColor: colors.border, marginTop: 16, alignSelf: 'center' }} />
                  <Text style={{
                    fontFamily: SERIF, fontSize: FS.pinyin, lineHeight: FS.pinyin * LH.tight,
                    color: colors.textSecondary, textAlign: 'center', marginTop: 12,
                  }}>我喜欢学习</Text>
                  <Text style={{
                    fontFamily: MONO, fontSize: FS.label, color: colors.textFaint,
                    textAlign: 'center', letterSpacing: 1, fontStyle: 'italic', marginTop: 4,
                  }}>wǒ xǐhuān xuéxí</Text>
                </View>
                {/* FABs */}
                <View style={e.sessionFabs}>
                  <View style={[e.fab, { backgroundColor: colors.inkRedGlow, borderColor: colors.inkRedDim }]}>
                    <Text style={{ fontFamily: MONO, fontSize: FS.pinyin, color: colors.redBtn }}>{Icon.close}</Text>
                  </View>
                  <View style={[e.fab, { backgroundColor: 'rgba(74,158,107,0.12)', borderColor: 'rgba(74,158,107,0.25)' }]}>
                    <Text style={{ fontFamily: MONO, fontSize: FS.pinyin, color: colors.green }}>{Icon.correct}</Text>
                  </View>
                </View>
              </PhoneFrame>
              <AnnotationList items={[
                { category: 'role', token: 'Hero stimulus', value: '—', note: 'The character is the product being learned',
                  why: 'Sized at 108px to create a deliberate rupture in the type scale — the gap from the next-largest element signals "this is not a heading, this is the thing you\'re memorising."' },
                { category: 'role', token: 'Progressive reveal', value: '5 taps', note: 'Character → pinyin → example → translation → meaning',
                  why: 'Forces active recall. The learner must try to remember before seeing the answer.' },
                { category: 'token', token: 'FS.hanzi', value: '108px', note: 'Manual override — outside both scales',
                  why: 'A pedagogical decision, not aesthetic. The brain must instantly identify what is being learned.' },
                { category: 'token', token: 'colors.inkRedText', value: 'dynamic', note: 'Pinyin text color',
                  why: 'Pinyin uses inkRedText in italic MONO — the red distinguishes phonetic annotation from meaning text.' },
                { category: 'token', token: 'colors.textHanzi', value: 'dynamic', note: 'Dedicated character color',
                  why: 'Slightly warmer and brighter than textPrimary — makes the hero character glow while remaining distinct from heading text.' },
                { category: 'component', token: 'ProgressBar', value: 'component', note: 'Fill track + MONO counter',
                  why: 'Thin and unobtrusive — positioned at the top so it\'s visible but doesn\'t compete with the flashcard.' },
              ]} annotationGroups={annotationGroups} colors={colors} />
            </ScreenExample>

            {/* ── SESSION COMPLETE ─────────────────────────────────── */}
            <ScreenExample title="Session — Complete" file="app/session.tsx" colors={colors}>
              <PhoneFrame colors={colors}>
                <View style={e.completeCentered}>
                  <Text style={{ fontFamily: SERIF, fontSize: FS.formTitle, color: colors.inkRed, opacity: 0.3 }}>印</Text>
                  <Text style={{
                    fontFamily: MONO, fontSize: FS.formTitle, color: colors.textPrimary, fontWeight: FW.medium, textAlign: 'center',
                    letterSpacing: LS.tighter * FS.formTitle, marginTop: space.xxl,
                  }}>Session complete</Text>
                  <Text style={{
                    fontFamily: MONO, fontSize: FS.label, color: colors.textFaint,
                    letterSpacing: 1, marginTop: space.sm,
                  }}>20 cards reviewed</Text>
                  <View style={{ flexDirection: 'row', gap: space.xxl, marginTop: space.xxl, alignItems: 'center' }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontFamily: MONO, fontSize: FS.formTitle, lineHeight: FS.formTitle * LH.single, color: colors.green, letterSpacing: LS.tighter * FS.formTitle }}>14</Text>
                      <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, letterSpacing: 1.5 }}>GOT IT</Text>
                    </View>
                    <Text style={{ fontFamily: MONO, color: colors.textFaint, fontSize: FS.pinyin }}>{Icon.separator}</Text>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontFamily: MONO, fontSize: FS.formTitle, lineHeight: FS.formTitle * LH.single, color: colors.redBtn, letterSpacing: LS.tighter * FS.formTitle }}>6</Text>
                      <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, letterSpacing: 1.5 }}>FORGOT</Text>
                    </View>
                  </View>
                  <View style={{
                    borderWidth: 1, borderColor: colors.border, borderRadius: 100,
                    paddingHorizontal: space.xl, paddingVertical: space.sm, marginTop: space.xxl,
                  }}>
                    <Text style={{ fontFamily: MONO, fontSize: FS.body, color: colors.textFaint, letterSpacing: 1 }}>70% retention</Text>
                  </View>
                  <View style={{ width: '100%', gap: 10, marginTop: space.giant, paddingHorizontal: space.lg }}>
                    <Button label="Study again" onPress={() => {}} />
                    <Button label="Back to home" variant="secondary" onPress={() => {}} />
                  </View>
                </View>
              </PhoneFrame>
              <AnnotationList items={[
                { category: 'role', token: 'Reward moment', value: '—', note: 'Celebration after completing a session',
                  why: 'The seal character at 30% opacity creates a watermark-like presence — decorative, not informational.' },
                { category: 'role', token: 'Performance summary', value: '—', note: 'Got/forgot split + retention percentage',
                  why: 'Learners need immediate feedback. The binary split is more actionable than a single percentage.' },
                { category: 'token', token: 'FS.formTitle', value: '24px', note: 'Seal character — decorative heading size',
                  why: 'Uses formTitle size at 30% opacity for a watermark effect.' },
                { category: 'token', token: 'colors.inkRed', value: 'dynamic', note: 'Seal color',
                  why: 'Uses inkRed at 30% opacity for the watermark effect — consistent with the brand accent.' },
                { category: 'component', token: 'Button', value: 'primary + secondary', note: 'Stacked action pair',
                  why: 'Primary draws the eye to "Study again." Secondary offers an exit without guilt.' },
              ]} annotationGroups={annotationGroups} colors={colors} />
            </ScreenExample>

            {/* ── SESSION SETUP ────────────────────────────────────── */}
            <ScreenExample title="Session Setup" file="app/session-setup.tsx" colors={colors}>
              <PhoneFrame colors={colors}>
                {/* Header */}
                <View style={e.setupHeader}>
                  <Text style={{ fontFamily: MONO, fontSize: FS.body, color: colors.textFaint }}>{Icon.left} Back</Text>
                  <Text style={{ fontFamily: MONO, fontSize: FS.definition, color: colors.textPrimary, fontWeight: FW.medium }}>New Session</Text>
                  <View style={{ width: 44 }} />
                </View>
                {/* Deck */}
                <Section label="DECK">
                  <View style={[e.deckSelector, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: MONO, fontSize: FS.definition, color: colors.textPrimary, fontWeight: FW.medium }}>HSK 1 — Basics</Text>
                      <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, marginTop: 2 }}>150 common characters</Text>
                    </View>
                    <Text style={{ fontFamily: MONO, fontSize: FS.body, color: colors.textFaint }}>{Icon.dropdown}</Text>
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
                  why: 'Structured top-to-bottom to match decision order.' },
                { category: 'role', token: 'Constrained choice', value: '—', note: 'Presets with optional custom override',
                  why: 'Presets cover 90% of use cases and reduce decision fatigue.' },
                { category: 'token', token: 'colors.inkRedGlow + colors.inkRedDim', value: 'dynamic', note: 'Active state ink-red pattern',
                  why: 'Translucent ink-red fill + slightly stronger ink-red border creates a consistent "selected" treatment.' },
                { category: 'component', token: 'SegmentedControl', value: 'component', note: 'Preset row + custom input (square corners)',
                  why: 'Single-select between presets with optional custom numeric input.' },
                { category: 'component', token: 'Chip', value: 'component', note: 'Toggle row with dot + sublabel (square corners)',
                  why: 'Multi-select filter pattern. The dot indicator fits the minimal aesthetic.' },
              ]} annotationGroups={annotationGroups} colors={colors} />
            </ScreenExample>

            {/* ── AUTH ─────────────────────────────────────────────── */}
            <ScreenExample title="Auth — Sign In" file="app/auth.tsx" colors={colors}>
              <PhoneFrame colors={colors}>
                <View style={{ paddingHorizontal: space.xl }}>
                  {/* Logo */}
                  <View style={{ paddingTop: space.giant }}>
                    <Text style={{ fontFamily: SERIF, fontSize: FS.formTitle, color: colors.inkRed, fontWeight: FW.medium, marginBottom: space.xs }}>漢字</Text>
                    <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, letterSpacing: 4, textTransform: 'uppercase' }}>MANDARINE</Text>
                  </View>
                  {/* Form */}
                  <Text style={{ fontFamily: MONO, fontSize: FS.formTitle, color: colors.textPrimary, fontWeight: FW.medium, marginBottom: space.xs }}>Welcome back</Text>
                  <Text style={{ fontFamily: MONO, fontSize: FS.body, color: colors.textFaint, lineHeight: FS.body * LH.normal, marginBottom: space.xxl }}>Sign in to continue your practice.</Text>
                  <Field label="EMAIL" value="" onChange={() => {}} placeholder="you@example.com" />
                  <Field label="PASSWORD" value="" onChange={() => {}} placeholder="••••••••" secureTextEntry />
                  <Button label="Sign in" onPress={() => {}} disabled style={{ marginTop: space.sm }} />
                  {/* Divider */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, marginVertical: space.xl }}>
                    <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                    <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint }}>or</Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                  </View>
                  <Button label="Continue with Google" onPress={() => {}} variant="secondary" />
                </View>
              </PhoneFrame>
              <AnnotationList items={[
                { category: 'role', token: 'Brand entry point', value: '—', note: 'Large logo character at top',
                  why: 'First screen new users see. The oversized hanzi immediately communicates "this is a Chinese learning app."' },
                { category: 'role', token: 'Mode switcher', value: '—', note: 'Sign in / Create account tabs',
                  why: 'Tabs rather than separate screens because the forms are nearly identical.' },
                { category: 'token', token: 'FS.formTitle', value: '24px', note: 'Form heading — "Welcome back"',
                  why: 'Matches the home screen greeting size for familiarity.' },
                { category: 'token', token: 'colors.border / colors.inkRed', value: 'dynamic', note: 'Input border states',
                  why: 'Default border is subtle; focus ring uses inkRed to confirm "you\'re typing here."' },
                { category: 'component', token: 'Field', value: 'component', note: 'Labelled input with error states (square corners, MONO, weight 300)',
                  why: 'Uppercase label above the input. Three border states (default, focus, error) provide clear feedback.' },
                { category: 'component', token: 'Button', value: 'primary + secondary', note: 'Email CTA + OAuth option',
                  why: 'Primary for the email flow. Secondary for Google OAuth — present but visually subordinate.' },
              ]} annotationGroups={annotationGroups} colors={colors} />
            </ScreenExample>

            {/* ── PROFILE ─────────────────────────────────────────── */}
            <ScreenExample title="Profile" file="app/profile.tsx" colors={colors}>
              <PhoneFrame colors={colors}>
                {/* Header */}
                <View style={e.setupHeader}>
                  <Text style={{ fontFamily: MONO, fontSize: FS.body, color: colors.textSecondary }}>{Icon.left} Back</Text>
                  <Text style={{ fontFamily: MONO, fontSize: FS.definition, color: colors.textPrimary, fontWeight: FW.medium }}>Profile</Text>
                  <View style={{ width: 44 }} />
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
                    {[{ l: 1, c2: 120, t2: 150 }, { l: 2, c2: 80, t2: 150 }, { l: 3, c2: 30, t2: 300 }].map(({ l, c2, t2 }) => (
                      <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                        <Text style={{ fontSize: FS.label, color: colors.textFaint, fontFamily: MONO, width: 40 }}>HSK {l}</Text>
                        <ProgressBar current={c2} total={t2} style={{ flex: 1 }} />
                      </View>
                    ))}
                  </View>
                </Section>
              </PhoneFrame>
              <AnnotationList items={[
                { category: 'role', token: 'Identity anchor', value: '—', note: 'Large avatar at screen centre',
                  why: 'The profile screen is the only place the user sees themselves. The 72px avatar dominates the top half.' },
                { category: 'role', token: 'Progress dashboard', value: '—', note: 'Stats grid + HSK breakdown',
                  why: 'Two complementary views: aggregate numbers (how much) and per-level bars (where).' },
                { category: 'token', token: 'FW.medium', value: '500', note: 'Header title — "Profile"',
                  why: 'Same weight as session-setup and settings headers. Consistent header treatment across all screens.' },
                { category: 'token', token: 'colors.bgCard', value: 'dynamic', note: 'StatCard and row backgrounds',
                  why: 'One step up from colors.bg — creates card elevation without shadows.' },
                { category: 'component', token: 'StatCard', value: 'component', note: '2-column grid with flex: 1',
                  why: 'Equal-width cards. MONO font for values and uppercase labels for descriptions.' },
                { category: 'component', token: 'ProgressBar', value: 'component', note: 'HSK level breakdown rows',
                  why: 'Reused from the session screen but showing mastery per level rather than session progress.' },
              ]} annotationGroups={annotationGroups} colors={colors} />
            </ScreenExample>

            {/* ── SETTINGS ────────────────────────────────────────── */}
            <ScreenExample title="Settings" file="app/settings.tsx" colors={colors}>
              <PhoneFrame colors={colors}>
                {/* Header */}
                <View style={e.setupHeader}>
                  <Text style={{ fontFamily: MONO, fontSize: FS.body, color: colors.textSecondary }}>{Icon.left} Back</Text>
                  <Text style={{ fontFamily: MONO, fontSize: FS.definition, color: colors.textPrimary, fontWeight: FW.medium }}>Settings</Text>
                  <View style={{ width: 44 }} />
                </View>
                <View style={{ paddingHorizontal: space.sm }}>
                  <Section label="PERSONAL INFO">
                    <Field label="DISPLAY NAME" value="Pierre" onChange={() => {}} placeholder="Your first name" />
                    <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, textTransform: 'uppercase', marginBottom: space.sm }}>NATIVE LANGUAGE</Text>
                    <SegmentedControl
                      options={[{ label: 'Francais', value: 'fr' }, { label: 'English', value: 'en' }, { label: '日本語', value: 'ja' }]}
                      value="fr"
                      onChange={() => {}}
                      style={{ marginBottom: space.lg }}
                    />
                    <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, textTransform: 'uppercase', marginBottom: space.sm }}>HSK GOAL</Text>
                    <SegmentedControl
                      options={[1, 2, 3, 4, 5, 6].map(n => ({ label: String(n), value: n }))}
                      value={6}
                      onChange={() => {}}
                    />
                  </Section>
                  <Section label="ACCOUNT">
                    <Text style={{ fontFamily: MONO, fontSize: FS.body, color: colors.textFaint }}>pierre@example.com</Text>
                  </Section>
                  <Button label="Save" onPress={() => {}} style={{ marginBottom: 12 }} />
                  <Button label="Sign out" variant="ghost" onPress={() => {}} />
                </View>
              </PhoneFrame>
              <AnnotationList items={[
                { category: 'role', token: 'Preference form', value: '—', note: 'Name, language, HSK goal',
                  why: 'Three settings that directly affect the learning experience.' },
                { category: 'role', token: 'Destructive action', value: '—', note: 'Sign out at the bottom, ghost style',
                  why: 'Ghost variant makes sign-out visually recessive — present but not inviting.' },
                { category: 'token', token: 'FW.medium', value: '500', note: '"Settings" header title',
                  why: 'Consistent header pattern across all non-tab screens.' },
                { category: 'token', token: 'colors.textFaint', value: 'dynamic', note: 'Account email + passive text',
                  why: 'The email is displayed but not editable — faint color signals "information, not input."' },
                { category: 'component', token: 'Field', value: 'component', note: 'Display name text input (square corners)',
                  why: 'Same component as the auth screen — reuse means the learner recognises the input pattern.' },
                { category: 'component', token: 'SegmentedControl', value: 'component', note: 'Language + HSK selectors (square corners)',
                  why: 'Presets are ideal for small, known option sets.' },
              ]} annotationGroups={annotationGroups} colors={colors} />
            </ScreenExample>
          </View>
        )}

        <View style={t.footer}>
          <Text style={t.footerText}>Mandarine Design System · 2026</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Examples tab sub-components ───────────────────────────────────────────────

function PhoneFrame({ children, colors }: { children: ReactNode; colors: ColorTheme }) {
  return (
    <View style={{
      width: 260, minHeight: 480, backgroundColor: colors.bg,
      borderRightWidth: 1, borderRightColor: colors.border, overflow: 'hidden',
    }}>
      <View style={{
        width: 80, height: 4, borderRadius: 2, backgroundColor: colors.bgCard2,
        alignSelf: 'center', marginTop: space.sm, marginBottom: space.sm,
      }} />
      <View style={{ flex: 1, overflow: 'hidden' }}>{children}</View>
      <View style={{
        width: 56, height: 3, borderRadius: 2, backgroundColor: colors.bgCard2,
        alignSelf: 'center', marginTop: space.sm, marginBottom: space.sm,
      }} />
    </View>
  );
}

function ScreenExample({ title, file, children, colors }: {
  title: string; file: string; children: ReactNode; colors: ColorTheme;
}) {
  return (
    <View style={{
      marginBottom: space.huge, borderWidth: 1, borderColor: colors.border,
      borderRadius: 0, overflow: 'hidden',
    }}>
      <View style={{
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: colors.bgCard, paddingHorizontal: space.lg, paddingVertical: space.md,
        borderBottomWidth: 1, borderBottomColor: colors.border,
      }}>
        <Text style={{ fontFamily: MONO, fontSize: FS.definition, color: colors.textPrimary, fontWeight: FW.medium }}>{title}</Text>
        <Text style={{ fontSize: FS.label, color: colors.textFaint, fontFamily: MONO }}>{file}</Text>
      </View>
      <View style={{ flexDirection: 'row' }}>
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

function AnnotationList({ items, annotationGroups, colors }: {
  items: AnnotationItem[];
  annotationGroups: { key: AnnotationCategory; label: string; dotColor: string }[];
  colors: ColorTheme;
}) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgCard, paddingHorizontal: space.md, paddingVertical: space.md }}>
      {annotationGroups
        .filter(g => items.some(i => i.category === g.key))
        .map((group, gi) => (
        <View key={group.key} style={gi > 0 ? { marginTop: space.lg } : undefined}>
          <Text style={{
            fontSize: FS.label, color: colors.textFaint, letterSpacing: 2,
            marginBottom: space.md, fontFamily: MONO,
          }}>{group.label}</Text>
          {items.filter(i => i.category === group.key).map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, marginBottom: space.md }}>
              <View style={{
                width: 5, height: 5, borderRadius: 3, backgroundColor: group.dotColor, marginTop: 5,
              }} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={{
                    fontSize: FS.label, color: colors.inkRed, fontFamily: MONO,
                    backgroundColor: colors.inkRedGlow, paddingHorizontal: 4, borderRadius: 3, overflow: 'hidden',
                  }}>{item.token}</Text>
                  <Text style={{ fontSize: FS.label, color: colors.textFaint, fontFamily: MONO }}>{item.value}</Text>
                </View>
                <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textSecondary, marginTop: 2, lineHeight: FS.label * LH.normal }}>{item.note}</Text>
                {item.why ? <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, marginTop: 3, lineHeight: FS.label * LH.normal, fontStyle: 'italic' }}>{item.why}</Text> : null}
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DocHeading({ children, colors }: { children: string; colors: ColorTheme }) {
  return <Text style={{
    fontFamily: MONO, fontSize: FS.formTitle, color: colors.textPrimary, fontWeight: FW.medium, marginBottom: space.sm,
  }}>{children}</Text>;
}

function DocSubheading({ children, colors }: { children: ReactNode; colors: ColorTheme }) {
  return <Text style={{
    fontFamily: MONO, fontSize: FS.body, color: colors.textSecondary, lineHeight: 22, marginBottom: space.xxl,
  }}>{children}</Text>;
}

function ColorGroup({ label, children, colors }: { label: string; children: ReactNode; colors: ColorTheme }) {
  return (
    <View style={{ marginBottom: space.xxl }}>
      <Text style={{
        fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, letterSpacing: 2.5,
        textTransform: 'uppercase', marginBottom: space.md,
      }}>{label}</Text>
      <View style={{ gap: space.sm }}>{children}</View>
    </View>
  );
}

function Swatch({
  token, colorValue, label, usage, colors,
}: { token: string; colorValue: string; label: string; usage: string; colors: ColorTheme }) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: space.lg,
      backgroundColor: colors.bgCard, borderRadius: 0,
      borderWidth: 1, borderColor: colors.border, padding: space.md,
    }}>
      <View style={{
        width: 48, height: 48, borderRadius: 0,
        borderWidth: 1, borderColor: 'rgba(128,128,128,0.15)',
        backgroundColor: colorValue,
      }} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: FS.body, color: colors.textPrimary, fontFamily: MONO }}>{token}</Text>
        <Text style={{ fontSize: FS.label, color: colors.textFaint, fontFamily: MONO }}>{colorValue}</Text>
        <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textSecondary, marginTop: 2 }}>{usage}</Text>
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
  const { colors } = useTheme();
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1,
      borderBottomColor: colors.border, paddingVertical: space.md, gap: space.lg, minHeight: 64,
    }}>
      <View style={{ width: 160, overflow: 'hidden' }}>
        <Text
          style={[
            {
              fontSize:   px,
              color:      color ?? colors.textPrimary,
              fontFamily: family,
              fontStyle:  italic ? 'italic'  : 'normal',
              fontWeight: bold   ? FW.medium : 'normal',
            },
            style,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {sample}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: FS.label, color: colors.textPrimary, fontFamily: MONO }}>{token}</Text>
        <Text style={{ fontSize: FS.label, color: colors.inkRed, fontFamily: MONO }}>{px}px</Text>
        <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint }}>{usage}</Text>
      </View>
    </View>
  );
}

interface PropDef { name: string; type: string; desc: string; }
interface UsedIn  { screen: string; context: string; }

function ComponentSection({
  name, file, description, props: propDefs, usedIn, children, colors,
}: {
  name: string;
  file: string;
  description: string;
  props: PropDef[];
  usedIn: UsedIn[];
  children: ReactNode;
  colors: ColorTheme;
}) {
  return (
    <View style={{
      backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
      borderRadius: 0, padding: space.xxl, marginBottom: space.xxl,
    }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: space.sm }}>
        <Text style={{ fontFamily: MONO, fontSize: FS.pinyin, color: colors.textPrimary, fontWeight: FW.medium }}>{name}</Text>
        <Text style={{ fontSize: FS.label, color: colors.textFaint, fontFamily: MONO }}>{file}</Text>
      </View>
      <Text style={{ fontFamily: MONO, fontSize: FS.body, color: colors.textSecondary, lineHeight: 20, marginBottom: space.xxl }}>{description}</Text>

      {/* Live demo */}
      <View style={{
        backgroundColor: colors.bgCard2, borderRadius: 0, padding: space.lg,
        marginBottom: space.xxl, borderWidth: 1, borderColor: colors.border,
      }}>{children}</View>

      {/* Props table */}
      <Text style={{
        fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, letterSpacing: 2.5,
        textTransform: 'uppercase', marginBottom: space.sm,
      }}>Props</Text>
      <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 0, overflow: 'hidden', marginBottom: space.lg }}>
        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bgCard2 }}>
          <Text style={{ flex: 1.2, paddingHorizontal: space.md, paddingVertical: space.sm, fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, letterSpacing: 1.5, textTransform: 'uppercase' }}>Prop</Text>
          <Text style={{ flex: 2, paddingHorizontal: space.md, paddingVertical: space.sm, fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, letterSpacing: 1.5, textTransform: 'uppercase' }}>Type</Text>
          <Text style={{ flex: 2, paddingHorizontal: space.md, paddingVertical: space.sm, fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, letterSpacing: 1.5, textTransform: 'uppercase' }}>Description</Text>
        </View>
        {propDefs.map(p => (
          <View key={p.name} style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ flex: 1.2, paddingHorizontal: space.md, paddingVertical: space.sm, fontSize: FS.label, color: colors.textPrimary, fontFamily: MONO }}>{p.name}</Text>
            <Text style={{ flex: 2, paddingHorizontal: space.md, paddingVertical: space.sm, fontSize: FS.label, color: colors.inkRed, fontFamily: MONO }}>{p.type}</Text>
            <Text style={{ flex: 2, paddingHorizontal: space.md, paddingVertical: space.sm, fontFamily: MONO, fontSize: FS.label, color: colors.textSecondary }}>{p.desc}</Text>
          </View>
        ))}
      </View>

      {/* Used in */}
      <Text style={{
        fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, letterSpacing: 2.5,
        textTransform: 'uppercase', marginBottom: space.sm,
      }}>Used in</Text>
      {usedIn.map(u => (
        <View key={u.screen} style={{ flexDirection: 'row', gap: space.md, paddingVertical: space.xs, alignItems: 'flex-start' }}>
          <Text style={{ fontSize: FS.label, color: colors.textPrimary, fontFamily: MONO, width: 130 }}>{u.screen}</Text>
          <Text style={{ flex: 1, fontFamily: MONO, fontSize: FS.label, color: colors.textSecondary }}>{u.context}</Text>
        </View>
      ))}
    </View>
  );
}

// ── Rules tab components ──────────────────────────────────────────────────────

function WeightRow({ token, value, sample, rule, where, colors }: {
  token: string; value: string; sample: string; rule: string; where: string; colors: ColorTheme;
}) {
  const fw = value.startsWith("'500'") ? FW.medium
    : value.startsWith("'300'") ? FW.light
    : undefined;
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'flex-start', borderBottomWidth: 1,
      borderBottomColor: colors.border, paddingVertical: space.md, gap: space.lg, minHeight: 64,
    }}>
      <View style={{ width: 140, justifyContent: 'center' }}>
        <Text style={{ fontFamily: MONO, fontSize: FS.definition, color: colors.textPrimary, fontWeight: fw }} numberOfLines={1} adjustsFontSizeToFit>
          {sample}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          <Text style={{
            fontFamily: MONO, fontSize: FS.label, color: colors.inkRed,
            backgroundColor: colors.inkRedGlow, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, overflow: 'hidden',
          }}>{token}</Text>
          <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, paddingHorizontal: 5, paddingVertical: 1 }}>{value}</Text>
        </View>
        <Text style={{ fontFamily: MONO, fontSize: FS.body, color: colors.textSecondary, lineHeight: FS.body * LH.normal }}>{rule}</Text>
        <Text style={{ fontSize: FS.label, color: colors.textFaint, fontFamily: MONO }}>{where}</Text>
      </View>
    </View>
  );
}

function ColorRoleRow({ token, rule, where, colors }: {
  token: string; rule: string; where: string; colors: ColorTheme;
}) {
  const colorKey = token.replace('colors.', '') as keyof ColorTheme;
  const color = colors[colorKey] as string;
  const hex = color;
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'flex-start', borderBottomWidth: 1,
      borderBottomColor: colors.border, paddingVertical: space.md, gap: space.lg, minHeight: 64,
    }}>
      <View style={{ width: 140, justifyContent: 'center' }}>
        <Text style={{ fontFamily: MONO, fontSize: FS.body, color, fontWeight: FW.medium }} numberOfLines={2}>
          The quick{'\n'}brown fox
        </Text>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          <Text style={{
            fontFamily: MONO, fontSize: FS.label, color: colors.inkRed,
            backgroundColor: colors.inkRedGlow, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, overflow: 'hidden',
          }}>{token}</Text>
          <Text style={{ fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, paddingHorizontal: 5, paddingVertical: 1 }}>{hex}</Text>
        </View>
        <Text style={{ fontFamily: MONO, fontSize: FS.body, color: colors.textSecondary, lineHeight: FS.body * LH.normal }}>{rule}</Text>
        <Text style={{ fontSize: FS.label, color: colors.textFaint, fontFamily: MONO }}>{where}</Text>
      </View>
    </View>
  );
}

function RoleRow({ role, sample, size, fw, color, fsKey, fwKey, colorKey, lsKey, where, colors }: {
  role: string; sample: string; size: number;
  fw: typeof FW.medium | undefined;
  color: string; fsKey: string; fwKey: string; colorKey: string; lsKey: string; where: string;
  colors: ColorTheme;
}) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'flex-start', borderBottomWidth: 1,
      borderBottomColor: colors.border, paddingVertical: space.md, gap: space.lg, minHeight: 64,
    }}>
      <View style={{ width: 140, justifyContent: 'center' }}>
        <Text style={{ fontFamily: MONO, fontSize: Math.min(size, FS.formTitle), color, fontWeight: fw as any }} numberOfLines={2} adjustsFontSizeToFit>
          {sample}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ fontFamily: MONO, fontSize: FS.body, color: colors.textPrimary, fontWeight: FW.medium, marginBottom: 2 }}>{role}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          <Text style={{
            fontFamily: MONO, fontSize: FS.label, color: colors.inkRed,
            backgroundColor: colors.inkRedGlow, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, overflow: 'hidden',
          }}>{fsKey}</Text>
          <Text style={{
            fontFamily: MONO, fontSize: FS.label, color: colors.inkRed,
            backgroundColor: colors.inkRedGlow, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, overflow: 'hidden',
          }}>{fwKey}</Text>
          <Text style={{
            fontFamily: MONO, fontSize: FS.label, color: colors.textSecondary,
            backgroundColor: 'transparent', paddingHorizontal: 5, paddingVertical: 1,
          }}>{colorKey}</Text>
          {lsKey !== '—' && <Text style={{
            fontFamily: MONO, fontSize: FS.label, color: colors.inkRed,
            backgroundColor: colors.inkRedGlow, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, overflow: 'hidden',
          }}>{lsKey}</Text>}
        </View>
        <Text style={{ fontSize: FS.label, color: colors.textFaint, fontFamily: MONO }}>{where}</Text>
      </View>
    </View>
  );
}

// ── Style factories ──────────────────────────────────────────────────────────

function makeStyles(colors: ColorTheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },

    // Header
    header: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.bg,
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
      fontFamily: SERIF,
      fontSize: FS.formTitle,
      color: colors.inkRed,
      fontWeight: FW.medium,
    },
    logoLabel: {
      fontFamily: MONO,
      fontSize: FS.label,
      color: colors.textFaint,
      letterSpacing: 4,
      textTransform: 'uppercase',
      marginTop: 2,
    },
    headerMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    versionBadge: {
      fontSize: FS.label,
      color: colors.inkRed,
      backgroundColor: colors.inkRedGlow,
      borderWidth: 1,
      borderColor: colors.inkRedDim,
      borderRadius: 100,
      paddingHorizontal: space.sm,
      paddingVertical: 2,
      letterSpacing: 1,
      textTransform: 'uppercase',
      fontFamily: MONO,
    },
    headerDate: {
      fontSize: FS.label,
      color: colors.textFaint,
      fontFamily: MONO,
      letterSpacing: 0.5,
    },

    themeToggle: {
      width: 32,
      height: 32,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgCard2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeToggleText: {
      fontFamily: MONO,
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 18,
    },

    // Nav
    navScroll:    { },
    nav:          { flexDirection: 'row', paddingHorizontal: space.xl },
    navItem:      { paddingHorizontal: space.lg, paddingVertical: space.md, position: 'relative' },
    navItemActive: { borderBottomWidth: 2, borderBottomColor: colors.inkRed },
    navText:      { fontFamily: MONO, fontSize: FS.body, color: colors.textFaint, fontWeight: FW.medium },
    navTextActive:{ color: colors.textPrimary },

    // Scroll body
    scroll:   { flex: 1 },
    content:  { padding: space.xxl, paddingBottom: space.giant },

    // Inline code
    codeInline: {
      fontFamily: MONO,
      fontSize: FS.label,
      color: colors.inkRed,
      backgroundColor: colors.inkRedGlow,
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
      backgroundColor: colors.inkRed,
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
      backgroundColor: colors.bgCard2,
      borderWidth: 1,
      borderColor: colors.border,
    },

    // Token labels (shared)
    tokenName:  { fontSize: FS.label, color: colors.textSecondary, fontFamily: MONO },
    tokenValue: { fontFamily: MONO, fontSize: FS.label, color: colors.textFaint },

    // Button demo
    buttonRow: { flexDirection: 'row', gap: space.sm },
    buttonFlex: { flex: 1 },
    demoLabel: {
      fontFamily: MONO,
      fontSize: FS.label,
      color: colors.textFaint,
      letterSpacing: 2,
      textTransform: 'uppercase',
      marginBottom: space.sm,
    },

    // Card / Chip / ProgressBar helpers
    gap12: { gap: space.md },

    // Section demo placeholder
    sectionPlaceholder: {
      backgroundColor: colors.bgCard2,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 0,
      padding: space.lg,
      alignItems: 'center',
    },
    sectionPlaceholderText: { fontFamily: MONO, fontSize: FS.body, color: colors.textFaint },

    // StatCard grid
    statGrid: { flexDirection: 'row', gap: space.sm },
    statFlex: { flex: 1 },

    // Avatar row
    avatarRow:  { flexDirection: 'row', gap: space.xxl, alignItems: 'flex-start' },
    avatarItem: { alignItems: 'center', gap: space.sm },
    avatarLabel:{ fontSize: FS.label, color: colors.textFaint, fontFamily: MONO },

    // Sheet content demo
    sheetContent: { paddingVertical: space.sm, gap: space.md },
    sheetContentText: { fontFamily: MONO, fontSize: FS.body, color: colors.textSecondary },

    // Monospace row
    monoRow:    { flexDirection: 'row', gap: space.lg, alignItems: 'flex-start' },
    monoDemo:   {
      flex: 1,
      backgroundColor: colors.bgCard,
      borderRadius: 0,
      padding: space.lg,
      alignItems: 'center',
      gap: space.xs,
    },
    monoSample: {
      fontFamily: MONO,
      fontSize: FS.pinyin,
      color: colors.inkRedText,
      letterSpacing: 3,
    },
    monoCaption:{ fontSize: FS.label, color: colors.textFaint, fontFamily: MONO },
    monoDesc:   { flex: 1.4 },
    propName:   { fontFamily: MONO, fontSize: FS.label, color: colors.textFaint, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
    propValue:  { fontFamily: MONO, fontSize: FS.body, color: colors.textSecondary, lineHeight: FS.body * LH.normal },

    // Line heights section
    lhNote: {
      fontFamily: MONO,
      fontSize: FS.body,
      color: colors.textSecondary,
      lineHeight: FS.body * LH.normal,
      marginBottom: space.lg,
    },
    lhRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: space.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: space.lg,
    },
    lhToken:   { fontSize: FS.label, color: colors.textPrimary, fontFamily: MONO, width: 100 },
    lhValue:   { fontSize: FS.label, color: colors.inkRed,      fontFamily: MONO, width: 44 },
    lhFormula: { fontSize: FS.label, color: colors.textFaint,   fontFamily: MONO },
    lhSectionTitle: {
      fontFamily: MONO,
      fontSize: FS.body,
      color: colors.textPrimary,
      fontWeight: FW.medium,
      marginTop: space.xxl,
      marginBottom: space.sm,
    },
    lhDemoCard: {
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 0,
      overflow: 'hidden',
      marginTop: space.sm,
      marginBottom: space.sm,
    },
    lhDemoLabel: {
      fontSize: FS.label,
      color: colors.textFaint,
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
      backgroundColor: colors.bgCard2,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingHorizontal: space.lg,
      paddingVertical: space.sm,
    },
    lhDemoAnnotationText: {
      fontSize: FS.label,
      color: colors.inkRed,
      fontFamily: MONO,
      letterSpacing: 0.5,
    },

    // Footer
    footer: { marginTop: space.huge, alignItems: 'center' },
    footerText: { fontSize: FS.label, color: colors.textFaint, fontFamily: MONO, letterSpacing: 1 },

    // Italic / note callout
    noItalicNote: {
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: space.lg,
    },
    noItalicText: {
      fontFamily: MONO,
      fontSize: FS.body,
      color: colors.textSecondary,
      lineHeight: FS.body * LH.normal,
    },
  });
}

function makeDocStyles(_colors: ColorTheme) {
  return StyleSheet.create({});
}

function makeComponentStyles(_colors: ColorTheme) {
  return StyleSheet.create({});
}

function makeRuleStyles(_colors: ColorTheme) {
  return StyleSheet.create({});
}

function makeExampleStyles(colors: ColorTheme) {
  return StyleSheet.create({
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
      borderColor: colors.border,
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
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 0,
      paddingHorizontal: space.lg,
      paddingVertical: 12,
    },
  });
}
