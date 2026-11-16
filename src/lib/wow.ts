/**
 * WOW.js scroll animations (the template's `wow` classes). Loaded only in the browser.
 */
import type * as WowModule from 'wowjs';

type WowConstructor = typeof WowModule.WOW;

interface WowExportShape {
  WOW?: WowConstructor;
  default?: { WOW?: WowConstructor } | WowConstructor;
}

declare global {
  interface Window {
    WOW?: typeof WowModule | WowConstructor;
  }
}

const resolveWowConstructor = (loaded: unknown): WowConstructor | null => {
  if (typeof loaded === 'function') return loaded as WowConstructor;
  if (loaded && typeof loaded === 'object') {
    const mod = loaded as WowExportShape;
    if (typeof mod.WOW === 'function') return mod.WOW;
    if (typeof mod.default === 'function') return mod.default;
    if (mod.default && typeof mod.default === 'object' && typeof mod.default.WOW === 'function') {
      return mod.default.WOW;
    }
  }
  return null;
};

export const animationCreate = (): void => {
  if (typeof window === 'undefined') return;
  // WHY: wowjs touches `window` when it loads, so it is required lazily instead of imported at the top
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const loaded: unknown = require('wowjs');
  // Under Webpack, wowjs attaches `this.WOW` directly to `window` and leaves `module.exports` empty;
  // under CommonJS/Turbopack it exports `{ WOW }`. Check the export first, then `window.WOW`.
  const WOWCtor = resolveWowConstructor(loaded) ?? resolveWowConstructor(window.WOW);
  if (!WOWCtor) return;
  new WOWCtor({ live: false }).init();
};
