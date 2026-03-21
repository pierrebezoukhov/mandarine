import { useMemo } from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator, StyleSheet,
  ViewStyle, StyleProp,
} from 'react-native';
import { FS, FW } from '@/theme/tokens';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';

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
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
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
        ? <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.textSecondary} />
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

const makeStyles = (t: ColorTheme) => StyleSheet.create({
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
    backgroundColor: t.inkRed,
  },
  variantSecondary: {
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.bgCard,
  },
  variantGhost: {
    // no background, no border
  },

  disabled: { opacity: 0.18 },

  // Labels
  label: {
    fontSize: FS.ui,
    fontWeight: FW.medium,
  },
  labelPrimary:   { color: '#fff' },
  labelSecondary: { color: t.textSecondary },
  labelGhost:     { color: t.textSecondary },
});
