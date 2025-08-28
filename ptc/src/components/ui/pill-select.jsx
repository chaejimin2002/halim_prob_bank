import React from "react";
import PropTypes from "prop-types";

/** 새 디자인: 블루 그라데이션 pill 선택 박스 */
export function PillSelect({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-semibold text-gray-800">{label}</div>
      <div role="radiogroup" className=" flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className={[
                "tone-chip tone-focus ring-1 ring-blue-200 !bg-white !text-blue-700 hover:!bg-blue-50",
                selected &&
                  "!bg-gradient-to-r from-blue-600 to-blue-400 !text-white ring-0 tone-shadow",
              ].join(" ")}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

PillSelect.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ).isRequired,
};
