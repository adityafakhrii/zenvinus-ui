/** One string from a Next.js query value (?slug=a); null when it is missing or repeated. */
export const queryString = (value: string | string[] | undefined): string | null => (typeof value === 'string' ? value : null);
