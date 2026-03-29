import { ReactNode, useMemo } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { FS, FW, MONO } from '@/theme/tokens';
import { space, radius } from '@/theme/spacing';
import { useTheme } from '@/context/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { ColorTheme } from '@/theme/colors';

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function BottomSheetModal({ visible, onClose, title, children }: BottomSheetModalProps) {
  const { isDesktop } = useResponsive();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      animationType={isDesktop ? 'fade' : 'slide'}
      transparent
      onRequestClose={onClose}
    >
      <View style={[s.overlay, isDesktop && s.overlayDesktop]}>
        {/* Backdrop — tapping closes the sheet */}
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[s.sheet, isDesktop && s.sheetDesktop]}>
            {/* Drag handle — hidden on desktop */}
            {!isDesktop && <View style={s.handle} />}

            {/* Header */}
            <View style={s.header}>
              <Text style={s.title}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={s.done}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* Content slot */}
            {children}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const makeStyles = (t: ColorTheme) => StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  overlayDesktop: { justifyContent: 'center', alignItems: 'center' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: t.overlay,
  },

  sheet: {
    backgroundColor: t.bgCard,
    borderTopLeftRadius: radius.modal,
    borderTopRightRadius: radius.modal,
    paddingHorizontal: space.xl,
    paddingBottom: Platform.OS === 'ios' ? space.huge : space.xl,
  },
  sheetDesktop: {
    maxWidth: 480,
    width: 480,
    borderRadius: radius.modal,
  },

  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: t.border,
    alignSelf: 'center',
    marginTop: space.md,
    marginBottom: space.xs,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: space.lg,
  },
  title: { fontFamily: MONO, fontSize: FS.definition, color: t.textPrimary, fontWeight: FW.medium },
  done:  { fontFamily: MONO, fontSize: FS.body, color: t.inkRed, fontWeight: FW.medium },
});
