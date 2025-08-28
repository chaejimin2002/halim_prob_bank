import React from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Save } from "lucide-react";

export function EditorToolbar({ 
  onImportClick, 
  onExport, 
  onSaveAll, 
  saving, 
  fileInputRef 
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-end items-center">
      <input
        type="file"
        ref={fileInputRef}
        accept="application/json,.json"
        className="hidden"
      />
      <Button variant="outline" onClick={onImportClick}>불러오기(JSON)</Button>
      <Button variant="outline" onClick={onExport}>내보내기(JSON)</Button>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onSaveAll} disabled={saving} className="gap-2">
              <Save className="w-4 h-4" /> 저장
            </Button>
          </TooltipTrigger>
          <TooltipContent>모든 변경사항을 배치 저장합니다.</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

EditorToolbar.propTypes = {
  onImportClick: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  onSaveAll: PropTypes.func.isRequired,
  saving: PropTypes.bool.isRequired,
  fileInputRef: PropTypes.object.isRequired,
};
