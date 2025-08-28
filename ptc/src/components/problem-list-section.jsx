import React, { useState } from "react";
import PropTypes from "prop-types";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, CheckCircle2, Download } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { ProblemRow } from "./problem-row";

export function ProblemListSection({ items, addItem, removeItem, updateItem, requestHtmlFromVLM, onExport }) {
  // Mock commit
  const [committing, setCommitting] = useState(false);
  const [committed, setCommitted] = useState(false);

  const onCommit = async () => {
    setCommitting(true);
    setCommitted(false);
    await new Promise((r) => setTimeout(r, 900));
    setCommitting(false);
    setCommitted(true);
    setTimeout(() => setCommitted(false), 2000);
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">꼬리문제</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[28rem] pr-2">
          <div className="space-y-4">
          {items.map((it, idx) => (
            <ProblemRow
              key={it.id}
              index={idx}
              data={it}
              onChange={(d) => updateItem(it.id, d)}
              onRemove={() => removeItem(it.id)}
              requestHtmlFromVLM={requestHtmlFromVLM}
            />
          ))}
          </div>
        </ScrollArea>

        <div className="mt-4 flex items-center justify-between">
          <GradientButton onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" /> 문제 추가
          </GradientButton>
          <div className="flex items-center gap-3">
            {committed && (
              <span className="flex items-center gap-1 text-sm text-blue-600">
                <CheckCircle2 className="h-4 w-4" /> 저장 완료
              </span>
            )}
            {onExport && (
              <GradientButton onClick={onExport}>
                <Download className="mr-2 h-4 w-4" /> 내보내기
              </GradientButton>
            )}
            <GradientButton onClick={onCommit} disabled={committing}>
              {committing ? "저장 중..." : "commit"}
            </GradientButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

ProblemListSection.propTypes = {
  items: PropTypes.array.isRequired,
  addItem: PropTypes.func.isRequired,
  removeItem: PropTypes.func.isRequired,
  updateItem: PropTypes.func.isRequired,
  requestHtmlFromVLM: PropTypes.func.isRequired,
  onExport: PropTypes.func,
};
