export type SupportedLocale = 'es' | 'en' | 'de' | 'it';

export const SUPPORTED_LOCALES: ReadonlyArray<SupportedLocale> = ['es', 'en', 'de', 'it'];

const LOCALE_ROUTE_MAP: ReadonlyArray<Record<SupportedLocale, string>> = [
  {
    es: '/es/metodos/flexibilidad/vol-1',
    en: '/en/methods/flexibility/vol-1',
    de: '/de/methoden/flexibilitaet/bd-1',
    it: '/it/metodi/flessibilita/vol-1',
  },
  {
    es: '/es/metodos/flexibilidad',
    en: '/en/methods/flexibility',
    de: '/de/methoden/flexibilitaet',
    it: '/it/metodi/flessibilita',
  },
  {
    es: '/es/metodos',
    en: '/en/methods',
    de: '/de/methoden',
    it: '/it/metodi',
  },
  {
    es: '/es/trayectoria',
    en: '/en/career',
    de: '/de/werdegang',
    it: '/it/carriera',
  },
  {
    es: '/es/contacto',
    en: '/en/contact',
    de: '/de/kontakt',
    it: '/it/contatti',
  },
  {
    es: '/es',
    en: '/en',
    de: '/de',
    it: '/it',
  },
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

  for (const routes of LOCALE_ROUTE_MAP) {
    if (Object.values(routes).includes(normalized)) {
      return `${cleanBase}${routes[targetLocale]}`;
    }
  }

  return `${cleanBase}/${targetLocale}`;
}

/**
 * Returns the root section paths (home, career, contact) for the given locale.
 */
export function getSectionPaths(locale: SupportedLocale, base = '') {
  const cleanBase = base.replace(/\/$/, '');
  switch (locale) {
    case 'en':
      return {
        home: `${cleanBase}/en`,
        career: `${cleanBase}/en/career`,
        contact: `${cleanBase}/en/contact`,
      };
    case 'de':
      return {
        home: `${cleanBase}/de`,
        career: `${cleanBase}/de/werdegang`,
        contact: `${cleanBase}/de/kontakt`,
      };
    case 'it':
      return {
        home: `${cleanBase}/it`,
        career: `${cleanBase}/it/carriera`,
        contact: `${cleanBase}/it/contatti`,
      };
    case 'es':
    default:
      return {
        home: `${cleanBase}/es`,
        career: `${cleanBase}/es/trayectoria`,
        contact: `${cleanBase}/es/contacto`,
      };
  }
}

/**
 * Returns the root methods/collection paths for the given locale.
 */
export function getMethodsPaths(locale: SupportedLocale, base = '') {
  const cleanBase = base.replace(/\/$/, '');
  const sectionPaths = getSectionPaths(locale, cleanBase);
  switch (locale) {
    case 'en':
      return {
        home: sectionPaths.home,
        career: sectionPaths.career,
        contact: sectionPaths.contact,
        catalog: `${cleanBase}/en/methods`,
        trilogy: `${cleanBase}/en/methods/flexibility`,
        vol1: `${cleanBase}/en/methods/flexibility/vol-1`,
        register: `${cleanBase}/registro?lang=en`,
      };
    case 'de':
      return {
        home: sectionPaths.home,
        career: sectionPaths.career,
        contact: sectionPaths.contact,
        catalog: `${cleanBase}/de/methoden`,
        trilogy: `${cleanBase}/de/methoden/flexibilitaet`,
        vol1: `${cleanBase}/de/methoden/flexibilitaet/bd-1`,
        register: `${cleanBase}/registro?lang=de`,
      };
    case 'it':
      return {
        home: sectionPaths.home,
        career: sectionPaths.career,
        contact: sectionPaths.contact,
        catalog: `${cleanBase}/it/metodi`,
        trilogy: `${cleanBase}/it/metodi/flessibilita`,
        vol1: `${cleanBase}/it/metodi/flessibilita/vol-1`,
        register: `${cleanBase}/registro?lang=it`,
      };
    case 'es':
    default:
      return {
        home: sectionPaths.home,
        career: sectionPaths.career,
        contact: sectionPaths.contact,
        catalog: `${cleanBase}/es/metodos`,
        trilogy: `${cleanBase}/es/metodos/flexibilidad`,
        vol1: `${cleanBase}/es/metodos/flexibilidad/vol-1`,
        register: `${cleanBase}/registro?lang=es`,
      };
  }
}
