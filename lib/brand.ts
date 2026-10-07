/** Five strategic color families. Edit this registry to recolor goals and projects. */
export type PaletteId =
  'ecosystem' | 'sensing' | 'experience' | 'spatial' | 'action';

export type PaletteTheme = 'light' | 'dark';

export type PaletteColors = {
  main: string;
  /** Text on the main/accent color, independent of the page theme. */
  ink: string;
  paper: string;
  surface: string;
  accent: string;
  deep: string;
  /** Body text on paper and surface. */
  text: string;
  muted: string;
  border: string;
};

export type BrandPalette = {
  name: string;
  light: PaletteColors;
  dark: PaletteColors;
};

// Color scheme reminder for future AI edits: goals 1–5 use saffron/ecosystem,
// blue/sensing, coral/experience, mint/spatial and lilac/action, respectively.
// Project-linked goals inherit project colors: OpenSensor uses blue/teal;
// CapyBrain overrides coral with tan/brown below. Keep these identities in sync.
// Roles: paper/surface are backgrounds, main/accent/deep are identity colors,
// ink is text on main/accent, text/muted are surface text, border is outlines.
// Keep palette previews (stacked cards or swatch strips) out of the rendered UI;
// this registry and its comments preserve the schemes for future reference.
export const brandPalettes = {
  ecosystem: {
    name: 'Saffron',
    light: {
      main: '#F2C45E',
      ink: '#342B17',
      paper: '#FFFBF1',
      surface: '#F8EDCF',
      accent: '#E2A436',
      deep: '#715118',
      text: '#342B17',
      muted: '#6E5932',
      border: '#D4BD87',
    },
    dark: {
      main: '#F2C45E',
      ink: '#342B17',
      paper: '#211D16',
      surface: '#30291D',
      accent: '#E2A436',
      deep: '#715118',
      text: '#FFF7E4',
      muted: '#C7B995',
      border: '#6A5832',
    },
  },
  sensing: {
    name: 'Signal blue',
    light: {
      main: '#71B8F4',
      ink: '#102F48',
      paper: '#F4FAFF',
      surface: '#DFEEF9',
      accent: '#9ADDE7',
      deep: '#205A80',
      text: '#102F48',
      muted: '#44647B',
      border: '#A4C6DE',
    },
    dark: {
      main: '#71B8F4',
      ink: '#102F48',
      paper: '#131F2A',
      surface: '#1D2E3C',
      accent: '#9ADDE7',
      deep: '#205A80',
      text: '#EEF8FF',
      muted: '#A9C4D8',
      border: '#41617A',
    },
  },
  experience: {
    name: 'Human coral',
    light: {
      main: '#F39C93',
      ink: '#442A2B',
      paper: '#FFF7F4',
      surface: '#F9E4DE',
      accent: '#F3C580',
      deep: '#8C4648',
      text: '#442A2B',
      muted: '#795653',
      border: '#DDB0A8',
    },
    dark: {
      main: '#F39C93',
      ink: '#442A2B',
      paper: '#281C1F',
      surface: '#3A282C',
      accent: '#F3C580',
      deep: '#8C4648',
      text: '#FFF0EB',
      muted: '#D5B4B0',
      border: '#805454',
    },
  },
  spatial: {
    name: 'Earth mint',
    light: {
      main: '#80CBAA',
      ink: '#173B31',
      paper: '#F5FBF5',
      surface: '#E1F0E4',
      accent: '#BDD87E',
      deep: '#326954',
      text: '#173B31',
      muted: '#4D6959',
      border: '#A6C8B0',
    },
    dark: {
      main: '#80CBAA',
      ink: '#173B31',
      paper: '#15231D',
      surface: '#23352A',
      accent: '#BDD87E',
      deep: '#326954',
      text: '#F0FAEF',
      muted: '#B0C8B5',
      border: '#4B7058',
    },
  },
  action: {
    name: 'Action lilac',
    light: {
      main: '#B5A1E5',
      ink: '#302741',
      paper: '#FAF7FF',
      surface: '#ECE5F8',
      accent: '#D7B4CF',
      deep: '#69518B',
      text: '#302741',
      muted: '#665676',
      border: '#C1AFD9',
    },
    dark: {
      main: '#B5A1E5',
      ink: '#302741',
      paper: '#211C2C',
      surface: '#30283F',
      accent: '#D7B4CF',
      deep: '#69518B',
      text: '#F8F0FF',
      muted: '#C5B6D7',
      border: '#65527E',
    },
  },
} as const satisfies Record<PaletteId, BrandPalette>;

type ProjectIdentity = {
  palette: PaletteId;
  name?: string;
  href?: string;
  mascot?: {
    kind: 'capybara' | 'peacock';
    src: string;
    alt: string;
    greeting: string;
  };
};

/** Project colors and characters are shared by strategy, navigation and covers. */
export const projectBrands = {
  earth: { palette: 'spatial' },
  opensensor: {
    palette: 'sensing',
    name: 'OpenSensor.Space',
    href: '/opensensor',
    mascot: {
      kind: 'peacock',
      src: '/mascots/peacock.webp',
      alt: 'OpenSensor’s blue and teal peacock mascot',
      greeting: 'Meet our peacock guide',
    },
  },
  capybrain: {
    palette: 'experience',
    name: 'CapyBrain',
    href: '/capybrain',
    mascot: {
      kind: 'capybara',
      src: '/mascots/capybara.webp',
      alt: 'CapyBrain’s friendly tan capybara mascot',
      greeting: 'Meet your capybara guide',
    },
  },
  imagery: { palette: 'ecosystem' },
  objex: { palette: 'ecosystem' },
} as const satisfies Record<string, ProjectIdentity>;

export type ProjectBrand = keyof typeof projectBrands;
export type MascotProjectBrand = {
  [Key in ProjectBrand]: (typeof projectBrands)[Key] extends { mascot: unknown }
    ? Key
    : never;
}[ProjectBrand];
export type ProjectPaletteOverrides = Partial<
  Record<ProjectBrand, Partial<Record<PaletteTheme, Partial<PaletteColors>>>>
>;

/** Project identities can replace any role while retaining their strategic family. */
export const projectPaletteOverrides: ProjectPaletteOverrides = {
  capybrain: {
    light: {
      main: '#C69A70',
      ink: '#30221B',
      paper: '#FBF6EF',
      surface: '#F1E4D4',
      accent: '#D8B784',
      deep: '#745139',
      text: '#35261E',
      muted: '#735D4B',
      border: '#CBB49A',
    },
    dark: {
      main: '#C69A70',
      ink: '#30221B',
      paper: '#241D18',
      surface: '#352A22',
      accent: '#D8B784',
      deep: '#745139',
      text: '#FBF3E8',
      muted: '#CBB7A1',
      border: '#76604D',
    },
  },
};

export function projectPalette(
  project: ProjectBrand,
  theme: PaletteTheme
): PaletteColors {
  return {
    ...brandPalettes[projectBrands[project].palette][theme],
    ...projectPaletteOverrides[project]?.[theme],
  };
}

/** Palette variables can also be passed as inline styles for runtime theme editors. */
export function paletteVariables(
  colors: PaletteColors,
  theme: PaletteTheme = 'light'
): Record<`--${string}`, string> {
  return {
    ...Object.fromEntries(
      Object.entries(colors).map(([role, value]) => [
        `--palette-${role}`,
        value,
      ])
    ),
    '--palette-emphasis': theme === 'dark' ? colors.main : colors.deep,
    '--ring': colors.muted,
    '--brand-color': colors.main,
    '--brand-ink': colors.ink,
  };
}

function semanticVariables(
  colors: PaletteColors
): Record<`--${string}`, string> {
  return {
    '--background': colors.paper,
    '--foreground': colors.text,
    '--card': colors.surface,
    '--card-foreground': colors.text,
    '--popover': colors.paper,
    '--popover-foreground': colors.text,
    '--primary': colors.main,
    '--primary-foreground': colors.ink,
    '--secondary': colors.accent,
    '--secondary-foreground': colors.ink,
    '--accent': colors.surface,
    '--accent-foreground': colors.text,
    '--muted': colors.surface,
    '--muted-foreground': colors.muted,
    '--border': colors.border,
    '--input': colors.border,
    '--ring': colors.muted,
    '--solid-foreground': colors.ink,
  };
}

function cssRule(
  selectors: string[],
  variables: Record<string, string>,
  theme: PaletteTheme
) {
  const scoped = selectors.map((selector) =>
    theme === 'dark' ? `.dark ${selector},${selector}.dark` : selector
  );
  return `${scoped.join(',')}{${Object.entries(variables)
    .map(([key, value]) => `${key}:${value}`)
    .join(';')}}`;
}

/** Emit once in the server layout: all identities arrive with the initial HTML. */
export function brandPaletteCss(): string {
  const rules: string[] = [];
  for (const theme of ['light', 'dark'] as const) {
    for (const id of Object.keys(brandPalettes) as PaletteId[]) {
      rules.push(
        cssRule(
          [`.brand-tone-${id}`],
          paletteVariables(brandPalettes[id][theme], theme),
          theme
        )
      );
    }
    for (const project of Object.keys(projectBrands) as ProjectBrand[]) {
      const colors = projectPalette(project, theme);
      rules.push(
        cssRule(
          [`.brand-tone-${project}`, `.brand-project-${project}`],
          paletteVariables(colors, theme),
          theme
        )
      );
      // A colored chip must never redefine a page's text/background variables.
      rules.push(
        cssRule([`.brand-project-${project}`], semanticVariables(colors), theme)
      );
    }
  }
  return rules.join('\n');
}
