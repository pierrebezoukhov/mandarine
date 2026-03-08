import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { T } from '@/theme/tokens';
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

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

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
        <ActivityIndicator color={T.accent} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={s.title}>Réglages</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Section label="INFORMATIONS PERSONNELLES">
          <Field
            label="NOM AFFICHÉ"
            value={displayName}
            onChange={setDisplayName}
            placeholder="Votre prénom"
            style={{ marginBottom: 16 }}
          />

          <Text style={s.fieldLabel}>LANGUE MATERNELLE</Text>
          <SegmentedControl
            options={LANG_OPTIONS}
            value={nativeLang}
            onChange={v => setNativeLang(v as string)}
            style={{ marginBottom: 16 }}
          />

          <Text style={s.fieldLabel}>OBJECTIF HSK</Text>
          <SegmentedControl
            options={HSK_OPTIONS}
            value={targetHsk}
            onChange={v => setTargetHsk(v as number)}
          />
        </Section>

        <Section label="COMPTE">
          <Text style={s.email}>{user?.email}</Text>
        </Section>

        <Button
          label="Enregistrer"
          onPress={save}
          loading={saving}
          style={{ marginBottom: 12 }}
        />
        <Button
          label="Se déconnecter"
          variant="ghost"
          onPress={signOut}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn:  { paddingVertical: 6, paddingHorizontal: 2, minWidth: 60 },
  backText: { fontSize: 14, color: T.textSecondary },
  title:    { fontSize: 16, color: T.textPrimary, fontWeight: '600' },

  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48 },

  fieldLabel: {
    fontSize: 10,
    color: T.textMuted,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  email: { fontSize: 14, color: T.textMuted, fontStyle: 'italic' },
});
