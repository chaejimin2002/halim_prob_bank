import React from "react";
import PropTypes from "prop-types";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitCommit, RefreshCw } from "lucide-react";

export function EmptyState({ onReload, onImportClick, inputEl }) {
  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCommit className="w-5 h-5" /> 불러올 문제가 없습니다
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">JSON 파일을 불러오거나(fetchUrl 설정 시) 다시 시도하세요.</p>
        <div className="flex gap-2">
          <Button onClick={onReload} className="gap-2">
            <RefreshCw className="w-4 h-4"/>다시 시도
          </Button>
          <Button variant="outline" onClick={onImportClick}>불러오기(JSON)</Button>
        </div>
        {inputEl}
      </CardContent>
    </Card>
  );
}

EmptyState.propTypes = {
  onReload: PropTypes.func.isRequired,
  onImportClick: PropTypes.func.isRequired,
  inputEl: PropTypes.node,
};
