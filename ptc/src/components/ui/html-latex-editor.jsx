import React from "react";
import PropTypes from "prop-types";
import { Textarea } from "@/components/ui/textarea";

export function HtmlLatexEditor({ value, onChange, compact }) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={"예) 1) <b>집합</b> \n- 두 수의 합: $a+b$\n- 분수: $\\frac{3}{5}$"}
      className={`${compact ? "h-44" : "h-44"} w-full resize-none rounded-xl font-mono text-sm border-blue-100 focus-visible:ring-blue-300`}
    />
  );
}

HtmlLatexEditor.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  compact: PropTypes.bool,
};
