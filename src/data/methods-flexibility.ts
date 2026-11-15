import type { SupportedLocale } from '../utils/i18n-routes';

export interface TrilogyVolumeCard {
  id: 1 | 2 | 3;
  metal: string;
  hex: string;
  borderClass: string;
  badgeClass: string;
  title: string;
  range: string;
  courses: string;
  status: string;
  available: boolean;
  slug: string;
  ctaCatalog: string;
  ctaTrilogy: string;
  specs: string[];
  trilogyHighlights: string[];
}

export interface SyllabusLevel {
  level: string;
  range: string;
  qrRoot: string;
  summary: string;
  blocks: Array<{
    code: string;
    title: string;
    detail: string;
  }>;
}

export interface EditorialFaq {
  question: string;
  answer: string;
}

export function getTrilogyVolumes(locale: SupportedLocale, base = ''): TrilogyVolumeCard[] {
  const cleanBase = base.replace(/\/$/, '');
  const vol1Href =
    locale === 'en'
      ? `${cleanBase}/en/methods/flexibility/vol-1`
      : locale === 'de'
        ? `${cleanBase}/de/methoden/flexibilitaet/bd-1`
        : locale === 'it'
          ? `${cleanBase}/it/metodi/flessibilita/vol-1`
          : `${cleanBase}/es/metodos/flexibilidad/vol-1`;
  const waitlistBase = 'mailto:info@javisaez.com?subject=';

  if (locale === 'de') {
    return [
      {
        id: 1,
        metal: 'Kupfer-Serie',
        hex: '#E89758',
        borderClass: 'border-copper/45 hover:border-copper',
        badgeClass: 'bg-copper/15 text-copper-light border-copper/40',
        title: 'Band 1 · Elementarstufe',
        range: 'Anfangs- & Mittelregister (B♭₂ bis F₄ · 6. Naturton)',
        courses: 'Elementarstufe (2.–4. Ausbildungsjahr)',
        status: 'Offizieller Verkaufsstart auf Amazon KDP & Kindle: Mai–Juni 2027',
        available: true,
        slug: vol1Href,
        ctaCatalog: 'Band 1 im Detail ansehen',
        ctaTrilogy: 'Zu Band 1 (Vorschau 2027)',
        specs: [
          '3 progressive Stufen (je ein Schuljahr, bis F₄)',
          '30 Doppelübungen pro Stufe + Konsolidierungsetüden + Erweiterungsblock',
          'Visueller Assistent TromBot während des gesamten Lernwegs',
          'Referenz-Audios, Videopartituren mit Metronom & Frage-Antwort-Praxis',
        ],
        trilogyHighlights: [
          'Stufe 1: Naturtöne 2 (B₂), 3 (F₃) und 4 (B₃) mit stabilem Ansatz',
          'Stufe 2: Schrittweise Erweiterung bis zum 5. Naturton (D₄) ohne Spannung',
          'Stufe 3: Kontrollierter Ausbau bis zum 6. Naturton (F₄) und Abschlussübungen',
          'Parallele rhythmische Progression: Halbe/Viertel, Achtel, Triolen und Sechzehntel',
        ],
      },
      {
        id: 2,
        metal: 'Silber-Serie',
        hex: '#F1F2F4',
        borderClass: 'border-silver/35 hover:border-silver/70',
        badgeClass: 'bg-white/10 text-silver border-silver/30',
        title: 'Band 2 · Mittelstufe',
        range: 'Erweiterung in die Höhe (bis B♭₅ · 8. Naturton)',
        courses: 'Mittelstufe / Konservatorium',
        status: 'In Vorbereitung',
        available: false,
        slug: `${waitlistBase}${encodeURIComponent('Warteliste: Posaune Flexibilität Band 2 (Silber)')}`,
        ctaCatalog: 'Erscheinungsbenachrichtigung anfordern (Amazon KDP / Kindle)',
        ctaTrilogy: 'Auf die Warteliste setzen (Bd. 2 · Silber)',
        specs: [
          'Beherrschung des 6., 7. und 8. Naturtons und Quartventil-Integration',
          'Gebrochene Intervalle, Oktavbindungen und agile Luftsäule',
          'Konzertetüden mittlerer Schwierigkeit mit digitalem Playalong',
          'Klares Notenbild für fortgeschrittenes Repertoire auf dem Pult',
        ],
        trilogyHighlights: [
          'Stufe 1: Technische Arbeit bis As₄ mit Einbindung von Lippentrillern',
          'Stufe 2: Festigung bis B₄ und Triller im mittel-hohen Register',
          'Stufe 3: Erweiterung bis C₅ mit Trillern und Kontrolle der Naturtonreihe',
          'Parallele rhythmische Progression: Halbe/Viertel, Achtel, Triolen und Sechzehntel (mit Trillern als Erweiterung)',
        ],
      },
    ];
  }

  if (locale === 'it') {
    return [
      {
        id: 1,
        metal: 'Serie Rame',
        hex: '#E89758',
        borderClass: 'border-copper/45 hover:border-copper',
        badgeClass: 'bg-copper/15 text-copper-light border-copper/40',
        title: 'Volume 1 · Elementare',
        range: 'Registro iniziale e medio (Sib₂ fino a Fa₄ · 6º armonico)',
        courses: '2º a 4º Anno di Corsi Elementari',
        status: 'Lancio ufficiale su Amazon KDP e Kindle: maggio–giugno 2027',
        available: true,
        slug: vol1Href,
        ctaCatalog: 'Vedi scheda del Volume 1',
        ctaTrilogy: 'Vai al Volume 1 (Lancio 2027)',
        specs: [
          '3 livelli progressivi (uno per anno scolastico, fino a Fa₄)',
          '30 esercizi doppi per livello + studi di consolidamento + blocco di ampliamento',
          'Assistente visivo TromBot lungo tutto il percorso',
          'Audio di riferimento, videopartiture con metronomo e domanda-risposta',
        ],
        trilogyHighlights: [
          'Livello 1: Armonici essenziali 2º (Sib₂), 3º (Fa₃) e 4º (Sib₃) con imboccatura stabile',
          'Livello 2: Espansione graduale al 5º armonico (Re₄) senza tensione muscolare',
          'Livello 3: Estensione controllata fino al 6º armonico (Fa₄) e sfide finali',
          'Progressione ritmica parallela: minime/semiminime, crome, terzine e semicrome',
        ],
      },
      {
        id: 2,
        metal: 'Serie Argento',
        hex: '#F1F2F4',
        borderClass: 'border-silver/35 hover:border-silver/70',
        badgeClass: 'bg-white/10 text-silver border-silver/30',
        title: 'Volume 2 · Intermedio',
        range: 'Espansione al registro medio-acuto (fino a Sib₅ · 8º armonico)',
        courses: 'Corsi Professionali di Conservatorio',
        status: 'In preparazione editoriale',
        available: false,
        slug: `${waitlistBase}${encodeURIComponent('Lista d\'attesa: Trombone Flessibilità Volume 2 (Argento)')}`,
        ctaCatalog: 'Richiedi notifica di lancio (Amazon KDP / Kindle)',
        ctaTrilogy: 'Iscriviti alla lista d\'attesa (Vol. 2 · Argento)',
        specs: [
          'Padronanza del 6º, 7º e 8º armonico e controllo della ritorta in Fa',
          'Intervalli spezzati, ottave legate e agilità della colonna d\'aria',
          'Studi da concerto di difficoltà intermedia con accompagnamento digitale',
          'Impaginazione ottimizzata per il repertorio intermedio sul leggio',
        ],
        trilogyHighlights: [
          'Livello 1: Lavoro tecnico fino al Lab₄ con integrazione dei trilli di labbro',
          'Livello 2: Consolidamento fino al Sib₄ e trilli applicati al registro medio-acuto',
          'Livello 3: Estensione fino al Do₅ con trilli e controllo avanzato degli armonici',
          'Progressione ritmica parallela: minime/semiminime, crome, terzine e semicrome (con trilli come ampliamento)',
        ],
      },
    ];
  }

  if (locale === 'en') {
    return [
      {
        id: 1,
        metal: 'Copper Series',
        hex: '#E89758',
        borderClass: 'border-copper/45 hover:border-copper',
        badgeClass: 'bg-copper/15 text-copper-light border-copper/40',
        title: 'Volume 1 · Elementary',
        range: 'Initial & middle register (Bb₂ up to F₄ · 6th partial)',
        courses: 'Elementary Music Studies (Years 2–4)',
        status: 'Official launch on Amazon KDP & Kindle: May–June 2027',
        available: true,
        slug: vol1Href,
        ctaCatalog: 'View Volume 1 details',
        ctaTrilogy: 'Go to Volume 1 (2027 Launch)',
        specs: [
          '3 progressive levels (one per academic year, up to F₄)',
          '30 double exercises per level + consolidation etudes + extension block',
          'Visual assistant TromBot highlighting key ideas throughout all 3 levels',
          'Reference audio, solo metronome video-scores, and call-and-response practice',
        ],
        trilogyHighlights: [
          'Level 1: Core partials 2nd (Bb₂), 3rd (F₃), and 4th (Bb₃) with stable embouchure',
          'Level 2: Gradual expansion to the 5th partial (D₄) without muscular tension',
          'Level 3: Controlled extension up to the 6th partial (F₄) and final challenges',
          'Parallel rhythmic progression: half/quarter notes, eighths, triplets & sixteenths',
        ],
      },
      {
        id: 2,
        metal: 'Silver Series',
        hex: '#F1F2F4',
        borderClass: 'border-silver/35 hover:border-silver/70',
        badgeClass: 'bg-white/10 text-silver border-silver/30',
        title: 'Volume 2 · Intermediate',
        range: 'Mid-high expansion (Up to Bb₅ · 8th partial)',
        courses: 'Intermediate / Conservatory Studies',
        status: 'In Editorial Preparation',
        available: false,
        slug: `${waitlistBase}${encodeURIComponent('Waitlist: Trombone Flexibility Volume 2 (Silver)')}`,
        ctaCatalog: 'Request Launch Notification (Amazon KDP / Kindle)',
        ctaTrilogy: 'Join Waitlist (Vol. 2 · Silver)',
        specs: [
          'Mastery of 6th, 7th & 8th partials and F-attachment valve integration',
          'Broken intervals, slurred octaves, and airflow agility',
          'Intermediate concert etudes with digital reference tracks',
          'Layout optimized for intermediate repertoire on the music stand',
        ],
        trilogyHighlights: [
          'Level 1: Technical work up to Ab₄ incorporating lip trills',
          'Level 2: Consolidation up to Bb₄ and trills in the mid-high register',
          'Level 3: Extension up to C₅ with trills and advanced harmonic-series control',
          'Parallel rhythmic progression: half/quarter notes, eighths, triplets & sixteenths (with trills as extension)',
        ],
      },
    ];
  }

  return [
    {
      id: 1,
      metal: 'Serie Cobre',
      hex: '#E89758',
      borderClass: 'border-copper/45 hover:border-copper',
      badgeClass: 'bg-copper/15 text-copper-light border-copper/40',
      title: 'Volumen 1 · Elemental',
      range: 'Registro inicial y medio (Sib₂ hasta Fa₄ · 6.º parcial)',
      courses: '2.º a 4.º de Enseñanzas Elementales',
      status: 'Lanzamiento oficial en Amazon KDP y Kindle: mayo–junio de 2027',
      available: true,
      slug: vol1Href,
      ctaCatalog: 'Ver ficha del Volumen 1',
      ctaTrilogy: 'Ir a la Ficha del Volumen 1 (Lanzamiento 2027)',
      specs: [
        '3 niveles progresivos (uno por curso escolar, hasta Fa₄)',
        '30 ejercicios dobles por nivel + estudios de consolidación + bloque de ampliación',
        'Asistente visual TromBot recordando las ideas principales en los tres niveles',
        'Audios de ejemplo, videopartituras con metrónomo y práctica pregunta-respuesta',
      ],
      trilogyHighlights: [
        'Nivel 1: Parciales esenciales 2.º (Sib₂), 3.º (Fa₃) y 4.º (Sib₃) con embocadura estable',
        'Nivel 2: Ampliación gradual al 5.º parcial (Re₄) sin tensión muscular',
        'Nivel 3: Extensión controlada hasta el 6.º parcial (Fa₄) y retos finales',
        'Progresión rítmica paralela: blancas/negras, corcheas, tresillos y semicorcheas',
      ],
    },
    {
      id: 2,
      metal: 'Serie Plata',
      hex: '#F1F2F4',
      borderClass: 'border-silver/35 hover:border-silver/70',
      badgeClass: 'bg-white/10 text-silver border-silver/30',
      title: 'Volumen 2 · Intermedio',
      range: 'Expansión al registro medio-agudo (Hasta Sib₅ · 8.º parcial)',
      courses: '1.º a 4.º de Enseñanzas Profesionales',
      status: 'En preparación editorial',
      available: false,
      slug: `${waitlistBase}${encodeURIComponent('Lista de espera: Trombón Flexibilidad Volumen 2 · Plata')}`,
      ctaCatalog: 'Solicitar aviso de lanzamiento (Amazon KDP / Kindle)',
      ctaTrilogy: 'Unirse a la lista de espera (Vol. 2 · Plata)',
      specs: [
        'Dominio de los parciales 6.º, 7.º y 8.º y control del transpositor en Fa',
        'Intervalos quebrados, octavas ligadas y agilidad de columna de aire',
        'Estudios de concierto de dificultad intermedia con acompañamiento digital',
        'Edición optimizada para repertorio intermedio en el atril',
      ],
      trilogyHighlights: [
        'Nivel 1: Trabajo técnico hasta Lab₄ con incorporación de trinos',
        'Nivel 2: Consolidación hasta Sib₄ y trinos aplicados al registro medio-agudo',
        'Nivel 3: Extensión hasta Do₅ con trinos y control avanzado de la serie armónica',
        'Progresión rítmica paralela: blancas/negras, corcheas, tresillos y semicorcheas (con trinos como ampliación)',
      ],
    },
  ];
}

export function getVol1Syllabus(locale: SupportedLocale): SyllabusLevel[] {
  if (locale === 'de') {
    return [
      {
        level: 'Niveau 1 · 2. Ausbildungsjahr Elementarstufe',
        range: 'Grundlegende Naturtöne: 2. (B♭₂), 3. (F₃) und 4. (B♭₃)',
        qrRoot: '/e/v1-n1',
        summary:
          'Aufbau einer kontinuierlichen Luftsäule, nahtlose Lippenbindungen ohne Glottisschlag und präzise Koordination von Zug und Atmung in allen 7 Positionen.',
        blocks: [
          {
            code: 'v1-n1-l1',
            title: 'Block 1.1 · Einführung & Erste Töne',
            detail: '10 doppelte Spiegelübungen (Ganze und Halbe Noten) + Melodische Etüde Nr. 1.',
          },
          {
            code: 'v1-n1-l2',
            title: 'Block 1.2 · Hinführung zu Viertelnoten',
            detail: '10 doppelte Spiegelübungen im Viertelpuls + Melodische Etüde Nr. 2.',
          },
          {
            code: 'v1-n1-l3',
            title: 'Block 1.3 · Einführung von Achtelnoten',
            detail: '10 doppelte Geläufigkeitsübungen mit Achtelnoten + Melodische Etüde Nr. 3.',
          },
          {
            code: 'v1-n1-amp',
            title: 'Block 1.4 · Vertiefung: Triolen',
            detail: '10 fließende ternäre Subdivisionsübungen + Melodische Etüde Nr. 4.',
          },
        ],
      },
      {
        level: 'Niveau 2 · 3. Ausbildungsjahr Elementarstufe',
        range: 'Erweiterung zum 5. Naturton (D₄) & Kombinierte Intervalle',
        qrRoot: '/e/v1-n2',
        summary:
          'Einführung der oberen großen Terz der Naturtonreihe, Vokalisation (Oh → Ah → Eh) und bewusste Intonation des 5. Naturtons (-14 Cent).',
        blocks: [
          {
            code: 'v1-n2-l1',
            title: 'Block 2.1 · Viertelnoten (bis D₄)',
            detail: '10 doppelte Spiegelübungen unter Einbindung des 5. Naturtons + Melodische Etüde Nr. 5.',
          },
          {
            code: 'v1-n2-l2',
            title: 'Block 2.2 · Achtelbindungen (bis D₄)',
            detail: '10 doppelte Wellenbewegungsübungen in Achteln + Melodische Etüde Nr. 6.',
          },
          {
            code: 'v1-n2-l3',
            title: 'Block 2.3 · Triolische Geläufigkeit (bis D₄)',
            detail: '10 ternäre Doppelübungen in allen 7 Positionen + Melodische Etüde Nr. 7.',
          },
          {
            code: 'v1-n2-amp',
            title: 'Block 2.4 · Vertiefung: Sechzehntelnoten',
            detail: '10 Elastizitätsübungen mit kontrollierter Geschwindigkeit + Melodische Etüde Nr. 8.',
          },
        ],
      },
      {
        level: 'Niveau 3 · 4. Ausbildungsjahr Elementarstufe',
        range: 'Konsolidierung bis zum 6. Naturton (F₄) & Vorbereitung auf die Mittelstufe',
        qrRoot: '/e/v1-n3',
        summary:
          'Vollständige Beherrschung der mittleren bis hohen Oktave, komplette Arpeggien vom 2. bis zum 6. Naturton und musikalischer Ausdruck in Konzertetüden.',
        blocks: [
          {
            code: 'v1-n3-l1',
            title: 'Block 3.1 · Von Vierteln zu Achteln (bis F₄)',
            detail: '10 Doppelübungen bis zum 6. Naturton + Melodische Etüde Nr. 9.',
          },
          {
            code: 'v1-n3-l2',
            title: 'Block 3.2 · Triolen im oberen Mittelregister (bis F₄)',
            detail: '10 ternäre Flexibilitätsübungen bis F₄ + Melodische Etüde Nr. 10.',
          },
          {
            code: 'v1-n3-l3',
            title: 'Block 3.3 · Sechzehntel-Geläufigkeit (bis F₄)',
            detail: '10 fortgeschrittene Geläufigkeitsübungen + Melodische Etüde Nr. 11.',
          },
          {
            code: 'v1-n3-amp',
            title: 'Block 3.4 · Vertiefung: Abschließende Herausforderungen',
            detail: '10 Syntheseübungen zur Vorbereitung auf die Mittelstufe + Finale Konzertetüde Nr. 12.',
          },
        ],
      },
    ];
  }

  if (locale === 'it') {
    return [
      {
        level: 'Livello 1 · 2º Anno di Corsi Elementari',
        range: 'Armonici fondamentali: 2º (Sib₂), 3º (Fa₃) e 4º (Sib₃)',
        qrRoot: '/e/v1-n1',
        summary:
          'Sviluppo di una colonna d\'aria costante, legature labiali fluide senza colpi di glottide e sincronizzazione braccio-aria in tutte le 7 posizioni.',
        blocks: [
          {
            code: 'v1-n1-l1',
            title: 'Blocco 1.1 · Introduzione e Primi Suoni',
            detail: '10 esercizi doppi a specchio (semibrevi e minime) + Studio Melodico n. 1.',
          },
          {
            code: 'v1-n1-l2',
            title: 'Blocco 1.2 · Verso le semiminime',
            detail: '10 esercizi doppi a specchio a pulsazione regolare + Studio Melodico n. 2.',
          },
          {
            code: 'v1-n1-l3',
            title: 'Blocco 1.3 · Inserimento delle crome',
            detail: '10 esercizi doppi di agilità iniziale con crome + Studio Melodico n. 3.',
          },
          {
            code: 'v1-n1-amp',
            title: 'Blocco 1.4 · Approfondimento: Terzine',
            detail: '10 esercizi fluidi di suddivisione ternaria + Studio Melodico n. 4.',
          },
        ],
      },
      {
        level: 'Livello 2 · 3º Anno di Corsi Elementari',
        range: 'Espansione al 5º armonico (Re₄) e intervalli combinati',
        qrRoot: '/e/v1-n2',
        summary:
          'Introduzione della terza maggiore superiore della serie armonica, vocalizzazione interna (Oh → Ah → Eh) e intonazione consapevole del 5º armonico (-14 cent).',
        blocks: [
          {
            code: 'v1-n2-l1',
            title: 'Blocco 2.1 · Semiminime (fino a Re₄)',
            detail: '10 esercizi doppi a specchio con il 5º armonico + Studio Melodico n. 5.',
          },
          {
            code: 'v1-n2-l2',
            title: 'Blocco 2.2 · Legature in crome (fino a Re₄)',
            detail: '10 esercizi doppi di ondulazione armonica in crome + Studio Melodico n. 6.',
          },
          {
            code: 'v1-n2-l3',
            title: 'Blocco 2.3 · Agilità ternaria (fino a Re₄)',
            detail: '10 esercizi doppi ternari nelle 7 posizioni + Studio Melodico n. 7.',
          },
          {
            code: 'v1-n2-amp',
            title: 'Blocco 2.4 · Approfondimento: Semicrome',
            detail: '10 esercizi di elasticità a velocità controllata + Studio Melodico n. 8.',
          },
        ],
      },
      {
        level: 'Livello 3 · 4º Anno di Corsi Elementari',
        range: 'Consolidamento fino al 6º armonico (Fa₄) e preparazione ai Corsi Professionali',
        qrRoot: '/e/v1-n3',
        summary:
          'Padronanza completa dell\'ottava medio-alta elementare, arpeggi armonici completi dal 2º al 6º armonico e fraseggio musicale in studi da concerto.',
        blocks: [
          {
            code: 'v1-n3-l1',
            title: 'Blocco 3.1 · Da semiminime a crome (fino a Fa₄)',
            detail: '10 esercizi doppi fino al 6º armonico + Studio Melodico n. 9.',
          },
          {
            code: 'v1-n3-l2',
            title: 'Blocco 3.2 · Terzine nel registro medio-acuto (fino a Fa₄)',
            detail: '10 esercizi di flessibilità ternaria fino a Fa₄ + Studio Melodico n. 10.',
          },
          {
            code: 'v1-n3-l3',
            title: 'Blocco 3.3 · Fluidità in semicrome (fino a Fa₄)',
            detail: '10 esercizi avanzati di agilità elementare + Studio Melodico n. 11.',
          },
          {
            code: 'v1-n3-amp',
            title: 'Blocco 3.4 · Approfondimento: Sfide conclusive',
            detail: '10 esercizi di sintesi tecnica pre-professionale + Studio da Concerto Finale n. 12.',
          },
        ],
      },
    ];
  }

  if (locale === 'en') {
    return [
      {
        level: 'Level 1 · Year 2 Elementary Foundation',
        range: 'Essential partials: 2nd (Bb₂), 3rd (F₃), and 4th (Bb₃)',
        qrRoot: '/e/v1-n1',
        summary:
          'Establishing a continuous airstream, seamless lip connections without glottal stops, and synchronized arm-air timing across all 7 slide positions.',
        blocks: [
          {
            code: 'v1-n1-l1',
            title: 'Block 1.1 · Initiation & First Contact',
            detail: '10 double mirror exercises (whole & half notes) + Melodic Study No. 1.',
          },
          {
            code: 'v1-n1-l2',
            title: 'Block 1.2 · Moving Toward Quarter Notes',
            detail: '10 double mirror exercises on a steady quarter-note pulse + Melodic Study No. 2.',
          },
          {
            code: 'v1-n1-l3',
            title: 'Block 1.3 · Adding Eighth Notes',
            detail: '10 double agility exercises introducing eighth notes + Melodic Study No. 3.',
          },
          {
            code: 'v1-n1-amp',
            title: 'Block 1.4 · Extension: Triplets',
            detail: '10 fluid ternary subdivision exercises + Melodic Study No. 4.',
          },
        ],
      },
      {
        level: 'Level 2 · Year 3 Elementary Development',
        range: 'Expansion to the 5th partial (D₄) & combined intervals',
        qrRoot: '/e/v1-n2',
        summary:
          'Introducing the upper major third of the harmonic series, internal vowel shaping (Oh → Ah → Eh), and conscious tuning of the 5th partial (-14 cents).',
        blocks: [
          {
            code: 'v1-n2-l1',
            title: 'Block 2.1 · Quarter Notes (up to D₄)',
            detail: '10 double mirror exercises integrating the 5th partial + Melodic Study No. 5.',
          },
          {
            code: 'v1-n2-l2',
            title: 'Block 2.2 · Eighth-Note Slurs (up to D₄)',
            detail: '10 double harmonic undulation exercises in eighth notes + Melodic Study No. 6.',
          },
          {
            code: 'v1-n2-l3',
            title: 'Block 2.3 · Triplet Agility (up to D₄)',
            detail: '10 ternary double exercises across all 7 slide positions + Melodic Study No. 7.',
          },
          {
            code: 'v1-n2-amp',
            title: 'Block 2.4 · Extension: Sixteenth Notes',
            detail: '10 controlled-velocity elasticity drills + Melodic Study No. 8.',
          },
        ],
      },
      {
        level: 'Level 3 · Year 4 Elementary Consolidation',
        range: 'Consolidation up to the 6th partial (F₄) & Conservatory prep',
        qrRoot: '/e/v1-n3',
        summary:
          'Mastering the elementary mid-upper octave, full harmonic arpeggios from the 2nd to 6th partial, and musical phrasing in concert studies.',
        blocks: [
          {
            code: 'v1-n3-l1',
            title: 'Block 3.1 · Quarter to Eighth Notes (up to F₄)',
            detail: '10 double exercises reaching the 6th partial + Melodic Study No. 9.',
          },
          {
            code: 'v1-n3-l2',
            title: 'Block 3.2 · Triplets in the Upper-Middle Register',
            detail: '10 ternary flexibility exercises up to F₄ + Melodic Study No. 10.',
          },
          {
            code: 'v1-n3-l3',
            title: 'Block 3.3 · Sixteenth-Note Fluency (up to F₄)',
            detail: '10 advanced elementary agility drills + Melodic Study No. 11.',
          },
          {
            code: 'v1-n3-amp',
            title: 'Block 3.4 · Extension: Final Challenges',
            detail: '10 pre-intermediate synthesis drills + Final Concert Study No. 12.',
          },
        ],
      },
    ];
  }

  return [
    {
      level: 'Nivel 1 · 2.º Curso de Enseñanzas Elementales',
      range: 'Parciales esenciales: 2.º (Sib₂), 3.º (Fa₃) y 4.º (Sib₃)',
      qrRoot: '/e/v1-n1',
      summary:
        'Establecimiento de la columna de aire continua, conexión labial sin cortes y sincronización brazo-aire en las 7 posiciones.',
      blocks: [
        {
          code: 'v1-n1-l1',
          title: 'Bloque 1.1 · Iniciación y toma de contacto',
          detail: '10 ejercicios dobles en espejo (redondas y blancas) + Estudio Melódico n.º 1.',
        },
        {
          code: 'v1-n1-l2',
          title: 'Bloque 1.2 · Hacia las negras',
          detail: '10 ejercicios dobles en espejo con pulso de negra + Estudio Melódico n.º 2.',
        },
        {
          code: 'v1-n1-l3',
          title: 'Bloque 1.3 · Añadiendo corcheas',
          detail: '10 ejercicios dobles de agilidad inicial en corcheas + Estudio Melódico n.º 3.',
        },
        {
          code: 'v1-n1-amp',
          title: 'Bloque 1.4 · Ampliación: Tresillos',
          detail: 'Bloque de ampliación para diversidad y trabajo estival en subdivisión ternaria.',
        },
      ],
    },
    {
      level: 'Nivel 2 · 3.er Curso de Enseñanzas Elementales',
      range: 'Expansión al 5.º parcial (Re₄) e intervalos combinados',
      qrRoot: '/e/v1-n2',
      summary:
        'Incorporación de la tercera mayor superior de la serie armónica, vocalización interna (Oh → Ah → Eh) y afinación consciente del 5.º parcial (-14 cents).',
      blocks: [
        {
          code: 'v1-n2-l1',
          title: 'Bloque 2.1 · Hacia las negras (hasta Re₄)',
          detail: '10 ejercicios dobles integrando el 5.º parcial + Estudio Melódico n.º 5.',
        },
        {
          code: 'v1-n2-l2',
          title: 'Bloque 2.2 · Añadiendo corcheas (hasta Re₄)',
          detail: '10 ejercicios dobles de ondulación armónica en corcheas + Estudio Melódico n.º 6.',
        },
        {
          code: 'v1-n2-l3',
          title: 'Bloque 2.3 · Hacia los tresillos (hasta Re₄)',
          detail: '10 ejercicios dobles ternarios en las 7 posiciones + Estudio Melódico n.º 7.',
        },
        {
          code: 'v1-n2-amp',
          title: 'Bloque 2.4 · Ampliación: Semicorcheas',
          detail: 'Bloque de ampliación para diversidad y trabajo estival con velocidad controlada.',
        },
      ],
    },
    {
      level: 'Nivel 3 · 4.º Curso de Enseñanzas Elementales',
      range: 'Consolidación hasta el 6.º parcial (Fa₄) y preparación a Enseñanzas Profesionales',
      qrRoot: '/e/v1-n3',
      summary:
        'Dominio completo de la octava media-alta elemental, arpegios armónicos completos del 2.º al 6.º parcial y resistencia musical en estudios de concierto.',
      blocks: [
        {
          code: 'v1-n3-l1',
          title: 'Bloque 3.1 · De la negra a la corchea (hasta Fa₄)',
          detail: '10 ejercicios dobles alcanzando el 6.º parcial + Estudio Melódico n.º 9.',
        },
        {
          code: 'v1-n3-l2',
          title: 'Bloque 3.2 · Hacia los tresillos (hasta Fa₄)',
          detail: '10 ejercicios de flexibilidad ternaria en registro medio-agudo + Estudio Melódico n.º 10.',
        },
        {
          code: 'v1-n3-l3',
          title: 'Bloque 3.3 · Hacia las semicorcheas (hasta Fa₄)',
          detail: '10 ejercicios de agilidad avanzada elemental + Estudio Melódico n.º 11.',
        },
        {
          code: 'v1-n3-amp',
          title: 'Bloque 3.4 · Ampliación: Retos finales',
          detail: 'Bloque de ampliación para diversidad, trabajo estival y síntesis pre-profesional.',
        },
      ],
    },
  ];
}

export function getVol1Faqs(locale: SupportedLocale): EditorialFaq[] {
  if (locale === 'de') {
    return [
      {
        question: 'Wo und wann kann ich Band 1 zur Veröffentlichung erwerben?',
        answer:
          'Der offizielle Verkaufsstart auf Amazon KDP und Amazon Kindle ist für Mai–Juni 2027 geplant. Zu diesem Zeitpunkt ist «Posaune · Flexibilität · Band 1 (Elementarstufe)» exklusiv über Amazon in zwei offiziellen Formaten erhältlich: Gedrucktes Taschenbuch (Amazon KDP) und digitale Ausgabe (Amazon Kindle).',
      },
      {
        question: 'Wie wird die Notenschrift in der Amazon Kindle-Ausgabe dargestellt?',
        answer:
          'Die Amazon Kindle-Ausgabe wurde mit festem Seitenlayout direkt aus den hochauflösenden Druckdaten erstellt. Dies stellt sicher, dass Notensysteme, Bindungen und TromBot-Diagramme auf Tablets, iPads und Desktop-Geräten dieselbe Schärfe und Proportion wie im gedruckten Buch aufweisen.',
      },
      {
        question: 'Wie funktionieren die 15 QR-Codes in Buch und Kindle?',
        answer:
          'Jeder Lektionsblock und jede Stufe verfügt über einen permanenten QR-Code (/e/v1-n1-l1 bis /e/v1-n3-amp), der zu werbefreien HD-Videopartituren mit wählbaren didaktischen Untertiteln auf Deutsch, Englisch, Spanisch und Italienisch führt.',
      },
      {
        question: 'Warum sollte ich mein Exemplar unter javisaez.com/registro registrieren?',
        answer:
          'Die Registrierung Ihres Amazon-Exemplars unter javisaez.com/registro?lang=de ermöglicht direkten Zugriff auf Partitur-Updates, zusätzliche TromBot-KI-Übungsleitfäden und direkten Autorensupport.',
      },
    ];
  }

  if (locale === 'it') {
    return [
      {
        question: 'Dove e quando posso acquistare il Volume 1 al momento del lancio?',
        answer:
          'Il lancio ufficiale su Amazon KDP e Amazon Kindle è previsto per maggio–giugno 2027. In quel momento, «Trombone · Flessibilità · Volume 1 (Elementare)» sarà distribuito esclusivamente tramite Amazon in due formati ufficiali: Edizione Cartacea (Amazon KDP) ed Edizione Digitale (Amazon Kindle).',
      },
      {
        question: 'Come appaiono gli spartiti nell\'edizione Amazon Kindle?',
        answer:
          'L\'edizione per Amazon Kindle è impaginata con layout fisso ad alta definizione fedele al libro cartaceo. Ciò assicura che pentagrammi, legature e schemi di TromBot mantengano su iPad, tablet e computer la stessa identica nitidezza del libro stampato.',
      },
      {
        question: 'Come funzionano i 15 codici QR inclusi nel libro e in Kindle?',
        answer:
          'Ogni blocco didattico e ciascun livello include un codice QR univoco (/e/v1-n1-l1 fino a /e/v1-n3-amp) che collega direttamente a videopartiture interattive in alta definizione senza pubblicità, con sottotitoli didattici in italiano, spagnolo, inglese e tedesco.',
      },
      {
        question: 'Quali vantaggi offre la registrazione su javisaez.com/registro?',
        answer:
          'Registrando la tua copia di Amazon KDP o Kindle su javisaez.com/registro?lang=it ricevi accesso immediato agli aggiornamenti delle videopartiture, alle guide di studio integrative con TromBot e al supporto diretto dell\'autore.',
      },
    ];
  }

  if (locale === 'en') {
    return [
      {
        question: 'Where and when can I purchase Volume 1 at launch?',
        answer:
          'The official launch on Amazon KDP and Amazon Kindle is scheduled for May–June 2027. At that time, «Trombone · Flexibility · Volume 1 (Elementary)» will be distributed exclusively via Amazon in two official formats: Print Paperback (Amazon KDP) and Digital Edition (Amazon Kindle).',
      },
      {
        question: 'How is musical notation displayed in the Amazon Kindle edition?',
        answer:
          'The Amazon Kindle edition uses a fixed-layout high-definition format faithful to the printed book. This guarantees that staves, slurs, and TromBot diagrams preserve the exact proportions and crispness of the printed book on iPads, tablets, desktops, and the free Kindle app.',
      },
      {
        question: 'How do the 15 QR codes work in both Print and Kindle editions?',
        answer:
          'Each lesson block and level features a unique permanent QR code (/e/v1-n1-l1 through /e/v1-n3-amp) linking to reference audio recordings, solo metronome video-scores, and call-and-response video-scores with selectable subtitles (ES/EN/DE/IT).',
      },
      {
        question: 'Why should I register my Amazon copy at javisaez.com/registro?',
        answer:
          'Registering your Amazon KDP or Amazon Kindle copy at javisaez.com/registro?lang=en grants direct access to video-score updates, supplemental TromBot practice guides, and direct support from the author.',
      },
    ];
  }

  return [
    {
      question: '¿Dónde y cuándo se puede adquirir el Volumen 1 en el momento del lanzamiento?',
      answer:
        'El lanzamiento oficial en Amazon KDP y Amazon Kindle está previsto para mayo–junio de 2027. En ese momento, «Trombón · Flexibilidad · Volumen 1 (Elemental)» se distribuirá exclusivamente a través de Amazon en dos formatos oficiales: Edición Impresa en Tapa Blanda (Amazon KDP) y Edición Digital (Amazon Kindle).',
    },
    {
      question: '¿Cómo se ven las partituras en la edición de Amazon Kindle?',
      answer:
        'La edición para Amazon Kindle está maquetada en formato de diseño fijo de alta definición, fiel al libro impreso. Esto garantiza que los pentagramas, ligaduras y diagramas de TromBot mantengan exactamente la misma proporción, nitidez y paginación que el libro físico en tablets, iPad, ordenadores y dispositivos compatibles con la app gratuita de Kindle.',
    },
    {
      question: '¿Cómo funcionan los códigos QR incluidos en el libro impreso y en Kindle?',
      answer:
        'Cada bloque y nivel cuenta con un código QR único (/e/v1-n1-l1 hasta /e/v1-n3-amp) que da acceso a tres formatos multimedia: audios de ejemplo, videopartituras con metrónomo para estudio individual y videopartituras de pregunta-respuesta con el autor (subtítulos ES/EN/DE/IT).',
    },
    {
      question: '¿Qué ventajas tiene registrar mi ejemplar de Amazon en javisaez.com/registro?',
      answer:
        'Al registrar tu compra de Amazon KDP o Amazon Kindle en javisaez.com/registro recibes acceso directo a las actualizaciones de videopartituras, guías de estudio adicionales con TromBot y soporte directo del autor.',
    },
  ];
}
