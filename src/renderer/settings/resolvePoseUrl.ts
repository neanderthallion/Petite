/**
 * Built-in pose references are bare filenames (e.g. 'Cat1.png'), resolved
 * relative to wherever they're rendered. pet/App.tsx lives next to those
 * files in the build output (out/renderer/pet/) so a bare filename works
 * there unmodified; this settings window lives one directory over
 * (out/renderer/settings/), so it needs the '../pet/' prefix instead.
 * Custom petasset://<petId>/<file>.png references are already absolute and
 * pass through unchanged.
 */
export function resolvePoseUrl(pose: string): string {
  return pose.includes('://') ? pose : `../pet/${pose}`
}
