import React from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";

/** 블루 그라데이션 텍스트 버튼 */
export function GradientButton({ className = "", children, ...props }) {
  return (
    <Button
      {...props}
      className={[
        "tone-chip text-white bg-gradient-to-r from-blue-600 to-blue-400",
        "hover:opacity-95 active:opacity-90 disabled:opacity-60",
        "tone-shadow", className,
      ].join(" ")}
    >
      {children}
    </Button>
  );
}

GradientButton.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};
