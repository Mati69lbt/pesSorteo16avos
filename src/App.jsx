// cspell:ignore colombia bras chile otros brasil emparejamientos Notiflix notiflix
import React, { useEffect, useMemo, useRef, useState } from "react";
import { teams } from "./utils/teams";
import Notiflix from "notiflix";
import CountryRow from "./components/CountryRow";
import {
  asSelectValue,
  buildGlobal32,
  buildOptions,
  buildPoolFromSelection,
  drawMatches,
  getCountryBg,
  makeOnChangeCount,
  makeToggle,
  normalizeTo32,
  pairArgOnePerMatchIfPossible,
} from "./utils/countryHelpers";
import Elimination from "./components/Elimination";
import Groups from "./components/Groups";
import { buildGroups } from "./utils/buildGroups";
import { CUP_PRESETS } from "./components/Copa_Arg_12/Template";

function App() {
  const [argentina, setArgentina] = useState({ enabled: false, count: 0 });
  const [brasil, setBrasil] = useState({ enabled: false, count: 0 });
  const [chile, setChile] = useState({ enabled: false, count: 0 });
  const [colombia, setColombia] = useState({ enabled: false, count: 0 });
  const [otros, setOtros] = useState({ enabled: false, count: 0 });

  const [globalMode, setGlobalMode] = useState(false);

  const [allowSameCountry, setAllowSameCountry] = useState(true);
  const [matches, setMatches] = useState([]);

  const [Formato, setFormato] = useState("16avos" || "Grupos");
  const [groups, setGroups] = useState([]);

  /***********BOCA************/

  const [mustIncludeBJ, setMustIncludeBJ] = useState(false);
  const bocaMatchRef = useRef(null);

  /***********BOCA************/

  // Para Copa Argentina
  const [preset, setPreset] = useState("none");
  const [xAssignments, setXAssignments] = useState([]);

  const selectedPresetConfig = useMemo(
    () => (preset !== "none" ? CUP_PRESETS[preset] ?? null : null),
    [preset]
  );

  const handleModeChange = (e) => {
    const value = e.target.value;
    if (!value) {
      setFormato("");
      setPreset("none");
      setMatches([]);
      setGroups([]);
      setXAssignments([]);
      return;
    }

    const [fmt, presetKey] = value.split("|");
    setFormato(fmt);
    setPreset(presetKey || "none");
    setMatches([]);
    setGroups([]);
    setXAssignments([]);
  };

  const ARG_TOTAL = teams.filter((t) => t.country === "ARG").length;
  const BRA_TOTAL = teams.filter((t) => t.country === "BRA").length;
  const CHI_TOTAL = teams.filter((t) => t.country === "CHI").length;
  const COL_TOTAL = teams.filter((t) => t.country === "COL").length;
  const OTROS_TOTAL = teams.filter((t) => t.country === "Otros").length;

  const onToggleArgentina = makeToggle(setArgentina, () => ARG_TOTAL);
  const onToggleBrasil = makeToggle(setBrasil, () => BRA_TOTAL);
  const onToggleChile = makeToggle(setChile, () => CHI_TOTAL);
  const onToggleColombia = makeToggle(setColombia, () => COL_TOTAL);
  const onToggleOtros = makeToggle(setOtros, () => OTROS_TOTAL);

  const argOptions = buildOptions(ARG_TOTAL, [20, 16, 12, 10, 8, 6]);
  const braOptions = buildOptions(BRA_TOTAL, [10, 8, 6]);
  const chiOptions = buildOptions(CHI_TOTAL, [10, 8, 6]);
  const colOptions = buildOptions(COL_TOTAL, [10, 8, 6]);
  const otrosOptions = buildOptions(OTROS_TOTAL, [6]);

  const onChangeArgentinaCount = makeOnChangeCount(setArgentina, ARG_TOTAL);
  const onChangeBrasilCount = makeOnChangeCount(setBrasil, BRA_TOTAL);
  const onChangeChileCount = makeOnChangeCount(setChile, CHI_TOTAL);
  const onChangeColombiaCount = makeOnChangeCount(setColombia, COL_TOTAL);
  const onChangeOtrosCount = makeOnChangeCount(setOtros, OTROS_TOTAL);

  const totalSelected = globalMode
    ? teams.length // todos los equipos
    : (argentina.enabled ? argentina.count : 0) +
      (brasil.enabled ? brasil.count : 0) +
      (chile.enabled ? chile.count : 0) +
      (colombia.enabled ? colombia.count : 0) +
      (otros.enabled ? otros.count : 0);

  const selectedByCountry = {
    ARG: argentina, // { enabled, count }
    BRA: brasil, // idem
    CHI: chile,
    COL: colombia,
    Otros: otros,
  };

  const byCountryTeams = useMemo(
    () => ({
      ARG: teams.filter((t) => t.country === "ARG"),
      BRA: teams.filter((t) => t.country === "BRA"),
      CHI: teams.filter((t) => t.country === "CHI"),
      COL: teams.filter((t) => t.country === "COL"),
      Otros: teams.filter((t) => t.country === "Otros"),
    }),
    []
  );

  Notiflix.Loading.init({
    clickToClose: false,
    svgSize: "72px",
    messageFontSize: "14px",
  });

  const handleSortear = () => {
    Notiflix.Loading.circle("Sorteando…");
    try {
      if (!Formato) {
        Notiflix.Notify.failure("Elegí un formato de sorteo primero.");
        return;
      }
      // --- Helpers locales para garantizar inclusión de Boca ---
      const bocaTeam = teams.find((t) => t.id === 6);

      const shuffle = (arr) => {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      };

      const ensureInclude = (pool, team) => {
        if (!team) return pool;
        return pool.some((t) => t.id === team.id) ? pool : [team, ...pool];
      };

      const capToNEnsuring = (pool, team, n) => {
        const withTeam = ensureInclude(pool, team);
        if (withTeam.length <= n) return withTeam;
        const others = withTeam.filter((t) => t.id !== team.id);
        const picked = shuffle(others).slice(0, Math.max(0, n - 1));
        return [team, ...picked];
      };
      // ----------------------------------------------------------

      // --- MODO COPA ARGENTINA 2012 (llaves fijas + X sorteadas) ---
      if (Formato === "16avos" && selectedPresetConfig) {
        const { template, seededIds, xCount } = selectedPresetConfig;

        // Todos los equipos que NO están fijos en la plantilla
        const restantes = teams.filter((t) => !seededIds.includes(t.id));

        if (restantes.length < xCount) {
          Notiflix.Notify.failure(
            "No hay suficientes equipos para completar las plazas X."
          );
          return;
        }

        // Tomamos al azar tantos equipos como X haya
        let bolsaX = shuffle(restantes).slice(0, xCount);

        const nuevosMatches = [];
        const nuevasX = [];

        template.forEach((tpl, idx) => {
          let homeTeam;
          let awayTeam;

          if (tpl.homeId != null) {
            homeTeam = teams.find((t) => t.id === tpl.homeId);
          } else {
            const teamX = bolsaX.shift();
            homeTeam = teamX;
            nuevasX.push({
              match: idx + 1,
              side: "Local",
              team: teamX,
            });
          }

          if (tpl.awayId != null) {
            awayTeam = teams.find((t) => t.id === tpl.awayId);
          } else {
            const teamX = bolsaX.shift();
            awayTeam = teamX;
            nuevasX.push({
              match: idx + 1,
              side: "Visitante",
              team: teamX,
            });
          }

          nuevosMatches.push({
            id: idx + 1,
            home: homeTeam,
            away: awayTeam,
          });
        });

        setMatches(nuevosMatches);
        setGroups([]);
        setXAssignments(nuevasX);
        return; // no seguimos con el sorteo normal
      }

      // --- A PARTIR DE ACÁ, tu lógica normal de sorteo (global / por países) ---
      setXAssignments([]); // en sorteo normal no hay X especiales

      // ----------------------------------------------------------

      // 1) Construir el pool base según el modo
      const basePoolRaw = globalMode
        ? buildGlobal32(teams)
        : buildPoolFromSelection(selectedByCountry, byCountryTeams);

      // 2) Si el checkbox está activo, garantizar que Boca esté en el pool
      const basePool = mustIncludeBJ
        ? ensureInclude(basePoolRaw, bocaTeam)
        : basePoolRaw;

      // === ELIMINACIÓN DIRECTA (16avos) ===
      if (Formato === "16avos") {
        // 3) Normalizar a 32
        let pool32 = normalizeTo32(basePool);

        // 4) Si en la normalización se perdió a Boca, recortar preservándolo
        if (
          mustIncludeBJ &&
          (!Array.isArray(pool32) || !pool32.some((t) => t.id === 6))
        ) {
          pool32 = capToNEnsuring(basePool, bocaTeam, 32);
        }

        if (!Array.isArray(pool32) || pool32.length !== 32) {
          Notiflix.Notify.warning("Debes seleccionar 32 equipos.");
          setMatches([]);
          setGroups([]);
          return;
        }

        // Intento de emparejar con 1 ARG por partido si es posible
        let result = pairArgOnePerMatchIfPossible(pool32);
        if (!result) {
          // Fallback al sorteo estándar
          result = drawMatches(pool32, { allowSameCountry });
        }

        setMatches(result);
        setGroups([]);

        const hasSameCountry =
          Array.isArray(result) &&
          result.some((m) => m.home.country === m.away.country);

        if (!allowSameCountry && hasSameCountry) {
          Notiflix.Notify.warning(
            "No fue posible evitar todos los cruces del mismo país."
          );
        }
      }

      // === FASE DE GRUPOS ===
      if (Formato === "Grupos") {
        // Si hay más de 32, recortar antes preservando Boca
        const poolForGroups =
          mustIncludeBJ && basePool.length > 32
            ? capToNEnsuring(basePool, bocaTeam, 32)
            : basePool;

        const grupos = buildGroups(poolForGroups, { allowSameCountry });
        setGroups(grupos);
        setMatches([]);
        return;
      }
    } catch (e) {
      console.error(e);
      Notiflix.Notify.failure("Ocurrió un error durante el sorteo.");
    } finally {
      Notiflix.Loading.remove();
    }
  };

  const canSort = globalMode || totalSelected > 0;

  const handleLimpiar = () => {
    setArgentina({ enabled: false, count: 0 });
    setBrasil({ enabled: false, count: 0 });
    setChile({ enabled: false, count: 0 });
    setColombia({ enabled: false, count: 0 });
    setOtros({ enabled: false, count: 0 });
    setGlobalMode(false);
    setAllowSameCountry(true);
    setMatches([]);
    setGroups([]);
    setPreset("none");
    setXAssignments([]);
  };

  const countryCounts = React.useMemo(() => {
    let allTeams = [];

    if (Formato === "16avos" && Array.isArray(matches) && matches.length > 0) {
      allTeams = matches.flatMap((m) => [m.home, m.away]);
    }

    if (Formato === "Grupos" && Array.isArray(groups) && groups.length > 0) {
      allTeams = groups.flatMap((g) => g.teams);
    }

    const acc = { ARG: 0, BRA: 0, CHI: 0, COL: 0, Otros: 0 };
    allTeams.forEach((t) => {
      const key = acc.hasOwnProperty(t.country) ? t.country : "Otros";
      acc[key] = (acc[key] || 0) + 1;
    });
    return { ...acc, total: allTeams.length };
  }, [Formato, matches, groups]);

  useEffect(() => {
    if (!mustIncludeBJ) return;

    // 16avos: necesitamos 32 equipos (16 partidos)
    if (Formato === "16avos") {
      if (!Array.isArray(matches) || matches.length === 0) return;
      const totalTeams = matches.length * 2;
      if (totalTeams !== 32) return;
    }

    // Grupos: con que haya grupos ya alcanza
    if (Formato === "Grupos") {
      if (!Array.isArray(groups) || groups.length === 0) return;
    }

    if (bocaMatchRef.current) {
      bocaMatchRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [matches, groups, mustIncludeBJ, Formato]);

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-3xl px-4">
        <header className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            🎮 Sorteo PES 2019 ⚽
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Elegí países y cuántos equipos tomar de cada uno.
          </p>
          <p className="mt-1 text-sm text-slate-600">Version 30/09</p>
        </header>

        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              Configuración del sorteo
            </h2>

            <select
              className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:ring-2 focus:ring-slate-500"
              value={Formato ? `${Formato}|${preset}` : ""}
              onChange={handleModeChange}
            >
              <option value="">Seleccionar formato</option>
              {/* 16avos libre */}
              <option value="16avos|none">16avos</option>

              {/* Grupos sin plantilla */}
              <option value="Grupos|none">Fase de grupos</option>

              {/* Copas Argentina, se agregan solas leyendo CUP_PRESETS */}
              <option value="16avos|copa-arg-2012">Copa Argentina 2012</option>
              <option value="16avos|copa-arg-2013">Copa Argentina 2013</option>
              <option value="16avos|copa-arg-2014">Copa Argentina 2014</option>
              <option value="16avos|copa-arg-2015">Copa Argentina 2015</option>
              <option value="16avos|copa-arg-2016">Copa Argentina 2016</option>
              <option value="16avos|copa-arg-2017">Copa Argentina 2017</option>
              <option value="16avos|copa-arg-2018">Copa Argentina 2018</option>
              <option value="16avos|copa-arg-2019">Copa Argentina 2019</option>
              <option value="16avos|copa-arg-2020">Copa Argentina 2020</option>
              <option value="16avos|copa-arg-2022">Copa Argentina 2022</option>
              <option value="16avos|copa-arg-2023">Copa Argentina 2023</option>
              <option value="16avos|copa-arg-2024">Copa Argentina 2024</option>
              <option value="16avos|copa-arg-2025">Copa Argentina 2025</option>
            </select>

            {Formato === "16avos" && preset !== "none" && (
              <p className="mt-1 text-xs text-slate-500">
                Se fijan los cruces según la copa elegida; solo se sortean las
                plazas marcadas como &quot;X&quot;.
              </p>
            )}
          </div>
          {/* Controles globales */}
          <div className="px-6 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Global random */}
              <label
                className="inline-flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50 transition"
                title="Sortea de toda la lista"
              >
                <input
                  type="checkbox"
                  className="size-4 accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  checked={globalMode}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setGlobalMode(checked);
                    if (checked) {
                      // desactivar todos los países
                      setArgentina({ ...argentina, enabled: false });
                      setBrasil({ ...brasil, enabled: false });
                      setChile({ ...chile, enabled: false });
                      setColombia({ ...colombia, enabled: false });
                      setOtros({ ...otros, enabled: false });
                    }
                  }}
                />
                <span className="text-sm text-slate-800">
                  Sortear todos al azar{" "}
                  <span className="text-xs text-slate-500 align-middle">
                    ({teams.length} equipos)
                  </span>
                </span>
              </label>

              {/* Right controls */}
              <div className="flex flex-wrap items-center gap-3">
                <label
                  className="inline-flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50 transition"
                  title="Evita que coincidan clubes del mismo país"
                >
                  <input
                    type="checkbox"
                    className="size-4 accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    checked={!allowSameCountry} // invertido
                    onChange={(e) => setAllowSameCountry(!e.target.checked)}
                  />
                  <span className="text-sm text-slate-800">
                    Evitar cruces del mismo país
                  </span>
                </label>

                <label
                  className="inline-flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50 transition"
                  title="Forzar inclusión de Boca Juniors"
                >
                  <input
                    type="checkbox"
                    className="size-4 accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    checked={mustIncludeBJ}
                    onChange={(e) => setMustIncludeBJ(e.target.checked)}
                  />
                  <span className="text-sm text-slate-800">Jugar con BJ</span>
                </label>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            <CountryRow
              label="Argentina"
              total={ARG_TOTAL}
              enabled={argentina.enabled}
              value={asSelectValue(argentina.count, ARG_TOTAL)}
              options={argOptions}
              onToggle={onToggleArgentina}
              onChange={onChangeArgentinaCount}
              disabled={globalMode}
            />

            <CountryRow
              label="Brasil"
              total={BRA_TOTAL}
              enabled={brasil.enabled}
              value={asSelectValue(brasil.count, BRA_TOTAL)}
              options={braOptions}
              onToggle={onToggleBrasil}
              onChange={onChangeBrasilCount}
              disabled={globalMode}
            />

            <CountryRow
              label="Chile"
              total={CHI_TOTAL}
              enabled={chile.enabled}
              value={asSelectValue(chile.count, CHI_TOTAL)}
              options={chiOptions}
              onToggle={onToggleChile}
              onChange={onChangeChileCount}
              disabled={globalMode}
            />

            <CountryRow
              label="Colombia"
              total={COL_TOTAL}
              enabled={colombia.enabled}
              value={asSelectValue(colombia.count, COL_TOTAL)}
              options={colOptions}
              onToggle={onToggleColombia}
              onChange={onChangeColombiaCount}
              disabled={globalMode}
            />

            <CountryRow
              label="Otros"
              total={OTROS_TOTAL}
              enabled={otros.enabled}
              value={asSelectValue(otros.count, OTROS_TOTAL)}
              options={otrosOptions}
              onToggle={onToggleOtros}
              onChange={onChangeOtrosCount}
              disabled={globalMode}
            />
          </div>
          <p className="text-sm text-slate-600 mt-2 ml-6">
            Seleccionados: {totalSelected} / 32
          </p>

          <div className="flex justify-end gap-3 px-6 py-4">
            <button
              onClick={handleLimpiar}
              type="button"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Limpiar
            </button>

            <button
              type="button"
              onClick={handleSortear}
              disabled={!canSort}
              className={`rounded-xl px-4 py-2 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 ${
                canSort
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
              }`}
            >
              Sortear
            </button>
          </div>
        </section>
        {Formato === "16avos" && (
          <Elimination
            matches={matches}
            countryCounts={countryCounts}
            getCountryBg={getCountryBg}
            focusTeamId={mustIncludeBJ ? 6 : null}
            focusRef={bocaMatchRef}
          />
        )}
        {Formato === "Grupos" && (
          <Groups
            groups={groups}
            getCountryBg={getCountryBg}
            countryCounts={countryCounts}
            focusTeamId={mustIncludeBJ ? 6 : null}
            focusRef={bocaMatchRef}
          />
        )}
        {Formato === "16avos" &&
          preset !== "none" &&
          xAssignments.length > 0 && (
            <section className="mt-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Equipos sorteados en plazas &quot;X&quot;
                {CUP_PRESETS[preset]?.label
                  ? ` – ${CUP_PRESETS[preset].label}`
                  : ""}
              </h2>
              <ul className="mt-2 text-sm text-slate-700 space-y-1">
                {xAssignments.map((x, idx) => (
                  <li key={idx}>
                    Partido {x.match} ({x.side}):{" "}
                    <span className="font-medium">{x.team.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
      </div>
    </main>
  );
}

export default App;
