import { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { MONO, FS, FW, LS } from '@/theme/tokens';
import { space } from '@/theme/spacing';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';
import { Icon } from '@/theme/icons';

interface SearchFieldProps {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function SearchField({
  value,
  onChange,
  onClear,
  onSubmit,
  placeholder = 'Search hanzi, pinyin, or meaning\u2026',
  autoFocus = false,
  style,
}: SearchFieldProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocus) {
      // Small delay to ensure layout is ready
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  return (
    <View style={[s.wrap, focused && s.wrapFocused, style]}>
      <Text style={s.prompt}>{Icon.prompt}</Text>
      <TextInput
        ref={inputRef}
        style={s.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} hitSlop={8}>
          <Text style={s.clear}>{Icon.close}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const makeStyles = (t: ColorTheme) => StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: t.bgCard,
    borderWidth: 1,
    borderColor: t.border,
    paddingHorizontal: space.lg,
    gap: space.sm,
    ...(Platform.OS === 'web' ? {
      transition: 'border-color 150ms ease, box-shadow 150ms ease, background-color 150ms ease',
    } as any : {}),
  },
  wrapFocused: {
    borderColor: t.inkRed,
    backgroundColor: t.bgCard2,
    ...(Platform.OS === 'web' ? {
      boxShadow: `0 0 0 1px ${t.inkRedGlow}`,
    } as any : {}),
  },
  prompt: {
    fontFamily: MONO,
    fontSize: FS.body,
    fontWeight: FW.medium,
    color: t.textFaint,
  },
  input: {
    flex: 1,
    fontFamily: MONO,
    fontSize: FS.input,
    fontWeight: FW.regular,
    color: t.textPrimary,
    letterSpacing: LS.wide * FS.input,
    height: '100%' as any,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}),
  },
  clear: {
    fontFamily: MONO,
    fontSize: FS.pinyin,
    color: t.textFaint,
    paddingLeft: space.sm,
  },
});
