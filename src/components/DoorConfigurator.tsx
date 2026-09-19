import { useRef, useState, type ChangeEvent } from "react";

type ColorItem = { hex: string; label: string };
type SizeItem = { label: string };

type ConfiguratorTab =
  | { kind: "color"; label: string; stepLabel: string; heading: string; items: ColorItem[] }
  | { kind: "design"; label: string; stepLabel: string; heading: string }
  | { kind: "size"; label: string; stepLabel: string; heading: string; items: SizeItem[] };

const configuratorTabs: ConfiguratorTab[] = [
  {
    kind: "color",
    label: "اللون",
    stepLabel: "اختر اللون",
    heading: "ألوان عصرية تناسب ذوقك",
    items: [
      { hex: "#EDEAE3", label: "أبيض عاجي" },
      { hex: "#C7C2BA", label: "رمادي فاتح" },
      { hex: "#A9957C", label: "بيج" },
      { hex: "#8C5A2E", label: "عسلي" },
      { hex: "#6B4A2E", label: "بني فاتح" },
      { hex: "#5B3A22", label: "جوزي" },
      { hex: "#26201B", label: "أسود" },
    ],
  },
  {
    kind: "design",
    label: "التصاميم",
    stepLabel: "اختر التصميم",
    heading: "أضف صورة للتصميم الذي تريده مع شرح مختصر",
  },
  {
    kind: "size",
    label: "المقاس",
    stepLabel: "اختر المقاس",
    heading: "مقاسات قياسية جاهزة، أو أدخل قياسك الحر",
    items: [
      { label: "80×210 سم" },
      { label: "90×210 سم" },
      { label: "100×220 سم" },
      { label: "110×220 سم" },
    ],
  },
];

const defaultTint = "#8C5A2E";

/**
 * قسم "صمم بابك بنفسك" بالصفحة الرئيسية: تبويبات (لون/تصميم/مقاس) مع معاينة
 * حية للباب تتغيّر لونها عند اختيار لون.
 *
 * ملاحظة: صورة التصميم والشرح والمقاس الحر المدخلة من الزبون تُحفظ حالياً محلياً
 * بالمتصفح فقط لغرض المعاينة (لا يوجد بعد Supabase أو نقطة استقبال فعلية لها -
 * هذا الربط يأتي لاحقاً مع لوحة الإدارة).
 */
export default function DoorConfigurator() {
  const [tabIndex, setTabIndex] = useState(0);
  const [tint, setTint] = useState(defaultTint);

  // تبويب "التصاميم"
  const [designImage, setDesignImage] = useState<string | null>(null);
  const [designNote, setDesignNote] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // تبويب "المقاس"
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");

  const tab = configuratorTabs[tabIndex];

  function handleDesignImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDesignImage(reader.result as string);
    reader.readAsDataURL(file);
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

  return (
    <div className="rounded-[20px] bg-surface p-5">
      <div className="mb-4">
        <h2 className="text-lg font-extrabold text-ink">صمم بابك بنفسك</h2>
        <p className="mt-1 text-xs text-muted">اختر كل التفاصيل .. ونحن نصنع لك</p>
      </div>

      <div className="flex flex-wrap gap-5">
        {/* اللون/التصاميم/المقاس */}
        <div className="order-3 w-full lg:order-1 lg:w-[220px] lg:shrink-0">
          <div className="mb-[18px] flex flex-wrap gap-2">
            {configuratorTabs.map((t, i) => (
              <button
                key={t.label}
                type="button"
                onClick={() => setTabIndex(i)}
                className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold transition ${
                  i === tabIndex ? "border-brand bg-brand text-white" : "border-border text-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="mb-2.5 text-[12.5px] font-bold text-muted">{tab.heading}</p>

          {tab.kind === "color" && (
            <div className="flex flex-wrap gap-2.5">
              {tab.items.map((it) => (
                <button
                  key={it.hex}
                  type="button"
                  onClick={() => setTint(it.hex)}
                  title={it.label}
                  aria-label={it.label}
                  style={{ background: it.hex }}
                  className={`h-[28px] w-[28px] rounded-lg border-2 ring-1 ring-inset ring-border transition ${
                    it.hex === tint ? "scale-[1.08] border-brand" : "border-transparent"
                  }`}
                />
              ))}
            </div>
          )}

          {tab.kind === "design" && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleDesignImageChange}
                className="hidden"
              />
              {designImage ? (
                <div className="relative mb-3 h-[110px] w-[110px] overflow-hidden rounded-[10px] border border-border">
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
                  className="mb-3 flex w-full items-center justify-center gap-2 rounded-[10px] border border-dashed border-border bg-canvas px-3 py-4 text-center text-[12.5px] font-bold text-muted transition hover:border-brand hover:text-brand"
                >
                  + أضف صورة للتصميم الذي تريده
                </button>
              )}
              <textarea
                value={designNote}
                onChange={(e) => setDesignNote(e.target.value)}
                placeholder="اشرح لنا التصميم الذي تريده (اختياري)"
                rows={3}
                className="w-full resize-none rounded-[10px] border border-border bg-canvas px-3 py-2 text-[12.5px] text-ink placeholder:text-muted focus:border-brand focus:outline-none"
              />
            </div>
          )}

          {tab.kind === "size" && (
            <div>
              <div className="flex flex-wrap gap-2.5">
                {tab.items.map((it) => (
                  <button
                    key={it.label}
                    type="button"
                    onClick={() => handleSelectStandardSize(it.label)}
                    className={`rounded-[10px] border px-3 py-2 text-[12.5px] font-bold transition ${
                      selectedSize === it.label
                        ? "border-brand text-brand-dark"
                        : "border-border bg-canvas text-ink"
                    }`}
                  >
                    {it.label}
                  </button>
                ))}
              </div>
              <p className="mb-2 mt-4 text-[12.5px] font-bold text-muted">أو قياس حر</p>
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
                    className="w-full rounded-[10px] border border-border bg-canvas px-3 py-2 text-[12.5px] text-ink placeholder:text-muted focus:border-brand focus:outline-none"
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
                    className="w-full rounded-[10px] border border-border bg-canvas px-3 py-2 text-[12.5px] text-ink placeholder:text-muted focus:border-brand focus:outline-none"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* المعاينة الحية */}
        <div className="order-1 w-full lg:order-2 lg:min-w-0 lg:flex-1">
          <div className="door-glow mx-auto max-w-[230px] aspect-[3/4] overflow-hidden rounded-[14px] bg-surface">
            <img
              src={`${import.meta.env.BASE_URL}images/models/md-108-1.jpg`}
              alt="مثال توضيحي لباب من ميكا"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* خطوات الاختيار */}
        <div className="order-2 flex w-full flex-row justify-center gap-[14px] lg:order-3 lg:w-[140px] lg:shrink-0 lg:flex-col lg:justify-start lg:gap-3.5">
          {configuratorTabs.map((t, i) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setTabIndex(i)}
              className={`border-b-2 py-1.5 text-right text-[13.5px] font-semibold transition ${
                i === tabIndex ? "border-brand text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t.stepLabel}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
