import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { ColorTheme } from '@/theme/colors';
import { MONO, FS, FW, LS } from '@/theme/tokens';
import { space } from '@/theme/spacing';
import { Icon } from '@/theme/icons';
import { Button } from '@/components/Button';
import { FlashcardPreview } from '@/components/FlashcardPreview';
import { FontOptionRow } from '@/components/FontOptionRow';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { HANZI_FONTS, getHanziFont, resolveHanziFontFamily } from '@/theme/fonts';
import { savePreference } from '@/lib/preferences';

export default function FontPickerScreen() {
  const { user } = useAuth();
  const { colors, hanziFontId, setHanziFont } = useTheme();
  const { isDesktop } = useResponsive();
  const s = useMemo(() => makeStyles(colors, isDesktop), [colors, isDesktop]);

  const selectedDef = getHanziFont(hanziFontId);
  const { family: selectedFamily, weight: selectedWeight } = resolveHanziFontFamily(hanziFontId);

  const handleSelect = (id: typeof hanziFontId) => {
    setHanziFont(id);
    if (user?.id) {
      savePreference(user.id, 'hanzi_font', id);
    }
  };

  const preview = (
    <FlashcardPreview
      hanzi="永"
      pinyin="yǒng"
      meaning="eternal, forever"
      exHanzi="天地玄黄，宇宙洪荒。"
      exPinyin="tiān dì xuán huáng, yǔ zhòu hóng huāng"
      exMeaning="Heaven and earth, dark and yellow"
      fontFamily={selectedFamily}
      fontWeight={selectedWeight}
      size={isDesktop ? 'default' : 'compact'}
    />
  );

  const fontList = (
    <View style={s.fontList}>
      <Text style={s.sectionLabel}>SELECT FONT</Text>
      {HANZI_FONTS.map(font => {
        const { family } = resolveHanziFontFamily(font.id);
        return (
          <FontOptionRow
            key={font.id}
            character={font.preview}
            fontFamily={family}
            fontWeight={font.weight}
            label={font.label}
            description={font.description}
            active={hanziFontId === font.id}
            onPress={() => handleSelect(font.id)}
            style={s.fontRow}
          />
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={s.root}>
      <ResponsiveShell maxWidth={isDesktop ? 720 : 520} align="start">
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.nav}>
            <Button
              label={`${Icon.left} Back`}
              variant="ghost"
              onPress={() => router.back()}
            />
          </View>
          <Text style={s.title}>Hanzi Font</Text>

          {isDesktop ? (
            <View style={s.desktopLayout}>
              <View style={s.desktopLeft}>{fontList}</View>
              <View style={s.desktopRight}>
                <Text style={s.sectionLabel}>PREVIEW</Text>
                {preview}
              </View>
            </View>
          ) : (
            <>
              {preview}
              <View style={s.mobileList}>{fontList}</View>
            </>
          )}
        </ScrollView>
      </ResponsiveShell>
    </SafeAreaView>
  );
}

const makeStyles = (t: ColorTheme, isDesktop: boolean) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bg },
  scroll: { paddingBottom: space.massive },

  nav: {
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: space.sm,
  },
  title: {
    fontFamily: MONO,
    fontSize: FS.formTitle,
    fontWeight: FW.medium,
    color: t.textPrimary,
    letterSpacing: LS.tighter * FS.formTitle,
    paddingHorizontal: space.xl,
    marginBottom: space.xxl,
  },

  sectionLabel: {
    fontFamily: MONO,
    fontSize: FS.label,
    fontWeight: FW.medium,
    color: t.textFaint,
    letterSpacing: LS.widest * FS.label,
    textTransform: 'uppercase',
    marginBottom: space.md,
  },

  desktopLayout: {
    flexDirection: 'row',
    gap: space.xxxl,
    paddingHorizontal: space.xl,
  },
  desktopLeft: {
    width: '35%' as any,
  },
  desktopRight: {
    flex: 1,
  },

  mobileList: {
    paddingHorizontal: space.xl,
    paddingTop: space.xxl,
  },

  fontList: {},
  fontRow: {
    marginBottom: space.sm,
  },
});
