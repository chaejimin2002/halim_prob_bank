import React from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LanguageToggle({ value, onChange, className }) {
  const languages = [
    { key: "korean", label: "한국어", flag: "🇰🇷" },
    { key: "english", label: "English", flag: "🇺🇸" }
  ];

  return (
    <div className={cn("flex rounded-lg border p-1 bg-muted/30", className)}>
      {languages.map((lang) => (
        <Button
          key={lang.key}
          variant="ghost"
          size="sm"
          onClick={() => onChange(lang.key)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-all",
            value === lang.key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span>{lang.flag}</span>
          <span>{lang.label}</span>
        </Button>
      ))}
    </div>
  );
}

LanguageToggle.propTypes = {
  value: PropTypes.oneOf(["korean", "english"]).isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};
