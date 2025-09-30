export const buildGroups = (teams, { allowSameCountry } = {}) => {
  console.log("buildGroups recibió", teams.length, "equipos");
  console.log("allowSameCountry:", allowSameCountry);

  const groupNames = ["A", "B", "C", "D", "E", "F", "G", "H"];
  let groups = groupNames.map((id) => ({ id, teams: [] }));

  // Helper shuffle
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Caso 1: se permite mismo país
  if (allowSameCountry) {
    const shuffled = shuffle(teams);
    shuffled.forEach((team, i) => {
      const groupIndex = i % groups.length;
      groups[groupIndex].teams.push(team);
    });
  } else {
    // Caso 2: evitar mismo país
    const byCountry = {};
    teams.forEach((t) => {
      if (!byCountry[t.country]) byCountry[t.country] = [];
      byCountry[t.country].push(t);
    });

    // Warning si un país tiene más de 8 equipos
    for (const country in byCountry) {
      if (byCountry[country].length > groups.length) {
        console.warn(
          `⚠️ El país ${country} tiene ${byCountry[country].length} equipos, más que los grupos disponibles`
        );
      }
    }

    const countries = Object.keys(byCountry).sort(
      (a, b) => byCountry[b].length - byCountry[a].length
    );

    countries.forEach((c) => {
      byCountry[c] = shuffle(byCountry[c]);
    });

    countries.forEach((country) => {
      byCountry[country].forEach((team, idx) => {
        let placed = false;
        for (let offset = 0; offset < groups.length; offset++) {
          const groupIndex = (idx + offset) % groups.length;
          const group = groups[groupIndex];
          const hasSameCountry = group.teams.some((t) => t.country === country);
          if (!hasSameCountry) {
            group.teams.push(team);
            placed = true;
            break;
          }
        }
        if (!placed) {
          // si no hay grupo libre, lo metemos igual en el que tenga menos equipos
          const fallback = groups.reduce((min, g) =>
            g.teams.length < min.teams.length ? g : min
          );
          fallback.teams.push(team);
        }
      });
    });
  }

  // === Recorte final a 32 ===
  let allTeams = groups.flatMap((g) => g.teams);
  if (allTeams.length > 32) {
    allTeams = allTeams.slice(0, 32); // solo los primeros 32 tras el sorteo

    // Rearmar los grupos con esos 32
    groups = groupNames.map((id) => ({ id, teams: [] }));
    allTeams.forEach((team, i) => {
      const groupIndex = i % groups.length;
      groups[groupIndex].teams.push(team);
    });
  }

  return groups;
};
