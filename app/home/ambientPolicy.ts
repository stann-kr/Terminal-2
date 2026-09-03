export interface AmbientPolicyInput {
  allowMotion: boolean;
  heroVisible: boolean;
  webglAvailable: boolean;
}

export function shouldRenderHomeAmbient({
  allowMotion,
  heroVisible,
  webglAvailable,
}: AmbientPolicyInput): boolean {
  return allowMotion && heroVisible && webglAvailable;
}
