import { useState, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme, type ThemeMode } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';
import { MONO, FS, FW, LS } from '@/theme/tokens';
import { space } from '@/theme/spacing';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Section } from '@/components/Section';
import { fetchProfile, updateProfile } from '@/lib/profile';

const HSK_OPTIONS = [1, 2, 3, 4, 5, 6].map(n => ({ label: String(n), value: n }));
const LANG_OPTIONS = [
  { label: 'Français', value: 'fr' },
  { label: 'English',  value: 'en' },
  { label: '日本語',   value: 'ja' },
];
const THEME_OPTIONS = [
  { label: 'Light', value: 'light' },
  { label: 'Dark',  value: 'dark' },
  { label: 'System', value: 'system' },
];

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { colors, mode, setMode } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const [displayName, setDisplayName] = useState('');
  const [nativeLang,  setNativeLang]  = useState('fr');
  const [targetHsk,   setTargetHsk]   = useState(6);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id).then(p => {
      if (p) {
        setDisplayName(p.display_name ?? '');
        setNativeLang(p.native_lang);
        setTargetHsk(p.target_hsk);
      }
      setLoading(false);
    });
  }, [user?.id]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    await updateProfile(user.id, {
      display_name: displayName.trim() || null,
      native_lang:  nativeLang,
      target_hsk:   targetHsk,
    });
    setSaving(false);
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={s.root}>
        <ActivityIndicator color={colors.inkRed} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Section label="APPEARANCE">
          <Text style={s.fieldLabel}>THEME</Text>
          <SegmentedControl
            options={THEME_OPTIONS}
            value={mode}
            onChange={v => setMode(v as ThemeMode)}
          />
        </Section>

        <Section label="PERSONAL INFO">
          <Field
            label="DISPLAY NAME"
            value={displayName}
            onChange={setDisplayName}
            placeholder="Your first name"
            style={{ marginBottom: 16 }}
          />

          <Text style={s.fieldLabel}>NATIVE LANGUAGE</Text>
          <SegmentedControl
            options={LANG_OPTIONS}
            value={nativeLang}
            onChange={v => setNativeLang(v as string)}
            style={{ marginBottom: 16 }}
          />

          <Text style={s.fieldLabel}>HSK GOAL</Text>
          <SegmentedControl
            options={HSK_OPTIONS}
            value={targetHsk}
            onChange={v => setTargetHsk(v as number)}
          />
        </Section>

        <Section label="ACCOUNT">
          <Text style={s.email}>{user?.email}</Text>
        </Section>

        <Button
          label="Save"
          onPress={save}
          loading={saving}
          style={{ marginBottom: 12 }}
        />
        <Button
          label="Sign out"
          variant="ghost"
          onPress={signOut}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (t: ColorTheme) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: space.sm,
  },
  backBtn:  { paddingVertical: 6, paddingHorizontal: 2, minWidth: 60 },
  backText: { fontFamily: MONO, fontSize: FS.body, color: t.textSecondary },
  title:    { fontFamily: MONO, fontSize: FS.definition, color: t.textPrimary, fontWeight: FW.medium },

  scroll: { paddingHorizontal: space.xl, paddingTop: space.xl, paddingBottom: space.giant },

  fieldLabel: {
    fontFamily: MONO,
    fontSize: FS.label,
    letterSpacing: LS.widest * FS.label,
    color: t.textFaint,
    textTransform: 'uppercase',
    marginBottom: space.sm,
  },

  email: { fontFamily: MONO, fontSize: FS.definition, fontWeight: FW.light, color: t.textSecondary },
});
