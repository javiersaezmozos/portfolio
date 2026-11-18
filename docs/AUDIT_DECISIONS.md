# Decisiones Aprobadas de Auditoría Forense y Plan de Implementación

Fecha de aprobación: 2026-11-18
Estado: Aprobado para ejecución secuencial por oleadas (Oleada 1 → Oleada 2 → Oleada 3).

## 1. Selección de Opciones por Hallazgo (#01 a #16)
- **Base general:** Se aplica la **Opción Recomendada (Estándar Agencia / Awwwards)** en los hallazgos **#01 al #16**.
- **Matiz en #08 (Movimiento y Transiciones):** Se combina la **Opción Recomendada** (`@media (prefers-reduced-motion: reduce)` global y sustitución de `transition-all` por propiedades aceleradas por GPU) con la **Alternativa B** (transiciones de vista de Astro `astro:transitions` con `transition:name` en las portadas de la trilogía y reinicialización de scripts en `astro:page-load`).
- **Matiz en #16 (Footer):** Se combina la **Opción Recomendada** (inclusión de enlaces a *Métodos*, selector de idiomas tipográfico `ES · EN · DE · IT` sin emojis de banderas y año dinámico `new Date().getFullYear()`) con el cierre tipográfico monumental de la **Alternativa B** (`JAVIER SÁEZ` en serif de gran formato sutil al pie).

## 2. Jerarquía de Llamadas a la Acción en el Hero (#01)
- **CTA Primario:** Dirigido a **Métodos / Colección Flexibilidad** (`getMethodsPaths(currentLocale, base).trilogy`).
- **CTA Secundario:** Dirigido a **Trayectoria y Carrera Sinfónica** (`getSectionPaths(currentLocale, base).career`).

## 3. Copywriting Bilingüe / Multilingüe y Cargo Institucional (#10, #11, #12)
- **Pirámide invertida en `presentation`:**
  1. Actividad artística sinfónica (ORTVE, OSM-Teatro Real, ORCAM, Plural Ensemble), grabaciones de bandas sonoras (*Klaus* para Netflix, *Otros Mundos* para Movistar+) y música de cámara (*And The Brass*, *Madrid Brass Band*).
  2. Liderazgo pedagógico, gestión académica (**Profesor de Viento Metal y Secretario Académico** en la Escuela-Conservatorio Profesional de Música «Manuel Rodríguez Sales» de Leganés), Triple Máster universitario (UAX 2025, UNIR 2022, UCM 2015), colección editorial *Trombón · Flexibilidad* y divulgación en `@javi_trombone`.
  3. Formación superior en el RCSMM (*Matrícula de Honor* en recital fin de carrera) y doble *Premio Fin de Grado*.
- **Regla estricta de instrumentos:** Se conserva la denominación oficial de la titulación académica de Grado Profesional (*Tuba / Bombardino*), pero en toda referencia a actividad artística, interpretativa o de enseñanza instrumental práctica figuran exclusivamente **trombón y bombardino** (nunca tuba).
- **Paridad en 4 idiomas:** Todas las mejoras de copy y cargo institucional se propagan a `es.json`, `en.json`, `de.json` e `it.json`.

## 4. Secuencia de Ejecución
- **Oleada 1:** `docs/AUDIT_DECISIONS.md`, `astro.config.mjs`, `tailwind.config.mjs`, `src/layouts/Layout.astro`, `src/components/Hero.astro` y `src/data/{es,en,de,it}.json` + verificación con `npm run build` (0 errores).
- **Oleada 2:** Refactorización estructural (`<main>` único, rediseño editorial de *Masterclasses* y *Orquestas*, corrección de `#redes`, microinteracción de copiado de email en *Contacto*, *SocialBroadcastSection* y *Footer* monumental).
- **Oleada 3:** Optimización de imágenes a `.webp` con `width`/`height` explícitos, `transition:name` en portadas y ajustes responsivos en `Header.astro`.
