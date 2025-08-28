import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { Upload } from "lucide-react";

export function DropBox({ label, onDrop }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files) => files?.length && onDrop(files[0]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      className={[
        "flex h-44 w-full cursor-pointer items-center justify-center rounded-2xl",
        "border-2 border-dashed p-3 text-sm transition",
        dragOver
          ? "border-blue-400 bg-blue-50"
          : "border-blue-200/70 hover:bg-blue-50/50",
      ].join(" ")}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <Upload className="h-6 w-6 text-blue-600" />
        <span className="font-medium text-gray-800">{label}</span>
        <span className="text-xs text-gray-500">이미지 파일을 드래그하거나 클릭해 업로드</span>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
}

DropBox.propTypes = {
  label: PropTypes.string.isRequired,
  onDrop: PropTypes.func.isRequired,
};
