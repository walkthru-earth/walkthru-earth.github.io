import type { policyFrameworks } from '@/lib/strategy';

type FrameworkLogo = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Official asset provenance; images are served locally, never hotlinked. */
  source: string;
};

const egyptEnvironment: FrameworkLogo = {
  src: '/logos/frameworks/egypt-environment.png',
  alt: 'Egyptian Environmental Affairs Agency',
  width: 132,
  height: 130,
  source: 'https://www.eeaa.gov.eg/assets/images/logo/logo-footer.png',
};

/** Logos identify the publishers of these references, not partner organizations. */
export const frameworkLogos = {
  'UN · 76/300': {
    src: '/logos/frameworks/un.svg',
    alt: 'United Nations',
    width: 298,
    height: 91,
    source: 'https://sdgs.un.org/themes/custom/porto/assets/images/logo-en.svg',
  },
  'WHO · 2021': {
    src: '/logos/frameworks/who.svg',
    alt: 'World Health Organization',
    width: 581,
    height: 178,
    source:
      'https://www.who.int/ResourcePackages/WHO/assets/dist/images/logos/en/h-logo-blue.svg',
  },
  'EGYPT · 2050': egyptEnvironment,
  'WORLD BANK · CAIRO': {
    src: '/logos/frameworks/world-bank.svg',
    alt: 'World Bank',
    width: 172,
    height: 34,
    source:
      'https://www.worldbank.org/content/dam/wbr/logo/logo-wb-header-en.svg',
  },
  UNEP: {
    src: '/logos/frameworks/unep.svg',
    alt: 'United Nations Environment Programme',
    width: 202,
    height: 173,
    source:
      'https://www.unep.org/themes/custom/UNEP_3Spot/img/full_unep_logo_en.svg',
  },
  'IPCC · AR6': {
    src: '/logos/frameworks/ipcc.svg',
    alt: 'Intergovernmental Panel on Climate Change',
    width: 82,
    height: 50,
    source: 'https://www.ipcc.ch/#nav-primary-logo',
  },
  'EGYPT · 4/1994': egyptEnvironment,
  'SDGs · 3 / 10 / 11 / 13': {
    src: '/logos/frameworks/sdgs.png',
    alt: 'Sustainable Development Goals',
    width: 750,
    height: 750,
    source:
      'https://www.unep.org/themes/custom/UNEP_3Spot/img/SDG_Wheel_Transparent_WEB.png',
  },
} satisfies Record<(typeof policyFrameworks)[number]['badge'], FrameworkLogo>;
