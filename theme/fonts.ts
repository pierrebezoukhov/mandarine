import { Platform } from 'react-native';

export type HanziFontId =
  | 'lxgw-wenkai'
  | 'noto-serif'
  | 'noto-sans'
  | 'ma-shan-zheng'
  | 'harmonyos-sans';

export type HanziFontDef = {
  id: HanziFontId;
  label: string;
  family: { web: string; native: string };
  weight: string;
  preview: string;
  description: string;
};

export const DEFAULT_HANZI_FONT: HanziFontId = 'lxgw-wenkai';

export const HANZI_FONTS: HanziFontDef[] = [
  {
    id: 'lxgw-wenkai',
    label: 'LXGW WenKai',
    family: {
      web: '"LXGW WenKai Screen", "LXGW WenKai TC", serif',
      native: 'LXGWWenKai-Regular',
    },
    weight: '400',
    preview: '永',

    description: 'Handcrafted, warm, natural strokes',
  },
  {
    id: 'noto-serif',
    label: 'Noto Serif SC',
    family: {
      web: '"Noto Serif SC", "STSong", serif',
      native: 'NotoSerifSC-Light',
    },
    weight: '300',
    preview: '永',

    description: 'Elegant, traditional, refined',
  },
  {
    id: 'noto-sans',
    label: 'Noto Sans SC',
    family: {
      web: '"Noto Sans SC", sans-serif',
      native: 'NotoSansSC-Regular',
    },
    weight: '400',
    preview: '永',

    description: 'Clean, minimal, easy to read',
  },
  {
    id: 'ma-shan-zheng',
    label: 'Ma Shan Zheng',
    family: {
      web: '"Ma Shan Zheng", cursive',
      native: 'MaShanZheng-Regular',
    },
    weight: '400',
    preview: '永',

    description: 'Expressive, ink-on-paper, artistic',
  },
  {
    id: 'harmonyos-sans',
    label: 'HarmonyOS Sans',
    family: {
      web: '"HarmonyOS Sans", "Noto Sans SC", sans-serif',
      native: 'HarmonyOSSans-Regular',
    },
    weight: '400',
    preview: '永',

    description: 'Precise, geometric, modern',
  },
];

export function getHanziFont(id: HanziFontId): HanziFontDef {
  return HANZI_FONTS.find(f => f.id === id) ?? HANZI_FONTS[0];
}

export function resolveHanziFontFamily(id: HanziFontId): { family: string; weight: string } {
  const def = getHanziFont(id);
  return {
    family: Platform.OS === 'web' ? def.family.web : def.family.native,
    weight: def.weight,
  };
}
