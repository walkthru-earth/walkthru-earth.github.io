import { describe, expect, it } from 'vitest';
import {
  brandPaletteCss,
  brandPalettes,
  paletteVariables,
  projectBrands,
  projectPalette,
  projectPaletteOverrides,
  type PaletteTheme,
  type ProjectBrand,
} from './brand';
import { strategicGoals } from './strategy';

function luminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => {
      const value = parseInt(channel, 16) / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(first: string, second: string) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

const themes: PaletteTheme[] = ['light', 'dark'];

describe('strategic palette registry', () => {
  it('connects five distinct goals to all five registered families', () => {
    expect(strategicGoals).toHaveLength(5);
    expect(new Set(strategicGoals.map((goal) => goal.palette))).toEqual(
      new Set(Object.keys(brandPalettes))
    );
    for (const project of Object.values(projectBrands)) {
      expect(brandPalettes[project.palette]).toBeDefined();
    }
  });

  const palettes = [
    ...Object.entries(brandPalettes),
    ...Object.keys(projectBrands).map(
      (project) =>
        [
          `project:${project}`,
          {
            light: projectPalette(project as ProjectBrand, 'light'),
            dark: projectPalette(project as ProjectBrand, 'dark'),
          },
        ] as const
    ),
  ];
  for (const [id, palette] of palettes) {
    for (const theme of themes) {
      it(`${id}/${theme} maintains WCAG AA normal-text contrast`, () => {
        const colors = palette[theme];
        for (const color of Object.values(colors))
          expect(color).toMatch(/^#[\da-f]{6}$/i);
        for (const surface of [colors.paper, colors.surface]) {
          expect(contrast(colors.text, surface)).toBeGreaterThanOrEqual(4.5);
          expect(
            contrast(
              paletteVariables(colors, theme)['--palette-emphasis'],
              surface
            )
          ).toBeGreaterThanOrEqual(4.5);
          expect(
            contrast(paletteVariables(colors, theme)['--ring'], surface)
          ).toBeGreaterThanOrEqual(3);
          expect(contrast(colors.muted, surface)).toBeGreaterThanOrEqual(4.5);
        }
        for (const surface of [colors.main, colors.accent]) {
          expect(contrast(colors.ink, surface)).toBeGreaterThanOrEqual(4.5);
        }
      });
    }
  }

  it('allows project overrides without changing another project in the same family', () => {
    const previous = projectPaletteOverrides.objex;
    try {
      projectPaletteOverrides.objex = { light: { main: '#FFD580' } };
      expect(projectPalette('objex', 'light').main).toBe('#FFD580');
      expect(projectPalette('objex', 'light').text).toBe(
        brandPalettes.ecosystem.light.text
      );
      expect(projectPalette('objex', 'dark')).toEqual(
        brandPalettes.ecosystem.dark
      );
      expect(projectPalette('imagery', 'light')).toEqual(
        brandPalettes.ecosystem.light
      );
      expect(brandPaletteCss()).toContain(
        '.brand-tone-objex,.brand-project-objex{--palette-main:#FFD580'
      );
    } finally {
      if (previous) projectPaletteOverrides.objex = previous;
      else delete projectPaletteOverrides.objex;
    }
  });

  it('generates every theme while scoping page semantics to project containers', () => {
    const css = brandPaletteCss();
    const rules = css.split('\n');
    for (const [id, palette] of Object.entries(brandPalettes)) {
      for (const theme of themes) {
        const selector = `${theme === 'dark' ? '.dark ' : ''}.brand-tone-${id}`;
        const rule = rules.find((entry) =>
          entry.startsWith(`${selector}${theme === 'dark' ? ',' : '{'}`)
        );
        expect(rule).toBeDefined();
        for (const [name, value] of Object.entries(
          paletteVariables(palette[theme], theme)
        )) {
          expect(rule).toContain(`${name}:${value}`);
        }
        expect(rule).not.toContain('--foreground:');
      }
    }
    for (const project of Object.keys(projectBrands) as ProjectBrand[]) {
      for (const theme of themes) {
        const selector = `${theme === 'dark' ? '.dark ' : ''}.brand-project-${project}`;
        const rule = rules.find(
          (entry) =>
            entry.startsWith(selector) && entry.includes('--background:')
        );
        expect(rule).toContain(
          `--background:${projectPalette(project, theme).paper}`
        );
        expect(rule).toContain(
          `--foreground:${projectPalette(project, theme).text}`
        );
      }
    }
  });
});
