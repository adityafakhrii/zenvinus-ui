// Type declarations for packages that ship without types.

declare module 'wowjs' {
  export interface WOWOptions {
    boxClass?: string;
    animateClass?: string;
    offset?: number;
    mobile?: boolean;
    live?: boolean;
  }
  export class WOW {
    constructor(options?: WOWOptions);
    init(): void;
  }
}
