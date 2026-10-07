import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CAPYBRAIN_BASE,
  CAPYBRAIN_PARQUET_URL,
  CAPYBRAIN_BASELINES_URL,
  CAPYBRAIN_ATLAS_URL,
  CAPYBRAIN_GLB,
} from '../app/capybrain/components/explorer/config';

const modelFiles = Object.values(CAPYBRAIN_GLB).flatMap((quality) => [
  quality.inflated.left,
  quality.inflated.right,
  quality.pial.left,
  quality.pial.right,
]);

describe('CapyBrain bundled research assets', () => {
  for (const url of [
    CAPYBRAIN_PARQUET_URL,
    CAPYBRAIN_BASELINES_URL,
    CAPYBRAIN_ATLAS_URL,
    ...modelFiles,
  ]) {
    it(`ships the asset requested at ${url}`, () => {
      expect(existsSync(resolve(process.cwd(), 'public', url.slice(1)))).toBe(
        true
      );
    });
  }

  it('keeps its asset directory separate from exported page routes', () => {
    expect(
      existsSync(resolve(process.cwd(), 'app', CAPYBRAIN_BASE.slice(1)))
    ).toBe(false);
  });
});
