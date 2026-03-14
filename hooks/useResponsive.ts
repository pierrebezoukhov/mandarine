import { useWindowDimensions } from 'react-native';

export type Breakpoint = 'mobile' | 'desktop';

const BP_DESKTOP = 768;

export function useResponsive() {
  const { width } = useWindowDimensions();
  const bp: Breakpoint = width >= BP_DESKTOP ? 'desktop' : 'mobile';
  return { bp, isMobile: bp === 'mobile', isDesktop: bp === 'desktop', width };
}
