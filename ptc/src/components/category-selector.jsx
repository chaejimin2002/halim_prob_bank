import React, { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { PillSelect } from "@/components/ui/pill-select";
import { BIG, SMALL_BY_BIG } from "@/data/categories";

export function CategorySelector({ big, setBig, small, setSmall }) {
  const smallOptions = useMemo(() => SMALL_BY_BIG[big] ?? [], [big]);

  useEffect(() => {
    if (!smallOptions.find((o) => o.value === small)) {
      setSmall(smallOptions[0]?.value ?? "");
    }
  }, [big, small, smallOptions, setSmall]);

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="pb-1">
        <CardTitle className="text-lg font-semibold">문항 분류</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <PillSelect
          label="대분류"
          value={big}
          onChange={setBig}
          options={BIG}
        />
        <PillSelect
          label="소분류"
          value={small}
          onChange={setSmall}
          options={smallOptions}
        />
      </CardContent>
    </Card>
  );
}

CategorySelector.propTypes = {
  big: PropTypes.number.isRequired,
  setBig: PropTypes.func.isRequired,
  small: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  setSmall: PropTypes.func.isRequired,
};
