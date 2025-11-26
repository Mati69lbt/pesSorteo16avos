import React, { useState } from "react";

const COPA_ARG_2012 = ({ Formato, preset, setPreset }) => {
  return (
    <div className="mt-3">
      <label className="block text-xs font-semibold text-slate-700">
        Plantilla de llaves (opcional)
      </label>
      <select
        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:ring-2 focus:ring-slate-500"
        value={preset}
        onChange={(e) => setPreset(e.target.value)}
        disabled={Formato !== "16avos"}
      >
        <option value="none">Sin plantilla (sorteo libre)</option>
        <option value="copa-arg-2012">Copa Argentina 2012</option>
      </select>
      {Formato === "16avos" && preset === "copa-arg-2012" && (
        <p className="mt-1 text-xs text-slate-500">
          Se fijan los cruces como en la Copa Argentina 2012; solo se sortean
          los lugares marcados como &quot;X&quot;.
        </p>
      )}
    </div>
  );
};

export default COPA_ARG_2012;
