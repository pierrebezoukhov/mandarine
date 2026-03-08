import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { T, FS } from '@/theme/tokens';

interface SegmentOption {
  label: string;
  value: number | string;
}

interface SegmentedControlProps {
  options: SegmentOption[];
  value: number | string;
  onChange: (v: number | string) => void;
  /** If true, appends a "Custom" segment that reveals a numeric text input */
  allowCustom?: boolean;
  /** Current custom value (controlled by parent) */
  customValue?: number;
  /** Called when the custom numeric input changes */
  onCustomChange?: (v: number) => void;
  style?: StyleProp<ViewStyle>;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  allowCustom    = false,
  customValue,
  onCustomChange,
  style,
}: SegmentedControlProps) {
  const [customInput, setCustomInput] = useState(
    customValue !== undefined ? String(customValue) : '',
  );

  const presetValues  = options.map(o => o.value);
  const isCustomActive = allowCustom && !presetValues.includes(value);

  const handleCustomPress = () => {
    const initial = customValue ?? 30;
    setCustomInput(String(initial));
    onChange(initial);
  };

  const handleCustomText = (text: string) => {
    setCustomInput(text);
    const n = parseInt(text, 10);
    if (n > 0) {
      onChange(n);
      onCustomChange?.(n);
    }
  };

  return (
    <View style={style}>
      <View style={s.row}>
        {options.map(opt => {
          const active = !isCustomActive && value === opt.value;
          return (
            <TouchableOpacity
              key={String(opt.value)}
              style={[s.segment, active && s.segmentActive]}
              onPress={() => onChange(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={[s.segmentText, active && s.segmentTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {allowCustom && (
          <TouchableOpacity
            style={[s.segment, isCustomActive && s.segmentActive]}
            onPress={handleCustomPress}
            activeOpacity={0.7}
          >
            <Text style={[s.segmentText, isCustomActive && s.segmentTextActive]}>
              Custom
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isCustomActive && allowCustom && (
        <TextInput
          style={s.customInput}
          value={customInput}
          onChangeText={handleCustomText}
          keyboardType="number-pad"
          placeholder="Enter number of cards"
          placeholderTextColor={T.textMuted}
          maxLength={3}
          autoFocus
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },

  segment: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: T.accentDim,
    borderColor: T.accentBorder,
  },
  segmentText:       { fontSize: FS.body, color: T.textMuted, fontWeight: '500' },
  segmentTextActive: { color: T.textPrimary },

  customInput: {
    marginTop: 10,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.borderFocus,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: T.textPrimary,
    fontSize: FS.ui,
    textAlign: 'center',
  },
});
