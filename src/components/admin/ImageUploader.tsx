import { useRef, useState } from "react";
import { uploadImage } from "../../lib/imageUpload";

/**
 * رفع عدّة صور للموديل وترتيبها. الصورة الأولى هي الصورة الرئيسية (تظهر بالبطاقة).
 * كل صورة تُرفع فعلياً إلى Supabase Storage (bucket عام "site-images") ويُحفظ
 * رابطها العام النهائي ضمن بيانات الموديل - تظهر لكل زوار الموقع الحقيقيين.
 */
export default function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const files = Array.from(fileList);
      const urls = await Promise.all(files.map((f) => uploadImage(f, "models")));
      onChange([...images, ...urls]);
    } catch (err) {
      console.error(err);
      setError("تعذّر رفع إحدى الصور. تأكد من اتصالك بالإنترنت وجرّب مرة أخرى.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function moveImage(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((src, i) => (
          <div key={i} className="relative h-24 w-20 overflow-hidden rounded-lg border border-border bg-canvas">
            <img src={src} alt={`صورة ${i + 1}`} className="h-full w-full object-contain" />
            {i === 0 && (
              <span className="absolute right-1 top-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                رئيسية
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-canvas/85 px-1 py-0.5">
              <button
                type="button"
                onClick={() => moveImage(i, -1)}
                disabled={i === 0}
                className="px-1 text-xs text-ink disabled:opacity-25"
                aria-label="تحريك للأعلى بالترتيب"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="px-1 text-xs text-red-300"
                aria-label="حذف الصورة"
              >
                ×
              </button>
              <button
                type="button"
                onClick={() => moveImage(i, 1)}
                disabled={i === images.length - 1}
                className="px-1 text-xs text-ink disabled:opacity-25"
                aria-label="تحريك للأسفل بالترتيب"
              >
                ↓
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex h-24 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-[11px] font-bold text-muted transition hover:border-brand hover:text-brand disabled:opacity-60"
        >
          {busy ? "...جارِ الرفع" : "+ صورة"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
      <p className="mt-2 text-[11px] text-muted">
        الصورة الأولى هي الصورة الرئيسية بالبطاقة. استخدم الأسهم لإعادة الترتيب.
      </p>
    </div>
  );
}
