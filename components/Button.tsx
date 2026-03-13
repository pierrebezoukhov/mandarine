import {
  TouchableOpacity, Text, ActivityIndicator, StyleSheet,
  ViewStyle, StyleProp,
} from 'react-native';
import { T, FS, FW } from '@/theme/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonShape   = 'pill' | 'rounded';

interface ButtonProps {
  label: string;
  onPress: () => void;
  /** primary = accent fill | secondary = outlined | ghost = text only */
  variant?: ButtonVariant;
  /** pill = borderRadius 100 (default) | rounded = borderRadius 12 */
  shape?: ButtonShape;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  shape   = 'pill',
  disabled,
  loading,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        s.base,
        shape === 'pill'    ? s.shapePill    : s.shapeRounded,
        variant === 'primary'   && s.variantPrimary,
        variant === 'secondary' && s.variantSecondary,
        variant === 'ghost'     && s.variantGhost,
        isDisabled && s.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? '#fff' : T.textSecondary} />
        : <Text style={[
            s.label,
            variant === 'primary'   && s.labelPrimary,
            variant === 'secondary' && s.labelSecondary,
            variant === 'ghost'     && s.labelGhost,
          ]}>
            {label}
          </Text>
      }
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  base: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Shapes
  shapePill:    { borderRadius: 100 },
  shapeRounded: { borderRadius: 12 },

  // Variants
  variantPrimary: {
    backgroundColor: T.accent,
  },
  variantSecondary: {
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.surface,
  },
  variantGhost: {
    // no background, no border
  },

  disabled: { opacity: 0.4 },

  // Labels
  label: {
    fontSize: FS.ui,
    fontWeight: FW.medium,
  },
  labelPrimary:   { color: '#fff' },
  labelSecondary: { color: T.textSecondary },
  labelGhost:     { color: T.textMuted },
});
