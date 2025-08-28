import React from "react";
import PropTypes from "prop-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Plus, Trash2, CircleDot, CornerDownRight } from "lucide-react";
import { FieldBlock } from "./field-block";

export function ProblemGroup({ parent, children, onPatchItem, onRemoveItem, onAddChild }) {
  return (
    <AccordionItem value={`p-${parent.problem_id}`} className="border rounded-2xl">
      <AccordionTrigger className="px-4">
        <div className="flex items-center gap-2 text-left">
          <Badge variant="secondary" className="rounded-full">발문</Badge>
          <span className="font-semibold">#{parent.problem_id}</span>
          <span className="text-muted-foreground">Chapter {parent.chapter_number ?? parent.chapter_id}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <Card className="m-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleDot className="w-4 h-4" /> 발문 내용 · 정답
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldBlock
              label="Instruction (발문)"
              value={parent.instruction}
              onChange={(v) => onPatchItem(parent.problem_id, { instruction: v })}
            />

            <FieldBlock
              label="Answer (정답/서술)"
              value={parent.answer}
              onChange={(v) => onPatchItem(parent.problem_id, { answer: v })}
            />

            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">problem_id: {parent.problem_id}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onAddChild(parent.problem_id)} className="gap-1">
                  <Plus className="w-4 h-4" /> 꼬리문제 추가
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onRemoveItem(parent.problem_id)} className="gap-1">
                  <Trash2 className="w-4 h-4" /> 발문 삭제
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 자식(꼬리문제) 리스트 */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <CornerDownRight className="w-4 h-4" />
            <span className="text-sm font-semibold">꼬리문제 {children.length}개</span>
          </div>
          <div className="space-y-3">
            {children.map((c) => (
              <Card key={c.problem_id} className="border-muted/70">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="rounded-full">#{c.problem_id < 0 ? "new" : c.problem_id}</Badge>
                      <Badge variant="secondary" className="rounded-full">order {c.order ?? "-"}</Badge>
                      <Badge className="rounded-full" variant="default">{c.type ?? "short"}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        className="h-8 w-28"
                        type="number"
                        value={c.order ?? ""}
                        onChange={(e) => onPatchItem(c.problem_id, { order: e.target.value ? Number(e.target.value) : null })}
                        placeholder="order"
                      />
                      <Button size="icon" variant="destructive" onClick={() => onRemoveItem(c.problem_id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <FieldBlock
                    label="Instruction"
                    value={c.instruction}
                    onChange={(v) => onPatchItem(c.problem_id, { instruction: v })}
                  />
                  <FieldBlock
                    label="Answer"
                    value={c.answer}
                    onChange={(v) => onPatchItem(c.problem_id, { answer: v })}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

ProblemGroup.propTypes = {
  parent: PropTypes.shape({
    problem_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    instruction: PropTypes.string,
    answer: PropTypes.string,
    chapter_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    chapter_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  children: PropTypes.arrayOf(
    PropTypes.shape({
      problem_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      instruction: PropTypes.string,
      answer: PropTypes.string,
      order: PropTypes.number,
      type: PropTypes.string,
    })
  ).isRequired,
  onPatchItem: PropTypes.func.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
  onAddChild: PropTypes.func.isRequired,
};
