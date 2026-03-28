import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import type { HanziFontId } from '@/theme/fonts';

export type UserPreferences = {
  hanzi_font?: HanziFontId;
};

const PREFS_STORAGE_KEY = 'hanziflash_preferences';

export async function fetchPreferences(userId: string): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from('profiles')
    .select('preferences')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data?.preferences) return {};
  return data.preferences as UserPreferences;
}

export async function savePreference(
  userId: string,
  key: keyof UserPreferences,
  value: any,
): Promise<void> {
  const current = await fetchPreferences(userId);
  const updated = { ...current, [key]: value };

  supabase
    .from('profiles')
    .update({ preferences: updated })
    .eq('user_id', userId)
    .then(({ error }) => {
      if (error) console.warn('[preferences] savePreference:', error.message);
    });
}

export async function syncPreferencesToLocal(userId: string): Promise<UserPreferences> {
  const remote = await fetchPreferences(userId);
  if (Object.keys(remote).length > 0) {
    await AsyncStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(remote));
  }
  return remote;
}

export async function getLocalPreferences(): Promise<UserPreferences> {
  const raw = await AsyncStorage.getItem(PREFS_STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function setLocalPreference(
  key: keyof UserPreferences,
  value: any,
): Promise<void> {
  const current = await getLocalPreferences();
  const updated = { ...current, [key]: value };
  await AsyncStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updated));
}
