import { Platform, Text } from 'react-native';
import { MONO } from '@/theme/tokens';

interface GearIconProps {
  size?: number;
  color?: string;
}

/**
 * Settings icon — minimal "sliders" drawn with thin SVG lines.
 * Three horizontal hairlines with small dots at staggered positions.
 * Matches the ASCII/terminal aesthetic: geometric, delicate, no fill.
 */
export function GearIcon({ size = 20, color = '#8a8070' }: GearIconProps) {
  if (Platform.OS === 'web') {
    const s = size;
    const pad = s * 0.12;
    const w = s - pad * 2;
    const r = s * 0.055;           // smaller dots
    const y1 = s * 0.28;
    const y2 = s * 0.5;
    const y3 = s * 0.72;
    const x1 = pad + w * 0.3;
    const x2 = pad + w * 0.7;
    const x3 = pad + w * 0.45;

    const html = `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="${pad}" y1="${y1}" x2="${pad + w}" y2="${y1}" stroke="${color}" stroke-width="0.75" opacity="0.7"/>
      <circle cx="${x1}" cy="${y1}" r="${r}" fill="${color}"/>
      <line x1="${pad}" y1="${y2}" x2="${pad + w}" y2="${y2}" stroke="${color}" stroke-width="0.75" opacity="0.7"/>
      <circle cx="${x2}" cy="${y2}" r="${r}" fill="${color}"/>
      <line x1="${pad}" y1="${y3}" x2="${pad + w}" y2="${y3}" stroke="${color}" stroke-width="0.75" opacity="0.7"/>
      <circle cx="${x3}" cy="${y3}" r="${r}" fill="${color}"/>
    </svg>`;

    return (
      <div
        style={{ width: s, height: s, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <Text style={{ fontFamily: MONO, fontSize: size * 0.7, color, lineHeight: size }}>{'\u2261'}</Text>
  );
}
