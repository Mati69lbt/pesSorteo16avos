import React from "react";

const CountryRow = ({
  label,
  total,
  enabled,
  value,
  options,
  onToggle,
  onChange,
  disabled,
}) => {
  return (
    <label className="flex items-center gap-4 px-6 py-4">
      <input
        type="checkbox"
        checked={enabled}
        disabled={disabled}
         onChange={(e) => {
          if (disabled) return; 
          onToggle(e);
        }}
        className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-500"
      />
      <div className="flex min-w-0 flex-col">
        <span className="font-medium text-slate-900">{label}</span>
        <span className="text-sm text-slate-600">{total} equipos</span>
      </div>
      {enabled && (
        <select
          value={value}
          onChange={onChange}
          className="ml-auto w-32 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          {options.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
      )}
    </label>
  );
};

export default CountryRow;
