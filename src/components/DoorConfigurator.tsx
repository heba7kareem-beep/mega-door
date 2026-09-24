import { useRef, useState, type ChangeEvent } from "react";
import type { DoorModel } from "../types/model";

/** يفكّك مقاس الموديل الجاهز (مثال: "90×210 سم") لعرض/ارتفاع حرّين، حتى يظهر
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
 * ملاحظة: الصورة والقياس والملاحظات المدخلة من الزبون تُحفظ حالياً محلياً
 * بالمتصفح فقط لغرض المعاينة (لا يوجد بعد Supabase أو نقطة استقبال فعلية لها -
 * هذا الربط يأتي لاحقاً مع لوحة الإدارة).
 *
 * preselectedModel: يصل من صفحة تفاصيل موديل (زر "صمم هذا الباب") - يعرض صورة
 * الموديل نفسه جنب النموذج، ويعبّي القياس تلقائياً إن كان معروفاً.
 */
export default function DoorConfigurator({ preselectedModel }: { preselectedModel?: DoorModel }) {
  const [designImage, setDesignImage] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialSize = parseDimensions(preselectedModel?.dimensions);
  const [width, setWidth] = useState(initialSize.width);
  const [height, setHeight] = useState(initialSize.height);

  function handleDesignImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDesignImage(reader.result as string);
    reader.readAsDataURL(file);
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
            {designImage ? (
              <div className="relative h-[110px] w-[110px] overflow-hidden rounded-[10px] border border-border">
                <img src={designImage} alt="صورة التصميم المرفوعة من الزبون" className="h-full w-full object-contain" />
                <button
                  type="button"
                  onClick={() => setDesignImage(null)}
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
                  placeholder="مثال: 215"
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
                  placeholder="مثال: 95"
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
        </div>
      </div>
    </div>
  );
}
