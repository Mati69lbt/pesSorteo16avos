import React, { useEffect, useRef } from "react";

const Groups = ({ groups, getCountryBg, countryCounts }) => {
  return (
    <div className="m-3">
      {groups.length > 0 && (
        <div className="mb-3 -mt-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2 pb-2">
            {[
              { code: "ARG", label: "Argentina" },
              { code: "BRA", label: "Brasil" },
              { code: "CHI", label: "Chile" },
              { code: "COL", label: "Colombia" },
              { code: "Otros", label: "Otros" },
            ].map(({ code, label }) => (
              <div
                key={code}
                className={`shrink-0 inline-flex w-full sm:w-auto justify-between items-center gap-2 rounded-full px-3 py-1 text-sm border border-slate-200 ${getCountryBg(
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {groups.map((group) => (
          <div key={group.id} className="border rounded-lg shadow p-2">
            <h2 className="text-lg font-bold mb-2">Grupo {group.id}</h2>
            <ul className="space-y-1">
              {group.teams.map((team) => (
                <li
                  key={team.id}
                  className={`p-1 rounded ${getCountryBg(team.country)}`}
                >
                  {team.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Groups;
