import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CategorySelector } from "./components/category-selector";
import { PromptSection } from "./components/prompt-section";
import { ProblemListSection } from "./components/problem-list-section";
import { requestHtmlFromVLM } from "./services/vlm-service";
import { newId } from "./utils/id-generator";
import { SMALL_BY_BIG } from "./data/categories";

/**
 * JSX 버전 (TypeScript 제거)
 * - Tailwind + shadcn/ui 사용
 * - 스케치 구조: 발문 1개, 꼬리문제 N개
 * - 각 행: [드롭존 이미지] [이미지 기반 html+LaTeX 에디터] [미리보기 이미지]
 */

export default function WorksheetBuilder() {
  const [promptHtml, setPromptHtml] = useState({ korean: "", english: "" });
  const [promptAnswer, setPromptAnswer] = useState({ korean: "", english: "" });

  // 꼬리문제 리스트
  const [items, setItems] = useState([
    { 
      id: newId(), 
      type: "short", 
      q: { html: { korean: "", english: "" }, img: null }, 
      a: { html: { korean: "", english: "" }, img: null } 
    },
  ]);

  const addItem = () =>
    setItems((prev) => [...prev, { 
      id: newId(), 
      type: "short", 
      q: { html: { korean: "", english: "" }, img: null }, 
      a: { html: { korean: "", english: "" }, img: null } 
    }]);

  const removeItem = (id) => setItems((prev) => prev.filter((x) => x.id !== id));
  const updateItem = (id, data) =>
    setItems((prev) => prev.map((x) => (x.id === id ? data : x)));

  const [big, setBig] = useState(171);
  const smallOptions = useMemo(() => SMALL_BY_BIG[big] ?? [], [big]);
  const [small, setSmall] = useState(smallOptions[0]?.value ?? "");

  // chapter_id -> chapter_number 매핑
  const CHAPTER_MAPPING = {
    171: "2", 172: "2.1", 173: "2.2", 174: "2.3",
    175: "3", 176: "3.1", 177: "3.2", 178: "3.3", 179: "3.4",
    180: "4", 181: "4.1", 182: "4.2", 183: "4.3", 184: "4.4",
    185: "5", 186: "5.1", 187: "5.2", 188: "5.3", 189: "5.4",
    190: "5.5",
    191: "6", 192: "6.1", 193: "6.2", 194: "6.3", 195: "6.4",
    196: "6.5", 197: "6.6",
    198: "7", 199: "7.1", 200: "7.2",
    201: "8", 202: "8.1", 203: "8.2", 204: "8.3",
    205: "9", 206: "9.1", 207: "9.2", 208: "9.3", 209: "9.4",
    210: "10", 211: "10.1", 212: "10.2", 213: "10.3", 214: "10.4",
    215: "11", 216: "11.1", 217: "11.2",
    218: "2.4", 219: "3.5", 220: "4.5", 221: "5.6", 222: "6.7",
    223: "7.3", 224: "8.4"
  };

  // 저장/내보내기 기능
  const exportData = () => {
    const problems = [];
    //TODO: 문제 id 지정 방법 변경
    const baseId = Math.floor(Math.random() * 10000) + 1000; // 기본 ID 생성
    const chapterNumber = CHAPTER_MAPPING[small] || null;
    
    // 발문이 있는 경우 parent 문제로 추가
    if (promptHtml.korean.trim() || promptHtml.english.trim() || promptAnswer.korean.trim() || promptAnswer.english.trim()) {
      const parentProblem = {
        problem_id: baseId,
        chapter_number: chapterNumber,
        parent_id: null,
        instruction: promptHtml.korean || null,
        instruction_en: promptHtml.english || "",
        answer: promptAnswer.korean || "",
        answer_en: promptAnswer.english || "",
        hint: "",
        hint_en: "",
        type: "short"
      };
      problems.push(parentProblem);
      
      // 꼬리문제들을 child로 추가
      items.forEach((item, index) => {
        if (item.q.html.korean.trim() || item.q.html.english.trim() || item.a.html.korean.trim() || item.a.html.english.trim()) {
          const childProblem = {
            problem_id: baseId + index + 1,
            chapter_number: chapterNumber,
            parent_id: baseId,
            instruction: item.q.html.korean || null,
            instruction_en: item.q.html.english || "",
            answer: item.a.html.korean || "",
            answer_en: item.a.html.english || "",
            hint: "",
            hint_en: "",
            type: "short"
          };
          problems.push(childProblem);
        }
      });
    } else {
      // 발문이 없고 꼬리문제만 있는 경우, 각각을 독립 문제로 처리
      items.forEach((item, index) => {
        if (item.q.html.korean.trim() || item.q.html.english.trim() || item.a.html.korean.trim() || item.a.html.english.trim()) {
          const problem = {
            problem_id: baseId + index,
            chapter_number: chapterNumber,
            parent_id: null,
            instruction: item.q.html.korean || null,
            instruction_en: item.q.html.english || "",
            answer: item.a.html.korean || "",
            answer_en: item.a.html.english || "",
            hint: "",
            hint_en: "",
            type: "short"
          };
          problems.push(problem);
        }
      });
    }
    
    const payload = JSON.stringify(problems, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `problems_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full min-h-screen space-y-6 p-6">
      <motion.h1
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-center text-gray-900"
      >
        <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          한림대학교 문제 은행
        </span>
      </motion.h1>

      <CategorySelector 
        big={big} 
        setBig={setBig} 
        small={small} 
        setSmall={setSmall} 
      />

      <PromptSection 
        promptHtml={promptHtml} 
        setPromptHtml={setPromptHtml} 
        promptAnswer={promptAnswer}
        setPromptAnswer={setPromptAnswer}
        requestHtmlFromVLM={requestHtmlFromVLM} 
      />

      <ProblemListSection 
        items={items} 
        addItem={addItem} 
        removeItem={removeItem} 
        updateItem={updateItem} 
        requestHtmlFromVLM={requestHtmlFromVLM}
        onExport={exportData}
      />

      {/* 하단 가이드 */}
      <Card className="rounded-2xl border-dashed">
        <CardContent className="space-y-2 p-4 text-sm text-muted-foreground">
          <p>• <strong>단일 문제</strong>: 발문에만 문제와 답안을 입력하고 꼬리문제 없이 사용 가능합니다.</p>
          <p>• <strong>복합 문제</strong>: 발문 + 꼬리문제 구조로 여러 하위 문제를 포함할 수 있습니다.</p>
          <p>• 드롭한 이미지를 VLM 서버로 보내 HTML+LaTeX을 받고, KaTeX로 렌더한 뒤 우측 미리보기에 표시됩니다.</p>
          <p>• <strong>내보내기</strong>: 전체 데이터(카테고리, 발문, 꼬리문제)를 JSON 파일로 저장할 수 있습니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}

