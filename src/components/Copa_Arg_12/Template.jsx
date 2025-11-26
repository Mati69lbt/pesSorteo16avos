// Plantilla Copa Argentina 2012 (IDs desde utils/teams.js)
export const COPA_ARG_2012_TEMPLATE = [
  // 1) Boca - X
  { homeId: 6, awayId: null }, // Boca Juniors - X
  // 2) Huracán - X
  { homeId: 12, awayId: null }, // Huracán - X
  // 3) Belgrano - Independiente
  { homeId: 5, awayId: 13 },
  // 4) Vélez - Rosario Central
  { homeId: 26, awayId: 19 },
  // 5) Tigre - Defensa y Justicia
  { homeId: 24, awayId: 8 },
  // 6) Gimnasia - Aldosivi
  { homeId: 10, awayId: 1 },
  // 7) Argentinos - San Martin de SJ
  { homeId: 2, awayId: 21 },
  // 8) Talleres - Colón
  { homeId: 23, awayId: 7 },
  // 9) Estudiantes - X
  { homeId: 9, awayId: null },
  // 10) River - X
  { homeId: 18, awayId: null },
  // 11) X - X
  { homeId: null, awayId: null },
  // 12) Lanús - X
  { homeId: 14, awayId: null },
  // 13) Unión - San Lorenzo
  { homeId: 25, awayId: 20 },
  // 14) Atlético Tucumán - Godoy Cruz
  { homeId: 3, awayId: 11 },
  // 15) Banfield - Patronato
  { homeId: 4, awayId: 16 },
  // 16) Newell's - Racing
  { homeId: 15, awayId: 17 },
];

export const COPA_ARG_2013_TEMPLATE = [
  // 1) River - X
  { homeId: 18, awayId: null }, // River Plate - X
  // 2) Tigre - Banfield
  { homeId: 24, awayId: 4 },
  // 3) Argentinos - Belgrano
  { homeId: 2, awayId: 5 },
  // 4) Talleres - Newell's
  { homeId: 23, awayId: 15 },
  // 5) Racing - Patronato
  { homeId: 17, awayId: 16 },
  // 6) Unión - X
  { homeId: 25, awayId: null },
  // 7) Lanús - X
  { homeId: 14, awayId: null },
  // 8) X - San Lorenzo
  { homeId: null, awayId: 20 },
  // 9) Estudiantes - Atlético Tucumán
  { homeId: 9, awayId: 3 },
  // 10) San Martín de Tucumán - San Martín de San Juan
  { homeId: 22, awayId: 21 },
  // 11) Rosario Central - X
  { homeId: 19, awayId: null },
  // 12) Gimnasia LP - Boca
  { homeId: 10, awayId: 6 },
  // 13) Independiente - X
  { homeId: 13, awayId: null },
  // 14) Colón - X
  { homeId: 7, awayId: null },
  // 15) Huracán - Godoy Cruz
  { homeId: 12, awayId: 11 },
  // 16) X - Vélez
  { homeId: null, awayId: 26 },
];

// Copa Argentina 2014
export const COPA_ARG_2014_TEMPLATE = [
  // 1) River - Atlético Tucuman
  { homeId: 18, awayId: 3 },

  // 2) Lanús - Colón
  { homeId: 14, awayId: 7 },

  // 3) Rosario Central - X
  { homeId: 19, awayId: null },

  // 4) Tigre - X
  { homeId: 24, awayId: null },

  // 5) Racing - San Martin de San Juan
  { homeId: 17, awayId: 21 },

  // 6) Gimnasia LP - Argentinos
  { homeId: 10, awayId: 2 },

  // 7) Vélez - X
  { homeId: 26, awayId: null },

  // 8) X - Patronato
  { homeId: null, awayId: 16 },

  // 9) San Lorenzo - X
  { homeId: 20, awayId: null },

  // 10) Godoy Cruz - Defensa y Justicia
  { homeId: 11, awayId: 8 },

  // 11) Newell's - Talleres
  { homeId: 15, awayId: 23 },

  // 12) X - X
  { homeId: null, awayId: null },

  // 13) Estudiantes - X
  { homeId: 9, awayId: null },

  // 14) Belgrano - Independiente
  { homeId: 5, awayId: 13 },

  // 15) Boca - Huracán
  { homeId: 6, awayId: 12 },

  // 16) Aldosivi - Banfield
  { homeId: 1, awayId: 4 },
];


const getSeededIds = (template) =>
  Array.from(
    new Set(
      template.flatMap((m) => [m.homeId, m.awayId]).filter((id) => id != null)
    )
  );

const getXCount = (template) =>
  template.reduce((acc, m) => {
    if (m.homeId == null) acc++;
    if (m.awayId == null) acc++;
    return acc;
  }, 0);

export const CUP_PRESETS = {
  "copa-arg-2012": {
    label: "Copa Argentina 2012",
    template: COPA_ARG_2012_TEMPLATE,
    seededIds: getSeededIds(COPA_ARG_2012_TEMPLATE),
    xCount: getXCount(COPA_ARG_2012_TEMPLATE),
  },
  "copa-arg-2013": {
    label: "Copa Argentina 2013",
    template: COPA_ARG_2013_TEMPLATE,
    seededIds: getSeededIds(COPA_ARG_2013_TEMPLATE),
    xCount: getXCount(COPA_ARG_2013_TEMPLATE),
  },
  "copa-arg-2014": {
    label: "Copa Argentina 2014",
    template: COPA_ARG_2014_TEMPLATE,
    seededIds: getSeededIds(COPA_ARG_2014_TEMPLATE),
    xCount: getXCount(COPA_ARG_2014_TEMPLATE),
  },
};


