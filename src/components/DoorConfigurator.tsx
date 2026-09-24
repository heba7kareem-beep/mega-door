import { useRef, useState, type ChangeEvent } from "react";
import type { DoorModel } from "../types/model";
import { buildCustomDesignInquiryLink } from "../lib/whatsapp";
import { uploadImage } from "../lib/imageUpload";
import { trackContact } from "../lib/metaPixel";

/** يفكّك مقاس الموديل الجاهز (مثال: "100×210 سم") لعرض/ارتفاع حرّين، حتى يظهر
 * جاهزاً بحقلي الطول والعرض لما يوصل الزبون من موديل محدد. */
function parseDimensions(dimensions: string | undefined): { width: string; height: string } {
  if (!dimensions) return { width: "", height: "" };
  const m = /(\d+)\s*[×xX]\s*(\d+)/.exec(dimensions);
  if (m) return { width: m[1], height: m[2] };
  return { width: "", height: "" };
}

/**
 * قسم "صمم تفاصيل باب مخصصة بالكامل" بالصفحة الرئيسية - نموذج واحد بسيط
 * بالترتيب: أضف صورة للتصميم، حدد القياس المطلوب (الطول والعرض)، وأضف أي
 * ملاحظات إضافية (منها اللون المفضل، بما إنه ما فيه تبويب لون منفصل).
 *
 * الصورة تُرفع فعلياً لـ Supabase Storage (مجلد "custom-designs" - رفع مسموح
 * بدون تسجيل دخول، محصور بهذا المجلد فقط عبر RLS) فور اختيارها، ورابطها
 * العام يُضمَّن بنص رسالة واتساب عند الإرسال (واتساب يعرض معاينة الصورة من
 * الرابط تلقائياً - الطريقة الوحيدة الممكنة تقنياً لإيصال صورة عبر رابط
 * wa.me، لأنه ما يدعم إرفاق ملفات مباشرة).
 *
 * preselectedModel: يصل من صفحة تفاصيل موديل (زر "صمم هذا الباب") - يعرض صورة
 * الموديل نفسه جنب النموذج، ويعبّي القياس تلقائياً إن كان معروفاً.
 */
export default function DoorConfigurator({ preselectedModel }: { preselectedModel?: DoorModel }) {
  const [designImagePreview, setDesignImagePreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialSize = parseDimensions(preselectedModel?.dimensions);
  const [width, setWidth] = useState(initialSize.width);
  const [height, setHeight] = useState(initialSize.height);

  async function handleDesignImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDesignImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    setPhotoUrl(null);
    setPhotoError(null);
    setPhotoUploading(true);
    try {
      const url = await uploadImage(file, "custom-designs");
      setPhotoUrl(url);
    } catch (err) {
      console.error(err);
      setPhotoError("تعذّر رفع الصورة. تأكدي من اتصالك بالإنترنت وجرّبي مرة أخرى.");
      setDesignImagePreview(null);
    } finally {
      setPhotoUploading(false);
    }
  }

  function removeDesignImage() {
    setDesignImagePreview(null);
    setPhotoUrl(null);
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit() {
    trackContact("custom_design_configurator");
    const url = buildCustomDesignInquiryLink({
      width,
      height,
      note,
      photoUrl,
      modelName: preselectedModel?.name,
      modelNumber: preselectedModel?.modelNumber,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const inputClass =
    "w-full rounded-[10px] border border-border bg-canvas px-3 py-2 text-[12.5px] text-ink placeholder:text-muted focus:border-brand focus:outline-none";
  const labelClass = "mb-2.5 text-[12.5px] font-bold text-muted";

  return (
    <div className="rounded-[20px] bg-surface p-5">
      <div className="mb-4">
        <h2 className="text-lg font-extrabold text-ink">صمم تفاصيل باب مخصصة بالكامل</h2>
        {preselectedModel ? (
          <p className="mt-1 text-xs text-muted">
            تخصيص موديل <span className="font-bold text-ink">{preselectedModel.name}</span> (
            {preselectedModel.modelNumber}) - حدّدي بس القياس المناسب لج
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted">اختر كل التفاصيل .. ونحن نصنع لك</p>
        )}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {preselectedModel && (
          <div className="mx-auto w-full max-w-[230px] shrink-0 lg:mx-0">
            <div className="door-glow aspect-[3/4] overflow-hidden rounded-[14px] bg-surface">
              <img
                src={preselectedModel.images[0]}
                alt={`باب ${preselectedModel.name} - موديل ${preselectedModel.modelNumber}`}
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        )}

        <div className="w-full max-w-[420px] space-y-5">
          {/* أضف صورة */}
          <div>
            <p className={labelClass}>أضف صورة للتصميم الذي تريده</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleDesignImageChange}
              className="hidden"
            />
            {designImagePreview ? (
              <div className="relative h-[110px] w-[110px] overflow-hidden rounded-[10px] border border-border">
                <img
                  src={designImagePreview}
                  alt="صورة التصميم المرفوعة من الزبون"
                  className="h-full w-full object-contain"
                />
                {photoUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-canvas/70 text-[11px] font-bold text-ink">
                    ...جارِ الرفع
                  </div>
                )}
                <button
                  type="button"
                  onClick={removeDesignImage}
                  aria-label="إزالة الصورة"
                  className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-canvas/80 text-xs text-ink"
                >
                  ×
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-dashed border-border bg-canvas px-3 py-4 text-center text-[12.5px] font-bold text-muted transition hover:border-brand hover:text-brand"
              >
                + أضف صورة للتصميم الذي تريده
              </button>
            )}
            {photoError && <p className="mt-2 text-[11.5px] text-red-300">{photoError}</p>}
          </div>

          {/* حدد القياس المطلوب */}
          <div>
            <p className={labelClass}>حدد القياس المطلوب</p>
            <div className="flex gap-2.5">
              <label className="flex-1">
                <span className="mb-1 block text-[11.5px] text-muted">الطول (سم)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="مثال: 210"
                  className={inputClass}
                />
              </label>
              <label className="flex-1">
                <span className="mb-1 block text-[11.5px] text-muted">العرض (سم)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="مثال: 100"
                  className={inputClass}
                />
              </label>
            </div>
          </div>

          {/* إضافة ملاحظات */}
          <div>
            <p className={labelClass}>إضافة ملاحظات</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="أي تفاصيل إضافية تريدينها، مثل اللون المفضل (اختياري)"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={photoUploading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-6 py-3.5 text-sm font-bold text-white transition hover:brightness-105 disabled:opacity-60"
          >
            {photoUploading ? "...جارِ رفع الصورة" : "إرسال الطلب عبر واتساب"}
          </button>
        </div>
      </div>
    </div>
  );
}
