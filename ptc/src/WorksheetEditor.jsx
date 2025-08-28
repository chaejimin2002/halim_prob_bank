import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Plus, Trash2, Save, RefreshCw } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { IconPill } from "@/components/ui/icon-pill";
import { SectionCard } from "@/components/ui/section-card";
import { HtmlLatexEditor } from "@/components/ui/html-latex-editor";
import { CategorySelector } from "@/components/category-selector";
import { PillSelect } from "@/components/ui/pill-select";
import { SMALL_BY_BIG } from "@/data/categories";
import { KaTexRenderer } from "@/components/ui/katex-renderer";

// chapter_id와 chapter_number 매핑
const CHAPTER_MAPPING = {
  171: "2", 172: "2.1", 173: "2.2", 174: "2.3",
  175: "3", 176: "3.1", 177: "3.2", 178: "3.3", 179: "3.4", 
  180: "4", 181: "4.1", 182: "4.2", 183: "4.3", 184: "4.4",
  185: "5", 186: "5.1", 187: "5.2", 188: "5.3", 189: "5.4", 190: "5.5",
  191: "6", 192: "6.1", 193: "6.2", 194: "6.3", 195: "6.4", 196: "6.5", 197: "6.6",
  198: "7", 199: "7.1", 200: "7.2", 201: "8", 202: "8.1", 203: "8.2", 204: "8.3",
  205: "9", 206: "9.1", 207: "9.2", 208: "9.3", 209: "9.4", 210: "10", 211: "10.1",
  212: "10.2", 213: "10.3", 214: "10.4", 215: "11", 216: "11.1", 217: "11.2", 218: "2.4", 219: "3.5", 220: "4.5", 221: "5.6", 222: "6.7", 223: "7.3", 224: "8.4"
};

/**
 * 한림대학교 문제은행 기본 레이아웃과 유사하지만, 이미지 드롭/처리 부는 제거.
 * - JSON 파일로 문제 배열을 불러와 편집하고, 다시 JSON으로 내보낼 수 있음
 * - parent_id === null → 발문 (Prompt)
 * - 같은 parent_id → 해당 발문의 꼬리문제(children)
 */
export default function WorksheetEditor({ initialData = null, title = "한림대학교 문제 은행" }) {
  const [raw, setRaw] = useState(initialData); // 원본
  const [items, setItems] = useState(initialData ?? []); // 편집본
  const [loading, setLoading] = useState(false); // 파일 로딩 상태만 관리
  
  // 카테고리 상태 (WorksheetBuilder와 동일)
  const [big, setBig] = useState(171);
  const [small, setSmall] = useState(172);

  // JSON에서 카테고리 정보 추출
  const extractCategoryFromData = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) return;
    
    // 첫 번째 발문(parent_id가 null인 항목)에서 카테고리 정보 추출
    const firstParent = data.find(item => item.parent_id == null);
    if (firstParent) {
      // chapter_id에서 카테고리 추출
      const chapterId = firstParent.chapter_id;
      if (chapterId && CHAPTER_MAPPING[chapterId]) {
        setSmall(Number(chapterId));
        // small 값에 따라 big 값도 설정
        const bigValue = Object.keys(SMALL_BY_BIG).find(bigKey => 
          SMALL_BY_BIG[bigKey].some(item => item.value === Number(chapterId))
        );
        if (bigValue) {
          setBig(Number(bigValue));
        }
      }
    }
  };

  // === JSON Import/Export ===
  const fileRef = useRef(null);
  const onClickImport = () => fileRef.current?.click();
  const onImportFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    
    setLoading(true);
    try {
      const text = await f.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error("JSON 루트는 배열(문제 리스트)이어야 합니다.");
      const ok = data.every((it) => typeof it.problem_id !== "undefined" && "instruction" in it && "answer" in it);
      if (!ok) throw new Error("각 항목에 problem_id / instruction / answer 키가 필요합니다.");
      setRaw(data);
      setItems(structuredClone(data));
      extractCategoryFromData(data); // 카테고리 정보 자동 추출
      console.log("JSON 파일 로딩 완료:", data.length, "개 문제");
    } catch (err) {
      alert(`불러오기 실패: ${err.message}`);
      console.error(err);
    } finally {
      e.target.value = "";
      setLoading(false);
    }
  };
  const onExport = () => {
    const payload = JSON.stringify(items ?? [], null, 2);
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

  // === 그룹핑 (발문/꼬리문제) ===
  const groups = useMemo(() => {
    const parents = (items ?? []).filter((p) => p.parent_id == null);
    const map = new Map(parents.map((p) => [p.problem_id, { parent: p, children: [] }]));
    for (const it of items ?? []) {
      if (it.parent_id != null && map.has(it.parent_id)) {
        map.get(it.parent_id).children.push(it);
      }
    }
    for (const g of map.values()) {
      g.children.sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9) || a.problem_id - b.problem_id);
    }
    return Array.from(map.values());
  }, [items]);

  // === 편집 유틸 ===
  const patchItem = useCallback((id, patch) => {
    setItems((prev) => prev.map((x) => (x.problem_id === id ? { ...x, ...patch } : x)));
  }, []);
  const addChild = useCallback((parentId) => {
    const tempId = -Math.floor(Math.random() * 1e9);
    setItems((prev) => {
      const parentItem = prev.find((p) => p.problem_id === parentId);
      const chapterId = parentItem?.chapter_id ?? small;
      const chapterNumber = CHAPTER_MAPPING[chapterId] || chapterId?.toString() || "";
      
      return [
        ...prev,
        {
          problem_id: tempId,
          chapter_id: chapterId,
          chapter_number: chapterNumber,
          instruction: "",
          answer: "",
          parent_id: parentId,
          order: (prev.filter((p) => p.parent_id === parentId).length) + 1,
          hint: "",
          type: "short",
        },
      ];
    });
  }, [small]);
  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((x) => x.problem_id !== id));
  }, []);

  // 카테고리 변경 시 모든 문제의 카테고리 정보 업데이트
  const updateAllCategories = useCallback((newBig, newSmall) => {
    const chapterNumber = CHAPTER_MAPPING[newSmall] || newSmall.toString();
    setItems((prev) => prev.map(item => ({
      ...item,
      chapter_id: newSmall,
      chapter_number: chapterNumber
    })));
  }, []);

  // 카테고리 변경 핸들러
  const handleBigChange = (newBig) => {
    setBig(newBig);
    // big이 변경되면 small을 해당 big의 첫 번째 옵션으로 설정
    const smallOptions = SMALL_BY_BIG[newBig] || [];
    if (smallOptions.length > 0) {
      const newSmall = smallOptions[0].value;
      setSmall(newSmall);
      updateAllCategories(newBig, newSmall);
    }
  };

  const handleSmallChange = (newSmall) => {
    setSmall(newSmall);
    updateAllCategories(big, newSmall);
  };

  // 로딩 오버레이 (파일 업로드 중에만 표시)
  const renderLoadingOverlay = () => {
    if (!loading) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-4 shadow-lg">
          <motion.div 
            initial={{ rotate: 0 }} 
            animate={{ rotate: 360 }} 
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="w-8 h-8 text-blue-600" />
          </motion.div>
          <div className="text-lg font-medium text-gray-800">JSON 파일 불러오는 중...</div>
          <div className="text-sm text-gray-500">잠시만 기다려주세요</div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderLoadingOverlay()}
      <div className="w-full min-h-screen space-y-6 p-6">
        {/* 헤더 */}
        <motion.h1
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-center text-gray-900"
        >
                  <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">{title}</span>
      </motion.h1>

      {/* 문항 분류 */}
      <CategorySelector 
        big={big} 
        setBig={handleBigChange} 
        small={small} 
        setSmall={handleSmallChange} 
      />

      {/* 상단 툴바 */}
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">파일 관리</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <input type="file" ref={fileRef} onChange={onImportFile} accept="application/json,.json" className="hidden" />
          <GradientButton onClick={onClickImport} disabled={loading}>
            <Upload className="mr-2 h-4 w-4" /> 
            {loading ? "불러오는 중..." : "JSON 불러오기"}
          </GradientButton>
          <GradientButton onClick={onExport} disabled={loading}>
            <Save className="mr-2 h-4 w-4" /> JSON 내보내기
          </GradientButton>
        </CardContent>
      </Card>

      {/* 발문 섹션 */}
      <SectionCard title="발문">
        {groups.length > 0 ? (
          <div className="space-y-4">
            {groups.map(({ parent }) => (
              <Card key={parent.problem_id} className="rounded-2xl border shadow-sm">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-foreground">
                      발문 #{parent.problem_id}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <IconPill variant="light" onClick={() => addChild(parent.problem_id)} aria-label="꼬리문제 추가">
                        <Plus className="h-4 w-4" />
                      </IconPill>
                      <IconPill variant="solid" onClick={() => removeItem(parent.problem_id)} aria-label="발문 삭제">
                        <Trash2 className="h-4 w-4" />
                      </IconPill>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm font-medium text-gray-700">문제</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 에디터 */}
                    <div className="w-full">
                      <HtmlLatexEditor
                        value={parent.instruction || ""}
                        onChange={(v) => patchItem(parent.problem_id, { instruction: v })}
                        compact
                      />
                    </div>

                    {/* 실시간 미리보기 */}
                    <div className="w-full">
                      <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/30 p-2">
                        <ScrollArea className="h-full">
                          <KaTexRenderer className="text-sm leading-relaxed antialiased">
                            {(parent.instruction || "").replaceAll("\n", "<br/>")}
                          </KaTexRenderer>
                        </ScrollArea>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardContent className="space-y-4">
                  <div className="text-sm font-medium text-gray-700">답</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 에디터 */}
                    <div className="w-full">
                      <HtmlLatexEditor
                        value={parent.answer || ""}
                        onChange={(v) => patchItem(parent.problem_id, { answer: v })}
                        compact
                      />
                    </div>

                    {/* 실시간 미리보기 */}
                    <div className="w-full">
                      <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/30 p-2">
                        <ScrollArea className="h-full">
                          <KaTexRenderer className="text-sm leading-relaxed antialiased">
                            {(parent.answer || "").replaceAll("\n", "<br/>")}
                          </KaTexRenderer>
                        </ScrollArea>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl border-dashed border-blue-200">
            <CardContent className="p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-blue-400 mb-4" />
              <p className="text-lg font-medium text-gray-800 mb-2">발문이 없습니다</p>
              <p className="text-sm text-gray-500">parent_id가 null인 항목이 포함된 JSON 파일을 불러오세요.</p>
            </CardContent>
          </Card>
        )}
      </SectionCard>

      {/* 꼬리문제 섹션 */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">꼬리문제</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[28rem] pr-2">
            <div className="space-y-4">
              {groups.map(({ parent, children }) => (
                <div key={`group-${parent.problem_id}`} className="space-y-3">
                  {children.length > 0 && (
                    <div className="text-sm font-semibold text-gray-700">
                      발문 #{parent.problem_id}의 꼬리문제 ({children.length}개)
                    </div>
                  )}
                  {children.map((child, index) => (
                    <Card key={child.problem_id} className="rounded-2xl border shadow-sm">
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-semibold text-foreground">
                            {index + 1}.
                          </CardTitle>
                          <IconPill variant="solid" onClick={() => removeItem(child.problem_id)} aria-label="문항 삭제">
                            <Trash2 className="h-4 w-4" />
                          </IconPill>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <PillSelect
                                label="유형"
                                value={child.type || "short"}
                                onChange={(v) => patchItem(child.problem_id, { type: v })}
                                options={[
                                { label: "Essay", value: "essay" },
                                { label: "Short", value: "short" },
                                ]}
                            />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-sm font-medium text-gray-700">문제</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* 에디터 */}
                          <div className="w-full">
                            <HtmlLatexEditor
                              value={child.instruction || ""}
                              onChange={(v) => patchItem(child.problem_id, { instruction: v })}
                              compact
                            />
                          </div>

                          {/* 실시간 미리보기 */}
                          <div className="w-full">
                            <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/30 p-2">
                              <ScrollArea className="h-full">
                                <KaTexRenderer className="text-sm leading-relaxed antialiased">
                                  {(child.instruction || "").replaceAll("\n", "<br/>")}
                                </KaTexRenderer>
                              </ScrollArea>
                            </div>
                          </div>
                        </div>
                      </CardContent>

                      <CardContent className="space-y-4">
                        <div className="text-sm font-medium text-gray-700">답</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* 에디터 */}
                          <div className="w-full">
                            <HtmlLatexEditor
                              value={child.answer || ""}
                              onChange={(v) => patchItem(child.problem_id, { answer: v })}
                              compact
                            />
                          </div>

                          {/* 실시간 미리보기 */}
                          <div className="w-full">
                            <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/30 p-2">
                              <ScrollArea className="h-full">
                                <KaTexRenderer className="text-sm leading-relaxed antialiased">
                                  {(child.answer || "").replaceAll("\n", "<br/>")}
                                </KaTexRenderer>
                              </ScrollArea>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {children.length === 0 && (
                    <Card className="rounded-2xl border-dashed border-blue-200">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-gray-500">
                          발문 #{parent.problem_id}에는 아직 꼬리문제가 없습니다. 
                          <br />상단의 + 버튼을 눌러 추가해보세요.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 하단 가이드 */}
      <Card className="rounded-2xl border-dashed">
        <CardContent className="space-y-2 p-4 text-sm text-muted-foreground">
          <p>• JSON 파일을 통해 문제를 <strong>불러오기/내보내기</strong> 할 수 있습니다. 각 항목은 <code>problem_id, instruction, answer</code>를 포함해야 합니다.</p>
          <p>• parent_id = null 인 항목이 발문이며, 같은 parent_id를 갖는 항목이 해당 발문의 꼬리문제입니다.</p>
          <p>• <strong>카테고리 관리</strong>: 상단에서 대분류/소분류를 변경하면 모든 문제의 <code>chapter_id</code>와 <code>chapter_number</code>가 자동으로 업데이트됩니다.</p>
          <p>• LaTeX는 <code>$...$</code> 또는 <code>$$...$$</code>로 작성하세요. 실시간 미리보기를 통해 확인할 수 있습니다.</p>
        </CardContent>
      </Card>
      </div>
    </>
  );
}



