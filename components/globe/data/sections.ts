export * from './section-shared';
import { WEATHER_SECTIONS } from './weather-sections';
import { INDICES_SECTIONS } from './indices-sections';
import { COMPOSITES_SECTIONS } from './composites-sections';

const sections = [
  ...WEATHER_SECTIONS,
  ...INDICES_SECTIONS,
  ...COMPOSITES_SECTIONS,
];
import { SECTION_IDS } from './section-ids';

export const SECTIONS = SECTION_IDS.map((id) =>
  sections.find((section) => section.id === id)!
);
