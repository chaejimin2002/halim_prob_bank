import React from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";

/** 아이콘 pill 버튼 (라이트/솔리드) */
export function IconPill({ variant = "light", className = "", children, ...props }) {
  const style =
    variant === "solid"
      ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white tone-shadow"
      : "bg-white text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50";
  return (
    <Button
      {...props}
      variant="ghost"
      size="icon"
      className={["h-9 w-9 rounded-xl", style, className].join(" ")}
    >
      {children}
    </Button>
  );
}

IconPill.propTypes = {
  variant: PropTypes.oneOf(["light", "solid"]),
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};
