import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { KaTexRenderer } from "@/components/ui/katex-renderer";

export function FieldBlock({ label, value, onChange }) {
  const [local, setLocal] = useState(value ?? "");
  
  useEffect(() => setLocal(value ?? ""), [value]);

  return (
    <Tabs value={"edit"} onValueChange={() => {}} className="w-full">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{label}</div>
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview" disabled>Preview</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="edit" className="mt-2">
        {/* HtmlLatexEditor 가 있다면 아래 한 줄로 교체 가능 */}
        {/* <HtmlLatexEditor value={local} onChange={(v) => { setLocal(v); onChange(v); }} compact /> */}
        <Textarea
          className="min-h-32"
          value={local}
          onChange={(e) => { setLocal(e.target.value); onChange(e.target.value); }}
          placeholder={label + " 내용을 입력하세요 (LaTeX 가능)"}
        />
        <Separator className="my-2" />
        <div className="rounded-xl border bg-muted/30 p-3 text-sm">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">미리보기</div>
          <ScrollArea className="h-40 rounded-md border bg-background p-3">
            <KaTexRenderer>{local || ""}</KaTexRenderer>
          </ScrollArea>
        </div>
      </TabsContent>
    </Tabs>
  );
}

FieldBlock.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
