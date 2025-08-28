import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import katex from "katex";

export function KaTexRenderer({ children, className = "", displayMode = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !children) return;

    const container = containerRef.current;
    
    try {
      // HTML 내용을 파싱하여 수식 부분을 찾아서 KaTeX로 렌더링
      const processContent = (content) => {
        if (typeof content !== 'string') return content;
        
        // LaTeX 수식 패턴들
        const patterns = [
          { regex: /\$\$(.*?)\$\$/g, display: true },   // $$...$$
          { regex: /\\\[(.*?)\\\]/g, display: true },   // \[...\]
          { regex: /\$(.*?)\$/g, display: false },      // $...$
          { regex: /\\\((.*?)\\\)/g, display: false },  // \(...\)
        ];

        let processedContent = content;
        
        patterns.forEach(({ regex, display }) => {
          processedContent = processedContent.replace(regex, (match, latex) => {
            try {
              const rendered = katex.renderToString(latex.trim(), {
                displayMode: display,
                throwOnError: false,
                strict: false
              });
              return rendered;
            } catch (error) {
              console.warn('KaTeX 렌더링 오류:', error, '수식:', latex);
              return match; // 원본 반환
            }
          });
        });

        return processedContent;
      };

      const processedHTML = processContent(children);
      container.innerHTML = processedHTML;
    } catch (error) {
      console.error('KaTeX 처리 중 오류:', error);
      container.innerHTML = children || '';
    }
  }, [children, displayMode]);

  return (
    <div 
      ref={containerRef} 
      className={className}
    />
  );
}

KaTexRenderer.propTypes = {
  children: PropTypes.string,
  className: PropTypes.string,
  displayMode: PropTypes.bool,
};

