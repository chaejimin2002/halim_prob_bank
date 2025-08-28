import React from "react";
import PropTypes from "prop-types";
import { PillSelect } from "./pill-select";

export function LanguageToggle({ value, onChange}) {
  const languages = [
    { key: "korean", label: "한국어", flag: "🇰🇷" },
    { key: "english", label: "English", flag: "🇺🇸" }
  ];

  return (
    <PillSelect
      label=""
      value={value}
      onChange={onChange}
      options={languages.map((lang) => ({ label: lang.flag + " " + lang.label, value: lang.key }))}
    />
  );
}

LanguageToggle.propTypes = {
  value: PropTypes.oneOf(["korean", "english"]).isRequired,
  onChange: PropTypes.func.isRequired,
};
