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
  console.log("[makeOnChangeCount] next:", next);
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
  console.log("[buildGlobal32] allTeams.len:", allTeams?.length);
  return shuffled.slice(0, 32);
};

const pickNRandom = (list, n) => {
  console.log("[pickNRandom] list.len:", list?.length, "n:", n);

  const shuffled = (Array.isArray(list) ? list : [])
    .map((t) => ({ sort: Math.random(), value: t }))
    .sort((a, b) => a.sort - b.sort)
    .map((el) => el.value);

  console.log("[pickNRandom] shuffled.len:", shuffled.length);

  const taken = shuffled.slice(
    0,
    Math.max(0, Math.min(n ?? 0, shuffled.length))
  );

  console.log("[pickNRandom] taken:", taken);
  console.log("[pickNRandom] taken.len:", taken.length);
  return taken;
};

export const buildPoolFromSelection = (selectedByCountry, byCountryTeams) => {
  console.group("buildPoolFromSelection()");
  console.log("selectedByCountry:", selectedByCountry);
  console.log("byCountryTeams keys:", Object.keys(byCountryTeams || {}));

  // 1) pares [clave, cfg]
  const entries = Object.entries(selectedByCountry || {});
  console.log("entries:", entries);

  // 2) filtrar países habilitados
  const active = entries.filter(([, cfg]) => cfg?.enabled);
  console.log(
    "active countries:",
    active.map(([k]) => k)
  );

  // 3) por cada país activo, mezclar su lista y tomar N
  const slices = active.map(([key, cfg]) => {
    const pool = byCountryTeams?.[key] || [];
    const n = Number(cfg?.count ?? 0);

    console.group(`→ ${key}`);
    console.log("requested n:", n, "available:", pool.length);

    if (!Array.isArray(pool) || pool.length === 0) {
      console.warn(`No hay equipos para el país ${key}`);
      console.groupEnd();
      return []; // devolvemos vacío para no romper
    }

    const toTake = Math.max(0, Math.min(n, pool.length)); // clamp
    console.log("toTake (clamped):", toTake);

    const taken = pickNRandom(pool, toTake);
    console.log("picked:", taken.length);
    console.groupEnd();
    return taken;
  });

  const flat = slices.flat();
  console.log("Flat:", flat);
  console.log("pool size:", flat.length);

  console.groupEnd();
  return flat; // pool sin normalizar a 32
};

export const normalizeTo32 = (pool) => {
  if (!Array.isArray(pool)) {
    return [];
  }

  if (pool.length > 32) {
    // 👇 NUEVO: si ya hay 16 ARG en el pool, preservalos
    const arg = pool.filter((t) => t.country === "ARG");
    const nonArg = pool.filter((t) => t.country !== "ARG");

    if (arg.length === 16 && nonArg.length >= 16) {
      // tomá 16 NO-ARG al azar y combiná con los 16 ARG
      const nonArg16 = pickNRandom(nonArg, 16);
      const combined = [...arg, ...nonArg16];
      console.log(
        "[normalizeTo32] preservo 16 ARG, tomo 16 NO-ARG →",
        combined.length
      );
      return combined;
    }

    // caso general (como lo tenías)
    const taken = pickNRandom(pool, 32);
    console.log("Returning size:", taken.length);
    return taken;
  }

  if (pool.length === 32) {
    console.log("Ya son 32 exactos, devuelvo tal cual");
    console.groupEnd();
    return pool;
  }

  if (pool.length < 32) {
    console.warn(
      `No hay suficientes equipos seleccionados (${pool.length}). Deben ser 32.`
    );
    console.groupEnd();

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

  // Si querés remezclar siempre antes de emparejar, activá la línea de abajo
  // const base = shuffle(pool);
  const base = pool; // por ahora, tal cual viene de normalizeTo32

  // Si después queremos “no mismo país”, lo resolvemos acá.
  // Por ahora: emparejado directo 0-1, 2-3, ...
  return base.reduce((acc, _, i, arr) => {
    if (i % 2 === 0 && arr[i + 1]) {
      acc.push({ id: acc.length + 1, home: arr[i], away: arr[i + 1] });
    }
    return acc;
  }, []);
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
    const swap = Math.random() < 0.5; // sorteo home/away
    return swap
      ? { id: i + 1, home: a, away: b }
      : { id: i + 1, home: b, away: a };
  });

  return matches;
}
