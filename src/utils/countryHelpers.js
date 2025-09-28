export const asSelectValue = (count, total) =>
  count === total ? "Todos" : String(count);

export const parseCount = (val, total) =>
  val === "Todos" ? total : Number(val ?? 0);

export const buildOptions = (total, allowed) => [
  "Todos",
  ...allowed.filter((n) => n <= total),
];

export const makeToggle =
  (setCountry, getDefaultCount = () => 0) =>
  (e) => {
    const checked = e.target.checked;
    setCountry((prev) => ({
      ...prev,
      enabled: checked,
      count: checked ? getDefaultCount() : 0,
    }));
  };

export const makeOnChangeCount = (setCountry, total) => (e) => {
  const next = parseCount(e.target.value, total);
  setCountry((prev) => ({ ...prev, count: next }));
};

export const buildGlobal32 = (allTeams) => {
  if (!Array.isArray(allTeams))
    throw new Error("buildGlobal32: se esperaba un array");
  if (allTeams.length < 32)
    throw new Error(
      `buildGlobal32: se requieren ≥32 equipos, hay ${allTeams.length}`
    );
  const shuffled = allTeams
    .map((t) => ({ sort: Math.random(), value: t }))
    .sort((a, b) => a.sort - b.sort)
    .map((el) => el.value);
  return shuffled.slice(0, 32);
};

const pickNRandom = (list, n) => {
  const shuffled = (Array.isArray(list) ? list : [])
    .map((t) => ({ sort: Math.random(), value: t }))
    .sort((a, b) => a.sort - b.sort)
    .map((el) => el.value);

  const taken = shuffled.slice(
    0,
    Math.max(0, Math.min(n ?? 0, shuffled.length))
  );

  return taken;
};

export const buildPoolFromSelection = (selectedByCountry, byCountryTeams) => {
  const entries = Object.entries(selectedByCountry || {});

  const active = entries.filter(([, cfg]) => cfg?.enabled);

  // 3) por cada país activo, mezclar su lista y tomar N
  const slices = active.map(([key, cfg]) => {
    const pool = byCountryTeams?.[key] || [];
    const n = Number(cfg?.count ?? 0);

    if (!Array.isArray(pool) || pool.length === 0) {
      console.warn(`No hay equipos para el país ${key}`);
      return []; // devolvemos vacío para no romper
    }
    const toTake = Math.max(0, Math.min(n, pool.length)); // clamp

    const taken = pickNRandom(pool, toTake);

    return taken;
  });

  const flat = slices.flat();

  return flat; // pool sin normalizar a 32
};

export const normalizeTo32 = (pool) => {
  if (!Array.isArray(pool)) {
    return [];
  }

  if (pool.length > 32) {
    const arg = pool.filter((t) => t.country === "ARG");
    const nonArg = pool.filter((t) => t.country !== "ARG");

    if (arg.length === 16 && nonArg.length >= 16) {
      const nonArg16 = pickNRandom(nonArg, 16);
      const combined = [...arg, ...nonArg16];

      return combined;
    }

    // caso general (como lo tenías)
    const taken = pickNRandom(pool, 32);

    return taken;
  }

  if (pool.length === 32) {
    return pool;
  }

  if (pool.length < 32) {
    console.warn(
      `No hay suficientes equipos seleccionados (${pool.length}). Deben ser 32.`
    );

    return [];
  }

  return pool;
};

const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const drawMatches = (
  pool,
  { allowSameCountry } = { allowSameCountry: true }
) => {
  if (!Array.isArray(pool) || pool.length < 2) return [];

  const pairSequential = (arr) =>
    arr.reduce((acc, _, i, a) => {
      if (i % 2 === 0 && a[i + 1]) {
        acc.push({ id: acc.length + 1, home: a[i], away: a[i + 1] });
      }
      return acc;
    }, []);

  const N = pool.length;
  const tries = 400;

  // Caso simple: se permite mismo país → emparejado directo sobre un shuffle
  if (allowSameCountry) {
    return pairSequential(shuffle(pool));
  }

  // Evitar mismo país: greedy con reintentos + swaps locales
  for (let t = 0; t < tries; t++) {
    const a = shuffle(pool);
    const matches = [];
    let ok = true;

    for (let i = 0; i < N; i += 2) {
      let t1 = a[i],
        t2 = a[i + 1];
      if (!t2) {
        ok = false;
        break;
      }

      if (t1.country === t2.country) {
        // buscar candidato distinto a partir de i+2
        let j = i + 2;
        while (j < N && a[j].country === t1.country) j++;
        if (j < N) {
          // swap con el candidato
          [a[i + 1], a[j]] = [a[j], a[i + 1]];
          t2 = a[i + 1];
        } else {
          ok = false; // este shuffle no sirve
          break;
        }
      }

      matches.push({ id: matches.length + 1, home: t1, away: t2 });
    }

    if (ok) return matches;
  }

  // Último recurso: si no encuentra configuración válida, permitir cruces
  return pairSequential(shuffle(pool));
};

export function pairArgOnePerMatchIfPossible(pool32) {
  if (!Array.isArray(pool32) || pool32.length !== 32) return null;

  const argentinos = pool32.filter((t) => t.country === "ARG");
  const otros = pool32.filter((t) => t.country !== "ARG");
  if (argentinos.length !== 16 || otros.length !== 16) return null;

  const A = shuffle(argentinos);
  const B = shuffle(otros);

  const matches = Array.from({ length: 16 }, (_, i) => {
    const a = A[i],
      b = B[i];
    const swap = Math.random() < 0.5;
    return swap
      ? { id: i + 1, home: a, away: b }
      : { id: i + 1, home: b, away: a };
  });

  return matches;
}

// countryHelpers.js
export const getCountryBg = (c) => {
  switch (c) {
    case "ARG":
      return "bg-blue-50";
    case "BRA":
      return "bg-green-50";
    case "CHI":
      return "bg-red-50";
    case "COL":
      return "bg-yellow-50";
    default:
      return "bg-slate-50";
  }
};
