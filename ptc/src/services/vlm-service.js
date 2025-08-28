const VLM_ENDPOINT = import.meta.env.VITE_VLM_ENDPOINT;
const VLM_API_KEY = import.meta.env.VITE_VLM_API_KEY;

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });

export const requestHtmlFromVLM = async (file) => {
  // 1) 파일을 dataURL(base64)로 인코딩
  const dataUrl = await fileToDataUrl(file);

  // 2) 한글과 영어 번역을 동시에 요청하는 시스템 메시지
  const sys =
    "너는 이미지에서 텍스트와 수식을 인식하고 번역하는 전문 AI야. 주어진 이미지를 분석하고, 모든 수학 수식은 LaTeX 형식으로 올바르게 변환하여 HTML 형식으로 결과를 생성해줘. 한국어와 영어 두 버전을 모두 제공해야 한다.";

  const messages = [
    { role: "system", content: sys },
    {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: { url: dataUrl },       
        },
        {
          type: "text",
          text: `이미지에서 문제를 추출하고, 다음 JSON 형식으로 응답해줘 json을 앞에 붙이지 말고, 문제의 번호는 생략해줘:
{
  "korean": "한국어 HTML 내용",
  "english": "English HTML content"
}

수학 수식은 LaTeX로 변환하고, 내용을 정확히 번역해줘.`,
        },
      ],
    },
  ];

  // 4) OpenAI 호환 chat.completions 요청
  const body = {
    model: 'Qwen/Qwen2.5-VL-72B-Instruct',         
    messages,
    temperature: 0.2,
    response_format: { type: "json_object" }
  };

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 60_000);

  let res;
  try {
    res = await fetch(VLM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VLM_API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(t);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`VLM 요청 실패 ${res.status}: ${text.slice(0, 200)}`);
  }

  const json = await res.json();

  // 5) 응답에서 JSON 파싱 시도
  let content = json?.choices?.[0]?.message?.content ?? "";
  if (Array.isArray(content)) {
    content = content.map((p) => (typeof p === "string" ? p : p?.text || "")).join("");
  }
  
  try {
    // JSON 코드 블록 제거 후 파싱 시도
    const cleanContent = content.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").replace(/&amp;/g, "&").trim();
    const parsedContent = JSON.parse(cleanContent);

    
    if (parsedContent.korean && parsedContent.english) {
      return {
        korean: String(parsedContent.korean).trim(),
        english: String(parsedContent.english).trim()
      };
    }
  } catch (e) {
    console.warn("JSON 파싱 실패, 기본 텍스트로 처리:", e);
  }
  
  // JSON 파싱 실패 시 기존 방식으로 폴백
  const fence = /^```(?:html)?\s*([\\s\\S]*?)\s*```$/i;
  const m = typeof content === "string" ? content.match(fence) : null;
  if (m) content = m[1];
  content = content.replace(/^```(?:html)?/i, "").replace(/```$/, "").trim();
  
  // 폴백 시에는 한국어만 제공
  return {
    korean: String(content).trim(),
    english: "" // 영어 번역 실패시 빈 문자열
  };
};
