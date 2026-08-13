import { describe, expect, it } from 'vitest';
import { shouldRenderHomeAmbient } from '../lib/ambientPolicy';

describe('home ambient rendering policy', () => {
  const ready = {
    pathname: '/home',
    allowMotion: true,
    heroVisible: true,
    webglAvailable: true,
  };

  it('allows WebGL only for the visible Home hero with non-essential motion enabled', () => {
    expect(shouldRenderHomeAmbient(ready)).toBe(true);
  });

  it.each(['/gate', '/gate/request', '/signal', '/transmit', '/status'])(
    'keeps the ambient renderer off %s',
    (pathname) => expect(shouldRenderHomeAmbient({ ...ready, pathname })).toBe(false),
  );

  it('stops for reduced motion, save-data or hidden-document policy, viewport exit, and WebGL failure', () => {
    expect(shouldRenderHomeAmbient({ ...ready, allowMotion: false })).toBe(false);
    expect(shouldRenderHomeAmbient({ ...ready, heroVisible: false })).toBe(false);
    expect(shouldRenderHomeAmbient({ ...ready, webglAvailable: false })).toBe(false);
  });
});
