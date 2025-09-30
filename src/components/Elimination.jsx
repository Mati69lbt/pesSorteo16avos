import React from "react";

const Elimination = ({ matches, getCountryBg, countryCounts }) => {
  return (
    <div>
      {" "}
      <section>
        {matches.length > 0 && (
          <>
            <h2 className="mt-6 mb-2 text-lg font-semibold">Emparejamientos</h2>
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
  );
};

export default Elimination;
