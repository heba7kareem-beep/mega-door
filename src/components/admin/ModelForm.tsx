import { useState, type FormEvent } from "react";
import type { DoorModel } from "../../types/model";
import { useCategories } from "../../lib/categoriesStore";
import { useSpecTemplates } from "../../lib/specTemplatesStore";
import ImageUploader from "./ImageUploader";

/** نفس المقاسات القياسية الجاهزة المستخدمة بقسم "صمم بابك بنفسك" بالصفحة الرئيسية،
 * حتى تكون تجربة اختيار القياس واحدة بكل مكان بالموقع. */
const standardSizes = ["80×210 سم", "90×210 سم", "100×220 سم", "110×220 سم"];

function parseDimensions(dimensions: string): { standard: string | null; width: string; height: string } {
  if (!dimensions) return { standard: null, width: "", height: "" };
  if (standardSizes.includes(dimensions)) return { standard: dimensions, width: "", height: "" };
  const m = /(\d+)\s*[×xX]\s*(\d+)/.exec(dimensions);
  if (m) return { standard: null, width: m[1], height: m[2] };
  return { standard: null, width: "", height: "" };
}

export type ModelFormValues = Omit<DoorModel, "id">;

const emptyValues: ModelFormValues = {
  modelNumber: "",
  name: "",
  category: "",
  material: "",
  color: "",
  dimensions: "",
  specs: [],
  usage: "",
  images: [],
  isPopular: false,
};

export default function ModelForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: DoorModel;
  onSubmit: (values: ModelFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const categories = useCategories();
  const templates = useSpecTemplates();
  const [values, setValues] = useState<ModelFormValues>(() =>
    initial ? { ...initial } : { ...emptyValues, category: categories[0]?.id ?? "" }
  );
  const [specsText, setSpecsText] = useState(initial ? (initial.specs ?? []).join("\n") : "");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  function handleSelectTemplate(templateId: string) {
    setSelectedTemplateId(templateId);
    const t = templates.find((tpl) => tpl.id === templateId);
    if (!t) return;
    setValues((v) => ({ ...v, material: t.material ?? v.material, usage: t.usage ?? v.usage }));
    if (t.specs && t.specs.length > 0) setSpecsText(t.specs.join("\n"));
  }
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const initialSize = parseDimensions(initial?.dimensions ?? "");
  const [selectedSize, setSelectedSize] = useState<string | null>(initialSize.standard);
  const [customWidth, setCustomWidth] = useState(initialSize.width);
  const [customHeight, setCustomHeight] = useState(initialSize.height);

  function update<K extends keyof ModelFormValues>(key: K, value: ModelFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSelectStandardSize(label: string) {
    setSelectedSize(label);
    setCustomWidth("");
    setCustomHeight("");
  }

  function handleCustomSizeChange(field: "width" | "height", value: string) {
    setSelectedSize(null);
    if (field === "width") setCustomWidth(value);
    else setCustomHeight(value);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!values.modelNumber.trim()) {
      setError("كود الموديل مطلوب.");
      return;
    }
    const specs = specsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const dimensions = selectedSize || (customWidth && customHeight ? `${customWidth}×${customHeight} سم` : "");
    // ما فيه حقل اسم منفصل بالنموذج - نستخدم كود الموديل كاسم إذا ما كان محفوظاً اسم
    // مسبق (مثلاً عند تعديل موديل قديم كان له اسم تسويقي مُدخل قبل هذا التغيير).
    const name = values.name.trim() || values.modelNumber.trim();
    setError(null);
    setSaving(true);
    try {
      await onSubmit({ ...values, name, specs, dimensions });
    } catch (err) {
      console.error(err);
      setError("تعذّر حفظ الموديل. تأكد من اتصالك بالإنترنت وجرّب مرة أخرى.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none";
  const labelClass = "mb-1.5 block text-xs font-bold text-muted";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="rounded-lg border border-red-400/40 bg-red-400/10 px-3 py-2 text-sm text-red-300">{error}</p>
      )}

      {templates.length > 0 && (
        <div>
          <label className={labelClass}>تعبئة سريعة من قالب مواصفات</label>
          <select
            className={inputClass}
            value={selectedTemplateId}
            onChange={(e) => handleSelectTemplate(e.target.value)}
          >
            <option value="">— اختاري قالب لتعبئة النوع/الاستخدام/المواصفات تلقائياً —</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[11.5px] text-muted">
            تعبّي الحقول أدناه تلقائياً وتقدرين تعدّلينها بعدها بحرية - ما ترتبط بالقالب.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>كود الموديل *</label>
          <input
            className={inputClass}
            value={values.modelNumber}
            onChange={(e) => update("modelNumber", e.target.value)}
            placeholder="مثال: MD-105"
          />
        </div>
        <div>
          <label className={labelClass}>القسم</label>
          <select
            className={inputClass}
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>النوع</label>
          <input
            className={inputClass}
            value={values.material ?? ""}
            onChange={(e) => update("material", e.target.value)}
            placeholder="مثال: خشب MDF مطلي"
          />
        </div>
        <div>
          <label className={labelClass}>أين يمكن استخدامه</label>
          <input
            className={inputClass}
            value={values.usage ?? ""}
            onChange={(e) => update("usage", e.target.value)}
            placeholder="مثال: غرف النوم وغرف الأطفال"
          />
        </div>
        <div>
          <label className={labelClass}>اللون</label>
          <input
            className={inputClass}
            value={values.color ?? ""}
            onChange={(e) => update("color", e.target.value)}
            placeholder="مثال: بني جوزي"
          />
        </div>
        <div>
          <label className={labelClass}>السعر (اختياري - داخلي، ما يظهر للزوار حالياً)</label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            className={inputClass}
            value={values.price ?? ""}
            onChange={(e) => update("price", e.target.value ? Number(e.target.value) : undefined)}
            placeholder="مثال: 350000"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>القياسات</label>
        <div className="flex flex-wrap gap-2.5">
          {standardSizes.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => handleSelectStandardSize(label)}
              className={`rounded-[10px] border px-3 py-2 text-[12.5px] font-bold transition ${
                selectedSize === label ? "border-brand text-brand-dark" : "border-border bg-canvas text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mb-2 mt-3 text-[12.5px] font-bold text-muted">أو قياس حر</p>
        <div className="flex gap-2.5">
          <label className="flex-1">
            <span className="mb-1 block text-[11.5px] text-muted">العرض (سم)</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={customWidth}
              onChange={(e) => handleCustomSizeChange("width", e.target.value)}
              placeholder="مثال: 95"
              className={inputClass}
            />
          </label>
          <label className="flex-1">
            <span className="mb-1 block text-[11.5px] text-muted">الارتفاع (سم)</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={customHeight}
              onChange={(e) => handleCustomSizeChange("height", e.target.value)}
              placeholder="مثال: 215"
              className={inputClass}
            />
          </label>
        </div>
      </div>

      <div>
        <label className={labelClass}>المواصفات (كل نقطة بسطر منفصل)</label>
        <textarea
          className={inputClass}
          rows={4}
          value={specsText}
          onChange={(e) => setSpecsText(e.target.value)}
          placeholder={"طلاء PU مقاوم للخدش والرطوبة\nعزل صوتي جيد"}
        />
      </div>

      <div>
        <label className={labelClass}>الصور</label>
        <ImageUploader images={values.images} onChange={(images) => update("images", images)} />
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {saving ? "...جارِ الحفظ" : initial ? "حفظ التعديلات" : "إضافة الموديل"}
        </button>

        {/* بدون أي قيد على العدد - أي موديل تقدر تعلّمه/تلغيه "الأكثر طلباً" بحرية تامة */}
        <label className="flex items-center gap-2 text-sm font-bold text-ink">
          <input
            type="checkbox"
            checked={values.isPopular}
            onChange={(e) => update("isPopular", e.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          الأكثر طلباً
        </label>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-border px-6 py-2.5 text-sm font-bold text-ink transition hover:border-brand hover:text-brand"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
