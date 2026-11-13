export type SupportedLocale = 'es' | 'en';

const LOCALE_ROUTE_PAIRS: ReadonlyArray<{ es: string; en: string }> = [
  { es: '/es/metodos/flexibilidad/vol-1', en: '/en/methods/flexibility/vol-1' },
  { es: '/es/metodos/flexibilidad', en: '/en/methods/flexibility' },
  { es: '/es/metodos', en: '/en/methods' },
  { es: '/es', en: '/en' },
];

function normalizePath(pathname: string, base: string): string {
  const cleanBase = base.replace(/\/$/, '');
  let path = pathname;
  if (cleanBase && path.startsWith(cleanBase)) {
    path = path.slice(cleanBase.length);
  }
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  return path || '/';
}

/**
 * Resolves the equivalent localized path for the target locale, preserving section routes.
 */
export function getAlternateLocalePath(
  currentPathname: string,
  targetLocale: SupportedLocale,
  base = ''
): string {
  const cleanBase = base.replace(/\/$/, '');
  const normalized = normalizePath(currentPathname, cleanBase);

  for (const pair of LOCALE_ROUTE_PAIRS) {
    if (normalized === pair.es || normalized === pair.en) {
      return `${cleanBase}${pair[targetLocale]}`;
    }
  }

  return `${cleanBase}/${targetLocale}`;
}

/**
 * Returns the root methods/trilogy path for the given locale.
 */
export function getMethodsPaths(locale: SupportedLocale, base = '') {
  const cleanBase = base.replace(/\/$/, '');
  if (locale === 'en') {
    return {
      home: `${cleanBase}/en`,
      catalog: `${cleanBase}/en/methods`,
      trilogy: `${cleanBase}/en/methods/flexibility`,
      vol1: `${cleanBase}/en/methods/flexibility/vol-1`,
      register: `${cleanBase}/registro?lang=en`,
    };
  }
  return {
    home: `${cleanBase}/es`,
    catalog: `${cleanBase}/es/metodos`,
    trilogy: `${cleanBase}/es/metodos/flexibilidad`,
    vol1: `${cleanBase}/es/metodos/flexibilidad/vol-1`,
    register: `${cleanBase}/registro?lang=es`,
  };
}
