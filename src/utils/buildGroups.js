export const buildGroups = (teams, { allowSameCountry } = {}) => {
  const GROUP_CAP = 4; // capacidad por grupo
  const groupNames = ["A", "B", "C", "D", "E", "F", "G", "H"];
  let groups = groupNames.map((id) => ({ id, teams: [] }));

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // índice del siguiente grupo con cupo TOTAL < GROUP_CAP
  const nextGroupWithSlot = (groups, startIndex = 0) => {
    for (let k = 0; k < groups.length; k++) {
      const idx = (startIndex + k) % groups.length;
      if (groups[idx].teams.length < GROUP_CAP) return idx;
    }
    return -1; // todos llenos
  };

  // --- Conteo por país y límites por país (regla de ≤16 => máx 2 por grupo) ---
  const byCountry = {};
  teams.forEach((t) => {
    if (!byCountry[t.country]) byCountry[t.country] = [];
    byCountry[t.country].push(t);
  });

  const countryCounts = Object.fromEntries(
    Object.entries(byCountry).map(([c, arr]) => [c, arr.length])
  );

  const countryCap = (country) =>
    countryCounts[country] <= 16 ? 2 : GROUP_CAP; // límite por grupo para ese país

  const canPlace = (group, team) => {
    if (group.teams.length >= GROUP_CAP) return false;
    const cap = countryCap(team.country);
    const countInGroup = group.teams.reduce(
      (acc, t) => acc + (t.country === team.country ? 1 : 0),
      0
    );
    return countInGroup < cap;
  };

  const nextGroupWithCountrySlot = (groups, team, startIndex = 0) => {
    for (let k = 0; k < groups.length; k++) {
      const idx = (startIndex + k) % groups.length;
      if (canPlace(groups[idx], team)) return idx;
    }
    return -1;
  };
  // ---------------------------------------------------------------------------

  // === Caso 1: se permite mismo país (pero con límite por país cuando ≤16) ===
  if (allowSameCountry) {
    const shuffled = shuffle(teams);
    for (let i = 0; i < shuffled.length; i++) {
      const start = i % groups.length;
      const idx = nextGroupWithCountrySlot(groups, shuffled[i], start);
      if (idx === -1) {
        // No hay ningún grupo con cupo total o de país
        break;
      }
      groups[idx].teams.push(shuffled[i]);
    }
  } else {
    // === Caso 2: intentar evitar mismo país (preferencia), pero respetar límite por país ===
    const countries = Object.keys(byCountry).sort(
      (a, b) => byCountry[b].length - byCountry[a].length
    );
    countries.forEach((c) => (byCountry[c] = shuffle(byCountry[c])));

    countries.forEach((country) => {
      byCountry[country].forEach((team, idxInCountry) => {
        let placed = false;

        // 1) Preferir grupos sin ese país y con cupo de país/total
        for (let offset = 0; offset < groups.length; offset++) {
          const groupIndex = (idxInCountry + offset) % groups.length;
          const group = groups[groupIndex];
          const hasSameCountry = group.teams.some((t) => t.country === country);
          if (!hasSameCountry && canPlace(group, team)) {
            group.teams.push(team);
            placed = true;
            break;
          }
        }

        // 2) Si no hay grupo "limpio", colocar en alguno que aún esté bajo el cap de país (≤2 si aplica)
        if (!placed) {
          let candidateIndex = -1;
          for (let offset = 0; offset < groups.length; offset++) {
            const groupIndex = (idxInCountry + offset) % groups.length;
            if (canPlace(groups[groupIndex], team)) {
              candidateIndex = groupIndex;
              break;
            }
          }
          if (candidateIndex !== -1) {
            groups[candidateIndex].teams.push(team);
            placed = true;
          }
        }

        // 3) Si no hay forma (todos llenos o violaría caps), frenamos (máx 32 equipos)
        if (!placed) {
          console.warn(
            "No hay grupos disponibles respetando los límites (cap 32)."
          );
          return;
        }
      });
    });
  }

  // Seguridad extra: nunca devolver más de 32 equipos en total
  let total = groups.reduce((acc, g) => acc + g.teams.length, 0);
  if (total > 32) {
    const all = groups.flatMap((g) => g.teams).slice(0, 32);
    groups = groupNames.map((id) => ({ id, teams: [] }));
    // Re-distribuir respetando cap de país y total (sin preferencia extra)
    for (let i = 0; i < all.length; i++) {
      const idx = nextGroupWithCountrySlot(groups, all[i], i % groups.length);
      if (idx === -1) break;
      groups[idx].teams.push(all[i]);
    }
  }

  groups = groups.map((g) => ({ ...g, teams: shuffle(g.teams) }));

  return groups;
};
