/**
 * Plain-language glossary for the HCP MMP1 functional aliases TRIBE v2 surfaces
 * for each Mapillary frame. Sourced from hnc/PLAN.md (functional ROI summary)
 * and Glasser et al., 2016 (HCP MMP1 atlas).
 *
 * `feeling` is what the panel shows as the primary line. It is intentionally
 * everyday language ("Reading signs"), not a clinical label. `tech` is the
 * alias name, kept as a small subtitle so a curious reader can audit.
 *
 * Categories let us group bars when the chart wants a grouped layout instead
 * of a flat ranking.
 */

export type RegionCategory = 'vision' | 'social' | 'language' | 'motion';

export interface RegionInfo {
  feeling: string;
  tech: string;
  full: string;
  category: RegionCategory;
  blurb: string;
}

export const HNC_REGION_GLOSSARY: Record<string, RegionInfo> = {
  FFA: {
    feeling: 'Noticing faces',
    tech: 'FFA',
    full: 'Fusiform face area',
    category: 'vision',
    blurb: 'Lights up when faces are present and salient.',
  },
  PPA: {
    feeling: 'Reading the place',
    tech: 'PPA',
    full: 'Parahippocampal place area',
    category: 'vision',
    blurb: 'Encodes scenes, layouts and "where am I" cues.',
  },
  EBA: {
    feeling: 'Seeing people',
    tech: 'EBA',
    full: 'Extrastriate body area',
    category: 'vision',
    blurb: 'Responds to bodies and pedestrians.',
  },
  VWFA: {
    feeling: 'Reading signs',
    tech: 'VWFA',
    full: 'Visual word-form area',
    category: 'language',
    blurb: 'Activates for written characters, signage, text.',
  },
  STSdp: {
    feeling: 'Reading intent',
    tech: 'STSdp',
    full: 'Superior temporal sulcus, dorsal-posterior',
    category: 'social',
    blurb: 'Social inference — what other people are doing.',
  },
  STSva: {
    feeling: 'Reading intent',
    tech: 'STSva',
    full: 'Superior temporal sulcus, ventral-anterior',
    category: 'social',
    blurb: 'Social inference, voices and biological motion.',
  },
  Broca45: {
    feeling: 'Inner speech',
    tech: 'Broca 45',
    full: "Broca's area 45",
    category: 'language',
    blurb: 'Language production region.',
  },
  A5: {
    feeling: 'Hearing speech',
    tech: 'A5',
    full: 'Auditory area 5',
    category: 'language',
    blurb: 'Higher auditory / speech processing.',
  },
  MT: {
    feeling: 'Sensing motion',
    tech: 'MT/V5',
    full: 'Middle temporal motion area',
    category: 'motion',
    blurb: 'Motion processing. Attenuated on static clips, see caveat.',
  },
  V1: {
    feeling: 'Raw vision',
    tech: 'V1',
    full: 'Primary visual cortex',
    category: 'vision',
    blurb: 'Low-level retinotopy, edges and contrast.',
  },
  V4: {
    feeling: 'Color & form',
    tech: 'V4',
    full: 'Visual area 4',
    category: 'vision',
    blurb: 'Color, shape and texture processing.',
  },
  TPJ: {
    feeling: 'Reading social',
    tech: 'TPJ',
    full: 'Temporo-parietal junction',
    category: 'social',
    blurb: 'Social and emotional inference, theory of mind.',
  },
};

const FALLBACK: RegionInfo = {
  feeling: 'Other region',
  tech: '',
  full: '',
  category: 'vision',
  blurb: 'Cortical parcel without a plain-language alias.',
};

export function regionInfo(alias: string): RegionInfo {
  return (
    HNC_REGION_GLOSSARY[alias] ?? { ...FALLBACK, tech: alias, full: alias }
  );
}

export const CATEGORY_LABEL: Record<RegionCategory, string> = {
  vision: 'Vision',
  social: 'Social',
  language: 'Language',
  motion: 'Motion',
};
