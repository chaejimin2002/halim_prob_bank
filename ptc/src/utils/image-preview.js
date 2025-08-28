import { useCallback, useState } from "react";

// 이미지 미리보기 훅 (Base64)
export function useImagePreview() {
  const [preview, setPreview] = useState(null);
  const onFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
  }, []);
  const clear = useCallback(() => setPreview(null), []);
  return { preview, onFile, clear };
}
