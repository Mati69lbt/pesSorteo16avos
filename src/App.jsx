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

function App() {
  const [argentina, setArgentina] = useState({ enabled: false, count: 0 });
  const [brasil, setBrasil] = useState({ enabled: false, count: 0 });
  const [chile, setChile] = useState({ enabled: false, count: 0 });
  const [colombia, setColombia] = useState({ enabled: false, count: 0 });
  const [otros, setOtros] = useState({ enabled: false, count: 0 });

  const [globalMode, setGlobalMode] = useState(false);

  const [allowSameCountry, setAllowSameCountry] = useState(true);
  const [matches, setMatches] = useState([]);

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

  const totalSelected =
    (argentina.enabled ? argentina.count : 0) +
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

  // const handleSortear = () => {
  //   const basePool = globalMode
  //     ? buildGlobal32(teams)
  //     : buildPoolFromSelection(selectedByCountry, byCountryTeams);

  //   const pool32 = normalizeTo32(basePool);

  //   // —— nuevo: si hay 16 ARG, aplicamos la regla automática
  //   let result = pairArgOnePerMatchIfPossible(pool32);

  //   if (!result) {
  //     // si no se pudo 16/16, caemos al emparejado normal
  //     result = drawMatches(pool32, { allowSameCountry });
  //   }

  //   setMatches(result);
  // };

  const handleSortear = () => {
    Notiflix.Loading.circle("Sorteando…");
    try {
      const basePool = globalMode
        ? buildGlobal32(teams)
        : buildPoolFromSelection(selectedByCountry, byCountryTeams);

      const pool32 = normalizeTo32(basePool);

      // si hay 16 ARG, aplicamos la regla automática
      let result = pairArgOnePerMatchIfPossible(pool32);

      if (!result) {
        // si no se pudo 16/16, caemos al emparejado normal
        result = drawMatches(pool32, { allowSameCountry });
      }

      setMatches(result);

      // (opcional) avisar si no se pudieron evitar cruces del mismo país
      const hasSameCountry =
        Array.isArray(result) &&
        result.some((m) => m.home.country === m.away.country);

      if (!allowSameCountry && hasSameCountry) {
        Notiflix.Notify.warning(
          "No fue posible evitar todos los cruces del mismo país."
        );
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
    if (!Array.isArray(matches) || matches.length === 0) {
      return { ARG: 0, BRA: 0, CHI: 0, COL: 0, Otros: 0, total: 0 };
    }
    const allTeams = matches.flatMap((m) => [m.home, m.away]);
    const acc = { ARG: 0, BRA: 0, CHI: 0, COL: 0, Otros: 0 };
    allTeams.forEach((t) => {
      const key = acc.hasOwnProperty(t.country) ? t.country : "Otros";
      acc[key] = (acc[key] || 0) + 1;
    });
    return { ...acc, total: allTeams.length };
  }, [matches]);

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-3xl px-4">
        <header className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            🎮 Sorteo 16avos — PES 2019 ⚽
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Elegí países y cuántos equipos tomar de cada uno.
          </p>
        </header>

        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              Configuración del sorteo
            </h2>
          </div>
          {/* Controles globales */}
          <div className="px-6 pt-4 pb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={globalMode}
                onChange={(e) => setGlobalMode(e.target.checked)}
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
            />

            <CountryRow
              label="Brasil"
              total={BRA_TOTAL}
              enabled={brasil.enabled}
              value={asSelectValue(brasil.count, BRA_TOTAL)}
              options={braOptions}
              onToggle={onToggleBrasil}
              onChange={onChangeBrasilCount}
            />

            <CountryRow
              label="Chile"
              total={CHI_TOTAL}
              enabled={chile.enabled}
              value={asSelectValue(chile.count, CHI_TOTAL)}
              options={chiOptions}
              onToggle={onToggleChile}
              onChange={onChangeChileCount}
            />

            <CountryRow
              label="Colombia"
              total={COL_TOTAL}
              enabled={colombia.enabled}
              value={asSelectValue(colombia.count, COL_TOTAL)}
              options={colOptions}
              onToggle={onToggleColombia}
              onChange={onChangeColombiaCount}
            />

            <CountryRow
              label="Otros"
              total={OTROS_TOTAL}
              enabled={otros.enabled}
              value={asSelectValue(otros.count, OTROS_TOTAL)}
              options={otrosOptions}
              onToggle={onToggleOtros}
              onChange={onChangeOtrosCount}
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
        <section>
          {matches.length > 0 && (
            <>
              <h2 className="mt-6 mb-2 text-lg font-semibold">
                Emparejamientos
              </h2>
              <p className="text-xs text-slate-500 mb-2">
                Local/Visitante sorteado aleatoriamente.
              </p>

              {matches.length > 0 && (
                <div className="mb-3 -mt-1">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {[
                      { code: "ARG", label: "Argentina" },
                      { code: "BRA", label: "Brasil" },
                      { code: "CHI", label: "Chile" },
                      { code: "COL", label: "Colombia" },
                      { code: "Otros", label: "Otros" },
                    ].map(({ code, label }) => (
                      <div
                        key={code}
                        className={`shrink-0 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm border border-slate-200 ${getCountryBg(
                          code
                        )}`}
                        title={`${label}: ${countryCounts[code] || 0}`}
                      >
                        <span className="font-medium">{label}</span>
                        <span className="text-xs text-slate-600">
                          {countryCounts[code] || 0}
                        </span>
                      </div>
                    ))}

                    {/* total a la derecha */}
                    <div className="shrink-0 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm border border-slate-200 bg-slate-50 ml-2">
                      <span className="font-medium">Total</span>
                      <span className="text-xs text-slate-600">
                        {countryCounts.total}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* columna izquierda: 1–8 */}
                <div className="grid gap-2">
                  {matches.slice(0, 8).map((m, i) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2"
                    >
                      <strong className="w-7 text-right">#{i + 1}</strong>

                      {/* HOME */}
                      <div
                        className={`flex-1 flex flex-col items-center justify-center rounded-md px-2 py-1 ${getCountryBg(
                          m.home.country
                        )}`}
                      >
                        <span className="font-medium text-center">
                          {m.home.name}
                        </span>
                        <span className="text-xs text-slate-500 text-center">
                          {m.home.country}
                        </span>
                      </div>

                      <span className="font-bold mx-2">vs</span>

                      {/* AWAY */}
                      <div
                        className={`flex-1 flex flex-col items-center justify-center rounded-md px-2 py-1 ${getCountryBg(
                          m.away.country
                        )}`}
                      >
                        <span className="font-medium text-center">
                          {m.away.name}
                        </span>
                        <span className="text-xs text-slate-500 text-center">
                          {m.away.country}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* columna derecha: 9–16 */}
                <div className="grid gap-2">
                  {matches.slice(8, 16).map((m, i) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2"
                    >
                      <strong className="w-7 text-right">#{i + 9}</strong>

                      {/* HOME */}
                      <div
                        className={`flex-1 flex flex-col items-center justify-center rounded-md px-2 py-1 ${
                          m.home.country === "ARG"
                            ? "bg-blue-50"
                            : m.home.country === "BRA"
                            ? "bg-green-50"
                            : m.home.country === "CHI"
                            ? "bg-red-50"
                            : m.home.country === "COL"
                            ? "bg-yellow-50"
                            : "bg-slate-50"
                        }`}
                      >
                        <span className="font-medium text-center">
                          {m.home.name}
                        </span>
                        <span className="text-xs text-slate-500 text-center">
                          {m.home.country}
                        </span>
                      </div>

                      <span className="font-bold mx-2">vs</span>

                      {/* AWAY */}
                      <div
                        className={`flex-1 flex flex-col items-center justify-center rounded-md px-2 py-1 ${
                          m.away.country === "ARG"
                            ? "bg-blue-50"
                            : m.away.country === "BRA"
                            ? "bg-green-50"
                            : m.away.country === "CHI"
                            ? "bg-red-50"
                            : m.away.country === "COL"
                            ? "bg-yellow-50"
                            : "bg-slate-50"
                        }`}
                      >
                        <span className="font-medium text-center">
                          {m.away.name}
                        </span>
                        <span className="text-xs text-slate-500 text-center">
                          {m.away.country}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
