import React from "react";
import PropTypes from "prop-types";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export function SectionCard({ title, children, footer }) {
  return (
    <Card className="tone-surface">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">{children}</CardContent>
      {footer ? <div className="px-5 pb-5">{footer}</div> : null}
    </Card>
  );
}

SectionCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
};
