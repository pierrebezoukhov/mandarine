import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { T, FS, LH } from '@/theme/tokens';

type CardVariant = 'primary' | 'secondary';

interface CardProps {
  /** Chinese character or short string shown in the icon box */
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  /** primary = accent-tinted | secondary = surface (default) */
  variant?: CardVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Card({
  icon,
  title,
  subtitle,
  onPress,
  variant  = 'secondary',
  disabled = false,
  style,
}: CardProps) {
  return (
    <TouchableOpacity
      style={[
        s.base,
        variant === 'primary' ? s.variantPrimary : s.variantSecondary,
        disabled && s.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {/* Icon box */}
      <View style={[s.iconBox, variant === 'secondary' && s.iconBoxMuted]}>
        <Text style={[s.iconText, variant === 'secondary' && s.iconTextMuted]}>
          {icon}
        </Text>
      </View>

      {/* Body */}
      <View style={s.body}>
        <Text style={[s.title, disabled && s.textMuted]}>{title}</Text>
        <Text style={s.subtitle}>{subtitle}</Text>
      </View>

      {/* Arrow */}
      {!disabled && <Text style={s.arrow}>→</Text>}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
  },

  variantPrimary: {
    backgroundColor: T.accentDim,
    borderColor: 'rgba(192,57,43,0.25)',
  },
  variantSecondary: {
    backgroundColor: T.surface,
    borderColor: T.border,
  },
  disabled: { opacity: 0.45 },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(192,57,43,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(192,57,43,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxMuted: {
    backgroundColor: T.surface2,
    borderColor: T.border,
  },
  iconText:     { fontSize: FS.heading, color: T.accent },
  iconTextMuted:{ color: T.textMuted },

  body:     { flex: 1 },
  title:    { fontSize: FS.ui, color: T.textPrimary, fontWeight: '500', marginBottom: 3 },
  subtitle: { fontSize: FS.label, color: T.textMuted, lineHeight: LH.label },
  textMuted:{ color: T.textMuted },
  arrow:    { fontSize: FS.ui, color: T.textSecondary },
});
