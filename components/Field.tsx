import { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { MONO, FS, FW, LS } from '@/theme/tokens';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  /** Highlights the border in error colour */
  hasError?: boolean;
  /** If provided, renders a small error message below the input */
  errorText?: string;
  style?: StyleProp<ViewStyle>;
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  secureTextEntry,
  hasError,
  errorText,
  style,
}: FieldProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[s.wrap, style]}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={[
          s.input,
          focused    && s.inputFocused,
          hasError   && s.inputError,
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {!!errorText && <Text style={s.errorText}>{errorText}</Text>}
    </View>
  );
}

const makeStyles = (t: ColorTheme) => StyleSheet.create({
  wrap:  { marginBottom: 14 },
  label: {
    fontFamily: MONO,
    fontSize: FS.label,
    letterSpacing: LS.widest * FS.label,
    color: t.textFaint,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    fontFamily: MONO,
    height: 48,
    backgroundColor: t.bgCard,
    borderWidth: 1,
    borderColor: t.border,
    paddingHorizontal: 16,
    color: t.textPrimary,
    fontSize: FS.input,
    fontWeight: FW.regular,
    letterSpacing: LS.wide * FS.input,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none', transition: 'border-color 150ms ease, box-shadow 150ms ease' } as any : {}),
  },
  inputFocused: {
    borderColor: t.inkRed,
    backgroundColor: t.bgCard2,
    ...(Platform.OS === 'web' ? { boxShadow: `0 0 0 1px ${t.inkRedGlow}` } as any : {}),
  },
  inputError: {
    borderColor: t.inkRed,
    ...(Platform.OS === 'web' ? { boxShadow: `0 0 0 1px ${t.inkRedGlow}` } as any : {}),
  },
  errorText: {
    fontFamily: MONO,
    fontSize: FS.label,
    letterSpacing: LS.wide * FS.label,
    color: t.inkRedText,
    marginTop: 4,
  },
});
