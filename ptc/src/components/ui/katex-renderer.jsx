import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import katex from "katex";

export function KaTexRenderer({ children, className = "", displayMode = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !children) {
      containerRef.current.innerHTML = '';
      return;
    }

    const container = containerRef.current;
    
    try {
      let content = children || '';
      
      // 1단계: <br/>를 개행문자로 변환
      content = content.replace(/<br\s*\/?>/gi, '\n');
      
      // 2단계: LaTeX 수식 패턴들 (더 정확한 패턴)
      const patterns = [
        { regex: /\$\$([\s\S]*?)\$\$/g, display: true },   // $$...$$
        { regex: /\\\[([\s\S]*?)\\\]/g, display: true },   // \[...\]
        { regex: /\$([^\$\n\r]*?)\$/g, display: false },   // $...$
        { regex: /\\\(([\s\S]*?)\\\)/g, display: false },  // \(...\)
      ];

      // 렌더링된 KaTeX HTML을 저장할 배열
      const katexRenderedParts = [];

      // 3단계: LaTeX 수식 블록 처리
      let tempContent = content;
      
      patterns.forEach(({ regex, display }) => {
        tempContent = tempContent.replace(regex, (match, latex) => {
          try {
            // LaTeX 수식 정리 - aligned 환경 유지
            let cleanedLatex = latex.trim();
            
            // \begin{aligned}와 \end{aligned}는 유지하되, \\를 \\\\로 변환
            cleanedLatex = cleanedLatex.replace(/\\\\/g, '\\\\\\\\');
            
            console.log('KaTeX 렌더링 시도:', { latex: cleanedLatex, display });

            const rendered = katex.renderToString(cleanedLatex, {
              throwOnError: false,
              displayMode: display,
              trust: true,
              macros: {
                "\\RR": "\\mathbb{R}",
              },
            });
            
            const placeholder = `__KATEX_PLACEHOLDER_${katexRenderedParts.length}__`;
            katexRenderedParts.push(rendered);
            return placeholder;
          } catch (error) {
            console.warn("KaTeX 렌더링 오류:", error, "LaTeX:", latex);
            // 오류 시 원본 LaTeX 문자열 반환 (구분자 없이)
            return latex;
          }
        });
      });

      // 4단계: 남은 개행을 <br/>로 변환
      let finalHtml = tempContent.replace(/\n/g, '<br/>');

      // 5단계: 렌더링된 KaTeX HTML을 다시 삽입
      katexRenderedParts.forEach((renderedHtml, index) => {
        finalHtml = finalHtml.replace(`__KATEX_PLACEHOLDER_${index}__`, renderedHtml);
      });

      // 6단계: 최종 HTML 설정
      container.innerHTML = finalHtml;

    } catch (error) {
      console.error("KaTexRenderer 주요 오류:", error);
      // 폴백: 원본 children을 개행 변환하여 표시
      container.innerHTML = (children || '').replace(/\n/g, '<br/>');
    }
  }, [children, displayMode]);

  return <div ref={containerRef} className={className} />;
}

KaTexRenderer.propTypes = {
  children: PropTypes.string,
  className: PropTypes.string,
  displayMode: PropTypes.bool,
};

