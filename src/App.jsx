// cspell:ignore colombia bras chile otros brasil emparejamientos Notiflix notiflix
import React, { useMemo, useState } from "react";
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

  console.log(totalSelected);

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
      const basePool = globalMode
        ? buildGlobal32(teams)
        : buildPoolFromSelection(selectedByCountry, byCountryTeams);

      const pool32 = normalizeTo32(basePool);
      if (!pool32.length) {
        Notiflix.Notify.warning("Debes seleccionar 32 equipos.");
        return;
      }

      if (Formato === "16avos") {
        // === ELIMINACIÓN DIRECTA ===
        let result = pairArgOnePerMatchIfPossible(pool32);
        if (!result) {
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
      if (Formato === "Grupos") {
        // === FASE DE GRUPOS ===
        const grupos = buildGroups(basePool, { allowSameCountry });
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
          <p className="mt-1 text-sm text-slate-600">Version 29/09</p>
        </header>

        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              Configuración del sorteo
            </h2>
            <select
              name=""
              id=""
              className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:ring-2 focus:ring-slate-500"
              onChange={(e) => setFormato(e.target.value)}
            >
              <option value="">Formato</option>
              <option value="16avos">16avos</option>
              <option value="Grupos">Grupos</option>
            </select>
          </div>
          {/* Controles globales */}
          <div className="px-6 pt-4 pb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
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
                Sortear todos al azar
                <span className="text-slate-500">
                  {" "}
                  ({teams.length} equipos)
                </span>
              </span>
            </label>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!allowSameCountry} // invertido
                  onChange={(e) => setAllowSameCountry(!e.target.checked)}
                />
                <span className="text-sm text-slate-800">
                  Evitar cruces del mismo país
                </span>
              </label>
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
          />
        )}
        {Formato === "Grupos" && (
          <Groups
            groups={groups}
            getCountryBg={getCountryBg}
            countryCounts={countryCounts}
          />
        )}
      </div>
    </main>
  );
}

export default App;
