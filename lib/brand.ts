/** One palette per project, shared by navigation, previews and project pages. */
export const projectBrands = {
  earth: { tone: 'earth', href: '/indices', name: 'Earth’s Living Indices' },
  opensensor: {
    tone: 'opensensor',
    href: '/opensensor',
    name: 'OpenSensor.Space',
  },
  wellbeing: {
    tone: 'wellbeing',
    href: '/hormones-cities',
    name: 'Hormones & Cities',
  },
  imagery: {
    tone: 'imagery',
    href: '/software/imagery-desktop',
    name: 'Imagery Desktop',
  },
  objex: { tone: 'objex', href: '/software/objex', name: 'objex' },
} as const;

export type ProjectBrand = keyof typeof projectBrands;
