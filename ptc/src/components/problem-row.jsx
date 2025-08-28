import React, { useState } from "react";
import PropTypes from "prop-types";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import { KaTexRenderer } from "@/components/ui/katex-renderer";
import { IconPill } from "@/components/ui/icon-pill";
import { PillSelect } from "@/components/ui/pill-select";
import { DropBox } from "@/components/ui/drop-box";
import { HtmlLatexEditor } from "@/components/ui/html-latex-editor";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useImagePreview } from "@/utils/image-preview";
import { AnalyzingOverlay } from "@/components/ui/analyzing-overlay";

export function ProblemRow({ index, data, onChange, onRemove, requestHtmlFromVLM }) {
  const qImg = useImagePreview();
  const aImg = useImagePreview();

  // 언어 선택 상태
  const [selectedLang, setSelectedLang] = useState("korean");

  const [loadingQ, setLoadingQ] = useState(false);
  const [loadingA, setLoadingA] = useState(false);

  // 파일 -> dataURL (원본 이미지를 즉시 띄우기 위함)
  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const handleQDrop = async (file) => {
    try {
      setLoadingQ(true);
      // 1) 원본 이미지 먼저 반영
      const img = await fileToDataUrl(file);
      onChange({ ...data, q: { ...data.q, img } });
      qImg.onFile(file); // 로컬 미리보기 훅 유지(선택)

      // 2) VLM 호출해서 한글/영어 html 갱신
      const htmlResult = await requestHtmlFromVLM(file);
      onChange({ ...data, q: { ...data.q, img, html: htmlResult } });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQ(false);
    }
  };

  const handleADrop = async (file) => {
    try {
      setLoadingA(true);
      const img = await fileToDataUrl(file);
      onChange({ ...data, a: { ...data.a, img } });
      aImg.onFile(file);

      const htmlResult = await requestHtmlFromVLM(file);
      onChange({ ...data, a: { ...data.a, img, html: htmlResult } });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingA(false);
    }
  };

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">{index + 1}.</CardTitle>
          <IconPill variant="solid" onClick={onRemove} aria-label="문항 삭제">
            <Trash2 className="h-4 w-4" />
          </IconPill>
        </div>
        <div className="mt-2">
          <PillSelect
            label="유형"
            value={data.type}
            onChange={(v) => onChange({ ...data, type: v })}
            options={[
              { label: "Essay", value: "essay" },
              { label: "Short", value: "short" },
            ]}
          />
        </div>
      </CardHeader>

      {/* 문제(Q) */}
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700">문제</div>
          <LanguageToggle value={selectedLang} onChange={setSelectedLang} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 이미지 */}
          <div className="w-full relative">
            {data.q.img ? (
              <div className="relative h-44 w-full overflow-hidden rounded-2xl border bg-muted/30">
                <img src={data.q.img} alt="question" className="h-full w-full object-contain" />
                {loadingQ && (
                  <AnalyzingOverlay
                    label="분석 중..."
                    sublabel="수식·기호를 추출하는 중입니다"
                  />
                )}
              </div>
            ) : (
              <DropBox label={loadingQ ? "분석 중..." : "이미지 업로드"} onDrop={handleQDrop} />
            )}
          </div>

          {/* 에디터 */}
          <div className="w-full">
            <HtmlLatexEditor
              value={data.q.html[selectedLang] || ""}
              onChange={(v) => onChange({ ...data, q: { ...data.q, html: { ...data.q.html, [selectedLang]: v } } })}
              compact
            />
          </div>

          {/* 실시간 미리보기 */}
          <div className="w-full">
            <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/30 p-2">
              <ScrollArea className="h-full">
                <KaTexRenderer className="text-sm leading-relaxed antialiased">
                  {(data.q.html[selectedLang] || "").replaceAll("\n", "<br/>")}
                </KaTexRenderer>
              </ScrollArea>
            </div>
          </div>
        </div>
      </CardContent>

      {/* 답(A) */}
      <CardContent className="space-y-4">
        <div className="text-sm font-medium text-gray-700">답</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 이미지 */}
          <div className="w-full relative">
            {data.a.img ? (
              <div className="relative h-44 w-full overflow-hidden rounded-2xl border bg-muted/30">
                <img src={data.a.img} alt="answer" className="h-full w-full object-contain" />
                {loadingA && (
                  <AnalyzingOverlay
                    label="분석 중..."
                    sublabel="수식·기호를 추출하는 중입니다"
                  />
                )}
              </div>
            ) : (
              <DropBox label={loadingA ? "분석 중..." : "이미지 업로드"} onDrop={handleADrop} />
            )}
          </div>

          {/* 에디터 */}
          <div className="w-full">
            <HtmlLatexEditor
              value={data.a.html[selectedLang] || ""}
              onChange={(v) => onChange({ ...data, a: { ...data.a, html: { ...data.a.html, [selectedLang]: v } } })}
              compact
            />
          </div>

          {/* 실시간 미리보기 */}
          <div className="w-full">
            <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/30 p-2">
              <ScrollArea className="h-full">
                <KaTexRenderer className="text-sm leading-relaxed antialiased">
                  {(data.a.html[selectedLang] || "").replaceAll("\n", "<br/>")}
                </KaTexRenderer>
              </ScrollArea>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

ProblemRow.propTypes = {
  index: PropTypes.number.isRequired,
  data: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string,
    q: PropTypes.shape({
      html: PropTypes.shape({
        korean: PropTypes.string,
        english: PropTypes.string,
      }),
      img: PropTypes.string,
    }),
    a: PropTypes.shape({
      html: PropTypes.shape({
        korean: PropTypes.string,
        english: PropTypes.string,
      }),
      img: PropTypes.string,
    }),
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  requestHtmlFromVLM: PropTypes.func.isRequired,
};