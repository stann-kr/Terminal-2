export interface AmbientPolicyInput {
  pathname: string;
  allowMotion: boolean;
  heroVisible: boolean;
  webglAvailable: boolean;
}

export function shouldRenderHomeAmbient({
  pathname,
  allowMotion,
  heroVisible,
  webglAvailable,
}: AmbientPolicyInput): boolean {
  return pathname === '/home' && allowMotion && heroVisible && webglAvailable;
}
