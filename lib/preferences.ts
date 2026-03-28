import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import type { HanziFontId } from '@/theme/fonts';

export type UserPreferences = {
  hanzi_font?: HanziFontId;
};

// Individual AsyncStorage keys that ThemeContext reads directly
const INDIVIDUAL_KEYS: Record<keyof UserPreferences, string> = {
  hanzi_font: 'hanziflash_hanzi_font',
};

export async function fetchPreferences(userId: string): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from('profiles')
    .select('preferences')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data?.preferences) return {};
  return data.preferences as UserPreferences;
}

export async function savePreference<K extends keyof UserPreferences>(
  userId: string,
  key: K,
  value: UserPreferences[K],
): Promise<void> {
  // Fallback merge: read current prefs, merge the key, write back.
  // Race window is narrow (single user, infrequent changes) and acceptable.
  // Can be replaced with an atomic RPC (jsonb_set) when one is created.
  fetchPreferences(userId).then(current => {
    const merged = { ...current, [key]: value };
    supabase
      .from('profiles')
      .update({ preferences: merged })
      .eq('user_id', userId)
      .then(({ error }) => {
        if (error) console.warn('[preferences] savePreference:', error.message);
      });
  });
}

export async function syncPreferencesToLocal(userId: string): Promise<UserPreferences> {
  const remote = await fetchPreferences(userId);

  // Write each preference to its individual AsyncStorage key
  // so ThemeContext (which reads hanziflash_hanzi_font directly) picks it up
  const writes: Promise<void>[] = [];
  for (const [key, value] of Object.entries(remote)) {
    const storageKey = INDIVIDUAL_KEYS[key as keyof UserPreferences];
    if (storageKey && value != null) {
      writes.push(AsyncStorage.setItem(storageKey, String(value)));
    }
  }
  await Promise.all(writes);

  return remote;
}

export async function setLocalPreference<K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K],
): Promise<void> {
  const storageKey = INDIVIDUAL_KEYS[key];
  if (storageKey && value != null) {
    await AsyncStorage.setItem(storageKey, String(value));
  }
}
