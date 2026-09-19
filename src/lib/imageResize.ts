/**
 * يقرأ ملف صورة ويرسمه على canvas بعد تصغيره (إن كان أكبر من الحد الأقصى) -
 * يشترك فيه fileToResizedDataUrl وfileToResizedBlob أدناه.
 */
function drawResized(file: File, maxDim: number): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("تعذّرت قراءة الملف"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("تعذّرت قراءة الصورة"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("تعذّر إنشاء canvas"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** يصغّر الصورة ويحوّلها إلى data URL (يُستخدم لمعاينة فورية قبل اكتمال الرفع). */
export async function fileToResizedDataUrl(file: File, maxDim = 1280, quality = 0.82): Promise<string> {
  const canvas = await drawResized(file, maxDim);
  const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
  return canvas.toDataURL(mime, quality);
}

/** يصغّر الصورة ويحوّلها إلى Blob جاهز للرفع الفعلي إلى Supabase Storage. */
export async function fileToResizedBlob(
  file: File,
  maxDim = 1280,
  quality = 0.82
): Promise<{ blob: Blob; contentType: string }> {
  const canvas = await drawResized(file, maxDim);
  const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
  if (!blob) throw new Error("تعذّر تجهيز الصورة للرفع");
  return { blob, contentType: mime };
}
