import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { shouldRenderHomeAmbient } from '../app/home/ambientPolicy';

describe('home ambient rendering policy', () => {
  const ready = {
    allowMotion: true,
    heroVisible: true,
    webglAvailable: true,
  };

  it('allows WebGL only for the visible Home hero with non-essential motion enabled', () => {
    expect(shouldRenderHomeAmbient(ready)).toBe(true);
  });

  it('is mounted by the Home capability instead of the root shell', async () => {
    const [rootLayout, homeLayout] = await Promise.all([
      readFile('app/layout.tsx', 'utf8'),
      readFile('app/home/layout.tsx', 'utf8'),
    ]);

    expect(rootLayout).not.toContain('HomeAmbient');
    expect(homeLayout).toContain("import HomeAmbient from './HomeAmbient'");
    expect(homeLayout).toContain('<HomeAmbient />');
  });

  it('stops for reduced motion, save-data or hidden-document policy, viewport exit, and WebGL failure', () => {
    expect(shouldRenderHomeAmbient({ ...ready, allowMotion: false })).toBe(false);
    expect(shouldRenderHomeAmbient({ ...ready, heroVisible: false })).toBe(false);
    expect(shouldRenderHomeAmbient({ ...ready, webglAvailable: false })).toBe(false);
  });
});
