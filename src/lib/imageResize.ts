/**
 * يقرأ ملف صورة ويرسمه على canvas بعد تصغيره (إن كان أكبر من الحد الأقصى).
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

/** هل بالصورة بكسلات شفافة؟ (نفحص عيّنة بخطوات حتى يبقى سريع) */
function hasTransparency(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext("2d");
  if (!ctx) return true;
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 3; i < data.length; i += 4 * 7) {
    if (data[i] < 250) return true;
  }
  return false;
}

/** يصغّر الصورة ويحوّلها إلى Blob جاهز للرفع الفعلي إلى Supabase Storage. */
export async function fileToResizedBlob(
  file: File,
  maxDim = 1280,
  quality = 0.82
): Promise<{ blob: Blob; contentType: string }> {
  const canvas = await drawResized(file, maxDim);
  // PNG ما يتضغط بالـ quality، فصور الأبواب كانت تنرفع 2-3MB للصورة. نحوّل لـ JPEG
  // (حوالي 150-300KB) إلا إذا الصورة بيها شفافية فعلية (مثل لوگو) فتبقى PNG.
  const mime = file.type === "image/png" && hasTransparency(canvas) ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
  if (!blob) throw new Error("تعذّر تجهيز الصورة للرفع");
  return { blob, contentType: mime };
}
