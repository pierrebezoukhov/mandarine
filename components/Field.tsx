import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { T, FS } from '@/theme/tokens';

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
        placeholderTextColor={T.textMuted}
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

const s = StyleSheet.create({
  wrap:  { marginBottom: 14 },
  label: {
    fontSize: FS.label,
    color: T.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 12,
    padding: 14,
    color: T.textPrimary,
    fontSize: FS.ui,
  },
  inputFocused: {
    borderColor: T.borderFocus,
    backgroundColor: T.surface2,
  },
  inputError: {
    borderColor: 'rgba(224,82,82,0.5)',
  },
  errorText: {
    fontSize: FS.label,
    color: T.error,
    marginTop: 4,
  },
});
