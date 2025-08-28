import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KaTexRenderer } from "@/components/ui/katex-renderer";
import { SectionCard } from "@/components/ui/section-card";
import { DropBox } from "@/components/ui/drop-box";
import { HtmlLatexEditor } from "@/components/ui/html-latex-editor";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useImagePreview } from "@/utils/image-preview";
import { AnalyzingOverlay } from "@/components/ui/analyzing-overlay";

export function PromptSection({ promptHtml, setPromptHtml, promptAnswer, setPromptAnswer, requestHtmlFromVLM }) {
  const promptImage = useImagePreview();
  const answerImage = useImagePreview();
  const previewRef = useRef(null);

  // 언어 선택 상태
  const [selectedLang, setSelectedLang] = useState("korean");

  // 미리보기 PNG 렌더링용 상태
  const [rendering, setRendering] = useState(false);
  const [previewPng, setPreviewPng] = useState(null);

  // VLM 호출 로딩(이미지 업로드 중 분석)
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  // 파일 -> dataURL (선택: 훅의 onFile과 별개로 확정 dataURL이 필요한 경우 사용)
  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  // 발문 이미지 드롭: 이미지 즉시 표시 -> VLM으로 HTML만 갱신
  const handlePromptDrop = async (file) => {
    try {
      setLoadingPrompt(true);

      // 1) 원본 이미지 먼저 미리보기로 표시
      //    (useImagePreview 훅 사용: UI 즉시 반영)
      promptImage.onFile(file);

      // 필요 시 확정 dataURL이 필요하면 아래 주석 해제해서 사용할 수 있음
      // const img = await fileToDataUrl(file);
      // promptImage.setPreview?.(img); // 훅에 setter가 있다면

      // 2) VLM 호출 → 한글/영어 HTML 업데이트
      const htmlResult = await requestHtmlFromVLM(file);
      setPromptHtml(htmlResult);
    } catch (e) {
      console.error(e);
      alert("이미지 분석 중 오류가 발생했어요. 콘솔을 확인하세요.");
    } finally {
      setLoadingPrompt(false);
    }
  };

  // 답안 이미지 드롭: 이미지 즉시 표시 -> VLM으로 HTML만 갱신
  const handleAnswerDrop = async (file) => {
    try {
      setLoadingAnswer(true);

      // 1) 원본 이미지 먼저 미리보기로 표시
      answerImage.onFile(file);

      // 2) VLM 호출 → 한글/영어 HTML 업데이트
      const htmlResult = await requestHtmlFromVLM(file);
      setPromptAnswer(htmlResult);
    } catch (e) {
      console.error(e);
      alert("이미지 분석 중 오류가 발생했어요. 콘솔을 확인하세요.");
    } finally {
      setLoadingAnswer(false);
    }
  };

  // MathJax 렌더된 DOM을 PNG로 변환 (선택 기능)
  async function renderPreviewToImage() {
    if (!previewRef.current) return;
    setRendering(true);
    try {
      const node = previewRef.current;
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
      setPreviewPng(dataUrl);
    } finally {
      setRendering(false);
    }
  }

  // promptHtml 변경 시 자동 렌더(디바운스 400ms)
  useEffect(() => {
    const t = setTimeout(() => {
      if (promptHtml[selectedLang]?.trim()) renderPreviewToImage();
    }, 400);
    return () => clearTimeout(t);
  }, [promptHtml, selectedLang]);

  return (
    <SectionCard title="발문">
      {/* 문제 영역 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700">문제</div>
          <LanguageToggle value={selectedLang} onChange={setSelectedLang} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 드롭존 */}
          <div className="w-full relative">
            {promptImage.preview ? (
              <div className="relative h-44 w-full overflow-hidden rounded-2xl border bg-muted/30">
                <img
                  src={promptImage.preview}
                  alt="prompt"
                  className="h-full w-full object-contain"
                />
                {loadingPrompt && (
                  <AnalyzingOverlay
                    label="분석 중..."
                    sublabel="수식·기호를 추출하는 중입니다"
                  />
                )}
              </div>
            ) : (
              <DropBox
                label={loadingPrompt ? "분석 중..." : "이미지 업로드"}
                onDrop={handlePromptDrop}
              />
            )}
          </div>

          {/* 에디터 */}
          <div className="w-full">
            <HtmlLatexEditor 
              value={promptHtml[selectedLang] || ""} 
              onChange={(value) => setPromptHtml(prev => ({ ...prev, [selectedLang]: value }))} 
              compact 
            />
          </div>

          {/* 미리보기 */}
          <div className="w-full">
            <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/30 p-2">
              <ScrollArea className="h-full p-3">
                <div ref={previewRef}>
                  <KaTexRenderer className="text-sm leading-relaxed antialiased text-foreground font-mono">
                    {(promptHtml[selectedLang] || "").replaceAll("\n", "<br/>")}
                  </KaTexRenderer>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>

      {/* 답안 영역 */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-gray-700">답안</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 드롭존 */}
          <div className="w-full relative">
            {answerImage.preview ? (
              <div className="relative h-44 w-full overflow-hidden rounded-2xl border bg-muted/30">
                <img
                  src={answerImage.preview}
                  alt="answer"
                  className="h-full w-full object-contain"
                />
                {loadingAnswer && (
                  <AnalyzingOverlay
                    label="분석 중..."
                    sublabel="수식·기호를 추출하는 중입니다"
                  />
                )}
              </div>
            ) : (
              <DropBox
                label={loadingAnswer ? "분석 중..." : "이미지 업로드"}
                onDrop={handleAnswerDrop}
              />
            )}
          </div>

          {/* 에디터 */}
          <div className="w-full">
            <HtmlLatexEditor 
              value={promptAnswer[selectedLang] || ""} 
              onChange={(value) => setPromptAnswer(prev => ({ ...prev, [selectedLang]: value }))} 
              compact 
            />
          </div>

          {/* 미리보기 */}
          <div className="w-full">
            <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/30 p-2">
              <ScrollArea className="h-full">
                <KaTexRenderer className="text-sm leading-relaxed antialiased">
                  {(promptAnswer[selectedLang] || "").replaceAll("\n", "<br/>")}
                </KaTexRenderer>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

PromptSection.propTypes = {
  promptHtml: PropTypes.shape({
    korean: PropTypes.string,
    english: PropTypes.string,
  }).isRequired,
  setPromptHtml: PropTypes.func.isRequired,
  promptAnswer: PropTypes.shape({
    korean: PropTypes.string,
    english: PropTypes.string,
  }).isRequired,
  setPromptAnswer: PropTypes.func.isRequired,
  requestHtmlFromVLM: PropTypes.func.isRequired,
};