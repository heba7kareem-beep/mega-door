/**
 * يقرأ ملف صورة ويعيد تصغيره (إن كان أكبر من الحد الأقصى) ثم يحوّله إلى data URL
 * جاهز للتخزين في localStorage. التصغير يقلّل حجم البيانات المخزّنة محلياً بما أن
 * المتصفح له سقف تخزين محدود (حوالي 5-10 ميغابايت)، إلى حين ربط تخزين حقيقي
 * (Supabase Storage) من الباك-إند.
 */
export function fileToResizedDataUrl(file: File, maxDim = 1280, quality = 0.82): Promise<string> {
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
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
        resolve(canvas.toDataURL(mime, quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
